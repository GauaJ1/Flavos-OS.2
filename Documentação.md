# Flavos OS 2.0 — Documentação de Projeto

**Status:** 🟢 Fase 5 Concluída
**Início:** 25/06/2026
**Prazo alvo:** 01/08/2026
**Projeto:** Projeto Férias
**Linguagem do Agent:** Go
**Base:** Void Linux glibc x86_64
**Predecessor:** Flavos OS 0.1 Preview, descontinuado
**Categoria:** Projeto de portfólio · Flavos Company
**Tipo:** Cloud OS Headless · VPS Control Panel · API-first OS

---

# 1. Visão Geral

O **Flavos OS 2.0** é um sistema operacional headless para nuvem, focado em transformar uma VPS em um ambiente privado, monitorável e controlável via Web Dashboard, API REST e WebSockets.

Diferente do Flavos OS 0.1 Preview, que tinha foco mais experimental em interface e sistema próprio, o Flavos OS 2.0 nasce com uma proposta mais realista, útil e aplicável:

> Criar uma camada inteligente de controle sobre uma VPS Linux, permitindo gerenciar serviços, telemetria, logs, pacotes, containers e automações através de um painel web seguro.

O projeto não pretende substituir distribuições Linux completas. Ele usa uma base minimalista, estável e controlável, adicionando uma camada própria chamada **Flavos Core Agent**.

---

# 2. Objetivo Principal

Criar um ambiente de nuvem privada controlável por navegador, onde o usuário possa:

* visualizar status da VPS;
* monitorar CPU, RAM, disco, rede e uptime;
* listar serviços do sistema;
* iniciar, parar e reiniciar serviços permitidos;
* visualizar logs;
* controlar apps/containers futuramente;
* integrar o ambiente com produtos da Flavos Company;
* criar uma experiência própria de “Cloud OS”.

---

# 3. Conceito Oficial

## Nome

**Flavos OS 2.0 Cloud Edition**

## Frase oficial

> Flavos OS 2.0 é um Cloud OS headless baseado em Void Linux, projetado para transformar uma VPS em um ambiente privado, controlável por API, painel web e automações inteligentes.

## Posicionamento

O Flavos OS 2.0 não é um desktop Linux tradicional.
Ele é uma camada de controle remoto para servidores.

Ele funciona como:

* painel de VPS;
* API de sistema;
* dashboard de telemetria;
* gerenciador de serviços;
* base futura para automações com IA;
* laboratório técnico da Flavos Company.

---

# 4. Diferença entre Flavos OS 0.1 e Flavos OS 2.0

| Item         | Flavos OS 0.1 Preview          | Flavos OS 2.0                     |
| ------------ | ------------------------------ | --------------------------------- |
| Status       | Descontinuado                  | Em desenvolvimento                |
| Base         | LFS / experimental             | Void Linux glibc                  |
| Foco         | Sistema próprio/local          | Cloud OS headless                 |
| Interface    | Console/interface experimental | Web Dashboard                     |
| Controle     | Local                          | Remoto via API                    |
| Público-alvo | Experimento técnico            | Portfólio, VPS, automação         |
| Complexidade | Alta demais                    | Modular e evolutiva               |
| Objetivo     | Criar um OS                    | Controlar uma VPS como OS próprio |

---

# 5. Arquitetura Geral

A arquitetura do Flavos OS 2.0 é dividida em três camadas principais:

```txt
[ Camada 3: Flavos Web Console ]
              │
              │ HTTPS / WSS
              ▼
[ Camada 2: Flavos Core Agent ]
              │
              │ chamadas internas seguras
              ▼
[ Camada 1: Void Linux Base ]
```

---

# 6. Camada 1 — Sistema Base

## Distribuição

**Void Linux x86_64 glibc**

## Motivos da escolha

* leve;
* independente;
* sem systemd;
* usa runit;
* bom para servidores minimalistas;
* identidade técnica forte;
* equilíbrio entre controle e praticidade;
* mais simples que manter um sistema LFS completo.

