// ============================================================
// Security utilities — Flavos Web Console
// ============================================================

const TOKEN_KEY = 'flavos_token'

/**
 * Retrieves the stored token from sessionStorage.
 * Returns null if no token is stored.
 */
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

/**
 * Stores the token in sessionStorage.
 * Never logs or exposes the token value.
 */
export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

/**
 * Clears the stored token from sessionStorage.
 */
export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

/**
 * Returns true if a token is currently stored.
 */
export function hasToken(): boolean {
  return sessionStorage.getItem(TOKEN_KEY) !== null
}

/**
 * Visually masks any 32+ character hex-like strings in a text.
 * This is a defence-in-depth measure; no sensitive data should
 * ever reach the UI in the first place.
 */
export function maskSensitiveStrings(text: string): string {
  return text.replace(/[a-f0-9]{32,}/gi, '<redacted>')
}
