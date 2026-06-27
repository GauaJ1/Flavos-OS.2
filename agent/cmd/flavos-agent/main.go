// Command flavos-agent is the entry point for the Flavos Core Agent.
// It starts an HTTP server bound to 127.0.0.1:8087.
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"flavos-os-2/agent/internal/api"
	"flavos-os-2/agent/internal/audit"
	"flavos-os-2/agent/internal/auth"
	"flavos-os-2/agent/internal/config"
	"flavos-os-2/agent/internal/services"
)

const (
	addr    = "127.0.0.1:8087"
	version = "0.1.0"
)

func main() {
	// Initialize audit log
	env := os.Getenv("FLAVOS_ENV")
	if err := audit.Init(env); err != nil {
		log.Fatalf("Failed to initialize audit log: %v\n", err)
	}

	// Initialize authentication token
	auth.Init()

	// Setup audit logger for authentication failures
	auth.SetAuditLogger(func(r *http.Request, statusCode int, reason string) {
		ip := r.RemoteAddr
		if idx := strings.LastIndex(ip, ":"); idx != -1 {
			ip = ip[:idx]
		}
		ip = strings.Trim(ip, "[]")

		_ = audit.Log(&audit.AuditEvent{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			SourceIP:   ip,
			Method:     r.Method,
			Path:       r.URL.Path,
			Action:     "authenticate",
			Target:     "",
			Result:     "failed",
			StatusCode: statusCode,
			Reason:     reason,
			User:       "anonymous",
		})
	})

	// Load configuration (service whitelist from /etc/flavos/agent.toml)
	cfg := config.Load()

	// Initialize Service Manager and expose to API handlers
	api.ServiceManager = services.New(cfg)

	router := api.NewRouter()

	fmt.Printf("Flavos Core Agent v%s\n", version)
	fmt.Printf("Listening on http://%s\n", addr)
	fmt.Println("Endpoints:")
	fmt.Printf("  GET  http://%s/api/v1/health           (public)\n", addr)
	fmt.Printf("  GET  http://%s/api/v1/status           (auth)\n", addr)
	fmt.Printf("  GET  http://%s/api/v1/metrics          (auth)\n", addr)
	fmt.Printf("  GET  http://%s/api/v1/services         (auth)\n", addr)
	fmt.Printf("  POST http://%s/api/v1/services/{name}/{action}  (auth)\n", addr)
	fmt.Printf("  GET  http://%s/api/v1/logs             (auth)\n", addr)
	fmt.Printf("  GET  http://%s/api/v1/logs/{service}   (auth)\n", addr)
	fmt.Printf("  GET  http://%s/api/v1/audit            (auth)\n", addr)

	server := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Agent failed to start: %v\n", err)
	}
}

