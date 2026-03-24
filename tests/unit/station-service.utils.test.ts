import { describe, expect, it } from "vitest";
import {
  getEmptyCreateStationInput,
  mapStationApiToCreateStationInput,
  mapStationApiToEstacaoModel,
  stationFilter,
  validateCreateStationInput,
  type Estacao,
  type StationApi,
} from "../../src/services/station-service";

describe("station-service (utils) - Critério: O cadastro deve conter pelo menos nome e localização da estação", () => {
  it("deve rejeitar cadastro sem nome e endereço (validação de campos obrigatórios)", () => {
    // Arrange
    const empty = getEmptyCreateStationInput();

    // Act + Assert
    // Critério de Aceitação: "O cadastro deve conter pelo menos nome e localização da estação"
    expect(validateCreateStationInput(empty)).toBe("Preencha pelo menos Nome e Endereço.");
  });

  it("deve rejeitar cadastro sem latitude e longitude (localização incompleta)", () => {
    // Arrange
    const input = getEmptyCreateStationInput();

    // Act + Assert
    // Critério de Aceitação: "O cadastro deve conter pelo menos nome e localização da estação"
    expect(
      validateCreateStationInput({
        ...input,
        name: "Estação Meteorológica Sul",
        address: "Rua das Flores, São Paulo",
      })
    ).toBe("Latitude e Longitude são obrigatórios.");
  });

  it("deve rejeitar cadastro sem código do datalogger", () => {
    // Arrange
    const input = getEmptyCreateStationInput();

    // Act + Assert
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
    // Arrange
    const input = getEmptyCreateStationInput();

    // Act + Assert
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
    // Arrange
    const input = getEmptyCreateStationInput();

    // Act + Assert
    // Critério de Aceitação: "O administrador deve conseguir cadastrar uma estação"
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
    // Arrange - Critério: "Todas as estações cadastradas devem ser listadas"
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

    // Act
    const mapped = mapStationApiToEstacaoModel(apiStation);

    // Assert
    // O sistema deve exibir: id, nome, código da estação e localização
    expect(mapped).toEqual({
      id: "10",
      nome: "Estação Meteorológica Sul",
      codigo: "DL-001",
      cidade: "São Paulo, SP",
    });
  });

  it("deve mapear dados da API para formulário de edição", () => {
    // Arrange - Critério: "O sistema deve permitir editar e remover estações"
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

    // Act
    const mapped = mapStationApiToCreateStationInput(apiStation);

    // Assert
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
    // Arrange - Critério: "Todas as estações cadastradas devem ser listadas"
    const stations: Estacao[] = [
      { id: "1", nome: "Estação Sul", codigo: "DL-001", cidade: "São Paulo" },
      { id: "2", nome: "Estação Norte", codigo: "DL-002", cidade: "Salvador" },
      { id: "3", nome: "Estação Leste", codigo: "DL-003", cidade: "Recife" },
    ];

    // Act + Assert
    expect(stationFilter(stations, "")).toHaveLength(3); // Sem filtro, retorna todas
    expect(stationFilter(stations, "Sul")).toEqual([stations[0]]); // Busca por nome
    expect(stationFilter(stations, "DL-002")).toEqual([stations[1]]); // Busca por código
    expect(stationFilter(stations, "dl-003")).toEqual([stations[2]]); // Busca case-insensitive
  });
});
