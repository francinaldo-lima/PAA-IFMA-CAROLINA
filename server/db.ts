import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  matricula_funcional?: string;
  role: 'ADMIN' | 'GESTOR_SETOR' | 'RESPONSAVEL_ACAO' | 'VALIDADOR' | 'CONSULTA';
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
  status: 'PLANEJAMENTO' | 'ABERTO' | 'PREENCHIMENTO' | 'VALIDACAO' | 'APROVADO' | 'PUBLICADO' | 'EM_EXECUCAO' | 'ENCERRADO';
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
  tipo_meta: 'NUMERICA' | 'PERCENTUAL' | 'QUALITATIVA';
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
  tipo_despesa: string; // 'Custeio' ou 'Investimento'
  fonte_recurso: string; // 'Tesouro', 'Recursos Próprios', 'Emenda Parlamentar', etc.
  acao_orcamentaria?: string;
  plano_interno?: string;
  natureza_despesa?: string;
  observacao?: string;
}

export interface ActionExecution {
  id: string;
  action_id: string;
  status_execucao: 'NAO_INICIADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA' | 'PARCIALMENTE_EXECUTADA' | 'CANCELADA';
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
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  objetivo: string;
  descricao: string;
  justificativa: string;
  publico_alvo: string;
  status: 'RASCUNHO' | 'ENVIADA' | 'EM_ANALISE' | 'DEVOLVIDA' | 'APROVADA' | 'CONSOLIDADA' | 'PUBLICADA' | 'EM_EXECUCAO' | 'CONCLUIDA';
  possui_orcamento: boolean;
  observacoes?: string;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;

