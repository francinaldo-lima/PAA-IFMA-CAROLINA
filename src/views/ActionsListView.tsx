import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Copy,
  Trash2,
  Send,
  Download,
  LayoutList,
  LayoutGrid,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Action, Axis, Sector, User } from '../types';
import { ActionStatusBadge, PriorityBadge } from '../components/ActionStatusBadge';
import { useAuth } from '../context/AuthContext';

interface ActionsListViewProps {
  actions: Action[];
  axes: Axis[];
  sectors: Sector[];
  users: User[];
  onSelectAction: (action: Action) => void;
  onEditAction: (action: Action) => void;
  onNewAction: () => void;
  onDuplicateAction: (action: Action) => void;
  onDeleteAction: (action: Action) => void;
  onSubmitAction: (action: Action) => void;
}

export const ActionsListView: React.FC<ActionsListViewProps> = ({
  actions,
  axes,
  sectors,
  users,
  onSelectAction,
  onEditAction,
  onNewAction,
  onDuplicateAction,
  onDeleteAction,
  onSubmitAction
}) => {
  const { canAdmin, canCreateAction, canEditAction, canSubmitAction } = useAuth();

  const [search, setSearch] = useState('');
  const [filterEixo, setFilterEixo] = useState('');
  const [filterSetor, setFilterSetor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState('');
  const [filterOrcamento, setFilterOrcamento] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = a.titulo.toLowerCase().includes(q);
        const matchObj = a.objetivo.toLowerCase().includes(q);
        const matchId = a.id.toLowerCase().includes(q);
        if (!matchTitle && !matchObj && !matchId) return false;
      }
      if (filterEixo && a.eixo_id !== filterEixo) return false;
      if (filterSetor && a.setor_id !== filterSetor) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (filterPrioridade && a.prioridade !== filterPrioridade) return false;
      if (filterOrcamento === 'sim' && !a.possui_orcamento) return false;
      if (filterOrcamento === 'nao' && a.possui_orcamento) return false;
      return true;
    });
  }, [actions, search, filterEixo, filterSetor, filterStatus, filterPrioridade, filterOrcamento]);

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Ações do Plano de Ação Anual</h2>
          <p className="text-xs text-slate-500">
            Total de {filteredActions.length} de {actions.length} ações encontradas
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
              title="Visualização em Tabela"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-semibold ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
              title="Visualização em Cartões"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {canCreateAction && (
            <button
              onClick={onNewAction}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Ação</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título, objetivo ou ID..."
              className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          {/* Eixo */}
          <div>
            <select
              value={filterEixo}
              onChange={e => setFilterEixo(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="">Todos os Eixos</option>
              {axes.map(a => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Setor */}
          <div>
            <select
              value={filterSetor}
              onChange={e => setFilterSetor(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="">Todos os Setores</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.sigla}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="">Todos os Status</option>
              <option value="RASCUNHO">Rascunho</option>
              <option value="ENVIADA">Enviada</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="DEVOLVIDA">Devolvida</option>
              <option value="APROVADA">Aprovada</option>
              <option value="CONSOLIDADA">Consolidada</option>
              <option value="EM_EXECUCAO">Em Execução</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <select
              value={filterPrioridade}
              onChange={e => setFilterPrioridade(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            >
              <option value="">Prioridades</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main List */}
      {filteredActions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Nenhuma ação encontrada</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tente ajustar os filtros ou cadastre uma nova proposta de ação para o PAA 2027.
          </p>
          {canCreateAction && (
            <button
              onClick={onNewAction}
              className="px-4 py-2 bg-[#0f5132] text-white text-xs font-bold rounded-lg shadow-xs"
            >
              Cadastrar Nova Ação
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 w-16">ID</th>
                  <th className="p-3 min-w-[240px]">Título da Ação & Objeto</th>
                  <th className="p-3">Setor</th>
                  <th className="p-3">Eixo</th>
                  <th className="p-3 text-center">Prioridade</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Orçamento</th>
                  <th className="p-3 text-center">% Exec.</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredActions.map(action => {
                  const sector = sectors.find(s => s.id === action.setor_id);
                  const axis = axes.find(a => a.id === action.eixo_id);
                  const orc = action.itens_orcamento?.reduce((acc, c) => acc + (c.valor_total || 0), 0) || 0;

                  return (
                    <tr
                      key={action.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => onSelectAction(action)}
                    >
                      <td className="p-3 font-mono text-[11px] text-slate-400 font-semibold">
                        {action.id.slice(-6)}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                          {action.titulo}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {action.objetivo}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 font-mono">
                        {sector?.sigla || action.setor_id}
                      </td>
                      <td className="p-3 text-slate-600 max-w-[140px] truncate" title={axis?.nome}>
                        {axis?.nome.split('—')[0] || action.eixo_id}
                      </td>
                      <td className="p-3 text-center">
                        <PriorityBadge priority={action.prioridade} />
                      </td>
                      <td className="p-3 text-center">
                        <ActionStatusBadge status={action.status} />
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-800">
                        {orc > 0 ? `R$ ${orc.toLocaleString('pt-BR')}` : '—'}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-slate-700">
                        {action.execucao?.percentual_execucao || 0}%
                      </td>
                      <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectAction(action)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded"
                            title="Visualizar Detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canEditAction(action) && (
                            <button
                              onClick={() => onEditAction(action)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                              title="Editar"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canSubmitAction(action) && (
                            <button
                              onClick={() => onSubmitAction(action)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded"
                              title="Enviar para Validação"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onDuplicateAction(action)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-slate-100 rounded"
                            title="Duplicar Ação"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {canAdmin && (
                            <button
                              onClick={() => onDeleteAction(action)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map(action => {
            const sector = sectors.find(s => s.id === action.setor_id);
            const axis = axes.find(a => a.id === action.eixo_id);
            const orc = action.itens_orcamento?.reduce((acc, c) => acc + (c.valor_total || 0), 0) || 0;

            return (
              <div
                key={action.id}
                onClick={() => onSelectAction(action)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {sector?.sigla} • {action.id.slice(-6)}
                    </span>
                    <ActionStatusBadge status={action.status} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                    {action.titulo}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {action.objetivo}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <PriorityBadge priority={action.prioridade} />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Orçamento</span>
                    <span className="font-mono font-bold text-slate-800">
                      {orc > 0 ? `R$ ${orc.toLocaleString('pt-BR')}` : 'R$ 0,00'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
