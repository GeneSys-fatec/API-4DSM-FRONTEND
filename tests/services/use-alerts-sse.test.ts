import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAlertsSSE } from "../../src/services/useAlertsSSE";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: { warn: vi.fn() },
}));

describe("useAlertsSSE Hook", () => {
  let eventSourceMock: {
    onmessage: ((event: { data: string }) => void) | null;
    onerror: ((event: Event) => void) | null;
    close: ReturnType<typeof vi.fn>;
  };
  let originalFetch: typeof fetch;

  beforeEach(() => {
    vi.clearAllMocks();

    eventSourceMock = {
      onmessage: null,
      onerror: null,
      close: vi.fn(),
    };

    vi.stubGlobal("EventSource", vi.fn(function() {
      return eventSourceMock;
    }));
    
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
  });

  it("deve instanciar o EventSource com a URL correta", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    expect(EventSource).toHaveBeenCalledWith("http://localhost:8080/alerts/stream");
  });

  it("deve fechar a conexão ao desmontar", () => {
    const { unmount } = renderHook(() => useAlertsSSE("http://localhost:8080"));
    unmount();
    expect(eventSourceMock.close).toHaveBeenCalledOnce();
  });

  it("deve chamar toast.warn quando receber uma mensagem válida em formato de objeto", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));

    const payload = {
      id: 10,
      parameterId: 1,
      triggeredValue: 42.5,
      status: "active",
      titulo: "Alerta de Temperatura",
      description: "Cuidado! Temperatura muito alta."
    };

    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });

    expect(toast.warn).toHaveBeenCalledOnce();
    expect(toast.warn).toHaveBeenCalledWith(
      "Alerta de Temperatura: Cuidado! Temperatura muito alta.",
      expect.any(Object)
    );
  });

  it("deve lidar com a mensagem válida sendo um array de objetos", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));

    const payload = [
      {
        id: "1",
        titulo: "Alerta de Temperatura",
        texto: "Valor medido: 42.5 °C. Limite: 25 °C."
      }
    ];

    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });

    expect(toast.warn).toHaveBeenCalledOnce();
    expect(toast.warn).toHaveBeenCalledWith(
      "Alerta de Temperatura: Valor medido: 42.5 °C. Limite: 25 °C.",
      expect.any(Object)
    );
  });

  it("não deve notificar repetidamente sobre o mesmo alerta (anti-spam)", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    const payload = { id: 11, titulo: "Alerta", description: "Desc" };

    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });

    expect(toast.warn).toHaveBeenCalledTimes(1);
  });

  it("deve lidar com erro na conexão do EventSource", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    
    expect(eventSourceMock.onerror).toBeDefined();
    eventSourceMock.onerror?.(new Event("error"));
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
  
  it("deve ignorar mensagem se JSON for inválido", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    
    eventSourceMock.onmessage?.({ data: "invalid json" });
    
    expect(toast.warn).not.toHaveBeenCalled();
  });

  it("deve disparar onClose do toast e chamar a rota de read, processando falha na chamada HTTP", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderHook(() => useAlertsSSE("http://localhost:8080"));

    const payload = {
      id: 99,
      titulo: "Alerta de Fechamento",
    };

    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });
    expect(toast.warn).toHaveBeenCalled();
    
    const options = (toast.warn as Mock).mock.calls[0][1] as { onClose: () => void };
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network Error"));
    options.onClose(); 

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8080/alerts/99/read",
      expect.objectContaining({ method: "PATCH" })
    );
    await new Promise(process.nextTick);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("não deve notificar se o alerta já estiver lido", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    const payload = {
      id: 12,
      isRead: true,
      titulo: "Alerta",
    };
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });
    expect(toast.warn).not.toHaveBeenCalled();
  });

  it("deve usar texto alternativo e fallback de descrição", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    
    const payload1 = {
      id: 13,
      texto: "Texto do alerta 13",
    };
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload1) });
    expect(toast.warn).toHaveBeenCalledWith(
      "Alerta Climático: Texto do alerta 13",
      expect.any(Object)
    );
    
    const payload2 = {
      id: 14,
    };
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload2) });
    expect(toast.warn).toHaveBeenCalledWith(
      "Alerta Climático: Valores medidos fora do limite.",
      expect.any(Object)
    );
  });

  it("deve disparar onClose do toast e chamar a rota de read com sucesso", async () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    const payload = { id: 100, titulo: "Sucesso" };
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });
    const options = (toast.warn as Mock).mock.calls[(toast.warn as Mock).mock.calls.length - 1][1] as { onClose: () => void };
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });
    options.onClose(); 
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/alerts/100/read", expect.objectContaining({ method: "PATCH" }));
  });

  it("deve fechar a conexão antiga e abrir uma nova quando a URL mudar", () => {
    const { rerender } = renderHook(({ url }) => useAlertsSSE(url), {
      initialProps: { url: "http://localhost:8080" },
    });

    expect(EventSource).toHaveBeenCalledWith("http://localhost:8080/alerts/stream");

    rerender({ url: "http://localhost:9090" });

    expect(eventSourceMock.close).toHaveBeenCalled();
    expect(EventSource).toHaveBeenCalledWith("http://localhost:9090/alerts/stream");
  });

  it("deve configurar o toast com autoClose de 10 segundos", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    const payload = { id: 200, titulo: "Teste Config" };
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });

    expect(toast.warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ autoClose: 10000 })
    );
  });

  it("deve notificar novamente se o mesmo ID tiver valores diferentes (anti-spam refinado)", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    
    const alert1 = { id: 300, triggeredValue: 10, occurredAt: "2026-01-01T10:00:00Z", titulo: "Alerta" };
    const alert2 = { id: 300, triggeredValue: 20, occurredAt: "2026-01-01T10:00:00Z", titulo: "Alerta" };

    eventSourceMock.onmessage?.({ data: JSON.stringify(alert1) });
    eventSourceMock.onmessage?.({ data: JSON.stringify(alert2) });

    expect(toast.warn).toHaveBeenCalledTimes(2);
  });

  it("não deve chamar toast.warn quando receber um array vazio", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    eventSourceMock.onmessage?.({ data: JSON.stringify([]) });
    expect(toast.warn).not.toHaveBeenCalled();
  });

  it("deve usar fallback total quando receber um objeto vazio", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    eventSourceMock.onmessage?.({ data: JSON.stringify({}) });
    
    expect(toast.warn).toHaveBeenCalledWith(
      "Alerta Climático: Valores medidos fora do limite.",
      expect.any(Object)
    );
  });

  it("deve processar e exibir múltiplos alertas vindos em um único array", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    const payloads = [
      { id: 401, titulo: "Alerta 1", description: "Desc 1" },
      { id: 402, titulo: "Alerta 2", description: "Desc 2" },
      { id: 403, titulo: "Alerta 3", description: "Desc 3" },
    ];

    eventSourceMock.onmessage?.({ data: JSON.stringify(payloads) });
    expect(toast.warn).toHaveBeenCalledTimes(3);
  });
});