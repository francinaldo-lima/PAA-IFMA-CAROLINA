import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Printer, Settings2, ShieldCheck, ExternalLink } from 'lucide-react';
import { Action, Axis, InstitutionSettings, PAA, Sector } from '../types';
import { generatePAAPDF } from '../lib/pdf-generator';

interface DocumentGeneratorViewProps {
  paa: PAA | null;
  actions: Action[];
  axes: Axis[];
  sectors: Sector[];
  settings: InstitutionSettings | null;
  onSaveSettings: (settings: Partial<InstitutionSettings>) => Promise<void>;
}

export const DocumentGeneratorView: React.FC<DocumentGeneratorViewProps> = ({
  paa,
  actions,
  axes,
  sectors,
  settings,
  onSaveSettings
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [apresentacao, setApresentacao] = useState(settings?.texto_apresentacao || '');
  const [metodologia, setMetodologia] = useState(settings?.texto_metodologia || '');
  const [salvando, setSalvando] = useState(false);

  React.useEffect(() => {
    if (settings) {
      setApresentacao(settings.texto_apresentacao || '');
      setMetodologia(settings.texto_metodologia || '');
    }
  }, [settings]);

  if (!paa || !settings) {
    return <div className="p-8 text-center text-slate-500">Carregando gerador de documentos...</div>;
  }

  const approvedActions = actions.filter(a =>
    ['APROVADA', 'CONSOLIDADA', 'PUBLICADA', 'EM_EXECUCAO', 'CONCLUIDA'].includes(a.status)
  );

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      generatePAAPDF(paa, actions, axes, sectors, {
        ...settings,
        texto_apresentacao: apresentacao,
        texto_metodologia: metodologia
      });
    } catch (e: any) {
      alert('Erro ao gerar PDF: ' + (e.message || ''));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadXLSX = () => {
    window.open(`/api/export/xlsx?paa_id=${paa.id}`, '_blank');
  };

  const handleSaveTexts = async () => {
    setSalvando(true);
    try {
      await onSaveSettings({
        texto_apresentacao: apresentacao,
        texto_metodologia: metodologia
      });
      alert('Textos institucionais do documento atualizados com sucesso!');
    } catch (e: any) {
      alert('Erro ao salvar textos: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Gerador Oficial do Plano de Ação Anual (PAA {paa.ano})
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Exportação do documento formal completo em PDF padrão A4 e planilha analítica em XLSX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadXLSX}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Exportar XLSX (Excel)</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>{isGenerating ? 'Compilando...' : 'Baixar PDF Oficial'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Structure Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Estrutura Formal do Documento (Normas IFMA)
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { num: '01', title: 'Capa Oficial e Folha de Rosto', desc: 'Brasão institucional, identificação do Campus Carolina, título e exercício 2027.' },
                { num: '02', title: 'Identificação Institucional & Contatos', desc: 'Dados formais da unidade, endereço, telefones, canais oficiais e direção.' },
                { num: '03', title: 'Apresentação Institucional', desc: 'Mensagem e diretrizes estratégicas da Direção-Geral para o exercício.' },
                { num: '04', title: 'Metodologia de Elaboração e Participação', desc: 'Critérios de participação dos setores, alinhamento ao PDI e diretrizes do MEC.' },
                { num: '05', title: 'Eixos Temáticos Estratégicos', desc: 'Quadro síntese dos eixos de atuação e metas globais.' },
                { num: '06', title: `Matriz Detalhada de Ações (${approvedActions.length} ações)`, desc: 'Tabela oficial contendo título, setor, prioridade, objetivos, metas e indicadores.' },
                { num: '07', title: 'Demonstrativo Orçamentário Consolidado', desc: 'Quadro de despesas de custeio, investimentos e fontes de recursos.' },
                { num: '08', title: 'Cronograma Físico de Execução', desc: 'Matriz visual de distribuição dos 12 meses do exercício.' },
                { num: '09', title: 'Homologação e Bloco de Assinaturas', desc: 'Assinatura formal do Diretor-Geral, Diretor de Administração e Diretor de Ensino.' }
              ].map(sec => (
                <div key={sec.num} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-3">
                  <span className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                    {sec.num}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800">{sec.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Text Configuration */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-emerald-700" />
              <span>Personalizar Textos Oficiais</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Texto de Apresentação (Direção)
              </label>
              <textarea
                value={apresentacao}
                onChange={e => setApresentacao(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md min-h-[120px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Texto de Metodologia
              </label>
              <textarea
                value={metodologia}
                onChange={e => setMetodologia(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md min-h-[120px]"
              />
            </div>

            <button
              onClick={handleSaveTexts}
              disabled={salvando}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
            >
              {salvando ? 'Salvando...' : 'Salvar Textos no Sistema'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
