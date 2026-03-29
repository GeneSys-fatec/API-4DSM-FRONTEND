import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parameterService } from '../../src/services/parameter-service';

describe('Parameter Service (Frontend)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('deve listar todos os parâmetros do catálogo', async () => {
    const mockParams = [{ id: 1, name: 'Temperatura', json_key: 'temperature_2m', unit: 'C' }];
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockParams,
    });

    const result = await parameterService.findAll();

    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url] = (globalThis.fetch as any).mock.calls[0];
    expect(String(url)).toContain('/parameter-types');
    expect(result).toEqual(mockParams);
  });

  it('deve criar um novo parâmetro enviando a json_key', async () => {
    const payload = { name: 'Chuva', json_key: 'precipitation', unit: 'mm', factor: 1, offset: 0 };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 2, ...payload }),
    });

    const result = await parameterService.create(payload);

    const [url, init] = (globalThis.fetch as any).mock.calls[0];
    expect(String(url)).toContain('/parameter-types/create');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toHaveProperty('json_key', 'precipitation');
    expect(result?.id).toBe(2);
  });
});