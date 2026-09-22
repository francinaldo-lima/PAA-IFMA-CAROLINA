import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Settings2, Users, GraduationCap, Briefcase, CheckCircle2 } from 'lucide-react';
import { Action, Axis, FacultyMember, InstitutionSettings, ManagementMember, PAA, Sector, StaffMember } from '../types';
import { generatePAAPDF } from '../lib/pdf-generator';
import { api } from '../lib/api';

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

  const [managementTeam, setManagementTeam] = useState<ManagementMember[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);

  useEffect(() => {
    if (settings) {
      setApresentacao(settings.texto_apresentacao || '');
      setMetodologia(settings.texto_metodologia || '');
    }
  }, [settings]);

  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        const [gest, doc, tae] = await Promise.all([
          api.getManagementTeam(),
          api.getFaculty(),
          api.getStaff()
        ]);
        setManagementTeam(gest);
        setFaculty(doc);
        setStaff(tae);
      } catch (err) {
        console.error('Erro ao carregar servidores para o documento:', err);
      } finally {
        setLoadingPersonnel(false);
      }
    };
    loadPersonnel();
  }, []);

  if (!paa || !settings) {
    return <div className="p-8 text-center text-slate-500">Carregando gerador de documentos...</div>;
  }

  const approvedActions = actions.filter(a =>
    ['APROVADA', 'CONSOLIDADA', 'PUBLICADA', 'EM_EXECUCAO', 'CONCLUIDA'].includes(a.status)
  );

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    try {
      generatePAAPDF(
        paa,
        actions,
        axes,
        sectors,
        {
          ...settings,
          texto_apresentacao: apresentacao,
          texto_metodologia: metodologia
        },
        managementTeam,
        faculty,
        staff
      );
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
            Exportação do documento formal completo em conformidade com o modelo oficial do IFMA Campus Avançado Carolina.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadXLSX}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Exportar XLSX</span>
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

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Equipe de Gestão</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{managementTeam.length} membros</p>
          </div>
          <span className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Users className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Corpo Docente</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{faculty.length} docentes</p>
          </div>
          <span className="p-2.5 rounded-lg bg-sky-50 text-sky-700">
            <GraduationCap className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Técnicos Administrativos</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{staff.length} servidores</p>
          </div>
          <span className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <Briefcase className="w-5 h-5" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Document Structure Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Estrutura Formal do Documento (Conforme Modelo PAA)
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { num: '01', title: 'Capa Oficial e Folha de Rosto', desc: 'Identificação oficial do Ministério da Educação, SETEC, IFMA e Campus Avançado Carolina.' },
                { num: '02', title: `Equipe de Gestão (${managementTeam.length} membros)`, desc: 'Reitor, Diretor-Geral, Diretorias, Departamentos e Coordenações de Curso com SIAPE e portarias.' },
                { num: '03', title: `Corpo Docente (${faculty.length} professores)`, desc: 'Professores com titulação (Doutor, Mestre, Especialista), áreas de atuação e funções de chefia vinculadas.' },
                { num: '04', title: `Técnicos Administrativos (${staff.length} TAEs)`, desc: 'Cargos efetivos, níveis de classificação (C, D, E), lotações e chefias de setor designadas.' },
                { num: '05', title: 'Sumário Oficial', desc: 'Estruturação paginada do documento oficial com seções e eixos temáticos.' },
                { num: '06', title: 'Apresentação Institucional', desc: 'Diretrizes da Direção-Geral e objetivos de desenvolvimento acadêmico e regional.' },
                { num: '07', title: 'Introdução, Objetivo Geral e Metodologia', desc: 'Quadro 1 (Missão, Visão e Valores) e Quadro 2 (Indicadores de Desempenho e Metas TCU/PDI).' },
                { num: '08', title: `Plano de Ações por Eixo Temático (${approvedActions.length} ações consolidadas)`, desc: 'Matrizes dos eixos Ensino (DDE), Pesquisa (CPPI), Extensão (DEE) e Administração Geral (DRG).' },
                { num: '09', title: 'Resumo Orçamentário e Financeiro', desc: 'Quadro de despesas de custeio e capital, detalhadas por Fonte 20RL e Fonte 2994.' },
                { num: '10', title: 'Monitoramento, Encerramento e Assinaturas', desc: 'Rotina de acompanhamento trimestral e bloco de homologação das chefias institucionais.' }
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
                Texto de Apresentação (Direção-Geral)
              </label>
              <textarea
                value={apresentacao}
                onChange={e => setApresentacao(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md min-h-[120px] focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Texto de Metodologia e Objetivos
              </label>
              <textarea
                value={metodologia}
                onChange={e => setMetodologia(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md min-h-[120px] focus:outline-emerald-600"
              />
            </div>

            <button
              onClick={handleSaveTexts}
              disabled={salvando}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              {salvando ? 'Salvando...' : 'Salvar Textos no Sistema'}
            </button>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Conformidade PAA</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              O documento compilado integra automaticamente os dados cadastrados nos módulos: <strong>Ano do Exercício</strong>, <strong>Equipe de Gestão</strong>, <strong>Corpo Docente</strong> e <strong>Técnicos Administrativos</strong> com a marcação das chefias de setor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
