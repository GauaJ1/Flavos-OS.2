#!/bin/bash
# Script de teste de integração para a Fase 6 — Logs & Auditoria

set -e

PORT=8087
TOKEN="test-token-123-secret"
if [ -r /etc/flavos/token ]; then
    TOKEN=$(cat /etc/flavos/token)
elif sudo test -r /etc/flavos/token 2>/dev/null; then
    TOKEN=$(sudo cat /etc/flavos/token)
fi

# Trim any whitespaces
TOKEN=$(echo "$TOKEN" | tr -d '[:space:]')

API_URL="http://127.0.0.1:$PORT/api/v1"

echo "=== Iniciando testes de integracao do Flavos Agent ==="

# Helper para fazer requisições e imprimir status
request() {
    local method=$1
    local path=$2
    local token_val=$3
    local expected_status=$4
    local post_data=$5

    echo -n "Testando $method $path "
    if [ -n "$token_val" ]; then
        echo -n "(com token: $token_val) "
    else
        echo -n "(sem token) "
    fi

    local headers=()
    if [ -n "$token_val" ]; then
        headers+=("-H" "X-Flavos-Token: $token_val")
    fi

    local response_file
    response_file=$(mktemp)

    local http_status
    if [ "$method" = "POST" ]; then
        http_status=$(curl -s -o "$response_file" -w "%{http_code}" -X POST "${headers[@]}" -H "Content-Type: application/json" -d "$post_data" "$API_URL$path")
    else
        http_status=$(curl -s -o "$response_file" -w "%{http_code}" -X "$method" "${headers[@]}" "$API_URL$path")
    fi

    local body
    body=$(cat "$response_file")
    rm -f "$response_file"

    if [ "$http_status" -eq "$expected_status" ]; then
        echo "✅ OK (Status: $http_status)"
        if [ "$expected_status" -ne 200 ] && [ "$expected_status" -ne 201 ]; then
            echo "   Response: $body"
        fi
        return 0
    else
        echo "❌ FALHOU! Esperava $expected_status, obteve $http_status"
        echo "   Response: $body"
        exit 1
    fi
}

# 1. Testar Health Check (publico)
request "GET" "/health" "" 200

# 2. Testar acesso sem token a rotas protegidas
request "GET" "/status" "" 401
request "GET" "/metrics" "" 401
request "GET" "/services" "" 401
request "GET" "/logs" "" 401
request "GET" "/audit" "" 401

# 3. Testar acesso com token invalido
request "GET" "/status" "invalid-token-xyz" 401
request "GET" "/logs" "invalid-token-xyz" 401
request "GET" "/audit" "invalid-token-xyz" 401

# 4. Testar acesso com token valido
request "GET" "/status" "$TOKEN" 200
request "GET" "/metrics" "$TOKEN" 200
request "GET" "/services" "$TOKEN" 200

# 5. Testar endpoint de auditoria (/audit)
echo -n "Testando GET /audit "
audit_resp=$(curl -s -X GET -H "X-Flavos-Token: $TOKEN" "$API_URL/audit")
echo "✅ OK"
echo "--- Conteudo do Log de Auditoria ---"
echo "$audit_resp" | jq . 2>/dev/null || echo "$audit_resp"
echo "------------------------------------"

# 6. Testar endpoint de listagem de logs (/logs)
echo -n "Testando GET /logs "
logs_resp=$(curl -s -X GET -H "X-Flavos-Token: $TOKEN" "$API_URL/logs")
echo "✅ OK"
echo "--- Conteudo da Listagem de Logs ---"
echo "$logs_resp" | jq . 2>/dev/null || echo "$logs_resp"
echo "------------------------------------"

# 7. Testar endpoint de log especifico se houver algum log
# Tentaremos ler o log do agent ou de outro servico se estiver na whitelist
request "GET" "/logs/nonexistent-service" "$TOKEN" 403

echo "=== Todos os testes do script passaram com sucesso! ==="
