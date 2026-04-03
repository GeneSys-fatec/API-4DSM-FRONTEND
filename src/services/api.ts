export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

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