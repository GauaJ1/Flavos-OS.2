// Command flavos-agent is the entry point for the Flavos Core Agent.
// It starts an HTTP server bound to 127.0.0.1:8087.
package main

import (
	"fmt"
	"log"
	"net/http"

	"flavos-os-2/agent/internal/api"
)

const (
	addr    = "127.0.0.1:8087"
	version = "0.1.0"
)

func main() {
	router := api.NewRouter()

	fmt.Printf("Flavos Core Agent v%s\n", version)
	fmt.Printf("Listening on http://%s\n", addr)
	fmt.Println("Endpoints:")
	fmt.Printf("  GET http://%s/api/v1/health\n", addr)
	fmt.Printf("  GET http://%s/api/v1/status\n", addr)
	fmt.Printf("  GET http://%s/api/v1/metrics\n", addr)

	server := &http.Server{
		Addr:    addr,
		Handler: router,
	}

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Agent failed to start: %v\n", err)
	}
}
