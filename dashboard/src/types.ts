// ============================================================
// Types — Flavos Web Console
// ============================================================

export type Page = 'dashboard' | 'services' | 'logs' | 'audit' | 'settings'

// --- API Response types ---

export interface StatusResponse {
  os?: string
  base?: string
  version?: string
  hostname?: string
  uptime?: string
  agent?: string
}

export interface CpuMetrics {
  load_average?: string
}

export interface MemoryMetrics {
  total_kb?: number
  available_kb?: number
  used_kb?: number
}

export interface DiskMetrics {
  filesystem?: string
  total_kb?: number
  used_kb?: number
  available_kb?: number
  usage_percent?: number
}

export interface MetricsResponse {
  cpu?: CpuMetrics
  memory?: MemoryMetrics
  disk?: DiskMetrics
}

export interface ServiceItem {
  name: string
  status: string
  raw?: string
  allowed_actions?: string[]
}

export interface ServicesResponse {
  services: ServiceItem[]
}

export interface AuditEvent {
  timestamp?: string
  source_ip?: string
  method?: string
  path?: string
  action?: string
  target?: string
  result?: string
  status_code?: number
  reason?: string
  user?: string
}

export interface AuditResponse {
  events?: AuditEvent[]
  lines_returned?: number
}

export interface LogsListResponse {
  services: string[]
}

export interface LogsResponse {
  lines?: string[]
  logs?: string[]
  lines_returned?: number
}

export interface HealthResponse {
  status?: string
}

// --- Client errors ---

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(`API Error ${status}: ${code}`)
  }
}

export class AuthError extends ApiError {
  constructor() {
    super(401, 'unauthorized')
  }
}
