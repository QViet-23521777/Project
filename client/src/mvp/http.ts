function getApiBase() {
  const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  return envBase || "http://localhost:3000/api";
}

function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem("se113_auth");
    if (stored) {
      const { token } = JSON.parse(stored);
      return token || null;
    }
  } catch {
    // Ignore
  }
  return null;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBase()}${path}`;
  const token = getAuthToken();

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}`, res.status, body);
  }

  return body as T;
}
