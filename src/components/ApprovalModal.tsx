import React, { useState } from 'react';
import { X, CheckCheck, RotateCcw, AlertTriangle } from 'lucide-react';
import { Action } from '../types';
import { api } from '../lib/api';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: Action | null;
  isApproval: boolean;
  onSuccess: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  action,
  isApproval,
  onSuccess
}) => {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !action) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproval && (!motivo || motivo.trim().length === 0)) {
      setError('O motivo da devolução para ajustes é obrigatório.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isApproval) {
        await api.approveAction(action.id, motivo);
      } else {
        await api.returnAction(action.id, motivo);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar validação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-auto">
        <div className={`px-5 py-4 text-white flex items-center justify-between ${
          isApproval ? 'bg-[#0f5132]' : 'bg-rose-700'
        }`}>
          <div className="flex items-center gap-2">
            {isApproval ? <CheckCheck className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
            <h3 className="text-sm font-bold">
              {isApproval ? 'Aprovação Institucional' : 'Devolução para Ajustes'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-800 line-clamp-2">
              {action.titulo}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Setor proponente: {action.setor_id}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isApproval ? 'Parecer Técnico ou Observações (Opcional)' : 'Justificativa do Parecer (Obrigatório) *'}
            </label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder={
                isApproval
                  ? 'Ação em conformidade com as diretrizes do PDI e limites orçamentários...'
                  : 'Descreva detalhadamente os pontos que necessitam de revisão técnica pelo setor...'
              }
              className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden min-h-[100px]"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-1.5 text-xs font-bold text-white rounded-md shadow-xs transition-colors ${
                isApproval ? 'bg-[#0f5132] hover:bg-[#137547]' : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              {loading ? 'Processando...' : isApproval ? 'Confirmar Aprovação' : 'Devolver com Parecer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
