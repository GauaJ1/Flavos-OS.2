# Flavos Core Agent

Esta pasta conterá o código-fonte do **Flavos Core Agent**, desenvolvido em **Go (Golang)**. O Agent é executado como um daemon de sistema no host Void Linux, sendo responsável pelo monitoramento e controle local seguro de serviços.

---

## 🎯 Objetivo do Agent

O Agent funciona como uma ponte segura e eficiente entre a interface web e as entranhas do sistema operacional Void Linux. Ele fornece telemetria em tempo real e expõe chamadas para gerenciamento de serviços sem a necessidade de expor credenciais root via SSH tradicional na rede.

---

## 🚦 Endpoints Planejados

- **Saúde e Status:** `/api/v1/health`, `/api/v1/status`
- **Métricas:** `/api/v1/metrics`, `/api/v1/telemetry` (WebSocket)
- **Gerenciamento de Serviços:** `/api/v1/services` (Listagem, Start, Stop, Restart)
- **Logs:** `/api/v1/logs/{service}`

Para detalhes dos payloads, consulte a [Documentação da API](../docs/API.md).

---

## 📋 Escopo do MVP (Preview 0.1)

### O que entra no MVP:
- **Servidor HTTP em Go** utilizando roteador nativo ou biblioteca minimalista (ex: `chi`).
- **Middleware de Autenticação** baseado em Token estático via Header Bearer.
- **Whitelist de Serviços** carregada via arquivo de configuração TOML.
- **Execução controlada** dos utilitários de serviço do `runit` (`sv start`, `sv stop`, `sv restart`).
- **Coleta de Métricas instantâneas** de CPU, Memória e Disco direto de arquivos do kernel (`/proc/stat`, `/proc/meminfo`, etc.).
- **Log de Auditoria local** gravado via banco SQLite.

### O que NÃO entra no MVP (Pós-MVP):
- **Terminal interativo** via navegador (Web SSH).
- **Gerenciamento livre de processos** (matar qualquer PID).
- **Instalação, atualização ou remoção** remota de pacotes do sistema (`xbps-install`).
- **Gerenciamento de usuários** ou alteração de senhas do sistema hospedeiro.
- **Configuração de firewall** ou de adaptadores de rede.
