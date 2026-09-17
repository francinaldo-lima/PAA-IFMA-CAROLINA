import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  Send,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Target,
  FileText,
  CheckCircle2,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { Action, Axis, Sector, User } from '../types';
import { AISuggestModal, AIAnalyzeModal } from './ActionModalAI';
import { api } from '../lib/api';

interface ActionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: Partial<Action>, submitNow: boolean) => Promise<void>;
  initialData?: Action | null;
  axes: Axis[];
  sectors: Sector[];
  users: User[];
  currentPaaId: string;
}

export const ActionFormModal: React.FC<ActionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  axes,
  sectors,
  users,
  currentPaaId
}) => {
  const [activeTab, setActiveTab] = useState<'identificacao' | 'planejamento' | 'indicadores' | 'cronograma' | 'orcamento' | 'observacoes'>('identificacao');
  const [showSuggestAI, setShowSuggestAI] = useState(false);
  const [showAnalyzeAI, setShowAnalyzeAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [improvingField, setImprovingField] = useState<string | null>(null);

  // Form State
  const [eixoId, setEixoId] = useState('');
  const [setorId, setSetorId] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [prioridade, setPrioridade] = useState<'ALTA' | 'MEDIA' | 'BAIXA'>('MEDIA');

  const [objetivo, setObjetivo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');

  const [indicadores, setIndicadores] = useState<any[]>([
    {
      id: 'ind-new-1',
      nome: '',
      unidade_medida: '',
      tipo_meta: 'NUMERICA',
      linha_base: 0,
      meta: 1,
      resultado: 0,
      percentual: 0,
      resultado_esperado: ''
    }
  ]);

  const [cronograma, setCronograma] = useState<Record<string, boolean>>({
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
  });
  const [atividadesTexto, setAtividadesTexto] = useState('');

  const [possuiOrcamento, setPossuiOrcamento] = useState(false);
  const [itensOrcamento, setItensOrcamento] = useState<any[]>([]);

  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (initialData) {
      setEixoId(initialData.eixo_id || '');
      setSetorId(initialData.setor_id || '');
      setResponsavelId(initialData.responsavel_id || '');
      setTitulo(initialData.titulo || '');
      setPrioridade(initialData.prioridade || 'MEDIA');
      setObjetivo(initialData.objetivo || '');
      setDescricao(initialData.descricao || '');
      setJustificativa(initialData.justificativa || '');
      setPublicoAlvo(initialData.publico_alvo || '');
      setIndicadores(initialData.indicadores?.length ? initialData.indicadores : [
        { id: 'ind-new-1', nome: '', unidade_medida: '', tipo_meta: 'NUMERICA', linha_base: 0, meta: 1, resultado: 0, percentual: 0 }
      ]);
      if (initialData.cronograma) {
        setCronograma({
          janeiro: !!initialData.cronograma.janeiro,
          fevereiro: !!initialData.cronograma.fevereiro,
          marco: !!initialData.cronograma.marco,
          abril: !!initialData.cronograma.abril,
          maio: !!initialData.cronograma.maio,
          junho: !!initialData.cronograma.junho,
          julho: !!initialData.cronograma.julho,
          agosto: !!initialData.cronograma.agosto,
          setembro: !!initialData.cronograma.setembro,
          outubro: !!initialData.cronograma.outubro,
          novembro: !!initialData.cronograma.novembro,
          dezembro: !!initialData.cronograma.dezembro
        });
        setAtividadesTexto(initialData.cronograma.atividades_texto || '');
      }
      setPossuiOrcamento(!!initialData.possui_orcamento);
      setItensOrcamento(initialData.itens_orcamento || []);
      setObservacoes(initialData.observacoes || '');
    } else {
      // Defaults
      setEixoId(axes[0]?.id || '');
      setSetorId(sectors[0]?.id || '');
      setResponsavelId(users[0]?.id || '');
      setTitulo('');
      setPrioridade('MEDIA');
      setObjetivo('');
      setDescricao('');
      setJustificativa('');
      setPublicoAlvo('Comunidade Acadêmica e Sociedade');
      setIndicadores([
        { id: 'ind-1', nome: '', unidade_medida: 'Unidade', tipo_meta: 'NUMERICA', linha_base: 0, meta: 1, resultado: 0, percentual: 0 }
      ]);
      setCronograma({
        janeiro: false, fevereiro: true, marco: true, abril: true, maio: true, junho: true,
        julho: false, agosto: true, setembro: true, outubro: true, novembro: true, dezembro: false
      });
      setAtividadesTexto('');
      setPossuiOrcamento(false);
      setItensOrcamento([]);
      setObservacoes('');
    }
  }, [initialData, axes, sectors, users, isOpen]);

  if (!isOpen) return null;

  const handleApplyAISuggestion = (sug: any) => {
    if (sug.title) setTitulo(sug.title);
    if (sug.objective) setObjetivo(sug.objective);
    if (sug.description) setDescricao(sug.description);
    if (sug.justification) setJustificativa(sug.justification);
    if (sug.suggested_priority) setPrioridade(sug.suggested_priority);

    // Set indicator
    if (sug.indicator) {
      setIndicadores([
        {
          id: 'ind-sug-1',
          nome: sug.indicator,
          unidade_medida: sug.measurement_unit || '%',
          tipo_meta: sug.measurement_unit === '%' ? 'PERCENTUAL' : 'NUMERICA',
          linha_base: sug.baseline || 0,
          meta: sug.target || 100,
          resultado: 0,
          percentual: 0,
          resultado_esperado: sug.expected_result || ''
        }
      ]);
    }

    // Match axis by name
    if (sug.suggested_axis) {
      const match = axes.find(a => a.nome.toLowerCase().includes(sug.suggested_axis.toLowerCase().slice(0, 8)));
      if (match) setEixoId(match.id);
    }
  };

  const handleImproveText = async (fieldName: string, text: string, setter: (v: string) => void) => {
    if (!text.trim()) return;
    setImprovingField(fieldName);
    try {
      const res = await api.improveText(text, fieldName);
      if (res.improvedText) {
        setter(res.improvedText);
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao aprimorar texto.');
    } finally {
      setImprovingField(null);
    }
  };

  const handleAddIndicator = () => {
    setIndicadores(prev => [
      ...prev,
      {
        id: `ind-${Date.now()}`,
        nome: '',
        unidade_medida: 'Unidade',
        tipo_meta: 'NUMERICA',
        linha_base: 0,
        meta: 10,
        resultado: 0,
        percentual: 0,
        resultado_esperado: ''
      }
    ]);
  };

  const handleRemoveIndicator = (idx: number) => {
    setIndicadores(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddBudgetItem = () => {
    setItensOrcamento(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        descricao: '',
        quantidade: 1,
        unidade: 'Unidade',
        valor_unitario: 0,
        valor_total: 0,
        tipo_despesa: 'Custeio',
        fonte_recurso: 'Tesouro (Fonte 1000)',
        natureza_despesa: '339030 - Material de Consumo'
      }
    ]);
  };

  const handleRemoveBudgetItem = (idx: number) => {
    setItensOrcamento(prev => prev.filter((_, i) => i !== idx));
  };

  const handleBudgetItemChange = (idx: number, field: string, value: any) => {
    setItensOrcamento(prev => {
      const copy = [...prev];
      const it = { ...copy[idx], [field]: value };
      if (field === 'quantidade' || field === 'valor_unitario') {
        const q = field === 'quantidade' ? Number(value) : it.quantidade;
        const u = field === 'valor_unitario' ? Number(value) : it.valor_unitario;
        it.valor_total = Math.round(q * u * 100) / 100;
      }
      copy[idx] = it;
      return copy;
    });
  };

  const totalOrcamento = itensOrcamento.reduce((acc, it) => acc + (Number(it.valor_total) || 0), 0);

  const assemblePayload = (): Partial<Action> => {
    return {
      paa_id: currentPaaId,
      eixo_id: eixoId,
      setor_id: setorId,
      responsavel_id: responsavelId,
      titulo,
      prioridade,
      objetivo,
      descricao,
      justificativa,
      publico_alvo: publicoAlvo,
      possui_orcamento: possuiOrcamento,
      observacoes,
      indicadores,
      cronograma: {
        ...cronograma,
        atividades_texto: atividadesTexto
      } as any,
      itens_orcamento: possuiOrcamento ? itensOrcamento : []
    };
  };

  const handleSave = async (submitNow: boolean) => {
    if (!titulo.trim()) {
      alert('O título da ação é obrigatório.');
      setActiveTab('identificacao');
      return;
    }
    if (!objetivo.trim()) {
      alert('O objetivo da ação é obrigatório.');
      setActiveTab('planejamento');
      return;
    }

    setSaving(true);
    try {
      await onSave(assemblePayload(), submitNow);
      onClose();
    } catch (e: any) {
      alert(e.message || 'Erro ao salvar ação.');
    } finally {
      setSaving(false);
    }
  };

  const monthsList = [
    { key: 'janeiro', label: 'Jan' },
    { key: 'fevereiro', label: 'Fev' },
    { key: 'marco', label: 'Mar' },
    { key: 'abril', label: 'Abr' },
    { key: 'maio', label: 'Mai' },
    { key: 'junho', label: 'Jun' },
    { key: 'julho', label: 'Jul' },
    { key: 'agosto', label: 'Ago' },
    { key: 'setembro', label: 'Set' },
    { key: 'outubro', label: 'Out' },
    { key: 'novembro', label: 'Nov' },
    { key: 'dezembro', label: 'Dez' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="bg-[#0f5132] text-white px-6 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">
              {initialData ? 'Edição da Ação' : 'Novo Cadastro de Ação'} • IFMA Campus Carolina
            </span>
            <h2 className="text-base font-bold">
              {initialData ? initialData.titulo : 'Elaboração de Ação do PAA'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSuggestAI(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-emerald-100 text-xs font-semibold rounded-md border border-emerald-500 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Sugerir com IA</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAnalyzeAI(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold rounded-md border border-emerald-700 shadow-xs"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Analisar Ação</span>
            </button>

            <button onClick={onClose} className="p-1.5 text-emerald-200 hover:text-white ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto shrink-0">
          {[
            { id: 'identificacao', label: '1. Identificação' },
            { id: 'planejamento', label: '2. Planejamento' },
            { id: 'indicadores', label: '3. Indicadores' },
            { id: 'cronograma', label: '4. Cronograma' },
            { id: 'orcamento', label: '5. Orçamento' },
            { id: 'observacoes', label: '6. Observações' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: IDENTIFICACAO */}
          {activeTab === 'identificacao' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Eixo Estratégico *
                  </label>
                  <select
                    value={eixoId}
                    onChange={e => setEixoId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    {axes.map(ax => (
                      <option key={ax.id} value={ax.id}>
                        {ax.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Setor Responsável *
                  </label>
                  <select
                    value={setorId}
                    onChange={e => setSetorId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    {sectors.map(sec => (
                      <option key={sec.id} value={sec.id}>
                        {sec.sigla} — {sec.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Servidor Responsável pela Ação
                  </label>
                  <select
                    value={responsavelId}
                    onChange={e => setResponsavelId(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="">Selecione o responsável...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Prioridade da Ação
                  </label>
                  <select
                    value={prioridade}
                    onChange={e => setPrioridade(e.target.value as any)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-semibold"
                  >
                    <option value="ALTA">ALTA (Estratégica / Urgente)</option>
                    <option value="MEDIA">MÉDIA (Operacional padrão)</option>
                    <option value="BAIXA">BAIXA (Complementar)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Título da Ação *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleImproveText('Título', titulo, setTitulo)}
                    disabled={improvingField === 'Título' || !titulo.trim()}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    {improvingField === 'Título' ? 'Melhorando...' : 'Melhorar Texto com IA'}
                  </button>
                </div>
                <input
                  type="text"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ex: Aquisição e Implantação de Computadores e Rede Gigabit no Laboratório 02"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PLANEJAMENTO */}
          {activeTab === 'planejamento' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Objetivo Geral da Ação *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleImproveText('Objetivo', objetivo, setObjetivo)}
                    disabled={improvingField === 'Objetivo' || !objetivo.trim()}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    {improvingField === 'Objetivo' ? 'Melhorando...' : 'Melhorar Texto'}
                  </button>
                </div>
                <textarea
                  value={objetivo}
                  onChange={e => setObjetivo(e.target.value)}
                  placeholder="Ex: Garantir infraestrutura tecnológica moderna para as atividades de ensino prático e extensão do Campus Carolina..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden min-h-[70px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Descrição Detalhada & Escopo
                  </label>
                  <button
                    type="button"
                    onClick={() => handleImproveText('Descrição', descricao, setDescricao)}
                    disabled={improvingField === 'Descrição' || !descricao.trim()}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    {improvingField === 'Descrição' ? 'Melhorando...' : 'Melhorar Texto'}
                  </button>
                </div>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Descreva as etapas operacionais, itens a adquirir, serviços e metodologia de execução..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden min-h-[90px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Justificativa Institucional
                  </label>
                  <button
                    type="button"
                    onClick={() => handleImproveText('Justificativa', justificativa, setJustificativa)}
                    disabled={improvingField === 'Justificativa' || !justificativa.trim()}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    {improvingField === 'Justificativa' ? 'Melhorando...' : 'Melhorar Texto'}
                  </button>
                </div>
                <textarea
                  value={justificativa}
                  onChange={e => setJustificativa(e.target.value)}
                  placeholder="Por que esta ação é necessária? Como impacta o ensino, a comunidade e as metas do PDI?"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden min-h-[70px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Público-Alvo
                </label>
                <input
                  type="text"
                  value={publicoAlvo}
                  onChange={e => setPublicoAlvo(e.target.value)}
                  placeholder="Ex: Estudantes dos Cursos Técnicos, Docentes e Servidores Técnicos"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 3: INDICADORES */}
          {activeTab === 'indicadores' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Indicadores de Desempenho</h4>
                  <p className="text-[11px] text-slate-500">
                    Defina pelo menos 1 indicador com meta quantitativa e unidade de medida.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddIndicator}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Indicador</span>
                </button>
              </div>

              <div className="space-y-3">
                {indicadores.map((ind, idx) => (
                  <div key={ind.id || idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800">
                        Indicador #{idx + 1}
                      </span>
                      {indicadores.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveIndicator(idx)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Nome do Indicador *
                        </label>
                        <input
                          type="text"
                          value={ind.nome}
                          onChange={e => {
                            const copy = [...indicadores];
                            copy[idx].nome = e.target.value;
                            setIndicadores(copy);
                          }}
                          placeholder="Ex: Número de computadores instalados e operacionais"
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Unidade de Medida
                        </label>
                        <input
                          type="text"
                          value={ind.unidade_medida}
                          onChange={e => {
                            const copy = [...indicadores];
                            copy[idx].unidade_medida = e.target.value;
                            setIndicadores(copy);
                          }}
                          placeholder="Ex: Unidade, Alunos, %, Eventos"
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Tipo de Meta
                        </label>
                        <select
                          value={ind.tipo_meta}
                          onChange={e => {
                            const copy = [...indicadores];
                            copy[idx].tipo_meta = e.target.value;
                            setIndicadores(copy);
                          }}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        >
                          <option value="NUMERICA">Numérica (Quantidade absoluta)</option>
                          <option value="PERCENTUAL">Percentual (%)</option>
                          <option value="QUALITATIVA">Qualitativa (Sim/Não)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Linha de Base Atual
                        </label>
                        <input
                          type="number"
                          value={ind.linha_base}
                          onChange={e => {
                            const copy = [...indicadores];
                            copy[idx].linha_base = Number(e.target.value);
                            setIndicadores(copy);
                          }}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Meta Planejada *
                        </label>
                        <input
                          type="number"
                          value={ind.meta}
                          onChange={e => {
                            const copy = [...indicadores];
                            copy[idx].meta = Number(e.target.value);
                            setIndicadores(copy);
                          }}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold text-emerald-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CRONOGRAMA */}
          {activeTab === 'cronograma' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase mb-1">
                  Meses de Execução da Ação (Exercício 2027)
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Selecione os meses em que a ação estará em andamento:
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {monthsList.map(m => (
                    <label
                      key={m.key}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer font-bold transition-colors ${
                        cronograma[m.key]
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!cronograma[m.key]}
                        onChange={e =>
                          setCronograma(prev => ({ ...prev, [m.key]: e.target.checked }))
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Detalhamento das Atividades por Mês ou Etapas
                </label>
                <textarea
                  value={atividadesTexto}
                  onChange={e => setAtividadesTexto(e.target.value)}
                  placeholder="Ex: Fev-Mar: Termo de Referência; Abr-Mai: Licitação; Jun-Ago: Entrega e testes; Set-Out: Capacitação."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden min-h-[90px]"
                />
              </div>
            </div>
          )}

          {/* TAB 5: ORÇAMENTO */}
          {activeTab === 'orcamento' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chkOrcamento"
                    checked={possuiOrcamento}
                    onChange={e => setPossuiOrcamento(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="chkOrcamento" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Esta ação demanda recursos orçamentários/financeiros específicos
                  </label>
                </div>

                {possuiOrcamento && (
                  <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                    Total: R$ {totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              {possuiOrcamento && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Itens Orçamentários Detalhados ({itensOrcamento.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddBudgetItem}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Item</span>
                    </button>
                  </div>

                  {itensOrcamento.length === 0 ? (
                    <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg text-xs text-slate-500">
                      Nenhum item orçamentário adicionado. Clique em &ldquo;Adicionar Item&rdquo; para discriminar despesas.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {itensOrcamento.map((item, idx) => (
                        <div key={item.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800">
                              Item #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBudgetItem(idx)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                Descrição do Item *
                              </label>
                              <input
                                type="text"
                                value={item.descricao}
                                onChange={e => handleBudgetItemChange(idx, 'descricao', e.target.value)}
                                placeholder="Ex: Computadores Desktop Core i7 16GB"
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                Quantidade
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={e => handleBudgetItemChange(idx, 'quantidade', e.target.value)}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                Valor Unitário (R$)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.valor_unitario}
                                onChange={e => handleBudgetItemChange(idx, 'valor_unitario', e.target.value)}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-emerald-800"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                Tipo de Despesa
                              </label>
                              <select
                                value={item.tipo_despesa}
                                onChange={e => handleBudgetItemChange(idx, 'tipo_despesa', e.target.value)}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                              >
                                <option value="Custeio">Custeio (Despesa Corrente)</option>
                                <option value="Investimento">Investimento (Capital)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                Fonte de Recurso
                              </label>
                              <select
                                value={item.fonte_recurso}
                                onChange={e => handleBudgetItemChange(idx, 'fonte_recurso', e.target.value)}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                              >
                                <option value="Tesouro (Fonte 1000)">Tesouro (Fonte 1000)</option>
                                <option value="Recursos Próprios (Fonte 1250)">Recursos Próprios (1250)</option>
                                <option value="Emenda Parlamentar">Emenda Parlamentar</option>
                                <option value="TED / Convênio">TED / Convênio</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                Natureza da Despesa
                              </label>
                              <input
                                type="text"
                                value={item.natureza_despesa || ''}
                                onChange={e => handleBudgetItemChange(idx, 'natureza_despesa', e.target.value)}
                                placeholder="339030 / 449052"
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                                Subtotal (R$)
                              </label>
                              <div className="text-xs font-mono font-bold text-slate-800 p-1.5 bg-slate-100 rounded text-right">
                                R$ {(item.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: OBSERVACOES */}
          {activeTab === 'observacoes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Observações e Informações Complementares
                </label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais para a equipe de validação, riscos previstos, requisitos de infraestrutura..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-600 focus:outline-hidden min-h-[140px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Todos os campos com (*) são obrigatórios</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Rascunho</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submeter para Validação</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Modals */}
      <AISuggestModal
        isOpen={showSuggestAI}
        onClose={() => setShowSuggestAI(false)}
        onApply={handleApplyAISuggestion}
      />

      <AIAnalyzeModal
        isOpen={showAnalyzeAI}
        onClose={() => setShowAnalyzeAI(false)}
        actionData={assemblePayload()}
      />
    </div>
  );
};
