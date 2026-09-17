import React, { useState } from 'react';
import { CalendarRange, Filter, Search, CheckCircle2 } from 'lucide-react';
import { Action, Axis, Sector } from '../types';
import { ActionStatusBadge } from '../components/ActionStatusBadge';

interface ScheduleViewProps {
  actions: Action[];
  axes: Axis[];
  sectors: Sector[];
  onSelectAction: (action: Action) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  actions,
  axes,
  sectors,
  onSelectAction
}) => {
  const [filterSector, setFilterSector] = useState('');
  const [filterAxis, setFilterAxis] = useState('');

  const months = [
    { key: 'janeiro', label: 'JAN' },
    { key: 'fevereiro', label: 'FEV' },
    { key: 'marco', label: 'MAR' },
    { key: 'abril', label: 'ABR' },
    { key: 'maio', label: 'MAI' },
    { key: 'junho', label: 'JUN' },
    { key: 'julho', label: 'JUL' },
    { key: 'agosto', label: 'AGO' },
    { key: 'setembro', label: 'SET' },
    { key: 'outubro', label: 'OUT' },
    { key: 'novembro', label: 'NOV' },
    { key: 'dezembro', label: 'DEZ' }
  ];

  const filtered = actions.filter(a => {
    if (filterSector && a.setor_id !== filterSector) return false;
    if (filterAxis && a.eixo_id !== filterAxis) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <CalendarRange className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Cronograma Físico Anual 2027</h2>
          </div>
          <p className="text-xs text-slate-500">
            Matriz de distribuição temporal das ações ao longo dos 12 meses do exercício institucional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSector}
            onChange={e => setFilterSector(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg"
          >
            <option value="">Todos os Setores</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>
                {s.sigla}
              </option>
            ))}
          </select>

          <select
            value={filterAxis}
            onChange={e => setFilterAxis(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg"
          >
            <option value="">Todos os Eixos</option>
            {axes.map(a => (
              <option key={a.id} value={a.id}>
                {a.nome.split('—')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3 min-w-[200px]">Ação / Objeto</th>
                <th className="p-3 text-center">Setor</th>
                {months.map(m => (
                  <th key={m.key} className="p-2.5 text-center w-12 font-mono">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(action => {
                const sec = sectors.find(s => s.id === action.setor_id);
                return (
                  <tr
                    key={action.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => onSelectAction(action)}
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-900 line-clamp-1">{action.titulo}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{action.status}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-700">
                      {sec?.sigla}
                    </td>
                    {months.map(m => {
                      const isChecked = action.cronograma ? (action.cronograma as any)[m.key] : false;
                      return (
                        <td key={m.key} className="p-2 text-center">
                          {isChecked ? (
                            <span className="inline-block w-4 h-4 bg-emerald-600 rounded-full shadow-2xs" />
                          ) : (
                            <span className="inline-block w-1.5 h-1.5 bg-slate-200 rounded-full" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
