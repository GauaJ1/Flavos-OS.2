package auth

import (
	"crypto/sha256"
	"crypto/subtle"
	"fmt"
	"net/http"
	"os"
	"strings"
)

// AuditFunc defines a callback to log authentication failures.
type AuditFunc func(r *http.Request, statusCode int, reason string)

var (
	tokenHash   [32]byte
	hasToken    bool
	auditLogger AuditFunc
)

// SetAuditLogger sets the callback function to log authentication events.
func SetAuditLogger(logger AuditFunc) {
	auditLogger = logger
}

// Init loads the token from the environment or from /etc/flavos/token.
func Init() {
	// 1. Try env var first (development/fallback)
	token := strings.TrimSpace(os.Getenv("FLAVOS_TOKEN"))
	if token != "" {
		tokenHash = sha256.Sum256([]byte(token))
		hasToken = true
		fmt.Println("Auth: Loaded authentication token from FLAVOS_TOKEN environment variable")
		return
	}

	// 2. Try file path /etc/flavos/token (production/VM)
	const tokenFile = "/etc/flavos/token"
	data, err := os.ReadFile(tokenFile)
	if err == nil {
		token = strings.TrimSpace(string(data))
		if token != "" {
			tokenHash = sha256.Sum256([]byte(token))
			hasToken = true
			fmt.Printf("Auth: Loaded authentication token from %s\n", tokenFile)
			return
		}
	}

	// 3. Warning if not found
	hasToken = false
	fmt.Println("WARNING: No authentication token configured! Protected endpoints will reject all requests.")
}

// RequireToken is a middleware that enforces the presence of a valid X-Flavos-Token header.
func RequireToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !hasToken {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"error": "unauthorized"}`))
			if auditLogger != nil {
				auditLogger(r, http.StatusUnauthorized, "no_token_configured")
			}
			return
		}

		receivedToken := strings.TrimSpace(r.Header.Get("X-Flavos-Token"))
		if receivedToken == "" {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"error": "unauthorized"}`))
			if auditLogger != nil {
				auditLogger(r, http.StatusUnauthorized, "missing_token_header")
			}
			return
		}

		receivedHash := sha256.Sum256([]byte(receivedToken))

		// Constant-time comparison to prevent timing attacks
		if subtle.ConstantTimeCompare(tokenHash[:], receivedHash[:]) == 1 {
			next.ServeHTTP(w, r)
		} else {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"error": "unauthorized"}`))
			if auditLogger != nil {
				auditLogger(r, http.StatusUnauthorized, "invalid_token")
			}
		}
	})
}
