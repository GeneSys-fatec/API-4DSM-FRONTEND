import { describe, it, expect } from "vitest";
import {
  stationFilter,
  type Estacao,
} from "../../src/services/station-service";

describe("Station Service - Filtro de Estações", () => {
  const mockEstacoes: Estacao[] = [
    {
      id: "1",
      nome: "Estação SJC - Centro",
      codigo: "#123-ABC",
      cidade: "São José dos Campos",
    },
    { id: "2", nome: "Estação Jacareí", codigo: "#456-DEF", cidade: "Jacareí" },
    { id: "3", nome: "Estação Taubaté", codigo: "#789-GHI", cidade: "Taubaté" },
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
