// Package api wires up the HTTP routes for the Flavos Core Agent.
package api

import "net/http"

// NewRouter creates and returns a configured *http.ServeMux with all API routes registered.
func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/health", HandleHealth)
	mux.HandleFunc("GET /api/v1/status", HandleStatus)
	mux.HandleFunc("GET /api/v1/metrics", HandleMetrics)

	return mux
}
