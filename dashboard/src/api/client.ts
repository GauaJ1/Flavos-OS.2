// ============================================================
// API Client — Flavos Web Console
// ============================================================
// Security rules:
//   - Token is injected from sessionStorage, never from props/URL
//   - Token is never logged
//   - Timeout: 8 seconds via AbortController
//   - 401 responses throw AuthError for global handling
// ============================================================

import { AuthError, ApiError } from '../types'
import { getToken } from '../utils/security'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ''
const TIMEOUT_MS = 8000

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-Flavos-Token': token } : {}),
        ...(options?.headers ?? {}),
      },
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : null

    if (response.status === 401) {
      throw new AuthError()
    }

    if (!response.ok) {
      throw new ApiError(response.status, (data as { error?: string })?.error ?? 'request_failed')
    }

    return data as T
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(504, 'timeout')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}

// --- Endpoint functions ---

import type {
  HealthResponse,
  StatusResponse,
  MetricsResponse,
  ServicesResponse,
  AuditResponse,
  LogsListResponse,
  LogsResponse,
} from '../types'

export async function fetchHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/v1/health')
}

export async function fetchStatus(): Promise<StatusResponse> {
  return apiFetch<StatusResponse>('/api/v1/status')
}

export async function fetchMetrics(): Promise<MetricsResponse> {
  return apiFetch<MetricsResponse>('/api/v1/metrics')
}

export async function fetchServices(): Promise<ServicesResponse> {
  return apiFetch<ServicesResponse>('/api/v1/services')
}

export async function serviceAction(name: string, action: 'start' | 'stop' | 'restart'): Promise<unknown> {
  return apiFetch(`/api/v1/services/${encodeURIComponent(name)}/${action}`, { method: 'POST' })
}

export async function fetchAudit(lines = 50): Promise<AuditResponse> {
  return apiFetch<AuditResponse>(`/api/v1/audit?lines=${lines}`)
}

export async function fetchLogsList(): Promise<LogsListResponse> {
  return apiFetch<LogsListResponse>('/api/v1/logs')
}

export async function fetchLogs(service: string, lines = 50): Promise<LogsResponse> {
  return apiFetch<LogsResponse>(`/api/v1/logs/${encodeURIComponent(service)}?lines=${lines}`)
}
