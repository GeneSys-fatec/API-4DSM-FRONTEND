import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../src/services/auth-service';

type FetchMock = {
  mockResolvedValueOnce(value: unknown): FetchMock;
  mock: {
    calls: Array<[RequestInfo | URL, RequestInit?]>;
  };
};

function getFetchMock(): FetchMock {
  return globalThis.fetch as unknown as FetchMock;
}

describe('Auth Service (Frontend)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('deve realizar login com sucesso e retornar o token', async () => {
    const mockToken = "token-jwt-simulado-123";
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      headers: { get: vi.fn().mockReturnValue('application/json') },
      json: async () => mockToken,
    });

    const payload = { email: 'admin@tecsus.com', password: 'senha' };
    const result = await authService.login(payload);

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain('/auth/login');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(payload);
    expect(result).toBe(mockToken);
  });

  it('deve lançar erro se o login falhar retornando JSON (ex: 401 Credenciais Inválidas)', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: { get: vi.fn().mockReturnValue('application/json') },
      json: async () => ({ error: 'Credenciais inválidas' }),
    });

    await expect(
      authService.login({ email: 'errado@teste.com', password: '123' })
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('deve lançar erro genérico se o login falhar retornando texto puro (ex: 500 Internal Server Error)', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: vi.fn().mockReturnValue('text/plain') },
      text: async () => 'Internal Server Error',
    });

    await expect(
      authService.login({ email: 'admin@tecsus.com', password: '123' })
    ).rejects.toThrow('Erro ao realizar login');
  });
});