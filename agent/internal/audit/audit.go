package audit

import (
	"bufio"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

// AuditEvent represents a single audit record written to audit.log.
type AuditEvent struct {
	Timestamp  string `json:"timestamp"`
	SourceIP   string `json:"source_ip"`
	Method     string `json:"method"`
	Path       string `json:"path"`
	Action     string `json:"action"`
	Target     string `json:"target"`
	Result     string `json:"result"`
	StatusCode int    `json:"status_code"`
	Reason     string `json:"reason"`
	User       string `json:"user"`
}

var (
	mu            sync.Mutex
	auditFilePath string
)

// Init initializes the audit log file path.
// It fails closed (returns an error) if the directory/file is not writable,
// except in development mode where it falls back to a local file.
func Init(env string) error {
	mu.Lock()
	defer mu.Unlock()

	targetPath := "/var/log/flavos/audit.log"
	isDev := env == "development" || env == "dev"

	// Try to open/create the target log file to verify writability
	dir := filepath.Dir(targetPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		// If cannot create directory, check if dev fallback is allowed
		if isDev {
			auditFilePath = "./audit.log"
			fmt.Printf("WARNING: Audit path %s not writable (%v). Falling back to local ./audit.log in development mode.\n", targetPath, err)
			return nil
		}
		return fmt.Errorf("audit directory %s is not writable and dev fallback is disabled in production: %w", dir, err)
	}

	f, err := os.OpenFile(targetPath, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0600)
	if err != nil {
		if isDev {
			auditFilePath = "./audit.log"
			fmt.Printf("WARNING: Audit file %s not writable (%v). Falling back to local ./audit.log in development mode.\n", targetPath, err)
			return nil
		}
		return fmt.Errorf("audit file %s is not writable and dev fallback is disabled in production: %w", targetPath, err)
	}
	f.Close()

	auditFilePath = targetPath
	fmt.Printf("Audit: Logger initialized using file %s\n", auditFilePath)
	return nil
}

// Log logs a new event to the audit file.
func Log(event *AuditEvent) error {
	mu.Lock()
	defer mu.Unlock()

	if auditFilePath == "" {
		return errors.New("audit logger is not initialized")
	}

	data, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal audit event: %w", err)
	}

	f, err := os.OpenFile(auditFilePath, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0600)
	if err != nil {
		return fmt.Errorf("failed to open audit file for writing: %w", err)
	}
	defer f.Close()

	if _, err := f.Write(append(data, '\n')); err != nil {
		return fmt.Errorf("failed to write audit event: %w", err)
	}

	return nil
}

// ReadRecent reads the last maxLines from the audit log file.
// If the file does not exist, it returns an empty list without error.
func ReadRecent(maxLines int) ([]AuditEvent, error) {
	mu.Lock()
	filePath := auditFilePath
	mu.Unlock()

	if filePath == "" {
		return nil, errors.New("audit logger is not initialized")
	}

	f, err := os.Open(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return []AuditEvent{}, nil
		}
		return nil, fmt.Errorf("failed to open audit file: %w", err)
	}
	defer f.Close()

	var events []AuditEvent
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			continue
		}
		var ev AuditEvent
		if err := json.Unmarshal([]byte(line), &ev); err == nil {
			events = append(events, ev)
			if len(events) > maxLines {
				events = events[1:]
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading audit file: %w", err)
	}

	return events, nil
}
