// Command flavos-agent is the entry point for the Flavos Core Agent.
// It starts an HTTP server bound to 127.0.0.1:8087.
package main

import (
	"fmt"
	"log"
	"net/http"

	"flavos-os-2/agent/internal/api"
	"flavos-os-2/agent/internal/auth"
	"flavos-os-2/agent/internal/config"
	"flavos-os-2/agent/internal/services"
)

const (
	addr    = "127.0.0.1:8087"
	version = "0.1.0"
)

func main() {
	// Initialize authentication token
	auth.Init()

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

	server := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Agent failed to start: %v\n", err)
	}
}

