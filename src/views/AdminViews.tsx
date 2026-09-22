import React, { useState } from 'react';
import {
  Network,
  Compass,
  Users,
  History,
  Settings,
  Info,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  BookTemplate,
  Shield,
  Building
} from 'lucide-react';
import { Axis, Sector, User, AuditLog, InstitutionSettings, ActionTemplate } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// --- SECTORS VIEW ---
export const SectorsView: React.FC<{
  sectors: Sector[];
  onRefresh: () => void;
}> = ({ sectors, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !sigla.trim()) return;
    try {
      await api.createSector({ nome, sigla, descricao, ativo: true });
      setNome('');
      setSigla('');
      setDescricao('');
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este setor?')) return;
    try {
      await api.deleteSector(id);
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Setores do IFMA Campus Carolina</h2>
          <p className="text-xs text-slate-500">Unidades organizacionais proponentes de ações</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create form */}
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 h-fit">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Novo Setor</h3>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Sigla *</label>
            <input
              type="text"
              value={sigla}
              onChange={e => setSigla(e.target.value)}
              placeholder="Ex: CTIC"
              className="w-full text-xs p-2 border border-slate-300 rounded font-mono font-bold uppercase"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nome Completo *</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Coordenação de Tecnologia da Informação"
              className="w-full text-xs p-2 border border-slate-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Descrição</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded min-h-[70px]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded shadow-xs"
          >
            Cadastrar Setor
          </button>
        </form>

        {/* List */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Sigla</th>
                <th className="p-3">Nome da Unidade</th>
                <th className="p-3">Descrição</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sectors.map(sec => (
                <tr key={sec.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-emerald-800">{sec.sigla}</td>
                  <td className="p-3 font-semibold text-slate-800">{sec.nome}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate">{sec.descricao}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(sec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- AXES VIEW ---
export const AxesView: React.FC<{
  axes: Axis[];
  onRefresh: () => void;
}> = ({ axes, onRefresh }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    try {
      await api.createAxis({
        nome,
        descricao,
        ordem: axes.length + 1,
        ativo: true
      });
      setNome('');
      setDescricao('');
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este eixo?')) return;
    try {
      await api.deleteAxis(id);
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Eixos Estratégicos do PAA</h2>
          <p className="text-xs text-slate-500">Diretrizes temáticas alinhadas ao PDI do IFMA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 h-fit">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Novo Eixo Temático</h3>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nome do Eixo *</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Eixo 7 — Inovação Tecnológica"
              className="w-full text-xs p-2 border border-slate-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Descrição / Escopo</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded min-h-[70px]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded shadow-xs"
          >
            Cadastrar Eixo
          </button>
        </form>

        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3 w-14 text-center">Ordem</th>
                <th className="p-3">Eixo Temático</th>
                <th className="p-3">Descrição</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {axes.map(ax => (
                <tr key={ax.id} className="hover:bg-slate-50">
                  <td className="p-3 text-center font-mono font-bold text-slate-500">{ax.ordem}</td>
                  <td className="p-3 font-semibold text-slate-800">{ax.nome}</td>
                  <td className="p-3 text-slate-500 max-w-xs truncate">{ax.descricao}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(ax.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- USERS VIEW ---
export const UsersView: React.FC<{
  users: User[];
  sectors: Sector[];
  onRefresh: () => void;
}> = ({ users, sectors, onRefresh }) => {
  const { isInstitutionalAdmin, user } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<any>('RESPONSAVEL_ACAO');
  const [sectorId, setSectorId] = useState(sectors[0]?.id || '');

  if (!isInstitutionalAdmin) {
    return (
      <div className="bg-white p-8 rounded-xl border border-rose-200 shadow-xs max-w-2xl mx-auto my-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900">Acesso Restrito ao Módulo de Usuários e Perfis</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Conforme regra de segurança institucional do IFMA Campus Carolina, a gestão de <strong>Usuários e Perfis Institucionais</strong> é restrita exclusivamente aos administradores do sistema:
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 space-y-1.5 text-left max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
            <span>Fernando Lima — <code className="font-mono text-emerald-800">fernando.lima@ifma.edu.br</code></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
            <span>Francinaldo Lima — <code className="font-mono text-emerald-800">francinaldo.lima@ifma.edu.br</code></span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          Usuário conectado atualmente: <strong>{user?.email || 'Não autenticado'}</strong>
        </p>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) return;
    try {
      await api.createUser({
        nome,
        email,
        role,
        sector_id: sectorId,
        ativo: true
      });
      setNome('');
      setEmail('');
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja desativar/remover este usuário?')) return;
    try {
      await api.deleteUser(id);
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Usuários e Perfis Institucionais (RBAC)</h2>
          <p className="text-xs text-slate-500">Gestão de permissões de acesso ao sistema do PAA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 h-fit">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Novo Usuário</h3>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nome Completo *</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">E-mail Institucional *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Perfil de Acesso</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as any)}
              className="w-full text-xs p-2 border border-slate-300 rounded font-semibold"
            >
              <option value="ADMIN">ADMIN (Direção / Gestor do PAA)</option>
              <option value="GESTOR_SETOR">GESTOR_SETOR (Chefe de Departamento)</option>
              <option value="RESPONSAVEL_ACAO">RESPONSAVEL_ACAO (Servidor Técnico / Docente)</option>
              <option value="VALIDADOR">VALIDADOR (Comissão de Validação)</option>
              <option value="CONSULTA">CONSULTA (Somente Leitura)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Setor Vinculado</label>
            <select
              value={sectorId}
              onChange={e => setSectorId(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded"
            >
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.sigla} — {s.nome}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded shadow-xs"
          >
            Cadastrar Usuário
          </button>
        </form>

        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Perfil</th>
                <th className="p-3">Setor</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(u => {
                const sec = sectors.find(s => s.id === u.sector_id);
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{u.nome}</td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{sec?.sigla || '—'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
};

// --- AUDIT LOGS VIEW ---
export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  React.useEffect(() => {
    api.getAuditLogs().then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Trilha de Auditoria Institucional (Audit Log)</h2>
        <p className="text-xs text-slate-500">Registro indelével de operações, homologações e alterações no sistema</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
            <tr>
              <th className="p-3">Data e Hora</th>
              <th className="p-3">Usuário</th>
              <th className="p-3">Operação</th>
              <th className="p-3">Entidade</th>
              <th className="p-3">Identificador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map(l => (
              <tr key={l.id} className="hover:bg-slate-50 font-mono text-[11px]">
                <td className="p-3 text-slate-500">{new Date(l.created_at).toLocaleString('pt-BR')}</td>
                <td className="p-3 font-bold text-slate-800 font-sans">{l.user_name || 'Sistema'}</td>
                <td className="p-3">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">
                    {l.action}
                  </span>
                </td>
                <td className="p-3 text-slate-600">{l.entity}</td>
                <td className="p-3 text-slate-400">{l.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- SETTINGS VIEW ---
export const SettingsView: React.FC<{
  settings: InstitutionSettings | null;
  onSaveSettings: (settings: Partial<InstitutionSettings>) => Promise<void>;
  onCleanDemo: () => void;
}> = ({ settings, onSaveSettings, onCleanDemo }) => {
  const [form, setForm] = useState<InstitutionSettings>(settings || {
    nome_instituicao: 'Instituto Federal do Maranhão',
    nome_campus: 'Campus Carolina',
    endereco: 'Carolina - MA',
    telefone: '(99) 3531-0000',
    email: 'direcao.carolina@ifma.edu.br',
    site: 'https://carolina.ifma.edu.br',
    nome_diretor: 'Prof. Dr. Diretor Geral',
    cargo_diretor: 'Diretor-Geral do IFMA Campus Carolina',
    rodape_documento: 'PAA 2027 • IFMA Campus Carolina'
  });

  React.useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSaveSettings(form);
      alert('Configurações institucionais salvas com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Configurações Gerais do Campus Carolina</h2>
        <p className="text-xs text-slate-500">Dados do cabeçalho oficial, rodapé e autoridades signatárias</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome da Instituição</label>
            <input
              type="text"
              value={form.nome_instituicao}
              onChange={e => setForm({ ...form, nome_instituicao: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unidade / Campus</label>
            <input
              type="text"
              value={form.nome_campus}
              onChange={e => setForm({ ...form, nome_campus: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome do Diretor-Geral</label>
            <input
              type="text"
              value={form.nome_diretor}
              onChange={e => setForm({ ...form, nome_diretor: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cargo Formal</label>
            <input
              type="text"
              value={form.cargo_diretor}
              onChange={e => setForm({ ...form, cargo_diretor: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Endereço Completo</label>
            <input
              type="text"
              value={form.endereco}
              onChange={e => setForm({ ...form, endereco: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail Oficial</label>
            <input
              type="text"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Telefone de Contato</label>
            <input
              type="text"
              value={form.telefone}
              onChange={e => setForm({ ...form, telefone: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onCleanDemo}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
          >
            Limpar Ações de Demonstração (Demo Clean)
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};

// --- TEMPLATES VIEW ---
export const TemplatesView: React.FC<{
  onUseTemplate: (tmpl: ActionTemplate) => void;
}> = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState<ActionTemplate[]>([]);

  React.useEffect(() => {
    api.getTemplates().then(setTemplates).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Biblioteca de Modelos de Ações</h2>
        <p className="text-xs text-slate-500">Padrões pré-configurados de ações institucionais para acelerar o planejamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(tmpl => (
          <div key={tmpl.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                {tmpl.eixo_sugerido}
              </div>
              <h3 className="text-sm font-bold text-slate-900">{tmpl.nome}</h3>
              <p className="text-xs text-slate-600 mt-2">{tmpl.objetivo}</p>
              <p className="text-[11px] text-slate-400 mt-1">{tmpl.orientacoes}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => onUseTemplate(tmpl)}
                className="px-3.5 py-1.5 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded shadow-xs"
              >
                Utilizar este Modelo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPARE VIEW ---
export const CompareView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Comparativo entre Exercícios (PAA 2026 x PAA 2027)</h2>
        <p className="text-xs text-slate-500">Evolução do planejamento e execução institucional no IFMA Campus Carolina</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exercício 2026 (Anterior)</span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Total de Ações Homologadas:</span>
              <span className="font-bold">28 ações</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Orçamento Executado:</span>
              <span className="font-bold font-mono">R$ 510.000,00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Taxa de Sucesso Físico:</span>
              <span className="font-bold font-mono text-emerald-700">89%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-xs space-y-3 bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Exercício 2027 (Em Andamento)</span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-emerald-100">
              <span>Total de Ações Planejadas:</span>
              <span className="font-bold">34 ações</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-100">
              <span>Orçamento Previsto:</span>
              <span className="font-bold font-mono">R$ 685.000,00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-100">
              <span>Status Institucional:</span>
              <span className="font-bold font-mono text-emerald-800">EM EXECUÇÃO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ABOUT VIEW ---
export const AboutView: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#0f5132] text-white flex flex-col items-center justify-center font-bold shadow-xs">
          <span className="text-sm">IFMA</span>
          <span className="text-[9px] opacity-80">CAR</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Sistema de Gestão do PAA — IFMA Campus Carolina</h2>
          <p className="text-xs text-slate-500">Versão Institucional 1.2.0 • Exercício 2027</p>
        </div>
      </div>

      <div className="text-xs text-slate-600 space-y-3 leading-relaxed pt-2 border-t border-slate-100">
        <p>
          O <strong>Plano de Ação Anual (PAA)</strong> do IFMA Campus Carolina constitui o principal instrumento de planejamento tático e operacional da unidade de ensino, consolidando objetivos estratégicos, metas, cronogramas de desembolso e indicadores de desempenho.
        </p>
        <p>
          Desenvolvido em conformidade com as diretrizes do Ministério da Educação (MEC), do Plano de Desenvolvimento Institucional (PDI) do Instituto Federal do Maranhão e das normas orçamentárias vigentes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Campus</span>
          <span className="font-bold text-slate-800">IFMA Campus Carolina — Maranhão</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Tecnologias</span>
          <span className="font-bold text-slate-800">React • TypeScript • Tailwind • Gemini AI</span>
        </div>
      </div>
    </div>
  );
};
