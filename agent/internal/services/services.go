// Package services implements the Service Manager for the Flavos Core Agent.
// It provides safe, whitelist-gated control of runit-managed services via
// the /usr/bin/sv binary, using exec.CommandContext (no shell interpolation).
package services

import (
	"context"
	"fmt"
	"net/http"
	"os/exec"
	"regexp"
	"strings"
	"time"

	"flavos-os-2/agent/internal/config"
)

const (
	svBin          = "/usr/bin/sv"
	serviceRootDir = "/var/service"
	cmdTimeout     = 5 * time.Second
)

// validNameRE accepts only safe service name characters.
var validNameRE = regexp.MustCompile(`^[a-zA-Z0-9._-]+$`)

// actionPolicy defines which actions are allowed per service.
// Services not listed here fall back to the whitelist-only check, which still
// requires the service to be present — but this map controls *action* granularity.
var actionPolicy = map[string]map[string]bool{
	"nginx": {
		"status":  true,
		"start":   true,
		"stop":    true,
		"restart": true,
	},
	"sshd": {
		"status":  true,
		"restart": true,
		// stop is intentionally missing: never kill the SSH daemon via API.
	},
	"flavos-agent": {
		"status": true,
		// start/stop/restart intentionally missing: the agent must not kill itself.
	},
}

// Manager holds the loaded configuration and exposes service operations.
type Manager struct {
	cfg *config.Config
}

// New creates a new Manager from the provided config.
func New(cfg *config.Config) *Manager {
	return &Manager{cfg: cfg}
}

// isAllowed returns true if the service is in the whitelist.
func (m *Manager) isAllowed(name string) bool {
	for _, s := range m.cfg.AllowedServices {
		if s == name {
			return true
		}
	}
	return false
}

// isActionPermitted returns true if the action is explicitly permitted for the service.
func isActionPermitted(serviceName, action string) bool {
	policy, ok := actionPolicy[serviceName]
	if !ok {
		// Service in whitelist but not in policy map — deny all actions by default.
		return false
	}
	return policy[action]
}

// ServiceInfo represents a single service entry in the list response.
type ServiceInfo struct {
	Name           string   `json:"name"`
	Status         string   `json:"status"`
	Raw            string   `json:"raw"`
	AllowedActions []string `json:"allowed_actions"`
}

// ActionResult is the response body for start/stop/restart.
type ActionResult struct {
	Service   string `json:"service"`
	Action    string `json:"action"`
	Status    string `json:"status"`
	Message   string `json:"message"`
	Output    string `json:"output"`
	Timestamp string `json:"timestamp"`
}

// ListServices returns status information for all allowed services.
func (m *Manager) ListServices() []ServiceInfo {
	var result []ServiceInfo
	for _, name := range m.cfg.AllowedServices {
		info := m.queryStatus(name)
		result = append(result, info)
	}
	return result
}

// queryStatus runs `sv status /var/service/<name>` and returns a ServiceInfo.
func (m *Manager) queryStatus(name string) ServiceInfo {
	svcPath := serviceRootDir + "/" + name
	ctx, cancel := context.WithTimeout(context.Background(), cmdTimeout)
	defer cancel()

	out, err := exec.CommandContext(ctx, svBin, "status", svcPath).CombinedOutput()
	raw := strings.TrimSpace(string(out))

	status := "unknown"
	if err == nil {
		lower := strings.ToLower(raw)
		if strings.HasPrefix(lower, "run:") {
			status = "running"
		} else if strings.HasPrefix(lower, "down:") || strings.HasPrefix(lower, "ok: down:") {
			status = "stopped"
		}
	}

	// Collect allowed actions for this service
	var allowed []string
	if policy, ok := actionPolicy[name]; ok {
		for _, act := range []string{"status", "start", "stop", "restart"} {
			if policy[act] {
				allowed = append(allowed, act)
			}
		}
	}

	return ServiceInfo{
		Name:           name,
		Status:         status,
		Raw:            raw,
		AllowedActions: allowed,
	}
}

// ExecuteAction runs start, stop, or restart on the named service.
// Returns HTTP status code, ActionResult, and an error message key (empty = success).
func (m *Manager) ExecuteAction(name, action string) (int, ActionResult, string) {
	now := time.Now().UTC().Format(time.RFC3339)

	// 1. Validate service name format
	if !validNameRE.MatchString(name) {
		return http.StatusBadRequest, ActionResult{}, "invalid_service_name"
	}

	// 2. Check whitelist
	if !m.isAllowed(name) {
		return http.StatusForbidden, ActionResult{}, "service_not_allowed"
	}

	// 3. Check action policy
	if !isActionPermitted(name, action) {
		return http.StatusForbidden, ActionResult{}, "action_not_allowed"
	}

	// 4. Execute via runit
	svcPath := serviceRootDir + "/" + name
	ctx, cancel := context.WithTimeout(context.Background(), cmdTimeout)
	defer cancel()

	out, err := exec.CommandContext(ctx, svBin, action, svcPath).CombinedOutput()
	raw := strings.TrimSpace(string(out))

	if err != nil {
		return http.StatusInternalServerError, ActionResult{
			Service:   name,
			Action:    action,
			Status:    "error",
			Message:   "service action failed",
			Output:    raw,
			Timestamp: now,
		}, ""
	}

	return http.StatusOK, ActionResult{
		Service:   name,
		Action:    action,
		Status:    "success",
		Message:   "service action executed",
		Output:    raw,
		Timestamp: now,
	}, ""
}

// ValidateName validates a service name string without requiring whitelist membership.
// Returns an HTTP status and error key, or 0/"" if valid.
func ValidateName(name string) (int, string) {
	if !validNameRE.MatchString(name) {
		return http.StatusBadRequest, "invalid_service_name"
	}
	return 0, ""
}

// AllowedActions returns the ordered action list for a named service.
// Returns empty slice if service has no policy.
func AllowedActions(name string) []string {
	policy, ok := actionPolicy[name]
	if !ok {
		return []string{}
	}
	var result []string
	for _, act := range []string{"status", "start", "stop", "restart"} {
		if policy[act] {
			result = append(result, act)
		}
	}
	return result
}

// StatusFormatted returns a human-readable status string for debugging.
func StatusFormatted(name string) string {
	return fmt.Sprintf("service=%s path=%s/%s", name, serviceRootDir, name)
}
