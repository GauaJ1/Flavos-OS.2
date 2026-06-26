// Package metrics provides the structured data types and collection logic
// for the /api/v1/metrics endpoint.
package metrics

import "flavos-os-2/agent/internal/system"

// CPU holds CPU-related metrics.
type CPU struct {
	LoadAverage string `json:"load_average"`
}

// Memory holds memory usage metrics in kilobytes.
type Memory struct {
	TotalKB     uint64 `json:"total_kb"`
	AvailableKB uint64 `json:"available_kb"`
	UsedKB      uint64 `json:"used_kb"`
}

// Disk holds disk usage metrics for a filesystem.
type Disk struct {
	Filesystem   string  `json:"filesystem"`
	TotalKB      uint64  `json:"total_kb"`
	UsedKB       uint64  `json:"used_kb"`
	AvailableKB  uint64  `json:"available_kb"`
	UsagePercent float64 `json:"usage_percent"`
}

// Metrics is the top-level structure returned by the metrics endpoint.
type Metrics struct {
	CPU    CPU    `json:"cpu"`
	Memory Memory `json:"memory"`
	Disk   Disk   `json:"disk"`
}

// Collect gathers the current system metrics and returns them as a Metrics struct.
func Collect() Metrics {
	mem := system.Memory()
	disk := system.Disk()

	return Metrics{
		CPU: CPU{
			LoadAverage: system.LoadAverage(),
		},
		Memory: Memory{
			TotalKB:     mem.TotalKB,
			AvailableKB: mem.AvailableKB,
			UsedKB:      mem.UsedKB,
		},
		Disk: Disk{
			Filesystem:   disk.Filesystem,
			TotalKB:      disk.TotalKB,
			UsedKB:       disk.UsedKB,
			AvailableKB:  disk.AvailableKB,
			UsagePercent: disk.UsagePercent,
		},
	}
}
