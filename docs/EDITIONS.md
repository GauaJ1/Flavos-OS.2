# Edições do Flavos OS 2.0

## 1. Visão Geral

O Flavos OS 2.0 não é apenas uma instalação do Void Linux com algumas customizações. Ele é uma camada própria construída sobre Void Linux, composta pelo Flavos OS Core e por perfis de instalação chamados edições.

Todas as edições compartilham o mesmo núcleo técnico: Flavos OS Core.
O que muda entre as edições é o perfil de uso, os pacotes instalados, a presença ou ausência de interface gráfica e a experiência visual.

---

## 2. Flavos OS Core

O **Flavos OS Core** é a fundação obrigatória que deve estar presente em todas as edições do sistema operacional. Ele inclui:

* Void Linux Base
* runit
* xbps
* OpenSSH
* Flavos Core Agent (executando como serviço)
* Configuração do Agent em `/etc/flavos/agent.toml`
* Token de autenticação em `/etc/flavos/token`
* API REST local (`127.0.0.1:8087`)
* Autenticação via header `X-Flavos-Token` com comparação segura
* Service Manager (controle seguro e restrito a whitelist)
* Telemetria (coleta de CPU, RAM, disco e uptime)
* Logs e auditoria (armazenamento local)
* Integração futura com o Web Console

O Core garante a estabilidade de controle, a segurança e a padronização das APIs básicas de comunicação do Flavos OS 2.0.

---

## 3. Flavos OS 2.0 Cloud Edition

A Cloud Edition é o perfil headless/server do Flavos OS 2.0.
Ela é voltada para VPS, servidores, laboratório de infraestrutura e ambientes cloud.

### Características
* Sem interface gráfica (headless)
* Consumo de recursos extremamente baixo
* Acesso remoto via SSH
* Gerenciamento de daemons via runit
* Proxy reverso e servidor estático via nginx
* Flavos Core Agent ativo por padrão
* API local acessível de forma segura
* Web Console remoto (ou sob túnel seguro)
* Foco em servidor/VPS

**Status atual:** Edição principal em desenvolvimento (foco atual do projeto).

---

## 4. Flavos OS 2.0 Desktop Edition

A Desktop Edition é o perfil visual do Flavos OS 2.0 para uso pessoal em computadores comuns.
Ela mantém o Flavos OS Core, mas adiciona um ambiente gráfico moderno, aplicativos de uso diário e identidade visual própria.

### Ambiente Gráfico
* **KDE Plasma** ou **GNOME**
* *Recomendação inicial:* KDE Plasma como primeira opção de protótipo por ser mais customizável e flexível para customizações de tema.

### Características
* Interface gráfica completa
* Tema visual Flavos (cores, ícones e comportamento)
* Wallpaper oficial do Flavos OS
* Login Manager (display manager) customizado com identidade visual do projeto
* Terminal customizado pré-configurado
* Atalho integrado e acesso fácil para o Flavos Web Console
* Flavos Core Agent rodando localmente no host para permitir automações locais
* API local de controle disponível
* Experiência voltada para uso pessoal e computação de desktop

**Status atual:** Protótipo funcional validado (Fase D1 — Desktop Edition Prototype).

---

## 5. Flavos OS 2.0 Legacy Edition

A Legacy Edition é o perfil leve do Flavos OS 2.0 para computadores antigos ou com poucos recursos.
Ela também mantém o Flavos OS Core, mas usa um ambiente gráfico leve e menos efeitos visuais.

### Ambiente Gráfico
* **XFCE**, **LXQt** ou **Openbox**
* *Recomendação inicial:* XFCE como primeira opção por equilibrar leveza, usabilidade e facilidade de customização.

### Características
* Consumo de memória e processamento extremamente baixo
* Visual Flavos simplificado, eliminando efeitos pesados e transparências complexas
* Seleção de aplicativos extremamente leves
* Ideal para computadores antigos (ex: arquitetura LGA 775, máquinas de baixo desempenho)
* Flavos Core Agent rodando localmente
* Web Console local para administração do dispositivo

**Status atual:** Planejada para depois do amadurecimento da Cloud Edition.

---

## 6. Tabela Comparativa

| Item | Cloud Edition | Desktop Edition | Legacy Edition |
|---|---|---|---|
| Base | Void Linux | Void Linux | Void Linux |
| Flavos OS Core | Sim | Sim | Sim |
| Interface gráfica | Não | Sim | Sim |
| Ambiente visual | Headless | KDE/GNOME | XFCE/LXQt |
| Uso principal | VPS/servidor | Uso pessoal | PC antigo |
| Consumo | Muito baixo | Médio/alto | Baixo |
| Web Console | Sim | Sim | Sim |
| Agent local | Sim | Sim | Sim |
| Status | Em desenvolvimento | Protótipo validado | Planejada |

---

## 7. Regra Principal de Arquitetura

> [!IMPORTANT]
> **Regra principal:** Nenhuma edição deve duplicar o Flavos Core Agent.
> 
> O Agent, a API, a autenticação, o Service Manager, os logs e o Web Console devem ser compartilhados entre todas as edições.
> 
> As edições alteram apenas o perfil de instalação, a interface gráfica, a seleção de pacotes adicionais e a identidade visual.
