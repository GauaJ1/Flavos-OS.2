// Package system provides utilities to read real system information
// from the host OS using standard Linux interfaces (/proc, syscalls).
package system

import (
	"fmt"
	"os"
	"strings"
	"syscall"
)

// Hostname returns the machine hostname.
func Hostname() string {
	name, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return name
}

// Uptime reads the system uptime from /proc/uptime and returns a human-readable string.
func Uptime() string {
	data, err := os.ReadFile("/proc/uptime")
	if err != nil {
		return "unknown"
	}
	parts := strings.Fields(string(data))
	if len(parts) == 0 {
		return "unknown"
	}

	var totalSeconds float64
	fmt.Sscanf(parts[0], "%f", &totalSeconds)

	hours := int(totalSeconds) / 3600
	minutes := (int(totalSeconds) % 3600) / 60
	seconds := int(totalSeconds) % 60

	return fmt.Sprintf("%dh %dm %ds", hours, minutes, seconds)
}

// LoadAverage reads the load averages from /proc/loadavg and returns the 1-minute average.
func LoadAverage() string {
	data, err := os.ReadFile("/proc/loadavg")
	if err != nil {
		return "unknown"
	}
	parts := strings.Fields(string(data))
	if len(parts) < 3 {
		return "unknown"
	}
	return fmt.Sprintf("%s %s %s", parts[0], parts[1], parts[2])
}

// MemInfo holds the relevant fields from /proc/meminfo.
type MemInfo struct {
	TotalKB     uint64
	AvailableKB uint64
	UsedKB      uint64
}

// Memory reads /proc/meminfo and returns the parsed MemInfo struct.
func Memory() MemInfo {
	data, err := os.ReadFile("/proc/meminfo")
	if err != nil {
		return MemInfo{}
	}

	info := MemInfo{}
	for _, line := range strings.Split(string(data), "\n") {
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}
		var val uint64
		fmt.Sscanf(fields[1], "%d", &val)
		switch fields[0] {
		case "MemTotal:":
			info.TotalKB = val
		case "MemAvailable:":
			info.AvailableKB = val
		}
	}
	info.UsedKB = info.TotalKB - info.AvailableKB
	return info
}

// DiskInfo holds disk usage statistics for a given filesystem path.
type DiskInfo struct {
	Filesystem     string
	TotalKB        uint64
	UsedKB         uint64
	AvailableKB    uint64
	UsagePercent   float64
}

// Disk returns disk usage statistics for the root filesystem ("/").
func Disk() DiskInfo {
	var stat syscall.Statfs_t
	if err := syscall.Statfs("/", &stat); err != nil {
		return DiskInfo{Filesystem: "/"}
	}

	blockSize := uint64(stat.Bsize)
	total := stat.Blocks * blockSize / 1024
	available := stat.Bavail * blockSize / 1024
	used := total - (stat.Bfree*blockSize/1024)

	var usagePct float64
	if total > 0 {
		usagePct = float64(used) / float64(total) * 100
	}

	return DiskInfo{
		Filesystem:   "/",
		TotalKB:      total,
		UsedKB:       used,
		AvailableKB:  available,
		UsagePercent: usagePct,
	}
}
