package logs

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"regexp"
	"strings"
)

var (
	// Mapeamento estático e estrito de nomes de serviço para arquivos de log.
	logMap = map[string]string{
		"flavos-agent": "/var/log/flavos/agent.log",
		"nginx":        "/var/log/nginx/error.log",
		"sshd":         "/var/log/socklog/secure/current",
	}

	// Regex de validação de caracteres do nome do serviço.
	serviceNameRegex = regexp.MustCompile(`^[a-zA-Z0-9._-]+$`)
)

var (
	ErrInvalidServiceName = errors.New("invalid_service_name")
	ErrServiceNotAllowed  = errors.New("service_not_allowed")
	ErrLogNotFound        = errors.New("log_not_found")
)

// Read reads the last maxLines from the log file of the specified service.
// It enforces strict path traversal protection and checks against the config whitelist.
func Read(serviceName string, allowedServices []string, maxLines int) ([]string, string, error) {
	// 1. Basic validation against Path Traversal and empty strings
	trimmed := strings.TrimSpace(serviceName)
	if trimmed == "" || strings.Contains(trimmed, "/") || strings.Contains(trimmed, "\\") {
		return nil, "", ErrInvalidServiceName
	}

	// 2. Validate against regex pattern
	if !serviceNameRegex.MatchString(trimmed) {
		return nil, "", ErrInvalidServiceName
	}

	// 3. Verify if service is in the allowed services whitelist
	allowed := false
	for _, s := range allowedServices {
		if s == trimmed {
			allowed = true
			break
		}
	}
	if !allowed {
		return nil, "", ErrServiceNotAllowed
	}

	// 4. Map service name to physical file path
	filePath, mapped := logMap[trimmed]
	if !mapped {
		return nil, "", ErrLogNotFound
	}

	// 5. Open and read file (native Go implementation)
	f, err := os.Open(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, filePath, ErrLogNotFound
		}
		return nil, filePath, fmt.Errorf("failed to open log file: %w", err)
	}
	defer f.Close()

	var lines []string
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
		if len(lines) > maxLines {
			lines = lines[1:]
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, filePath, fmt.Errorf("error reading log file: %w", err)
	}

	return lines, filePath, nil
}

// List returns the list of allowed services that have mapped logs.
func List(allowedServices []string) []string {
	var list []string
	for _, s := range allowedServices {
		if _, mapped := logMap[s]; mapped {
			list = append(list, s)
		}
	}
	if list == nil {
		return []string{}
	}
	return list
}
