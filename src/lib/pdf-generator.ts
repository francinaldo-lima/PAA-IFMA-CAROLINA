import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Action, Axis, FacultyMember, InstitutionSettings, ManagementMember, PAA, Sector, StaffMember } from '../types';

export function generatePAAPDF(
  paa: PAA,
  actions: Action[],
  axes: Axis[],
  sectors: Sector[],
  settings: InstitutionSettings,
  managementTeam: ManagementMember[] = [],
  faculty: FacultyMember[] = [],
  staff: StaffMember[] = []
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const approvedActions = actions.filter(a =>
    ['APROVADA', 'CONSOLIDADA', 'PUBLICADA', 'EM_EXECUCAO', 'CONCLUIDA'].includes(a.status)
  );

  // -------------------------------------------------------------
  // PÁGINA 1: CAPA OFICIAL (Conforme modelo PAA 2025)
  // -------------------------------------------------------------
  doc.setFillColor(15, 81, 50); // Verde Institucional IFMA
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFillColor(220, 38, 38); // Linha vermelha
  doc.rect(0, 22, pageWidth, 3, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MINISTÉRIO DA EDUCAÇÃO', pageWidth / 2, 45, { align: 'center' });
  doc.setFontSize(10);
  doc.text('SECRETARIA DE EDUCAÇÃO PROFISSIONAL E TECNOLÓGICA', pageWidth / 2, 51, { align: 'center' });
  doc.setFontSize(11);
  doc.text('INSTITUTO FEDERAL DO MARANHÃO', pageWidth / 2, 57, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(15, 81, 50);
  doc.text('CAMPUS AVANÇADO CAROLINA', pageWidth / 2, 65, { align: 'center' });

  // Emblema Institucional
  doc.setFillColor(15, 81, 50);
  doc.roundedRect(pageWidth / 2 - 25, 85, 50, 50, 4, 4, 'F');
  doc.setFillColor(220, 38, 38);
  doc.circle(pageWidth / 2 - 12, 98, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('IFMA', pageWidth / 2, 115, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CAMPUS CAROLINA', pageWidth / 2, 124, { align: 'center' });

  // Título do Documento
  doc.setTextColor(15, 81, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('PLANO DE AÇÃO ANUAL', pageWidth / 2, 160, { align: 'center' });
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(26);
  doc.text(`(PAA ${paa.ano})`, pageWidth / 2, 172, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Instrumento de Gestão Tática, Operacional e Orçamentária', pageWidth / 2, 183, { align: 'center' });

  // Rodapé da capa
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CAROLINA - MA', pageWidth / 2, pageHeight - 35, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(String(paa.ano), pageWidth / 2, pageHeight - 28, { align: 'center' });

  doc.setFillColor(15, 81, 50);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  // -------------------------------------------------------------
  // PÁGINA 2: EQUIPE DE GESTÃO (Página 2 do modelo PAA)
  // -------------------------------------------------------------
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 81, 50);
  doc.text('EQUIPE DE GESTÃO', 20, 30);

  const gestaoData = (managementTeam.length > 0 ? managementTeam : [
    { nome: 'Carlos César Teixeira', cargo_funcao: 'Reitor do IFMA' },
    { nome: 'Fernando Silva Lima', cargo_funcao: 'Diretor Geral' },
    { nome: 'Duana Ravena dos Santos Vieira', cargo_funcao: 'Diretora de Desenvolvimento Educacional' },
    { nome: 'Jannyelle de Souza Corrêa', cargo_funcao: 'Chefe do Departamento de Administração e Serviços de Gabinete' },
    { nome: 'Beatriz Guerra Kleinubing Rocha', cargo_funcao: 'Chefe do Departamento de Ações Inclusivas (DAI)' },
    { nome: 'Soniara Alves Maciel', cargo_funcao: 'Chefe do Departamento de Ensino e Extensão' },
    { nome: 'Claudia Araújo Moreira', cargo_funcao: 'Coordenadora do Curso Técnico em Agroecologia' },
    { nome: 'Iberê Pereira Parente', cargo_funcao: 'Coordenador do Curso Técnico em Agronegócio' },
    { nome: 'Leonardo Oliveira da Silva Coelho', cargo_funcao: 'Coordenador do Curso Técnico em Guia de Turismo' },
    { nome: 'Priscilla Novaes Nogueira', cargo_funcao: 'Coordenadora do Curso Técnico em Administração' },
    { nome: 'Raquel da Silva Cordeiro', cargo_funcao: 'Coordenadora da Pós-Graduação em Gestão e Desenv. Regional na Amazônia / Técnico em Comércio' },
    { nome: 'Thamires Barroso Lima', cargo_funcao: 'Coordenadora da Pós-Graduação em Gestão Ambiental de Municípios / Técnico em Meio Ambiente' }
  ]).map((m: any) => [
    m.cargo_funcao,
    m.nome,
    m.email || '—',
    m.matricula_siape || '—'
  ]);

  autoTable(doc, {
    startY: 36,
    head: [['Cargo / Função Institucional', 'Nome do Servidor', 'E-mail Institucional', 'SIAPE']],
    body: gestaoData,
    theme: 'grid',
    headStyles: { fillColor: [15, 81, 50], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.8 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 50 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20, halign: 'center' }
    }
  });

  // -------------------------------------------------------------
  // PÁGINA 3: CORPO DOCENTE (Página 3 do modelo PAA)
  // -------------------------------------------------------------
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 81, 50);
  doc.text('CORPO DOCENTE', 20, 30);

  const docenteData = (faculty.length > 0 ? faculty : [
    { titulacao: 'Doutor', nome: 'Dr. Fernando Silva Lima', area_disciplina: 'Administração Pública', e_chefia_setor: true, funcao_chefia: 'Diretor Geral' },
    { titulacao: 'Doutor', nome: 'Dr. Gesivaldo dos Santos Silva', area_disciplina: 'Ciências Humanas e Sociais', e_chefia_setor: false },
    { titulacao: 'Doutor', nome: 'Dr. Iberê Pereira Parente', area_disciplina: 'Ciências Agrárias / Agronegócio', e_chefia_setor: true, funcao_chefia: 'Coord. Técnico em Agronegócio' },
    { titulacao: 'Doutor', nome: 'Dra. Claudia Araújo Moreira', area_disciplina: 'Agroecologia', e_chefia_setor: true, funcao_chefia: 'Coord. Técnico em Agroecologia' },
    { titulacao: 'Doutor', nome: 'Dra. Raquel da Silva Cordeiro', area_disciplina: 'Desenvolvimento Regional', e_chefia_setor: true, funcao_chefia: 'Coord. Pós Gestão Regional / Comércio' },
    { titulacao: 'Especialista', nome: 'Esp. Davi Ketley Sousa Moraes', area_disciplina: 'Educação Básica e Técnica', e_chefia_setor: false },
    { titulacao: 'Especialista', nome: 'Esp. Jardeilson Luis Araujo Silva', area_disciplina: 'Informática Aplicada', e_chefia_setor: false },
    { titulacao: 'Especialista', nome: 'Esp. Jose Dilson de Sousa Junior Cunha Moreira', area_disciplina: 'Linguagens e Códigos', e_chefia_setor: false },
    { titulacao: 'Especialista', nome: 'Esp. Ueslei Bispo de Carvalho', area_disciplina: 'Matemática e Ciências Exatas', e_chefia_setor: false },
    { titulacao: 'Mestre', nome: 'Ma. Ana Lucia da Cunha', area_disciplina: 'Pedagogia e Formação Docente', e_chefia_setor: false },
    { titulacao: 'Mestre', nome: 'Ma. Ângela Cristina dos Santos Carvalho Minervino', area_disciplina: 'Ciências Sociais', e_chefia_setor: false },
    { titulacao: 'Mestre', nome: 'Ma. Duana Ravena dos Santos Vieira', area_disciplina: 'Educação Profissional', e_chefia_setor: true, funcao_chefia: 'Diretora de Desenv. Educacional' },
    { titulacao: 'Mestre', nome: 'Ma. Elizangela Divina Dias Batista', area_disciplina: 'Língua Portuguesa e Literatura', e_chefia_setor: false },
    { titulacao: 'Mestre', nome: 'Ma. Thamires Barroso Lima', area_disciplina: 'Gestão Ambiental', e_chefia_setor: true, funcao_chefia: 'Coord. Pós Gestão Ambiental / Meio Ambiente' },
    { titulacao: 'Mestre', nome: 'Me. Fernando Bezerra Chagas', area_disciplina: 'Engenharia e Tecnologia', e_chefia_setor: false },
    { titulacao: 'Mestre', nome: 'Me. Filipe dos Santos Alves', area_disciplina: 'História e Filosofia', e_chefia_setor: false },
    { titulacao: 'Mestre', nome: 'Me. Leonardo Oliveira da Silva Coelho', area_disciplina: 'Turismo e Hospitalidade', e_chefia_setor: true, funcao_chefia: 'Coord. Técnico em Guia de Turismo' },
    { titulacao: 'Mestre', nome: 'Me. Priscilla Novaes Nogueira Gomes', area_disciplina: 'Administração Geral', e_chefia_setor: true, funcao_chefia: 'Coord. Técnico em Administração' }
  ]).map((f: any) => [
    f.nome,
    f.titulacao || 'Graduado',
    f.area_disciplina || 'Docência',
    f.e_chefia_setor ? (f.funcao_chefia || 'Chefia de Setor') : 'Docente Efetivo'
  ]);

  autoTable(doc, {
    startY: 36,
    head: [['Nome do Docente', 'Titulação', 'Área de Atuação / Disciplina', 'Função / Chefia de Setor']],
    body: docenteData,
    theme: 'grid',
    headStyles: { fillColor: [15, 81, 50], fontSize: 8.5 },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 25 },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 }
    }
  });

  // -------------------------------------------------------------
  // PÁGINA 4: TÉCNICOS ADMINISTRATIVOS (Página 4 do modelo PAA)
  // -------------------------------------------------------------
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 81, 50);
  doc.text('TÉCNICOS ADMINISTRATIVOS', 20, 30);

  const taeData = (staff.length > 0 ? staff : [
    { nome: 'Beatriz Guerra Kleinubing Rocha', cargo_efetivo: 'Assistente de Aluno', nivel_classificacao: 'D', e_chefia_setor: true, funcao_chefia: 'Chefe do Depto de Ações Inclusivas (DAI)' },
    { nome: 'Camila Sousa Ferreira', cargo_efetivo: 'Técnica em Assuntos Educacionais', nivel_classificacao: 'E', e_chefia_setor: false },
    { nome: 'Cleomária Da Silva Sousa', cargo_efetivo: 'Técnica em Assuntos Educacionais', nivel_classificacao: 'E', e_chefia_setor: false },
    { nome: 'Diego Salustriano da Silva', cargo_efetivo: 'Técnico em Informática', nivel_classificacao: 'D', e_chefia_setor: false },
    { nome: 'Emisvaldo Pereira da Silva', cargo_efetivo: 'Técnico em Tecnologia da Informação', nivel_classificacao: 'D', e_chefia_setor: false },
    { nome: 'Jannyelle de Souza Correa', cargo_efetivo: 'Auxiliar em Administração', nivel_classificacao: 'C', e_chefia_setor: true, funcao_chefia: 'Chefe do Depto de Administração e Serviços de Gabinete' },
    { nome: 'Oscar Phafaell Silva Alves', cargo_efetivo: 'Assistente em Administração', nivel_classificacao: 'D', e_chefia_setor: false },
    { nome: 'Soniara Alves Maciel', cargo_efetivo: 'Auxiliar de Biblioteca', nivel_classificacao: 'C', e_chefia_setor: true, funcao_chefia: 'Chefe do Depto de Ensino e Extensão' }
  ]).map((t: any) => [
    t.nome,
    t.cargo_efetivo,
    t.nivel_classificacao || 'D',
    t.e_chefia_setor ? (t.funcao_chefia || 'Chefia de Setor') : 'Técnico Administrativo'
  ]);

  autoTable(doc, {
    startY: 36,
    head: [['Nome do Servidor TAE', 'Cargo Efetivo', 'Nível', 'Função / Chefia de Setor']],
    body: taeData,
    theme: 'grid',
    headStyles: { fillColor: [15, 81, 50], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.8 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 65 },
      1: { cellWidth: 50 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 45 }
    }
  });

  // -------------------------------------------------------------
  // PÁGINA 5: SUMÁRIO
  // -------------------------------------------------------------
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50);
  doc.text('SUMÁRIO', 20, 32);

  const sumarioRows = [
    ['1. APRESENTAÇÃO', '06'],
    ['2. INTRODUÇÃO', '07'],
    ['3. OBJETIVO GERAL', '07'],
    ['4. METODOLOGIA', '07'],
    ['5. PLANO DE AÇÕES POR EIXO TEMÁTICO', '08'],
    ['   5.1 Eixo: Ensino (DDE)', '08'],
    ['   5.2 Eixo: Pesquisa (Coordenação de Pesquisa)', '09'],
    ['   5.3 Eixo: Extensão (DEE)', '10'],
    ['   5.4 Eixo: Administração Geral (DRG)', '11'],
    ['6. RESUMO ORÇAMENTÁRIO', '12'],
    ['7. MONITORAMENTO E AVALIAÇÃO', '13'],
    ['8. ENCERRAMENTO E ASSINATURAS', '13']
  ];

  autoTable(doc, {
    startY: 40,
    head: [['Item / Seção Institucional', 'Pág.']],
    body: sumarioRows,
    theme: 'plain',
    headStyles: { fontStyle: 'bold', textColor: [15, 81, 50] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 150 },
      1: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }
    }
  });

  // -------------------------------------------------------------
  // PÁGINA 6: APRESENTAÇÃO
  // -------------------------------------------------------------
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 81, 50);
  doc.text('1. APRESENTAÇÃO', 20, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);
  const textoApresentacao = settings.texto_apresentacao ||
    `O Plano de Ação Anual (PAA) do Instituto Federal de Educação, Ciência e Tecnologia do Maranhão — Campus Avançado Carolina consolida as diretrizes operacionais, acadêmicas e orçamentárias prioritárias para o exercício de ${paa.ano}.

Construído a partir de reuniões setoriais e consultas aos servidores docentes e técnicos administrativos, o PAA ${paa.ano} reflete o compromisso institucional com o ensino público, gratuito e de qualidade social, visando o desenvolvimento sustentável da região sul maranhense e o alcance dos objetivos estabelecidos no Plano de Desenvolvimento Institucional (PDI).

As metas deste documento orientam a aplicação transparente e responsável dos recursos orçamentários, assegurando o fortalecimento dos cursos técnicos em Agroecologia, Agronegócio, Guia de Turismo, Administração, Comércio, Meio Ambiente e dos programas de pós-graduação lato sensu.`;

  const splitApres = doc.splitTextToSize(textoApresentacao, pageWidth - 40);
  doc.text(splitApres, 20, 42);

  // -------------------------------------------------------------
  // PÁGINA 7: INTRODUÇÃO, OBJETIVO GERAL E METODOLOGIA
  // -------------------------------------------------------------
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 81, 50);
  doc.text('2. INTRODUÇÃO', 20, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const textoIntro = settings.texto_introducao ||
    `O PAA é um instrumento de planejamento tático-operacional que viabiliza o alcance dos objetivos estratégicos do IFMA, alinhando a execução orçamentária e as metas pedagógicas no Campus Avançado Carolina.`;
  doc.text(doc.splitTextToSize(textoIntro, pageWidth - 40), 20, 36);

  // Quadro 1: Missão, Visão e Valores
  autoTable(doc, {
    startY: 50,
    head: [['Quadro 1 — Diretrizes Estratégicas Institucionais']],
    body: [
      ['MISSÃO: Promover educação profissional, científica e tecnológica de excelência, por meio do ensino, pesquisa e extensão, com foco na formação cidadã e no desenvolvimento regional sustentável.'],
      ['VISÃO: Consolidar-se como instituição de referência em educação profissional e tecnológica no sul do Maranhão até 2028.'],
      ['VALORES: Ética, transparência, compromisso social, inclusão, inovação e sustentabilidade ambiental.']
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 81, 50], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  const finalYQuadro1 = (doc as any).lastAutoTable.finalY || 95;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 81, 50);
  doc.text('3. OBJETIVO GERAL E METODOLOGIA', 20, finalYQuadro1 + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const textoMetod = settings.texto_metodologia ||
    `Garantir a execução articulada das ações de Ensino, Pesquisa, Extensão e Administração Geral, com acompanhamento sistemático de indicadores e transparência pública.`;
  doc.text(doc.splitTextToSize(textoMetod, pageWidth - 40), 20, finalYQuadro1 + 16);

  // Quadro 2: Indicadores TCU / PDI
  autoTable(doc, {
    startY: finalYQuadro1 + 28,
    head: [['Quadro 2 — Indicadores de Desempenho e Metas (TCU / PDI)']],
    body: [
      ['1. Eficiência Acadêmica dos Cursos Técnicos: Meta ≥ 75% de permanência e êxito'],
      ['2. Relação Alunos por Docente em Regime de Tempo Integral: Parâmetro MEC'],
      ['3. Execução Orçamentária e Financeira Global (Custeio e Investimento): Meta ≥ 95%'],
      ['4. Projetos de Extensão com Impacto Comunitário Direto na Região: Meta 100% executados']
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 81, 50], fontSize: 8.5 },
    styles: { fontSize: 8, cellPadding: 2.5 }
  });

  // -------------------------------------------------------------
  // PÁGINAS 8+: PLANO DE AÇÕES POR EIXO (Conforme modelo PAA 2025)
  // -------------------------------------------------------------
  const eixosPadrao = [
    { id: 'eixo-ensino', nome: 'Eixo: Ensino', resp_padrao: 'DDE' },
    { id: 'eixo-pesquisa', nome: 'Eixo: Pesquisa', resp_padrao: 'Coord. de Pesquisa' },
    { id: 'eixo-extensao', nome: 'Eixo: Extensão', resp_padrao: 'DEE' },
    { id: 'eixo-administracao', nome: 'Eixo: Administração Geral', resp_padrao: 'DRG' }
  ];

  eixosPadrao.forEach((eixoRef, idx) => {
    doc.addPage();
    addHeaderFooter(doc, paa, settings);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 81, 50);
    doc.text(`5.${idx + 1} PLANO DE AÇÃO ANUAL — ${eixoRef.nome.toUpperCase()}`, 20, 30);

    // Filtrar ações deste eixo ou associar
    const acoesEixo = approvedActions.filter(a => {
      const eixoObj = axes.find(ax => ax.id === a.eixo_id);
      const nomeEixo = (eixoObj?.nome || '').toLowerCase();
      if (eixoRef.id === 'eixo-ensino') return nomeEixo.includes('ensino') || (!nomeEixo.includes('pesquisa') && !nomeEixo.includes('extens') && !nomeEixo.includes('gest') && !nomeEixo.includes('admin'));
      if (eixoRef.id === 'eixo-pesquisa') return nomeEixo.includes('pesquisa');
      if (eixoRef.id === 'eixo-extensao') return nomeEixo.includes('extens');
      return nomeEixo.includes('gest') || nomeEixo.includes('admin') || nomeEixo.includes('infra');
    });

    const rows = (acoesEixo.length > 0 ? acoesEixo : approvedActions.slice(idx * 3, (idx + 1) * 3)).map((a, i) => {
      const orcTotal = a.itens_orcamento?.reduce((s, c) => s + c.valor_total, 0) || 0;
      const tipoDespesa = a.itens_orcamento?.[0]?.tipo_despesa || (orcTotal > 0 ? 'Custeio' : 'Sem Custo');
      const setorSigla = sectors.find(s => s.id === a.setor_id)?.sigla || eixoRef.resp_padrao;

      return [
        String(i + 1).padStart(2, '0'),
        a.titulo,
        '1º e 2º Semestre',
        setorSigla,
        orcTotal > 0 ? `R$ ${orcTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
        tipoDespesa
      ];
    });

    autoTable(doc, {
      startY: 36,
      head: [['Nº', 'Ação Proposta / Atividade', 'Prazo', 'Resp.', 'Valor (R$)', 'Tipo de Despesa']],
      body: rows.length > 0 ? rows : [['01', 'Ação institucional planejada no eixo', 'Anual', eixoRef.resp_padrao, 'R$ 0,00', 'Custeio']],
      theme: 'grid',
      headStyles: { fillColor: [15, 81, 50], fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2.2 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 72, fontStyle: 'bold' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'center' }
      }
    });
  });

  // -------------------------------------------------------------
  // PÁGINA: RESUMO ORÇAMENTÁRIO (Página 12 do modelo PAA)
  // -------------------------------------------------------------
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 81, 50);
  doc.text('6. RESUMO ORÇAMENTÁRIO', 20, 30);

  let totalGeral = 0;
  let totalCusteio = 0;
  let totalInvestimento = 0;

  approvedActions.forEach(a => {
    a.itens_orcamento?.forEach(it => {
      totalGeral += it.valor_total;
      if (it.tipo_despesa?.toLowerCase().includes('custeio')) {
        totalCusteio += it.valor_total;
      } else {
        totalInvestimento += it.valor_total;
      }
    });
  });

  // Se não houver orçamento cadastrado, usar os valores consolidados de referência do modelo oficial
  if (totalGeral === 0) {
    totalCusteio = 780000.00;
    totalInvestimento = 125187.04;
    totalGeral = 905187.04;
  }

  const orcResumoTable = [
    ['Despesas de Custeio (Funcionamento, Manutenção e Assistência)', `R$ ${totalCusteio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, `${Math.round((totalCusteio / totalGeral) * 100)}%`],
    ['Despesas de Investimento (Equipamentos e Modernização)', `R$ ${totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, `${Math.round((totalInvestimento / totalGeral) * 100)}%`],
    ['TOTAL GERAL DO PLANO DE AÇÃO ANUAL', `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '100%']
  ];

  autoTable(doc, {
    startY: 36,
    head: [['Classificação da Despesa', 'Valor Total (R$)', 'Participação (%)']],
    body: orcResumoTable,
    theme: 'grid',
    headStyles: { fillColor: [15, 81, 50], fontSize: 8.5 },
    styles: { fontSize: 8.5, cellPadding: 2.8 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: 30, halign: 'center' }
    }
  });

  const finalYOrc = (doc as any).lastAutoTable.finalY || 70;

  // Quadro de fontes de recursos
  autoTable(doc, {
    startY: finalYOrc + 10,
    head: [['Fonte de Recursos', 'Origem', 'Montante (R$)', '%']],
    body: [
      ['Fonte 20RL', 'Orçamento Próprio da Unidade (Tesouro)', `R$ ${(totalGeral * 0.945).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '94,5%'],
      ['Fonte 2994', 'Recursos Próprios / Outras Fontes', `R$ ${(totalGeral * 0.055).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '5,5%']
    ],
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 70 },
      2: { cellWidth: 45, halign: 'right' },
      3: { cellWidth: 30, halign: 'center' }
    }
  });

  // -------------------------------------------------------------
  // PÁGINA: MONITORAMENTO, ENCERRAMENTO E ASSINATURAS (Página 13 do modelo)
  // -------------------------------------------------------------
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 81, 50);
  doc.text('7. MONITORAMENTO E AVALIAÇÃO', 20, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const textoMonit = `O monitoramento da execução das ações será realizado trimestralmente pelo Gabinete da Direção-Geral e pelas diretorias e coordenações responsáveis, com emissão de relatórios parciais e prestação de contas pública.`;
  doc.text(doc.splitTextToSize(textoMonit, pageWidth - 40), 20, 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 81, 50);
  doc.text('8. ENCERRAMENTO E HOMOLOGAÇÃO', 20, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `O presente documento consolida o Plano de Ação Anual (PAA ${paa.ano}) do Instituto Federal do Maranhão — Campus Avançado Carolina, devidamente aprovado pelas instâncias competentes.`,
    20,
    66,
    { maxWidth: pageWidth - 40 }
  );

  const sigY = 110;
  // Assinatura 1: Diretor Geral
  doc.setDrawColor(100, 116, 139);
  doc.line(25, sigY, 95, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(settings.nome_diretor || 'Fernando Silva Lima', 60, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(settings.cargo_diretor || 'Diretor Geral', 60, sigY + 9, { align: 'center' });
  doc.text('IFMA Campus Avançado Carolina', 60, sigY + 13, { align: 'center' });

  // Assinatura 2: Diretora de Desenvolvimento Educacional
  doc.line(115, sigY, 185, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Duana Ravena dos Santos Vieira', 150, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Diretora de Desenvolvimento Educacional', 150, sigY + 9, { align: 'center' });
  doc.text('IFMA Campus Avançado Carolina', 150, sigY + 13, { align: 'center' });

  // Assinatura 3: Chefe do Depto de Administração
  const sigY2 = sigY + 35;
  doc.line(70, sigY2, 140, sigY2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Jannyelle de Souza Corrêa', 105, sigY2 + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Chefe do Depto de Administração e Serviços de Gabinete', 105, sigY2 + 9, { align: 'center' });
  doc.text('IFMA Campus Avançado Carolina', 105, sigY2 + 13, { align: 'center' });

  // Numeração de páginas
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, pageHeight - 8, { align: 'right' });
  }

  doc.save(`PAA_${paa.ano}_IFMA_Campus_Avancado_Carolina_Oficial.pdf`);
}

function addHeaderFooter(doc: jsPDF, paa: PAA, settings: InstitutionSettings) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Barra de cabeçalho
  doc.setFillColor(15, 81, 50);
  doc.rect(0, 0, pageWidth, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 81, 50);
  doc.text('INSTITUTO FEDERAL DO MARANHÃO — CAMPUS AVANÇADO CAROLINA', 20, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`PLANO DE AÇÃO ANUAL (PAA ${paa.ano})`, pageWidth - 20, 11, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 14, pageWidth - 20, 14);

  // Barra de rodapé
  doc.line(20, pageHeight - 12, pageWidth - 20, pageHeight - 12);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('IFMA Campus Avançado Carolina — Sistema PAA — Plano de Ação Anual', 20, pageHeight - 8);
}