## Componentes principais

```txt
Void Linux
├── runit
├── xbps
├── glibc
├── OpenSSH
├── nftables ou iptables
├── Go runtime/build tools
├── Flavos Core Agent
└── serviços gerenciados
```

## Decisões

| Área               | Escolha         |
| ------------------ | --------------- |
| Init               | runit           |
| libc               | glibc           |
| Pacotes            | xbps            |
| Interface gráfica  | Nenhuma         |
| Modo               | Headless        |
| Acesso inicial     | SSH             |
| Controle principal | API + Dashboard |

---

# 7. Camada 2 — Flavos Core Agent

O **Flavos Core Agent** é o cérebro do Flavos OS 2.0.

Ele será um daemon escrito em Go, executado automaticamente no boot da VPS através do runit.

## Responsabilidades

O Agent deve:

* expor uma API local/segura;
* coletar telemetria do sistema;
* listar serviços do runit;
* controlar serviços permitidos;
* ler logs;
* registrar ações em audit logs;
* autenticar requisições;
* servir dados para o painel web;
* futuramente controlar pacotes, containers e terminal web.

## Linguagem

**Go**

## Motivos

* gera binário único;
* bom desempenho;
* baixo consumo de RAM;
* ideal para daemons;
* boa integração com HTTP/WebSocket;
* implantação simples;
* combina com um projeto de sistema.

## Nome interno

```txt
flavos-agent
```

## Serviço no runit

Nome sugerido:

```txt
flavos-agent
```

Caminho sugerido:

```txt
/etc/sv/flavos-agent/run
```

---

# 8. Camada 3 — Flavos Web Console

O **Flavos Web Console** será o painel visual do Flavos OS 2.0.

Ele se comunica com o Flavos Core Agent e apresenta os dados de forma simples, moderna e utilizável.

## Responsabilidades

* exibir dashboard da VPS;
* mostrar CPU, RAM, disco e rede;
* exibir status dos serviços;
* permitir ações seguras;
* mostrar logs;
* autenticar usuário;
* futuramente oferecer terminal web e deploy de apps.

## Stack sugerida

```txt
Vite
React
TailwindCSS
TypeScript
WebSockets
Chart library
```

## Estilo visual

A identidade visual deve seguir o padrão Flavos:

* minimalista;
* dark mode;
* futurista;
* premium;
* limpo;
* sem aparência gamer;
* foco em produtividade;
* cards com métricas;
* layout responsivo.

---

# 9. Comunicação entre Dashboard e Agent

## Protocolo

```txt
HTTPS para REST
WSS para dados em tempo real
```

## Fluxo

```txt
Usuário acessa o painel
      ↓
Login no Flavos Web Console
      ↓
Painel solicita dados ao Flavos Core Agent
      ↓
Agent coleta dados do Void Linux
      ↓
Agent retorna JSON
      ↓
Painel exibe informações
```

## API base

```txt
/api/v1
```

---

# 10. Endpoints Planejados

## Status geral

```txt
GET /api/v1/status
```

Retorna:

```json
{
  "os": "Flavos OS 2.0",
  "base": "Void Linux",
  "version": "Preview 0.1",
  "hostname": "flavos-vps",
  "uptime": "2h 31m",
  "agent": "online"
}
```

---

## Métricas

```txt
GET /api/v1/metrics
```

Retorna:

```json
{
  "cpu": {
    "usage_percent": 12.4
  },
  "memory": {
    "total_mb": 1024,
    "used_mb": 412,
    "usage_percent": 40.2
  },
  "disk": {
    "total_gb": 25,
    "used_gb": 8,
    "usage_percent": 32
  }
}
```

---

## Serviços

```txt
GET /api/v1/services
```

Retorna:

```json
[
  {
    "name": "sshd",
    "status": "running",
    "allowed_actions": ["restart"]
  },
  {
    "name": "nginx",
    "status": "running",
    "allowed_actions": ["start", "stop", "restart"]
  }
]
```

---

## Controle de serviços

