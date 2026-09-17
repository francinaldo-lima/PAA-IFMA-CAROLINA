import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Action, Axis, InstitutionSettings, PAA, Sector } from '../types';

export function generatePAAPDF(
  paa: PAA,
  actions: Action[],
  axes: Axis[],
  sectors: Sector[],
  settings: InstitutionSettings
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

  // --- CAPA INSTITUCIONAL ---
  doc.setFillColor(15, 81, 50); // Institutional Green #0f5132
  doc.rect(0, 0, pageWidth, 18, 'F');
  doc.setFillColor(220, 38, 38); // Institutional Red stripe
  doc.rect(0, 18, pageWidth, 3, 'F');

  // Institution title
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(settings.nome_instituicao.toUpperCase(), pageWidth / 2, 45, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.nome_campus.toUpperCase(), pageWidth / 2, 53, { align: 'center' });

  // Big Institutional Emblema / Crest simulation
  doc.setFillColor(15, 81, 50);
  doc.roundedRect(pageWidth / 2 - 22, 75, 44, 44, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('IFMA', pageWidth / 2, 95, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('CAMPUS CAROLINA', pageWidth / 2, 103, { align: 'center' });

  // Document Title
  doc.setTextColor(15, 81, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('PLANO DE AÇÃO ANUAL', pageWidth / 2, 145, { align: 'center' });

  doc.setTextColor(220, 38, 38);
  doc.setFontSize(28);
  doc.text(`PAA ${paa.ano}`, pageWidth / 2, 158, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text('Instrumento de Planejamento Tático e Operacional Institucional', pageWidth / 2, 168, { align: 'center' });

  // Bottom cover info
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(settings.endereco, pageWidth / 2, pageHeight - 35, { align: 'center' });
  doc.text(`Exercício de ${paa.ano} — Versão Oficial Consolidada`, pageWidth / 2, pageHeight - 27, { align: 'center' });

  doc.setFillColor(15, 81, 50);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  // --- PÁGINA 2: IDENTIFICAÇÃO E SUMÁRIO ---
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50);
  doc.text('1. IDENTIFICAÇÃO INSTITUCIONAL', 20, 32);

  const idenData = [
    ['Instituição', settings.nome_instituicao],
    ['Unidade de Ensino', settings.nome_campus],
    ['Endereço', settings.endereco],
    ['Telefone / Contato', settings.telefone],
    ['E-mail Oficial', settings.email],
    ['Portal Institucional', settings.site],
    ['Direção-Geral', `${settings.nome_diretor} (${settings.cargo_diretor})`],
    ['Exercício do PAA', String(paa.ano)],
    ['Status Oficial', paa.status]
  ];

  autoTable(doc, {
    startY: 37,
    head: [['Campo', 'Informação Oficial']],
    body: idenData,
    theme: 'grid',
    headStyles: { fillColor: [15, 81, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
  });

  const finalY1 = (doc as any).lastAutoTable.finalY || 100;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50);
  doc.text('2. APRESENTAÇÃO INSTITUCIONAL', 20, finalY1 + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const textApres = settings.texto_apresentacao || 'O Plano de Ação Anual (PAA) reúne o conjunto de ações prioritárias do IFMA Campus Carolina.';
  const splitApres = doc.splitTextToSize(textApres, pageWidth - 40);
  doc.text(splitApres, 20, finalY1 + 22);

  const finalY2 = finalY1 + 22 + splitApres.length * 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50);
  doc.text('3. METODOLOGIA E EIXOS ESTRATÉGICOS', 20, finalY2 + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const textMetod = settings.texto_metodologia || 'As ações foram elaboradas pelos setores acadêmicos e administrativos conforme diretrizes do PDI.';
  const splitMetod = doc.splitTextToSize(textMetod, pageWidth - 40);
  doc.text(splitMetod, 20, finalY2 + 19);

  // --- PÁGINA 3: EIXOS TEMÁTICOS ---
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50);
  doc.text('4. EIXOS TEMÁTICOS DO PAA', 20, 32);

  const eixosTable = axes.map(ax => {
    const totalAcoesEixo = actions.filter(a => a.eixo_id === ax.id).length;
    const orcEixo = actions
      .filter(a => a.eixo_id === ax.id)
      .reduce((acc, a) => acc + (a.itens_orcamento?.reduce((s, c) => s + c.valor_total, 0) || 0), 0);
    return [
      `Eixo ${ax.ordem}`,
      ax.nome,
      ax.descricao || 'Sem descrição cadastrada',
      String(totalAcoesEixo),
      `R$ ${orcEixo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ];
  });

  autoTable(doc, {
    startY: 38,
    head: [['Ordem', 'Eixo Temático', 'Descrição / Escopo', 'Ações', 'Orçamento Total']],
    body: eixosTable,
    theme: 'striped',
    headStyles: { fillColor: [15, 81, 50] },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 32, halign: 'right' }
    }
  });

  // --- PÁGINA 4+: AÇÕES CONSOLIDADAS ---
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50);
  doc.text('5. MATRIZ DE AÇÕES DO PLANO DE AÇÃO ANUAL', 20, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Relação oficial de ações consolidadas e aprovadas para execução.', 20, 38);

  const acoesTableRows = approvedActions.map((a, idx) => {
    const setorSigla = sectors.find(s => s.id === a.setor_id)?.sigla || '';
    const eixoNome = axes.find(ax => ax.id === a.eixo_id)?.nome.split('—')[0] || '';
    const orcTotal = a.itens_orcamento?.reduce((s, c) => s + c.valor_total, 0) || 0;
    const indPrincipal = a.indicadores?.[0]
      ? `${a.indicadores[0].nome} (Meta: ${a.indicadores[0].meta} ${a.indicadores[0].unidade_medida})`
      : 'Sem indicador';

    return [
      String(idx + 1).padStart(2, '0'),
      a.titulo,
      `${setorSigla} / ${eixoNome}`,
      a.prioridade,
      a.objetivo,
      indPrincipal,
      `R$ ${orcTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ];
  });

  autoTable(doc, {
    startY: 42,
    head: [['Nº', 'Título da Ação', 'Setor / Eixo', 'Prio.', 'Objetivo Geral', 'Indicador Principal', 'Orçamento']],
    body: acoesTableRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 81, 50], fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 40 },
      5: { cellWidth: 35 },
      6: { cellWidth: 24, halign: 'right' }
    }
  });

  // --- PÁGINA: RESUMO ORÇAMENTÁRIO ---
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50);
  doc.text('6. RESUMO ORÇAMENTÁRIO DETALHADO', 20, 32);

  let totalGeral = 0;
  let totalCusteio = 0;
  let totalInvestimento = 0;
  const fontesMap: Record<string, number> = {};

  approvedActions.forEach(a => {
    a.itens_orcamento?.forEach(it => {
      totalGeral += it.valor_total;
      if (it.tipo_despesa?.toLowerCase().includes('custeio')) {
        totalCusteio += it.valor_total;
      } else {
        totalInvestimento += it.valor_total;
      }
      fontesMap[it.fonte_recurso] = (fontesMap[it.fonte_recurso] || 0) + it.valor_total;
    });
  });

  const orcResumoTable = [
    ['Despesas de Custeio (Correntes)', `R$ ${totalCusteio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, `${totalGeral > 0 ? Math.round((totalCusteio / totalGeral) * 100) : 0}%`],
    ['Despesas de Investimento (Capital)', `R$ ${totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, `${totalGeral > 0 ? Math.round((totalInvestimento / totalGeral) * 100) : 0}%`],
    ['TOTAL GERAL DO PAA', `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '100%']
  ];

  autoTable(doc, {
    startY: 38,
    head: [['Classificação Econômica', 'Valor Planejado (R$)', 'Participação (%)']],
    body: orcResumoTable,
    theme: 'striped',
    headStyles: { fillColor: [15, 81, 50] },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' },
      2: { halign: 'center' }
    }
  });

  const finalYOrc = (doc as any).lastAutoTable.finalY || 80;

  // Fontes de recurso
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 81, 50);
  doc.text('Detalhamento por Fonte de Recursos:', 20, finalYOrc + 10);

  const fontesRows = Object.entries(fontesMap).map(([fonte, val]) => [
    fonte,
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `${totalGeral > 0 ? Math.round((val / totalGeral) * 100) : 0}%`
  ]);

  autoTable(doc, {
    startY: finalYOrc + 14,
    head: [['Fonte de Recursos', 'Montante (R$)', '%']],
    body: fontesRows.length > 0 ? fontesRows : [['Sem itens orçamentários específicos', 'R$ 0,00', '0%']],
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105] },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'center' } }
  });

  // --- PÁGINA: ASSINATURAS E ENCERRAMENTO ---
  doc.addPage();
  addHeaderFooter(doc, paa, settings);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 81, 50);
  doc.text('7. HOMOLOGAÇÃO E ASSINATURAS', 20, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    'O presente documento consolida as metas de trabalho do IFMA Campus Carolina para o exercício 2027, aprovadas pelas instâncias deliberativas competentes.',
    20,
    40,
    { maxWidth: pageWidth - 40 }
  );

  const sigY = 90;
  // Sign 1
  doc.setDrawColor(100, 116, 139);
  doc.line(30, sigY, 95, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(settings.nome_diretor, 62.5, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(settings.cargo_diretor, 62.5, sigY + 9, { align: 'center' });
  doc.text('IFMA Campus Carolina', 62.5, sigY + 13, { align: 'center' });

  // Sign 2
  doc.line(115, sigY, 180, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Diretor de Administração e Planejamento', 147.5, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Departamento de Administração e Planejamento', 147.5, sigY + 9, { align: 'center' });
  doc.text('IFMA Campus Carolina', 147.5, sigY + 13, { align: 'center' });

  // Sign 3
  const sigY2 = sigY + 40;
  doc.line(72.5, sigY2, 137.5, sigY2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Diretor de Ensino', 105, sigY2 + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Departamento de Ensino / Coordenação Pedagógica', 105, sigY2 + 9, { align: 'center' });
  doc.text('IFMA Campus Carolina', 105, sigY2 + 13, { align: 'center' });

  // Add Page Numbers to all pages except cover
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, pageHeight - 8, { align: 'right' });
  }

  doc.save(`PAA_IFMA_Campus_Carolina_${paa.ano}_Oficial.pdf`);
}

function addHeaderFooter(doc: jsPDF, paa: PAA, settings: InstitutionSettings) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top header bar
  doc.setFillColor(15, 81, 50);
  doc.rect(0, 0, pageWidth, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 81, 50);
  doc.text('INSTITUTO FEDERAL DO MARANHÃO — CAMPUS CAROLINA', 20, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`PLANO DE AÇÃO ANUAL (PAA ${paa.ano})`, pageWidth - 20, 11, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, 14, pageWidth - 20, 14);

  // Bottom footer
  doc.line(20, pageHeight - 12, pageWidth - 20, pageHeight - 12);
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(settings.rodape_documento, 20, pageHeight - 8);
}
