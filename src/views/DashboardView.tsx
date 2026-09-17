import React from 'react';
import {
  Target,
  CheckCircle2,
  Clock,
  Activity,
  Award,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { DashboardStats, PAA } from '../types';
import { DashboardCharts } from '../components/DashboardCharts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  currentPAA: PAA | null;
  onNavigate: (route: string) => void;
  onOpenNewAction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  currentPAA,
  onNavigate,
  onOpenNewAction
}) => {
  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando indicadores do PAA...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with PAA Information */}
      <div className="bg-gradient-to-r from-[#0f5132] to-[#137547] rounded-xl p-5 text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-800/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {currentPAA?.campus || 'IFMA Campus Carolina'}
            </span>
            <span className="text-emerald-200/60">•</span>
            <span className="text-xs text-emerald-100">Exercício {currentPAA?.ano || 2027}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {currentPAA?.titulo || 'Plano de Ação Anual 2027'}
          </h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
            Acompanhamento em tempo real da elaboração, validação e execução das metas institucionais.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('documentos')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors"
          >
            Gerar Documento PAA
          </button>
          <button
            onClick={onOpenNewAction}
            className="px-3.5 py-2 bg-white text-[#0f5132] hover:bg-emerald-50 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            + Cadastrar Nova Ação
          </button>
        </div>
      </div>

      {/* 8 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Ações', val: stats.totalActions, icon: Target, color: 'text-slate-800', bg: 'bg-slate-100' },
          { label: 'Aprovadas', val: stats.aprovadas, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Pendentes', val: stats.enviadas + stats.emAnalise, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Em Execução', val: stats.emExecucao, icon: Activity, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Concluídas', val: stats.concluidas, icon: Award, color: 'text-teal-700', bg: 'bg-teal-50' },
          { label: 'Atrasadas', val: stats.atrasadas, icon: AlertTriangle, color: 'text-rose-700', bg: 'bg-rose-50' },
          {
            label: 'Orç. Planejado',
            val: `R$ ${(stats.orcamentoPlanejado / 1000).toFixed(0)}k`,
            icon: DollarSign,
            color: 'text-slate-800',
            bg: 'bg-slate-100',
            tooltip: `R$ ${stats.orcamentoPlanejado.toLocaleString('pt-BR')}`
          },
          {
            label: 'Orç. Executado',
            val: `R$ ${(stats.orcamentoExecutado / 1000).toFixed(0)}k`,
            icon: TrendingUp,
            color: 'text-emerald-800',
            bg: 'bg-emerald-100/60',
            tooltip: `R$ ${stats.orcamentoExecutado.toLocaleString('pt-BR')}`
          }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              title={card.tooltip}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 leading-tight">
                  {card.label}
                </span>
                <span className={`p-1 rounded-md ${card.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </span>
              </div>
              <div className={`text-lg font-bold font-mono ${card.color}`}>
                {card.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Performance Percentages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Taxa de Preenchimento', val: stats.fillRate, desc: 'Ações com metas e cronograma definidos', color: 'bg-blue-600', text: 'text-blue-700' },
          { label: 'Taxa de Aprovação', val: stats.approvalRate, desc: 'Ações validadas pelo comitê técnico', color: 'bg-emerald-600', text: 'text-emerald-700' },
          { label: 'Execução Orçamentária', val: stats.executionRate, desc: 'Recursos executados vs previstos', color: 'bg-teal-600', text: 'text-teal-700' },
          { label: 'Metas Físicas Atingidas', val: stats.physicalExecutionRate, desc: 'Resultados alcançados no período', color: 'bg-indigo-600', text: 'text-indigo-700' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
              <span className={`text-base font-bold font-mono ${item.text}`}>{item.val}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`${item.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${item.val}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Visual Charts Component */}
      <DashboardCharts stats={stats} />
    </div>
  );
};
