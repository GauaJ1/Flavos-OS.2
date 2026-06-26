# Flavos OS 2.0 — Phase 1 Report

**Fase:** 1 — Ambiente Void Linux  
**Status:** Concluída  
**Host:** Linux Mint XFCE  
**Projeto:** /home/gaua/Imagens/FlavosOS-2  
**VM files:** /home/gaua/VMs/FlavosOS-2  
**Guest OS:** Void Linux x86_64 glibc  
**VM name:** flavos-os-2-void  

## 1. Objetivo

Preparar uma VM Void Linux limpa para servir como laboratório real do Flavos OS 2.0.

## 2. Estrutura usada

Projeto:

```txt
/home/gaua/Imagens/FlavosOS-2
```

Arquivos da VM:

```txt
/home/gaua/VMs/FlavosOS-2
```

## 3. Recursos da VM

* CPU: 2 cores
* RAM: 2048 MB
* Disco: 20 GB qcow2
* Rede: NAT padrão (default network)
* Firmware: BIOS/SeaBIOS
* ISO usada: void-live-x86_64-20250202-base.iso
* Hostname: `flavos-void-lab`
* Root filesystem: `/dev/sda1` montado em `/` (ext4)

## 4. Pacotes instalados no host

* qemu-kvm (instalado e ativo)
* libvirt-daemon-system (instalado e ativo)
* libvirt-clients (instalado e ativo)
* bridge-utils (instalado)
* virt-manager (instalado)
* virtinst (instalado)

## 5. Pacotes instalados na VM

* go (versão go1.26.4 linux/amd64)
* git (versão 2.54.0)
* nginx (versão nginx/1.30.3)
* curl (instalado e validado)
* wget (instalado e validado)
* nano (instalado e validado)
* htop (instalado e validado)
* openssh (instalado e validado)
* socklog-void (instalado e validado)

## 6. Diretórios criados na VM

* `/etc/flavos` (dono: `root:root`, permissão: `755`)
* `/var/log/flavos` (dono: `flavos:flavos`, permissão: `750`)
* `/opt/flavos` (dono: `root:root`, permissão: `755`)

## 7. Usuários

Usuário normal (com privilégios sudo):

```txt
kaua
```

Usuário do Agent (sistema, sem shell de login):

```txt
flavos
```

## 8. Configuração inicial

Arquivo:

```txt
/etc/flavos/agent.toml
```

Conteúdo:

```toml
[server]
host = "127.0.0.1"
port = 8087
mode = "development"

[security]
allow_shell = false
allow_package_install = false
allow_terminal = false

[services]
allowed = ["nginx", "sshd", "flavos-agent"]

[audit]
enabled = true
path = "/var/log/flavos/audit.log"
```

## 9. Rede e SSH

* Internet na VM: Validada (ping com 0% de perda para voidlinux.org)
* IP da VM: `192.168.122.148`
* SSH ativo: Sim, porta 22 em execução
* Conexão do host testada: Sim, autenticação sem senha (key-based) configurada para `kaua`

## 10. Runit

* `/etc/sv` validado: Sim, serviços existentes e ativos
* `/var/service` validado: Links simbólicos configurados
* `dhcpcd` status: run (ativo)
* `sshd` status: run (ativo)
* `nginx` status: run (ativo)

## 11. Problemas encontrados

* **Permissões no home directory**: O daemon libvirt (usuário `libvirt-qemu`) não conseguia acessar os discos localizados em `/home/gaua/VMs/` devido às permissões restritivas do diretório `/home/gaua` (`drwxr-x---`). 
  * *Solução*: Concedida permissão de travessia (pesquisa) para outros no home: `chmod o+x /home/gaua`.
* **Prioridade de regras do sudoers**: A regra passwordless do usuário `kaua` criada em `/etc/sudoers.d/kaua` estava sendo sobrescrita pelo arquivo de grupo `/etc/sudoers.d/wheel` (`%wheel ALL=(ALL:ALL) ALL`), pois ele é carregado por último em ordem alfabética.
  * *Solução*: Renomeado o arquivo `/etc/sudoers.d/kaua` para `/etc/sudoers.d/zz-kaua` para garantir o carregamento posterior e a validação do `NOPASSWD`.

## 12. Checklist real

* [x] Repositório usado: `/home/gaua/Imagens/FlavosOS-2`
* [x] Pasta de VM criada: `/home/gaua/VMs/FlavosOS-2`
* [x] ISO salva fora do repositório
* [x] QEMU/KVM instalado
* [x] virt-manager instalado
* [x] libvirt ativo
* [x] Usuário adicionado aos grupos `libvirt` e `kvm`
* [x] VM criada (`flavos-os-2-void`)
* [x] Void Linux x86_64 glibc instalado
* [x] Internet funcionando na VM
* [x] SSH configurado ou validado
* [x] Go instalado na VM
* [x] Git instalado na VM
* [x] Diretórios do Flavos criados
* [x] Usuário `flavos` criado
* [x] `/etc/flavos/agent.toml` criado
* [x] Permissões aplicadas
* [x] `runit` validado

## 13. Próxima fase

Fase 2 — Flavos Core Agent MVP.
