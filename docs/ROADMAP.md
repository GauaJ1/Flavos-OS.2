# Roadmap do Projeto — Flavos OS 2.0

Este documento apresenta o planejamento detalhado das fases do **Flavos OS 2.0 (Cloud Edition)**, do início da fundação ao lançamento da versão Preview 0.1 Final.

---

## 🗺️ Visão Geral do Roadmap

O cronograma do projeto está planejado para iniciar em **25/06/2026** com prazo final de conclusão em **01/08/2026**.

```
Fase 0 ──> Fase 1 ──> Fase 2 ──> Fase 3 ──> Fase 4 ──> Fase 5
                                                         │
Fase 10 <── Fase 9 <── Fase 8 <── Fase 7 <── Fase 6 <───┘
```

---

## 📌 Detalhamento das Fases

### Fase 0 — Fundação do Projeto
- **Objetivo:** Definir o escopo, arquitetura, design técnico inicial e regras de segurança básicas, estruturando o repositório.
- **Entregáveis:** Estrutura de diretórios criada, documentações (`ARCHITECTURE.md`, `ROADMAP.md`, `API.md`, `SECURITY.md`, `INSTALL.md`, `CHANGELOG.md`) consolidadas.
- **Critério de Conclusão:** Repositório estruturado no Windows com todos os arquivos markdown de fundação criados e aprovados.
- **Status Inicial:** `🟢 Concluído`

---

### Fase 1 — Ambiente Void Linux
- **Objetivo:** Estabelecer o ambiente de teste simulando a VPS real.
- **Entregáveis:** Instalação do Void Linux x86_64 glibc em uma máquina virtual (VM) usando QEMU/KVM no Linux Mint XFCE. Configuração de rede SSH.
- **Critério de Conclusão:** Acesso SSH estabelecido à VM Void Linux de teste e comandos xbps funcionando corretamente.
- **Status Inicial:** `🟡 Pendente`

---

### Fase 2 — Flavos Core Agent MVP
- **Objetivo:** Desenvolver o esqueleto do Agent escrito em Go e criar os primeiros endpoints básicos.
- **Entregáveis:** Código Go inicial, servidor HTTP local escutando por padrão em `127.0.0.1:8087`, endpoints `/api/v1/health` e `/api/v1/status` ativos retornando JSON estruturado.
- **Critério de Conclusão:** Agent compilando sem erros e respondendo a chamadas `curl` locais nos endpoints de saúde.
- **Status Inicial:** `🔴 Não Iniciado`

---

### Fase 3 — Agent como serviço runit
- **Objetivo:** Configurar o ciclo de vida do Agent no sistema de inicialização do Void Linux.
- **Entregáveis:** Script de serviço do `runit` para o `flavos-agent` (`/etc/sv/flavos-agent/run`).
- **Critério de Conclusão:** O agent inicia automaticamente durante o boot da VM Void Linux e reinicia de forma autônoma se falhar.
- **Status Inicial:** `🔴 Não Iniciado`

---

### Fase 4 — Service Manager
- **Objetivo:** Implementar o controle de serviços do sistema operacional via API.
- **Entregáveis:** Endpoints `/api/v1/services`, `/api/v1/services/{name}/start`, `/stop`, `/restart`. Mecanismo de Whitelist configurado em TOML para impedir controle de serviços proibidos.
- **Critério de Conclusão:** Requisições POST permitindo iniciar e parar com sucesso apenas serviços listados na whitelist (ex: Nginx).
- **Status Inicial:** `🔴 Não Iniciado`

---

### Fase 5 — Logs & Audit
- **Objetivo:** Adicionar monitoramento operacional e trilha de auditoria para ações executadas.
- **Entregáveis:** Endpoint `/api/v1/logs/{service}` para leitura rápida dos logs do runit. Criação do arquivo local de auditoria `/var/log/flavos/audit.log` via SQLite registrando cada comando de serviço recebido.
- **Critério de Conclusão:** Qualquer tentativa de alteração de serviço gerando uma entrada indelével na base de auditoria local.
- **Status Inicial:** `🔴 Não Iniciado`

---

### Fase 6 — Autenticação Inicial
- **Objetivo:** Proteger a API do Agent contra acesso não autorizado.
- **Entregáveis:** Validação de Token Estático (Bearer Token) carregado a partir do arquivo de configuração do Agent. Middleware de autenticação HTTP.
- **Critério de Conclusão:** Requisições sem o token correto no Header `Authorization` retornando HTTP 401 Unauthorized.
- **Status Inicial:** `🔴 Não Iniciado`

---

### Fase 7 — Flavos Web Console MVP
- **Objetivo:** Criar a interface visual para administração do sistema.
- **Entregáveis:** Projeto React + Vite + TailwindCSS inicial. Telas de Login (com Token), Monitoramento de Serviços (Botões de Start/Stop) e Histórico de Auditoria.
- **Critério de Conclusão:** Dashboard rodando no navegador e fazendo requests autenticados para a API do Agent.
- **Status Inicial:** `🔴 Não Iniciado`

---

### Fase 8 — WebSocket de Telemetria
- **Objetivo:** Fornecer atualizações de recursos do sistema em tempo real na interface gráfica.
- **Entregáveis:** Endpoint `/api/v1/telemetry` usando WebSockets no Agent Go. Gráficos de linha dinâmicos de consumo de CPU, RAM e Rede no Console React.
- **Critério de Conclusão:** Transmissão de métricas em tempo real fluindo sem vazamentos de memória e plotando de forma contínua no dashboard.
- **Status Inicial:** `🔴 Não Iniciado`

---

### Fase 9 — Hardening e Empacotamento
- **Objetivo:** Reforçar a segurança do sistema operacional e do Agent e preparar os instaladores.
- **Entregáveis:** Scripts de configuração de segurança do host (firewall xbps/iptables, desabilitar root SSH, configurar grupo de usuários restrito para execução do agent). Script de deploy automatizado.
- **Critério de Conclusão:** Agent executando sem privilégios de root completos, mas com permissão controlada via `sudoers` para executar comandos de serviço.
- **Status Inicial:** `🔴 Não Iniciado`

---

### Fase 10 — Preview 0.1 Final
- **Objetivo:** Consolidação, correção de bugs finais e encerramento da primeira etapa viável do produto.
- **Entregáveis:** Imagem de VM limpa ou script completo de instalação de um único comando que configura o Agent no Void Linux e serve o Console via Nginx.
- **Critério de Conclusão:** Instalação limpa feita com sucesso a partir do zero em menos de 5 minutos, permitindo controle seguro do servidor.
- **Status Inicial:** `🔴 Não Iniciado`
