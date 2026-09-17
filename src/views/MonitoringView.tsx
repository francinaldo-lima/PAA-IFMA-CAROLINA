import React, { useState } from 'react';
import { Activity, CheckCircle2, AlertTriangle, Clock, TrendingUp, Edit3 } from 'lucide-react';
import { Action, Axis, Sector } from '../types';
import { ExecutionBadge } from '../components/ActionStatusBadge';

interface MonitoringViewProps {
  actions: Action[];
  axes: Axis[];
  sectors: Sector[];
  onSelectAction: (action: Action) => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  actions,
  axes,
  sectors,
  onSelectAction
}) => {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSector, setFilterSector] = useState('');

  // Target actions for execution: approved, consolidated, em_execucao, concluida
  const execActions = actions.filter(a =>
    ['APROVADA', 'CONSOLIDADA', 'PUBLICADA', 'EM_EXECUCAO', 'CONCLUIDA'].includes(a.status)
  );

  const filtered = execActions.filter(a => {
    if (filterStatus && a.execucao?.status_execucao !== filterStatus) return false;
    if (filterSector && a.setor_id !== filterSector) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-100 text-blue-800">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Acompanhamento e Avaliação da Execução</h2>
          </div>
          <p className="text-xs text-slate-500">
            Monitoramento de alcance das metas físicas e aplicação de recursos das ações aprovadas no PAA 2027.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg"
          >
            <option value="">Todos os Status de Execução</option>
            <option value="NAO_INICIADA">Não Iniciada</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="ATRASADA">Atrasada</option>
            <option value="PARCIALMENTE_EXECUTADA">Parcialmente Executada</option>
          </select>

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
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            Nenhuma ação encontrada com os filtros selecionados.
          </div>
        ) : (
          filtered.map(action => {
            const sec = sectors.find(s => s.id === action.setor_id);
            const orcPlanejado = action.itens_orcamento?.reduce((acc, c) => acc + (c.valor_total || 0), 0) || 0;
            const pct = action.execucao?.percentual_execucao || 0;

            return (
              <div
                key={action.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-800 font-mono">{sec?.sigla}</span>
                    <span className="text-slate-300">•</span>
                    <ExecutionBadge
                      status={action.execucao?.status_execucao || 'NAO_INICIADA'}
                      percent={pct}
                    />
                  </div>

                  <h3
                    onClick={() => onSelectAction(action)}
                    className="text-sm font-bold text-slate-900 hover:text-emerald-800 cursor-pointer"
                  >
                    {action.titulo}
                  </h3>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 max-w-md overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        pct === 100
                          ? 'bg-emerald-600'
                          : pct > 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>
                      Orç. Planejado: <strong className="font-mono text-slate-800">R$ {orcPlanejado.toLocaleString('pt-BR')}</strong>
                    </span>
                    <span>
                      Orç. Executado: <strong className="font-mono text-emerald-800">R$ {(action.execucao?.valor_executado || 0).toLocaleString('pt-BR')}</strong>
                    </span>
                    <span>Evidências: <strong>{action.anexos?.length || 0}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => onSelectAction(action)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Atualizar Execução & Evidências</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