  // Embedded details for easy relations
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

export interface DatabaseSchema {
  paas: PAA[];
  sectors: Sector[];
  axes: Axis[];
  users: User[];
  actions: Action[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  templates: ActionTemplate[];
  settings: InstitutionSettings;
  docConfig: DocumentConfiguration;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'paa_db.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadOrInit();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Erro ao persistir banco de dados:', err);
    }
  }

  private loadOrInit(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {
        console.error('Falha ao ler arquivo do banco, reinicializando com seed:', e);
      }
    }
    const initial = this.getSeedData();
    this.data = initial;
    this.save();
    return initial;
  }

  private getSeedData(): DatabaseSchema {
    const defaultSettings: InstitutionSettings = {
      nome_instituicao: 'Instituto Federal de Educação, Ciência e Tecnologia do Maranhão',
      nome_campus: 'Campus Carolina',
      endereco: 'Rodovia BR-230, Km 02, S/N, Carolina - MA, CEP 65980-000',
      telefone: '(99) 3531-0000 / (99) 3531-0001',
      email: 'gabinete.carolina@ifma.edu.br',
      site: 'https://carolina.ifma.edu.br',
      nome_diretor: 'Prof. Diretor Geral',
      cargo_diretor: 'Diretor-Geral do IFMA Campus Carolina',
      texto_apresentacao: 'O Plano de Ação Anual (PAA) 2027 do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão - Campus Carolina consolida as metas estratégicas, diretrizes acadêmicas, administrativas e orçamentárias prioritárias para o exercício.',
      texto_introducao: 'Elaborado de forma participativa com a comunidade acadêmica e alinhado ao Plano de Desenvolvimento Institucional (PDI), o PAA 2027 reflete o compromisso com o ensino público, gratuito e de excelência no sul do Maranhão.',
      texto_metodologia: 'A metodologia de elaboração baseia-se na definição de eixos temáticos institucionais, cadastramento setorial de ações estruturadas, orçamentação fidedigna com rastreamento por fonte e natureza da despesa, e acompanhamento por indicadores de resultado.',
      rodape_documento: 'IFMA Campus Carolina — Sistema PAA — Plano de Ação Anual 2027',
    };

    const defaultDocConfig: DocumentConfiguration = {
      titulo: 'PLANO DE AÇÃO ANUAL',
      subtitulo: 'PAA 2027 — IFMA CAMPUS CAROLINA',
      ordem_secoes: [
        'CAPA',
        'IDENTIFICACAO_INSTITUCIONAL',
        'SUMARIO',
        'APRESENTACAO',
        'INTRODUCAO',
        'OBJETIVO_GERAL',
        'OBJETIVOS_ESPECIFICOS',
        'METODOLOGIA',
        'EIXOS',
        'ACOES',
        'CRONOGRAMA',
        'RESUMO_ORCAMENTARIO',
        'INDICADORES',
        'MONITORAMENTO',
        'AVALIACAO',
        'ENCERRAMENTO',
        'ASSINATURAS'
      ],
      regras_campos: {
        eixo: 'obrigatorio',
        setor: 'obrigatorio',
        responsavel: 'obrigatorio',
        titulo: 'obrigatorio',
        prioridade: 'obrigatorio',
        objetivo: 'obrigatorio',
        descricao: 'obrigatorio',
        justificativa: 'obrigatorio',
        publico_alvo: 'obrigatorio',
        indicadores: 'obrigatorio',
        cronograma: 'obrigatorio',
        orcamento: 'opcional',
        fonte_recurso: 'obrigatorio'
      },
      assinaturas: [
        { nome: 'Prof. Diretor Geral', cargo: 'Diretor-Geral', papel: 'Aprovação Institucional' },
        { nome: 'Diretor de Administração e Planejamento', cargo: 'DAP / Planejamento', papel: 'Consolidação Orçamentária' },
        { nome: 'Diretor de Ensino', cargo: 'Diretor de Ensino', papel: 'Coordenação Pedagógica' }
      ]
    };

    const sectors: Sector[] = [
      { id: 'sec-dg', nome: 'Direção-Geral', sigla: 'DG', descricao: 'Órgão executivo máximo do Campus Carolina', email: 'dg.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-gab', nome: 'Gabinete da Direção-Geral', sigla: 'GAB', descricao: 'Apoio executivo e institucional', email: 'gabinete.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-dap', nome: 'Departamento de Administração e Planejamento', sigla: 'DAP', descricao: 'Gestão orçamentária, compras, contratos e infraestrutura', email: 'dap.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-de', nome: 'Departamento de Ensino', sigla: 'DE', descricao: 'Gestão acadêmica dos cursos técnicos e superiores', email: 'de.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-pesq', nome: 'Coordenação de Pesquisa, Pós-Graduação e Inovação', sigla: 'CPPI', descricao: 'Fomento a projetos científicos, iniciação e inovação', email: 'pesquisa.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-ext', nome: 'Coordenação de Extensão e Relações Comunitárias', sigla: 'CERC', descricao: 'Interação com a sociedade regional e projetos comunitários', email: 'extensao.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-ctic', nome: 'Coordenação de Tecnologia da Informação e Comunicação', sigla: 'CTIC', descricao: 'Infraestrutura de redes, sistemas e suporte tecnológico', email: 'ctic.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-cae', nome: 'Coordenação de Assistência ao Educando', sigla: 'CAE', descricao: 'Programas de permanência, saúde e apoio discente', email: 'cae.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-bib', nome: 'Biblioteca do Campus Carolina', sigla: 'BIB', descricao: 'Gestão do acervo bibliográfico e incentivo à leitura', email: 'biblioteca.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() },
      { id: 'sec-coord', nome: 'Coordenações de Cursos Técnicos e Superiores', sigla: 'COCC', descricao: 'Articulação dos colegiados e matrizes curriculares', email: 'cursos.carolina@ifma.edu.br', ativo: true, created_at: new Date().toISOString() }
    ];

    const users: User[] = [
      { id: 'usr-admin', nome: 'Administrador do Sistema', email: 'admin@carolina.ifma.edu.br', senha: '123', matricula_funcional: '2027001', role: 'ADMIN', sector_id: 'sec-dg', ativo: true, created_at: new Date().toISOString() },
      { id: 'usr-gestor-dap', nome: 'Gestor DAP (Administração)', email: 'gestor.admin@carolina.ifma.edu.br', senha: '123', matricula_funcional: '2027002', role: 'GESTOR_SETOR', sector_id: 'sec-dap', ativo: true, created_at: new Date().toISOString() },
      { id: 'usr-gestor-de', nome: 'Gestor DE (Ensino)', email: 'gestor.ensino@carolina.ifma.edu.br', senha: '123', matricula_funcional: '2027003', role: 'GESTOR_SETOR', sector_id: 'sec-de', ativo: true, created_at: new Date().toISOString() },
      { id: 'usr-validador', nome: 'Validador Institucional', email: 'validador@carolina.ifma.edu.br', senha: '123', matricula_funcional: '2027004', role: 'VALIDADOR', sector_id: 'sec-gab', ativo: true, created_at: new Date().toISOString() },
      { id: 'usr-resp', nome: 'Responsável de Ação', email: 'responsavel@carolina.ifma.edu.br', senha: '123', matricula_funcional: '2027005', role: 'RESPONSAVEL_ACAO', sector_id: 'sec-ctic', ativo: true, created_at: new Date().toISOString() },
      { id: 'usr-consulta', nome: 'Consulta / Controle Interno', email: 'consulta@carolina.ifma.edu.br', senha: '123', role: 'CONSULTA', ativo: true, created_at: new Date().toISOString() }
    ];

    const paas: PAA[] = [
      {
        id: 'paa-2027',
        ano: 2027,
        campus: 'IFMA Campus Carolina',
        titulo: 'Plano de Ação Anual 2027 — Campus Carolina',
        descricao: 'Instrumento tático-operacional que viabiliza o alcance dos objetivos estratégicos do IFMA Campus Carolina para o exercício 2027.',
        status: 'ABERTO',
        data_inicio: '2027-01-01',
        data_fim: '2027-12-31',
        prazo_preenchimento: '2026-11-30',
        prazo_validacao: '2026-12-20',
        responsavel_id: 'usr-admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'paa-2026',
        ano: 2026,
        campus: 'IFMA Campus Carolina',
        titulo: 'Plano de Ação Anual 2026 — Campus Carolina',
        descricao: 'Exercício de referência anterior do PAA Campus Carolina.',
        status: 'EM_EXECUCAO',
        data_inicio: '2026-01-01',
        data_fim: '2026-12-31',
        prazo_preenchimento: '2025-11-30',
        prazo_validacao: '2025-12-15',
        responsavel_id: 'usr-admin',
        created_at: '2025-10-01T10:00:00.000Z',
        updated_at: '2026-09-01T10:00:00.000Z'
      }
    ];

    const axes: Axis[] = [
      { id: 'eixo-1', paa_id: 'paa-2027', nome: 'Eixo 1 — Ensino e Desenvolvimento Acadêmico', descricao: 'Qualificação da oferta educacional, modernização pedagógica e permanência discente', ordem: 1, ativo: true },
      { id: 'eixo-2', paa_id: 'paa-2027', nome: 'Eixo 2 — Pesquisa, Pós-Graduação e Inovação', descricao: 'Fomento a projetos de pesquisa aplicada, iniciação científica e propriedade intelectual', ordem: 2, ativo: true },
      { id: 'eixo-3', paa_id: 'paa-2027', nome: 'Eixo 3 — Extensão e Integração com a Sociedade', descricao: 'Projetos comunitários, cursos FIC, estágios e cooperação regional', ordem: 3, ativo: true },
      { id: 'eixo-4', paa_id: 'paa-2027', nome: 'Eixo 4 — Gestão Institucional, Governança e Infraestrutura', descricao: 'Planejamento orçamentário, modernização das instalações físicas e sustentabilidade', ordem: 4, ativo: true },
      { id: 'eixo-5', paa_id: 'paa-2027', nome: 'Eixo 5 — Assistência Estudantil e Inclusão', descricao: 'Auxílios, apoio psicopedagógico, acessibilidade e bem-estar estudantil', ordem: 5, ativo: true },
      { id: 'eixo-6', paa_id: 'paa-2027', nome: 'Eixo 6 — Tecnologia da Informação e Transformação Digital', descricao: 'Infraestrutura computacional, governança de TI e conectividade para ensino e gestão', ordem: 6, ativo: true }
    ];

    const templates: ActionTemplate[] = [
      {
        id: 'tmpl-1',
        nome: 'Modernização de Laboratório Didático',
        eixo_sugerido: 'Eixo 1 — Ensino e Desenvolvimento Acadêmico',
        objetivo: 'Adequar a infraestrutura de laboratórios práticos para atender às novas demandas curriculares.',
        descricao: 'Aquisição de equipamentos, mobiliário ergonômico e insumos para aulas práticas dos cursos técnicos e superiores.',
        indicadores: [
          { nome: 'Laboratórios modernizados', unidade_medida: 'Unidade', meta: 2, tipo_meta: 'NUMERICA' }
        ],
        orientacoes: 'Verificar especificação técnica junto ao setor de compras e corpo docente.',
        ativo: true
      },
      {
        id: 'tmpl-2',
        nome: 'Programa de Iniciação Científica e Tecnológica',
        eixo_sugerido: 'Eixo 2 — Pesquisa, Pós-Graduação e Inovação',
        objetivo: 'Incentivar a participação de estudantes do Campus Carolina em projetos de pesquisa aplicada.',
        descricao: 'Lançamento de edital interno de bolsas PIBIC/PIBITI e custeio de material de consumo para projetos selecionados.',
        indicadores: [
          { nome: 'Bolsas de pesquisa concedidas', unidade_medida: 'Bolsas', meta: 10, tipo_meta: 'NUMERICA' }
        ],
        orientacoes: 'Alinhar prazos com o calendário de editais da PRPGI do IFMA.',
        ativo: true
      },
      {
        id: 'tmpl-3',
        nome: 'Manutenção Preventiva e Corretiva Predial',
        eixo_sugerido: 'Eixo 4 — Gestão Institucional, Governança e Infraestrutura',
        objetivo: 'Garantir a preservação e segurança das edificações, salas de aula e áreas comuns do Campus.',
        descricao: 'Contratação de serviços de engenharia predial, pintura, instalações elétricas e climatização.',
        indicadores: [
          { nome: 'Área predial revitalizada', unidade_medida: 'm²', meta: 1200, tipo_meta: 'NUMERICA' }
        ],
        orientacoes: 'Elaborar termo de referência detalhado e cronograma não conflitante com período letivo.',
        ativo: true
      }
    ];

    // Seed realistic DEMO actions for PAA 2027
    const demoActions: Action[] = [
      {
        id: 'act-demo-1',
        paa_id: 'paa-2027',
        eixo_id: 'eixo-6',
        setor_id: 'sec-ctic',
        responsavel_id: 'usr-resp',
        titulo: '[DEMO] Expansão do Parque Computacional e Conectividade Wi-Fi no Campus',
        prioridade: 'ALTA',
        objetivo: 'Garantir conectividade de alta velocidade e modernização das estações de trabalho de laboratórios de informática para os cursos do campus.',
        descricao: 'Instalação de 12 novos pontos de acesso Wi-Fi 6 corporativos, aquisição de 30 computadores para o Laboratório de Informática II e implantação de link redundante de fibra óptica.',
        justificativa: 'Atualmente o campus possui sobrecarga nos pontos de acesso durante os intervalos e computadores obsoletos que limitam disciplinas de programação e modelagem.',
        publico_alvo: 'Estudantes dos cursos técnicos integrados, subsequentes e comunidade docente do IFMA Campus Carolina.',
        status: 'APROVADA',
        possui_orcamento: true,
        observacoes: 'Ação priorizada no planejamento do CTIC 2027.',
        is_demo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        indicadores: [
          {
            id: 'ind-1',
            action_id: 'act-demo-1',
            nome: 'Computadores instalados e operacionais',
            descricao: 'Terminais de última geração para aulas práticas',
            unidade_medida: 'Computadores',
            tipo_meta: 'NUMERICA',
            linha_base: 25,
            meta: 30,
            resultado: 0,
            percentual: 0,
            resultado_esperado: '30 novos equipamentos integrados ao domínio do IFMA'
          },
          {
            id: 'ind-2',
            action_id: 'act-demo-1',
            nome: 'Cobertura Wi-Fi nas áreas acadêmicas',
            unidade_medida: '% de cobertura',
            tipo_meta: 'PERCENTUAL',
            linha_base: 60,
            meta: 95,
            resultado: 0,
            percentual: 0,
            resultado_esperado: 'Sinal estável em 95% dos blocos de sala de aula'
          }
        ],
        cronograma: {
          id: 'cro-1',
          action_id: 'act-demo-1',
          data_inicio: '2027-02-01',
          data_fim: '2027-08-31',
          janeiro: false,
          fevereiro: true,
          marco: true,
          abril: true,
          maio: true,
          junho: true,
          julho: false,
          agosto: true,
          setembro: false,
          outubro: false,
          novembro: false,
          dezembro: false,
          atividades_mes: {
            fevereiro: 'Elaboração do Termo de Referência',
            marco: 'Processo licitatório via pregão SRP',
            abril: 'Empenho e acompanhamento da entrega',
            maio: 'Recebimento e tombamento patrimonial',
            junho: 'Instalação física e cabeamento estruturado',
            agosto: 'Configuração dos APs e testes com alunos'
          },
          atividades_texto: 'Cronograma alinhado com o início do semestre letivo 2027.1.'
        },
        itens_orcamento: [
          {
            id: 'orc-1',
            action_id: 'act-demo-1',
            descricao: 'Computadores desktop para laboratório institucional',
            quantidade: 30,
            unidade: 'Unidade',
            valor_unitario: 4200.00,
            valor_total: 126000.00,
            tipo_despesa: 'Investimento',
            fonte_recurso: 'Tesouro Nacional',
            acao_orcamentaria: '20RL',
            plano_interno: 'PISISTEMAS',
            natureza_despesa: '449052',
            observacao: 'Pregão eletrônico nacional IFMA'
          },
          {
            id: 'orc-2',
            action_id: 'act-demo-1',
            descricao: 'Access Points Wi-Fi 6 Corporativos',
            quantidade: 12,
            unidade: 'Unidade',
            valor_unitario: 1100.00,
            valor_total: 13200.00,
            tipo_despesa: 'Investimento',
            fonte_recurso: 'Tesouro Nacional',
            acao_orcamentaria: '20RL',
            natureza_despesa: '449052'
          },
          {
            id: 'orc-3',
            action_id: 'act-demo-1',
            descricao: 'Cabos UTP Cat6 e conectores para passagem',
            quantidade: 4,
            unidade: 'Caixa 305m',
            valor_unitario: 750.00,
            valor_total: 3000.00,
            tipo_despesa: 'Custeio',
            fonte_recurso: 'Recursos Próprios',
            acao_orcamentaria: '20RL',
            natureza_despesa: '339030'
          }
        ],
        execucao: {
          id: 'exe-1',
          action_id: 'act-demo-1',
          status_execucao: 'EM_ANDAMENTO',
          percentual_execucao: 35,
          meta_planejada: 30,
          meta_realizada: 10,
          valor_planejado: 142200.00,
          valor_executado: 13200.00,
          resultado: 'Equipamentos de rede Wi-Fi entregues e configurados; pregão dos computadores em fase final.',
          justificativa: 'Pequena dilação de prazo em virtude da logística de frete para Carolina - MA.',
          data_atualizacao: new Date().toISOString()
        },
        anexos: [
          {
            id: 'anx-1',
            action_id: 'act-demo-1',
            nome: 'Termo_Referencia_CTIC_2027.pdf',
            tipo: 'application/pdf',
            tamanho: 245000,
            usuario_id: 'usr-resp',
            created_at: new Date().toISOString()
          }
        ],
        aprovacoes: [
          {
            id: 'apr-1',
            action_id: 'act-demo-1',
            usuario_id: 'usr-validador',
            usuario_nome: 'Validador Institucional',
            status_anterior: 'ENVIADA',
            novo_status: 'APROVADA',
            motivo: 'Ação estratégica indispensável para as atividades pedagógicas do campus Carolina.',
            data: new Date().toISOString()
          }
        ],
        historico: [
          { id: 'his-1', action_id: 'act-demo-1', descricao: 'Ação cadastrada no PAA 2027.', usuario_nome: 'Responsável de Ação', data: '2026-09-10T10:00:00.000Z' },
          { id: 'his-2', action_id: 'act-demo-1', descricao: 'Enviada para validação institucional.', usuario_nome: 'Responsável de Ação', data: '2026-09-11T14:30:00.000Z' },
          { id: 'his-3', action_id: 'act-demo-1', descricao: 'Ação aprovada e consolidada.', usuario_nome: 'Validador Institucional', data: '2026-09-12T09:15:00.000Z' }
        ]
      },
      {
        id: 'act-demo-2',
        paa_id: 'paa-2027',
        eixo_id: 'eixo-1',
        setor_id: 'sec-de',
        responsavel_id: 'usr-gestor-de',
        titulo: '[DEMO] Programa Institucional de Apoio Pedagógico e Nivelamento em Matemática e Língua Portuguesa',
        prioridade: 'ALTA',
        objetivo: 'Reduzir os índices de evasão e reprovação escolar no 1º ano dos cursos técnicos integrados ao ensino médio.',
        descricao: 'Oferta de oficinas semestrais de nivelamento, monitoria discente remunerada, material didático impresso e acompanhamento psicopedagógico individualizado.',
        justificativa: 'Dados diagnósticos de 2025/2026 apontam defasagens na transição do ensino fundamental para o médio, demandando reforço imediato.',
        publico_alvo: 'Estudantes ingressantes dos cursos técnicos integrados do Campus Carolina.',
        status: 'CONSOLIDADA',
        possui_orcamento: true,
        is_demo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        indicadores: [
          {
            id: 'ind-3',
            action_id: 'act-demo-2',
            nome: 'Estudantes atendidos nas monitorias',
            unidade_medida: 'Estudantes',
            tipo_meta: 'NUMERICA',
            linha_base: 40,
            meta: 120,
            resultado: 0,
            percentual: 0
          },
          {
            id: 'ind-4',
            action_id: 'act-demo-2',
            nome: 'Redução na taxa de retenção no 1º ano',
            unidade_medida: '% de redução',
            tipo_meta: 'PERCENTUAL',
            linha_base: 22,
            meta: 10,
            resultado: 0,
            percentual: 0
          }
        ],
        cronograma: {
          id: 'cro-2',
          action_id: 'act-demo-2',
          janeiro: false,
          fevereiro: true,
          marco: true,
          abril: true,
          maio: true,
          junho: true,
          julho: false,
          agosto: true,
          setembro: true,
          outubro: true,
          novembro: true,
          dezembro: true,
          atividades_texto: 'Acompanhamento contínuo durante os bimestres letivos.'
        },
        itens_orcamento: [
          {
            id: 'orc-4',
            action_id: 'act-demo-2',
            descricao: 'Bolsas de monitoria de ensino discente (10 meses x 4 bolsistas)',
            quantidade: 40,
            unidade: 'Mês/Bolsa',
            valor_unitario: 500.00,
            valor_total: 20000.00,
            tipo_despesa: 'Custeio',
            fonte_recurso: 'Tesouro Nacional',
            natureza_despesa: '339018'
          },
          {
            id: 'orc-5',
            action_id: 'act-demo-2',
            descricao: 'Apostilas didáticas e kits de cálculo para alunos',
            quantidade: 120,
            unidade: 'Kit',
            valor_unitario: 45.00,
            valor_total: 5400.00,
            tipo_despesa: 'Custeio',
            fonte_recurso: 'Recursos Próprios',
            natureza_despesa: '339030'
          }
        ],
        execucao: {
          id: 'exe-2',
          action_id: 'act-demo-2',
          status_execucao: 'NAO_INICIADA',
          percentual_execucao: 0,
          meta_planejada: 120,
          meta_realizada: 0,
          valor_planejado: 25400.00,
          valor_executado: 0,
          data_atualizacao: new Date().toISOString()
        },
        anexos: [],
        aprovacoes: [
          {
            id: 'apr-2',
            action_id: 'act-demo-2',
            usuario_id: 'usr-validador',
            usuario_nome: 'Validador Institucional',
            status_anterior: 'ENVIADA',
            novo_status: 'CONSOLIDADA',
            motivo: 'Ação plenamente articulada às diretrizes do PDI.',
            data: new Date().toISOString()
          }
        ],
        historico: [
          { id: 'his-4', action_id: 'act-demo-2', descricao: 'Ação cadastrada pelo Departamento de Ensino.', data: '2026-09-12T11:00:00.000Z' },
          { id: 'his-5', action_id: 'act-demo-2', descricao: 'Ação aprovada e consolidada no PAA 2027.', data: '2026-09-14T16:00:00.000Z' }
        ]
      },
      {
        id: 'act-demo-3',
        paa_id: 'paa-2027',
        eixo_id: 'eixo-3',
        setor_id: 'sec-ext',
        responsavel_id: 'usr-gestor-de',
        titulo: '[DEMO] Seminário Regional de Agroecologia, Ecoturismo e Desenvolvimento Sustentável das Chapadas',
        prioridade: 'MEDIA',
        objetivo: 'Fomentar a integração entre os saberes tradicionais, a produção agroecológica local e as potencialidades turísticas do sul do Maranhão.',
        descricao: 'Realização de evento científico-comunitário de 3 dias no IFMA Campus Carolina, com palestras, mesas redondas, oficinas práticas de beneficiamento de frutos do cerrado e feira agroecológica.',
        justificativa: 'Carolina é polo turístico e ecológico com forte demanda por transferência tecnológica sustentável e formação de guias e pequenos produtores.',
        publico_alvo: 'Agricultores familiares, operadores de turismo, estudantes e pesquisadores.',
        status: 'ENVIADA',
        possui_orcamento: true,
        is_demo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        indicadores: [
          {
            id: 'ind-5',
            action_id: 'act-demo-3',
            nome: 'Participantes no seminário regional',
            unidade_medida: 'Pessoas',
            tipo_meta: 'NUMERICA',
            linha_base: 150,
            meta: 350,
            resultado: 0,
            percentual: 0
          }
        ],
        cronograma: {
          id: 'cro-3',
          action_id: 'act-demo-3',
          janeiro: false,
          fevereiro: false,
          marco: false,
          abril: false,
          maio: false,
          junho: true,
          julho: false,
          agosto: false,
          setembro: false,
          outubro: false,
          novembro: false,
          dezembro: false
        },
        itens_orcamento: [
          {
            id: 'orc-6',
            action_id: 'act-demo-3',
            descricao: 'Locação de tendas e infraestrutura de som para feira',
            quantidade: 1,
            unidade: 'Serviço',
            valor_unitario: 8500.00,
            valor_total: 8500.00,
            tipo_despesa: 'Custeio',
            fonte_recurso: 'Emenda Parlamentar',
            natureza_despesa: '339039'
          }
        ],
        execucao: {
          id: 'exe-3',
          action_id: 'act-demo-3',
          status_execucao: 'NAO_INICIADA',
          percentual_execucao: 0,
          meta_planejada: 350,
          meta_realizada: 0,
          valor_planejado: 8500.00,
          valor_executado: 0,
          data_atualizacao: new Date().toISOString()
        },
        anexos: [],
        aprovacoes: [],
        historico: [
          { id: 'his-6', action_id: 'act-demo-3', descricao: 'Ação enviada para validação.', data: new Date().toISOString() }
        ]
      },
      {
        id: 'act-demo-4',
        paa_id: 'paa-2027',
        eixo_id: 'eixo-4',
        setor_id: 'sec-dap',
        responsavel_id: 'usr-gestor-dap',
        titulo: '[DEMO] Reforma da Cobertura e Instalação de Usina Solar Fotovoltaica (Fase II)',
        prioridade: 'ALTA',
        objetivo: 'Promover a eficiência energética do campus, reduzindo os custos de custeio com energia elétrica e gerando energia limpa.',
        descricao: 'Impermeabilização do teto do pavilhão principal e instalação de 80 módulos solares fotovoltaicos com inversor trifásico de 50kW.',
        justificativa: 'As faturas de energia elétrica representam mais de 25% dos gastos de manutenção do campus; a incidência solar da região de Carolina favorece a amortização em menos de 3 anos.',
        publico_alvo: 'Toda a infraestrutura do IFMA Campus Carolina.',
        status: 'DEVOLVIDA',
        possui_orcamento: true,
        is_demo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        indicadores: [
          {
            id: 'ind-6',
            action_id: 'act-demo-4',
            nome: 'Capacidade de geração solar instalada',
            unidade_medida: 'kWp',
            tipo_meta: 'NUMERICA',
            linha_base: 30,
            meta: 80,
            resultado: 0,
            percentual: 0
          }
        ],
        cronograma: {
          id: 'cro-4',
          action_id: 'act-demo-4',
          janeiro: false,
          fevereiro: false,
          marco: true,
          abril: true,
          maio: true,
          junho: true,
          julho: true,
          agosto: false,
          setembro: false,
          outubro: false,
          novembro: false,
          dezembro: false
        },
        itens_orcamento: [
          {
            id: 'orc-7',
            action_id: 'act-demo-4',
            descricao: 'Módulos Fotovoltaicos e Inversor Trifásico 50kW',
            quantidade: 1,
            unidade: 'Sistema',
            valor_unitario: 185000.00,
            valor_total: 185000.00,
            tipo_despesa: 'Investimento',
            fonte_recurso: 'Tesouro Nacional',
            natureza_despesa: '449052'
          }
        ],
        execucao: {
          id: 'exe-4',
          action_id: 'act-demo-4',
          status_execucao: 'NAO_INICIADA',
          percentual_execucao: 0,
          meta_planejada: 80,
          meta_realizada: 0,
          valor_planejado: 185000.00,
          valor_executado: 0,
          data_atualizacao: new Date().toISOString()
        },
        anexos: [],
        aprovacoes: [
          {
            id: 'apr-3',
            action_id: 'act-demo-4',
            usuario_id: 'usr-validador',
            usuario_nome: 'Validador Institucional',
            status_anterior: 'ENVIADA',
            novo_status: 'DEVOLVIDA',
            motivo: 'Favor detalhar o Estudo Técnico Preliminar (ETP) e anexar o laudo estrutural de sustentação da cobertura antes da validação final.',
            data: new Date().toISOString()
          }
        ],
        historico: [
          { id: 'his-7', action_id: 'act-demo-4', descricao: 'Ação enviada para validação.', data: '2026-09-14T08:00:00.000Z' },
          { id: 'his-8', action_id: 'act-demo-4', descricao: 'Ação devolvida pelo Validador para anexação do laudo estrutural.', data: '2026-09-15T10:30:00.000Z' }
        ]
      }
    ];

    return {
      paas,
      sectors,
      axes,
      users,
      actions: demoActions,
      auditLogs: [
        {
          id: 'aud-1',
          user_name: 'Administrador do Sistema',
          action: 'SISTEMA_INICIALIZADO',
          entity: 'PAA',
          entity_id: 'paa-2027',
          created_at: new Date().toISOString(),
          new_value: { msg: 'Banco de dados configurado e semeado com sucesso.' }
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          usuario_id: 'usr-gestor-dap',
          titulo: 'Ação Devolvida para Ajustes',
          mensagem: 'A ação "Reforma da Cobertura e Instalação de Usina Solar" foi devolvida pelo Validador.',
          tipo: 'ALERTA',
          lida: false,
          link: '/acoes/act-demo-4',
          created_at: new Date().toISOString()
        },
        {
          id: 'notif-2',
          usuario_id: 'usr-validador',
          titulo: 'Nova Ação Aguardando Validação',
          mensagem: 'A ação "Seminário Regional de Agroecologia" foi submetida para sua análise.',
          tipo: 'INFO',
          lida: false,
          link: '/aprovacoes',
          created_at: new Date().toISOString()
        }
      ],
      templates,
      settings: defaultSettings,
      docConfig: defaultDocConfig
    };
  }

  // --- PAAs ---
  public getPAAs(): PAA[] {
    return this.data.paas;
  }

  public getPAAById(id: string): PAA | undefined {
    return this.data.paas.find(p => p.id === id);
  }

  public createPAA(paa: Partial<PAA>): PAA {
    const newPAA: PAA = {
      id: `paa-${paa.ano || Date.now()}`,
      ano: Number(paa.ano),
      campus: paa.campus || 'IFMA Campus Carolina',
      titulo: paa.titulo || `Plano de Ação Anual ${paa.ano}`,
      descricao: paa.descricao || '',
      status: paa.status || 'PLANEJAMENTO',
      data_inicio: paa.data_inicio || `${paa.ano}-01-01`,
      data_fim: paa.data_fim || `${paa.ano}-12-31`,
      prazo_preenchimento: paa.prazo_preenchimento || `${Number(paa.ano) - 1}-11-30`,
      prazo_validacao: paa.prazo_validacao || `${Number(paa.ano) - 1}-12-20`,
      responsavel_id: paa.responsavel_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.paas.push(newPAA);

    // Automatically clone default axes for this PAA
    const baseAxes = this.data.axes.filter(a => a.paa_id === 'paa-2027');
    if (baseAxes.length > 0) {
      baseAxes.forEach((ba, idx) => {
        this.data.axes.push({
          id: `eixo-${newPAA.id}-${idx + 1}`,
          paa_id: newPAA.id,
          nome: ba.nome,
          descricao: ba.descricao,
          ordem: ba.ordem,
          ativo: true
        });
      });
    }

    this.addAuditLog('usr-admin', 'Administrador', 'CRIAR_PAA', 'PAA', newPAA.id, null, newPAA);
    this.save();
    return newPAA;
  }

  public updatePAA(id: string, updates: Partial<PAA>): PAA | null {
    const idx = this.data.paas.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const old = { ...this.data.paas[idx] };
    this.data.paas[idx] = {
      ...this.data.paas[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.addAuditLog('usr-admin', 'Administrador', 'ATUALIZAR_PAA', 'PAA', id, old, this.data.paas[idx]);
    this.save();
    return this.data.paas[idx];
  }

  // --- SETORS ---
  public getSectors(): Sector[] {
    return this.data.sectors;
  }

  public createSector(sector: Partial<Sector>): Sector {
    const newSector: Sector = {
      id: `sec-${Date.now()}`,
      nome: sector.nome || 'Novo Setor',
      sigla: sector.sigla || 'SET',
      descricao: sector.descricao || '',
      responsavel_id: sector.responsavel_id,
      email: sector.email || '',
      ativo: sector.ativo !== false,
      created_at: new Date().toISOString()
    };
    this.data.sectors.push(newSector);
    this.addAuditLog('usr-admin', 'Administrador', 'CRIAR_SETOR', 'Sector', newSector.id, null, newSector);
    this.save();
    return newSector;
  }

  public updateSector(id: string, updates: Partial<Sector>): Sector | null {
    const idx = this.data.sectors.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const old = { ...this.data.sectors[idx] };
    this.data.sectors[idx] = { ...this.data.sectors[idx], ...updates };
    this.addAuditLog('usr-admin', 'Administrador', 'ATUALIZAR_SETOR', 'Sector', id, old, this.data.sectors[idx]);
    this.save();
    return this.data.sectors[idx];
  }

  public deleteSector(id: string): boolean {
    const idx = this.data.sectors.findIndex(s => s.id === id);
    if (idx === -1) return false;
    const removed = this.data.sectors.splice(idx, 1)[0];
    this.addAuditLog('usr-admin', 'Administrador', 'EXCLUIR_SETOR', 'Sector', id, removed, null);
    this.save();
    return true;
  }

  // --- EIXOS ---
  public getAxes(paaId?: string): Axis[] {
    if (paaId) {
      return this.data.axes.filter(a => a.paa_id === paaId).sort((a, b) => a.ordem - b.ordem);
    }
    return this.data.axes.sort((a, b) => a.ordem - b.ordem);
  }

  public createAxis(axis: Partial<Axis>): Axis {
    const newAxis: Axis = {
      id: `eixo-${Date.now()}`,
      paa_id: axis.paa_id || 'paa-2027',
      nome: axis.nome || 'Novo Eixo',
      descricao: axis.descricao || '',
      ordem: axis.ordem || this.data.axes.length + 1,
      ativo: axis.ativo !== false
    };
    this.data.axes.push(newAxis);
    this.addAuditLog('usr-admin', 'Administrador', 'CRIAR_EIXO', 'Axis', newAxis.id, null, newAxis);
    this.save();
    return newAxis;
  }

  public updateAxis(id: string, updates: Partial<Axis>): Axis | null {
    const idx = this.data.axes.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const old = { ...this.data.axes[idx] };
    this.data.axes[idx] = { ...this.data.axes[idx], ...updates };
    this.addAuditLog('usr-admin', 'Administrador', 'ATUALIZAR_EIXO', 'Axis', id, old, this.data.axes[idx]);
    this.save();
    return this.data.axes[idx];
  }

  public deleteAxis(id: string): boolean {
    const idx = this.data.axes.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const removed = this.data.axes.splice(idx, 1)[0];
    this.addAuditLog('usr-admin', 'Administrador', 'EXCLUIR_EIXO', 'Axis', id, removed, null);
    this.save();
    return true;
  }

  public reorderAxes(axesOrder: { id: string; ordem: number }[]): Axis[] {
    axesOrder.forEach(item => {
      const axis = this.data.axes.find(a => a.id === item.id);
      if (axis) axis.ordem = item.ordem;
    });
    this.save();
    return this.getAxes();
  }

  // --- USUÁRIOS ---
  public getUsers(): User[] {
    return this.data.users.map(({ senha, ...u }) => u as User);
  }

  public getUserById(id: string): User | undefined {
    const u = this.data.users.find(usr => usr.id === id);
    if (!u) return undefined;
    const { senha, ...safe } = u;
    return safe as User;
  }

  public createUser(user: Partial<User>): User {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      nome: user.nome || 'Novo Usuário',
      email: user.email || `usuario-${Date.now()}@carolina.ifma.edu.br`,
      senha: user.senha || '123',
      matricula_funcional: user.matricula_funcional || '',
      role: user.role || 'GESTOR_SETOR',
      sector_id: user.sector_id,
      ativo: user.ativo !== false,
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.addAuditLog('usr-admin', 'Administrador', 'CRIAR_USUARIO', 'User', newUser.id, null, { email: newUser.email, role: newUser.role });
    this.save();
    const { senha, ...safe } = newUser;
    return safe as User;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const old = { ...this.data.users[idx] };
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.addAuditLog('usr-admin', 'Administrador', 'ATUALIZAR_USUARIO', 'User', id, { email: old.email }, { email: this.data.users[idx].email });
    this.save();
    const { senha, ...safe } = this.data.users[idx];
    return safe as User;
  }

  public deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    const removed = this.data.users.splice(idx, 1)[0];
    this.addAuditLog('usr-admin', 'Administrador', 'EXCLUIR_USUARIO', 'User', id, { email: removed.email }, null);
    this.save();
    return true;
  }

  public authenticate(email: string, pass?: string): User | null {
    const user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.ativo);
    if (!user) return null;
    if (pass && user.senha && user.senha !== pass && pass !== '123') {
      // allow simple demo password
      return null;
    }
    const { senha, ...safe } = user;
    return safe as User;
  }

  // --- ACTIONS ---
  public getActions(filters?: {
    paa_id?: string;
    eixo_id?: string;
    setor_id?: string;
    status?: string;
    prioridade?: string;
    search?: string;
    responsavel_id?: string;
  }): Action[] {
    let list = [...this.data.actions];
    if (filters?.paa_id) list = list.filter(a => a.paa_id === filters.paa_id);
    if (filters?.eixo_id) list = list.filter(a => a.eixo_id === filters.eixo_id);
    if (filters?.setor_id) list = list.filter(a => a.setor_id === filters.setor_id);
    if (filters?.status) list = list.filter(a => a.status === filters.status);
    if (filters?.prioridade) list = list.filter(a => a.prioridade === filters.prioridade);
    if (filters?.responsavel_id) list = list.filter(a => a.responsavel_id === filters.responsavel_id);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(a =>
        a.titulo.toLowerCase().includes(q) ||
        a.descricao.toLowerCase().includes(q) ||
        a.objetivo.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getActionById(id: string): Action | undefined {
    return this.data.actions.find(a => a.id === id);
  }

  public createAction(actionData: Partial<Action>, user?: { id: string; nome: string }): Action {
    const now = new Date().toISOString();
    const actionId = `act-${Date.now()}`;

    // Recalculate budget items server-side to guarantee integrity
    const items = (actionData.itens_orcamento || []).map((it, idx) => ({
      ...it,
      id: it.id || `orc-${Date.now()}-${idx}`,
      action_id: actionId,
      quantidade: Number(it.quantidade) || 1,
      valor_unitario: Number(it.valor_unitario) || 0,
      valor_total: (Number(it.quantidade) || 1) * (Number(it.valor_unitario) || 0)
    }));

    const totalOrcamento = items.reduce((acc, curr) => acc + curr.valor_total, 0);

    const schedule: ActionSchedule = actionData.cronograma ? {
      ...actionData.cronograma,
      id: actionData.cronograma.id || `cro-${Date.now()}`,
      action_id: actionId
    } : {
      id: `cro-${Date.now()}`,
      action_id: actionId,
      janeiro: false,
      fevereiro: false,
      marco: false,
      abril: false,
      maio: false,
      junho: false,
      julho: false,
      agosto: false,
      setembro: false,
      outubro: false,
      novembro: false,
      dezembro: false
    };

    const newAction: Action = {
      id: actionId,
      paa_id: actionData.paa_id || 'paa-2027',
      eixo_id: actionData.eixo_id || 'eixo-1',
      setor_id: actionData.setor_id || 'sec-dg',
      responsavel_id: actionData.responsavel_id,
      titulo: actionData.titulo || 'Nova Ação',
      prioridade: actionData.prioridade || 'MEDIA',
      objetivo: actionData.objetivo || '',
      descricao: actionData.descricao || '',
      justificativa: actionData.justificativa || '',
      publico_alvo: actionData.publico_alvo || '',
      status: actionData.status || 'RASCUNHO',
      possui_orcamento: actionData.possui_orcamento ?? (items.length > 0),
      observacoes: actionData.observacoes || '',
      is_demo: false,
      created_at: now,
      updated_at: now,
      indicadores: (actionData.indicadores || []).map((ind, i) => ({
        ...ind,
        id: ind.id || `ind-${Date.now()}-${i}`,
        action_id: actionId,
        meta: Number(ind.meta) || 0,
        linha_base: Number(ind.linha_base) || 0,
        resultado: Number(ind.resultado) || 0,
        percentual: Number(ind.percentual) || 0
      })),
      cronograma: schedule,
      itens_orcamento: items,
      execucao: {
        id: `exe-${Date.now()}`,
        action_id: actionId,
        status_execucao: 'NAO_INICIADA',
        percentual_execucao: 0,
        meta_planejada: actionData.indicadores?.[0]?.meta || 0,
        meta_realizada: 0,
        valor_planejado: totalOrcamento,
        valor_executado: 0,
        data_atualizacao: now
      },
      anexos: actionData.anexos || [],
      aprovacoes: [],
      historico: [
        {
          id: `his-${Date.now()}`,
          action_id: actionId,
          descricao: 'Ação criada no sistema.',
          usuario_id: user?.id,
          usuario_nome: user?.nome || 'Usuário',
          data: now
        }
      ]
    };

    this.data.actions.push(newAction);
    this.addAuditLog(user?.id, user?.nome, 'CRIAR_ACAO', 'Action', actionId, null, { titulo: newAction.titulo });
    this.save();
    return newAction;
  }

  public updateAction(id: string, updates: Partial<Action>, user?: { id: string; nome: string }): Action | null {
    const idx = this.data.actions.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const old = { ...this.data.actions[idx] };
    const now = new Date().toISOString();

    let items = updates.itens_orcamento ? updates.itens_orcamento.map((it, i) => ({
      ...it,
      id: it.id || `orc-${Date.now()}-${i}`,
      action_id: id,
      quantidade: Number(it.quantidade) || 1,
      valor_unitario: Number(it.valor_unitario) || 0,
      valor_total: (Number(it.quantidade) || 1) * (Number(it.valor_unitario) || 0)
    })) : this.data.actions[idx].itens_orcamento;

    const totalOrcamento = items.reduce((acc, curr) => acc + curr.valor_total, 0);

    const updatedAction: Action = {
      ...this.data.actions[idx],
      ...updates,
      itens_orcamento: items,
      updated_at: now
    };

    if (updatedAction.execucao) {
      updatedAction.execucao.valor_planejado = totalOrcamento;
    }

    updatedAction.historico.push({
      id: `his-${Date.now()}`,
      action_id: id,
      descricao: 'Ação editada e atualizada.',
      usuario_id: user?.id,
      usuario_nome: user?.nome || 'Usuário',
      data: now
    });

    this.data.actions[idx] = updatedAction;
    this.addAuditLog(user?.id, user?.nome, 'ATUALIZAR_ACAO', 'Action', id, { titulo: old.titulo }, { titulo: updatedAction.titulo });
    this.save();
    return updatedAction;
  }

  public deleteAction(id: string, user?: { id: string; nome: string }): boolean {
    const idx = this.data.actions.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const removed = this.data.actions.splice(idx, 1)[0];
    this.addAuditLog(user?.id, user?.nome, 'EXCLUIR_ACAO', 'Action', id, { titulo: removed.titulo }, null);
    this.save();
    return true;
  }

  public duplicateAction(id: string, user?: { id: string; nome: string }): Action | null {
    const source = this.getActionById(id);
    if (!source) return null;

    const cloned = JSON.parse(JSON.stringify(source)) as Action;
    const newId = `act-${Date.now()}`;
    const now = new Date().toISOString();

    cloned.id = newId;
    cloned.titulo = `[CÓPIA] ${source.titulo.replace('[DEMO] ', '')}`;
    cloned.status = 'RASCUNHO';
    cloned.is_demo = false;
    cloned.created_at = now;
    cloned.updated_at = now;
    cloned.aprovacoes = [];
    cloned.anexos = [];
    cloned.indicadores.forEach((ind, i) => {
      ind.id = `ind-${Date.now()}-${i}`;
      ind.action_id = newId;
      ind.resultado = 0;
      ind.percentual = 0;
    });
    if (cloned.cronograma) {
      cloned.cronograma.id = `cro-${Date.now()}`;
      cloned.cronograma.action_id = newId;
    }
    cloned.itens_orcamento.forEach((it, i) => {
      it.id = `orc-${Date.now()}-${i}`;
      it.action_id = newId;
    });
    cloned.execucao = {
      id: `exe-${Date.now()}`,
      action_id: newId,
      status_execucao: 'NAO_INICIADA',
      percentual_execucao: 0,
      meta_planejada: cloned.indicadores?.[0]?.meta || 0,
      meta_realizada: 0,
      valor_planejado: cloned.itens_orcamento.reduce((s, c) => s + c.valor_total, 0),
      valor_executado: 0,
      data_atualizacao: now
    };
    cloned.historico = [
      {
        id: `his-${Date.now()}`,
        action_id: newId,
        descricao: `Ação duplicada a partir da ação ${source.titulo}.`,
        usuario_id: user?.id,
        usuario_nome: user?.nome || 'Usuário',
        data: now
      }
    ];

    this.data.actions.push(cloned);
    this.addAuditLog(user?.id, user?.nome, 'DUPLICAR_ACAO', 'Action', newId, { sourceId: id }, { newId });
    this.save();
    return cloned;
  }

  public submitAction(id: string, user?: { id: string; nome: string }): Action | null {
    const action = this.getActionById(id);
    if (!action) return null;
    const now = new Date().toISOString();
    const oldStatus = action.status;
    action.status = 'ENVIADA';
    action.updated_at = now;
    action.historico.push({
      id: `his-${Date.now()}`,
      action_id: id,
      descricao: 'Ação enviada para validação institucional.',
      usuario_id: user?.id,
      usuario_nome: user?.nome || 'Usuário',
      data: now
    });
    this.addNotification('usr-validador', 'Nova Ação para Validação', `A ação "${action.titulo}" foi enviada pelo setor para validação.`, 'INFO', `/aprovacoes`);
    this.addAuditLog(user?.id, user?.nome, 'SUBMETER_ACAO', 'Action', id, { status: oldStatus }, { status: 'ENVIADA' });
    this.save();
    return action;
  }

  public approveAction(id: string, user?: { id: string; nome: string }, motivo?: string): Action | null {
    const action = this.getActionById(id);
    if (!action) return null;
    const now = new Date().toISOString();
    const oldStatus = action.status;
    action.status = 'APROVADA';
    action.updated_at = now;
    action.aprovacoes.push({
      id: `apr-${Date.now()}`,
      action_id: id,
      usuario_id: user?.id || 'validador',
      usuario_nome: user?.nome || 'Validador',
      status_anterior: oldStatus,
      novo_status: 'APROVADA',
      motivo: motivo || 'Ação aprovada conforme diretrizes do PAA.',
      data: now
    });
    action.historico.push({
      id: `his-${Date.now()}`,
      action_id: id,
      descricao: `Ação aprovada. ${motivo ? 'Justificativa: ' + motivo : ''}`,
      usuario_id: user?.id,
      usuario_nome: user?.nome || 'Validador',
      data: now
    });
    if (action.responsavel_id) {
      this.addNotification(action.responsavel_id, 'Ação Aprovada', `Sua ação "${action.titulo}" foi aprovada pela comissão institucional.`, 'SUCESSO', `/acoes/${id}`);
    }
    this.addAuditLog(user?.id, user?.nome, 'APROVAR_ACAO', 'Action', id, { status: oldStatus }, { status: 'APROVADA', motivo });
    this.save();
    return action;
  }

  public returnAction(id: string, motivo: string, user?: { id: string; nome: string }): Action | null {
    const action = this.getActionById(id);
    if (!action) return null;
    const now = new Date().toISOString();
    const oldStatus = action.status;
    action.status = 'DEVOLVIDA';
    action.updated_at = now;
    action.aprovacoes.push({
      id: `apr-${Date.now()}`,
      action_id: id,
      usuario_id: user?.id || 'validador',
      usuario_nome: user?.nome || 'Validador',
      status_anterior: oldStatus,
      novo_status: 'DEVOLVIDA',
      motivo: motivo,
      data: now
    });
    action.historico.push({
      id: `his-${Date.now()}`,
      action_id: id,
      descricao: `Ação devolvida para ajustes. Motivo: ${motivo}`,
      usuario_id: user?.id,
      usuario_nome: user?.nome || 'Validador',
      data: now
    });
    if (action.responsavel_id) {
      this.addNotification(action.responsavel_id, 'Ação Devolvida para Ajustes', `A ação "${action.titulo}" foi devolvida. Motivo: ${motivo}`, 'ALERTA', `/acoes/${id}/editar`);
    }
    this.addAuditLog(user?.id, user?.nome, 'DEVOLVER_ACAO', 'Action', id, { status: oldStatus }, { status: 'DEVOLVIDA', motivo });
    this.save();
    return action;
  }

  public consolidateAction(id: string, user?: { id: string; nome: string }): Action | null {
    const action = this.getActionById(id);
    if (!action) return null;
    const now = new Date().toISOString();
    action.status = 'CONSOLIDADA';
    action.updated_at = now;
    action.historico.push({
      id: `his-${Date.now()}`,
      action_id: id,
      descricao: 'Ação consolidada no documento oficial do PAA.',
      usuario_id: user?.id,
      usuario_nome: user?.nome || 'Administrador',
      data: now
    });
    this.addAuditLog(user?.id, user?.nome, 'CONSOLIDAR_ACAO', 'Action', id, null, { status: 'CONSOLIDADA' });
    this.save();
    return action;
  }

  public updateExecution(id: string, executionData: Partial<ActionExecution>, user?: { id: string; nome: string }): Action | null {
    const action = this.getActionById(id);
    if (!action) return null;
    const now = new Date().toISOString();

    action.execucao = {
      ...action.execucao,
      ...executionData,
      data_atualizacao: now
    };

    // If execution reached 100%, can mark action as CONCLUIDA
    if (action.execucao.percentual_execucao >= 100 && action.status !== 'CONCLUIDA') {
      action.status = 'CONCLUIDA';
    } else if (action.execucao.status_execucao === 'EM_ANDAMENTO' && action.status === 'CONSOLIDADA') {
      action.status = 'EM_EXECUCAO';
    }

    action.historico.push({
      id: `his-${Date.now()}`,
      action_id: id,
      descricao: `Execução atualizada para ${action.execucao.percentual_execucao}% (${action.execucao.status_execucao}).`,
      usuario_id: user?.id,
      usuario_nome: user?.nome || 'Responsável',
      data: now
    });

    this.addAuditLog(user?.id, user?.nome, 'ATUALIZAR_EXECUCAO', 'Action', id, null, executionData);
    this.save();
    return action;
  }

  public addAttachment(actionId: string, attachment: Partial<Attachment>, user?: { id: string; nome: string }): Attachment | null {
    const action = this.getActionById(actionId);
    if (!action) return null;
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      action_id: actionId,
      nome: attachment.nome || 'anexo.pdf',
      tipo: attachment.tipo || 'application/pdf',
      tamanho: attachment.tamanho || 1024,
      dados_base64: attachment.dados_base64,
      usuario_id: user?.id,
      created_at: new Date().toISOString()
    };
    action.anexos.push(newAtt);
    action.historico.push({
      id: `his-${Date.now()}`,
      action_id: actionId,
      descricao: `Anexo adicionado: ${newAtt.nome}`,
      usuario_id: user?.id,
      usuario_nome: user?.nome || 'Usuário',
      data: new Date().toISOString()
    });
    this.save();
    return newAtt;
  }

  public deleteAttachment(actionId: string, attachmentId: string): boolean {
    const action = this.getActionById(actionId);
    if (!action) return false;
    const idx = action.anexos.findIndex(a => a.id === attachmentId);
    if (idx === -1) return false;
    action.anexos.splice(idx, 1);
    this.save();
    return true;
  }

  public importFromPreviousPAA(sourcePaaId: string, targetPaaId: string, selectedActionIds: string[], user?: { id: string; nome: string }): Action[] {
    const imported: Action[] = [];
    const sourceActions = this.data.actions.filter(a => a.paa_id === sourcePaaId && selectedActionIds.includes(a.id));

    sourceActions.forEach(src => {
      const cloned = JSON.parse(JSON.stringify(src)) as Action;
      const newId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const now = new Date().toISOString();

      cloned.id = newId;
      cloned.paa_id = targetPaaId;
      cloned.status = 'RASCUNHO';
      cloned.is_demo = false;
      cloned.created_at = now;
      cloned.updated_at = now;
      cloned.aprovacoes = [];
      cloned.anexos = [];
      cloned.indicadores.forEach((ind, i) => {
        ind.id = `ind-${Date.now()}-${i}`;
        ind.action_id = newId;
        ind.resultado = 0;
        ind.percentual = 0;
      });
      if (cloned.cronograma) {
        cloned.cronograma.id = `cro-${Date.now()}`;
        cloned.cronograma.action_id = newId;
      }
      cloned.itens_orcamento.forEach((it, i) => {
        it.id = `orc-${Date.now()}-${i}`;
        it.action_id = newId;
      });
      cloned.execucao = {
        id: `exe-${Date.now()}`,
        action_id: newId,
        status_execucao: 'NAO_INICIADA',
        percentual_execucao: 0,
        meta_planejada: cloned.indicadores?.[0]?.meta || 0,
        meta_realizada: 0,
        valor_planejado: cloned.itens_orcamento.reduce((s, c) => s + c.valor_total, 0),
        valor_executado: 0,
        data_atualizacao: now
      };
      cloned.historico = [
        {
          id: `his-${Date.now()}`,
          action_id: newId,
          descricao: `Importada do exercício anterior (PAA ${sourcePaaId}).`,
          usuario_id: user?.id,
          usuario_nome: user?.nome || 'Usuário',
          data: now
        }
      ];

      this.data.actions.push(cloned);
      imported.push(cloned);
    });

    this.addAuditLog(user?.id, user?.nome, 'IMPORTAR_ACOES', 'PAA', targetPaaId, null, { count: imported.length, sourcePaaId });
    this.save();
    return imported;
  }

  // --- DEMO CLEANUP ---
  public cleanDemoData(user?: { id: string; nome: string }): { removed: number } {
    const initialCount = this.data.actions.length;
    this.data.actions = this.data.actions.filter(a => !a.is_demo);
    const removed = initialCount - this.data.actions.length;
    this.addAuditLog(user?.id, user?.nome, 'LIMPAR_DEMO', 'Action', 'all', null, { removed });
    this.save();
    return { removed };
  }

  // --- AUDIT & NOTIFICATIONS ---
  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].reverse();
  }

  public addAuditLog(userId?: string, userName?: string, action?: string, entity?: string, entityId?: string, oldValue?: any, newValue?: any) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      user_name: userName || 'Sistema',
      action: action || 'OPERACAO',
      entity: entity || 'Sistema',
      entity_id: entityId || '',
      old_value: oldValue,
      new_value: newValue,
      created_at: new Date().toISOString()
    };
    this.data.auditLogs.push(log);
    // keep max 500 audit logs
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.shift();
    }
  }

  public getNotifications(userId?: string): Notification[] {
    if (userId) {
      return this.data.notifications.filter(n => n.usuario_id === userId || n.usuario_id === 'all');
    }
    return this.data.notifications;
  }

  public addNotification(usuarioId: string, titulo: string, mensagem: string, tipo: 'INFO' | 'ALERTA' | 'SUCESSO' | 'AVISO' = 'INFO', link?: string) {
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      usuario_id: usuarioId,
      titulo,
      mensagem,
      tipo,
      lida: false,
      link,
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 200) {
      this.data.notifications.pop();
    }
    this.save();
    return notif;
  }

  public markNotificationAsRead(id: string): boolean {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.lida = true;
      this.save();
      return true;
    }
    return false;
  }

  // --- TEMPLATES ---
  public getTemplates(): ActionTemplate[] {
    return this.data.templates;
  }

  public createTemplate(t: Partial<ActionTemplate>): ActionTemplate {
    const newTmpl: ActionTemplate = {
      id: `tmpl-${Date.now()}`,
      nome: t.nome || 'Novo Modelo',
      eixo_sugerido: t.eixo_sugerido,
      objetivo: t.objetivo || '',
      descricao: t.descricao || '',
      indicadores: t.indicadores || [],
      orientacoes: t.orientacoes || '',
      ativo: true
    };
    this.data.templates.push(newTmpl);
    this.save();
    return newTmpl;
  }

  // --- SETTINGS & DOC CONFIG ---
  public getSettings(): InstitutionSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<InstitutionSettings>): InstitutionSettings {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
    return this.data.settings;
  }

  public getDocConfig(): DocumentConfiguration {
    return this.data.docConfig;
  }

  public updateDocConfig(config: Partial<DocumentConfiguration>): DocumentConfiguration {
    this.data.docConfig = { ...this.data.docConfig, ...config };
    this.save();
    return this.data.docConfig;
  }

  // --- DASHBOARD METRICS ---
  public getDashboardStats(paaId: string = 'paa-2027', sectorId?: string) {
    let actions = this.data.actions.filter(a => a.paa_id === paaId);
    if (sectorId) {
      actions = actions.filter(a => a.setor_id === sectorId);
    }

    const totalActions = actions.length;
    const rascunhos = actions.filter(a => a.status === 'RASCUNHO').length;
    const enviadas = actions.filter(a => a.status === 'ENVIADA').length;
    const emAnalise = actions.filter(a => a.status === 'EM_ANALISE').length;
    const devolvidas = actions.filter(a => a.status === 'DEVOLVIDA').length;
    const aprovadas = actions.filter(a => a.status === 'APROVADA' || a.status === 'CONSOLIDADA' || a.status === 'PUBLICADA' || a.status === 'EM_EXECUCAO' || a.status === 'CONCLUIDA').length;
    const emExecucao = actions.filter(a => a.execucao?.status_execucao === 'EM_ANDAMENTO' || a.status === 'EM_EXECUCAO').length;
    const concluidas = actions.filter(a => a.execucao?.status_execucao === 'CONCLUIDA' || a.status === 'CONCLUIDA').length;
    const atrasadas = actions.filter(a => a.execucao?.status_execucao === 'ATRASADA').length;

    let orcamentoPlanejado = 0;
    let orcamentoExecutado = 0;
    let custeioPlanejado = 0;
    let investimentoPlanejado = 0;

    actions.forEach(a => {
      a.itens_orcamento?.forEach(it => {
        orcamentoPlanejado += it.valor_total;
        if (it.tipo_despesa?.toLowerCase().includes('custeio')) {
          custeioPlanejado += it.valor_total;
        } else {
          investimentoPlanejado += it.valor_total;
        }
      });
      if (a.execucao?.valor_executado) {
        orcamentoExecutado += a.execucao.valor_executado;
      }
    });

    const fillRate = totalActions > 0 ? Math.round(((totalActions - rascunhos) / totalActions) * 100) : 0;
    const approvalRate = totalActions > 0 ? Math.round((aprovadas / totalActions) * 100) : 0;
    const executionRate = orcamentoPlanejado > 0 ? Math.round((orcamentoExecutado / orcamentoPlanejado) * 100) : 0;
    const physicalExecutionRate = totalActions > 0 ? Math.round(actions.reduce((acc, a) => acc + (a.execucao?.percentual_execucao || 0), 0) / totalActions) : 0;

    // By Axis
    const byAxis: Record<string, { nome: string; count: number; orcamento: number }> = {};
    this.data.axes.filter(ax => ax.paa_id === paaId).forEach(ax => {
      byAxis[ax.id] = { nome: ax.nome, count: 0, orcamento: 0 };
    });
    actions.forEach(a => {
      if (byAxis[a.eixo_id]) {
        byAxis[a.eixo_id].count++;
        byAxis[a.eixo_id].orcamento += a.itens_orcamento?.reduce((acc, curr) => acc + curr.valor_total, 0) || 0;
      }
    });

    // By Sector
    const bySector: Record<string, { sigla: string; count: number; orcamento: number }> = {};
    this.data.sectors.forEach(sec => {
      bySector[sec.id] = { sigla: sec.sigla, count: 0, orcamento: 0 };
    });
    actions.forEach(a => {
      if (bySector[a.setor_id]) {
        bySector[a.setor_id].count++;
        bySector[a.setor_id].orcamento += a.itens_orcamento?.reduce((acc, curr) => acc + curr.valor_total, 0) || 0;
      }
    });

    return {
      totalActions,
      rascunhos,
      enviadas,
      emAnalise,
      devolvidas,
      aprovadas,
      emExecucao,
      concluidas,
      atrasadas,
      orcamentoPlanejado,
      orcamentoExecutado,
      saldoOrcamentario: orcamentoPlanejado - orcamentoExecutado,
      custeioPlanejado,
      investimentoPlanejado,
      fillRate,
      approvalRate,
      executionRate,
      physicalExecutionRate,
      byAxis: Object.values(byAxis),
      bySector: Object.values(bySector)
    };
  }
}

export const dbService = new DatabaseService();
