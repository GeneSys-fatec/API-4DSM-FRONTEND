export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('@ClimaSense:token');

    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers, 
    });

    if (response.status === 401) {
        localStorage.removeItem('@ClimaSense:token');
        window.location.href = '/login'; 
    }

    return response;
}