```txt
POST /api/v1/services/{name}/start
POST /api/v1/services/{name}/stop
POST /api/v1/services/{name}/restart
```

Regra obrigatória:

> Apenas serviços presentes na whitelist podem ser controlados.

---

## Logs

```txt
GET /api/v1/logs/{service}
```

Retorna logs recentes de um serviço permitido.

---

## WebSocket de telemetria

```txt
WS /api/v1/telemetry
```

Envia dados em tempo real:

```json
{
  "timestamp": "2026-06-26T10:00:00",
  "cpu": 18.2,
  "ram": 42.5,
  "disk": 32.1
}
```

---

# 11. Segurança

A segurança é uma parte central do Flavos OS 2.0.

Como o sistema poderá controlar uma VPS, qualquer falha de autenticação pode comprometer totalmente o servidor.

## Regras obrigatórias

1. O Agent não deve ficar exposto publicamente sem proteção.
2. Todo tráfego deve usar HTTPS/WSS.
3. Nenhum comando shell deve ser executado diretamente a partir de input do usuário.
4. Toda ação sensível deve passar por whitelist.
5. Todas as ações devem gerar audit log.
6. O terminal web deve ser adiado para versões futuras.
7. Instalação de pacotes deve ser adiada até a arquitetura estar segura.
8. O painel deve ter autenticação.
9. Sessões devem expirar.
10. Tentativas de login falhas devem ser registradas.

---

# 12. Modelo de Segurança Inicial

## Preview 0.1

Na primeira versão:

* sem terminal web;
* sem instalação de pacotes;
* sem comandos shell livres;
* sem execução arbitrária;
* sem multiusuário avançado;
* apenas leitura de métricas;
* controle limitado de serviços permitidos.

## Preview 0.2

Adicionar:

* whitelist de serviços;
* audit logs;
* login melhorado;
* proteção contra força bruta;
* permissões básicas.

## Preview 1.0

Adicionar:

* RBAC;
* 2FA;
* terminal isolado;
* logs completos;
* tokens rotativos;
* backup de configuração;
* alertas de segurança.

---

# 13. Estrutura de Pastas Recomendada

```txt
flavos-os-2/
├── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── SECURITY.md
│   ├── API.md
│   ├── INSTALL.md
│   └── CHANGELOG.md
├── agent/
│   ├── cmd/
│   │   └── flavos-agent/
│   │       └── main.go
│   ├── internal/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── metrics/
│   │   ├── services/
│   │   ├── logs/
│   │   ├── config/
│   │   └── audit/
│   ├── go.mod
│   └── go.sum
├── dashboard/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   ├── install-agent.sh
│   ├── setup-runit.sh
│   └── hardening.sh
├── packaging/
│   └── void/
│       └── flavos-agent/
└── examples/
    ├── config.example.toml
    └── nginx.example.conf
```

---

# 14. Configuração do Agent

Arquivo sugerido:

```txt
/etc/flavos/agent.toml
```

Exemplo:

```toml
[server]
host = "127.0.0.1"
port = 8087
mode = "production"

[auth]
token_mode = "static"
token_file = "/etc/flavos/token"

[security]
allow_shell = false
allow_package_install = false
allow_terminal = false

[services]
allowed = ["nginx", "sshd", "flavos-agent"]

[logs]
max_lines = 200

[audit]
enabled = true
path = "/var/log/flavos/audit.log"
```

---

# 15. Controle de Serviços

O Flavos OS 2.0 deve controlar serviços do sistema de forma limitada.

## Permitido

* listar serviços;
* verificar status;
* iniciar serviço permitido;
* parar serviço permitido;
* reiniciar serviço permitido;
* ler logs de serviço permitido.

## Proibido no MVP

* controlar qualquer serviço sem whitelist;
* executar comandos arbitrários;
* remover serviços do sistema;
* alterar arquivos críticos;
* expor terminal web.

---

# 16. Audit Log

Toda ação importante deve ser registrada.

Exemplo:

