import JSZip from 'jszip';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

type PdfMakeWithVfs = {
  vfs: Record<string, string>;
};

type PdfFontsWithPdfMake = {
  pdfMake: PdfMakeWithVfs;
};

type PdfMakeWithAddVfs = {
  addVirtualFileSystem?: (vfs: Record<string, string>) => void;
};

type PdfFontsVfsOnly = Record<string, string>;

type DataTableButtons = {
  jszip: (zip: typeof JSZip) => void;
  pdfMake: (pdf: unknown) => void;
};

type DataTableWithButtons = {
  Buttons: DataTableButtons;
};

export type ExportRowsFilter = (rowIdx: number, rowData: unknown) => boolean;

export type ExportButtonConfig = {
  extend: 'csvHtml5' | 'excelHtml5' | 'pdfHtml5';
  text: string;
  className: string;
  exportOptions: {
    rows: ExportRowsFilter;
  };
  customize?: (doc: unknown) => void;
};

type PdfTableCell = {
  text?: string;
  fillColor?: string;
  color?: string;
  bold?: boolean;
  alignment?: string;
  margin?: [number, number, number, number];
};

type PdfTableBody = Array<Array<PdfTableCell | string | number | null | undefined>>;

type PdfDocument = {
  pageMargins?: [number, number, number, number];
  defaultStyle?: {
    fontSize?: number;
    color?: string;
  };
  styles?: Record<string, {
    fontSize?: number;
    bold?: boolean;
    color?: string;
    fillColor?: string;
    margin?: [number, number, number, number];
    alignment?: string;
  }>;
  content?: Array<{
    style?: string;
    table?: {
      headerRows?: number;
      widths?: Array<string | number>;
      body?: PdfTableBody;
    };
    layout?: string | Record<string, unknown>;
  }>;
  header?: () => unknown;
  footer?: () => unknown;
};

const stylePdfBody = (doc: PdfDocument) => {
  doc.pageMargins = [24, 30, 30, 24];
  doc.defaultStyle = {
    fontSize: 10,
    color: '#111111',
  };
  doc.styles = {
    title: {
      fontSize: 18,
      bold: false,
      color: '#111111',
      alignment: 'center',
      margin: [0, 0, 0, 18],
    },
    tableHeader: {
      bold: true,
      color: '#111111',
      fillColor: '#ffffff',
      alignment: 'left',
      margin: [0, 8, 0, 8],
    },
    tableCell: {
      margin: [0, 7, 0, 7],
    },
    tableCellRight: {
      alignment: 'right',
      margin: [0, 7, 0, 7],
    },
  };

  const tableContent = doc.content?.find((contentBlock) => Boolean(contentBlock.table));

  if (tableContent?.table?.body?.length) {
    tableContent.layout = {
      hLineWidth: (index: number, node: { table?: { body?: unknown[] } }) => {
        if (index === 0) return 0;
        if (index === 1) return 1;
        const lastLine = node.table?.body?.length ?? 0;
        if (index === lastLine) return 0;
        return 0.5;
      },
      vLineWidth: () => 0,
      hLineColor: (index: number) => (index === 1 ? '#8a8a8a' : '#d4d4d4'),
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    };

    tableContent.table.widths = [46, '*', '*', 46, 110];
    tableContent.table.body = tableContent.table.body.map((row, rowIndex) =>
      row.map((cell) => {
        const isHeaderRow = rowIndex === 0;

        if (typeof cell === 'string' || typeof cell === 'number' || cell == null) {
          return {
            text: String(cell ?? ''),
            fillColor: isHeaderRow ? '#ffffff' : rowIndex % 2 === 0 ? '#f1f1f1' : '#ffffff',
            color: '#111111',
            bold: isHeaderRow,
            alignment: 'left',
            margin: [0, 6, 0, 6],
          } as PdfTableCell;
        }

        return {
          ...cell,
          fillColor: isHeaderRow ? '#ffffff' : rowIndex % 2 === 0 ? '#f1f1f1' : '#ffffff',
          color: '#111111',
          bold: isHeaderRow,
          alignment: 'left',
          margin: [0, 6, 0, 6],
        } satisfies PdfTableCell;
      }),
    );
  }
};

export const getConfiguredPdfMake = () => {
  const pdfMakeWithVfs = pdfMake as unknown as PdfMakeWithVfs;
  const pdfMakeWithAddVfs = pdfMake as unknown as PdfMakeWithAddVfs;
  const fontsSource = pdfFonts as unknown as PdfFontsWithPdfMake | PdfFontsVfsOnly;

  const fontsVfs =
    typeof (fontsSource as PdfFontsWithPdfMake).pdfMake?.vfs === 'object'
      ? (fontsSource as PdfFontsWithPdfMake).pdfMake.vfs
      : (fontsSource as PdfFontsVfsOnly);

  if (typeof pdfMakeWithAddVfs.addVirtualFileSystem === 'function') {
    pdfMakeWithAddVfs.addVirtualFileSystem(fontsVfs);
  } else {
    pdfMakeWithVfs.vfs = fontsVfs;
  }

  return pdfMake;
};

export const configureDataTableExportDependencies = (dataTable: DataTableWithButtons) => {
  dataTable.Buttons.jszip(JSZip);

  try {
    dataTable.Buttons.pdfMake(getConfiguredPdfMake());
    return { pdfReady: true };
  } catch (error) {
    console.warn('Falha ao configurar exportacao PDF no DataTable:', error);
    return { pdfReady: false };
  }
};

export const getDefaultExportButtons = (
  rowsFilter: ExportRowsFilter,
  options?: { includePdf?: boolean },
): ExportButtonConfig[] => {
  const buttons: ExportButtonConfig[] = [
    {
      extend: 'csvHtml5',
      text: 'CSV',
      className: 'weather-export-btn weather-export-btn--csv',
      exportOptions: { rows: rowsFilter },
    },
    {
      extend: 'excelHtml5',
      text: 'Excel',
      className: 'weather-export-btn weather-export-btn--excel',
      exportOptions: { rows: rowsFilter },
    },
    {
      extend: 'pdfHtml5',
      text: 'PDF',
      className: 'weather-export-btn weather-export-btn--pdf',
      exportOptions: { rows: rowsFilter },
      customize: (doc) => stylePdfBody(doc as PdfDocument),
    }
  ];

  if (!(options?.includePdf ?? true)) {
    return buttons.filter((button) => button.extend !== 'pdfHtml5');
  }

  return buttons;
};
