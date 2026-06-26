# Registro de Alterações (Changelog) — Flavos OS 2.0

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo seguindo as diretrizes do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
