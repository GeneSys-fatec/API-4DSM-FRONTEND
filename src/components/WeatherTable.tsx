import { ArrowLeft, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { parameterService, type Parameter } from "@/services/parameter-service";
import { stationParameterService } from "@/services/station-parameter-service";
import { listPublicStations } from "@/services/station-service";
import { measurementsService } from "@/services/measurements-service";
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import { configureDataTableExportDependencies, getDefaultExportButtons } from '@/utils/reportsUtils';
import { createPortal } from "react-dom";
import { shouldIncludeRowByDate, type ExportDateRange } from "./weatherTableDateFilter";

interface DataTableInstance {
    clear: () => DataTableInstance;
    rows: {
        add: (rows: unknown[][]) => DataTableInstance;
    };
    draw: (reset?: boolean) => void;
    destroy: () => void;
    table: () => { container: () => HTMLElement | Element };
}

interface MeasurementData {
    id: number;
    value: number | string | null;
    collectedAt: string;
    idParameter?: {
        idTypeParam?: {
            name: string;
            unit: string;
        };
    };
}

const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
        date.getHours(),
    )}:${pad(date.getMinutes())}`;
};

export function WeatherTable() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const isAdminRoute = location.pathname.includes('/admin');

    const tableRef = useRef<HTMLTableElement | null>(null);
    const dataTableRef = useRef<DataTableInstance | null>(null);
    const exportDateRangeRef = useRef<ExportDateRange>({});
    const isInvalidExportRangeRef = useRef(false);
    const controlsHostRef = useRef<HTMLDivElement | null>(null);
    const paginationHostRef = useRef<HTMLDivElement | null>(null);

    const [stationName, setStationName] = useState<string>("");
    const [stationParams, setStationParams] = useState<Parameter[]>([]);
    const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isInvalidExportRange = Boolean(fromDate && toDate && fromDate > toDate);
    const tableData = useMemo(() => measurements.map((item, index) => [
        String(index + 1),
        stationName || (id ?? ""),
        item.idParameter?.idTypeParam?.name || "--",
        `${item.value != null ? Number(item.value).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : "--"} ${item.idParameter?.idTypeParam?.unit || ""}`.trim(),
        formatDateTime(item.collectedAt),
    ]), [measurements, stationName, id]);


    useEffect(() => {
        let isMounted = true;
        const stationId = id ? Number.parseInt(id, 10) : 1;

        const loadDashboardData = async (backgroundRefresh = false) => {
            if (!backgroundRefresh) {
                setIsLoading(true);
                setError(null);
            }

            try {

                const [dbData, allParams, stationLinks, publicStations] = await Promise.all([
                    measurementsService.getMeasurements(stationId, "30d"),
                    parameterService.findAll(),
                    stationParameterService.findByStation(stationId),
                    listPublicStations()
                ]);

                if (!isMounted) return;

                const activeParams = stationLinks
                    .map((link) => allParams.find((p) => p.id === link.idTypeParam))
                    .filter((p): p is Parameter => p !== undefined);

                setStationParams(activeParams);
                setMeasurements(dbData.data);

                const currentStation = publicStations.find(s => Number(s.id) === stationId);
                if (currentStation) {
                    setStationName(currentStation.nome);
                }
            } catch (err) {
                console.error(err);
                if (!backgroundRefresh) {
                    setError("Erro ao carregar os dados da tabela.");
                }
            } finally {
                if (!backgroundRefresh && isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadDashboardData();
        const intervalId = window.setInterval(() => {
            void loadDashboardData(true);
        }, 60_000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, [id]);


    useEffect(() => {
        exportDateRangeRef.current = {
            from: fromDate || undefined,
            to: toDate || undefined,
        };
        isInvalidExportRangeRef.current = isInvalidExportRange;
        if (dataTableRef.current) {
            dataTableRef.current.draw(false);
        }
    }, [fromDate, toDate, isInvalidExportRange]);


    useEffect(() => {
        if (isLoading || !tableRef.current || dataTableRef.current) {
            return;
        }

        const tableElement = tableRef.current;
        const searchPlugins = DataTable.ext.search as Array<(
            settings: { nTable: HTMLTableElement },
            searchData: unknown[],
            _dataIndex: number,
            rowData?: unknown,
        ) => boolean>;

        const dateRangeTableFilter = (
            settings: { nTable: HTMLTableElement },
            searchData: unknown[],
            _dataIndex: number,
            rowData?: unknown,
        ) => {
            if (settings.nTable !== tableElement) return true;
            if (isInvalidExportRangeRef.current) return true;

            const resolvedRowData = Array.isArray(rowData) ? rowData : Array.isArray(searchData) ? searchData : [];
            const rowDateValue = resolvedRowData[4];
            return shouldIncludeRowByDate(rowDateValue, exportDateRangeRef.current);
        };

        searchPlugins.push(dateRangeTableFilter);

        const exportRowsByRange = (_rowIdx: number, rowData: unknown) => {
            if (isInvalidExportRangeRef.current) return true;
            const rowValues = Array.isArray(rowData) ? rowData : [];
            const rowDateValue = rowValues[4];
            return shouldIncludeRowByDate(rowDateValue, exportDateRangeRef.current);
        };

        const { pdfReady } = configureDataTableExportDependencies(DataTable);

        const table = new DataTable(tableRef.current, {
            data: tableData,
            columns: [
                { title: "ID Leitura", data: 0 },
                { title: "Estação", data: 1 },
                { title: "Parâmetro", data: 2 },
                { title: "Valor", data: 3 },
                { title: "Data/hora", data: 4 },
            ],

            createdRow: (row: HTMLTableRowElement) => {
                row.classList.add('border-b', 'border-gray-50', 'last:border-0', 'transition-all');
                const cells = Array.from(row.querySelectorAll('td')) as HTMLTableCellElement[];

                if (cells[0]) {
                    cells[0].classList.add('px-6', 'py-4', 'text-sm', 'text-gray-500', 'font-medium', 'whitespace-nowrap');
                }
                if (cells[1]) {
                    cells[1].classList.add('px-6', 'py-4', 'text-sm', 'text-gray-500');
                }
                for (let i = 2; i < cells.length; i++) {
                    if (i === 3) cells[i].classList.add('px-6', 'py-4', 'text-sm', 'font-medium', 'text-gray-900');
                    else cells[i].classList.add('px-6', 'py-4', 'text-sm', 'text-gray-500');
                }
            },

            pageLength: 10,
            destroy: true,
            autoWidth: false,
            layout: {
                topStart: {
                    buttons: getDefaultExportButtons(exportRowsByRange, { includePdf: pdfReady })
                },
                topEnd: { search: { placeholder: 'Procurar...' } },
                bottomStart: null,
                bottomEnd: { paging: { firstLast: false } }
            },
            language: {
                search: '',
                zeroRecords: 'Não encontramos dados para o intervalo selecionado.'
            },
            columnDefs: [
                { targets: [0, 1, 3, 4], searchable: false },
                { targets: 2, searchable: true }
            ]
        });

        dataTableRef.current = table;

        const wrapper = table.table().container() as HTMLElement;
        try {
            const generatedThead = wrapper.querySelector('thead');
            if (generatedThead) {
                const ths = Array.from(generatedThead.querySelectorAll('th')) as HTMLTableCellElement[];
                ths.forEach((th) => {
                    th.classList.add('px-6', 'py-4', 'text-xs', 'font-bold', 'text-gray-400', 'uppercase');
                });

            }
        } catch {
            void 0;
        }
        const layoutRows = wrapper.querySelectorAll<HTMLElement>(".dt-layout-row");
        const topControlsRow = layoutRows[0] ?? null;
        const bottomPagingRow = layoutRows[layoutRows.length - 1] ?? null;

        const controlsHost = controlsHostRef.current;
        const paginationHost = paginationHostRef.current;

        if (controlsHost && topControlsRow) {
            const topEnd = topControlsRow.querySelector<HTMLElement>(".dt-layout-end");
            const exportRangeSlot = document.createElement("div");
            exportRangeSlot.className = "weather-table-date-range-slot";

            if (topEnd) {
                const searchElement = topEnd.querySelector<HTMLElement>(".dt-search");
                if (searchElement) {
                    topEnd.appendChild(exportRangeSlot);
                } else {
                    topEnd.prepend(exportRangeSlot);
                }

            } else {
                topControlsRow.appendChild(exportRangeSlot);
            }

            setPortalTarget(exportRangeSlot);
            controlsHost.replaceChildren(topControlsRow);
        }

        if (paginationHost && bottomPagingRow) {
            paginationHost.replaceChildren(bottomPagingRow);
        }

        return () => {
            if (controlsHost) controlsHost.replaceChildren();
            if (paginationHost) paginationHost.replaceChildren();

            const pluginIndex = searchPlugins.indexOf(dateRangeTableFilter);
            if (pluginIndex >= 0) searchPlugins.splice(pluginIndex, 1);

            setPortalTarget(null);
            dataTableRef.current = null;
            table.destroy();
        };
    }, [isLoading, tableData]);

    useEffect(() => {
        if (!dataTableRef.current) {
            return;
        }

        dataTableRef.current.clear().rows.add(tableData).draw(false);
    }, [tableData]);

    return (
        <div className="min-h-full flex flex-col bg-bg-dashboard">
            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(isAdminRoute ? "/admin/selecionar-estacao" : "/")}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-all focus:outline-none shrink-0"
                            aria-label="Voltar para seleção de estações"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                            {stationName ? stationName : (id ? `Tabela: Estação ${id}` : "Visão Geral")}
                        </h2>
                    </div>
                    <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Atualizando...
                            </>
                        ) : (
                            `Atualizado: ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        )}
                    </span>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                            {error}
                        </div>
                    )}
                </div>
                {!isLoading && stationParams.length === 0 ? (
                    <div className="bg-white p-8 text-center text-gray-500 rounded-xl border border-dashed border-gray-300 mb-8">
                        Esta estação não possui nenhum parâmetro atrelado a ela. Edite a estação para adicionar medições.
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <div ref={controlsHostRef} className="weather-table-controls" />
                            {portalTarget
                                ? createPortal(
                                    <div className="weather-table-date-range" role="group" aria-label="Filtro de período da tabela">
                                        <label className="weather-table-date-range-label" htmlFor="weather-table-from-date">
                                            De:
                                            <input
                                                id="weather-table-from-date"
                                                type="date"
                                                value={fromDate}
                                                max={toDate || undefined}
                                                onChange={(event) => setFromDate(event.target.value)}
                                            />
                                        </label>
                                        <label className="weather-table-date-range-label" htmlFor="weather-table-to-date">
                                            Até:
                                            <input
                                                id="weather-table-to-date"
                                                type="date"
                                                value={toDate}
                                                min={fromDate || undefined}
                                                onChange={(event) => setToDate(event.target.value)}
                                            />
                                        </label>
                                        {(fromDate || toDate) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFromDate("");
                                                    setToDate("");
                                                }}
                                                title="Limpar filtros"
                                                aria-label="Limpar filtros"
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>,
                                    portalTarget,
                                )
                                : null}
                        </div>

                        {isInvalidExportRange ? (
                            <p className="mb-3 text-xs text-red-500">
                                O período selecionado está inválido. A data final deve ser maior ou igual à inicial.
                            </p>
                        ) : null}

                        {!isLoading && (
                            <div className="weather-table-card bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-x-auto">
                                <table ref={tableRef} id="dataTable" className="w-full text-left border-collapse min-w-full md:min-w-[720px]" />
                            </div>
                        )}

                        <div ref={paginationHostRef} className="weather-table-pagination mt-4" />
                    </>
                )}
            </main>
        </div>
    );
}