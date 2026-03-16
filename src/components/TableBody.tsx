import type { Estacao } from '@/services/station-service';
import type { ReactNode } from 'react';

interface TableRow extends Estacao{
  id: string;
  nome: string;
  codigo: string;
}

interface TableBaseProps {
  data: TableRow[];
  renderActions: (item: TableRow) => ReactNode;
  onRowClick?: (item: TableRow) => void;
  rowClassName?: string;
}

export function TableBase({ data, renderActions, onRowClick, rowClassName }: TableBaseProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">#</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Nome</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Cidade</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Código</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-gray-50 last:border-0 transition-all ${rowClassName}`}
            >
              <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                {(index + 1).toString().padStart(2, '0')}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.nome}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{item.cidade}</td>
              <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.codigo}</td>
              <td className="px-6 py-4 text-right">
                {renderActions(item)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}