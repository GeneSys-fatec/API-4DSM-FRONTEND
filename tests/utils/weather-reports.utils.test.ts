import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import JSZip from "jszip";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import {
  getConfiguredPdfMake,
  configureDataTableExportDependencies,
  getDefaultExportButtons,
  type ExportRowsFilter,
} from "../../src/utils/weatherReportsUtils";

vi.mock("jszip");
vi.mock("pdfmake/build/pdfmake");
vi.mock("pdfmake/build/vfs_fonts");

interface MockPDFDoc {
  pageMargins?: number[];
  defaultStyle?: Record<string, string | number>;
  styles?: Record<string, unknown>;
  content: unknown[];
}

describe("Export Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getConfiguredPdfMake", () => {
    it("deve configurar o vfs do pdfMake corretamente quando pdfFonts possui estrutura aninhada", () => {
      const mockVfs = { "font1.ttf": "dados_base64_aqui" };
      
      (pdfFonts as { pdfMake?: { vfs: Record<string, string> } }).pdfMake = {
        vfs: mockVfs,
      };

      const result = getConfiguredPdfMake();

      expect(result).toBeDefined();
      expect(result).toBe(pdfMake);
    });

    it("deve configurar o vfs através de addVirtualFileSystem quando o método está disponível", () => {
      const mockVfs = { "font2.ttf": "dados_base64" };
      const addVirtualFileSystemMock = vi.fn();

      (pdfMake as { addVirtualFileSystem?: unknown }).addVirtualFileSystem = addVirtualFileSystemMock;
      (pdfFonts as { pdfMake?: { vfs: Record<string, string> } }).pdfMake = {
        vfs: mockVfs,
      };

      getConfiguredPdfMake();

      expect(addVirtualFileSystemMock).toHaveBeenCalledWith(mockVfs);
    });

    it("deve usar pdfFonts diretamente se não possuir estrutura aninhada pdfMake", () => {
      const mockVfs = { "font3.ttf": "dados_base64" };

      (pdfFonts as { pdfMake?: unknown }).pdfMake = undefined;
      Object.assign(pdfFonts as Record<string, unknown>, mockVfs);

      const result = getConfiguredPdfMake();

      expect(result).toBeDefined();
    });

    it("deve retornar pdfMake configurado", () => {
      const result = getConfiguredPdfMake();
      expect(result).toBe(pdfMake);
    });
  });

  describe("configureDataTableExportDependencies", () => {
    let mockDataTable: {
      Buttons: {
        jszip: Mock;
        pdfMake: Mock;
      };
    };

    beforeEach(() => {
      mockDataTable = {
        Buttons: {
          jszip: vi.fn(),
          pdfMake: vi.fn(),
        },
      };
    });

    it("deve registrar JSZip e pdfMake no DataTable", () => {
      (pdfMake as { vfs?: Record<string, string> }).vfs = {};

      configureDataTableExportDependencies(mockDataTable as never);

      expect(mockDataTable.Buttons.jszip).toHaveBeenCalledWith(JSZip);
      expect(mockDataTable.Buttons.pdfMake).toHaveBeenCalled();
    });

    it("deve retornar pdfReady true quando a configuração for bem-sucedida", () => {
      (pdfMake as { vfs?: Record<string, string> }).vfs = {};
      mockDataTable.Buttons.pdfMake.mockImplementation(() => {});

      const result = configureDataTableExportDependencies(mockDataTable as never);

      expect(result.pdfReady).toBe(true);
    });

    it("deve retornar pdfReady false quando ocorrer erro na configuração", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockDataTable.Buttons.pdfMake.mockImplementation(() => {
        throw new Error("Configuração falhou");
      });

      const result = configureDataTableExportDependencies(mockDataTable as never);

      expect(result.pdfReady).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("deve registrar aviso quando houver erro na configuração de PDF", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      mockDataTable.Buttons.pdfMake.mockImplementation(() => {
        throw new Error("Erro ao registrar pdfMake");
      });

      configureDataTableExportDependencies(mockDataTable as never);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Falha ao configurar exportacao PDF"),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  describe("getDefaultExportButtons", () => {
    const mockRowsFilter: ExportRowsFilter = (rowIdx: number) => rowIdx > 0;

    it("deve retornar três botões de exportação por padrão (CSV, Excel, PDF)", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter);

      expect(buttons).toHaveLength(3);
      expect(buttons.map((b) => b.extend)).toEqual([
        "csvHtml5",
        "excelHtml5",
        "pdfHtml5",
      ]);
    });

    it("deve incluir título padrão em todos os botões", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter);

      buttons.forEach((button) => {
        expect(button.title).toBe("Relatorio_Meteorologico");
      });
    });

    it("deve usar título customizado quando fornecido", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter, {
        title: "Relatorio_Customizado",
      });

      buttons.forEach((button) => {
        expect(button.title).toBe("Relatorio_Customizado");
      });
    });

    it("deve aplicar messageTop quando fornecido como string", () => {
      const headerMessage = "Dados exportados em 2024";
      const buttons = getDefaultExportButtons(mockRowsFilter, {
        headerMessage,
      });

      buttons.forEach((button) => {
        expect(button.messageTop).toBe(headerMessage);
      });
    });

    it("deve aplicar messageTop quando fornecido como função", () => {
      const headerMessage = () => "Dados dinâmicos";
      const buttons = getDefaultExportButtons(mockRowsFilter, {
        headerMessage,
      });

      buttons.forEach((button) => {
        expect(button.messageTop).toBe(headerMessage);
      });
    });

    it("deve excluir botão PDF quando includePdf for false", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter, {
        includePdf: false,
      });

      expect(buttons).toHaveLength(2);
      expect(buttons.map((b) => b.extend)).toEqual([
        "csvHtml5",
        "excelHtml5",
      ]);
    });

    it("deve incluir PDF quando includePdf for true ou não fornecido", () => {
      const buttonsWithTrue = getDefaultExportButtons(mockRowsFilter, {
        includePdf: true,
      });
      const buttonsDefault = getDefaultExportButtons(mockRowsFilter);

      expect(buttonsWithTrue).toHaveLength(3);
      expect(buttonsDefault).toHaveLength(3);
    });

    it("deve aplicar rowsFilter aos exportOptions de todos os botões", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter);

      buttons.forEach((button) => {
        expect(button.exportOptions.rows).toBe(mockRowsFilter);
      });
    });

    it("deve adicionar customize function apenas ao botão PDF", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter);

      const csvButton = buttons.find((b) => b.extend === "csvHtml5");
      const excelButton = buttons.find((b) => b.extend === "excelHtml5");
      const pdfButton = buttons.find((b) => b.extend === "pdfHtml5");

      expect(csvButton?.customize).toBeUndefined();
      expect(excelButton?.customize).toBeUndefined();
      expect(pdfButton?.customize).toBeDefined();
      expect(typeof pdfButton?.customize).toBe("function");
    });

    it("deve aplicar classes CSS apropriadas a cada botão", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter);

      expect(buttons[0].className).toBe(
        "weather-export-btn weather-export-btn--csv"
      );
      expect(buttons[1].className).toBe(
        "weather-export-btn weather-export-btn--excel"
      );
      expect(buttons[2].className).toBe(
        "weather-export-btn weather-export-btn--pdf"
      );
    });

    it("deve ter texto correto em cada botão", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter);

      expect(buttons[0].text).toBe("CSV");
      expect(buttons[1].text).toBe("Excel");
      expect(buttons[2].text).toBe("PDF");
    });

    it("deve retornar botões com configuração completa", () => {
      const buttons = getDefaultExportButtons(mockRowsFilter, {
        title: "Test_Report",
        headerMessage: "Test Header",
        includePdf: true,
      });

      buttons.forEach((button) => {
        expect(button).toHaveProperty("extend");
        expect(button).toHaveProperty("text");
        expect(button).toHaveProperty("className");
        expect(button).toHaveProperty("title", "Test_Report");
        expect(button).toHaveProperty("messageTop", "Test Header");
        expect(button).toHaveProperty("exportOptions");
      });
    });

    it("deve passar o documento para customize corretamente", () => {
      const mockRowsFilter: ExportRowsFilter = () => true;
      const buttons = getDefaultExportButtons(mockRowsFilter);
      const pdfButton = buttons.find((b) => b.extend === "pdfHtml5");

      const mockDoc: MockPDFDoc = {
        pageMargins: undefined,
        defaultStyle: undefined,
        styles: undefined,
        content: [
          {
            style: undefined,
            table: {
              headerRows: undefined,
              widths: undefined,
              body: [["Header"], ["Data"]],
            },
            layout: undefined,
          },
        ],
      };

      expect(() => {
        pdfButton?.customize?.(mockDoc);
      }).not.toThrow();
    });
  });

  describe("stylePdfBody (via customize function)", () => {
    it("deve configurar pageMargins corretamente", () => {
      const mockRowsFilter: ExportRowsFilter = () => true;
      const buttons = getDefaultExportButtons(mockRowsFilter);
      const pdfButton = buttons.find((b) => b.extend === "pdfHtml5");

      const mockDoc: MockPDFDoc = {
        pageMargins: undefined,
        defaultStyle: undefined,
        styles: undefined,
        content: [],
      };

      pdfButton?.customize?.(mockDoc);

      expect(mockDoc.pageMargins).toEqual([24, 30, 30, 24]);
    });

    it("deve configurar defaultStyle com fontSize e color corretos", () => {
      const mockRowsFilter: ExportRowsFilter = () => true;
      const buttons = getDefaultExportButtons(mockRowsFilter);
      const pdfButton = buttons.find((b) => b.extend === "pdfHtml5");

      const mockDoc: MockPDFDoc = {
        pageMargins: undefined,
        defaultStyle: undefined,
        styles: undefined,
        content: [],
      };

      pdfButton?.customize?.(mockDoc);

      expect(mockDoc.defaultStyle).toEqual({
        fontSize: 10,
        color: "#111111",
      });
    });

    it("deve aplicar estilos de tabela incluindo titulo, tableHeader e tableCell", () => {
      const mockRowsFilter: ExportRowsFilter = () => true;
      const buttons = getDefaultExportButtons(mockRowsFilter);
      const pdfButton = buttons.find((b) => b.extend === "pdfHtml5");

      const mockDoc: MockPDFDoc = {
        pageMargins: undefined,
        defaultStyle: undefined,
        styles: undefined,
        content: [],
      };

      pdfButton?.customize?.(mockDoc);

      expect(mockDoc.styles).toHaveProperty("title");
      expect(mockDoc.styles).toHaveProperty("tableHeader");
      expect(mockDoc.styles).toHaveProperty("tableCell");
      expect(mockDoc.styles).toHaveProperty("tableCellRight");
    });
  });
});