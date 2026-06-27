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

## 🏷️ Perfis de Instalação por Edição

O Flavos OS 2.0 utiliza perfis de pacotes segmentados para cada edição do sistema operacional, todos herdando a base de pacotes do núcleo (Flavos OS Core).

### 1. Flavos OS Core (Base Comum)
Todos os sistemas baseados em Flavos OS devem possuir estes pacotes instalados por padrão para garantir o funcionamento do núcleo do sistema:
* **Pacotes do Sistema:** `go` (para desenvolvimento/compilação), `git`, `curl`, `wget`, `nano`, `htop`.
* **Serviços Básicos:** `runit` (nativo do Void), `socklog-void` (gerenciamento de syslog), `dhcpcd` (cliente DHCP de rede).

### 2. Cloud Edition (Perfil Headless/VPS)
Adiciona serviços de rede, proxy e servidores web para controle remoto e automação baseada na web:
* **Servidor Web & Proxy:** `nginx` (para proxy reverso da API e hospedagem do Console Web).
* **Segurança:** `ufw` ou `iptables` (para regras de firewall do servidor).
* **Comando de instalação:**
  ```bash
  sudo xbps-install -y go git curl wget nano htop nginx ufw
  ```

### 3. Desktop Edition (Perfil Workstation)
Instala uma interface gráfica de usuário completa e moderna, juntamente com utilitários de sistema e suporte a desktops pessoais:
* **Display Server & Login Manager:** `xorg-server`, `lightdm`, `lightdm-gtk3-greeter` (gerenciador de login).
* **Interface Gráfica (DE):** `plasma-desktop` (KDE Plasma) ou `gnome` / `gnome-shell`.
* **Navegador Web:** `firefox` (para acesso local ao Web Console e uso pessoal).
* **Utilitários:** `kitty` ou `konsole` (emuladores de terminal modernos), `dbus`, `elogind` (gestão de assento e energia).
* **Comando de instalação (KDE Plasma):**
  ```bash
  sudo xbps-install -y go git curl wget nano htop xorg-server lightdm lightdm-gtk3-greeter plasma-desktop dbus elogind firefox konsole
  ```

### 4. Legacy Edition (Perfil Lightweight/Retro)
Projetado para hardware antigo, maximizando o desempenho por meio de uma interface gráfica extremamente leve:
* **Display Server & Login Manager:** `xorg-server`, `slim` ou `lightdm`.
* **Interface Gráfica (Leve):** `xfce4` (ou `lxqt`, ou gerenciadores de janela puros como `openbox`).
* **Navegador Web Leve:** `netsurf` ou `midori`.
* **Utilitários:** `dbus`, `elogind`, `xfce4-terminal`.
* **Comando de instalação (XFCE):**
  ```bash
  sudo xbps-install -y go git curl wget nano htop xorg-server lightdm xfce4 xfce4-terminal dbus elogind midori
  ```
