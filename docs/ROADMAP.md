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
- **Status Atual:** `🟢 Concluído`

---

### Fase 2 — Flavos Core Agent MVP
- **Objetivo:** Desenvolver o esqueleto do Agent escrito em Go e criar os primeiros endpoints básicos.
- **Entregáveis:** Código Go inicial, servidor HTTP local escutando por padrão in `127.0.0.1:8087`, endpoints `/api/v1/health` e `/api/v1/status` ativos retornando JSON estruturado.
- **Critério de Conclusão:** Agent compilando sem erros e respondendo a chamadas `curl` locais nos endpoints de saúde.
- **Status Atual:** `🟢 Concluído`

---

### Fase 3 — Agent como serviço runit
- **Objetivo:** Configurar o ciclo de vida do Agent no sistema de inicialização do Void Linux.
- **Entregáveis:** Script de serviço do `runit` para o `flavos-agent` (`/etc/sv/flavos-agent/run`).
- **Critério de Conclusão:** O agent inicia automaticamente durante o boot da VM Void Linux e reinicia de forma autônoma se falhar.
- **Status Atual:** `🟢 Concluído`

---

### Fase 4 — Autenticação Inicial
- **Objetivo:** Proteger a API do Agent contra acesso não autorizado antes das operações administrativas.
- **Entregáveis:** Validação de Token Estático (X-Flavos-Token) via header. Comparação em tempo constante com hashing SHA-256 no middleware do Agent. Armazenamento seguro do token com permissões restritas.
- **Critério de Conclusão:** Requisições sem o token correto no Header `X-Flavos-Token` retornando HTTP 401 Unauthorized de forma segura.
- **Status Atual:** `🟢 Concluído`

---

### Fase 5 — Service Manager
- **Objetivo:** Implementar o controle de serviços do sistema operacional via API de forma restrita e segura.
- **Entregáveis:** Endpoints `/api/v1/services`, `/api/v1/services/{name}/start`, `/stop`, `/restart`. Mecanismo de Whitelist configurado em TOML para impedir controle de serviços proibidos e validações rigorosas de injeção de comando.
- **Critério de Conclusão:** Requisições POST permitindo iniciar e parar com sucesso apenas serviços listados na whitelist (ex: Nginx).
- **Status Atual:** `🟢 Concluído`

---

### Fase 5.5 — Arquitetura por Edições
- **Objetivo:** Formalizar e documentar a nova estrutura modular do Flavos OS 2.0 em edições de produto construídas sobre um núcleo comum (Flavos OS Core).
- **Entregáveis:** Atualização da documentação arquitetônica, especificações de instalação, políticas de segurança e changelog para introduzir a Cloud Edition, Desktop Edition e Legacy Edition.
- **Critério de Conclusão:** Todos os arquivos de documentação do núcleo e de edições alinhados, aprovados e commitados no repositório.
- **Status Atual:** `🟢 Concluído`

---

### Fase D1 — Protótipo Desktop Edition (Desktop Edition Prototype)
- **Objetivo:** Criar a fundação e especificação prática para a edição gráfica voltada para computadores pessoais.
- **Entregáveis:** Scripts de deploy de pacotes gráficos essenciais do Void Linux (X11, KDE Plasma/GNOME, LightDM), definição de wallpapers oficiais, arquivos de atalhos e configuração de login manager integrado.
- **Critério de Conclusão:** Script de automação instalando a interface de forma funcional e aplicando o tema de identidade do Flavos OS.
- **Status Atual:** `🔴 Não Iniciado`

---

### Fase L1 — Protótipo Legacy Edition (Legacy Edition Prototype)
- **Objetivo:** Criar a fundação leve para computadores antigos ou hardware limitado.
- **Entregáveis:** Configuração de perfil leve (XFCE, LXQt ou Openbox), otimização de serviços secundários no Void, e limites restritos de uso de memória em inicialização.
- **Critério de Conclusão:** Sistema inicializado em modo gráfico consumindo menos de 200MB de RAM na VM de testes.
- **Status Atual:** `🔴 Não Iniciado`

---

### Fase 6 — Logs & Auditoria
- **Objetivo:** Adicionar rastreabilidade e histórico de ações no sistema.
- **Entregáveis:** Gravação local de logs de auditoria (`/var/log/flavos/audit.log`) em JSON. Endpoints `/api/v1/audit` e `/api/v1/logs/{service}` protegidos por token.
- **Critério de Conclusão:** Ações como restart de serviços, tentativas de login e erros de permissão registradas no log e retornadas de forma paginada pela API.
- **Status Atual:** `🟢 Concluído`

---

### Fase 7 — Flavos Web Console MVP
- **Objetivo:** Criar a interface visual para administração do sistema.
- **Entregáveis:** Projeto React + Vite + TypeScript. Telas de Login, Monitoramento de Serviços (com confirmação), Histórico de Auditoria e Logs de Serviços (com paginação e seletor).
- **Critério de Conclusão:** Dashboard rodando no navegador e consumindo dados reais do Agent por meio do proxy reverso do Nginx na VM.
- **Status Atual:** `🟢 Concluído`

---

### Fase 8 — WebSocket de Telemetria
- **Objetivo:** Fornecer atualizações de recursos do sistema em tempo real na interface gráfica.
- **Entregáveis:** Endpoint `/api/v1/telemetry` usando WebSockets no Agent Go. Gráficos de linha dinâmicos de consumo de CPU, RAM e Rede no Console React.
- **Critério de Conclusão:** Transmissão de métricas em tempo real fluindo sem vazamentos de memória e plotando de forma contínua no dashboard.
- **Status Atual:** `🔴 Não Iniciado`

---

### Fase 9 — Hardening e Empacotamento
- **Objetivo:** Reforçar a segurança do sistema operacional e do Agent e preparar os instaladores.
- **Entregáveis:** Scripts de configuração de segurança do host (firewall xbps/iptables, desabilitar root SSH, configurar grupo de usuários restrito para execução do agent). Script de deploy automatizado.
- **Critério de Conclusão:** Agent executando sem privilégios de root completos, mas com permissão controlada via `sudoers` para executar comandos de serviço.
- **Status Atual:** `🔴 Não Iniciado`

---

### Fase 10 — Preview 0.1 Final
- **Objetivo:** Consolidação, correção de bugs finais e encerramento da primeira etapa viável do produto.
- **Entregáveis:** Imagem de VM limpa ou script completo de instalação de um único comando que configura o Agent no Void Linux e serve o Console via Nginx.
- **Critério de Conclusão:** Instalação limpa feita com sucesso a partir do zero em menos de 5 minutos, permitindo controle seguro do servidor.
- **Status Atual:** `🔴 Não Iniciado`
