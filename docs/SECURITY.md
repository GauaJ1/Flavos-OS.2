# Diretrizes de Segurança — Flavos OS 2.0

O **Flavos OS 2.0** opera diretamente sobre o sistema operacional base (Void Linux) executando comandos e coletando métricas. Por lidar com o gerenciamento de serviços críticos de um servidor, a segurança é a fundação do nosso ciclo de desenvolvimento.

Este documento estabelece as regras rígidas de segurança para a **Preview 0.1 (MVP)** e as boas práticas de cibersegurança adotadas no projeto.

---

## 🛑 Regras Rígidas para o MVP (Preview 0.1)

Para evitar superfícies de ataque catastróficas e execuções de código remoto (RCE), as seguintes diretrizes são de aplicação obrigatória:

1. **Sem Terminal Web:** Sob nenhuma circunstância o MVP deve implementar emulação de terminal interativo (como xterm.js conectado a shell remoto) via web.
2. **Sem Comandos Shell Livres:** O Agent não aceitará payloads contendo strings para serem executadas diretamente em interpretadores shell (`/bin/sh`, `/bin/bash`). Toda chamada interna ao sistema operacional deve ser feita usando a biblioteca padrão do Go (`exec.Command` ou chamadas syscall diretas), sem expansão de shell.
3. **Sem Instalação de Pacotes Remota:** O MVP não deve permitir a chamada de instalação de pacotes via API (como comandos do `xbps-install`). O gerenciamento de pacotes do host permanece estritamente local por SSH.
4. **API Inicialmente Local:** Por padrão, o Agent escuta apenas em `127.0.0.1`. A comunicação com um painel externo deve ser tunelada (por exemplo, via túneis SSH reversos, VPN como WireGuard, ou configurando Nginx local com autenticação mútua TLS), impedindo a exposição direta da porta `8087` à internet sem criptografia.

---

## 🔒 Proteções e Controles Implementados

### 1. Whitelist Estrita de Serviços
O controle de serviços é restrito a uma whitelist configurada no arquivo TOML local no host (`/etc/flavos/agent.toml`).
- O usuário define quais serviços do `runit` podem ser iniciados, parados ou reiniciados pelo Agent (ex: `nginx`, `sshd`).
- Se um invasor obtiver acesso à API e tentar derrubar o próprio Agent (`flavos-agent` se não estiver na lista) ou serviços essenciais do SO que não foram expostos, a API rejeitará imediatamente com status **HTTP 403 Forbidden**.

### 2. Trilha de Auditoria Obrigatória (Audit Log)
Toda e qualquer requisição que altere o estado do sistema (como `/api/v1/services/{name}/restart`) ou tentativas fracassadas de login **devem** ser auditadas.
- O log de auditoria é gravado no arquivo SQLite local e espelhado em `/var/log/flavos/audit.log`.
- Cada registro deve incluir:
  - Timestamp (UTC)
  - IP de origem da requisição
  - Ação solicitada (ex: `restart_service`)
  - Recurso afetado (ex: `nginx`)
  - Status do processamento (`success` ou `failed`)
  - Motivo da falha (ex: `service not in whitelist` ou `invalid token`)

---

## 🔑 Autenticação e Autorização

- **Modelo Atual (Fase 4):** Token estático de alta entropia gerado com `openssl rand -hex 32`.
- **Cabeçalho:** `X-Flavos-Token: <token>` — cabeçalho HTTP customizado.
- **Armazenamento:** `/etc/flavos/token` com `chmod 600` e `chown root:root`. Em desenvolvimento, a variável de ambiente `FLAVOS_TOKEN` tem prioridade.
- **Comparação Segura:** O token é comparado usando `crypto/subtle.ConstantTimeCompare` após hash SHA-256 de ambos os lados, prevenindo timing attacks.
- **TrimSpace obrigatório:** O arquivo de token recebe `strings.TrimSpace` ao ser lido, eliminando falha por `\n` no final.
- **Endpoints protegidos:** `/api/v1/status` e `/api/v1/metrics` exigem token válido. `/api/v1/health` é público.
- **Tratamento de Erros:** Requisições sem token válido retornam `401 Unauthorized` com corpo `{"error": "unauthorized"}` — sem stack traces, caminhos internos ou detalhes de infraestrutura.

---

## 🔧 Service Manager Security Model (Fase 5)

O Service Manager foi projetado com as seguintes garantias de segurança:

- **Whitelist obrigatória:** Apenas serviços explicitamente listados em `/etc/flavos/agent.toml` (`[services] allowed = [...]`) podem ser controlados. Serviços fora da lista recebem `403 service_not_allowed`.
- **Validação de nomes:** O parâmetro `{name}` é validado via regex `^[a-zA-Z0-9._-]+$` antes de qualquer operação. Nomes com `..`, `/`, `;`, `|`, `$`, espaços ou outros caracteres especiais recebem `400 invalid_service_name`.
- **Política de ações por serviço:** Cada serviço tem um conjunto explícito de ações permitidas. Ações não autorizadas recebem `403 action_not_allowed`.
  - `nginx`: status, start, stop, restart
  - `sshd`: status, restart (stop bloqueado — preserva acesso SSH)
  - `flavos-agent`: status apenas (não pode matar a si próprio)
- **Sem shell livre:** Toda execução usa `exec.CommandContext(ctx, "/usr/bin/sv", action, "/var/service/"+name)` — nenhum argumento é passado para um interpretador shell.
- **Timeout obrigatório:** Cada chamada ao `sv` tem timeout de 5 segundos via `context.WithTimeout`.
- **Autenticação obrigatória:** Todos os endpoints de controle exigem `X-Flavos-Token` válido.
- **Bind local:** O Agent continua em `127.0.0.1:8087` — sem exposição pública.
- **Fail-closed:** Se `agent.toml` não existir ou não puder ser lido, a whitelist é vazia e nenhum serviço é controlável.

---

## 🛡️ Vetores de Ataque Mitigados


| Vetor de Ataque | Mitigação no Flavos OS 2.0 |
| :--- | :--- |
| **Remote Code Execution (RCE)** | Não há execução de comandos shell livres. Todos os comandos do sistema chamam binários específicos (`/usr/bin/sv`) e usam arrays de argumentos sanitizados em Go. |
| **Escalação de Privilégios** | O daemon do Agent deve rodar com um usuário dedicado (`flavos`), tendo apenas permissões específicas concedidas via `/etc/sudoers.d/flavos` para rodar `/usr/bin/sv` específicos. |
| **Negação de Serviço (DoS)** | Limitação de requisições concorrentes (Rate Limiting) implementada na camada HTTP do Agent. Conexões WebSocket expiram e exigem autenticação imediata. |
| **Adulteração de Parâmetros** | Validação rígida de caminhos de arquivos e nomes de serviços. O parâmetro `{name}` da rota é sanitizado para impedir ataques de Path Traversal (`../`). |

---

## 🚦 Próximas Implementações de Segurança (Fases Futuras)

1. **HTTPS/WSS Nativo:** Implementação de suporte a TLS nativo no servidor web do Agent Go.
2. **Tokens Temporários (JWT/OAuth2):** Sistema de sessões com expiração automática.
3. **Criptografia na Auditoria:** Assinatura digital dos registros de log no SQLite para garantir que os logs não foram adulterados localmente após uma intrusão.