```json
{
  "timestamp": "2026-06-26T10:30:00",
  "user": "admin",
  "action": "restart_service",
  "target": "nginx",
  "ip": "127.0.0.1",
  "result": "success"
}
```

Eventos registrados:

* login;
* falha de login;
* leitura de logs;
* restart de serviço;
* start de serviço;
* stop de serviço;
* erro de autenticação;
* tentativa de ação não permitida.

---

# 17. Banco Local

Para o MVP, o banco pode ser simples.

## Preview 0.1

Pode começar sem banco, usando apenas arquivo de configuração.

## Preview 0.2+

Usar SQLite.

Tabelas futuras:

```txt
users
sessions
api_keys
audit_logs
service_whitelist
system_events
settings
```

---

# 18. Versionamento

## Padrão

```txt
Preview 0.1
Preview 0.2
Preview 0.3
Preview 0.4
Beta 0.5
Beta 0.8
Release Candidate 1.0
```

## Versões planejadas

| Versão      | Nome            | Objetivo                     |
| ----------- | --------------- | ---------------------------- |
| Preview 0.1 | Core Status     | Telemetria básica            |
| Preview 0.2 | Service Control | Controle de serviços         |
| Preview 0.3 | Logs & Audit    | Logs e auditoria             |
| Preview 0.4 | Web Console     | Dashboard funcional          |
| Beta 0.5    | Secure Console  | Login, segurança e UX        |
| Beta 0.8    | Cloud Apps      | Containers/apps              |
| 1.0         | Cloud Edition   | Versão usável e apresentável |

---

# 19. Roadmap Geral

## Fase 0 — Fundação do Projeto

**Status:** Para fazer hoje
**Duração estimada:** 25/06 a 26/06
**Objetivo:** organizar a base do projeto antes de programar pesado.

### Entregáveis

* criar repositório;
* criar README;
* criar estrutura de pastas;
* definir nome oficial;
* definir escopo do MVP;
* definir stack;
* criar documentação inicial;
* criar roadmap;
* criar checklist de segurança;
* decidir o que não entra no MVP.

### Resultado esperado

Ao final da Fase 0, o projeto deve ter uma base organizada e clara.

### Critério de conclusão

A Fase 0 estará concluída quando existir:

```txt
README.md
docs/ARCHITECTURE.md
docs/ROADMAP.md
docs/API.md
docs/SECURITY.md
agent/
dashboard/
scripts/
```

---

## Fase 1 — Base Void Linux + Ambiente

**Status:** Para fazer hoje
**Duração estimada:** 26/06
**Objetivo:** preparar o ambiente onde o Agent vai rodar.

### Entregáveis

* instalar Void Linux glibc em VM ou VPS;
* atualizar pacotes;
* instalar Go;
* configurar SSH;
* configurar firewall básico;
* criar diretórios do Flavos OS;
* criar usuário/grupo do Agent;
* preparar estrutura do serviço runit;
* testar comando básico de serviço.

### Pacotes iniciais sugeridos

```txt
go
git
curl
wget
nano
htop
socklog-void
nginx
```

### Diretórios sugeridos

```txt
/etc/flavos/
/var/log/flavos/
/opt/flavos/
/usr/local/bin/flavos-agent
```

### Resultado esperado

Ao final da Fase 1, a máquina deve estar pronta para receber o Flavos Core Agent.

### Critério de conclusão

A Fase 1 estará concluída quando:

* Void Linux estiver instalado;
* Go estiver funcionando;
* SSH estiver funcionando;
* firewall básico estiver configurado;
* pasta `/etc/flavos` existir;
* pasta `/var/log/flavos` existir;
* runit estiver pronto para iniciar o Agent futuramente.

---

## Fase 2 — Flavos Core Agent MVP

**Status:** Próxima fase
**Duração sugerida:** 27/06 a 30/06
**Objetivo:** criar o primeiro Agent funcional em Go.

### Entregáveis

