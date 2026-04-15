import { describe, it, expect, vi, beforeEach } from 'vitest';
import { administratorService } from '../../src/services/administrator-services';

type FetchMock = {
  mockResolvedValueOnce(value: unknown): FetchMock;
  mock: {
    calls: Array<[RequestInfo | URL, RequestInit?]>;
  };
};

function getFetchMock(): FetchMock {
  return globalThis.fetch as unknown as FetchMock;
}

describe('Administrator Service (Frontend)', () => {
  const mockAdmin = { id: 1, name: 'Admin Teste', email: 'admin@teste.com' };

  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {}); 
  });

  it('findAll: deve listar todos os administradores', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => [mockAdmin],
    });

    const result = await administratorService.findAll();

    const [url, init] = getFetchMock().mock.calls[0];
    expect(String(url)).toContain('/administrator');
    expect(init?.method ?? 'GET').toBe('GET'); 
    expect(result).toEqual([mockAdmin]);
  });

  it('findAll: deve retornar um array vazio se a requisição falhar', async () => {
    getFetchMock().mockResolvedValueOnce({ ok: false });
    const result = await administratorService.findAll();
    expect(result).toEqual([]);
  });

  it('findById: deve retornar os dados de um administrador específico', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => mockAdmin,
    });

    const result = await administratorService.findById(1);

    const [url] = getFetchMock().mock.calls[0];
    expect(String(url)).toContain('/administrator/1');
    expect(result).toEqual(mockAdmin);
  });

  it('findById: deve retornar null se a requisição falhar', async () => {
    getFetchMock().mockResolvedValueOnce({ ok: false });
    const result = await administratorService.findById(99);
    expect(result).toBeNull();
  });

  it('create: deve criar um novo administrador com os dados corretos', async () => {
    const payload = { name: 'Novo Admin', email: 'novo@teste.com', password: '123' };
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, ...payload }),
    });

    const result = await administratorService.create(payload);

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain('/administrator/create');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual(payload);
    expect(result.id).toBe(2);
  });

  it('update: deve mapear o payload corretamente (newName, newEmail) e enviar PUT', async () => {
    const updateData = { name: 'Admin Editado', email: 'editado@teste.com', password: '321' };
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, ...updateData }),
    });

    const result = await administratorService.update(1, updateData);

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain('/administrator/update/1');
    expect(init?.method).toBe('PUT');
    
    expect(JSON.parse(String(init?.body))).toEqual({
      newName: 'Admin Editado',
      newEmail: 'editado@teste.com',
      newPassword: '321'
    });
    expect(result.id).toBe(1);
  });

  it('delete: deve excluir um administrador e não enviar cabeçalhos bloqueantes', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Deletado com sucesso' }),
    });

    const result = await administratorService.delete(1);

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain('/administrator/delete/1');
    expect(init?.method).toBe('DELETE');
    
    const headers = new Headers(init?.headers);
    expect(headers.has('Content-Type')).toBe(false); 
    
    expect(result).toBe(true);
  });

  it('delete: deve lançar erro se o backend recusar a exclusão', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Este administrador não pode ser excluído' }),
    });

    await expect(administratorService.delete(1)).rejects.toThrow('Este administrador não pode ser excluído');
  });
});