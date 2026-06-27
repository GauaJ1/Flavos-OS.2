// Package api implements the HTTP handlers for the Flavos Core Agent REST API.
package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"flavos-os-2/agent/internal/audit"
	"flavos-os-2/agent/internal/logs"
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

	ip := getSourceIP(r)

	// Strip the /api/v1/services/ prefix and split into [name, action]
	path := strings.TrimPrefix(r.URL.Path, "/api/v1/services/")
	parts := strings.SplitN(path, "/", 2)
	if len(parts) != 2 {
		writeError(w, http.StatusBadRequest, "invalid_service_name")
		audit.Log(&audit.AuditEvent{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			SourceIP:   ip,
			Method:     r.Method,
			Path:       r.URL.Path,
			Action:     "service_action",
			Target:     "",
			Result:     "error",
			StatusCode: http.StatusBadRequest,
			Reason:     "invalid_service_name",
			User:       "static-token",
		})
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
		audit.Log(&audit.AuditEvent{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			SourceIP:   ip,
			Method:     r.Method,
			Path:       r.URL.Path,
			Action:     "service_action",
			Target:     name,
			Result:     "error",
			StatusCode: http.StatusBadRequest,
			Reason:     "invalid_action",
			User:       "static-token",
		})
		return
	}

	code, result, errKey := ServiceManager.ExecuteAction(name, action)
	if errKey != "" {
		writeError(w, code, errKey)
		audit.Log(&audit.AuditEvent{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			SourceIP:   ip,
			Method:     r.Method,
			Path:       r.URL.Path,
			Action:     action,
			Target:     name,
			Result:     "error",
			StatusCode: code,
			Reason:     errKey,
			User:       "static-token",
		})
		return
	}
	writeJSON(w, code, result)

	audit.Log(&audit.AuditEvent{
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		SourceIP:   ip,
		Method:     r.Method,
		Path:       r.URL.Path,
		Action:     action,
		Target:     name,
		Result:     "success",
		StatusCode: code,
		User:       "static-token",
	})
}

// getSourceIP extracts the client IP address from the request.
func getSourceIP(r *http.Request) string {
	ip := r.RemoteAddr
	if idx := strings.LastIndex(ip, ":"); idx != -1 {
		ip = ip[:idx]
	}
	return strings.Trim(ip, "[]")
}

