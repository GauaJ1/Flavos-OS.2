# Relatório da Fase 6 — Logs & Auditoria (Flavos Core Agent)

Este relatório documenta a conclusão e validação da **Fase 6 — Logs & Auditoria** do projeto **Flavos OS 2.0**.

---

## 📋 Objetivos Concluídos

1. **Trilha de Auditoria Inicial (Audit Log):**
   - Criação do pacote `agent/internal/audit` com escrita segura concorrente via `sync.Mutex`.
   - Persistência dos eventos em `/var/log/flavos/audit.log` (em produção) ou `./audit.log` (em desenvolvimento/fallback) usando o formato padronizado **JSON Lines (JSONL)**.
   - Endpoint protegido `GET /api/v1/audit` para consulta aos últimos eventos com limite configurável pelo parâmetro de query `?lines=` (entre 1 e 200, padrão 50).

2. **Leitura e Exposição de Logs do Sistema (Service Logs):**
   - Criação do pacote `agent/internal/logs` com leitura direta e eficiente via rotinas nativas do Go (sem dependência de utilitários shell externos como `tail` ou `grep`).
   - Mapeamento estrito e estático dos serviços autorizados para seus respectivos arquivos de logs físicos (`flavos-agent`, `nginx`, `sshd`).
   - Endpoint `GET /api/v1/logs` que retorna a lista de logs mapeados e permitidos para o usuário.
   - Endpoint protegido `GET /api/v1/logs/{service}` para leitura das últimas linhas do arquivo físico com suporte a `?lines=` (entre 1 e 200, padrão 50).

3. **Integração de Segurança e Auditoria:**
   - Auditoria integrada no middleware de autenticação (`RequireToken`). Tentativas falhas (sem token ou token inválido) geram eventos de auditoria automáticos com detalhes da origem (IP, método, rota, código HTTP, razão).
   - Auditoria integrada no Service Manager. Toda ação de serviço (`start`, `stop`, `restart`) gera evento correspondente com status de sucesso/falha e o respectivo motivo.
   - Proteção estrita contra Path Traversal e injeção de caracteres especiais no parâmetro do serviço na leitura dos logs.

---

## 🔒 Diretrizes de Segurança Aplicadas

Conforme as regras do projeto e as boas práticas de segurança:

- **Comparação Segura:** Tokens e acessos validados em tempo constante para evitar ataques de timing.
- **Fail-Closed:** Se as permissões impedirem a escrita do log de auditoria no ambiente de produção (`/var/log/flavos/audit.log`), o Agent falhará no boot, emitindo erro explícito, em vez de continuar rodando silenciosamente. O fallback local é ativado apenas se `FLAVOS_ENV=development`.
- **Privacidade do Token:**
  - Token gerado em `/etc/flavos/token`
  - Permissões: `600` (leitura e escrita apenas pelo proprietário)
  - Dono: `root:root`
  - *Nota: O token real de produção não foi incluído neste relatório.*

---

## 🧪 Testes de Integração Realizados

Os testes foram executados com sucesso dentro da VM Void Linux utilizando um script dedicado de testes automatizados (`agent/scripts/test_phase6.sh`).

### Cenários validados:
1. **GET /api/v1/health** (Público) ➔ HTTP 200 OK
2. **GET /api/v1/status** (Sem Token) ➔ HTTP 401 Unauthorized
3. **GET /api/v1/status** (Token Inválido) ➔ HTTP 401 Unauthorized
4. **GET /api/v1/status** (Token Válido) ➔ HTTP 200 OK
5. **GET /api/v1/audit** (Token Válido) ➔ HTTP 200 OK (retornou JSON contendo as tentativas falhas geradas nos testes anteriores)
6. **GET /api/v1/logs** (Token Válido) ➔ HTTP 200 OK (retornou `{"services":["nginx","sshd","flavos-agent"]}`)
7. **GET /api/v1/logs/nonexistent-service** ➔ HTTP 403 Forbidden (serviço não permitido na whitelist)

### Saída do Script de Teste na VM:
```txt
=== Iniciando testes de integracao do Flavos Agent ===
Testando GET /health (sem token) ✅ OK (Status: 200)
Testando GET /status (sem token) ✅ OK (Status: 401)
   Response: {"error": "unauthorized"}
Testando GET /metrics (sem token) ✅ OK (Status: 401)
   Response: {"error": "unauthorized"}
Testando GET /services (sem token) ✅ OK (Status: 401)
   Response: {"error": "unauthorized"}
Testando GET /logs (sem token) ✅ OK (Status: 401)
   Response: {"error": "unauthorized"}
Testando GET /audit (sem token) ✅ OK (Status: 401)
   Response: {"error": "unauthorized"}
Testando GET /status (com token: invalid-token-xyz) ✅ OK (Status: 401)
   Response: {"error": "unauthorized"}
Testando GET /logs (com token: invalid-token-xyz) ✅ OK (Status: 401)
   Response: {"error": "unauthorized"}
Testando GET /audit (com token: invalid-token-xyz) ✅ OK (Status: 401)
   Response: {"error": "unauthorized"}
Testando GET /status (com token: bdee5d4069...) ✅ OK (Status: 200)
Testando GET /metrics (com token: bdee5d4069...) ✅ OK (Status: 200)
Testando GET /services (com token: bdee5d4069...) ✅ OK (Status: 200)
Testando GET /audit ✅ OK
--- Conteudo do Log de Auditoria ---
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
    ...
  ],
  "lines_returned": 19
}
------------------------------------
Testando GET /logs ✅ OK
--- Conteudo da Listagem de Logs ---
{"services":["nginx","sshd","flavos-agent"]}
------------------------------------
Testando GET /logs/nonexistent-service (com token: bdee5d4069...) ✅ OK (Status: 403)
   Response: {"error":"service_not_allowed"}
=== Todos os testes do script passaram com sucesso! ===
```

---

## 📈 Próximos Passos

Com a auditoria e os logs operando perfeitamente e expostos de maneira segura, o Core Agent está pronto para ser integrado a interfaces visuais (Web Console) e a futuras implementações da Desktop e Legacy Editions, além de podermos avançar para a persistência em banco de dados SQLite local no futuro.
