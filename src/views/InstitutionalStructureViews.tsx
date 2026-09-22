import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Briefcase,
  GraduationCap,
  UserCheck,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Building,
  Mail,
  FileText,
  Search,
  Filter,
  Star,
  Award,
  BookOpen,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Pencil,
  X
} from 'lucide-react';
import { PAA, ManagementMember, FacultyMember, StaffMember, Sector } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ==========================================
// 1. ANO DO EXERCÍCIO VIEW
// ==========================================
export const AnoExercicioView: React.FC<{
  paaList: PAA[];
  currentPaa: PAA | null;
  onSelectPaa: (paa: PAA) => void;
  onRefresh: () => void;
}> = ({ paaList, currentPaa, onSelectPaa, onRefresh }) => {
  const { canAdmin } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ano, setAno] = useState<number>(2026);
  const [titulo, setTitulo] = useState('Plano Anual de Ação 2026');
  const [descricao, setDescricao] = useState('Plano Anual de Ação do IFMA Campus Carolina para o exercício 2026, estruturado com base no modelo do PAA 2025.');
  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState('2026-12-31');
  const [prazoPreenchimento, setPrazoPreenchimento] = useState('2025-11-30');
  const [prazoValidacao, setPrazoValidacao] = useState('2025-12-20');
  const [submitting, setSubmitting] = useState(false);

  const handleCreatePAA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createPAA({
        ano: Number(ano),
        campus: 'Campus Carolina',
        titulo,
        descricao,
        status: 'PLANEJAMENTO',
        data_inicio: dataInicio,
        data_fim: dataFim,
        prazo_preenchimento: prazoPreenchimento,
        prazo_validacao: prazoValidacao
      });
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar ano do exercício.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, anoNum: number) => {
    if (anoNum === 2025) {
      alert('O PAA 2025 é o modelo institucional de referência oficial e não pode ser excluído.');
      return;
    }
    if (!confirm(`Tem certeza que deseja excluir o PAA ${anoNum}?`)) return;
    try {
      await api.deletePAA(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir PAA.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Anos do Exercício do PAA</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Campus Carolina
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planejamento Anual de Ação por ano civil, utilizando o <strong>PAA 2025</strong> como modelo base de referência institucional.
          </p>
        </div>
        {canAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Ano de Exercício</span>
          </button>
        )}
      </div>

      {/* Model Reference Banner */}
      <div className="bg-linear-to-r from-emerald-900 to-slate-900 text-white p-5 rounded-xl border border-emerald-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-700/80 text-emerald-200 text-[10px] font-bold tracking-wider uppercase">
            <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
            Modelo Institucional Vigente
          </div>
          <h3 className="text-sm font-bold">PAA 2025 — Matriz Padrão IFMA Campus Carolina</h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            O documento oficial do PAA 2025 define a estrutura organizacional de gestão, atribuição de chefias de setores, dimensionamento orçamentário e metas estratégicas para geração dos próximos planos.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              const p2025 = paaList.find(p => p.ano === 2025);
              if (p2025) onSelectPaa(p2025);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            Consultar Modelo PAA 2025
          </button>
        </div>
      </div>

      {/* List of Exercise Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paaList.map(paa => {
          const isSelected = currentPaa?.id === paa.id;
          const isModel2025 = paa.ano === 2025;

          return (
            <div
              key={paa.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {paa.ano}
                    </span>
                    {isModel2025 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Modelo Base
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    paa.status === 'APROVADO' || paa.status === 'PUBLICADO' || paa.status === 'EM_EXECUCAO'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {paa.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">
                  {paa.titulo}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4">
                  {paa.descricao || 'Sem descrição cadastrada.'}
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Vigência:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(paa.data_inicio).toLocaleDateString('pt-BR')} a {new Date(paa.data_fim).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prazo Preenchimento:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(paa.prazo_preenchimento).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prazo Validação:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(paa.prazo_validacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                {isSelected ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Exercício Ativo
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectPaa(paa)}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <span>Ativar Exercício</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {canAdmin && !isModel2025 && (
                  <button
                    onClick={() => handleDelete(paa.id, paa.ano)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Excluir este exercício"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0f5132] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Planejamento Institucional
                </span>
                <h3 className="text-sm font-bold">Cadastrar Novo Ano de Exercício</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-emerald-200 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePAA} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Ano do Exercício *
                  </label>
                  <input
                    type="number"
                    value={ano}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setAno(val);
                      setTitulo(`Plano Anual de Ação ${val}`);
                      setDataInicio(`${val}-01-01`);
                      setDataFim(`${val}-12-31`);
                      setPrazoPreenchimento(`${val - 1}-11-30`);
                      setPrazoValidacao(`${val - 1}-12-20`);
                    }}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-bold"
                    min="2024"
                    max="2035"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Campus *
                  </label>
                  <input
                    type="text"
                    value="Campus Carolina"
                    disabled
                    className="w-full text-xs p-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Título do Plano *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Descrição e Orientações Gerais
                </label>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={e => setDataInicio(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={e => setDataFim(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Prazo Preenchimento
                  </label>
                  <input
                    type="date"
                    value={prazoPreenchimento}
                    onChange={e => setPrazoPreenchimento(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Prazo Validação
                  </label>
                  <input
                    type="date"
                    value={prazoValidacao}
                    onChange={e => setPrazoValidacao(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  {submitting ? 'Cadastrando...' : 'Cadastrar Exercício'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. EQUIPE DE GESTÃO VIEW
// ==========================================
export const EquipeGestaoView: React.FC<{ sectors: Sector[] }> = ({ sectors }) => {
  const { canAdmin } = useAuth();
  const [members, setMembers] = useState<ManagementMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [cargoFuncao, setCargoFuncao] = useState('');
  const [codigoFuncao, setCodigoFuncao] = useState('CD-02');
  const [email, setEmail] = useState('');
  const [matriculaSiape, setMatriculaSiape] = useState('');
  const [portariaDesignacao, setPortariaDesignacao] = useState('');
  const [setorId, setSetorId] = useState(sectors[0]?.id || '');
  const [ordem, setOrdem] = useState(1);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await api.getManagementTeam();
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cargoFuncao.trim() || !email.trim()) return;
    try {
      await api.createManagementMember({
        nome,
        cargo_funcao: cargoFuncao,
        codigo_funcao: codigoFuncao,
        email,
        matricula_siape: matriculaSiape,
        portaria_designacao: portariaDesignacao,
        setor_id: setorId,
        ordem: Number(ordem),
        ativo: true
      });
      setNome('');
      setCargoFuncao('');
      setEmail('');
      setMatriculaSiape('');
      setPortariaDesignacao('');
      setShowAddModal(false);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar membro da gestão.');
    }
  };

  const handleDelete = async (id: string, memberNome: string) => {
    if (!confirm(`Deseja remover ${memberNome} da Equipe de Gestão?`)) return;
    try {
      await api.deleteManagementMember(id);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir.');
    }
  };

  const filteredMembers = members.filter(m =>
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cargo_funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Equipe de Gestão</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Campus Carolina
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Direção Geral, Diretorias Sistêmicas, Departamentos e Coordenações de Gestão do Campus.
          </p>
        </div>

        {canAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Membro da Gestão</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, cargo ou e-mail..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: <strong>{filteredMembers.length}</strong> gestores
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3 w-12 text-center">Ordem</th>
              <th className="p-3">Nome / SIAPE</th>
              <th className="p-3">Cargo / Função</th>
              <th className="p-3">Código</th>
              <th className="p-3">E-mail Institucional</th>
              <th className="p-3">Portaria de Designação</th>
              <th className="p-3 text-center">Status</th>
              {canAdmin && <th className="p-3 text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredMembers.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 text-center font-bold text-slate-400">{m.ordem}</td>
                <td className="p-3">
                  <div className="font-bold text-slate-900">{m.nome}</div>
                  {m.matricula_siape && (
                    <div className="text-[10px] text-slate-400 font-mono">SIAPE: {m.matricula_siape}</div>
                  )}
                </td>
                <td className="p-3">
                  <span className="font-semibold text-emerald-900">{m.cargo_funcao}</span>
                </td>
                <td className="p-3">
                  {m.codigo_funcao ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 font-mono">
                      {m.codigo_funcao}
                    </span>
                  ) : '-'}
                </td>
                <td className="p-3 font-mono text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{m.email}</span>
                  </div>
                </td>
                <td className="p-3 text-slate-500 font-medium">
                  {m.portaria_designacao || 'Em exercício regimental'}
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Ativo
                  </span>
                </td>
                {canAdmin && (
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(m.id, m.nome)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remover da gestão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Adicionar */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0f5132] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Estrutura Organizacional
                </span>
                <h3 className="text-sm font-bold">Novo Membro da Equipe de Gestão</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-emerald-200 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Prof. Dr. João da Silva"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Cargo / Função de Gestão *
                  </label>
                  <input
                    type="text"
                    value={cargoFuncao}
                    onChange={e => setCargoFuncao(e.target.value)}
                    placeholder="Ex: Diretor de Ensino"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Código Função (CD / FG)
                  </label>
                  <select
                    value={codigoFuncao}
                    onChange={e => setCodigoFuncao(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-bold"
                  >
                    <option value="CD-02">CD-02 (Diretor-Geral)</option>
                    <option value="CD-03">CD-03 (Diretor Sistêmico)</option>
                    <option value="CD-04">CD-04 (Chefe de Depto)</option>
                    <option value="FG-01">FG-01 (Coordenador Geral)</option>
                    <option value="FG-02">FG-02 (Coordenador de Curso)</option>
                    <option value="FUC">FUC (Função de Coordenação)</option>
                    <option value="SEM_FG">Sem Função Gratificada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    E-mail Institucional *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="servidor@ifma.edu.br"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Matrícula SIAPE
                  </label>
                  <input
                    type="text"
                    value={matriculaSiape}
                    onChange={e => setMatriculaSiape(e.target.value)}
                    placeholder="Ex: 1982736"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Setor Vinculado
                  </label>
                  <select
                    value={setorId}
                    onChange={e => setSetorId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded"
                  >
                    {sectors.map(s => (
                      <option key={s.id} value={s.id}>{s.sigla} - {s.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Ordem de Precedência
                  </label>
                  <input
                    type="number"
                    value={ordem}
                    onChange={e => setOrdem(Number(e.target.value))}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-bold"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Portaria de Designação
                </label>
                <input
                  type="text"
                  value={portariaDesignacao}
                  onChange={e => setPortariaDesignacao(e.target.value)}
                  placeholder="Ex: Portaria nº 142/2024 - GR/IFMA"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  Cadastrar Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. CORPO DOCENTE VIEW
// (com determinação de chefia de função de setor)
// ==========================================
export const CorpoDocenteView: React.FC<{ sectors: Sector[] }> = ({ sectors }) => {
  const { canAdmin } = useAuth();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChefia, setFilterChefia] = useState<'TODOS' | 'CHEFIA' | 'DOCENTE'>('TODOS');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [matriculaSiape, setMatriculaSiape] = useState('');
  const [email, setEmail] = useState('');
  const [titulacao, setTitulacao] = useState<'Graduado' | 'Especialista' | 'Mestre' | 'Doutor' | 'Pós-Doutor'>('Mestre');
  const [areaDisciplina, setAreaDisciplina] = useState('');
  const [regimeTrabalho, setRegimeTrabalho] = useState<'20h' | '40h' | '40h DE' | 'Substituto'>('40h DE');
  const [setorLotacaoId, setSetorLotacaoId] = useState(sectors[0]?.id || '');

  // Determinar Chefia de Função do Setor (requisito do usuário)
  const [eChefiaSetor, setEChefiaSetor] = useState(false);
  const [funcaoChefia, setFuncaoChefia] = useState('');
  const [codigoFuncaoChefia, setCodigoFuncaoChefia] = useState('FG-02');
  const [setorChefiaId, setSetorChefiaId] = useState(sectors[0]?.id || '');

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await api.getFaculty();
      setFaculty(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !matriculaSiape.trim() || !email.trim()) return;
    try {
      await api.createFacultyMember({
        nome,
        matricula_siape: matriculaSiape,
        email,
        titulacao,
        area_disciplina: areaDisciplina,
        regime_trabalho: regimeTrabalho,
        setor_lotacao_id: setorLotacaoId,
        e_chefia_setor: eChefiaSetor,
        funcao_chefia: eChefiaSetor ? funcaoChefia : undefined,
        codigo_funcao_chefia: eChefiaSetor ? codigoFuncaoChefia : undefined,
        setor_chefia_id: eChefiaSetor ? setorChefiaId : undefined,
        ativo: true
      });
      setNome('');
      setMatriculaSiape('');
      setEmail('');
      setAreaDisciplina('');
      setEChefiaSetor(false);
      setFuncaoChefia('');
      setShowAddModal(false);
      fetchFaculty();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar docente.');
    }
  };

  const handleDelete = async (id: string, docNome: string) => {
    if (!confirm(`Deseja remover o docente ${docNome}?`)) return;
    try {
      await api.deleteFacultyMember(id);
      fetchFaculty();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir.');
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch =
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.area_disciplina.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.funcao_chefia && f.funcao_chefia.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterChefia === 'CHEFIA') return matchesSearch && f.e_chefia_setor;
    if (filterChefia === 'DOCENTE') return matchesSearch && !f.e_chefia_setor;
    return matchesSearch;
  });

  const chefiasCount = faculty.filter(f => f.e_chefia_setor).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Corpo Docente</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Campus Carolina
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Professores do Magistério Federal do IFMA Campus Carolina com a <strong>opção de determinar as chefias de função do setor</strong>.
          </p>
        </div>

        {canAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Docente</span>
          </button>
        )}
      </div>

      {/* Info Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total de Docentes</div>
            <div className="text-lg font-bold text-slate-900">{faculty.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Docentes em Chefia de Setor</div>
            <div className="text-lg font-bold text-amber-700">{chefiasCount} autorizados p/ login</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Regime 40h DE</div>
            <div className="text-lg font-bold text-slate-800">
              {faculty.filter(f => f.regime_trabalho === '40h DE').length}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar docente por nome, área ou função..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Filtrar:</span>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setFilterChefia('TODOS')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterChefia === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos ({faculty.length})
            </button>
            <button
              onClick={() => setFilterChefia('CHEFIA')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterChefia === 'CHEFIA' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Em Chefia ({chefiasCount})
            </button>
            <button
              onClick={() => setFilterChefia('DOCENTE')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterChefia === 'DOCENTE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Docentes ({faculty.length - chefiasCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3">Docente / SIAPE</th>
              <th className="p-3">Titulação</th>
              <th className="p-3">Área de Atuação</th>
              <th className="p-3">Regime</th>
              <th className="p-3">Chefia de Função / Setor</th>
              <th className="p-3">E-mail Institucional</th>
              {canAdmin && <th className="p-3 text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredFaculty.map(f => {
              const sectorChefia = sectors.find(s => s.id === f.setor_chefia_id);

              return (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{f.nome}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SIAPE: {f.matricula_siape}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {f.titulacao}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">{f.area_disciplina}</td>
                  <td className="p-3">
                    <span className="text-slate-600 font-semibold">{f.regime_trabalho}</span>
                  </td>
                  <td className="p-3">
                    {f.e_chefia_setor ? (
                      <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{f.funcao_chefia || 'Chefia de Setor'}</span>
                        </div>
                        {f.codigo_funcao_chefia && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            [{f.codigo_funcao_chefia}] {sectorChefia?.sigla ? `• ${sectorChefia.sigla}` : ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Sem função de chefia</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{f.email}</span>
                    </div>
                  </td>
                  {canAdmin && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(f.id, f.nome)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remover docente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Adicionar Docente */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0f5132] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Corpo Docente • IFMA Campus Carolina
                </span>
                <h3 className="text-sm font-bold">Cadastrar Novo Docente</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-emerald-200 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nome Completo do Docente *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Prof. Dr. Anderson da Costa"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Matrícula SIAPE *
                  </label>
                  <input
                    type="text"
                    value={matriculaSiape}
                    onChange={e => setMatriculaSiape(e.target.value)}
                    placeholder="Ex: 2198471"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    E-mail Institucional (@ifma.edu.br) *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="professor@ifma.edu.br"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Titulação *
                  </label>
                  <select
                    value={titulacao}
                    onChange={e => setTitulacao(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-bold"
                  >
                    <option value="Graduado">Graduado</option>
                    <option value="Especialista">Especialista</option>
                    <option value="Mestre">Mestre</option>
                    <option value="Doutor">Doutor</option>
                    <option value="Pós-Doutor">Pós-Doutor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Regime de Trabalho
                  </label>
                  <select
                    value={regimeTrabalho}
                    onChange={e => setRegimeTrabalho(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-bold"
                  >
                    <option value="40h DE">40h Dedicação Exclusiva (DE)</option>
                    <option value="40h">40h Semanal</option>
                    <option value="20h">20h Semanal</option>
                    <option value="Substituto">Professor Substituto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Área / Disciplina de Atuação *
                </label>
                <input
                  type="text"
                  value={areaDisciplina}
                  onChange={e => setAreaDisciplina(e.target.value)}
                  placeholder="Ex: Informática / Redes e Desenvolvimento Web"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded"
                  required
                />
              </div>

              {/* OPÇÃO DE DETERMINAR CHEFIA DE FUNÇÃO DO SETOR */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Determinar Chefia de Função do Setor
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Habilita o docente para efetuar login institucional no PAA como chefia setorial.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eChefiaSetor}
                      onChange={e => setEChefiaSetor(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700"></div>
                  </label>
                </div>

                {eChefiaSetor && (
                  <div className="space-y-3 pt-2 border-t border-emerald-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                          Função / Cargo de Chefia *
                        </label>
                        <input
                          type="text"
                          value={funcaoChefia}
                          onChange={e => setFuncaoChefia(e.target.value)}
                          placeholder="Ex: Coordenador do Curso Técnico"
                          className="w-full text-xs p-2 border border-emerald-300 rounded bg-white"
                          required={eChefiaSetor}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                          Código da Função (FG / CD / FUC)
                        </label>
                        <input
                          type="text"
                          value={codigoFuncaoChefia}
                          onChange={e => setCodigoFuncaoChefia(e.target.value)}
                          placeholder="Ex: FG-02 ou FUC"
                          className="w-full text-xs p-2 border border-emerald-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                        Setor da Chefia Vinculado *
                      </label>
                      <select
                        value={setorChefiaId}
                        onChange={e => setSetorChefiaId(e.target.value)}
                        className="w-full text-xs p-2 border border-emerald-300 rounded bg-white font-medium"
                      >
                        {sectors.map(s => (
                          <option key={s.id} value={s.id}>{s.sigla} - {s.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  Cadastrar Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. TÉCNICOS ADMINISTRATIVOS VIEW
// (com determinação de chefia de função de setor)
// ==========================================
export const TecnicosAdministrativosView: React.FC<{ sectors: Sector[] }> = ({ sectors }) => {
  const { canAdmin } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChefia, setFilterChefia] = useState<'TODOS' | 'CHEFIA' | 'TAE'>('TODOS');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [matriculaSiape, setMatriculaSiape] = useState('');
  const [email, setEmail] = useState('');
  const [cargoEfetivo, setCargoEfetivo] = useState('Assistente em Administração');
  const [nivelClassificacao, setNivelClassificacao] = useState<'C' | 'D' | 'E'>('D');
  const [setorLotacaoId, setSetorLotacaoId] = useState(sectors[0]?.id || '');

  // Determinar Chefia de Função do Setor (requisito do usuário)
  const [eChefiaSetor, setEChefiaSetor] = useState(false);
  const [funcaoChefia, setFuncaoChefia] = useState('');
  const [codigoFuncaoChefia, setCodigoFuncaoChefia] = useState('FG-01');
  const [setorChefiaId, setSetorChefiaId] = useState(sectors[0]?.id || '');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff();
      setStaff(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !matriculaSiape.trim() || !email.trim()) return;
    try {
      await api.createStaffMember({
        nome,
        matricula_siape: matriculaSiape,
        email,
        cargo_efetivo: cargoEfetivo,
        nivel_classificacao: nivelClassificacao,
        setor_lotacao_id: setorLotacaoId,
        e_chefia_setor: eChefiaSetor,
        funcao_chefia: eChefiaSetor ? funcaoChefia : undefined,
        codigo_funcao_chefia: eChefiaSetor ? codigoFuncaoChefia : undefined,
        setor_chefia_id: eChefiaSetor ? setorChefiaId : undefined,
        ativo: true
      });
      setNome('');
      setMatriculaSiape('');
      setEmail('');
      setEChefiaSetor(false);
      setFuncaoChefia('');
      setShowAddModal(false);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar técnico-administrativo.');
    }
  };

  const handleDelete = async (id: string, staffNome: string) => {
    if (!confirm(`Deseja remover o servidor ${staffNome}?`)) return;
    try {
      await api.deleteStaffMember(id);
      fetchStaff();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir.');
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch =
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cargo_efetivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.funcao_chefia && s.funcao_chefia.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterChefia === 'CHEFIA') return matchesSearch && s.e_chefia_setor;
    if (filterChefia === 'TAE') return matchesSearch && !s.e_chefia_setor;
    return matchesSearch;
  });

  const chefiasCount = staff.filter(s => s.e_chefia_setor).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Técnicos Administrativos (TAE)</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Campus Carolina
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Servidores Técnicos Administrativos em Educação com a <strong>opção de determinar as chefias de função do setor</strong>.
          </p>
        </div>

        {canAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Técnico (TAE)</span>
          </button>
        )}
      </div>

      {/* Info Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total de Servidores TAE</div>
            <div className="text-lg font-bold text-slate-900">{staff.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">TAEs em Chefia de Setor</div>
            <div className="text-lg font-bold text-amber-700">{chefiasCount} autorizados p/ login</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Setores com Chefia Ativa</div>
            <div className="text-lg font-bold text-slate-800">
              {new Set(staff.filter(s => s.e_chefia_setor).map(s => s.setor_chefia_id)).size} setores
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar técnico por nome, cargo ou chefia..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Filtrar:</span>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setFilterChefia('TODOS')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterChefia === 'TODOS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos ({staff.length})
            </button>
            <button
              onClick={() => setFilterChefia('CHEFIA')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterChefia === 'CHEFIA' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Em Chefia ({chefiasCount})
            </button>
            <button
              onClick={() => setFilterChefia('TAE')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterChefia === 'TAE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Técnicos ({staff.length - chefiasCount})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3">Servidor / SIAPE</th>
              <th className="p-3">Cargo Efetivo</th>
              <th className="p-3">Nível</th>
              <th className="p-3">Setor de Lotação</th>
              <th className="p-3">Chefia de Função / Setor</th>
              <th className="p-3">E-mail Institucional</th>
              {canAdmin && <th className="p-3 text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredStaff.map(s => {
              const sectorLotacao = sectors.find(sec => sec.id === s.setor_lotacao_id);
              const sectorChefia = sectors.find(sec => sec.id === s.setor_chefia_id);

              return (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{s.nome}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SIAPE: {s.matricula_siape}</div>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{s.cargo_efetivo}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      Nível {s.nivel_classificacao}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {sectorLotacao ? `${sectorLotacao.sigla} - ${sectorLotacao.nome}` : '-'}
                  </td>
                  <td className="p-3">
                    {s.e_chefia_setor ? (
                      <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{s.funcao_chefia || 'Chefia de Setor'}</span>
                        </div>
                        {s.codigo_funcao_chefia && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            [{s.codigo_funcao_chefia}] {sectorChefia?.sigla ? `• ${sectorChefia.sigla}` : ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Sem função de chefia</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{s.email}</span>
                    </div>
                  </td>
                  {canAdmin && (
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(s.id, s.nome)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Remover servidor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Adicionar TAE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#0f5132] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Técnicos Administrativos • IFMA Campus Carolina
                </span>
                <h3 className="text-sm font-bold">Cadastrar Novo Servidor TAE</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-emerald-200 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Nome Completo do Servidor *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Maria das Graças Pereira"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Matrícula SIAPE *
                  </label>
                  <input
                    type="text"
                    value={matriculaSiape}
                    onChange={e => setMatriculaSiape(e.target.value)}
                    placeholder="Ex: 3182741"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    E-mail Institucional (@ifma.edu.br) *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="servidor@ifma.edu.br"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Cargo Efetivo *
                  </label>
                  <input
                    type="text"
                    value={cargoEfetivo}
                    onChange={e => setCargoEfetivo(e.target.value)}
                    placeholder="Ex: Assistente em Administração"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nível de Classificação
                  </label>
                  <select
                    value={nivelClassificacao}
                    onChange={e => setNivelClassificacao(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded font-bold"
                  >
                    <option value="C">Nível C (Fundamental)</option>
                    <option value="D">Nível D (Médio / Técnico)</option>
                    <option value="E">Nível E (Superior)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Setor de Lotação
                </label>
                <select
                  value={setorLotacaoId}
                  onChange={e => setSetorLotacaoId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded"
                >
                  {sectors.map(s => (
                    <option key={s.id} value={s.id}>{s.sigla} - {s.nome}</option>
                  ))}
                </select>
              </div>

              {/* OPÇÃO DE DETERMINAR CHEFIA DE FUNÇÃO DO SETOR */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      Determinar Chefia de Função do Setor
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      Habilita o servidor TAE para efetuar login institucional no PAA como chefia setorial.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eChefiaSetor}
                      onChange={e => setEChefiaSetor(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-700"></div>
                  </label>
                </div>

                {eChefiaSetor && (
                  <div className="space-y-3 pt-2 border-t border-emerald-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                          Função / Cargo de Chefia *
                        </label>
                        <input
                          type="text"
                          value={funcaoChefia}
                          onChange={e => setFuncaoChefia(e.target.value)}
                          placeholder="Ex: Chefe de Gabinete / Coordenador"
                          className="w-full text-xs p-2 border border-emerald-300 rounded bg-white"
                          required={eChefiaSetor}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                          Código da Função (FG / CD)
                        </label>
                        <input
                          type="text"
                          value={codigoFuncaoChefia}
                          onChange={e => setCodigoFuncaoChefia(e.target.value)}
                          placeholder="Ex: FG-01 ou CD-04"
                          className="w-full text-xs p-2 border border-emerald-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
                        Setor da Chefia Vinculado *
                      </label>
                      <select
                        value={setorChefiaId}
                        onChange={e => setSetorChefiaId(e.target.value)}
                        className="w-full text-xs p-2 border border-emerald-300 rounded bg-white font-medium"
                      >
                        {sectors.map(s => (
                          <option key={s.id} value={s.id}>{s.sigla} - {s.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  Cadastrar Servidor TAE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
