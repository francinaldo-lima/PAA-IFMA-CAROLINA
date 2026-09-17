import React from 'react';
import { ActionStatus, Priority, ExecutionStatus } from '../types';

export const ActionStatusBadge: React.FC<{ status: ActionStatus }> = ({ status }) => {
  const configs: Record<ActionStatus, { bg: string; text: string; border: string; label: string }> = {
    RASCUNHO: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', label: 'Rascunho' },
    ENVIADA: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Enviada' },
    EM_ANALISE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Em Análise' },
    DEVOLVIDA: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Devolvida' },
    APROVADA: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Aprovada' },
    CONSOLIDADA: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'Consolidada' },
    PUBLICADA: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Publicada' },
    EM_EXECUCAO: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', label: 'Em Execução' },
    CONCLUIDA: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'Concluída' }
  };

  const conf = configs[status] || configs.RASCUNHO;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${conf.bg} ${conf.text} ${conf.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75" />
      {conf.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const configs: Record<Priority, { bg: string; label: string }> = {
    ALTA: { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Alta' },
    MEDIA: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Média' },
    BAIXA: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Baixa' }
  };

  const conf = configs[priority] || configs.MEDIA;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${conf.bg}`}>
      {conf.label}
    </span>
  );
};

export const ExecutionBadge: React.FC<{ status: ExecutionStatus; percent: number }> = ({ status, percent }) => {
  const configs: Record<ExecutionStatus, { color: string; label: string }> = {
    NAO_INICIADA: { color: 'bg-slate-100 text-slate-700', label: 'Não Iniciada' },
    EM_ANDAMENTO: { color: 'bg-blue-100 text-blue-800', label: 'Em Andamento' },
    CONCLUIDA: { color: 'bg-emerald-100 text-emerald-800', label: 'Concluída' },
    ATRASADA: { color: 'bg-rose-100 text-rose-800', label: 'Atrasada' },
    PARCIALMENTE_EXECUTADA: { color: 'bg-amber-100 text-amber-800', label: 'Parcial' },
    CANCELADA: { color: 'bg-zinc-200 text-zinc-700', label: 'Cancelada' }
  };

  const conf = configs[status] || configs.NAO_INICIADA;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${conf.color}`}>
        {conf.label}
      </span>
      <span className="text-xs font-mono font-bold text-slate-700">
        {percent}%
      </span>
    </div>
  );
};
