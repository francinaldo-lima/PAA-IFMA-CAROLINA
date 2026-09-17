import React, { useState } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Target,
  FileText,
  Activity,
  Paperclip,
  History,
  CheckCheck,
  RotateCcw,
  Copy,
  Edit,
  Trash2,
  Send,
  Upload,
  Download,
  AlertTriangle,
  User as UserIcon,
  Building
} from 'lucide-react';
import { Action, Axis, Sector, User } from '../types';
import { ActionStatusBadge, PriorityBadge, ExecutionBadge } from './ActionStatusBadge';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface ActionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: Action | null;
  axes: Axis[];
  sectors: Sector[];
  users: User[];
  onEdit: (action: Action) => void;
  onRefresh: () => void;
  onOpenApproveModal: (action: Action, isApproval: boolean) => void;
}

export const ActionDetailModal: React.FC<ActionDetailModalProps> = ({
  isOpen,
  onClose,
  action,
  axes,
  sectors,
  users,
  onEdit,
  onRefresh,
  onOpenApproveModal
}) => {
  const { user, canAdmin, canApprove, canEditAction, canSubmitAction } = useAuth();
  const [activeTab, setActiveTab] = useState<'detalhes' | 'indicadores' | 'cronograma' | 'orcamento' | 'execucao' | 'anexos' | 'historico'>('detalhes');
  const [execStatus, setExecStatus] = useState<any>('NAO_INICIADA');
  const [execPercent, setExecPercent] = useState<number>(0);
  const [execValor, setExecValor] = useState<number>(0);
  const [execJustificativa, setExecJustificativa] = useState('');
  const [execResultado, setExecResultado] = useState('');
  const [isUpdatingExec, setIsUpdatingExec] = useState(false);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    if (action?.execucao) {
      setExecStatus(action.execucao.status_execucao);
      setExecPercent(action.execucao.percentual_execucao || 0);
      setExecValor(action.execucao.valor_executado || 0);
      setExecJustificativa(action.execucao.justificativa || '');
      setExecResultado(action.execucao.resultado || '');
    }
  }, [action]);

  if (!isOpen || !action) return null;

  const axis = axes.find(a => a.id === action.eixo_id);
  const sector = sectors.find(s => s.id === action.setor_id);
  const respUser = users.find(u => u.id === action.responsavel_id);

  const totalOrcamento = action.itens_orcamento?.reduce((acc, it) => acc + (it.valor_total || 0), 0) || 0;

  const handleUpdateExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingExec(true);
    try {
      await api.updateExecution(action.id, {
        status_execucao: execStatus,
        percentual_execucao: Number(execPercent),
        valor_executado: Number(execValor),
        justificativa: execJustificativa,
        resultado: execResultado
      });
      alert('Acompanhamento da execução atualizado com sucesso!');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar execução.');
    } finally {
      setIsUpdatingExec(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await api.addAttachment(action.id, {
          nome: file.name,
          tipo: file.type || 'application/octet-stream',
          tamanho: file.size,
          dados_base64: reader.result as string
        });
        alert('Evidência anexada com sucesso!');
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Erro ao anexar arquivo.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!confirm('Deseja realmente remover esta evidência?')) return;
    try {
      await api.deleteAttachment(action.id, attId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover anexo.');
    }
  };

  const handleDuplicate = async () => {
    try {
      await api.duplicateAction(action.id);
      alert('Ação duplicada como Rascunho com sucesso!');
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao duplicar ação.');
    }
  };

  const handleSubmitAction = async () => {
    if (!confirm('Deseja enviar esta ação para validação institucional?')) return;
    try {
      await api.submitAction(action.id);
      alert('Ação enviada para validação com sucesso!');
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao submeter ação.');
    }
  };

  const handleConsolidate = async () => {
    if (!confirm('Confirmar consolidação final da ação no PAA Oficial?')) return;
    try {
      await api.consolidateAction(action.id);
      alert('Ação consolidada com sucesso no PAA Oficial!');
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao consolidar ação.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Deseja realmente excluir a ação "${action.titulo}"? Esta operação é irreversível.`)) return;
    try {
      await api.deleteAction(action.id);
      alert('Ação removida com sucesso.');
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir ação.');
    }
  };

  const monthsMap = [
    { key: 'janeiro', label: 'Jan' },
    { key: 'fevereiro', label: 'Fev' },
    { key: 'marco', label: 'Mar' },
    { key: 'abril', label: 'Abr' },
    { key: 'maio', label: 'Mai' },
    { key: 'junho', label: 'Jun' },
    { key: 'julho', label: 'Jul' },
    { key: 'agosto', label: 'Ago' },
    { key: 'setembro', label: 'Set' },
    { key: 'outubro', label: 'Out' },
    { key: 'novembro', label: 'Nov' },
    { key: 'dezembro', label: 'Dez' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="bg-[#0f5132] text-white px-6 py-4 flex items-start justify-between shrink-0">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                ID: {action.id}
              </span>
              <span className="text-emerald-300/40">•</span>
              <span className="text-xs text-emerald-100 font-medium">{sector?.sigla} — {sector?.nome}</span>
            </div>
            <h2 className="text-base font-bold leading-snug">{action.titulo}</h2>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <ActionStatusBadge status={action.status} />
              <PriorityBadge priority={action.prioridade} />
              {action.execucao && (
                <div className="bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
                  <ExecutionBadge
                    status={action.execucao.status_execucao}
                    percent={action.execucao.percentual_execucao}
                  />
                </div>
              )}
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-emerald-200 hover:text-white shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto shrink-0">
          {[
            { id: 'detalhes', label: 'Detalhes Gerais', icon: FileText },
            { id: 'indicadores', label: `Indicadores (${action.indicadores?.length || 0})`, icon: Target },
            { id: 'cronograma', label: 'Cronograma 2027', icon: Calendar },
            { id: 'orcamento', label: `Orçamento (R$ ${totalOrcamento.toLocaleString('pt-BR')})`, icon: DollarSign },
            { id: 'execucao', label: 'Execução & Metas', icon: Activity },
            { id: 'anexos', label: `Evidências (${action.anexos?.length || 0})`, icon: Paperclip },
            { id: 'historico', label: `Histórico (${action.historico?.length || 0})`, icon: History }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: DETALHES GERAIS */}
          {activeTab === 'detalhes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Eixo Estratégico</span>
                  <span className="font-semibold text-slate-800">{axis?.nome || 'Não definido'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Setor Proponente</span>
                  <span className="font-semibold text-slate-800">{sector?.sigla} — {sector?.nome}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Responsável</span>
                  <span className="font-semibold text-slate-800">{respUser?.nome || 'Não atribuído'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Objetivo da Ação</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {action.objetivo}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Descrição e Metodologia</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                  {action.descricao || 'Sem descrição detalhada cadastrada.'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Justificativa Institucional</h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {action.justificativa || 'Sem justificativa cadastrada.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Público-Alvo</h4>
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    {action.publico_alvo || 'Comunidade em geral'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Observações Internas</h4>
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    {action.observacoes || 'Nenhuma observação cadastrada.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INDICADORES */}
          {activeTab === 'indicadores' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Indicador</th>
                      <th className="p-3">Unidade</th>
                      <th className="p-3">Tipo</th>
                      <th className="p-3 text-center">Linha Base</th>
                      <th className="p-3 text-center">Meta</th>
                      <th className="p-3 text-center">Realizado</th>
                      <th className="p-3 text-center">% Atingido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {action.indicadores?.map((ind, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{ind.nome}</td>
                        <td className="p-3 text-slate-600">{ind.unidade_medida}</td>
                        <td className="p-3 text-slate-600">{ind.tipo_meta}</td>
                        <td className="p-3 text-center font-mono">{ind.linha_base}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">{ind.meta}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-800">{ind.resultado || 0}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded font-bold font-mono text-xs bg-emerald-100 text-emerald-800">
                            {ind.percentual || 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CRONOGRAMA */}
          {activeTab === 'cronograma' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Meses Previstos para Execução:</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {monthsMap.map(m => {
                  const isChecked = action.cronograma ? (action.cronograma as any)[m.key] : false;
                  return (
                    <div
                      key={m.key}
                      className={`p-2.5 rounded-lg border text-center text-xs font-bold ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <span>{m.label}</span>
                      <span className="block text-[9px] font-normal mt-0.5">
                        {isChecked ? 'Ativo' : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {action.cronograma?.atividades_texto && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">
                    Detalhamento das Etapas por Período
                  </h4>
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                    {action.cronograma.atividades_texto}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ORÇAMENTO */}
          {activeTab === 'orcamento' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900">
                  Orçamento Total Planejado da Ação
                </span>
                <span className="text-sm font-bold font-mono text-emerald-800">
                  R$ {totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {(!action.itens_orcamento || action.itens_orcamento.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  Esta ação não demanda recursos orçamentários específicos (despesa zero).
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Item / Descrição</th>
                        <th className="p-2.5 text-center">Qtd</th>
                        <th className="p-2.5">Unidade</th>
                        <th className="p-2.5 text-right">Valor Unit. (R$)</th>
                        <th className="p-2.5 text-right">Valor Total (R$)</th>
                        <th className="p-2.5">Tipo</th>
                        <th className="p-2.5">Fonte</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {action.itens_orcamento.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-800">{it.descricao}</td>
                          <td className="p-2.5 text-center font-mono">{it.quantidade}</td>
                          <td className="p-2.5 text-slate-600">{it.unidade}</td>
                          <td className="p-2.5 text-right font-mono">
                            {it.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                            {it.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5 text-slate-600">{it.tipo_despesa}</td>
                          <td className="p-2.5 text-slate-600">{it.fonte_recurso}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EXECUCAO */}
          {activeTab === 'execucao' && (
            <div className="space-y-4">
              <form onSubmit={handleUpdateExecution} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Status da Execução
                    </label>
                    <select
                      value={execStatus}
                      onChange={e => setExecStatus(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-md font-semibold"
                    >
                      <option value="NAO_INICIADA">Não Iniciada</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="CONCLUIDA">Concluída</option>
                      <option value="ATRASADA">Atrasada</option>
                      <option value="PARCIALMENTE_EXECUTADA">Parcialmente Executada</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      % Execução Física (0 - 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={execPercent}
                      onChange={e => setExecPercent(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-md font-mono font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Valor Financeiro Executado (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={execValor}
                      onChange={e => setExecValor(Number(e.target.value))}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-md font-mono font-bold text-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Resultados e Metas Alcançadas até o momento
                  </label>
                  <textarea
                    value={execResultado}
                    onChange={e => setExecResultado(e.target.value)}
                    placeholder="Descreva as entregas realizadas, relatórios recebidos ou serviços concluídos..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md min-h-[60px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Justificativa de Desvios ou Atrasos (se houver)
                  </label>
                  <textarea
                    value={execJustificativa}
                    onChange={e => setExecJustificativa(e.target.value)}
                    placeholder="Caso a meta não tenha sido atingida ou esteja atrasada, relate os motivos institucionais..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md min-h-[60px]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingExec}
                    className="px-4 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    {isUpdatingExec ? 'Atualizando...' : 'Gravar Acompanhamento da Execução'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: ANEXOS / EVIDÊNCIAS */}
          {activeTab === 'anexos' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg text-center space-y-2">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">
                  Adicionar Evidência ou Documento Comprobatório
                </div>
                <p className="text-[11px] text-slate-500">
                  Suporta arquivos PDF, DOCX, XLSX, PNG, JPG (até 5MB)
                </p>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md shadow-xs transition-colors">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Enviando...' : 'Selecionar Arquivo'}</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase">
                  Arquivos Anexados ({action.anexos?.length || 0})
                </h4>

                {(!action.anexos || action.anexos.length === 0) ? (
                  <div className="text-xs text-slate-500 text-center py-4 bg-white rounded border border-slate-200">
                    Nenhuma evidência anexada até o momento.
                  </div>
                ) : (
                  action.anexos.map(att => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 truncate">{att.nome}</div>
                          <div className="text-[10px] text-slate-400">
                            {Math.round(att.tamanho / 1024)} KB • {new Date(att.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {att.dados_base64 && (
                          <a
                            href={att.dados_base64}
                            download={att.nome}
                            className="p-1.5 text-slate-600 hover:text-emerald-700"
                            title="Baixar Arquivo"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                          title="Remover Evidência"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: HISTÓRICO & TRAMITAÇÃO */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {(!action.historico || action.historico.length === 0) ? (
                  <div className="text-xs text-slate-500 text-center py-4">Sem histórico registrado.</div>
                ) : (
                  action.historico.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{h.descricao}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(h.data).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {h.usuario_nome && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Por: <strong>{h.usuario_nome}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-md transition-colors"
              title="Criar cópia desta ação"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicar</span>
            </button>

            {canEditAction(action) && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(action);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Ação</span>
              </button>
            )}

            {canAdmin && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-md border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canSubmitAction(action) && (
              <button
                onClick={handleSubmitAction}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar para Validação</span>
              </button>
            )}

            {canApprove && ['ENVIADA', 'EM_ANALISE'].includes(action.status) && (
              <>
                <button
                  onClick={() => onOpenApproveModal(action, false)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Devolver com Ajustes</span>
                </button>

                <button
                  onClick={() => onOpenApproveModal(action, true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Aprovar Ação</span>
                </button>
              </>
            )}

            {canAdmin && action.status === 'APROVADA' && (
              <button
                onClick={handleConsolidate}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Consolidar no PAA Oficial</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
