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
    expect(String(url)).toContain('/parameter-types/public');
    expect(result).toEqual(mockParams);
  });

  it('deve listar parâmetros com filtros de busca, data inicial e final', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await parameterService.findAll({ q: 'temp', from: '2026-01-01', to: '2026-01-31' });

    const [url] = getFetchMock().mock.calls[0];
    const query = String(url);
    expect(query).toContain('/parameter-types/public?');
    expect(query).toContain('q=temp');
    expect(query).toContain('from=2026-01-01');
    expect(query).toContain('to=2026-01-31');
  });

  it('deve retornar lista vazia quando a busca de parâmetros falhar', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getFetchMock().mockResolvedValueOnce({
      ok: false,
    });

    const result = await parameterService.findAll();

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('deve buscar um parâmetro pelo id', async () => {
    const mockParameter = { id: 7, name: 'Umidade', json_key: 'humidity', unit: '%' };
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => mockParameter,
    });

    const result = await parameterService.findById(7);

    const [url] = getFetchMock().mock.calls[0];
    expect(String(url)).toContain('/parameter-types/7');
    expect(result).toEqual(mockParameter);
  });

  it('deve retornar null quando a busca por id falhar', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getFetchMock().mockResolvedValueOnce({
      ok: false,
    });

    const result = await parameterService.findById(7);

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
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

  it('deve retornar null quando a criação de parâmetro falhar', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const payload = { name: 'Chuva', json_key: 'precipitation', unit: 'mm', factor: 1, offset: 0 };

    getFetchMock().mockResolvedValueOnce({
      ok: false,
    });

    const result = await parameterService.create(payload);

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('deve atualizar um parâmetro enviando o payload completo', async () => {
    const payload = { name: 'Temperatura máxima', json_key: 'temperature_max', unit: '°C', factor: 1, offset: 0 };
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 3, ...payload }),
    });

    const result = await parameterService.update(3, payload);

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain('/parameter-types/update/3');
    expect(init?.method).toBe('PUT');
    expect(JSON.parse(String(init?.body))).toHaveProperty('json_key', 'temperature_max');
    expect(result?.id).toBe(3);
  });

  it('deve retornar null quando a atualização de parâmetro falhar', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const payload = { name: 'Temperatura máxima', json_key: 'temperature_max', unit: '°C', factor: 1, offset: 0 };

    getFetchMock().mockResolvedValueOnce({
      ok: false,
    });

    const result = await parameterService.update(3, payload);

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('deve remover um parâmetro com sucesso', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
    });

    const result = await parameterService.delete(9);

    const [url, init] = getFetchMock().mock.calls[0]!;
    expect(String(url)).toContain('/parameter-types/delete/9');
    expect(init?.method).toBe('DELETE');
    expect(result).toBe(true);
  });

  it('deve retornar false quando a remoção de parâmetro falhar', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getFetchMock().mockResolvedValueOnce({
      ok: false,
    });

    const result = await parameterService.delete(9);

    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('deve listar parâmetros aplicando filtro por palavra-chave', async () => {
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await parameterService.findAll({ q: 'temp' });

    const [url] = getFetchMock().mock.calls[0];
    expect(String(url)).toContain('/parameter-types/public?');
    expect(String(url)).toContain('q=temp');
  });
});