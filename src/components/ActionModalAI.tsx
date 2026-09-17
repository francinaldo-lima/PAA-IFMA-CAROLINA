import React, { useState } from 'react';
import { Sparkles, AlertCircle, AlertTriangle, CheckCircle2, X, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

interface AISuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (suggestion: any) => void;
}

export const AISuggestModal: React.FC<AISuggestModalProps> = ({ isOpen, onClose, onApply }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.suggestAction(prompt);
      setSuggestion(res);
    } catch (e: any) {
      setError(e.message || 'Falha ao gerar sugestão.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApply(suggestion);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        <div className="bg-[#0f5132] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h3 className="text-base font-bold">Assistente de Planejamento Institucional (IA)</h3>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descreva em linguagem livre a necessidade ou ideia da ação:
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ex: Precisamos adquirir equipamentos e modernizar o laboratório de informática para aulas práticas dos cursos técnicos..."
              className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden min-h-[90px]"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500">
              A IA estruturará o título, objetivos, metas, justificativa e indicadores técnicos.
            </span>
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Estruturando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar Proposta Estruturada</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {suggestion && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Proposta Estruturada Pronta
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  Prioridade: {suggestion.suggested_priority}
                </span>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Título Sugerido</div>
                <div className="text-xs font-bold text-slate-800">{suggestion.title}</div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Objetivo Institucional</div>
                <div className="text-xs text-slate-700">{suggestion.objective}</div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Justificativa</div>
                <div className="text-xs text-slate-700">{suggestion.justification}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Indicador</span>
                  <span className="font-semibold text-slate-800">{suggestion.indicator}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Meta Planejada</span>
                  <span className="font-semibold text-emerald-700">
                    {suggestion.target} {suggestion.measurement_unit}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aplicar Sugestão ao Formulário</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface AIAnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionData: any;
}

export const AIAnalyzeModal: React.FC<AIAnalyzeModalProps> = ({ isOpen, onClose, actionData }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.analyzeAction(actionData);
      setAnalysis(res);
    } catch (e: any) {
      setError(e.message || 'Falha ao analisar a ação.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      handleRunAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        <div className="bg-[#0f5132] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h3 className="text-base font-bold">Diagnóstico Técnico da Ação (IA)</h3>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {loading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Avaliando clareza, coerência orçamentária, cronograma e consistência técnica...
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                <span className="font-bold block mb-1">Parecer Geral:</span>
                {analysis.geral}
              </div>

              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Itens Diagnosticados ({analysis.itens?.length || 0})
                </div>

                {(!analysis.itens || analysis.itens.length === 0) ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Nenhuma inconsistência crítica detectada nesta ação!</span>
                  </div>
                ) : (
                  analysis.itens.map((it: any, idx: number) => {
                    const isError = it.tipo === 'ERRO';
                    const isAlert = it.tipo === 'ALERTA';
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          isError
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : isAlert
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-blue-50 border-blue-200 text-blue-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
                            {isAlert && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                            {!isError && !isAlert && <Sparkles className="w-4 h-4 text-blue-600" />}
                            <span>{it.tipo}: Campo &ldquo;{it.campo}&rdquo;</span>
                          </div>
                        </div>
                        <p className="font-medium text-slate-800">{it.mensagem}</p>
                        <div className="text-[11px] opacity-90 pt-1 flex items-start gap-1">
                          <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                          <span><strong>Recomendação:</strong> {it.recomendacao}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
          >
            Fechar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};

export const ActionModalAI: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  actionTitle?: string;
  currentText?: string;
  onApplyText?: (text: string) => void;
}> = ({ isOpen, onClose, onApplyText }) => {
  return (
    <AISuggestModal
      isOpen={isOpen}
      onClose={onClose}
      onApply={(sug) => {
        if (onApplyText) {
          onApplyText(`${sug.title}\n\nObjetivo: ${sug.objective}\n\nJustificativa: ${sug.justification}`);
        }
      }}
    />
  );
};

