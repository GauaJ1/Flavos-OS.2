# Arquitetura do Flavos OS 2.0

Este documento descreve a arquitetura do **Flavos OS 2.0 (Cloud Edition)**, definindo suas camadas, fluxo de comunicação e as principais decisões de design técnico.

---

## 1. Visão Geral da Arquitetura

O Flavos OS 2.0 é projetado como uma solução **Headless** (sem interface gráfica local), voltada para servidores em nuvem (VPS). Ele atua como um agente de orquestração e monitoramento de sistema, permitindo o controle de uma máquina Void Linux de forma remota e segura via APIs modernas e um painel Web centralizado.

A arquitetura adota um design desacoplado em três camadas:

```mermaid
graph TD
    subgraph Client Layer
        Dashboard["Flavos Web Console (React / Vite)"]
    end

    subgraph Server Layer
        Agent["Flavos Core Agent (Golang)"]
        SQLite[("Auditoria / Estado (SQLite)")]
    end

    subgraph OS Layer
        Runit["Init System (runit)"]
        XBPS["Package Manager (xbps)"]
        Proc["/proc & System APIs"]
    end

    Dashboard <-->|HTTPS / WSS (Auth Token)| Agent
    Agent <-->|Read / Write| SQLite
    Agent <-->|Control Services| Runit
    Agent <-->|Query State| XBPS
    Agent <-->|Syscalls / Telemetry| Proc
```

---

## 2. Camadas do Sistema

### Camada 1: Void Linux Base (Host)
A fundação do projeto é o sistema operacional hospedeiro.
- **Distribuição:** [Void Linux](https://voidlinux.org/) (x86_64, glibc). Escolhido por sua simplicidade, pegada de memória mínima e rapidez de inicialização.
- **Init System (`runit`):** Usado para gerenciar os daemons do sistema. O Agent interage diretamente com o diretório `/var/service/` e comandos `sv` para iniciar, parar e reiniciar serviços de forma segura.
- **Package Manager (`xbps`):** Usado para auditoria de pacotes instalados e integridade do sistema.

### Camada 2: Flavos Core Agent
O agente central do sistema, executado como um daemon em background gerenciado pelo `runit`.
- **Linguagem:** Go (Golang). Escolhida pela facilidade de compilação estática (sem dependências em tempo de execução), excelente suporte a concorrência (goroutines para telemetria/WebSockets) e baixo consumo de CPU/RAM.
- **Responsabilidades:**
  - Expor endpoints HTTP REST para monitoramento e controle.
  - Expor conexões WebSocket para transmissão em tempo real de métricas (telemetria).
  - Interagir diretamente com o SO (ler `/proc` para métricas, controlar `/var/service` para daemons).
  - Armazenar histórico de auditoria e logs de segurança em um banco de dados local **SQLite**.

### Camada 3: Flavos Web Console (Dashboard)
Interface de usuário remota executada no navegador do administrador.
- **Tecnologias:** React + Vite + TailwindCSS.
- **Responsabilidades:**
  - Permitir a visualização de telemetria em tempo real (gráficos de CPU, RAM, I/O de disco, tráfego de rede).
  - Exibir status e permitir a reinicialização de serviços do sistema autorizados.
  - Exibir logs de auditoria detalhados sobre quem efetuou alterações no servidor.

---

## 3. Fluxo de Comunicação & Separação de Responsabilidades

1. **Separação de Contextos:**
   - O **Dashboard** é puramente um cliente. Ele nunca executa comandos diretamente no SO e não possui credenciais do sistema base (como senhas root). Ele se autentica no Agent usando um Token de Acesso (Bearer Token).
   - O **Agent** roda no host local com privilégios específicos (usando `sudoers` ou rodando como usuário do sistema com permissões restritas para interagir com o `runit`). Ele valida, sanitiza e audita todas as requisições antes de repassá-las ao Void Linux.
   - O **Host** executa as ações reais através do `runit`.

2. **Fluxo de uma Requisição de Reinicialização de Serviço:**
   ```
   [Dashboard] --- POST /api/v1/services/nginx/restart (Auth Token) ---> [Agent]
   [Agent]     --- 1. Valida autenticação (Token ok?) -----------------> [Agent]
   [Agent]     --- 2. Verifica Whitelist (Nginx é permitido?) ---------> [Agent]
   [Agent]     --- 3. Grava no banco de auditoria (SQLite) ------------> [Agent]
   [Agent]     --- 4. Executa comando do init: `sv restart nginx` ------> [Runit]
   [Runit]     --- 5. Reinicia o daemon Nginx -------------------------> [Void Linux]
   [Agent]    <--- 6. Retorna Status 200 (Success) -------------------- [Dashboard]
   ```

---

## 4. Decisões Técnicas & Justificativas

- **Go para o Agent:** A ausência de uma VM pesada (como Java ou .NET) e a independência de interpretadores (como Python ou Node.js) garantem que o agent use menos de 15MB de RAM estáveis, ideal para VPS de baixo custo.
- **SQLite para Auditoria:** Dispensar a necessidade de configurar um banco de dados completo (como PostgreSQL ou MySQL) no host simplifica drasticamente o instalador do Flavos. O SQLite fornece transações ACID ideais para logs locais confiáveis.
- **Whitelist de Serviços:** Em vez de permitir o controle de qualquer serviço do Void Linux, o Agent lerá uma lista de serviços permitidos (ex: `nginx`, `sshd`). Isso impede que invasores tentem parar serviços críticos de rede ou segurança.

---

## 5. Componentes Futuros (Pós-MVP)

- **Flavos Agent CLI:** Uma ferramenta de terminal local para gerenciar o Agent, redefinir tokens e verificar logs rapidamente.
- **Multi-Server Dashboard:** Capacidade de o console gerenciar múltiplos agentes a partir de uma única interface gráfica.
- **Alertas Inteligentes:** Notificações via Webhook (Discord/Slack/Telegram) enviadas pelo Agent quando métricas críticas (como disco cheio ou serviço parado) forem atingidas.
