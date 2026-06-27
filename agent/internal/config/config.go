// Package config loads the Flavos Agent configuration from /etc/flavos/agent.toml.
// It uses only the Go standard library — no external TOML dependency.
package config

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// Config holds the relevant configuration for the Flavos Agent.
type Config struct {
	// AllowedServices is the whitelist of service names that may be managed via the API.
	AllowedServices []string
}

const defaultConfigPath = "/etc/flavos/agent.toml"

// Load reads the configuration file and returns a Config.
// If the file does not exist or cannot be parsed, it returns a safe default
// with an empty AllowedServices list (fail-closed).
func Load() *Config {
	cfg := &Config{AllowedServices: []string{}}

	f, err := os.Open(defaultConfigPath)
	if err != nil {
		fmt.Printf("Config: %s not found or unreadable — operating with empty service whitelist\n", defaultConfigPath)
		return cfg
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())

		// Look for: allowed = ["nginx", "sshd", "flavos-agent"]
		if !strings.HasPrefix(line, "allowed") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}

		value := strings.TrimSpace(parts[1])
		// Strip surrounding brackets
		value = strings.TrimPrefix(value, "[")
		value = strings.TrimSuffix(value, "]")

		for _, item := range strings.Split(value, ",") {
			name := strings.TrimSpace(item)
			// Remove surrounding quotes
			name = strings.Trim(name, `"'`)
			if name != "" {
				cfg.AllowedServices = append(cfg.AllowedServices, name)
			}
		}
		break // Only one allowed line expected
	}

	fmt.Printf("Config: Loaded allowed services: %v\n", cfg.AllowedServices)
	return cfg
}
