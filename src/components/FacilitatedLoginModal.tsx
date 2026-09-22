import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  UserCheck,
  LogIn,
  Building2,
  Mail,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
  Flame,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './GoogleIcon';

interface FacilitatedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FacilitatedLoginModal: React.FC<FacilitatedLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, firebaseUser, isGoogleAuthenticated, loginDirectly, loginWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'google' | 'rapido' | 'email'>('google');
  const [customEmail, setCustomEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = async (email: string, nome: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await loginDirectly(email);
      setSuccessMessage(`Acesso liberado com sucesso para ${nome}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login institucional.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) {
      setError('Por favor, informe seu e-mail institucional.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await loginDirectly(customEmail);
      setSuccessMessage(`Bem-vindo(a), ${res.user?.nome || 'Servidor(a)'}! Acesso concedido.`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'E-mail não reconhecido nas chefias ou administração do Campus.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await loginWithGoogle(() => {
        setSuccessMessage('Autenticação Google concluída com sucesso!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 700);
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar via Google.');
    } finally {
      setLoading(false);
    }
  };

  // Official Campus Chiefs & Coordinators for 1-click access
  const sectorChiefs = [
    {
      nome: 'Duana Ravena dos Santos Vieira',
      cargo: 'Diretora de Desenvolvimento Educacional (DDE)',
      setor: 'DDE / Ensino',
      email: 'duana.vieira@ifma.edu.br',
      tag: 'Diretoria de Ensino'
    },
    {
      nome: 'Jannyelle de Souza Corrêa',
      cargo: 'Chefe do Depto de Administração e Planejamento (DAG)',
      setor: 'DAG / Gabinete',
      email: 'jannyelle.correa@ifma.edu.br',
      tag: 'Administração'
    },
    {
      nome: 'Soniara Alves Maciel',
      cargo: 'Chefe do Depto de Ensino e Extensão (DEE)',
      setor: 'DEE / Extensão',
      email: 'soniara.maciel@ifma.edu.br',
      tag: 'Extensão'
    },
    {
      nome: 'Beatriz Guerra Kleinubing Rocha',
      cargo: 'Chefe do Depto de Ações Inclusivas (DAI)',
      setor: 'DAI / Inclusão',
      email: 'beatriz.guerra@ifma.edu.br',
      tag: 'Ações Inclusivas'
    },
    {
      nome: 'Claudia Araújo Moreira',
      cargo: 'Coordenadora do Curso Técnico em Agroecologia',
      setor: 'Coord. Agroecologia',
      email: 'claudia.moreira@ifma.edu.br',
      tag: 'Coordenação'
    },
    {
      nome: 'Iberê Pereira Parente',
      cargo: 'Coordenador do Curso Técnico em Agronegócio',
      setor: 'Coord. Agronegócio',
      email: 'ibere.parente@ifma.edu.br',
      tag: 'Coordenação'
    },
    {
      nome: 'Leonardo Oliveira Coelho',
      cargo: 'Coordenador do Curso Técnico em Guia de Turismo',
      setor: 'Coord. Turismo',
      email: 'leonardo.coelho@ifma.edu.br',
      tag: 'Coordenação'
    },
    {
      nome: 'Priscilla Novaes Nogueira',
      cargo: 'Coordenadora do Curso Técnico em Administração',
      setor: 'Coord. Administração',
      email: 'priscilla.nogueira@ifma.edu.br',
      tag: 'Coordenação'
    },
    {
      nome: 'Raquel da Silva Cordeiro',
      cargo: 'Coordenadora Pós Gestão Regional e Comércio',
      setor: 'Coord. Comércio',
      email: 'raquel.cordeiro@ifma.edu.br',
      tag: 'Pós-Graduação'
    },
    {
      nome: 'Thamires Barroso Lima',
      cargo: 'Coordenadora Pós Gestão Ambiental e Meio Ambiente',
      setor: 'Coord. Meio Ambiente',
      email: 'thamires.lima@ifma.edu.br',
      tag: 'Pós-Graduação'
    }
  ];

  const filteredChiefs = sectorChiefs.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f5132] to-[#137547] text-white p-5 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-800/80 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Acesso Simplificado Institucional
              </span>
              <span className="text-emerald-200/60">•</span>
              <span className="text-xs text-emerald-100">IFMA Campus Carolina</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Identificação & Login de Servidor
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Acesse diretamente com 1 clique, sem bloqueios de pop-up ou barreiras de navegador.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1 rounded-lg hover:bg-emerald-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Currently logged user banner */}
        {user && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Conectado atualmente como:</span>
              <strong className="text-emerald-950 font-bold">{user.nome}</strong>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                {user.role}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{user.email}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 pt-3 gap-2 bg-slate-50 shrink-0">
          <button
            onClick={() => { setActiveTab('google'); setError(null); }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'google'
                ? 'border-[#0f5132] text-[#0f5132]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GoogleIcon className="w-3.5 h-3.5" />
            <span>Login com Conta Google</span>
          </button>

          <button
            onClick={() => { setActiveTab('rapido'); setError(null); }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'rapido'
                ? 'border-[#0f5132] text-[#0f5132]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Acesso 1-Clique</span>
          </button>

          <button
            onClick={() => { setActiveTab('email'); setError(null); }}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-[#0f5132] text-[#0f5132]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Digitar E-mail</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'rapido' && (
            <div className="space-y-4">
              {/* Primary Admins Highlight Cards */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Administradores Institucionais do Sistema</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Francinaldo Lima Card */}
                  <div className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50 transition-all flex flex-col justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                          Admin do Sistema
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">SIAPE 2045129</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                        Francinaldo Lima
                      </h3>
                      <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">
                        francinaldo.lima@ifma.edu.br
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Acesso irrestrito a todas as funções, validação, configurações e ações do PAA.
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickLogin('francinaldo.lima@ifma.edu.br', 'Francinaldo Lima')}
                      disabled={loading}
                      className="w-full py-2 px-3 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{loading ? 'Acessando...' : 'Entrar como Francinaldo Lima'}</span>
                    </button>
                  </div>

                  {/* Fernando Silva Lima Card */}
                  <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-emerald-50/30 hover:border-emerald-300 transition-all flex flex-col justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-white uppercase tracking-wider">
                          Diretor Geral
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">SIAPE 1982341</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                        Fernando Silva Lima
                      </h3>
                      <p className="text-xs text-slate-600 font-mono mt-0.5 truncate">
                        fernando.lima@ifma.edu.br
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Direção Geral do Campus Avançado Carolina • Homologação e assinatura do PAA.
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickLogin('fernando.lima@ifma.edu.br', 'Fernando Silva Lima')}
                      disabled={loading}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{loading ? 'Acessando...' : 'Entrar como Diretor Geral'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sector Chiefs Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Chefias de Setores do Campus ({filteredChiefs.length})</span>
                  </div>

                  {/* Quick Search */}
                  <div className="relative w-48 sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar chefia ou setor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredChiefs.map((chief, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {chief.nome}
                          </h4>
                          <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {chief.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {chief.cargo}
                        </p>
                        <p className="text-[10px] text-emerald-800 font-mono">
                          {chief.email}
                        </p>
                      </div>

                      <button
                        onClick={() => handleQuickLogin(chief.email, chief.nome)}
                        disabled={loading}
                        className="shrink-0 px-3 py-1.5 bg-white hover:bg-[#0f5132] text-slate-700 hover:text-white border border-slate-300 hover:border-[#0f5132] text-xs font-semibold rounded-md shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <span>Acessar</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4 max-w-lg mx-auto py-2">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Entrar com seu e-mail institucional
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Digite seu e-mail institucional do IFMA. O sistema identificará automaticamente sua chefia de setor ou função administrativa.
                </p>
              </div>

              <form onSubmit={handleCustomEmailSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail Institucional (@ifma.edu.br)
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="ex: francinaldo.lima@ifma.edu.br"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Quick email suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Sugestões:</span>
                  <button
                    type="button"
                    onClick={() => setCustomEmail('francinaldo.lima@ifma.edu.br')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 transition-colors"
                  >
                    francinaldo.lima@ifma.edu.br
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomEmail('fernando.lima@ifma.edu.br')}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 transition-colors"
                  >
                    fernando.lima@ifma.edu.br
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !customEmail.trim()}
                  className="w-full py-2.5 px-4 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'Validando Acesso...' : 'Acessar o Sistema'}</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'google' && (
            <div className="space-y-4 max-w-lg mx-auto py-2 text-center">
              {firebaseUser ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GoogleIcon className="w-5 h-5" />
                      <span className="text-xs font-bold text-emerald-950">Conta Google Autenticada</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300">
                      Conectado
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <div>
                      <span className="text-slate-500 text-[11px] block">E-mail:</span>
                      <strong className="font-mono text-slate-900 text-xs">{firebaseUser.email}</strong>
                    </div>
                    {firebaseUser.displayName && (
                      <div>
                        <span className="text-slate-500 text-[11px] block">Nome:</span>
                        <span className="font-semibold text-slate-800">{firebaseUser.displayName}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        logout();
                        setError(null);
                        setSuccessMessage('Sessão Google desconectada.');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Desconectar Conta Google</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        if (onSuccess) onSuccess();
                      }}
                      className="px-4 py-1.5 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Continuar no Sistema
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto shadow-2xs">
                    <GoogleIcon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Entrar com a Conta do Google
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                      Efetue login institucional com sua conta oficial <strong>@ifma.edu.br</strong> (Francinaldo Lima, Fernando Lima ou Chefias de Setor).
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleGoogleSubmit}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-400 text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                      <GoogleIcon className="w-5 h-5" />
                      <span>{loading ? 'Abrindo autenticação Google...' : 'Fazer Login com Conta Google (@ifma.edu.br)'}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 space-y-1.5">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Autenticação Segura via Firebase & Google OAuth</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Ao clicar no botão, uma janela segura do Google será aberta para você escolher ou autorizar sua conta institucional.
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Pop-up bloqueado no iFrame?</span>
                      <a
                        href={typeof window !== 'undefined' ? window.location.href : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir em Nova Aba</span>
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Campus Carolina • Plano de Ação Anual (PAA)</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
