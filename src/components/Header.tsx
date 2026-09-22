import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  Shield,
  User as UserIcon,
  LogOut,
  Building2,
  Calendar,
  RefreshCw,
  ExternalLink,
  Flame,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Notification, PAA } from '../types';
import { api } from '../lib/api';
import { FacilitatedLoginModal } from './FacilitatedLoginModal';

interface HeaderProps {
  currentPAA?: PAA | null;
  paa?: PAA | null;
  onSelectPAA?: (paa: PAA) => void;
  paaList?: PAA[];
  onOpenNewAction?: () => void;
  onNavigate?: (route: string) => void;
  toggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPAA,
  paa,
  onSelectPAA,
  paaList = [],
  onOpenNewAction,
  onNavigate,
  toggleSidebar
}) => {
  const activePAA = currentPAA || paa || null;
  const { user, firebaseUser, usersList, switchUser, loginWithGoogle, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPaaDropdown, setShowPaaDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const handleGoogleConnect = async () => {
    try {
      setIsConnectingGoogle(true);
      await loginWithGoogle();
    } catch (err) {
      console.error('Falha ao autenticar com Firebase Google:', err);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications(user?.id);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.lida).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top green institutional bar */}
      <div className="bg-[#0f5132] text-white text-[11px] px-4 py-1 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider">MINISTÉRIO DA EDUCAÇÃO</span>
          <span className="opacity-40">|</span>
          <span>INSTITUTO FEDERAL DO MARANHÃO — CAMPUS CAROLINA</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-emerald-100 text-xs">
          <span>Exercício Institucional {activePAA?.ano || 2027}</span>
          <span>•</span>
          <span className="bg-emerald-800/80 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            {activePAA?.status || 'VALIDACAO'}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo & Campus Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate && onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-[#0f5132] text-white flex flex-col items-center justify-center font-bold leading-none shadow-xs group-hover:bg-[#137547] transition-colors">
              <span className="text-xs tracking-tighter">IFMA</span>
              <span className="text-[8px] opacity-80 uppercase tracking-widest font-normal">CAR</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  PAA IFMA Campus Carolina
                </h1>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activePAA?.ano || 2027}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Plano de Ação Anual • Planejamento & Gestão Estratégica
              </p>
            </div>
          </div>

          {/* PAA Edition Switcher */}
          <div className="relative hidden lg:block ml-2">
            <button
              onClick={() => setShowPaaDropdown(!showPaaDropdown)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors border border-slate-200"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Edição: {activePAA?.titulo || 'PAA 2027'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showPaaDropdown && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Selecionar Edição do PAA
                </div>
                {paaList.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (onSelectPAA) onSelectPAA(p);
                      setShowPaaDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      p.id === activePAA?.id ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div>{p.titulo}</div>
                      <div className="text-[10px] text-slate-400">{p.status}</div>
                    </div>
                    {p.id === activePAA?.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right tools: New Action, Notifications, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick 1-Click Login Button */}
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0f5132] border border-emerald-300 text-xs font-bold rounded-md shadow-2xs transition-colors"
            title="Acesso Facilitado Institucional (1-Clique)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="hidden sm:inline">Identificar / Login</span>
          </button>

          {/* Quick Action Button */}
          <button
            onClick={onOpenNewAction}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <span className="text-sm leading-none">+</span>
            <span className="hidden sm:inline">Nova Ação</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notificações e Tramitações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.2 rounded">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>
                  <button
                    onClick={fetchNotifications}
                    className="text-slate-400 hover:text-slate-600"
                    title="Atualizar"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs transition-colors ${
                          n.lida ? 'bg-white opacity-70' : 'bg-emerald-50/40 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-slate-800 font-semibold text-xs leading-snug">{n.titulo}</h4>
                          {!n.lida && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="text-[10px] text-emerald-700 hover:underline shrink-0 font-medium"
                            >
                              Marcar lida
                            </button>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] mt-1">{n.mensagem}</p>
                        <span className="text-[10px] text-slate-400 mt-1.5 block">
                          {new Date(n.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.nome ? user.nome.charAt(0) : 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {user?.nome || 'Usuário'}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  {user?.role?.replace('_', ' ') || 'CONSULTA'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
                {/* Active user header */}
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{user?.nome}</div>
                  <div className="text-[11px] text-slate-500">{user?.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    <Shield className="w-3 h-3" />
                    {user?.role}
                  </div>
                </div>

                {/* 1-Click Facilitated Login button */}
                <div className="px-3 pt-2 pb-1">
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-bold rounded-lg border border-emerald-200 flex items-center justify-between transition-colors shadow-2xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      Acesso Rápido 1-Clique
                    </span>
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-mono">
                      Fácil
                    </span>
                  </button>
                </div>

                {/* Role Switcher for instant Demo testing */}
                <div className="px-3 py-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Alternar Perfil (Demonstração):
                  </div>
                  <div className="space-y-1">
                    {usersList.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                          u.id === user?.id
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate font-medium">{u.nome}</div>
                          <div className="text-[10px] text-slate-400">{u.role}</div>
                        </div>
                        {u.id === user?.id && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Firebase Authentication & Cloud sync indicator */}
                <div className="border-t border-slate-100 pt-2 pb-1 px-3">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-amber-700">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      Firebase Cloud:
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded border border-emerald-300">
                      Ativo
                    </span>
                  </div>

                  {firebaseUser ? (
                    <div className="bg-slate-50 border border-slate-200 rounded p-2 text-xs">
                      <div className="text-[10px] text-slate-500 font-medium">Conectado via Google:</div>
                      <div className="text-slate-800 font-semibold truncate">{firebaseUser.email}</div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGoogleConnect}
                      disabled={isConnectingGoogle}
                      className="w-full flex items-center justify-center gap-2 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      {isConnectingGoogle ? 'Conectando...' : 'Entrar com Google (Firebase)'}
                    </button>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                  <button
                    onClick={() => {
                      onNavigate('configuracoes');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    Configurações do Campus
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Facilitated Institutional Login Modal */}
      <FacilitatedLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  );
};
