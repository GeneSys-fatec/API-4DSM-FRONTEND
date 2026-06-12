import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAlertsSSE } from "../../src/services/useAlertsSSE";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: { warning: vi.fn() },
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

  it("deve chamar toast.warning quando receber uma mensagem válida em formato de objeto", () => {
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

    expect(toast.warning).toHaveBeenCalledOnce();
    expect(toast.warning).toHaveBeenCalledWith(
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

    expect(toast.warning).toHaveBeenCalledOnce();
    expect(toast.warning).toHaveBeenCalledWith(
      "Alerta de Temperatura: Valor medido: 42.5 °C. Limite: 25 °C.",
      expect.any(Object)
    );
  });

  it("não deve notificar repetidamente sobre o mesmo alerta (anti-spam)", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    const payload = { id: 11, titulo: "Alerta", description: "Desc" };

    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });

    expect(toast.warning).toHaveBeenCalledTimes(1);
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
    
    expect(toast.warning).not.toHaveBeenCalled();
  });

  it("deve disparar onClose do toast e chamar a rota de read, processando falha na chamada HTTP", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    renderHook(() => useAlertsSSE("http://localhost:8080"));

    const payload = {
      id: 99,
      titulo: "Alerta de Fechamento",
    };

    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });
    expect(toast.warning).toHaveBeenCalled();
    
    const options = (toast.warning as Mock).mock.calls[0][1] as { onClose: () => void };
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
    expect(toast.warning).not.toHaveBeenCalled();
  });

  it("deve usar texto alternativo e fallback de descrição", () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    
    const payload1 = {
      id: 13,
      texto: "Texto do alerta 13",
    };
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload1) });
    expect(toast.warning).toHaveBeenCalledWith(
      "Alerta Climático: Texto do alerta 13",
      expect.any(Object)
    );
    
    const payload2 = {
      id: 14,
    };
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload2) });
    expect(toast.warning).toHaveBeenCalledWith(
      "Alerta Climático: Valores medidos fora do limite.",
      expect.any(Object)
    );
  });

  it("deve disparar onClose do toast e chamar a rota de read com sucesso", async () => {
    renderHook(() => useAlertsSSE("http://localhost:8080"));
    const payload = { id: 100, titulo: "Sucesso" };
    eventSourceMock.onmessage?.({ data: JSON.stringify(payload) });
    const options = (toast.warning as Mock).mock.calls[(toast.warning as Mock).mock.calls.length - 1][1] as { onClose: () => void };
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: true });
    options.onClose(); 
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/alerts/100/read", expect.objectContaining({ method: "PATCH" }));
  });
});