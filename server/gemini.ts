import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini client with proper header
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY não configurada no ambiente.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

export interface AISuggestionResponse {
  title: string;
  objective: string;
  description: string;
  justification: string;
  indicator: string;
  measurement_unit: string;
  baseline: number;
  target: number;
  expected_result: string;
  suggested_axis: string;
  suggested_priority: 'ALTA' | 'MEDIA' | 'BAIXA';
}

export interface AIAnalysisItem {
  tipo: 'ERRO' | 'ALERTA' | 'SUGESTAO';
  campo: string;
  mensagem: string;
  recomendacao: string;
}

export interface AIAnalysisResponse {
  geral: string;
  itens: AIAnalysisItem[];
}

export async function suggestAction(userPrompt: string): Promise<AISuggestionResponse> {
  const ai = getGeminiClient();
  if (!ai) {
    // Fallback template when API key is not yet set
    return {
      title: `Ação Estratégica: ${userPrompt.slice(0, 50)}`,
      objective: `Modernizar e aprimorar os processos relativos a: ${userPrompt}, assegurando excelência no serviço público e atendimento à comunidade do IFMA Campus Carolina.`,
      description: `Implementação de cronograma detalhado de aquisições e treinamentos para atender a demanda: ${userPrompt}.`,
      justification: `A presente ação atende às metas do Plano de Desenvolvimento Institucional (PDI) e responde diretamente às necessidades diagnosticadas no Campus Carolina.`,
      indicator: 'Taxa de implementação das melhorias propostas',
      measurement_unit: '% concluído',
      baseline: 0,
      target: 100,
      expected_result: '100% da infraestrutura e dos procedimentos estabelecidos e em operação.',
      suggested_axis: 'Eixo 1 — Ensino e Desenvolvimento Acadêmico',
      suggested_priority: 'ALTA'
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Você é um especialista em planejamento público e elaboração do Plano de Ação Anual (PAA) dos Institutos Federais de Educação, Ciência e Tecnologia (IFMA Campus Carolina).
Com base na ideia do usuário: "${userPrompt}", elabore uma proposta de ação detalhada, técnica, formal e institucional.

Gere uma resposta em JSON contendo exatamente as chaves:
- title: Título conciso e objetivo da ação
- objective: Objetivo claro no infinitivo (ex: Ampliar, Garantir, Promover...)
- description: Descrição operacional com escopo das etapas
- justification: Justificativa institucional fundamentada
- indicator: Nome de um indicador de desempenho mensurável
- measurement_unit: Unidade de medida (ex: Estudantes, Unidades, %, etc.)
- baseline: Número da linha de base atual (ex: 0, 10, etc.)
- target: Número da meta quantitativa almejada (ex: 100, 50, etc.)
- expected_result: Descrição do resultado esperado qualitativo e quantitativo
- suggested_axis: Nome de um eixo sugerido (ex: Ensino, Pesquisa, Extensão, Gestão Institucional, Assistência Estudantil, TIC)
- suggested_priority: 'ALTA', 'MEDIA' ou 'BAIXA'`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            objective: { type: Type.STRING },
            description: { type: Type.STRING },
            justification: { type: Type.STRING },
            indicator: { type: Type.STRING },
            measurement_unit: { type: Type.STRING },
            baseline: { type: Type.NUMBER },
            target: { type: Type.NUMBER },
            expected_result: { type: Type.STRING },
            suggested_axis: { type: Type.STRING },
            suggested_priority: { type: Type.STRING, enum: ['ALTA', 'MEDIA', 'BAIXA'] }
          },
          required: [
            'title', 'objective', 'description', 'justification',
            'indicator', 'measurement_unit', 'baseline', 'target',
            'expected_result', 'suggested_axis', 'suggested_priority'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed as AISuggestionResponse;
  } catch (err) {
    console.error('Erro na chamada Gemini suggestAction:', err);
    throw new Error('Falha ao gerar sugestão com IA. Verifique sua conexão ou tente novamente.');
  }
}

export async function analyzeAction(actionData: any): Promise<AIAnalysisResponse> {
  const ai = getGeminiClient();
  if (!ai) {
    const itens: AIAnalysisItem[] = [];
    if (!actionData.titulo || actionData.titulo.length < 10) {
      itens.push({ tipo: 'ERRO', campo: 'titulo', mensagem: 'Título muito sucinto.', recomendacao: 'Especifique o objeto da ação com mais precisão.' });
    }
    if (!actionData.objetivo || !actionData.objetivo.match(/^(Garantir|Ampliar|Promover|Implementar|Capacitar|Desenvolver|Adquirir|Realizar)/i)) {
      itens.push({ tipo: 'SUGESTAO', campo: 'objetivo', mensagem: 'Objetivo deve preferencialmente iniciar com verbo de ação no infinitivo.', recomendacao: 'Ex: "Promover", "Garantir", "Implementar".' });
    }
    if (!actionData.indicadores || actionData.indicadores.length === 0) {
      itens.push({ tipo: 'ERRO', campo: 'indicadores', mensagem: 'A ação não possui indicadores cadastrados.', recomendacao: 'Cadastre pelo menos 1 indicador com meta mensurável.' });
    }
    return {
      geral: 'Análise preliminar realizada pelas regras locais do sistema PAA IFMA Campus Carolina.',
      itens
    };
  }

  try {
    const prompt = `Analise a seguinte Ação do Plano de Ação Anual (PAA) do IFMA Campus Carolina:
${JSON.stringify(actionData, null, 2)}

Identifique rigorosamente:
1. Campos ausentes ou incompletos
2. Objetivos vagos ou genéricos
3. Metas pouco mensuráveis ou incoerentes com os indicadores
4. Inconsistências de cronograma (ex: sem meses selecionados)
5. Inconsistências orçamentárias (ex: possui orçamento marcado mas nenhum item orçamentário detalhado)
6. Fragilidades na justificativa institucional

Para cada achado classifique como:
- ERRO: Impede a validação institucional
- ALERTA: Fragilidade técnica que merece atenção
- SUGESTAO: Oportunidade de melhoria na redação ou escopo`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            geral: { type: Type.STRING, description: 'Parecer técnico geral sintético da ação' },
            itens: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tipo: { type: Type.STRING, enum: ['ERRO', 'ALERTA', 'SUGESTAO'] },
                  campo: { type: Type.STRING },
                  mensagem: { type: Type.STRING },
                  recomendacao: { type: Type.STRING }
                },
                required: ['tipo', 'campo', 'mensagem', 'recomendacao']
              }
            }
          },
          required: ['geral', 'itens']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"geral":"","itens":[]}');
    return parsed as AIAnalysisResponse;
  } catch (err) {
    console.error('Erro na chamada Gemini analyzeAction:', err);
    throw new Error('Falha ao analisar ação com IA.');
  }
}

export async function improveText(text: string, fieldName: string): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    return text.trim() + ' (Texto revisado conforme padrão institucional).';
  }

  try {
    const prompt = `Você é um redator oficial do Instituto Federal do Maranhão (IFMA).
Aperfeiçoe o texto do campo "${fieldName}" para o Plano de Ação Anual (PAA), elevando a clareza, formalidade e padrão da redação oficial brasileira.

Regras rigorosas:
- Preserve rigorosamente o significado e a intenção original.
- NÃO invente novos dados, números, valores financeiros, leis, compromissos ou datas que não estejam no texto.
- Retorne APENAS o texto aprimorado, sem comentários, aspas adicionais ou preâmbulo.

Texto original:
"${text}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt
    });

    return (response.text || text).trim();
  } catch (err) {
    console.error('Erro na chamada Gemini improveText:', err);
    throw new Error('Falha ao aprimorar texto com IA.');
  }
}
