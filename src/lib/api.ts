// Léger client API: wrap fetch et émet un événement global en cas d'erreur réseau
// Utilise VITE_API_BASE_URL si défini

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://ADRESSE_IP_DE_VOTRE_SERVEUR:8000';

console.log('API_BASE_URL configuré:', API_BASE_URL);
console.log('VITE_API_BASE_URL depuis env:', (import.meta as any).env?.VITE_API_BASE_URL);

export type ServerUnreachableDetail = {
  url: string;
  status?: number;
  error?: string;
};

export const SERVER_UNREACHABLE_EVENT = 'server-unreachable';

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });

    // Signaler les erreurs serveur typiques d'indisponibilité
    if (!res.ok && [502, 503, 504].includes(res.status)) {
      window.dispatchEvent(
        new CustomEvent<ServerUnreachableDetail>(SERVER_UNREACHABLE_EVENT, {
          detail: { url, status: res.status },
        })
      );
    }

    return res;
  } catch (e: any) {
    // Erreur réseau (DNS, CORS bloqué, serveur down, etc.)
    window.dispatchEvent(
      new CustomEvent<ServerUnreachableDetail>(SERVER_UNREACHABLE_EVENT, {
        detail: { url, error: e?.message || 'Network error' },
      })
    );
    throw e;
  }
}

// Helpers pratiques
export async function get<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, { method: 'GET', ...(init || {}) });
  return (await res.json()) as T;
}

export async function post<T = unknown>(path: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, {
    method: 'POST',
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
  return (await res.json()) as T;
}

export async function put<T = unknown>(path: string, body?: any, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, {
    method: 'PUT',
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  });
  return (await res.json()) as T;
}
