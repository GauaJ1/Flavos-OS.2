# Flavos Core Agent

O `flavos-agent` é o núcleo do Flavos OS 2.0. É um servidor HTTP leve escrito em Go que expõe uma API REST para monitoramento e controle do sistema, acessível apenas via loopback (`127.0.0.1:8087`).

## Estrutura

```txt
agent/
├── cmd/
│   └── flavos-agent/
│       └── main.go           # Entrypoint — inicializa o servidor HTTP
├── internal/
│   ├── api/
│   │   ├── handlers.go       # Handlers dos endpoints REST
│   │   └── router.go         # Roteamento das URLs
│   ├── metrics/
│   │   └── metrics.go        # Coleta de métricas do sistema
│   └── system/
│       └── system.go         # Leitura de /proc e syscalls
├── bin/
│   └── flavos-agent          # Binário compilado (gerado pelo build)
├── go.mod
└── go.sum
```

## Build

```bash
cd agent
/usr/local/go/bin/go build -o bin/flavos-agent ./cmd/flavos-agent
```

Cross-compile para Void Linux x86_64:

```bash
GOOS=linux GOARCH=amd64 /usr/local/go/bin/go build -o bin/flavos-agent-linux ./cmd/flavos-agent
```

## Execução

```bash
./bin/flavos-agent
```

O servidor inicia em `127.0.0.1:8087`.

## Endpoints disponíveis (v0.1.0)

| Método | Endpoint            | Descrição              |
|--------|---------------------|------------------------|
| GET    | /api/v1/health      | Health check do Agent  |
| GET    | /api/v1/status      | Status do OS e Agent   |
| GET    | /api/v1/metrics     | Métricas CPU/Mem/Disco |

## Segurança

- Bind apenas em `127.0.0.1` — sem exposição pública.
- Autenticação será implementada na Fase 3.
- Nenhum comando administrativo é executado nesta versão.

## Fase atual

**MVP — Fase 2** (monitoramento somente leitura).  
A Fase 3 adicionará autenticação, controle de serviços e integração com runit.