* criar projeto Go;
* criar servidor HTTP;
* criar endpoint `/api/v1/status`;
* criar endpoint `/api/v1/health`;
* criar endpoint `/api/v1/metrics`;
* retornar JSON real;
* compilar binário;
* rodar manualmente na VPS;
* testar com `curl`.

### Endpoints mínimos

```txt
GET /api/v1/health
GET /api/v1/status
GET /api/v1/metrics
```

### Resultado esperado

O Agent deve responder dados básicos da VPS via HTTP local.

### Critério de conclusão

A Fase 2 estará concluída quando:

```txt
curl http://127.0.0.1:8087/api/v1/status
```

retornar um JSON válido com status do sistema.

---

## Fase 3 — Agent como Serviço runit

**Status:** Planejada
**Duração sugerida:** 01/07 a 03/07
**Objetivo:** fazer o Agent iniciar automaticamente com o sistema.

### Entregáveis

* criar script runit;
* instalar binário em `/usr/local/bin`;
* ativar serviço;
* testar boot automático;
* criar logs do serviço;
* criar script de instalação.

### Resultado esperado

O Flavos Core Agent deve iniciar automaticamente no boot.

### Critério de conclusão

A Fase 3 estará concluída quando o comando de status do serviço mostrar o Agent ativo após reiniciar a VPS.

---

## Fase 4 — Service Manager

**Status:** Planejada
**Duração sugerida:** 04/07 a 08/07
**Objetivo:** permitir controle limitado de serviços.

### Entregáveis

* listar serviços;
* detectar status;
* criar whitelist;
* iniciar serviço permitido;
* parar serviço permitido;
* reiniciar serviço permitido;
* bloquear serviço não autorizado.

### Endpoints

```txt
GET /api/v1/services
POST /api/v1/services/{name}/start
POST /api/v1/services/{name}/stop
POST /api/v1/services/{name}/restart
```

### Resultado esperado

O painel/API poderá controlar serviços selecionados com segurança.

### Critério de conclusão

A Fase 4 estará concluída quando for possível reiniciar um serviço permitido e bloquear um serviço não permitido.

---

## Fase 5 — Logs & Audit

**Status:** Planejada
**Duração sugerida:** 09/07 a 12/07
**Objetivo:** adicionar visibilidade e rastreabilidade.

### Entregáveis

* endpoint de logs;
* audit log local;
* registro de ações;
* registro de falhas;
* limite de linhas por requisição;
* logs em JSON.

### Endpoints

```txt
GET /api/v1/logs/{service}
GET /api/v1/audit
```

### Resultado esperado

Toda ação importante deve ficar registrada.

### Critério de conclusão

A Fase 5 estará concluída quando ações como restart, login e erro de permissão aparecerem no audit log.

---

## Fase 6 — Autenticação Inicial

**Status:** Planejada
**Duração sugerida:** 13/07 a 16/07
**Objetivo:** proteger a API.

### Entregáveis

* token estático inicial;
* middleware de autenticação;
* proteção de endpoints sensíveis;
* bloqueio de requisições sem token;
* logs de falha;
* expiração futura planejada.

### Modelo inicial

Header:

```txt
X-Flavos-Token: token_seguro
```

### Resultado esperado

A API não deve responder endpoints sensíveis sem autenticação.

### Critério de conclusão

A Fase 6 estará concluída quando uma requisição sem token retornar erro 401.

---

## Fase 7 — Flavos Web Console MVP

**Status:** Planejada
**Duração sugerida:** 17/07 a 22/07
**Objetivo:** criar o painel visual inicial.

### Entregáveis

* projeto Vite/React;
* tela de login simples;
* dashboard;
* cards de CPU, RAM, disco e uptime;
* lista de serviços;
* botão de restart para serviços permitidos;
* página de logs;
* layout dark minimalista.

### Telas

```txt
/login
/dashboard
/services
/logs
/settings
```

### Resultado esperado

O usuário consegue controlar a VPS pelo navegador.

### Critério de conclusão

A Fase 7 estará concluída quando o dashboard consumir dados reais do Agent.

---

## Fase 8 — WebSocket de Telemetria

