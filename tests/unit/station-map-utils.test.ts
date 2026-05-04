import { describe, it, expect } from "vitest";
import {
  parseMapApiToMapPoints,
  countInvalidCoords,
} from "../../src/utils/stationMapUtils";
import type { StationMapApi } from "../../src/services/station-service";

function makeStation(overrides: Partial<StationMapApi> = {}): StationMapApi {
  return {
    id: 1,
    name: "Estação Teste",
    address: "São Paulo, SP",
    latitude: "-23.5505",
    longitude: "-46.6333",
    isActive: true,
    idDatalogger: "DL-001",
    ...overrides,
  };
}

describe("stationMapUtils - parseMapApiToMapPoints", () => {
  it("deve converter uma estação com coordenadas válidas", () => {
    const stations = [makeStation()];
    const result = parseMapApiToMapPoints(stations);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "1",
      nome: "Estação Teste",
      cidade: "São Paulo, SP",
      codigo: "DL-001",
      lat: -23.5505,
      lng: -46.6333,
      isActive: true,
    });
  });

  it("deve filtrar estações com latitude inválida", () => {
    const stations = [
      makeStation({ id: 1, latitude: "invalida", longitude: "-46.63" }),
      makeStation({ id: 2, latitude: "-23.55", longitude: "-46.63" }),
    ];
    const result = parseMapApiToMapPoints(stations);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("deve filtrar estações com longitude inválida", () => {
    const stations = [
      makeStation({ id: 1, latitude: "-23.55", longitude: "abc" }),
    ];
    const result = parseMapApiToMapPoints(stations);

    expect(result).toHaveLength(0);
  });

  it("deve filtrar estações com latitude e longitude vazias", () => {
    const stations = [
      makeStation({ id: 1, latitude: "", longitude: "" }),
    ];
    const result = parseMapApiToMapPoints(stations);

    expect(result).toHaveLength(0);
  });

  it("deve retornar array vazio para lista vazia de estações", () => {
    expect(parseMapApiToMapPoints([])).toEqual([]);
  });

  it("deve converter coordenadas corretamente como números", () => {
    const stations = [
      makeStation({ latitude: "-15.7801", longitude: "-47.9292" }),
    ];
    const result = parseMapApiToMapPoints(stations);

    expect(typeof result[0].lat).toBe("number");
    expect(typeof result[0].lng).toBe("number");
    expect(result[0].lat).toBe(-15.7801);
    expect(result[0].lng).toBe(-47.9292);
  });

  it("deve processar múltiplas estações, mantendo apenas as válidas", () => {
    const stations = [
      makeStation({ id: 1, latitude: "-23.5", longitude: "-46.6" }),
      makeStation({ id: 2, latitude: "nao-eh-numero", longitude: "-46.6" }),
      makeStation({ id: 3, latitude: "-15.7", longitude: "-47.9" }),
      makeStation({ id: 4, latitude: "", longitude: "" }),
    ];
    const result = parseMapApiToMapPoints(stations);

    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["1", "3"]);
  });
});

describe("stationMapUtils - countInvalidCoords", () => {
  it("deve retornar 0 quando todas as estações têm coordenadas válidas", () => {
    const stations = [
      makeStation({ id: 1, latitude: "-23.5", longitude: "-46.6" }),
      makeStation({ id: 2, latitude: "-15.7", longitude: "-47.9" }),
    ];

    expect(countInvalidCoords(stations)).toBe(0);
  });

  it("deve contar estações com coordenadas inválidas", () => {
    const stations = [
      makeStation({ id: 1, latitude: "invalida", longitude: "-46.6" }),
      makeStation({ id: 2, latitude: "-15.7", longitude: "-47.9" }),
      makeStation({ id: 3, latitude: "", longitude: "" }),
    ];

    expect(countInvalidCoords(stations)).toBe(2);
  });

  it("deve retornar 0 para lista vazia", () => {
    expect(countInvalidCoords([])).toBe(0);
  });
});
