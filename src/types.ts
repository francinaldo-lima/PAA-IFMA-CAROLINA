export type Role = 'ADMIN' | 'GESTOR_SETOR' | 'RESPONSAVEL_ACAO' | 'VALIDADOR' | 'CONSULTA';

export type PAAStatus = 
  | 'PLANEJAMENTO'
  | 'ABERTO'
  | 'PREENCHIMENTO'
  | 'VALIDACAO'
  | 'APROVADO'
  | 'PUBLICADO'
  | 'EM_EXECUCAO'
  | 'ENCERRADO';

export type ActionStatus = 
  | 'RASCUNHO'
  | 'ENVIADA'
  | 'EM_ANALISE'
  | 'DEVOLVIDA'
  | 'APROVADA'
  | 'CONSOLIDADA'
  | 'PUBLICADA'
  | 'EM_EXECUCAO'
  | 'CONCLUIDA';

export type Priority = 'ALTA' | 'MEDIA' | 'BAIXA';

export type IndicatorType = 'NUMERICA' | 'PERCENTUAL' | 'QUALITATIVA' | 'QUANTITATIVA';

export type ExecutionStatus = 
  | 'NAO_INICIADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'ATRASADA'
  | 'PARCIALMENTE_EXECUTADA'
  | 'CANCELADA';

export interface User {
  id: string;
  nome: string;
  email: string;
  matricula_funcional?: string;
  role: Role;
  sector_id?: string;
  ativo: boolean;
  created_at: string;
}

export interface Sector {
  id: string;
  nome: string;
  sigla: string;
  descricao?: string;
  responsavel_id?: string;
  email?: string;
  ativo: boolean;
  created_at: string;
}

export interface PAA {
  id: string;
  ano: number;
  campus: string;
  titulo: string;
  descricao?: string;
  status: PAAStatus;
  data_inicio: string;
  data_fim: string;
  prazo_preenchimento: string;
  prazo_validacao: string;
  responsavel_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Axis {
  id: string;
  paa_id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativo: boolean;
}

export interface Indicator {
  id: string;
  action_id: string;
  nome: string;
  descricao?: string;
  unidade_medida: string;
  tipo_meta: IndicatorType;
  linha_base: number;
  meta: number;
  resultado: number;
  percentual: number;
  resultado_esperado?: string;
}

export interface ActionSchedule {
  id: string;
  action_id: string;
  data_inicio?: string;
  data_fim?: string;
  janeiro: boolean;
  fevereiro: boolean;
  marco: boolean;
  abril: boolean;
  maio: boolean;
  junho: boolean;
  julho: boolean;
  agosto: boolean;
  setembro: boolean;
  outubro: boolean;
  novembro: boolean;
  dezembro: boolean;
  atividades_mes?: Record<string, string>;
  atividades_texto?: string;
}

export interface BudgetItem {
  id: string;
  action_id: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;
  tipo_despesa: string;
  fonte_recurso: string;
  acao_orcamentaria?: string;
  plano_interno?: string;
  natureza_despesa?: string;
  observacao?: string;
}

export interface ActionExecution {
  id: string;
  action_id: string;
  status_execucao: ExecutionStatus;
  percentual_execucao: number;
  meta_planejada: number;
  meta_realizada: number;
  valor_planejado: number;
  valor_executado: number;
  resultado?: string;
  justificativa?: string;
  data_atualizacao: string;
}

export interface Attachment {
  id: string;
  action_id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  dados_base64?: string;
  usuario_id?: string;
  created_at: string;
}

export interface Approval {
  id: string;
  action_id: string;
  usuario_id: string;
  usuario_nome?: string;
  status_anterior: string;
  novo_status: string;
  motivo?: string;
  data: string;
}

export interface ActionHistory {
  id: string;
  action_id: string;
  descricao: string;
  usuario_id?: string;
  usuario_nome?: string;
  data: string;
}

export interface Action {
  id: string;
  paa_id: string;
  eixo_id: string;
  setor_id: string;
  responsavel_id?: string;
  titulo: string;
  prioridade: Priority;
  objetivo: string;
  descricao: string;
  justificativa: string;
  publico_alvo: string;
  status: ActionStatus;
  possui_orcamento: boolean;
  observacoes?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;

  indicadores: Indicator[];
  cronograma: ActionSchedule;
  itens_orcamento: BudgetItem[];
  execucao: ActionExecution;
  anexos: Attachment[];
  aprovacoes: Approval[];
  historico: ActionHistory[];
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  ip?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: 'INFO' | 'ALERTA' | 'SUCESSO' | 'AVISO';
  lida: boolean;
  link?: string;
  created_at: string;
}

export interface ActionTemplate {
  id: string;
  nome: string;
  eixo_sugerido?: string;
  objetivo: string;
  descricao: string;
  indicadores?: any;
  indicador_sugerido?: string;
  etapas_sugeridas?: string[];
  orientacoes?: string;
  ativo: boolean;
}

export interface InstitutionSettings {
  nome_instituicao: string;
  nome_campus: string;
  endereco: string;
  telefone: string;
  email: string;
  site: string;
  logo_url?: string;
  nome_diretor: string;
  cargo_diretor: string;
  texto_apresentacao?: string;
  texto_introducao?: string;
  texto_metodologia?: string;
  rodape_documento: string;
}

export interface DocumentConfiguration {
  titulo: string;
  subtitulo: string;
  ordem_secoes: string[];
  regras_campos: Record<string, 'obrigatorio' | 'opcional' | 'oculto'>;
  assinaturas: Array<{ nome: string; cargo: string; papel: string }>;
}

export interface DashboardStats {
  totalActions: number;
  rascunhos: number;
  enviadas: number;
  emAnalise: number;
  devolvidas: number;
  aprovadas: number;
  emExecucao: number;
  concluidas: number;
  atrasadas: number;
  orcamentoPlanejado: number;
  orcamentoExecutado: number;
  saldoOrcamentario: number;
  custeioPlanejado: number;
  investimentoPlanejado: number;
  fillRate: number;
  approvalRate: number;
  executionRate: number;
  physicalExecutionRate: number;
  byAxis: Array<{ nome: string; count: number; orcamento: number }>;
  bySector: Array<{ sigla: string; count: number; orcamento: number }>;
}
