import React, { useState } from 'react';
import { CheckCheck, RotateCcw, Eye, Clock, ShieldCheck, Filter, AlertCircle } from 'lucide-react';
import { Action, Axis, Sector } from '../types';
import { ActionStatusBadge, PriorityBadge } from '../components/ActionStatusBadge';

interface ApprovalsViewProps {
  actions: Action[];
  axes: Axis[];
  sectors: Sector[];
  onSelectAction: (action: Action) => void;
  onOpenApproveModal: (action: Action, isApproval: boolean) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  actions,
  axes,
  sectors,
  onSelectAction,
  onOpenApproveModal
}) => {
  const [filterSector, setFilterSector] = useState('');

  const pendingActions = actions.filter(a =>
    ['ENVIADA', 'EM_ANALISE'].includes(a.status) &&
    (!filterSector || a.setor_id === filterSector)
  );

  const reviewedActions = actions.filter(a =>
    ['APROVADA', 'DEVOLVIDA', 'CONSOLIDADA'].includes(a.status) &&
    (!filterSector || a.setor_id === filterSector)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-amber-100 text-amber-800">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Módulo de Validação e Homologação</h2>
          </div>
          <p className="text-xs text-slate-500">
            Apreciação técnica das propostas enviadas pelos setores antes da consolidação final no PAA 2027.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSector}
            onChange={e => setFilterSector(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          >
            <option value="">Todos os Setores</option>
            {sectors.map(s => (
              <option key={s.id} value={s.id}>
                {s.sigla} — {s.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pending Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Fila de Ações Aguardando Parecer</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
              {pendingActions.length} pendentes
            </span>
          </h3>
        </div>

        {pendingActions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
            <CheckCheck className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-slate-700">Tudo em dia!</p>
            <p>Nenhuma ação pendente de validação no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingActions.map(action => {
              const sec = sectors.find(s => s.id === action.setor_id);
              const axis = axes.find(a => a.id === action.eixo_id);
              const orc = action.itens_orcamento?.reduce((acc, c) => acc + (c.valor_total || 0), 0) || 0;

              return (
                <div
                  key={action.id}
                  className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs hover:border-amber-400 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-bold text-slate-800 font-mono">{sec?.sigla}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{axis?.nome.split('—')[0]}</span>
                      <PriorityBadge priority={action.prioridade} />
                      <ActionStatusBadge status={action.status} />
                    </div>

                    <h4
                      onClick={() => onSelectAction(action)}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-800 cursor-pointer"
                    >
                      {action.titulo}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {action.objetivo}
                    </p>

                    <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500">
                      <span>Indicadores: <strong>{action.indicadores?.length || 0}</strong></span>
                      <span>
                        Orçamento:{' '}
                        <strong className="font-mono text-slate-800">
                          {orc > 0 ? `R$ ${orc.toLocaleString('pt-BR')}` : 'Sem custo'}
                        </strong>
                      </span>
                      <span>Criado em: {new Date(action.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => onSelectAction(action)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalhes</span>
                    </button>

                    <button
                      onClick={() => onOpenApproveModal(action, false)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Devolver</span>
                    </button>

                    <button
                      onClick={() => onOpenApproveModal(action, true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-md shadow-xs transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History of validated actions */}
      <div className="space-y-3 pt-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Ações Recentemente Validadas / Devolvidas ({reviewedActions.length})
        </h3>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Título da Ação</th>
                  <th className="p-3">Setor</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3">Último Parecer / Tramitação</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reviewedActions.slice(0, 10).map(act => {
                  const sec = sectors.find(s => s.id === act.setor_id);
                  const lastApproval = act.aprovacoes?.[act.aprovacoes.length - 1];

                  return (
                    <tr key={act.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800 max-w-sm truncate">
                        {act.titulo}
                      </td>
                      <td className="p-3 font-mono">{sec?.sigla}</td>
                      <td className="p-3 text-center">
                        <ActionStatusBadge status={act.status} />
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">
                        {lastApproval?.motivo || 'Parecer padrão homologado'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onSelectAction(act)}
                          className="text-xs text-emerald-700 hover:underline font-semibold"
                        >
                          Ver Histórico
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
