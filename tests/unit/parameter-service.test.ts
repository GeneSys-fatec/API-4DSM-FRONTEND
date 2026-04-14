import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parameterService } from '../../src/services/parameter-service';

type FetchMock = {
  mockResolvedValueOnce(value: unknown): FetchMock;
  mock: {
    calls: Array<[RequestInfo | URL, RequestInit?]>;
  };
};

function getFetchMock(): FetchMock {
  return globalThis.fetch as unknown as FetchMock;
}

describe('Parameter Service (Frontend)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('deve listar todos os parâmetros do catálogo', async () => {
    const mockParams = [{ id: 1, name: 'Temperatura', json_key: 'temperature_2m', unit: 'C' }];
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => mockParams,
    });

    const result = await parameterService.findAll();

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url] = getFetchMock().mock.calls[0];
    expect(String(url)).toContain('/parameter-types');
    expect(result).toEqual(mockParams);
  });

  it('deve criar um novo parâmetro enviando a json_key', async () => {
    const payload = { name: 'Chuva', json_key: 'precipitation', unit: 'mm', factor: 1, offset: 0 };
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, ...payload }),
    });

    const result = await parameterService.create(payload);

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain('/parameter-types/create');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toHaveProperty('json_key', 'precipitation');
    expect(result?.id).toBe(2);
  });

  it('deve listar parâmetros aplicando filtro por palavra-chave', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await parameterService.findAll({ q: 'temp' });

    const [url] = getFetchMock().mock.calls[0];
    expect(String(url)).toContain('/parameter-types?');
    expect(String(url)).toContain('q=temp');
  });
});