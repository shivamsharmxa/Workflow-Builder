/**
 * Returns an absolute URL for the given API path.
 *
 * In local dev (VITE_API_URL is empty) → relative path, same origin.
 * In production (VITE_API_URL set to Render URL) → absolute URL to the backend.
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  // path should start with /
  return `${API_BASE}${path}`;
}
