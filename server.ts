import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import * as XLSX from 'xlsx';
import { dbService } from './server/db.js';
import { suggestAction, analyzeAction, improveText } from './server/gemini.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Auth helper middleware
app.use((req, res, next) => {
  const authUserId = req.headers['x-user-id'] as string;
  if (authUserId) {
    const user = dbService.getUserById(authUserId);
    if (user) {
      (req as any).user = user;
    }
  }
  next();
});

// --- API ROUTES ---

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), system: 'PAA IFMA Campus Carolina' });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }
  const user = dbService.authenticate(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
  }
  res.json({ user });
});

app.get('/api/auth/me', (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.json({ user: null });
  }
  res.json({ user });
});

// PAAs
app.get('/api/paa', (req, res) => {
  res.json(dbService.getPAAs());
});

app.get('/api/paa/:id', (req, res) => {
  const paa = dbService.getPAAById(req.params.id);
  if (!paa) return res.status(404).json({ error: 'PAA não encontrado.' });
  res.json(paa);
});

app.post('/api/paa', (req, res) => {
  try {
    const newPAA = dbService.createPAA(req.body);
    res.status(201).json(newPAA);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Erro ao criar edição do PAA.' });
  }
});

app.put('/api/paa/:id', (req, res) => {
  const updated = dbService.updatePAA(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'PAA não encontrado.' });
  res.json(updated);
});

app.delete('/api/paa/:id', (req, res) => {
  const ok = dbService.deletePAA(req.params.id);
  res.json({ success: ok });
});

// Access checking for Institutional Chefias and Admins
app.post('/api/auth/check-access', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ allowed: false, message: 'E-mail é obrigatório para validação.' });
  }
  const result = dbService.checkAccess(email);
  res.json(result);
});

// Equipe de Gestão
app.get('/api/management', (req, res) => {
  res.json(dbService.getManagementTeam());
});

app.post('/api/management', (req, res) => {
  try {
    const member = dbService.createManagementMember(req.body);
    res.status(201).json(member);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao cadastrar membro da gestão.' });
  }
});

