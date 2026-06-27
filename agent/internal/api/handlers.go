// Package api implements the HTTP handlers for the Flavos Core Agent REST API.
package api

import (
	"encoding/json"
	"net/http"
	"strings"

	"flavos-os-2/agent/internal/metrics"
	"flavos-os-2/agent/internal/services"
	"flavos-os-2/agent/internal/system"
)

// ServiceManager is the package-level services.Manager, set by main during startup.
var ServiceManager *services.Manager

// writeJSON is a helper that writes a JSON response with the given status code.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

// writeError writes a JSON error body: {"error": "<key>"}.
func writeError(w http.ResponseWriter, status int, key string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_, _ = w.Write([]byte(`{"error":"` + key + `"}`))
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

// HandleServices handles GET /api/v1/services — lists all allowed services and their status.
func HandleServices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed")
		return
	}
	list := ServiceManager.ListServices()
	if list == nil {
		list = []services.ServiceInfo{}
	}
	writeJSON(w, http.StatusOK, map[string]any{"services": list})
}

// HandleServiceAction handles POST /api/v1/services/{name}/{action}.
// URL pattern: /api/v1/services/<name>/<action>
func HandleServiceAction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed")
		return
	}

	// Strip the /api/v1/services/ prefix and split into [name, action]
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/services/")
	parts := strings.SplitN(path, "/", 2)
	if len(parts) != 2 {
		writeError(w, http.StatusBadRequest, "invalid_service_name")
		return
	}
	name := parts[0]
	action := parts[1]

	// Validate action is one of the known verbs before calling Manager
	switch action {
	case "start", "stop", "restart":
		// valid
	default:
		writeError(w, http.StatusBadRequest, "invalid_action")
		return
	}

	code, result, errKey := ServiceManager.ExecuteAction(name, action)
	if errKey != "" {
		writeError(w, code, errKey)
		return
	}
	writeJSON(w, code, result)
}

