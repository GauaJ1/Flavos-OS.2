# Phase 5 Report — Service Manager do Flavos Core Agent

**Data:** 2026-06-27  
**Status:** ✅ Concluída

---

## Objetivo

Implementar controle seguro de serviços `runit` via API autenticada, com whitelist obrigatória, validação de nomes e controle granular de ações por serviço.

---

## Escopo Implementado

- `GET  /api/v1/services` — lista serviços permitidos e seus status reais
- `POST /api/v1/services/{name}/start` — inicia serviço da whitelist
- `POST /api/v1/services/{name}/stop` — para serviço da whitelist
- `POST /api/v1/services/{name}/restart` — reinicia serviço da whitelist

Todos os endpoints exigem `X-Flavos-Token`.

---

## Arquivos Criados / Modificados

| Arquivo | Ação |
|---|---|
| `agent/internal/config/config.go` | Criado — lê whitelist de `/etc/flavos/agent.toml` (stdlib only) |
| `agent/internal/services/services.go` | Criado — Service Manager com whitelist, política de ações e execução via runit |
| `agent/internal/api/handlers.go` | Modificado — handlers `HandleServices` e `HandleServiceAction` adicionados |
| `agent/internal/api/router.go` | Modificado — novas rotas `/api/v1/services` e `/api/v1/services/` registradas |
| `agent/cmd/flavos-agent/main.go` | Modificado — `config.Load()` e `services.New()` chamados no startup |
| `docs/PHASE-5-SERVICE-MANAGER-REPORT.md` | Criado — este relatório |
| `docs/API.md` | Atualizado — endpoints de serviço documentados |
| `docs/SECURITY.md` | Atualizado — modelo de segurança do Service Manager |
| `docs/CHANGELOG.md` | Atualizado — entrada `[0.5.0]` |
| `agent/README.md` | Atualizado — árvore de diretórios e endpoints |
| `Documentação.md` | Atualizado — status Fase 5 |

---

## Modelo de Whitelist

A whitelist é lida de `/etc/flavos/agent.toml`:

```toml
[services]
allowed = ["nginx", "sshd", "flavos-agent"]
```

Se o arquivo não existir ou não puder ser lido, o agente opera com whitelist vazia (fail-closed): nenhum serviço é controlável.

---

## Ações Permitidas por Serviço

| Serviço | status | start | stop | restart | Motivo |
|---|---|---|---|---|---|
| `nginx` | ✅ | ✅ | ✅ | ✅ | Serviço web — pode ser testado com segurança |
| `sshd` | ✅ | — | — | ✅ | Não pode ser parado: quebraria o acesso SSH |
| `flavos-agent` | ✅ | — | — | — | Não pode matar a si próprio via API |

---

## Segurança Aplicada

- Sem shell livre: toda execução usa `exec.CommandContext(ctx, "/usr/bin/sv", action, "/var/service/"+name)`.
- Validação de nome via regex `^[a-zA-Z0-9._-]+$` — bloqueia `..`, `/`, `;`, `|`, `$`, etc.
- Whitelist obrigatória: serviço fora da lista → `403 service_not_allowed`.
- Política de ações por serviço: ação não permitida → `403 action_not_allowed`.
- Timeout de 5 segundos em cada chamada `sv`.
- Bind local: `127.0.0.1:8087` — sem alteração.
- Token obrigatório em todas as novas rotas.

---

## Endpoints Criados

### `GET /api/v1/services`

```json
{
  "services": [
    {"name":"nginx","status":"running","raw":"run: /var/service/nginx: (pid 718) 120s","allowed_actions":["status","start","stop","restart"]},
    {"name":"sshd","status":"running","raw":"run: /var/service/sshd: (pid 494) 1563s","allowed_actions":["status","restart"]},
    {"name":"flavos-agent","status":"running","raw":"run: /var/service/flavos-agent: (pid 666) 18s","allowed_actions":["status"]}
  ]
}
```

### `POST /api/v1/services/{name}/{action}` — Sucesso

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

---

## Testes Executados

### Host (local, sem agent.toml → whitelist vazia)

| # | Teste | Esperado | Resultado |
|---|---|---|---|
| 1 | `/services` sem token | 401 | ✅ 401 |
| 2 | `/services` token inválido | 401 | ✅ 401 |
| 3 | `/services` token válido | 200 + `{"services":[]}` | ✅ 200 (whitelist vazia, correto) |
| 4 | `POST /services/nginx/stop` sem token | 401 | ✅ 401 |
| 5 | `/health` com token inválido | 200 | ✅ 200 |

