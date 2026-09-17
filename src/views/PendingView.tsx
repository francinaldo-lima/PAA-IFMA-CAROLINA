import React from 'react';
import { AlertTriangle, AlertCircle, Clock, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Action, Axis, Sector } from '../types';

interface PendingViewProps {
  actions: Action[];
  axes: Axis[];
  sectors: Sector[];
  onSelectAction: (action: Action) => void;
}

export const PendingView: React.FC<PendingViewProps> = ({
  actions,
  axes,
  sectors,
  onSelectAction
}) => {
  // Collect issues
  const devolvidas = actions.filter(a => a.status === 'DEVOLVIDA');
  const semResponsavel = actions.filter(a => !a.responsavel_id);
  const semIndicador = actions.filter(a => !a.indicadores || a.indicadores.length === 0);
  const metaZerada = actions.filter(a => a.indicadores?.some(i => i.meta <= 0));
  const orcamentoIncoerente = actions.filter(a => a.possui_orcamento && (!a.itens_orcamento || a.itens_orcamento.length === 0));
  const atrasadas = actions.filter(a => a.execucao?.status_execucao === 'ATRASADA');

  const totalPendencias =
    devolvidas.length +
    semResponsavel.length +
    semIndicador.length +
    metaZerada.length +
    orcamentoIncoerente.length +
    atrasadas.length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-rose-100 text-rose-800">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Central de Pendências e Alertas</h2>
          </div>
          <p className="text-xs text-slate-500">
            Diagnóstico de inconsistências cadastrais, ações devolvidas e riscos de cronograma.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono">
          {totalPendencias} inconsistências detectadas
        </span>
      </div>

      {totalPendencias === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Excelente! Nenhuma pendência crítica encontrada</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Todas as ações cadastradas atendem aos requisitos de validação institucional, indicadores e cronograma.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Section: Ações Devolvidas */}
          {devolvidas.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Ações Devolvidas Aguardando Correção ({devolvidas.length})</span>
              </div>
              <div className="divide-y divide-rose-100">
                {devolvidas.map(a => {
                  const lastAp = a.aprovacoes?.[a.aprovacoes.length - 1];
                  return (
                    <div
                      key={a.id}
                      onClick={() => onSelectAction(a)}
                      className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-rose-50/50 p-2 rounded"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{a.titulo}</div>
                        <div className="text-[11px] text-rose-700 mt-0.5">
                          Motivo: {lastAp?.motivo || 'Revisar metas'}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Ações Atrasadas */}
          {atrasadas.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Ações com Execução Atrasada ({atrasadas.length})</span>
              </div>
              <div className="divide-y divide-amber-100">
                {atrasadas.map(a => (
                  <div
                    key={a.id}
                    onClick={() => onSelectAction(a)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-amber-50/50 p-2 rounded"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{a.titulo}</div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        {a.execucao?.justificativa || 'Sem justificativa de atraso registrada.'}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Inconsistências de cadastro */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Inconsistências Cadastrais Técnicas
            </h3>

            <div className="space-y-2 text-xs">
              {semIndicador.map(a => (
                <div
                  key={a.id}
                  onClick={() => onSelectAction(a)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-rose-700">[Sem Indicador] </span>
                    <span className="text-slate-800">{a.titulo}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}

              {orcamentoIncoerente.map(a => (
                <div
                  key={a.id}
                  onClick={() => onSelectAction(a)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-amber-700">[Orçamento Vazio] </span>
                    <span className="text-slate-800">
                      Marcada como possuindo orçamento, mas sem itens discriminados: {a.titulo}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}

              {semResponsavel.map(a => (
                <div
                  key={a.id}
                  onClick={() => onSelectAction(a)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="font-bold text-slate-600">[Sem Responsável] </span>
                    <span className="text-slate-800">{a.titulo}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
