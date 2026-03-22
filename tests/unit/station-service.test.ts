import { describe, it, expect } from "vitest";
import {
  stationFilter,
  mapStationApiToEstacaoModel,
  type Estacao,
  type StationApi
} from "../../src/services/station-service";

describe("Station Service - Filtro de Estações", () => {
  // Mock atualizado com as novas propriedades que incluímos na interface Estacao
  const mockEstacoes: Estacao[] = [
    {
      id: "1",
      nome: "Estação SJC - Centro",
      codigo: "#123-ABC",
      cidade: "São José dos Campos",
      latitude: "-23.1791",
      longitude: "-45.8872",
      status: "Operante",
      isActive: true,
    },
    { 
      id: "2", 
      nome: "Estação Jacareí", 
      codigo: "#456-DEF", 
      cidade: "Jacareí",
      latitude: "-23.3053",
      longitude: "-45.9658",
      status: "Operante",
      isActive: true, 
    },
    { 
      id: "3", 
      nome: "Estação Taubaté", 
      codigo: "#789-GHI", 
      cidade: "Taubaté",
      latitude: "-23.0273",
      longitude: "-45.5551",
      status: "Manutenção",
      isActive: false, 
    },
  ];

  it("deve retornar todas as estações quando o termo for vazio ou apenas espaços", () => {
    const resultadoVazio = stationFilter(mockEstacoes, "");
    const resultadoEspacos = stationFilter(mockEstacoes, "   ");

    expect(resultadoVazio).toHaveLength(3);
    expect(resultadoEspacos).toHaveLength(3);
  });

  it("deve filtrar as estações pelo nome ignorando maiúsculas e minúsculas", () => {
    const resultado = stationFilter(mockEstacoes, "sjc");

    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe("Estação SJC - Centro");
  });

  it("deve filtrar as estações pelo código", () => {
    const resultado = stationFilter(mockEstacoes, "456");

    expect(resultado).toHaveLength(1);
    expect(resultado[0].codigo).toBe("#456-DEF");
  });
});

describe("Station Service - Mapper", () => {
  it("deve mapear corretamente os dados do StationApi para o modelo Estacao", () => {
    // 1. Prepara o dado falso simulando o formato que vem do Backend
    const mockStationApi: StationApi = {
      id: 99,
      name: "Estação SJC Centro",
      address: "Rua Teste, 123",
      latitude: "-23.1791",
      longitude: "-45.8872",
      idDatalogger: "DATALOG-99",
      status: "Operante",
      isActive: true,
      createdAt: "2026-03-20T10:00:00.000Z",
      updatedAt: "2026-03-20T10:00:00.000Z",
      createdBy: "admin",
      updatedBy: "admin"
    };

    // 2. Roda a função de tradução
    const resultado = mapStationApiToEstacaoModel(mockStationApi);

    // 3. Verifica se todas as propriedades foram passadas para frente corretamente
    expect(resultado).toEqual({
      id: "99",
      nome: "Estação SJC Centro",
      codigo: "DATALOG-99",
      cidade: "Rua Teste, 123",
      latitude: "-23.1791",
      longitude: "-45.8872",
      status: "Operante",
      isActive: true,
    });
  });
});