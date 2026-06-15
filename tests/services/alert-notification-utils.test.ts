import { describe, expect, it } from "vitest";
import {
  buildNotificationSignature,
  dedupeGeneratedAlerts,
} from "../../src/services/alert-notification-utils";

describe("alert-notification-utils", () => {
  it("deve gerar assinatura estável por estação/parâmetro/status/descrição", () => {
    const signature = buildNotificationSignature({
      id: "1",
      parameterId: 7,
      measurementId: 10,
      measuredValue: 40,
      occurredAt: "2026-03-31T18:00:00.000Z",
      description: "  Temperatura MUITO alta  ",
      status: "active",
      stationId: 3,
    });

    expect(signature).toBe("3:7:active:temperatura muito alta");
  });

  it("deve bloquear duplicatas dentro da janela e aceitar fora da janela", () => {
    const first = {
      id: "1",
      parameterId: 7,
      measurementId: 10,
      measuredValue: 40,
      occurredAt: "2026-03-31T18:00:00.000Z",
      description: "Temperatura alta",
      status: "active" as const,
      stationId: 3,
    };

    const initial = dedupeGeneratedAlerts({
      alerts: [first],
      seenMap: {},
      nowMs: 1_000,
      dedupeWindowMs: 5_000,
    });

    expect(initial.acceptedAlerts).toHaveLength(1);

    const duplicateInWindow = dedupeGeneratedAlerts({
      alerts: [first],
      seenMap: initial.seenMap,
      nowMs: 4_000,
      dedupeWindowMs: 5_000,
    });

    expect(duplicateInWindow.acceptedAlerts).toHaveLength(0);

    const duplicateOutsideWindow = dedupeGeneratedAlerts({
      alerts: [first],
      seenMap: duplicateInWindow.seenMap,
      nowMs: 7_000,
      dedupeWindowMs: 5_000,
    });

    expect(duplicateOutsideWindow.acceptedAlerts).toHaveLength(1);
  });
});