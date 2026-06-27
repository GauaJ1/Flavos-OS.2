// Package api wires up the HTTP routes for the Flavos Core Agent.
package api

import (
	"net/http"

	"flavos-os-2/agent/internal/auth"
)

// NewRouter creates and returns a configured *http.ServeMux with all API routes registered.
func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	// Public
	mux.HandleFunc("GET /api/v1/health", HandleHealth)

	// Protected — require X-Flavos-Token
	mux.Handle("GET /api/v1/status", auth.RequireToken(http.HandlerFunc(HandleStatus)))
	mux.Handle("GET /api/v1/metrics", auth.RequireToken(http.HandlerFunc(HandleMetrics)))

	// Service Manager — list (GET) and actions (POST /{name}/{action})
	mux.Handle("/api/v1/services", auth.RequireToken(http.HandlerFunc(HandleServices)))
	mux.Handle("/api/v1/services/", auth.RequireToken(http.HandlerFunc(HandleServiceAction)))

	// Logs & Audit
	mux.Handle("/api/v1/logs", auth.RequireToken(http.HandlerFunc(HandleLogs)))
	mux.Handle("/api/v1/logs/", auth.RequireToken(http.HandlerFunc(HandleLogs)))
	mux.Handle("GET /api/v1/audit", auth.RequireToken(http.HandlerFunc(HandleAudit)))

	return mux
}