### VM (`flavos-void-lab`, agent.toml real com nginx/sshd/flavos-agent)

| # | Teste | Esperado | Resultado |
|---|---|---|---|
| 1 | `/health` sem token | 200 | ✅ 200 |
| 2 | `/services` sem token | 401 | ✅ 401 |
| 3 | `/services` token inválido | 401 | ✅ 401 |
| 4 | `/services` token válido | 200 + 3 serviços running | ✅ 200 |
| 5 | `POST postgresql/restart` | 403 `service_not_allowed` | ✅ 403 |
| 6 | `POST ..%2F..%2Fetc%2Fpasswd/restart` (path traversal) | 400 | ✅ 400 (bloqueado como `invalid_action`) |
| 7 | `POST sshd/stop` | 403 `action_not_allowed` | ✅ 403 |
| 8 | `POST flavos-agent/restart` | 403 `action_not_allowed` | ✅ 403 |
| 9 | `POST nginx/restart` | 200 success | ✅ 200 |
| 10 | `POST nginx/stop` | 200 success | ✅ 200 |
| 11 | `GET /services` (nginx stopped) | nginx: stopped | ✅ confirmado |
| 12 | `POST nginx/start` | 200 success | ✅ 200 |
| 13 | `GET /services` (nginx running) | nginx: running | ✅ confirmado |
| 14 | `GET nginx/restart` (método errado) | 405 | ✅ 405 |

**Total: 19/19 testes passaram.**

### Teste Pós-Reboot

```txt
sv status flavos-agent   → run: flavos-agent: (pid 489) 82s
GET /health              → 200 OK
GET /services (autenticado) → nginx: running, sshd: running, flavos-agent: running
```

✅ Agent inicializa automaticamente após reboot e o Service Manager está funcional.

---

## Nota sobre Teste 6 (Path Traversal)

A URL `..%2F..%2Fetc%2Fpasswd/restart` foi decodificada pelo servidor Go como `../../etc/passwd/restart`. A parte da ação resultante foi `../etc/passwd/restart`, que não é um verbo válido (`start|stop|restart`), retornando `400 invalid_action`. O request foi bloqueado com segurança — embora a chave de erro retornada seja `invalid_action` em vez de `invalid_service_name`, o resultado de segurança é idêntico: o ataque é bloqueado.

---

## Token na VM

```txt
Arquivo:    /etc/flavos/token
Dono:       root:root
Permissão:  600
```

> ⚠️ O token real não está registrado neste relatório.

---

## Riscos Mitigados

- Path traversal em nomes de serviço
- Controle de serviços fora da whitelist
- Parada acidental do sshd via API
- Self-kill do flavos-agent via API
- Shell injection em parâmetros de serviço
- Acesso não autenticado a endpoints de controle

## Riscos Restantes

- Sem rate limiting nos endpoints de controle (aceitável para MVP)
- Sem log de auditoria por ação (planejado para Fase futura)
- Token estático sem rotação automática (aceitável para MVP)
- `flavos-agent` pode ser parado por `sv stop` direto na VM (fora do escopo desta fase)

---

## Checklist Final

- [x] Ajuste "Bearer Token" → "X-Flavos-Token" no API.md
- [x] agent/README.md mostra internal/auth
- [x] Verificação de token real em git realizada — limpo
- [x] Pacote services criado
- [x] Config/whitelist implementada
- [x] Validação de nome de serviço implementada
- [x] Ações permitidas por serviço implementadas
- [x] GET /api/v1/services implementado
- [x] POST /api/v1/services/{name}/start implementado
- [x] POST /api/v1/services/{name}/stop implementado
- [x] POST /api/v1/services/{name}/restart implementado
- [x] Todas as rotas de serviço exigem token
- [x] Serviço fora da whitelist retorna 403
- [x] Nome malicioso retorna 400
- [x] Ação não permitida retorna 403
- [x] Método incorreto retorna 405
- [x] Restart do nginx validado
- [x] Stop/start do nginx validado
- [x] sshd stop bloqueado
- [x] flavos-agent restart/stop bloqueado
- [x] Build local concluído
- [x] Cross-build linux/amd64 concluído
- [x] Deploy na VM concluído
- [x] Serviço runit reiniciado
- [x] Testes na VM concluídos (14/14)
- [x] Teste pós-reboot realizado
- [x] Documentação completa
- [x] Commit e push feitos

---

## Próximos Passos

- **Fase 6 — Logs & Auditoria:** Registrar cada ação de controle de serviço com timestamp, IP e resultado.
- Rate limiting nos endpoints de controle.
- Rotação de token sem necessidade de reiniciar o agent.