**Status:** Planejada
**Duração sugerida:** 23/07 a 25/07
**Objetivo:** adicionar atualização em tempo real.

### Entregáveis

* endpoint WebSocket;
* envio periódico de métricas;
* atualização automática no dashboard;
* tratamento de desconexão;
* reconexão automática.

### Endpoint

```txt
WS /api/v1/telemetry
```

### Resultado esperado

O dashboard mostra dados atualizados sem precisar recarregar a página.

### Critério de conclusão

A Fase 8 estará concluída quando CPU/RAM/disco atualizarem em tempo real.

---

## Fase 9 — Hardening e Empacotamento

**Status:** Planejada
**Duração sugerida:** 26/07 a 29/07
**Objetivo:** deixar o projeto mais seguro e apresentável.

### Entregáveis

* revisar permissões;
* limitar portas;
* configurar reverse proxy;
* configurar HTTPS;
* melhorar logs;
* criar script de instalação;
* criar documentação de instalação;
* revisar README;
* remover recursos inseguros;
* testar VPS limpa.

### Resultado esperado

O Flavos OS 2.0 deve ser instalável e demonstrável.

### Critério de conclusão

A Fase 9 estará concluída quando uma instalação limpa conseguir rodar o Agent e o Dashboard seguindo a documentação.

---

## Fase 10 — Preview 0.1 Final

**Status:** Planejada
**Duração sugerida:** 30/07 a 01/08
**Objetivo:** fechar a entrega do Projeto Férias.

### Entregáveis

* release Preview 0.1;
* README completo;
* prints do dashboard;
* vídeo curto de demonstração;
* changelog;
* roadmap pós-preview;
* documentação técnica;
* checklist de segurança;
* página de apresentação.

### Resultado esperado

O Flavos OS 2.0 Preview 0.1 deve estar apresentável como projeto de portfólio.

### Critério de conclusão

A Fase 10 estará concluída quando o projeto puder ser demonstrado com:

* VPS rodando;
* Agent ativo;
* Dashboard acessível;
* métricas reais;
* controle de serviços permitido;
* logs funcionando;
* documentação pronta.

---

# 20. O que fazer hoje

Como o objetivo é começar até duas fases hoje, o foco deve ser:

```txt
Hoje = Fase 0 + Fase 1
```

## Prioridade 1 — Fase 0

Criar estrutura local:

```txt
flavos-os-2/
├── README.md
├── docs/
├── agent/
├── dashboard/
├── scripts/
└── examples/
```

Criar documentos:

```txt
docs/ARCHITECTURE.md
docs/ROADMAP.md
docs/API.md
docs/SECURITY.md
docs/INSTALL.md
```

Definir MVP:

```txt
Preview 0.1 terá:
- Agent em Go
- /health
- /status
- /metrics
- runit service
- dashboard simples
- sem terminal web
- sem package manager remoto
- sem comandos livres
```

---

## Prioridade 2 — Fase 1

Preparar Void Linux:

```txt
sudo xbps-install -Syu
sudo xbps-install -S go git curl wget nano htop nginx
```

Criar diretórios:

```txt
sudo mkdir -p /etc/flavos
sudo mkdir -p /var/log/flavos
sudo mkdir -p /opt/flavos
```

Criar usuário do Agent:

```txt
sudo useradd -r -s /sbin/nologin flavos
```

Criar config inicial:

```txt
sudo nano /etc/flavos/agent.toml
```

Conteúdo inicial:

```toml
[server]
host = "127.0.0.1"
port = 8087
mode = "development"

[security]
allow_shell = false
allow_package_install = false
allow_terminal = false

[services]
allowed = ["nginx", "sshd", "flavos-agent"]

[audit]
enabled = true
path = "/var/log/flavos/audit.log"
```

---

# 21. Escopo do MVP

## Entra no MVP

* Agent em Go;
* status da máquina;
* métricas básicas;
* serviço runit;
* dashboard simples;
* controle limitado de serviços;
* logs básicos;
* autenticação simples;
* documentação.

