# Referência da API — Flavos OS 2.0

Esta é a documentação inicial da API HTTP REST e do WebSocket do **Flavos Core Agent**. 
A API escuta por padrão na porta `8087` no endereço local (`127.0.0.1`) durante o desenvolvimento.

Todas as requisições, exceto `/api/v1/health`, exigem autenticação via Bearer Token.

---

## 🔒 Autenticação

A API utiliza autenticação via cabeçalho HTTP customizado:

```http
X-Flavos-Token: <seu_token_aqui>
```

O token é configurado na VM em `/etc/flavos/token` (permissão `600`, dono `root:root`) ou via variável de ambiente `FLAVOS_TOKEN` em desenvolvimento.

Requisições sem token ou com token inválido recebem `401 Unauthorized`:

```json
{"error": "unauthorized"}
```

---

## 🚦 Tabela Resumida de Endpoints

| Método | Endpoint | Descrição | Requer Auth |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/health` | Verifica se o Agent está online (público) | Não |
| **GET** | `/api/v1/status` | Informações básicas do Host e do Agent | Sim |
| **GET** | `/api/v1/metrics` | Métricas instantâneas de hardware (CPU/RAM/Disco) | Sim |
| **GET** | `/api/v1/services` | Lista serviços autorizados e seus estados atuais | Sim |
| **POST** | `/api/v1/services/{name}/start` | Inicia o serviço especificado (se permitido) | Sim |
| **POST** | `/api/v1/services/{name}/stop` | Para o serviço especificado (se permitido) | Sim |
| **POST** | `/api/v1/services/{name}/restart` | Reinicia o serviço especificado (se permitido) | Sim |
| **GET** | `/api/v1/logs/{service}` | Retorna as últimas linhas do log do serviço | Sim |
| **WS** | `/api/v1/telemetry` | Canal WebSocket para fluxo contínuo de métricas | Sim |

---

## 📖 Detalhes dos Endpoints

### 1. `GET /api/v1/health`
Verifica a integridade básica do Agent. Usado para Load Balancers ou scripts de monitoramento local.

- **Resposta (200 OK):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-06-25T12:00:00Z"
  }
  ```

---

### 2. `GET /api/v1/status`
Retorna informações gerais do sistema operacional base, versão do Agent e tempo de atividade (uptime).

- **Resposta (200 OK):**
  ```json
  {
    "agent_version": "0.1.0-alpha",
    "os": "Void Linux",
    "kernel": "6.6.21_1",
    "arch": "x86_64",
    "hostname": "flavos-vps-01",
    "uptime_seconds": 154320,
    "init_system": "runit"
  }
  ```

---

### 3. `GET /api/v1/metrics`
Coleta estatísticas instantâneas de uso do hardware no host.

- **Resposta (200 OK):**
  ```json
  {
    "cpu": {
      "usage_percent": 12.5,
      "cores": 4
    },
    "memory": {
      "total_bytes": 8589934592,
      "used_bytes": 4294967296,
      "free_bytes": 4294967296,
      "usage_percent": 50.0
    },
    "disk": {
      "total_bytes": 53687091200,
      "used_bytes": 16106127360,
      "free_bytes": 37580963840,
      "usage_percent": 30.0
    },
    "network": {
      "bytes_recv_sec": 12450,
      "bytes_sent_sec": 8432
    },
    "timestamp": "2026-06-25T12:00:05Z"
  }
  ```

---

### 4. `GET /api/v1/services`
Lista os serviços monitorados que foram permitidos na whitelist de configuração do Agent.

- **Resposta (200 OK):**
  ```json
  {
    "services": [
      {
        "name": "nginx",
        "status": "running",
        "pid": 1024,
        "uptime_seconds": 86400,
        "allowed": true
      },
      {
        "name": "sshd",
        "status": "running",
        "pid": 982,
        "uptime_seconds": 154300,
        "allowed": true
      },
      {
        "name": "flavos-agent",
        "status": "running",
        "pid": 2500,
        "uptime_seconds": 1200,
        "allowed": true
      }
    ]
  }
  ```

---

### 5. `POST /api/v1/services/{name}/start` | `stop` | `restart`
Controla a execução dos serviços gerenciados pelo `runit`.
O parâmetro `{name}` deve constar na whitelist, sob o risco de retornar erro HTTP 403 Forbidden.

- **Exemplo de Requisição (POST /api/v1/services/nginx/restart):**
  *Sem corpo de payload.*

- **Resposta (200 OK):**
  ```json
  {
    "service": "nginx",
    "action": "restart",
    "status": "success",
    "message": "Service nginx restarted successfully",
    "timestamp": "2026-06-25T12:01:30Z"
  }
  ```

- **Resposta de Erro (403 Forbidden - Serviço Não Permitido):**
  ```json
  {
    "error": "Forbidden",
    "message": "Service 'postgresql' is not in the whitelist of allowed services",
    "timestamp": "2026-06-25T12:02:00Z"
  }
  ```

---

### 6. `GET /api/v1/logs/{service}`
Recupera as últimas linhas de logs do serviço do runit (utilizando o diretório padrão `/var/log/sv/{service}/current` ou similar).

- **Parâmetros de Query:**
  - `lines` (opcional, padrão: `50`): Quantidade de linhas para retornar.

- **Resposta (200 OK):**
  ```json
  {
    "service": "nginx",
    "lines_returned": 3,
    "logs": [
      "2026-06-25 11:59:00 [info] 127.0.0.1 - GET /index.html HTTP/1.1 200",
      "2026-06-25 12:00:00 [info] 127.0.0.1 - GET /api/v1/health HTTP/1.1 200",
      "2026-06-25 12:01:30 [notice] Received signal 1 (SIGHUP) - reloading configuration"
    ]
  }
  ```

---

### 7. `WS /api/v1/telemetry`
Inicia um fluxo bidirecional de mensagens em tempo real. O dashboard envia uma mensagem inicial para assinar as métricas e o Agent responde a cada 1 segundo com a carga do sistema.

- **Payload recebido pelo Cliente no Estabelecimento:**
  *Requer passagem do token como query param (ex: `ws://127.0.0.1:8087/api/v1/telemetry?token=seu_token`) ou via cabeçalho dependendo do cliente.*

- **Payload enviado pelo Agent periodicamente (1s):**
  ```json
  {
    "type": "telemetry_update",
    "data": {
      "cpu_percent": 15.2,
      "memory_percent": 48.7,
      "net_in_bytes": 1024,
      "net_out_bytes": 512
    },
    "timestamp": "2026-06-25T12:03:01Z"
  }
  ```
