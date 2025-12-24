export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

// Normalize base URL safely
function normalizeBaseUrl(base?: string): string {
  if (!base) return "";
  const trimmed = base.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

// Read build-time env var
const RAW_VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL as
  | string
  | undefined;

// Final API base used by browser
export const VITE_API_BASE_URL = normalizeBaseUrl(RAW_VITE_API_BASE_URL);

// Helpful dev-only log
if (import.meta.env.DEV) {
  console.info(
    "[API]",
    VITE_API_BASE_URL ? `Using VITE_API_BASE_URL=${VITE_API_BASE_URL}` : "Using same-origin /api"
  );
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  // path must start with /
  const url = VITE_API_BASE_URL
    ? `${VITE_API_BASE_URL}${path}`
    : path;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      payload = undefined;
    }
    throw new ApiError(
      `API request failed: ${res.status} ${res.statusText}`,
      res.status,
      payload
    );
  }

  // Handle empty responses safely
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
