# Flavos Core Agent

O `flavos-agent` é o núcleo do Flavos OS 2.0. É um servidor HTTP leve escrito em Go que expõe uma API REST para monitoramento e controle do sistema, acessível apenas via loopback (`127.0.0.1:8087`).

## Estrutura

```txt
agent/
├── cmd/
│   └── flavos-agent/
│       └── main.go              # Entrypoint — inicializa o servidor HTTP
├── internal/
│   ├── api/
│   │   ├── handlers.go          # Handlers dos endpoints REST
│   │   └── router.go            # Roteamento das URLs
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

## Autenticação

Os endpoints `/api/v1/status` e `/api/v1/metrics` exigem autenticação via header HTTP customizado:

```http
X-Flavos-Token: <seu_token_aqui>
```

O token é carregado na ordem:
1. Variável de ambiente `FLAVOS_TOKEN` (desenvolvimento)
2. Arquivo `/etc/flavos/token` (produção/VM)

O arquivo de token deve ter permissões `600` e dono `root:root`.

Requisições sem token ou com token inválido recebem:
```json
{"error": "unauthorized"}
```

O endpoint `/api/v1/health` é **público** e não requer autenticação.

## Endpoints disponíveis (v0.4.0 — Fase 4)

| Método | Endpoint            | Descrição              | Auth? |
|--------|---------------------|------------------------|-------|
| GET    | /api/v1/health      | Health check do Agent  | Não   |
| GET    | /api/v1/status      | Status do OS e Agent   | Sim   |
| GET    | /api/v1/metrics     | Métricas CPU/Mem/Disco | Sim   |

## Segurança

- Bind apenas em `[IP_ADDRESS]` — sem exposição pública.
- Token lido de arquivo com `strings.TrimSpace` para eliminar `\n` indesejado.
- Comparação de token via `crypto/subtle.ConstantTimeCompare` + `sha256.Sum256` — resistente a timing attacks.
- Token jamais registrado em logs, código-fonte ou relatórios.
- Erros de autenticação retornam `{"error": "unauthorized"}` sem detalhes internos.

## Fase atual

**Fase 4 — Autenticação Inicial** concluída.  
A Fase 5 adicionará controle de serviços runit via API autenticada.