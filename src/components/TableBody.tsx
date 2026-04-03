import type { ReactNode } from 'react';

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (item: T, index: number) => ReactNode;
  thClassName?: string;
  tdClassName?: string;
}

interface TableBaseProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  renderActions?: (item: T, index: number) => ReactNode;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string;
  getRowKey?: (item: T, index: number) => string;
}

export function TableBase<T>({
  data,
  columns,
  renderActions,
  onRowClick,
  rowClassName = '',
  getRowKey,
}: TableBaseProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">#</th>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-4 text-xs font-bold text-gray-400 uppercase ${column.thClassName ?? ''}`}
              >
                {column.header}
              </th>
            ))}
            {renderActions ? (
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Ações</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={getRowKey ? getRowKey(item, index) : String(index)}
              onClick={() => onRowClick?.(item, index)}
              className={`border-b border-gray-50 last:border-0 transition-all ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName}`}
            >
              <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                {(index + 1).toString().padStart(2, '0')}
              </td>
              {columns.map((column) => (
                <td key={column.key} className={`px-6 py-4 text-sm text-gray-500 ${column.tdClassName ?? ''}`}>
                  {column.render(item, index)}
                </td>
              ))}
              {renderActions ? <td className="px-6 py-4 text-right">{renderActions(item, index)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}