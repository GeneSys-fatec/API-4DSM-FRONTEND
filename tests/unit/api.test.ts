import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildQueryString, apiFetch } from '../../src/services/api';

describe('API Utility Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = vi.fn();
    localStorage.clear();
  });

  describe('buildQueryString', () => {
    it('should return an empty string when no valid params are provided', () => {
      expect(buildQueryString({})).toBe('');
      expect(buildQueryString({ a: undefined, b: null, c: '' })).toBe('');
    });

    it('should correctly serialize valid params', () => {
      const params = { q: 'test', status: 'active', page: 1 };
      const result = buildQueryString(params);
      expect(result).toBe('?q=test&status=active&page=1');
    });

    it('should ignore undefined, null, and empty string values', () => {
      const params = { q: 'test', status: undefined, other: null, empty: '' };
      const result = buildQueryString(params);
      expect(result).toBe('?q=test');
    });
  });

  describe('apiFetch', () => {
    it('should call fetch with the correct URL and options', async () => {
      const mockResponse = { ok: true, json: async () => ({}) };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse as Response);

      const result = await apiFetch('/test-path', { method: 'POST', body: JSON.stringify({ a: 1 }) });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-path'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.any(Headers),
        })
      );
      
      const callArgs = vi.mocked(globalThis.fetch).mock.calls[0][1];
      expect(callArgs?.headers.get('Content-Type')).toBe('application/json');
      expect(result).toBe(mockResponse);
    });

    it('should add Authorization header if token is present in localStorage', async () => {
      const mockToken = 'fake-jwt-token';
      localStorage.setItem('@ClimaSense:token', mockToken);
      
      const mockResponse = { ok: true, json: async () => ({}) };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse as Response);

      await apiFetch('/test-token');

      const callArgs = vi.mocked(globalThis.fetch).mock.calls[0][1];
      expect(callArgs?.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    });

    it('should not add Authorization header if token is missing', async () => {
      const mockResponse = { ok: true, json: async () => ({}) };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse as Response);

      await apiFetch('/test-no-token');

      const callArgs = vi.mocked(globalThis.fetch).mock.calls[0][1];
      expect(callArgs?.headers.get('Authorization')).toBeNull();
    });

    it('should not overwrite existing Content-Type header', async () => {
      const customHeaders = new Headers();
      customHeaders.set('Content-Type', 'application/xml');
      
      const mockResponse = { ok: true, json: async () => ({}) };
      vi.mocked(globalThis.fetch).mockResolvedValueOnce(mockResponse as Response);

      await apiFetch('/test-headers', { 
        body: JSON.stringify({}), 
        headers: customHeaders 
      });

      const callArgs = vi.mocked(globalThis.fetch).mock.calls[0][1];
      expect(callArgs?.headers.get('Content-Type')).toBe('application/xml');
    });
  });
});
