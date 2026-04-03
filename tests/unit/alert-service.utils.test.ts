import { describe, expect, it } from "vitest";
import {
  alertFilter,
  getEmptyAlertPayload,
  mapAlertApiToModel,
  validateAlertPayload,
} from "../../src/services/alert-service";

describe("alert-service (utils)", () => {
  it("deve criar payload inicial vazio", () => {
    expect(getEmptyAlertPayload()).toEqual({
      parameterId: 0,
      measuredValue: 0,
      occurredAt: "",
      description: "",
    });
  });

  it("deve validar campos obrigatórios", () => {
    expect(
      validateAlertPayload({
        parameterId: 0,
        measuredValue: 10,
        occurredAt: "2026-03-31T12:00",
        description: "Teste",
      }),
    ).toBe("Parâmetro é obrigatório.");

    expect(
      validateAlertPayload({
        parameterId: 1,
        measuredValue: Number.NaN,
        occurredAt: "2026-03-31T12:00",
        description: "Teste",
      }),
    ).toBe("Valor medido inválido.");

    expect(
      validateAlertPayload({
        parameterId: 1,
        measuredValue: 10,
        occurredAt: "",
        description: "Teste",
      }),
    ).toBe("Data/hora da ocorrência é obrigatória.");

    expect(
      validateAlertPayload({
        parameterId: 1,
        measuredValue: 10,
        occurredAt: "2026-03-31T12:00",
        description: "",
      }),
    ).toBe("Descrição é obrigatória.");

    expect(
      validateAlertPayload({
        parameterId: 1,
        measuredValue: 10,
        occurredAt: "2026-03-31T12:00",
        description: "Tudo certo",
      }),
    ).toBeNull();
  });

  it("deve mapear resposta da API para o modelo da UI", () => {
    const mapped = mapAlertApiToModel({
      id: 5,
      parameterId: 3,
      measurementId: 90,
      measuredValue: 17.25,
      occurredAt: "2026-03-31T12:00:00.000Z",
      description: "Fora da faixa",
      status: "active",
    });

    expect(mapped).toEqual({
      id: "5",
      parameterId: 3,
      measurementId: 90,
      measuredValue: 17.25,
      occurredAt: "2026-03-31T12:00:00.000Z",
      description: "Fora da faixa",
      status: "active",
    });
  });

  it("deve filtrar alertas por descrição, parâmetro e status", () => {
    const alerts = [
      {
        id: "1",
        parameterId: 1,
        measurementId: 1,
        measuredValue: 20,
        occurredAt: "2026-03-31T12:00:00.000Z",
        description: "Temperatura alta",
        status: "active" as const,
      },
      {
        id: "2",
        parameterId: 2,
        measurementId: 2,
        measuredValue: 40,
        occurredAt: "2026-03-31T13:00:00.000Z",
        description: "Umidade baixa",
        status: "resolved" as const,
      },
    ];

    expect(alertFilter(alerts, "")).toHaveLength(2);
    expect(alertFilter(alerts, "temperatura")).toHaveLength(1);
    expect(alertFilter(alerts, "2")).toHaveLength(1);
    expect(alertFilter(alerts, "resolved")).toHaveLength(1);
  });
});
