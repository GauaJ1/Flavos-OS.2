# Referência da API — Flavos OS 2.0

Esta é a documentação inicial da API HTTP REST e do WebSocket do **Flavos Core Agent**. 
A API escuta por padrão na porta `8087` no endereço local (`127.0.0.1`) durante o desenvolvimento.

Todas as requisições, exceto `/api/v1/health`, exigem autenticação via header `X-Flavos-Token`.

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
| **GET** | `/api/v1/logs` | Lista os serviços da whitelist que possuem logs mapeados | Sim |
| **GET** | `/api/v1/logs/{service}` | Retorna as últimas linhas do log do serviço | Sim |
| **GET** | `/api/v1/audit` | Retorna o registro de auditoria do sistema em formato JSON | Sim |
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
Lista os serviços na whitelist (`/etc/flavos/agent.toml`) com status real do runit e ações permitidas por serviço.

**Requer:** `X-Flavos-Token: <token>`

- **Resposta (200 OK) — exemplo real da VM:**
  ```json
  {
    "services": [
      {
        "name": "nginx",
        "status": "running",
        "raw": "run: /var/service/nginx: (pid 718) 120s",
        "allowed_actions": ["status", "start", "stop", "restart"]
      },
      {
        "name": "sshd",
        "status": "running",
        "raw": "run: /var/service/sshd: (pid 494) 300s",
        "allowed_actions": ["status", "restart"]
      },
      {
        "name": "flavos-agent",
        "status": "running",
        "raw": "run: /var/service/flavos-agent: (pid 666) 90s",
        "allowed_actions": ["status"]
      }
    ]
  }
  ```

---

### 5. `POST /api/v1/services/{name}/start|stop|restart`
Controla serviços gerenciados pelo `runit`. O nome deve estar na whitelist e a ação deve ser permitida para aquele serviço.

**Requer:** `X-Flavos-Token: <token>`  
**Sem corpo de payload.**

- **Resposta (200 OK):**
  ```json
  {
    "service": "nginx",
    "action": "restart",
    "status": "success",
    "message": "service action executed",
    "output": "ok: run: /var/service/nginx: (pid 697) 0s",
    "timestamp": "2026-06-27T00:19:24Z"
  }
  ```

- **Erros possíveis:**

| Código | Corpo | Causa |
|---|---|---|
| `400` | `{"error":"invalid_service_name"}` | Nome contém caracteres inválidos |
| `400` | `{"error":"invalid_action"}` | Ação não reconhecida |
| `401` | `{"error":"unauthorized"}` | Token ausente ou inválido |
| `403` | `{"error":"service_not_allowed"}` | Serviço fora da whitelist |
| `403` | `{"error":"action_not_allowed"}` | Ação não permitida para esse serviço |
| `405` | `{"error":"method_not_allowed"}` | Método HTTP incorreto (não é POST) |
| `500` | `{"error":"internal_error"}` | Falha ao executar o `sv` |

---


### 6. `GET /api/v1/logs`
Retorna a lista de serviços permitidos pela whitelist que possuem arquivos de logs fisicamente mapeados e acessíveis no sistema.

**Requer:** `X-Flavos-Token: <token>`

- **Resposta (200 OK):**
  ```json
  {
    "services": ["nginx", "sshd", "flavos-agent"]
  }
  ```

---

### 6.1 `GET /api/v1/logs/{service}`
Recupera as últimas linhas de log de um serviço específico. Os caminhos físicos de logs são mapeados de forma estrita no backend.

**Requer:** `X-Flavos-Token: <token>`

- **Parâmetros de Query:**
  - `lines` (opcional, padrão: `50`): Quantidade de linhas para retornar (mínimo `1`, máximo `200`).

- **Resposta (200 OK):**
  ```json
  {
    "lines": [
      "2026-06-27T00:50:00Z [info] Starting Flavos Core Agent...",
      "2026-06-27T00:50:05Z [info] Listening on 127.0.0.1:8087"
    ],
    "lines_returned": 2
  }
  ```

- **Erros possíveis:**
  - `400` com `{"error":"invalid_service_name"}` se o nome do serviço contiver caracteres inválidos.
  - `400` com `{"error":"invalid_lines"}` se a query parameter `lines` não for um número válido entre 1 e 200.
  - `403` com `{"error":"service_not_allowed"}` se o serviço não estiver na whitelist de serviços permitidos.
  - `404` com `{"error":"log_not_found"}` se o arquivo de log físico do serviço não estiver mapeado ou não existir no disco.

---

### 6.5 `GET /api/v1/audit`
Consulta a trilha de auditoria do sistema em formato JSON. Os eventos são registrados a cada requisição de alteração de estado ou de falha de autenticação.

**Requer:** `X-Flavos-Token: <token>`

- **Parâmetros de Query:**
  - `lines` (opcional, padrão: `50`): Quantidade de linhas para retornar (mínimo `1`, máximo `200`).

- **Resposta (200 OK):**
  ```json
  {
    "events": [
      {
        "timestamp": "2026-06-27T01:14:24Z",
        "source_ip": "127.0.0.1",
        "method": "GET",
        "path": "/api/v1/status",
        "action": "authenticate",
        "target": "",
        "result": "failed",
        "status_code": 401,
        "reason": "missing_token_header",
        "user": "anonymous"
      },
      {
        "timestamp": "2026-06-27T01:14:30Z",
        "source_ip": "127.0.0.1",
        "method": "POST",
        "path": "/api/v1/services/nginx/restart",
        "action": "restart",
        "target": "nginx",
        "result": "success",
        "status_code": 200,
        "user": "static-token"
      }
    ],
    "lines_returned": 2
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
