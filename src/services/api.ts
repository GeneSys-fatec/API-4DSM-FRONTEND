export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

type QueryPrimitive = string | number | boolean | undefined | null;

export function buildQueryString(params: Record<string, QueryPrimitive>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
  
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('@ClimaSense:token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });
}