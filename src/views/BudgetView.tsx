import React, { useState } from 'react';
import { DollarSign, PieChart, Layers, Download, Search, CheckCircle2, TrendingUp } from 'lucide-react';
import { Action, Axis, Sector } from '../types';

interface BudgetViewProps {
  actions: Action[];
  axes: Axis[];
  sectors: Sector[];
  onExportXLSX: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  actions,
  axes,
  sectors,
  onExportXLSX
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'setores' | 'eixos' | 'fontes' | 'itens'>('geral');
  const [searchItem, setSearchItem] = useState('');

  // Calculations
  let totalPlanejado = 0;
  let totalExecutado = 0;
  let totalCusteio = 0;
  let totalInvestimento = 0;

  const fontesMap: Record<string, { planejado: number; count: number }> = {};
  const setoresMap: Record<string, { planejado: number; executado: number; actionsCount: number }> = {};
  const eixosMap: Record<string, { planejado: number; actionsCount: number }> = {};
  const allItems: any[] = [];

  actions.forEach(a => {
    const secSigla = sectors.find(s => s.id === a.setor_id)?.sigla || a.setor_id;
    const axNome = axes.find(ax => ax.id === a.eixo_id)?.nome || a.eixo_id;

    if (!setoresMap[secSigla]) setoresMap[secSigla] = { planejado: 0, executado: 0, actionsCount: 0 };
    if (!eixosMap[axNome]) eixosMap[axNome] = { planejado: 0, actionsCount: 0 };

    setoresMap[secSigla].actionsCount += 1;
    eixosMap[axNome].actionsCount += 1;

    totalExecutado += a.execucao?.valor_executado || 0;
    setoresMap[secSigla].executado += a.execucao?.valor_executado || 0;

    (a.itens_orcamento || []).forEach(it => {
      totalPlanejado += it.valor_total;
      setoresMap[secSigla].planejado += it.valor_total;
      eixosMap[axNome].planejado += it.valor_total;

      if (it.tipo_despesa?.toLowerCase().includes('custeio')) {
        totalCusteio += it.valor_total;
      } else {
        totalInvestimento += it.valor_total;
      }

      const f = it.fonte_recurso || 'Tesouro';
      if (!fontesMap[f]) fontesMap[f] = { planejado: 0, count: 0 };
      fontesMap[f].planejado += it.valor_total;
      fontesMap[f].count += 1;

      allItems.push({
        ...it,
        acaoTitulo: a.titulo,
        setorSigla: secSigla,
        eixoNome: axNome
      });
    });
  });

  const saldo = totalPlanejado - totalExecutado;
  const filteredItems = allItems.filter(it => {
    if (!searchItem) return true;
    const q = searchItem.toLowerCase();
    return (
      it.descricao.toLowerCase().includes(q) ||
      it.acaoTitulo.toLowerCase().includes(q) ||
      it.setorSigla.toLowerCase().includes(q) ||
      it.fonte_recurso.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <DollarSign className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Gestão Orçamentária e Financeira</h2>
          </div>
          <p className="text-xs text-slate-500">
            Painel consolidado de recursos, fontes de custeio, investimentos e despesas por setor.
          </p>
        </div>

        <button
          onClick={onExportXLSX}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f5132] hover:bg-[#137547] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Planilha Completa (XLSX)</span>
        </button>
      </div>

      {/* 5 Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Orçamento Planejado</span>
          <div className="text-lg font-bold font-mono text-slate-900">
            R$ {totalPlanejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Total Executado</span>
          <div className="text-lg font-bold font-mono text-emerald-700">
            R$ {totalExecutado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Saldo a Executar</span>
          <div className="text-lg font-bold font-mono text-blue-700">
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Custeio (Desp. Correntes)</span>
          <div className="text-lg font-bold font-mono text-teal-800">
            R$ {totalCusteio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-medium text-slate-500 block">Investimento (Capital)</span>
          <div className="text-lg font-bold font-mono text-indigo-800">
            R$ {totalInvestimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 overflow-x-auto">
          {[
            { id: 'geral', label: 'Visão Geral & Fontes' },
            { id: 'setores', label: 'Orçamento por Setor' },
            { id: 'eixos', label: 'Orçamento por Eixo' },
            { id: 'itens', label: `Itens Orçamentários Detalhados (${allItems.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* TAB: GERAL & FONTES */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Distribuição por Fontes de Recursos
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(fontesMap).map(([fonte, data], idx) => {
                  const pct = totalPlanejado > 0 ? Math.round((data.planejado / totalPlanejado) * 100) : 0;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 truncate" title={fonte}>{fonte}</span>
                        <span className="font-mono text-emerald-700 font-bold">{pct}%</span>
                      </div>
                      <div className="text-base font-bold font-mono text-slate-900">
                        R$ {data.planejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {data.count} itens orçamentários vinculados
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SETORES */}
          {activeTab === 'setores' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Setor do Campus</th>
                    <th className="p-3 text-center">Nº Ações</th>
                    <th className="p-3 text-right">Planejado (R$)</th>
                    <th className="p-3 text-right">Executado (R$)</th>
                    <th className="p-3 text-right">Saldo (R$)</th>
                    <th className="p-3 text-center">% Participação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(setoresMap).map(([sigla, data], idx) => {
                    const pct = totalPlanejado > 0 ? Math.round((data.planejado / totalPlanejado) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800 font-mono">{sigla}</td>
                        <td className="p-3 text-center">{data.actionsCount}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          R$ {data.planejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          R$ {data.executado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-600">
                          R$ {(data.planejado - data.executado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center font-mono font-bold">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: EIXOS */}
          {activeTab === 'eixos' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Eixo Temático</th>
                    <th className="p-3 text-center">Nº Ações</th>
                    <th className="p-3 text-right">Total Planejado (R$)</th>
                    <th className="p-3 text-center">% do Orçamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {Object.entries(eixosMap).map(([nome, data], idx) => {
                    const pct = totalPlanejado > 0 ? Math.round((data.planejado / totalPlanejado) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{nome}</td>
                        <td className="p-3 text-center">{data.actionsCount}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          R$ {data.planejado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: ITENS */}
          {activeTab === 'itens' && (
            <div className="space-y-3">
              <div className="relative max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchItem}
                  onChange={e => setSearchItem(e.target.value)}
                  placeholder="Buscar itens, ações ou fontes..."
                  className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Item / Descrição</th>
                      <th className="p-2.5">Ação Vinculada</th>
                      <th className="p-2.5">Setor</th>
                      <th className="p-2.5 text-center">Qtd</th>
                      <th className="p-2.5 text-right">Unitário (R$)</th>
                      <th className="p-2.5 text-right">Total (R$)</th>
                      <th className="p-2.5">Tipo</th>
                      <th className="p-2.5">Fonte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredItems.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-800">{it.descricao}</td>
                        <td className="p-2.5 text-slate-600 max-w-xs truncate">{it.acaoTitulo}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-700">{it.setorSigla}</td>
                        <td className="p-2.5 text-center font-mono">{it.quantidade}</td>
                        <td className="p-2.5 text-right font-mono">
                          {it.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                          {it.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-slate-600">{it.tipo_despesa}</td>
                        <td className="p-2.5 text-slate-600">{it.fonte_recurso}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