// HandleLogs handles GET /api/v1/logs/{service}.
func HandleLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed")
		return
	}

	ip := getSourceIP(r)

	// Extract service name from URL path
	serviceName := strings.TrimPrefix(r.URL.Path, "/api/v1/logs/")
	serviceName = strings.TrimPrefix(serviceName, "/api/v1/logs")
	serviceName = strings.TrimSpace(serviceName)

	if serviceName == "" {
		allowedServices := ServiceManager.GetAllowedServices()
		availableLogs := logs.List(allowedServices)
		writeJSON(w, http.StatusOK, map[string]any{
			"services": availableLogs,
		})
		audit.Log(&audit.AuditEvent{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			SourceIP:   ip,
			Method:     r.Method,
			Path:       r.URL.Path,
			Action:     "list_logs",
			Target:     "",
			Result:     "success",
			StatusCode: http.StatusOK,
			User:       "static-token",
		})
		return
	}

	// Validate service name is not empty or containing path traversal characters
	if strings.Contains(serviceName, "/") || strings.Contains(serviceName, "\\") {
		writeError(w, http.StatusBadRequest, "invalid_service_name")
		audit.Log(&audit.AuditEvent{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			SourceIP:   ip,
			Method:     r.Method,
			Path:       r.URL.Path,
			Action:     "read_logs",
			Target:     serviceName,
			Result:     "error",
			StatusCode: http.StatusBadRequest,
			Reason:     "invalid_service_name",
			User:       "static-token",
		})
		return
	}

	// Parse lines parameter (default 50, min 1, max 200)
	linesVal := 50
	if q := r.URL.Query().Get("lines"); q != "" {
		v, err := strconv.Atoi(q)
		if err != nil || v < 1 || v > 200 {
			writeError(w, http.StatusBadRequest, "invalid_lines")
			audit.Log(&audit.AuditEvent{
				Timestamp:  time.Now().UTC().Format(time.RFC3339),
				SourceIP:   ip,
				Method:     r.Method,
				Path:       r.URL.Path,
				Action:     "read_logs",
				Target:     serviceName,
				Result:     "error",
				StatusCode: http.StatusBadRequest,
				Reason:     "invalid_lines",
				User:       "static-token",
			})
			return
		}
		linesVal = v
	}

	allowedServices := ServiceManager.GetAllowedServices()
	logLines, _, err := logs.Read(serviceName, allowedServices, linesVal)
	if err != nil {
		status := http.StatusInternalServerError
		errKey := "internal_error"

		switch {
		case errors.Is(err, logs.ErrInvalidServiceName):
			status = http.StatusBadRequest
			errKey = "invalid_service_name"
		case errors.Is(err, logs.ErrServiceNotAllowed):
			status = http.StatusForbidden
			errKey = "service_not_allowed"
		case errors.Is(err, logs.ErrLogNotFound):
			status = http.StatusNotFound
			errKey = "log_not_found"
		}

		writeError(w, status, errKey)
		audit.Log(&audit.AuditEvent{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			SourceIP:   ip,
			Method:     r.Method,
			Path:       r.URL.Path,
			Action:     "read_logs",
			Target:     serviceName,
			Result:     "error",
			StatusCode: status,
			Reason:     errKey,
			User:       "static-token",
		})
		return
	}

	if logLines == nil {
		logLines = []string{}
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"lines":          logLines,
		"lines_returned": len(logLines),
	})

	audit.Log(&audit.AuditEvent{
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		SourceIP:   ip,
		Method:     r.Method,
		Path:       r.URL.Path,
		Action:     "read_logs",
		Target:     serviceName,
		Result:     "success",
		StatusCode: http.StatusOK,
		User:       "static-token",
	})
}

// HandleAudit handles GET /api/v1/audit.
func HandleAudit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed")
		return
	}

	ip := getSourceIP(r)

	// Parse lines parameter (default 50, min 1, max 200)
	linesVal := 50
	if q := r.URL.Query().Get("lines"); q != "" {
		v, err := strconv.Atoi(q)
		if err != nil || v < 1 || v > 200 {
			writeError(w, http.StatusBadRequest, "invalid_lines")
			audit.Log(&audit.AuditEvent{
				Timestamp:  time.Now().UTC().Format(time.RFC3339),
				SourceIP:   ip,
				Method:     r.Method,
				Path:       r.URL.Path,
				Action:     "read_audit",
				Target:     "audit.log",
				Result:     "error",
				StatusCode: http.StatusBadRequest,
				Reason:     "invalid_lines",
				User:       "static-token",
			})
			return
		}
		linesVal = v
	}

	events, err := audit.ReadRecent(linesVal)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal_error")
		audit.Log(&audit.AuditEvent{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			SourceIP:   ip,
			Method:     r.Method,
			Path:       r.URL.Path,
			Action:     "read_audit",
			Target:     "audit.log",
			Result:     "error",
			StatusCode: http.StatusInternalServerError,
			Reason:     "read_failed",
			User:       "static-token",
		})
		return
	}

	if events == nil {
		events = []audit.AuditEvent{}
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"events":         events,
		"lines_returned": len(events),
	})

	audit.Log(&audit.AuditEvent{
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		SourceIP:   ip,
		Method:     r.Method,
		Path:       r.URL.Path,
		Action:     "read_audit",
		Target:     "audit.log",
		Result:     "success",
		StatusCode: http.StatusOK,
		User:       "static-token",
	})
}

