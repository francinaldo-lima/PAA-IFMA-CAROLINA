import React, { useState } from 'react';
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
  ArrowUpRight,
  ShieldCheck,
  Building,
  LogIn,
  LogOut,
  Sparkles,
  ArrowRight,
  UserCheck,
  KeyRound,
  Users,
  ExternalLink
} from 'lucide-react';
import { DashboardStats, PAA } from '../types';
import { DashboardCharts } from '../components/DashboardCharts';
import { useAuth } from '../context/AuthContext';
import { FacilitatedLoginModal } from '../components/FacilitatedLoginModal';
import { GoogleIcon } from '../components/GoogleIcon';

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
  const { user, firebaseUser, isGoogleAuthenticated, isSectorChief, isInstitutionalAdmin, loginDirectly, loginWithGoogle, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleDirectLogin = async (email: string) => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await loginDirectly(email);
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao autenticar servidor.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChefiaLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await loginWithGoogle((info) => {
        // Redireciona diretamente para o cadastro e ação conforme solicitado pelo usuário
        onOpenNewAction();
      });
    } catch (err: any) {
      setLoginError(err.message || 'Falha ao autenticar com a conta Google institucional.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Carregando indicadores do PAA...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Institutional Chefia Access Banner / Gate */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        {user && (isSectorChief || isInstitutionalAdmin) ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">{user.nome}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {isInstitutionalAdmin ? 'Administrador Institucional' : 'Chefia de Setor Autorizada'}
                  </span>
                  {firebaseUser && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <GoogleIcon className="w-3 h-3" />
                      <span>Google: {firebaseUser.email}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  E-mail institucional: <strong className="font-mono text-slate-700">{firebaseUser?.email || user.email}</strong> • Acesso liberado para cadastro e tramitação de ações.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {!firebaseUser && (
                <button
                  onClick={handleChefiaLogin}
                  disabled={isLoggingIn}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-slate-400 text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
                  title="Conectar sua conta institucional oficial do Google"
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span>{isLoggingIn ? 'Conectando...' : 'Entrar com Conta Google'}</span>
                </button>
              )}

              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Trocar de servidor ou entrar como outra chefia"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>Trocar Servidor / Login</span>
              </button>

              <button
                onClick={onOpenNewAction}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <span>+ Cadastrar Nova Ação</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 uppercase tracking-wider">
                    Autenticação Google
                  </span>
                  <span className="text-xs font-bold text-slate-800">Acesso Oficial Institucional • IFMA Campus Carolina</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Efetue login com sua conta do Google institucional (<strong>@ifma.edu.br</strong>) para autenticação oficial e gestão das ações do PAA.
                </p>
              </div>

              <button
                onClick={() => setShowLoginModal(true)}
                className="self-start sm:self-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-slate-600" />
                <span>Todas as Chefias ({10})</span>
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Abrir em Nova Aba</span>
                </a>
              </div>
            )}

            {/* Quick access buttons with Google in prominence */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={handleChefiaLogin}
                disabled={isLoggingIn}
                className="sm:col-span-2 p-3.5 rounded-xl border-2 border-blue-500 bg-blue-50/60 hover:bg-blue-100/80 transition-all text-left group flex items-center justify-between gap-3 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                      {isLoggingIn ? 'Conectando ao Google...' : 'Efetuar Login pela Conta do Google'}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Selecione sua conta institucional <strong className="font-semibold text-slate-800">@ifma.edu.br</strong>
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shrink-0 shadow-2xs">
                  Entrar com Google
                </div>
              </button>

              <button
                onClick={() => handleDirectLogin('francinaldo.lima@ifma.edu.br')}
                disabled={isLoggingIn}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left group flex items-center justify-between gap-2 shadow-xs cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      Francinaldo Lima
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate">
                    Acesso Direto Institucional
                  </div>
                </div>
                <div className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md shrink-0">
                  1-Clique
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

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

      {/* Facilitated Institutional Login Modal */}
      <FacilitatedLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};
