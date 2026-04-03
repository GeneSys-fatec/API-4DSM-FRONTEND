import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeatherForStation } from '../../src/services/weather-service';

describe('Weather Service (Frontend)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
    window.localStorage.clear();
  });

  it('deve buscar o clima da estação com sucesso', async () => {
    // Arrange
    const mockData = { current: { temperature_2m: 25 }, hourly: {} };
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    // Act
    const result = await fetchWeatherForStation(5);

    // Assert
    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url] = (globalThis.fetch as any).mock.calls[0];
    expect(String(url)).toContain('/weather/5');
    expect(result).toEqual({
      current: { temperature_2m: 25 },
      hourly: {},
      units: {},
      generatedAlerts: [],
      generatedCount: 0,
    });
  });

  it('deve retornar null em caso de erro na requisição (ex: 400 ou 500)', async () => {
    // Arrange
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    // Act
    const result = await fetchWeatherForStation(1);

    // Assert
    expect(result).toBeNull();
  });

  it('deve enviar Authorization quando existir token salvo', async () => {
    window.localStorage.setItem('token', 'abc123');
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ current: {}, hourly: {}, generatedAlerts: [] }),
    });

    await fetchWeatherForStation(8);

    const [, init] = (globalThis.fetch as any).mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer abc123');
  });
});