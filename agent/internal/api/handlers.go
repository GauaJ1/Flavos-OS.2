// Package api implements the HTTP handlers for the Flavos Core Agent REST API.
package api

import (
	"encoding/json"
	"net/http"

	"flavos-os-2/agent/internal/metrics"
	"flavos-os-2/agent/internal/system"
)

// writeJSON is a helper that writes a JSON response with the given status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// healthResponse is the JSON structure for GET /api/v1/health.
type healthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}

// HandleHealth handles GET /api/v1/health.
func HandleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, healthResponse{
		Status:  "ok",
		Service: "flavos-agent",
		Version: "0.1.0",
	})
}

// statusResponse is the JSON structure for GET /api/v1/status.
type statusResponse struct {
	OS       string `json:"os"`
	Base     string `json:"base"`
	Version  string `json:"version"`
	Hostname string `json:"hostname"`
	Uptime   string `json:"uptime"`
	Agent    string `json:"agent"`
}

// HandleStatus handles GET /api/v1/status.
func HandleStatus(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, statusResponse{
		OS:       "Flavos OS 2.0",
		Base:     "Void Linux",
		Version:  "Preview 0.1",
		Hostname: system.Hostname(),
		Uptime:   system.Uptime(),
		Agent:    "online",
	})
}

// HandleMetrics handles GET /api/v1/metrics.
func HandleMetrics(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, metrics.Collect())
}
