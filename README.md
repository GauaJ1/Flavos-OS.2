# Flavos OS 2.0 — Cloud Edition

[![Status](https://img.shields.io/badge/Status-Iniciando-blue.svg)](#)
[![License](https://img.shields.io/badge/License-A%20definir-lightgrey.svg)](#)
[![Target](https://img.shields.io/badge/Target-Void%20Linux%20x86__64%20glibc-green.svg)](#)

> "Flavos OS 2.0 é um Cloud OS headless baseado em Void Linux, projetado para transformar uma VPS em um ambiente privado, controlável por API, painel web e automações inteligentes."

---

## 📌 Visão Geral & Objetivo

O **Flavos OS 2.0** é o renascimento do descontinuado *Flavos OS 0.1 Preview*. Nesta nova encarnação, o projeto abandona a proposta de um Desktop OS tradicional para focar em uma solução de **Cloud OS Headless**. 

O objetivo é transformar uma VPS Linux comum em um servidor de infraestrutura privada altamente controlável, oferecendo telemetria, logs de auditoria, API REST de gerenciamento de serviços e comunicação em tempo real via WebSockets. Ele age como uma camada de gerenciamento unificada diretamente sobre o sistema operacional hospedeiro.

---

## 🛠️ Stack Planejada

- **Sistema Base:** [Void Linux x86_64 (glibc)](https://voidlinux.org/)
- **Sistema de Init:** `runit`
- **Gerenciador de Pacotes:** `xbps`
- **Agent Core:** Go / Golang (sem dependências externas pesadas, focado em performance e segurança)
- **Web Console (Dashboard):** React + Vite + TailwindCSS
- **Banco de Dados local:** SQLite (para logs locais e configurações do Agent)
- **Comunicação:** API REST (HTTP/JSON) e WebSockets (para telemetria de tempo real)

---

## 🏗️ Arquitetura Resumida

A arquitetura do Flavos OS é dividida em três camadas fundamentais:

```mermaid
graph TD
    Dashboard[Flavos Web Console - React] <-->|HTTPS / WSS| Agent[Flavos Core Agent - Go]
    Agent <-->|APIs do SO / runit / xbps| VoidOS[Void Linux Host]
```

1. **Camada 1 (Host):** Void Linux com init `runit` e gerenciador `xbps`.
2. **Camada 2 (Agent):** `flavos-agent` escrito em Go que expõe a API local.
3. **Camada 3 (Console):** Painel web em React para gerenciar e visualizar a saúde de múltiplas instâncias.

Para detalhes completos da arquitetura, consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 📅 Roadmap Resumido

- **Fase 0:** Fundação do Projeto (Escopo, Estrutura, Regras de Segurança) 🟢 *[Atual]*
- **Fase 1:** Criação do Ambiente de Desenvolvimento (Void Linux + QEMU/KVM) 🟡
- **Fase 2:** Desenvolvimento do Flavos Core Agent MVP (Go, Healthcheck, endpoints iniciais) 🔴
- **Fase 3:** Integração do Agent como serviço nativo do `runit` 🔴
- **Fase 4:** Desenvolvimento do Service Manager (Start, Stop, Restart via API) 🔴
- **Fase 5:** Coleta de Logs e Auditoria (Audit Log gravado localmente) 🔴
- **Fase 6:** Autenticação e Segurança (Token de acesso estático na API) 🔴
- **Fase 7:** Desenvolvimento do Flavos Web Console MVP (Dashboard React) 🔴
- **Fase 8:** Telemetria em tempo real via WebSocket (CPU, RAM, Rede) 🔴
- **Fase 9:** Hardening e Empacotamento (.xbps ou binários estáticos) 🔴
- **Fase 10:** Lançamento da Preview 0.1 Final 🔴

Para o cronograma detalhado, consulte [docs/ROADMAP.md](docs/ROADMAP.md).

---

## 🔒 Aviso de Segurança Importante

Como o **Flavos OS 2.0** expõe controles do sistema operacional hospedeiro por meio de uma API, a segurança é nossa prioridade máxima.
- **Sem Terminal Livre:** O MVP não permite a execução de comandos shell arbitrários.
- **Whitelist de Serviços:** Apenas serviços pré-configurados podem ser manipulados (iniciados/parados).
- **Sem Instalador de Pacotes Remoto:** Instalações de pacotes via API estão desabilitadas por padrão no MVP para mitigar riscos de Remote Code Execution (RCE).
- **Autenticação:** Toda requisição à API exige um token criptograficamente seguro fornecido no Header.

Consulte [docs/SECURITY.md](docs/SECURITY.md) para entender as diretrizes de segurança aplicadas ao desenvolvimento.

---

## 📝 Licença
Licença comercial/open-source **a definir**.
Todos os direitos reservados à **Flavos Company**.
