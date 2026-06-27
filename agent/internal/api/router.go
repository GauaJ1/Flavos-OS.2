// Package api wires up the HTTP routes for the Flavos Core Agent.
package api

import (
	"net/http"

	"flavos-os-2/agent/internal/auth"
)

// NewRouter creates and returns a configured *http.ServeMux with all API routes registered.
func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/health", HandleHealth)
	mux.Handle("GET /api/v1/status", auth.RequireToken(http.HandlerFunc(HandleStatus)))
	mux.Handle("GET /api/v1/metrics", auth.RequireToken(http.HandlerFunc(HandleMetrics)))

	return mux
}

