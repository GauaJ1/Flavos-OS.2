# Registro de Alterações (Changelog) — Flavos OS 2.0

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo seguindo as diretrizes do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [0.8.0] — Fase D1: Protótipo Desktop Edition — 27/06/2026

### Adicionado
- VM isolada para testes locais e desenvolvimento de desktop: `flavos-desktop-lab` (IP `192.168.122.82`), clonada de forma segura com `virt-clone`.
- Servidor gráfico completo `xorg`, ambiente `kde-plasma` (KDE Plasma 6) e `kde-baseapps` (aplicativos básicos) instalados no Void Linux.
- Gerenciador de login SDDM habilitado como serviço runit sob elogind e dbus, configurado com autologin na sessão X11 `plasmax11` para o usuário comum `kaua`.
- Novo identificador exclusivo para D-Bus e sistema (`/etc/machine-id` e `/var/lib/dbus/machine-id`) regenerado a partir de UUID único, evitando conflitos de rede e integridade.
- Token estático criptográfico gerado de forma independente para a VM Desktop em `/etc/flavos/token` com permissão restrita `600`.
- Nginx servindo o Web Console com tema Ant Design Premium (Fase 7.1) na porta `80`, fazendo proxy reverso local `/api/` para o Agent local (`127.0.0.1:8087`).
- Atalho do Web Console na área de trabalho em `/home/kaua/Desktop/Flavos Web Console.desktop` com permissão de execução, permitindo ao usuário abrir a interface administrativa com um clique duplo no Firefox.

### Segurança
- Isolamento completo de credenciais e identificadores da VM Desktop em relação à VM Cloud Edition.
- Flavos Agent fazendo bind exclusivamente em localhost (`127.0.0.1:8087`), com rotas administrativas privadas blindadas por autenticação de token.
- Logs de auditoria locais e permissões restritas mantidas no diretório `/var/log/flavos/` para auditoria do host de desktop.

---

## [0.7.0] — Fase 7: Flavos Web Console MVP — 27/06/2026

### Adicionado
- Projeto `dashboard/` com Vite 8.1, React 18.3 e TypeScript 5.5.
- Login local por token usando `sessionStorage` (chave `flavos_token`).
- API client com header `X-Flavos-Token`, timeout de 8s e tratamento de `AuthError`.
- Dashboard visual com cards de status, métricas, contagem de serviços e últimos eventos de auditoria.
- Services Page com lista de serviços, ações seguras e diálogo de confirmação antes de start/stop/restart.
- Logs Page com seletor de serviço e quantidade de linhas (20, 50, 100, 200).
- Audit Page com tabela, filtro por resultado e mascaramento visual de strings hex longas.
- Settings/About Page com informações do Core, botões de logout e aviso de segurança.
- Estados de loading, error e empty em todas as telas.
- Design system dark premium em CSS puro (Inter + JetBrains Mono).
- Build estático via `npm run build` (Vite, 32 módulos, 163KB JS).
- Deploy do Web Console em `/var/www/flavos-console` via Nginx na VM.
- Configuração do Nginx com proxy `/api/` para `127.0.0.1:8087`.

### Segurança
- Token não é hardcoded e não é enviado via query string.
- Token não é salvo em `localStorage` (usa `sessionStorage`).
- Endpoints protegidos continuam exigindo `X-Flavos-Token`.
- Agent permanece bindado em `127.0.0.1:8087` sem alteração.
- `npm audit` → 0 vulnerabilidades.

### Corrigido (Fase 6 — pré-Fase 7)
- Prefixos de token nos testes da Fase 6 substituídos por `[token ocultado]`.
- Seção de pós-reboot adicionada ao `PHASE-6-LOGS-AUDIT-REPORT.md`.

---

## [0.6.0] — Fase 6: Logs & Auditoria — 27/06/2026

### Adicionado
- **Trilha de Auditoria Inicial (Audit Log):**
  - Pacote `agent/internal/audit` com escrita segura via `sync.Mutex` e persistência local em JSON Lines (JSONL).
  - Endpoint autenticado `GET /api/v1/audit` para listar os últimos eventos (com limite `?lines=` entre 1 e 200, padrão 50).
- **Leitura de Logs de Serviço (Service Logs):**
  - Pacote `agent/internal/logs` com mapeamento estrito de arquivos de logs de sistema para `nginx`, `sshd` e `flavos-agent`.
  - Endpoint autenticado `GET /api/v1/logs` que lista os logs disponíveis na whitelist.
  - Endpoint autenticado `GET /api/v1/logs/{service}` para ler as últimas linhas (com limite `?lines=` entre 1 e 200, padrão 50).
- **Integração de Segurança:**
  - Middleware de autenticação agora registra automaticamente falhas de token na trilha de auditoria.
  - Execução de comandos no Service Manager agora audita todas as ações executadas e seus resultados de sucesso ou falha com justificativa.
  - Fail-closed: o Agent encerra a execução se não for possível gravar o log de auditoria oficial no host (sem silenciar falhas).

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
