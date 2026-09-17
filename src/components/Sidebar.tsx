import React from 'react';
import {
  LayoutDashboard,
  Building,
  CalendarDays,
  Target,
  CheckCheck,
  CalendarRange,
  DollarSign,
  Activity,
  AlertTriangle,
  BookTemplate,
  GitCompare,
  FileText,
  Network,
  Compass,
  Users,
  History,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  highlight?: boolean;
  hide?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingCount?: number;
  issuesCount?: number;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  pendingCount = 0,
  issuesCount = 0,
  isOpen = true
}) => {
  const { user, canAdmin, canApprove } = useAuth();

  const groups: NavGroup[] = [
    {
      title: 'VISÃO GERAL',
      items: [
        { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard }
      ]
    },
    {
      title: 'PLANEJAMENTO',
      items: [
        { id: 'acoes', label: 'Ações do PAA', icon: Target },
        {
          id: 'validacao',
          label: 'Validação & Aprovação',
          icon: CheckCheck,
          badge: pendingCount > 0 ? pendingCount : undefined,
          hide: !canApprove && !canAdmin
        },
        { id: 'orcamento', label: 'Orçamento & Fontes', icon: DollarSign },
        { id: 'cronograma', label: 'Cronograma Anual', icon: CalendarRange }
      ]
    },
    {
      title: 'EXECUÇÃO & GESTÃO',
      items: [
        { id: 'monitoramento', label: 'Acompanhamento & Metas', icon: Activity },
        {
          id: 'pendencias',
          label: 'Central de Pendências',
          icon: AlertTriangle,
          badge: issuesCount > 0 ? issuesCount : undefined
        },
        { id: 'modelos', label: 'Biblioteca de Modelos', icon: BookTemplate },
        { id: 'comparativo', label: 'Comparar Exercícios', icon: GitCompare }
      ]
    },
    {
      title: 'DOCUMENTAÇÃO',
      items: [
        { id: 'documentos', label: 'Gerador Oficial PAA', icon: FileText, highlight: true }
      ]
    },
    {
      title: 'ADMINISTRAÇÃO',
      items: [
        { id: 'setores', label: 'Setores do Campus', icon: Network, hide: !canAdmin },
        { id: 'eixos', label: 'Eixos Estratégicos', icon: Compass, hide: !canAdmin },
        { id: 'usuarios', label: 'Usuários e Perfis', icon: Users, hide: !canAdmin },
        { id: 'auditoria', label: 'Trilha de Auditoria', icon: History, hide: !canAdmin },
        { id: 'configuracoes', label: 'Configurações', icon: Settings, hide: !canAdmin },
        { id: 'sobre', label: 'Sobre o Sistema', icon: Info }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <aside
      className={`h-[calc(100vh-77px)] sticky top-[77px] bg-slate-900 text-slate-300 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map((grp, gIdx) => {
          const visibleItems = grp.items.filter(i => !i.hide);
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {grp.title}
                </div>
              )}
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : item.highlight
                        ? 'bg-slate-800 text-emerald-300 hover:bg-slate-700/80'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!collapsed && item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {onToggleCollapse && (
        <div className="p-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </aside>
  );
};
