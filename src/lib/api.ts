/**
 * Tiny typed fetch client for the HunarHub API.
 * - Base URL from VITE_API_URL (falls back to the live Render backend).
 * - Injects the JWT as a Bearer header when present.
 * - Normalises errors into ApiError { status, message, details }.
 */
export const API_URL =
  ((import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')) ||
  'https://hunarhub-api-s03k.onrender.com';

const TOKEN_KEY = 'hunarhub_token';

export const tokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable — ignore */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = tokenStore.get();
  // FormData (image uploads) must NOT be JSON-stringified, and its
  // Content-Type (with the multipart boundary) must be left for the browser
  // to set automatically — setting it manually breaks the boundary.
  const isFormData = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Network error — could not reach the server. Please try again.');
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' && data.error) ||
      res.statusText ||
      'Request failed';
    throw new ApiError(res.status, message, (data as { details?: unknown } | null)?.details);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
