# Phase 4 Report — Autenticação Inicial do Flavos Core Agent

**Data:** 2026-06-27  
**Status:** ✅ Concluída

---

## Objetivo

Implementar autenticação estática via token (`X-Flavos-Token`) no Flavos Core Agent, protegendo os endpoints sensíveis `/api/v1/status` e `/api/v1/metrics`, enquanto mantém `/api/v1/health` de acesso público.

---

## Arquivos Criados / Modificados

| Arquivo | Ação |
|---|---|
| `agent/internal/auth/auth.go` | Criado — pacote de autenticação |
| `agent/internal/api/router.go` | Modificado — middleware aplicado nas rotas protegidas |
| `agent/cmd/flavos-agent/main.go` | Modificado — `auth.Init()` chamado no startup |
| `docs/PHASE-4-AUTH-REPORT.md` | Criado — este relatório |
| `docs/API.md` | Atualizado — documentação de cabeçalho de auth |
| `docs/SECURITY.md` | Atualizado — mecanismo de token descrito |
| `docs/CHANGELOG.md` | Atualizado — entrada da versão 0.4.0 |
| `agent/README.md` | Atualizado — seção de segurança e uso |

---

## Implementação

### Pacote `auth`

- Carrega o token a partir de `FLAVOS_TOKEN` (variável de ambiente, prioridade 1) ou de `/etc/flavos/token` (arquivo, prioridade 2).
- Aplica `strings.TrimSpace` ao lê o arquivo, evitando falha por `\n` no final.
- Usa `crypto/sha256` + `crypto/subtle.ConstantTimeCompare` para comparação segura, resistente a timing attacks.
- Emite `WARNING` em log se nenhum token for encontrado.

### Middleware `RequireToken`

- Lê o header `X-Flavos-Token` da requisição.
- Retorna `401 Unauthorized` com `{"error": "unauthorized"}` se o token for ausente ou inválido.
- Permite a requisição seguir o fluxo normal apenas se o token for válido.

### Token na VM

```txt
Arquivo:    /etc/flavos/token
Dono:       root:root
Permissão:  600
Tamanho:    65 bytes (hex 32 bytes + newline gerado com openssl rand -hex 32)
```

> ⚠️ O token real não está registrado neste relatório por segurança.

---

## Testes Executados

### Host (local, com `FLAVOS_TOKEN=test-token`)

| # | Teste | Esperado | Resultado |
|---|---|---|---|
| 1 | `GET /api/v1/health` sem token | 200 OK | ✅ 200 OK |
| 2 | `GET /api/v1/health` com token inválido | 200 OK | ✅ 200 OK |
| 3 | `GET /api/v1/status` sem token | 401 | ✅ 401 `{"error":"unauthorized"}` |
| 4 | `GET /api/v1/status` com token inválido | 401 | ✅ 401 `{"error":"unauthorized"}` |
| 5 | `GET /api/v1/metrics` com token inválido | 401 | ✅ 401 `{"error":"unauthorized"}` |
| 6 | `GET /api/v1/status` com token válido | 200 OK | ✅ 200 OK |
| 7 | `GET /api/v1/metrics` com token válido | 200 OK | ✅ 200 OK |

### VM (`flavos-void-lab`, token lido de `/etc/flavos/token`)

| # | Teste | Esperado | Resultado |
|---|---|---|---|
| 1 | `GET /api/v1/health` sem token | 200 OK | ✅ 200 OK |
| 2 | `GET /api/v1/health` com token inválido | 200 OK | ✅ 200 OK |
| 3 | `GET /api/v1/status` sem token | 401 | ✅ 401 `{"error":"unauthorized"}` |
| 4 | `GET /api/v1/status` com token inválido | 401 | ✅ 401 `{"error":"unauthorized"}` |
| 5 | `GET /api/v1/metrics` com token inválido | 401 | ✅ 401 `{"error":"unauthorized"}` |
| 6 | `GET /api/v1/status` com token válido | 200 OK | ✅ 200 OK |
| 7 | `GET /api/v1/metrics` com token válido | 200 OK | ✅ 200 OK |

**Total: 14/14 testes passaram.**

---

## Saída do Serviço (VM, pós-deploy)

```txt
sv status flavos-agent
→ run: flavos-agent: (pid 616) 2s

Logs do Agent:
Auth: Loaded authentication token from /etc/flavos/token
Flavos Core Agent v0.1.0
Listening on http://127.0.0.1:8087
```

---

## Segurança Aplicada

- Comparação de token em tempo constante (sem `==`).
- Token armazenado em `/etc/flavos/token` com `chmod 600` e `chown root:root`.
- Token nunca exposto em logs, relatórios ou código-fonte.
- Agent continua escutando apenas em `127.0.0.1` — sem exposição pública.
- `/api/v1/health` permanece público para monitoramento externo sem autenticação.

---

## Próximos Passos

- **Fase 5 — Service Manager:** Implementar controle de serviços runit via API autenticada.
- Rotação de token via script ou mecanismo simples (sem reinicialização do agent).
- Rate limiting nos endpoints protegidos.
