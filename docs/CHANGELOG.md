# Registro de Alterações (Changelog) — Flavos OS 2.0

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo seguindo as diretrizes do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [0.5.5] — Fase 5.5: Arquitetura por Edições — 27/06/2026

### Adicionado
- Arquivo `docs/EDITIONS.md` — Formalização das três edições oficiais (Cloud, Desktop e Legacy) e do núcleo comum Flavos OS Core.
- Perfil de pacotes e instalações segmentadas em `docs/INSTALL.md` para cada edição.
- Detalhamento de vetores de ataque específicos e mitigação local por edição em `docs/SECURITY.md`.

### Modificado
- `README.md` — Visão unificada do Flavos OS 2.0 e nova seção descrevendo as edições suportadas.
- `Documentação.md` — Reformulação da visão do projeto para remover a dependência de arquitetura puramente headless em nuvem e documentação da modularidade das edições baseadas no núcleo comum.
- `docs/ARCHITECTURE.md` — Introdução da seção "Arquitetura por Edições" demonstrando o compartilhamento do Flavos OS Core.
- `docs/ROADMAP.md` — Alinhamento dos status das fases concluídas e inclusão das fases 5.5, D1 (Desktop Edition Prototype) e L1 (Legacy Edition Prototype).

---

## [0.5.0] — Fase 5: Service Manager — 27/06/2026

### Adicionado
- Pacote `agent/internal/config` — lê whitelist de serviços de `/etc/flavos/agent.toml` (stdlib only).
- Pacote `agent/internal/services` — Service Manager com whitelist, política de ações por serviço e execução via `/usr/bin/sv` com timeout de 5 segundos.
- Endpoint autenticado `GET /api/v1/services` — lista serviços com status real do runit e ações permitidas.
- Endpoint autenticado `POST /api/v1/services/{name}/start` — inicia serviço da whitelist.
- Endpoint autenticado `POST /api/v1/services/{name}/stop` — para serviço da whitelist.
- Endpoint autenticado `POST /api/v1/services/{name}/restart` — reinicia serviço da whitelist.

### Segurança
- Validação de nome de serviço via regex `^[a-zA-Z0-9._-]+$` → `400 invalid_service_name`.
- Serviços fora da whitelist → `403 service_not_allowed`.
- Ações não permitidas por serviço → `403 action_not_allowed`.
- Método HTTP incorreto → `405 method_not_allowed`.
- Sem shell livre: execução exclusivamente via `exec.CommandContext`.
- `sshd/stop` bloqueado para preservar acesso SSH.
- `flavos-agent/stop` e `flavos-agent/restart` bloqueados (não mata a si próprio).
- Whitelist vazia se `agent.toml` não existir (fail-closed).

---

## [0.4.0] — Fase 4: Autenticação Inicial do Flavos Core Agent — 27/06/2026


### Adicionado
- **Módulo de Autenticação (`agent/internal/auth`):**
  - Carregamento de token estático a partir de `FLAVOS_TOKEN` (env) ou `/etc/flavos/token` (arquivo).
  - `strings.TrimSpace` aplicado ao leitura de arquivo para eliminar falhas por `\n`.
  - Comparação segura com `crypto/subtle.ConstantTimeCompare` após `sha256.Sum256`, prevenindo timing attacks.
  - Middleware HTTP `RequireToken` que retorna `401 Unauthorized` com `{"error": "unauthorized"}` se o token for ausente ou inválido.
- **Rotas protegidas:** `/api/v1/status` e `/api/v1/metrics` agora exigem `X-Flavos-Token` válido.
- **Rota pública:** `/api/v1/health` permanece acessível sem autenticação.
- **Token na VM:** `/etc/flavos/token` com `chmod 600` e `chown root:root`.
- **Documentação:** `PHASE-4-AUTH-REPORT.md`, `API.md`, `SECURITY.md` e `agent/README.md` atualizados.

---

## [0.3.0] — Fase 3: Agent como Serviço runit — 26/06/2026

### Adicionado
- **Runit Service Setup:**
  - Script de inicialização do serviço `/etc/sv/flavos-agent/run` configurado com redirecionamento de logs.
  - Ativação automática do serviço em `/var/service/flavos-agent`.
  - Configuração do diretório `/var/log/flavos` e arquivo `/var/log/flavos/agent.log`.
- **Validação de Boot:**
  - Testes automatizados após reboot da VM para garantir a persistência e auto-inicialização do daemon.

---

## [0.2.0] — Fase 2: Flavos Core Agent MVP — 26/06/2026

### Adicionado
- **Core Agent em Go:**
  - Criação da estrutura Go em `agent/` com os subdiretórios `cmd`, `internal/api`, `internal/metrics` e `internal/system`.
  - Endpoint `/api/v1/health` para verificação de status do serviço.
  - Endpoint `/api/v1/status` coletando o uptime real do `/proc/uptime` e hostname.
  - Endpoint `/api/v1/metrics` coletando métricas reais de load average (`/proc/loadavg`), memória (`/proc/meminfo`) e disco (`syscall.Statfs`).
  - Script e fluxo de cross-compilação para rodar na VM Void Linux (`GOOS=linux GOARCH=amd64`).

---

## [0.1.0] — Fase 1: Ambiente Void Linux — 26/06/2026

### Adicionado
- **VM Void Linux glibc x86_64:**
  - Instalação básica no KVM (`flavos-os-2-void`) com layout de partição ext4 em `/dev/sda1`.
  - Configuração de SSH com login automático por chaves e ajuste de prioridade no sudoers (`/etc/sudoers.d/zz-kaua`).
  - Instalação de pacotes requeridos: `go`, `git`, `curl`, `nginx`, `openssh`, `socklog-void`.
  - Criação do usuário de sistema `flavos` e da estrutura de pastas `/etc/flavos`, `/var/log/flavos`, `/opt/flavos`.

---

## [0.0.0] — Fundação Inicial — 25/06/2026

### Adicionado
- **Documentação de Fundação:**
  - `README.md` principal com a visão geral do projeto Cloud OS.
  - [ARCHITECTURE.md](ARCHITECTURE.md) detalhando as 3 camadas do sistema.
  - [ROADMAP.md](ROADMAP.md) estabelecendo as fases do projeto (Fase 0 à Fase 10).
  - [API.md](API.md) especificando os contratos de endpoints e payloads.
  - [SECURITY.md](SECURITY.md) definindo as restrições rígidas do MVP (sem terminal web, whitelist de serviços).
  - [INSTALL.md](INSTALL.md) especificando diretórios e pacotes necessários no Void Linux.
- **Estrutura do Repositório:**
  - Criação das pastas de contexto: `docs/`, `agent/`, `dashboard/`, `scripts/`, `examples/` e `assets/`.
  - Arquivo de configuração de exemplo `examples/config.example.toml` criado com parâmetros de whitelist e segurança.
- **Escopo do MVP definido:** Detalhado o que entra e o que não entra na Preview 0.1.
