# Guia de Instalação e Preparação — Flavos OS 2.0

> [!IMPORTANT]
> **Aviso de Instalação:** A instalação real e configuração do ambiente serão realizadas na **Fase 1 — Ambiente Void Linux**. Este documento serve como referência de planejamento e especificação de diretórios e dependências.

---

## 💻 Ambiente Alvo Recomendado

- **Sistema Operacional:** Void Linux x86_64 (glibc).
- **Ambiente de Teste:** Recomendado executar em uma Máquina Virtual (VM) local usando **QEMU/KVM** (com Virt-Manager) no Linux Mint XFCE para simular uma VPS de produção.

---

## 📂 Diretórios do Sistema Planejados

Quando o instalador do Flavos OS for executado, os seguintes diretórios e arquivos serão provisionados no host Linux:

| Caminho | Propósito | Permissões Sugeridas |
| :--- | :--- | :--- |
| `/usr/local/bin/flavos-agent` | Binário executável do Flavos Core Agent. | `755 (root:root)` |
| `/etc/flavos/` | Configurações gerais e arquivos TOML (`agent.toml`). | `700 (root:root)` |
| `/var/log/flavos/` | Logs operacionais do Agent e base de auditoria (`audit.db`). | `750 (flavos:flavos)` |
| `/opt/flavos/` | Diretório de recursos e build estática do Web Console (se servido localmente). | `755 (root:root)` |
| `/etc/sv/flavos-agent/` | Diretório de serviço do `runit` para inicialização automática. | `755 (root:root)` |

---

## 📦 Dependências e Pacotes Necessários

Para preparar a VM Void Linux na Fase 1, será necessária a instalação dos seguintes pacotes via `xbps-install`:

### Ferramentas de Desenvolvimento e Build
- **`go`**: Linguagem de programação para compilação do Agent.
- **`git`**: Para clonagem do repositório no host.

### Utilitários de Rede e Sistema
- **`curl` / `wget`**: Para testes e downloads locais da API.
- **`nano`**: Editor de texto amigável para manipulação de arquivos de configuração.
- **`htop`**: Monitor de processos do sistema (para validação cruzada de métricas).

### Servidor Web (Produção)
- **`nginx`**: Para servir a build estática do Flavos Web Console (React) e configurar o Proxy Reverso com suporte TLS/SSL.

---

## 🛠️ Exemplo de Comando de Instalação de Dependências (Void Linux)

```bash
# Atualizar a base de dados do xbps
sudo xbps-install -S

# Instalar os pacotes necessários
sudo xbps-install -y go git curl wget nano htop nginx
```
