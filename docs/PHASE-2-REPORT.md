# Flavos OS 2.0 — Phase 2 Report

**Fase:** 2 — Flavos Core Agent MVP  
**Status:** Concluída  
**Host:** Linux Mint XFCE  
**Projeto:** /home/gaua/Imagens/FlavosOS-2  
**VM:** flavos-os-2-void (IP: 192.168.122.148)  
**Go version (host):** go1.26.4  
**Go version (VM):** go1.26.4  

---

## 1. Objetivo

Criar o primeiro MVP funcional do **Flavos Core Agent** em Go, expondo três endpoints REST que coletam informações reais da máquina via `/proc` e syscalls do sistema operacional.

---

## 2. Estrutura criada

```txt
agent/
├── bin/
│   ├── flavos-agent          (binário do host)
│   └── flavos-agent-linux    (binário cross-compiled para a VM)
├── cmd/
│   └── flavos-agent/
│       └── main.go           (entrypoint)
├── internal/
│   ├── api/
│   │   ├── handlers.go       (handlers HTTP dos endpoints)
│   │   └── router.go         (roteamento das URLs)
│   ├── metrics/
│   │   └── metrics.go        (coleta e estruturação de métricas)
│   └── system/
│       └── system.go         (leitura real de /proc e syscalls)
├── go.mod                    (módulo: flavos-os-2/agent)
└── go.sum
```

---

## 3. Endpoints implementados

| Método | Endpoint            | Descrição               |
|--------|---------------------|-------------------------|
| GET    | /api/v1/health      | Health check do Agent   |
| GET    | /api/v1/status      | Status do sistema OS    |
| GET    | /api/v1/metrics     | Métricas CPU/Mem/Disco  |

Bind: `127.0.0.1:8087` (somente loopback, sem exposição pública).

---

## 4. Respostas JSON reais obtidas (VM: flavos-void-lab)

### GET /api/v1/health

```json
{
  "status": "ok",
  "service": "flavos-agent",
  "version": "0.1.0"
}
```

### GET /api/v1/status

```json
{
  "os": "Flavos OS 2.0",
  "base": "Void Linux",
  "version": "Preview 0.1",
  "hostname": "flavos-void-lab",
  "uptime": "0h 27m 39s",
  "agent": "online"
}
```

### GET /api/v1/metrics

```json
{
  "cpu": {
    "load_average": "0.00 0.00 0.00"
  },
  "memory": {
    "total_kb": 2017836,
    "available_kb": 1741768,
    "used_kb": 276068
  },
  "disk": {
    "filesystem": "/",
    "total_kb": 20465232,
    "used_kb": 2584536,
    "available_kb": 16815788,
    "usage_percent": 12.628911316519648
  }
}
```

---

## 5. Build

```bash
# Build local (host x86_64)
cd agent
/usr/local/go/bin/go build -o bin/flavos-agent ./cmd/flavos-agent

# Cross-compile para VM (linux/amd64)
GOOS=linux GOARCH=amd64 /usr/local/go/bin/go build -o bin/flavos-agent-linux ./cmd/flavos-agent
```

Resultado: **BUILD OK** (sem erros de compilação).

---

## 6. Testes locais (host Linux Mint XFCE)

```bash
# Iniciado com:
nohup ./agent/bin/flavos-agent > /tmp/flavos-agent.log 2>&1 &

# Testes com curl:
curl -s http://127.0.0.1:8087/api/v1/health   # OK
curl -s http://127.0.0.1:8087/api/v1/status   # OK
curl -s http://127.0.0.1:8087/api/v1/metrics  # OK
```

---

## 7. Teste na VM Void Linux (flavos-void-lab)

```bash
# Binário copiado via SCP:
scp -i /home/gaua/.ssh/id_rsa ./agent/bin/flavos-agent-linux kaua@192.168.122.148:/opt/flavos/flavos-agent

# Iniciado remotamente:
nohup /opt/flavos/flavos-agent > /tmp/flavos-agent.log 2>&1 &

# Testado via SSH:
ssh kaua@192.168.122.148 "curl -s http://127.0.0.1:8087/api/v1/health"   # OK
ssh kaua@192.168.122.148 "curl -s http://127.0.0.1:8087/api/v1/status"   # OK
ssh kaua@192.168.122.148 "curl -s http://127.0.0.1:8087/api/v1/metrics"  # OK
```

Hostname retornado: `flavos-void-lab` (dado real da VM).
Uptime retornado: dado real de `/proc/uptime` na VM.
Métricas de memória e disco: dados reais do Void Linux instalado em `/dev/sda1`.

---

## 8. Problemas encontrados

* **Go não estava no PATH do shell não-interativo do host**: O binário Go estava em `/usr/local/go/bin/go` e não acessível como `go` diretamente. Solução: uso do caminho completo nos comandos de build.
* **Permissão negada no SCP para /opt/flavos**: O diretório `/opt/flavos` foi criado pelo root e o usuário `kaua` não tinha permissão de escrita. Solução: `sudo chmod 777 /opt/flavos` temporariamente para o upload, depois restaurado para `755`.

---

## 9. Fontes de dados utilizadas

| Dado             | Fonte                   |
|------------------|-------------------------|
| Hostname         | `os.Hostname()`         |
| Uptime           | `/proc/uptime`          |
| Load average     | `/proc/loadavg`         |
| Memória          | `/proc/meminfo`         |
| Disco            | `syscall.Statfs("/")`  |

---

## 10. Checklist final

* [x] Estrutura Go criada em `agent/`
* [x] `go.mod` criado
* [x] `main.go` criado
* [x] router criado
* [x] handlers criados
* [x] coleta de hostname funcionando
* [x] coleta de uptime funcionando
* [x] coleta de load average funcionando
* [x] coleta de memória funcionando
* [x] coleta de disco funcionando
* [x] `/api/v1/health` funcionando
* [x] `/api/v1/status` funcionando
* [x] `/api/v1/metrics` funcionando
* [x] build gerando `bin/flavos-agent`
* [x] curl local funcionando
* [x] teste na VM funcionando
* [x] `docs/PHASE-2-REPORT.md` criado
* [x] documentação atualizada
* [x] commit criado
* [x] push feito para GitHub

---

## 11. Próximos passos para Fase 3

* Instalar o Agent como serviço **runit** no Void Linux (`/etc/sv/flavos-agent`);
* Adicionar autenticação por API key nos headers HTTP;
* Implementar endpoints de controle de serviços (`GET/POST /api/v1/services`);
* Adicionar leitura de logs via `GET /api/v1/logs`;
* Configurar o Agent para iniciar automaticamente no boot;
* Implementar `GET /api/v1/processes` para listar processos em execução.
