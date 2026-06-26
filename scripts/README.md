# Scripts do Sistema

Esta pasta será utilizada para armazenar scripts utilitários de automação e gerenciamento do sistema.

---

## 📂 Finalidade dos Scripts Planejados

1. **Setup de Ambiente e Instalação (`install.sh`):**
   - Script automatizado em bash para executar na VM Void Linux. Ele cuidará da criação de usuários, diretórios do sistema (`/etc/flavos`, `/var/log/flavos`), instalação de dependências via `xbps-install` e configuração inicial.
   
2. **Configuração de Serviços (`setup-runit.sh`):**
   - Script para linkar o serviço do Agent no diretório `/var/service/` do `runit` e definir a ordem de boot apropriada.

3. **Hardening de Sistema (`hardening.sh`):**
   - Configurações automáticas de firewall (`iptables` / `nftables`), desabilitação de SSH root, ajuste de limites de descritores de arquivo, e criação do arquivo do sudoers de forma segura para o usuário do Agent (`flavos`).

---

## ⚠️ Estado Atual
Nenhum script foi implementado ainda nesta fase de fundação. Os scripts serão escritos a partir da **Fase 1 — Ambiente Void Linux** e da **Fase 9 — Hardening e Empacotamento**.
