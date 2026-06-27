// ============================================================
// Format utilities — Flavos Web Console
// ============================================================

/**
 * Formats a memory value from kilobytes to a human-readable string.
 */
export function formatKb(kb: number | undefined): string {
  if (kb === undefined || kb === null) return '—'
  if (kb < 1024) return `${kb} KB`
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${(kb / 1024 / 1024).toFixed(2)} GB`
}

/**
 * Calculates a percentage from used/total values.
 */
export function calcPercent(used: number | undefined, total: number | undefined): number {
  if (!used || !total || total === 0) return 0
  return Math.min(100, Math.round((used / total) * 100))
}

/**
 * Returns a color class based on a percentage value.
 */
export function percentColor(pct: number): string {
  if (pct >= 90) return 'danger'
  if (pct >= 70) return 'warning'
  return 'success'
}

/**
 * Formats an ISO timestamp to a readable local date/time.
 */
export function formatTimestamp(ts: string | undefined): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

/**
 * Truncates a string to a max length, adding ellipsis.
 */
export function truncate(str: string | undefined, max = 64): string {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}
