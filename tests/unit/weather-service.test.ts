import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeatherForStation } from '../../src/services/weather-service';

type FetchMock = {
  mockResolvedValueOnce(value: unknown): FetchMock;
  mock: {
    calls: Array<[RequestInfo | URL, RequestInit?]>;
  };
};

function getFetchMock(): FetchMock {
  return globalThis.fetch as unknown as FetchMock;
}

describe('Weather Service (Frontend)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
    window.localStorage.clear();
  });

  it('deve buscar o clima da estação com sucesso', async () => {
    // Arrange
    const mockData = { current: { temperature_2m: 25 }, hourly: {} };
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    // Act
    const result = await fetchWeatherForStation(5);

    // Assert
    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const [url] = getFetchMock().mock.calls[0];
    expect(String(url)).toContain('/weather/5');
    expect(result).toEqual({
      current: { temperature_2m: 25 },
      hourly: { time: [] },
      units: undefined,
      generatedAlerts: [],
      generatedCount: 0,
    });
  });

  it('deve retornar null em caso de erro na requisição (ex: 400 ou 500)', async () => {
    // Arrange
    getFetchMock().mockResolvedValueOnce({
      ok: false,
    });

    // Act
    const result = await fetchWeatherForStation(1);

    // Assert
    expect(result).toBeNull();
  });

  it('deve enviar Authorization quando existir token salvo', async () => {
    window.localStorage.setItem('@ClimaSense:token', 'abc123');
    window.localStorage.setItem('token', 'abc123');
    
    getFetchMock().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ current: {}, hourly: {}, generatedAlerts: [] }),
    });

    await fetchWeatherForStation(8);

    const [, init] = getFetchMock().mock.calls[0]!;
    
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer abc123');
  });
});