app.put('/api/management/:id', (req, res) => {
  const updated = dbService.updateManagementMember(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Membro da gestão não encontrado.' });
  res.json(updated);
});

app.delete('/api/management/:id', (req, res) => {
  const ok = dbService.deleteManagementMember(req.params.id);
  res.json({ success: ok });
});

// Corpo Docente
app.get('/api/faculty', (req, res) => {
  res.json(dbService.getFaculty());
});

app.post('/api/faculty', (req, res) => {
  try {
    const doc = dbService.createFacultyMember(req.body);
    res.status(201).json(doc);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao cadastrar docente.' });
  }
});

app.put('/api/faculty/:id', (req, res) => {
  const updated = dbService.updateFacultyMember(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Docente não encontrado.' });
  res.json(updated);
});

app.delete('/api/faculty/:id', (req, res) => {
  const ok = dbService.deleteFacultyMember(req.params.id);
  res.json({ success: ok });
});

// Técnicos Administrativos (TAEs)
app.get('/api/staff', (req, res) => {
  res.json(dbService.getStaff());
});

app.post('/api/staff', (req, res) => {
  try {
    const staff = dbService.createStaffMember(req.body);
    res.status(201).json(staff);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Erro ao cadastrar técnico administrativo.' });
  }
});

app.put('/api/staff/:id', (req, res) => {
  const updated = dbService.updateStaffMember(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Técnico administrativo não encontrado.' });
  res.json(updated);
});

app.delete('/api/staff/:id', (req, res) => {
  const ok = dbService.deleteStaffMember(req.params.id);
  res.json({ success: ok });
});

// Sectors
app.get('/api/sectors', (req, res) => {
  res.json(dbService.getSectors());
});

app.post('/api/sectors', (req, res) => {
  const sector = dbService.createSector(req.body);
  res.status(201).json(sector);
});

app.put('/api/sectors/:id', (req, res) => {
  const updated = dbService.updateSector(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Setor não encontrado.' });
  res.json(updated);
});

app.delete('/api/sectors/:id', (req, res) => {
  const ok = dbService.deleteSector(req.params.id);
  res.json({ success: ok });
});

// Axes
app.get('/api/axes', (req, res) => {
  const paaId = req.query.paa_id as string;
  res.json(dbService.getAxes(paaId));
});

app.post('/api/axes', (req, res) => {
  const axis = dbService.createAxis(req.body);
  res.status(201).json(axis);
});

app.put('/api/axes/:id', (req, res) => {
  const updated = dbService.updateAxis(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Eixo não encontrado.' });
  res.json(updated);
});

app.delete('/api/axes/:id', (req, res) => {
  const ok = dbService.deleteAxis(req.params.id);
  res.json({ success: ok });
});

app.post('/api/axes/reorder', (req, res) => {
  const list = dbService.reorderAxes(req.body);
  res.json(list);
});

// Users
app.get('/api/users', (req, res) => {
  res.json(dbService.getUsers());
});

app.post('/api/users', (req, res) => {
  try {
    const user = dbService.createUser(req.body);
    res.status(201).json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  const updated = dbService.updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json(updated);
});

app.delete('/api/users/:id', (req, res) => {
  const ok = dbService.deleteUser(req.params.id);
  res.json({ success: ok });
});

// Actions
app.get('/api/actions', (req, res) => {
  const { paa_id, eixo_id, setor_id, status, prioridade, search, responsavel_id } = req.query as any;
  const actions = dbService.getActions({
    paa_id,
    eixo_id,
    setor_id,
    status,
    prioridade,
    search,
    responsavel_id
  });
  res.json(actions);
});

app.get('/api/actions/:id', (req, res) => {
  const action = dbService.getActionById(req.params.id);
  if (!action) return res.status(404).json({ error: 'Ação não encontrada.' });
  res.json(action);
});

app.post('/api/actions', (req, res) => {
  const user = (req as any).user;
  const action = dbService.createAction(req.body, user);
  res.status(201).json(action);
});

app.put('/api/actions/:id', (req, res) => {
  const user = (req as any).user;
  const updated = dbService.updateAction(req.params.id, req.body, user);
  if (!updated) return res.status(404).json({ error: 'Ação não encontrada.' });
  res.json(updated);
});

app.delete('/api/actions/:id', (req, res) => {
  const user = (req as any).user;
  const ok = dbService.deleteAction(req.params.id, user);
  res.json({ success: ok });
});

app.post('/api/actions/:id/submit', (req, res) => {
  const user = (req as any).user;
  const updated = dbService.submitAction(req.params.id, user);
  if (!updated) return res.status(404).json({ error: 'Ação não encontrada.' });
  res.json(updated);
});

app.post('/api/actions/:id/approve', (req, res) => {
  const user = (req as any).user;
  const { motivo } = req.body;
  const updated = dbService.approveAction(req.params.id, user, motivo);
  if (!updated) return res.status(404).json({ error: 'Ação não encontrada.' });
  res.json(updated);
});

app.post('/api/actions/:id/return', (req, res) => {
  const user = (req as any).user;
  const { motivo } = req.body;
  if (!motivo || motivo.trim().length === 0) {
    return res.status(400).json({ error: 'O motivo da devolução é obrigatório.' });
  }
  const updated = dbService.returnAction(req.params.id, motivo, user);
  if (!updated) return res.status(404).json({ error: 'Ação não encontrada.' });
  res.json(updated);
});

app.post('/api/actions/:id/consolidate', (req, res) => {
  const user = (req as any).user;
  const updated = dbService.consolidateAction(req.params.id, user);
  if (!updated) return res.status(404).json({ error: 'Ação não encontrada.' });
  res.json(updated);
});

app.post('/api/actions/:id/duplicate', (req, res) => {
  const user = (req as any).user;
  const duplicated = dbService.duplicateAction(req.params.id, user);
  if (!duplicated) return res.status(404).json({ error: 'Ação original não encontrada.' });
  res.status(201).json(duplicated);
});

app.put('/api/actions/:id/execution', (req, res) => {
  const user = (req as any).user;
  const updated = dbService.updateExecution(req.params.id, req.body, user);
  if (!updated) return res.status(404).json({ error: 'Ação não encontrada.' });
  res.json(updated);
});

app.post('/api/actions/:id/attachments', (req, res) => {
  const user = (req as any).user;
  const att = dbService.addAttachment(req.params.id, req.body, user);
  if (!att) return res.status(404).json({ error: 'Ação não encontrada.' });
  res.status(201).json(att);
});

app.delete('/api/actions/:id/attachments/:attId', (req, res) => {
  const ok = dbService.deleteAttachment(req.params.id, req.params.attId);
  res.json({ success: ok });
});

app.post('/api/actions/import-previous', (req, res) => {
  const user = (req as any).user;
  const { source_paa_id, target_paa_id, action_ids } = req.body;
  if (!source_paa_id || !target_paa_id || !Array.isArray(action_ids)) {
    return res.status(400).json({ error: 'Parâmetros inválidos para importação.' });
  }
  const imported = dbService.importFromPreviousPAA(source_paa_id, target_paa_id, action_ids, user);
  res.json({ count: imported.length, actions: imported });
});

// Demo cleanup
app.post('/api/demo/clean', (req, res) => {
  const user = (req as any).user;
  const result = dbService.cleanDemoData(user);
  res.json(result);
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const paaId = (req.query.paa_id as string) || 'paa-2027';
  const sectorId = req.query.sector_id as string;
  const stats = dbService.getDashboardStats(paaId, sectorId);
  res.json(stats);
});

// Audit
app.get('/api/audit', (req, res) => {
  res.json(dbService.getAuditLogs());
});

// Notifications
app.get('/api/notifications', (req, res) => {
  const userId = req.query.user_id as string;
  res.json(dbService.getNotifications(userId));
});

app.put('/api/notifications/:id/read', (req, res) => {
  const ok = dbService.markNotificationAsRead(req.params.id);
  res.json({ success: ok });
});

// Templates
app.get('/api/templates', (req, res) => {
  res.json(dbService.getTemplates());
});

app.post('/api/templates', (req, res) => {
  const tmpl = dbService.createTemplate(req.body);
  res.status(201).json(tmpl);
});

// Settings & Document Configuration
app.get('/api/settings', (req, res) => {
  res.json(dbService.getSettings());
});

app.put('/api/settings', (req, res) => {
  const updated = dbService.updateSettings(req.body);
  res.json(updated);
});

app.get('/api/doc-config', (req, res) => {
  res.json(dbService.getDocConfig());
});

app.put('/api/doc-config', (req, res) => {
  const updated = dbService.updateDocConfig(req.body);
  res.json(updated);
});

// AI endpoints
app.post('/api/ai/suggest', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Texto descritivo é obrigatório para sugestão.' });
    }
    const suggestion = await suggestAction(prompt);
    res.json(suggestion);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao processar sugestão com IA.' });
  }
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { action } = req.body;
    if (!action) {
      return res.status(400).json({ error: 'Dados da ação são obrigatórios.' });
    }
    const analysis = await analyzeAction(action);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao analisar ação com IA.' });
  }
});

app.post('/api/ai/improve-text', async (req, res) => {
  try {
    const { text, fieldName } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texto é obrigatório para aprimoramento.' });
    }
    const improved = await improveText(text, fieldName || 'Campo');
    res.json({ improvedText: improved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Erro ao aprimorar texto com IA.' });
  }
});

// Document Generation - XLSX
app.get('/api/export/xlsx', (req, res) => {
  try {
    const paaId = (req.query.paa_id as string) || 'paa-2027';
    const paa = dbService.getPAAById(paaId);
    const actions = dbService.getActions({ paa_id: paaId });
    const axes = dbService.getAxes(paaId);
    const sectors = dbService.getSectors();

    const wb = XLSX.utils.book_new();

    // Sheet 1: Resumo Executivo
    const stats = dbService.getDashboardStats(paaId);
    const resumoData = [
      ['INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA DO MARANHÃO'],
      ['IFMA CAMPUS CAROLINA — PLANO DE AÇÃO ANUAL'],
      ['Exercício:', paa?.ano || 2027],
      ['Campus:', paa?.campus || 'Campus Carolina'],
      ['Data de Geração:', new Date().toLocaleString('pt-BR')],
      [],
      ['INDICADORES GERAIS', 'VALOR'],
      ['Total de Ações Cadastradas', stats.totalActions],
      ['Ações Aprovadas / Consolidadas', stats.aprovadas],
      ['Ações em Execução', stats.emExecucao],
      ['Ações Concluídas', stats.concluidas],
      ['Ações Atrasadas', stats.atrasadas],
      ['Orçamento Total Planejado (R$)', stats.orcamentoPlanejado],
      ['Orçamento Executado (R$)', stats.orcamentoExecutado],
      ['Saldo Orçamentário (R$)', stats.saldoOrcamentario],
      ['Custeio Planejado (R$)', stats.custeioPlanejado],
      ['Investimento Planejado (R$)', stats.investimentoPlanejado],
      ['Taxa de Conclusão (%)', stats.physicalExecutionRate]
    ];
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');

    // Sheet 2: Ações do PAA
    const acoesData = [
      [
        'ID',
        'Eixo Temático',
        'Setor',
        'Título da Ação',
        'Prioridade',
        'Status',
        'Objetivo Geral',
        'Orçamento Planejado (R$)',
        'Orçamento Executado (R$)',
        'Status Execução',
        '% Executado'
      ],
      ...actions.map(a => {
        const eixo = axes.find(ax => ax.id === a.eixo_id)?.nome || a.eixo_id;
        const setor = sectors.find(s => s.id === a.setor_id)?.sigla || a.setor_id;
        const orcPlanejado = a.itens_orcamento?.reduce((acc, c) => acc + c.valor_total, 0) || 0;
        return [
          a.id,
          eixo,
          setor,
          a.titulo,
          a.prioridade,
          a.status,
          a.objetivo,
          orcPlanejado,
          a.execucao?.valor_executado || 0,
          a.execucao?.status_execucao || 'NAO_INICIADA',
          a.execucao?.percentual_execucao || 0
        ];
      })
    ];
    const wsAcoes = XLSX.utils.aoa_to_sheet(acoesData);
    XLSX.utils.book_append_sheet(wb, wsAcoes, 'Ações');

    // Dynamic sheets for each Axis
    axes.forEach(axis => {
      const axisActions = actions.filter(a => a.eixo_id === axis.id);
      const safeName = axis.nome.replace(/[\\/?*[\]]/g, '').slice(0, 30);
      const axisRows = [
        [`${axis.nome} — IFMA Campus Carolina`],
        [`Descrição: ${axis.descricao || 'Sem descrição'}`],
        [],
        ['Título da Ação', 'Setor', 'Prioridade', 'Status', 'Orçamento (R$)', '% Execução'],
        ...axisActions.map(a => {
          const setor = sectors.find(s => s.id === a.setor_id)?.sigla || '';
          const orc = a.itens_orcamento?.reduce((acc, c) => acc + c.valor_total, 0) || 0;
          return [a.titulo, setor, a.prioridade, a.status, orc, `${a.execucao?.percentual_execucao || 0}%`];
        })
      ];
      const wsAxis = XLSX.utils.aoa_to_sheet(axisRows);
      XLSX.utils.book_append_sheet(wb, wsAxis, safeName);
    });

    // Sheet: Orçamento Detalhado
    const orcData = [
      ['Ação', 'Setor', 'Descrição do Item', 'Qtd', 'Unidade', 'Valor Unitário (R$)', 'Valor Total (R$)', 'Tipo de Despesa', 'Fonte de Recurso', 'Natureza']
    ];
    actions.forEach(a => {
      const setor = sectors.find(s => s.id === a.setor_id)?.sigla || '';
      (a.itens_orcamento || []).forEach(it => {
        orcData.push([
          a.titulo,
          setor,
          it.descricao,
          String(it.quantidade),
          it.unidade,
          String(it.valor_unitario),
          String(it.valor_total),
          it.tipo_despesa,
          it.fonte_recurso,
          it.natureza_despesa || ''
        ]);
      });
    });
    const wsOrc = XLSX.utils.aoa_to_sheet(orcData);
    XLSX.utils.book_append_sheet(wb, wsOrc, 'Orçamento');

    // Sheet: Cronograma 12 Meses
    const cronData = [
      ['Ação', 'Setor', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
    ];
    actions.forEach(a => {
      const setor = sectors.find(s => s.id === a.setor_id)?.sigla || '';
      const c = a.cronograma;
      cronData.push([
        a.titulo,
        setor,
        c?.janeiro ? 'SIM' : '-',
        c?.fevereiro ? 'SIM' : '-',
        c?.marco ? 'SIM' : '-',
        c?.abril ? 'SIM' : '-',
        c?.maio ? 'SIM' : '-',
        c?.junho ? 'SIM' : '-',
        c?.julho ? 'SIM' : '-',
        c?.agosto ? 'SIM' : '-',
        c?.setembro ? 'SIM' : '-',
        c?.outubro ? 'SIM' : '-',
        c?.novembro ? 'SIM' : '-',
        c?.dezembro ? 'SIM' : '-'
      ]);
    });
    const wsCron = XLSX.utils.aoa_to_sheet(cronData);
    XLSX.utils.book_append_sheet(wb, wsCron, 'Cronograma');

    // Sheet: Indicadores
    const indData = [
      ['Ação', 'Nome do Indicador', 'Tipo', 'Unidade', 'Linha de Base', 'Meta', 'Realizado', '% Alcançado']
    ];
    actions.forEach(a => {
      (a.indicadores || []).forEach(ind => {
        indData.push([
          a.titulo,
          ind.nome,
          ind.tipo_meta,
          ind.unidade_medida,
          String(ind.linha_base),
          String(ind.meta),
          String(ind.resultado),
          `${ind.percentual}%`
        ]);
      });
    });
    const wsInd = XLSX.utils.aoa_to_sheet(indData);
    XLSX.utils.book_append_sheet(wb, wsInd, 'Indicadores');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename="PAA_IFMA_Campus_Carolina_${paa?.ano || 2027}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err: any) {
    console.error('Erro ao gerar XLSX:', err);
    res.status(500).json({ error: 'Erro ao gerar planilha XLSX do PAA.' });
  }
});

// Vite middleware / production static setup
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PAA IFMA Campus Carolina server rodando em http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('Falha ao iniciar servidor:', err);
});
