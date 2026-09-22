import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ActionsListView } from './views/ActionsListView';
import { ApprovalsView } from './views/ApprovalsView';
import { BudgetView } from './views/BudgetView';
import { ScheduleView } from './views/ScheduleView';
import { MonitoringView } from './views/MonitoringView';
import { PendingView } from './views/PendingView';
import { DocumentGeneratorView } from './views/DocumentGeneratorView';
import {
  SectorsView,
  AxesView,
  UsersView,
  AuditView,
  SettingsView,
  TemplatesView,
  CompareView,
  AboutView
} from './views/AdminViews';
import { ActionFormModal } from './components/ActionFormModal';
import { ActionDetailModal } from './components/ActionDetailModal';
import { ApprovalModal } from './components/ApprovalModal';
import {
  AnoExercicioView,
  EquipeGestaoView,
  CorpoDocenteView,
  TecnicosAdministrativosView
} from './views/InstitutionalStructureViews';
import { Action, Axis, DashboardStats, InstitutionSettings, PAA, Sector, User, ActionTemplate } from './types';
import { api } from './lib/api';

const AppContent: React.FC = () => {
  const { user } = useAuth();

  // Navigation state
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Core Data state
  const [paas, setPaas] = useState<PAA[]>([]);
  const [currentPaa, setCurrentPaa] = useState<PAA | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [axes, setAxes] = useState<Axis[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<InstitutionSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<Action | null>(null);
  const [isApprovalMode, setIsApprovalMode] = useState(true);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        paaList,
        actionsList,
        axesList,
        sectorsList,
        usersList,
        statsData,
        settingsData
      ] = await Promise.all([
        api.getPAAs(),
        api.getActions(),
        api.getAxes(),
        api.getSectors(),
        api.getUsers(),
        api.getDashboardStats(),
        api.getSettings()
      ]);

      setPaas(paaList);
      const activePaa = paaList.find(p => p.ano === 2027) || paaList[0];
      setCurrentPaa(activePaa || null);
      setActions(actionsList);
      setAxes(axesList);
      setSectors(sectorsList);
      setUsers(usersList);
      setStats(statsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Erro ao carregar dados do PAA:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep selectedAction updated if actions list changes
  useEffect(() => {
    if (selectedAction) {
      const refreshed = actions.find(a => a.id === selectedAction.id);
      if (refreshed) {
        setSelectedAction(refreshed);
      }
    }
  }, [actions]);

  // Handler: Open Action Create
  const handleOpenNewAction = () => {
    setEditingAction(null);
    setIsFormModalOpen(true);
  };

  // Handler: Open Action Edit
  const handleOpenEditAction = (action: Action) => {
    setEditingAction(action);
    setIsFormModalOpen(true);
  };

  // Handler: Open Action Details
  const handleOpenDetail = (action: Action) => {
    setSelectedAction(action);
    setIsDetailModalOpen(true);
  };

  // Handler: Open Approval Modal
  const handleOpenApprovalModal = (action: Action, isApproval: boolean) => {
    setApprovalAction(action);
    setIsApprovalMode(isApproval);
    setIsApprovalModalOpen(true);
  };

  // Handler: Duplicate Action
  const handleDuplicateAction = async (action: Action) => {
    try {
      await api.duplicateAction(action.id);
      await loadData();
      alert('Ação duplicada com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao duplicar ação.');
    }
  };

  // Handler: Delete Action
  const handleDeleteAction = async (action: Action) => {
    if (!confirm(`Deseja realmente excluir a ação "${action.titulo}"?`)) return;
    try {
      await api.deleteAction(action.id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir ação.');
    }
  };

  // Handler: Submit Action for Review
  const handleSubmitAction = async (action: Action) => {
    if (!confirm('Deseja submeter esta ação para aprovação institucional?')) return;
    try {
      await api.submitAction(action.id);
      await loadData();
      alert('Ação submetida para validação institucional!');
    } catch (err: any) {
      alert(err.message || 'Erro ao submeter ação.');
    }
  };

  // Handler: Use Template
  const handleUseTemplate = (tmpl: ActionTemplate) => {
    const defaultSector = sectors[0]?.id || '';
    const matchingAxis = axes.find(a => a.nome.toLowerCase().includes(tmpl.eixo_sugerido.toLowerCase()))?.id || axes[0]?.id || '';

    const newActionTemplate: Partial<Action> = {
      titulo: tmpl.nome,
      objetivo: tmpl.objetivo,
      descricao: `${tmpl.orientacoes}\n\nEtapas Sugeridas:\n${(tmpl.etapas_sugeridas || []).map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
      justificativa: `Ação prioritária orientada pelo template institucional do PAA.`,
      setor_id: defaultSector,
      eixo_id: matchingAxis,
      prioridade: 'MEDIA',
      status: 'RASCUNHO',
      possui_orcamento: false,
      indicadores: [
        {
          id: 'ind-tmpl-1',
          action_id: '',
          nome: tmpl.indicador_sugerido || 'Indicador Principal',
          unidade_medida: 'Unidade',
          tipo_meta: 'QUANTITATIVA',
          linha_base: 0,
          meta: 1,
          resultado: 0,
          percentual: 0
        }
      ]
    };

    setEditingAction(newActionTemplate as any);
    setIsFormModalOpen(true);
  };

  // Handler: Clean Demo Data
  const handleCleanDemo = async () => {
    if (!confirm('Atenção: Deseja apagar as ações criadas e reiniciar os dados institucionais do PAA?')) return;
    try {
      await api.cleanDemoData();
      await loadData();
      alert('Dados de demonstração reinicializados!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handler: Save Settings
  const handleSaveSettings = async (newSettings: Partial<InstitutionSettings>) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
  };

  // Export XLSX
  const handleExportXLSX = () => {
    if (!currentPaa) return;
    window.open(`/api/export/xlsx?paa_id=${currentPaa.id}`, '_blank');
  };

  const pendingCount = actions.filter(a => ['ENVIADA', 'EM_ANALISE'].includes(a.status)).length;
  const issuesCount = actions.filter(a => a.status === 'DEVOLVIDA' || a.execucao?.status_execucao === 'ATRASADA').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Header */}
      <Header
        paa={currentPaa}
        onOpenNewAction={handleOpenNewAction}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Body layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={setCurrentRoute}
          pendingCount={pendingCount}
          issuesCount={issuesCount}
          isOpen={sidebarOpen}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-8 h-8 border-4 border-[#0f5132] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-medium">Carregando dados do IFMA Campus Carolina...</p>
              </div>
            ) : (
              <>
                {currentRoute === 'dashboard' && (
                  <DashboardView
                    stats={stats}
                    currentPAA={currentPaa}
                    onNavigate={setCurrentRoute}
                    onOpenNewAction={handleOpenNewAction}
                  />
                )}

                {currentRoute === 'ano-exercicio' && (
                  <AnoExercicioView
                    paaList={paas}
                    currentPaa={currentPaa}
                    onSelectPaa={setCurrentPaa}
                    onRefresh={loadData}
                  />
                )}

                {currentRoute === 'equipe-gestao' && (
                  <EquipeGestaoView sectors={sectors} />
                )}

                {currentRoute === 'corpo-docente' && (
                  <CorpoDocenteView sectors={sectors} />
                )}

                {currentRoute === 'tecnicos-administrativos' && (
                  <TecnicosAdministrativosView sectors={sectors} />
                )}

                {currentRoute === 'acoes' && (
                  <ActionsListView
                    actions={actions}
                    axes={axes}
                    sectors={sectors}
                    users={users}
                    onSelectAction={handleOpenDetail}
                    onEditAction={handleOpenEditAction}
                    onNewAction={handleOpenNewAction}
                    onDuplicateAction={handleDuplicateAction}
                    onDeleteAction={handleDeleteAction}
                    onSubmitAction={handleSubmitAction}
                  />
                )}

                {currentRoute === 'validacao' && (
                  <ApprovalsView
                    actions={actions}
                    axes={axes}
                    sectors={sectors}
                    onSelectAction={handleOpenDetail}
                    onOpenApproveModal={handleOpenApprovalModal}
                  />
                )}

                {currentRoute === 'orcamento' && (
                  <BudgetView
                    actions={actions}
                    axes={axes}
                    sectors={sectors}
                    onExportXLSX={handleExportXLSX}
                  />
                )}

                {currentRoute === 'cronograma' && (
                  <ScheduleView
                    actions={actions}
                    axes={axes}
                    sectors={sectors}
                    onSelectAction={handleOpenDetail}
                  />
                )}

                {currentRoute === 'monitoramento' && (
                  <MonitoringView
                    actions={actions}
                    axes={axes}
                    sectors={sectors}
                    onSelectAction={handleOpenDetail}
                  />
                )}

                {currentRoute === 'pendencias' && (
                  <PendingView
                    actions={actions}
                    axes={axes}
                    sectors={sectors}
                    onSelectAction={handleOpenDetail}
                  />
                )}

                {currentRoute === 'documentos' && (
                  <DocumentGeneratorView
                    paa={currentPaa}
                    actions={actions}
                    axes={axes}
                    sectors={sectors}
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                  />
                )}

                {currentRoute === 'setores' && (
                  <SectorsView sectors={sectors} onRefresh={loadData} />
                )}

                {currentRoute === 'eixos' && (
                  <AxesView axes={axes} onRefresh={loadData} />
                )}

                {currentRoute === 'usuarios' && (
                  <UsersView users={users} sectors={sectors} onRefresh={loadData} />
                )}

                {currentRoute === 'auditoria' && <AuditView />}

                {currentRoute === 'modelos' && (
                  <TemplatesView onUseTemplate={handleUseTemplate} />
                )}

                {currentRoute === 'comparativo' && <CompareView />}

                {currentRoute === 'configuracoes' && (
                  <SettingsView
                    settings={settings}
                    onSaveSettings={handleSaveSettings}
                    onCleanDemo={handleCleanDemo}
                  />
                )}

                {currentRoute === 'sobre' && <AboutView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Action Form Modal (Create / Edit) */}
      <ActionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAction(null);
        }}
        actionToEdit={editingAction}
        axes={axes}
        sectors={sectors}
        users={users}
        paaId={currentPaa?.id || 'paa-2027'}
        onSuccess={async () => {
          await loadData();
        }}
      />

      {/* Action Detail Modal (View / Timeline / Indicators / Execution / Files) */}
      <ActionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAction(null);
        }}
        action={selectedAction}
        axes={axes}
        sectors={sectors}
        users={users}
        onEdit={handleOpenEditAction}
        onRefresh={loadData}
        onOpenApproveModal={handleOpenApprovalModal}
      />

      {/* Action Approval / Return Modal */}
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setApprovalAction(null);
        }}
        action={approvalAction}
        isApproval={isApprovalMode}
        onSuccess={loadData}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
