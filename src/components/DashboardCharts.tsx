import React from 'react';
import { DashboardStats } from '../types';

interface DashboardChartsProps {
  stats: DashboardStats;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
  const maxAxis = Math.max(...stats.byAxis.map(a => a.count), 1);
  const maxSector = Math.max(...stats.bySector.map(s => s.count), 1);

  const totalOrcamento = (stats.custeioPlanejado || 0) + (stats.investimentoPlanejado || 0);
  const custeioPct = totalOrcamento > 0 ? Math.round((stats.custeioPlanejado / totalOrcamento) * 100) : 0;
  const investPct = totalOrcamento > 0 ? Math.round((stats.investimentoPlanejado / totalOrcamento) * 100) : 0;

  const statusItems = [
    { label: 'Rascunho', count: stats.rascunhos, color: 'bg-slate-300' },
    { label: 'Enviadas', count: stats.enviadas, color: 'bg-blue-400' },
    { label: 'Em Análise', count: stats.emAnalise, color: 'bg-amber-400' },
    { label: 'Devolvidas', count: stats.devolvidas, color: 'bg-rose-400' },
    { label: 'Aprovadas', count: stats.aprovadas, color: 'bg-emerald-500' },
    { label: 'Em Execução', count: stats.emExecucao, color: 'bg-cyan-500' },
    { label: 'Concluídas', count: stats.concluidas, color: 'bg-green-600' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Ações por Eixo */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ações por Eixo Estratégico</h3>
            <p className="text-xs text-slate-500">Distribuição quantitativa de ações cadastradas</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            {stats.byAxis.length} Eixos
          </span>
        </div>

        <div className="space-y-3">
          {stats.byAxis.map((ax, idx) => {
            const pct = Math.round((ax.count / maxAxis) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate max-w-[280px]" title={ax.nome}>
                    {ax.nome}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ax.count} ações</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      R$ {ax.orcamento.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 2: Status das Ações */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Distribuição por Status</h3>
            <p className="text-xs text-slate-500">Tramitação e ciclo de vida das ações</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            Total: {stats.totalActions}
          </span>
        </div>

        {/* Multi-segmented progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex mb-5">
          {statusItems.map((st, idx) => {
            const pct = stats.totalActions > 0 ? (st.count / stats.totalActions) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={idx}
                className={`${st.color} h-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
                title={`${st.label}: ${st.count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statusItems.map((st, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className={`w-3 h-3 rounded-full shrink-0 ${st.color}`} />
              <div className="min-w-0">
                <div className="text-[11px] text-slate-500 truncate">{st.label}</div>
                <div className="text-xs font-bold text-slate-800">{st.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 3: Ações por Setor */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ações por Setor Proponente</h3>
            <p className="text-xs text-slate-500">Volume de planejamento por unidade administrativa</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {stats.bySector.map((sec, idx) => {
            const pct = Math.round((sec.count / maxSector) * 100);
            return (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <span className="w-14 font-bold text-slate-700 shrink-0 font-mono">{sec.sigla}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-bold text-slate-800 w-12 text-right">{sec.count}</span>
                <span className="text-[11px] text-slate-400 w-24 text-right truncate font-mono">
                  R$ {sec.orcamento.toLocaleString('pt-BR')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart 4: Custeio vs Investimento e Execução */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Composição Orçamentária & Execução</h3>
              <p className="text-xs text-slate-500">Custeio vs Investimento e taxas globais</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              R$ {totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Custeio vs Investimento bar */}
          <div className="space-y-1.5 mb-6">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-emerald-700">Custeio: {custeioPct}%</span>
              <span className="text-indigo-700">Investimento: {investPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex">
              <div className="bg-emerald-600 h-full" style={{ width: `${custeioPct}%` }} />
              <div className="bg-indigo-600 h-full" style={{ width: `${investPct}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>R$ {stats.custeioPlanejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span>R$ {stats.investimentoPlanejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* 2 Execution gauges */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-1">Execução Orçamentária</div>
            <div className="text-xl font-bold text-emerald-700 font-mono">
              {stats.executionRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              R$ {stats.orcamentoExecutado.toLocaleString('pt-BR')} executados
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500 mb-1">Execução Física (Metas)</div>
            <div className="text-xl font-bold text-indigo-700 font-mono">
              {stats.physicalExecutionRate}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Metas físicas atingidas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
