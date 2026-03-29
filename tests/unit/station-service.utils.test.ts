import { describe, expect, it } from "vitest";
import {
  getEmptyCreateStationInput,
  mapStationApiToCreateStationInput,
  mapStationApiToEstacaoModel,
  stationFilter,
  validateCreateStationInput,
  type Station,
  type StationApi,
} from "../../src/services/station-service";

describe("station-service (utils) - Critério: O cadastro deve conter pelo menos nome e localização da estação", () => {
  it("deve rejeitar cadastro sem nome e endereço (validação de campos obrigatórios)", () => {
    const empty = getEmptyCreateStationInput();
    expect(validateCreateStationInput(empty)).toBe("Preencha pelo menos Nome e Endereço.");
  });

  it("deve rejeitar cadastro sem latitude e longitude (localização incompleta)", () => {
    const input = getEmptyCreateStationInput();
    expect(
      validateCreateStationInput({
        ...input,
        name: "Estação Meteorológica Sul",
        address: "Rua das Flores, São Paulo",
      })
    ).toBe("Latitude e Longitude são obrigatórios.");
  });

  it("deve rejeitar cadastro sem código do datalogger", () => {
    const input = getEmptyCreateStationInput();
    expect(
      validateCreateStationInput({
        ...input,
        name: "Estação Meteorológica Sul",
        address: "Rua das Flores, São Paulo",
        latitude: "-23.5",
        longitude: "-46.6",
      })
    ).toBe("Código (ID Datalogger) é obrigatório.");
  });

  it("deve rejeitar cadastro sem status", () => {
    const input = getEmptyCreateStationInput();
    expect(
      validateCreateStationInput({
        ...input,
        name: "Estação Meteorológica Sul",
        address: "Rua das Flores, São Paulo",
        latitude: "-23.5",
        longitude: "-46.6",
        idDatalogger: "DL-001",
      })
    ).toBe("Status é obrigatório.");
  });

  it("deve aceitar cadastro com todos os campos obrigatórios preenchidos", () => {
    const input = getEmptyCreateStationInput();
    expect(
      validateCreateStationInput({
        ...input,
        name: "Estação Meteorológica Sul",
        address: "Rua das Flores, São Paulo",
        latitude: "-23.5",
        longitude: "-46.6",
        idDatalogger: "DL-001",
        status: "Ativa",
      })
    ).toBeNull();
  });

  it("deve mapear dados da API para modelo de exibição (listagem)", () => {
    const apiStation: StationApi = {
      id: 10,
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      idDatalogger: "DL-001",
      status: "Ativa",
      isActive: true,
      createdAt: "2020-01-01",
      updatedAt: "2020-01-02",
      createdBy: "admin",
      updatedBy: "admin",
    };

    const mapped = mapStationApiToEstacaoModel(apiStation);

    expect(mapped).toEqual({
      id: "10",
      nome: "Estação Meteorológica Sul",
      codigo: "DL-001",
      cidade: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      status: "Ativa",
      isActive: true,
    });
  });

  it("deve mapear dados da API para formulário de edição", () => {
    const apiStation: StationApi = {
      id: 1,
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      idDatalogger: "DL-001",
      status: "Ativa",
      isActive: true,
      createdAt: "",
      updatedAt: "",
      createdBy: "",
      updatedBy: "",
    };

    const mapped = mapStationApiToCreateStationInput(apiStation);

    expect(mapped).toEqual({
      name: "Estação Meteorológica Sul",
      address: "São Paulo, SP",
      latitude: "-23.5",
      longitude: "-46.6",
      idDatalogger: "DL-001",
      status: "Ativa",
      isActive: true,
    });
  });

  it("deve filtrar estações pela busca (nome ou código), facilitando gerenciamento", () => {
    const stations: Station[] = [
      { id: "1", nome: "Estação Sul", codigo: "DL-001", cidade: "São Paulo", latitude: "", longitude: "", status: "", isActive: true },
      { id: "2", nome: "Estação Norte", codigo: "DL-002", cidade: "Salvador", latitude: "", longitude: "", status: "", isActive: true },
      { id: "3", nome: "Estação Leste", codigo: "DL-003", cidade: "Recife", latitude: "", longitude: "", status: "", isActive: true },
    ];

    expect(stationFilter(stations, "")).toHaveLength(3);
    expect(stationFilter(stations, "Sul")).toEqual([stations[0]]);
    expect(stationFilter(stations, "DL-002")).toEqual([stations[1]]);
    expect(stationFilter(stations, "dl-003")).toEqual([stations[2]]);
  });
});