## Não entra no MVP

* terminal web;
* gerenciador de arquivos;
* instalação remota de pacotes;
* multiusuário avançado;
* controle irrestrito de shell;
* containers avançados;
* IA integrada;
* app mobile;
* marketplace;
* sistema de plugins.

---

# 22. Riscos Técnicos

## Risco 1 — Segurança

O Agent terá poder de controlar a VPS.

### Mitigação

* whitelist;
* autenticação;
* HTTPS;
* logs;
* sem terminal no MVP;
* sem shell livre;
* API local inicialmente.

---

## Risco 2 — Escopo grande demais

O projeto pode crescer rápido demais.

### Mitigação

* seguir fases;
* não adicionar terminal cedo;
* não fazer desktop;
* não fazer app mobile agora;
* manter Preview 0.1 simples.

---

## Risco 3 — Quebrar a VPS

Comandos de serviço e pacote podem derrubar o sistema.

### Mitigação

* testar em VM;
* limitar serviços;
* usar backups;
* registrar ações;
* separar ambiente dev/prod.

---

# 23. Ideias Futuras

Após a Preview 0.1:

* terminal web seguro;
* deploy de apps;
* gerenciador de containers;
* painel de firewall;
* snapshots/backups;
* integração com Flavos IA;
* alertas por Telegram/Discord/email;
* gerenciamento de múltiplas VPS;
* Flavos Cloud Sync;
* marketplace de serviços;
* modo cluster;
* integração com Flavos ONE.

---

# 24. Identidade Visual

## Paleta sugerida

* fundo escuro;
* cinza grafite;
* branco suave;
* azul elétrico ou ciano;
* verde apenas para status online;
* vermelho apenas para erro.

## Componentes visuais

* cards de status;
* gráfico de CPU;
* gráfico de RAM;
* gráfico de disco;
* tabela de serviços;
* botão de ação seguro;
* alerta de risco;
* terminal apenas em versões futuras.

## Tom visual

* premium;
* técnico;
* minimalista;
* limpo;
* confiável;
* sem exagero visual.

---

# 25. Métricas de Sucesso

O projeto será considerado bem-sucedido se até 01/08/2026 ele tiver:

* Agent rodando como serviço;
* Dashboard acessível;
* métricas reais da VPS;
* controle seguro de serviços;
* logs funcionais;
* documentação completa;
* instalação reproduzível;
* prints e vídeo para portfólio.

---

# 26. Checklist Final da Preview 0.1

```txt
[ ] Repositório criado
[ ] README.md criado
[ ] Documentação inicial criada
[ ] Void Linux instalado
[ ] Go instalado
[ ] Agent iniciado manualmente
[ ] Endpoint /health funcionando
[ ] Endpoint /status funcionando
[ ] Endpoint /metrics funcionando
[ ] Agent rodando com runit
[ ] Logs do Agent funcionando
[ ] Dashboard criado
[ ] Dashboard consumindo API
[ ] Serviços listados
[ ] Controle limitado de serviços funcionando
[ ] Autenticação inicial funcionando
[ ] HTTPS/reverse proxy configurado
[ ] Segurança revisada
[ ] Release Preview 0.1 criada
[ ] Prints adicionados
[ ] Vídeo demo gravado
[ ] README final revisado
```

---

# 27. Conclusão

O Flavos OS 2.0 representa o renascimento do projeto Flavos OS, agora com uma proposta mais madura, útil e aplicável.

A versão 0.1 serviu como laboratório.
A versão 2.0 nasce como produto técnico de portfólio.

O objetivo não é criar apenas mais uma distribuição Linux, mas sim uma experiência própria de controle de nuvem:

> Uma VPS comum por baixo.
> Um sistema Flavos por cima.

O Flavos OS 2.0 deve ser simples no começo, seguro por padrão e evolutivo por arquitetura.

A prioridade da Preview 0.1 é provar o conceito:

```txt
Void Linux + Flavos Core Agent + Web Console = Cloud OS Headless funcional
```
