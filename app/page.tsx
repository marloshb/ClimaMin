"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ControlModule, controlTabs } from "./control-module";
import { ClimateModule, climateTabs } from "./climate-module";
import { HazardsModule, hazardBaseFeed, hazardScenarioFeed, hazardScenarioStages, hazardTabs } from "./hazards-module";

type Tone = "ok" | "watch" | "alert" | "critical" | "info";

const controlRouteSlug = (label: string) => label
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

type Metric = {
  label: string;
  value: string;
  delta: string;
  caption: string;
  tone: Tone;
};

type Job = {
  id: string;
  item: string;
  owner: string;
  due: string;
  status: string;
  priority: "Crítica" | "Alta" | "Média";
};

type Workspace = {
  id: string;
  key: string;
  code: string;
  icon: string;
  title: string;
  shortTitle: string;
  mission: string;
  result: string;
  status: string;
  tone: Tone;
  badge?: number;
  metrics: Metric[];
  features: string[];
  flow: string[];
  forms: string[];
  inputs: string[];
  outputs: string[];
  reports: string[];
  charts: string[];
  external: string[];
  internal: string[];
  agents: string[];
  jobs: Job[];
};

type Agent = {
  name: string;
  codename: string;
  role: string;
  trigger: string;
  actions: string;
  control: string;
  status: "Executando" | "Monitorando" | "Aguardando aprovação";
};

type FeedItem = {
  id: number;
  time: string;
  agent: string;
  text: string;
  type: Tone;
};

const makeMetrics = (
  first: [string, string, string, string, Tone],
  second: [string, string, string, string, Tone],
  third: [string, string, string, string, Tone],
  fourth: [string, string, string, string, Tone],
): Metric[] =>
  [first, second, third, fourth].map(([label, value, delta, caption, tone]) => ({
    label,
    value,
    delta,
    caption,
    tone,
  }));

const workspaces: Workspace[] = [
  {
    id: "01",
    key: "control",
    code: "TC",
    icon: "◫",
    title: "Torre de Controle",
    shortTitle: "Torre de Controle",
    mission: "Concentrar a imagem operacional comum e as decisões prioritárias da Unidade de Tubarão e do entorno.",
    result: "Situação integrada, riscos ativos, capacidade, gargalos, decisões e agenda executiva.",
    status: "Atenção",
    tone: "watch",
    badge: 4,
    metrics: makeMetrics(
      ["Capacidade disponível", "91,8%", "−3,2 pp", "Plano integrado 72h", "watch"],
      ["Produção em risco", "42,6 kt", "+8,4 kt", "P90 no cenário ativo", "alert"],
      ["EBITDA em risco", "R$ 8,7 mi", "+R$ 1,3 mi", "Antes da mitigação", "alert"],
      ["Valor preservado", "R$ 5,2 mi", "+R$ 0,9 mi", "Plano PRISMA v4", "ok"],
    ),
    features: ["Imagem operacional comum", "Mapa-tempo sincronizado", "Agenda de decisões", "Top riscos e gargalos", "Briefing executivo por IA", "Modo executivo e incidente"],
    flow: ["Detectar mudança material", "Investigar no mapa", "Propagar impacto", "Comparar alternativas", "Aprovar decisão", "Despachar e monitorar", "Registrar resultado"],
    forms: ["Registro de decisão", "Aceite de risco", "Delegação de tarefa", "Anotação de turno", "Cenário rápido"],
    inputs: ["Eventos e model runs", "Estado e capacidade dos ativos", "Produção, estoques e filas", "Tarefas e incidentes", "Impactos financeiros"],
    outputs: ["Briefing situacional", "Agenda executiva", "Plano aprovado", "Tarefas e alertas", "Relatório de turno"],
    reports: ["Resumo executivo diário", "Fechamento de turno", "Exposição 72h", "Decisões pendentes", "Valor preservado"],
    charts: ["Capacidade planejada × disponível", "Waterfall de perdas", "Heatmap de risco", "Timeline de eventos", "Matriz impacto × urgência"],
    external: ["ECMWF / Copernicus", "INMET / Incaper", "Living Atlas", "Defesa Civil", "AIS marítimo"],
    internal: ["MES / APS", "SCADA / Historian", "EAM / CMMS", "ERP / FP&A", "TOS / Ferrovia"],
    agents: ["AURORA Orquestrador", "NEXO Priorizador", "PULSO Despachante", "LEDGER Evidências"],
    jobs: [
      { id: "DEC-284", item: "Antecipar bombeamento do setor D-04", owner: "Sala de Controle", due: "13:45", status: "Aguardando aceite", priority: "Crítica" },
      { id: "INS-771", item: "Vistoriar canal e gradeamento norte", owner: "Equipe HSE-02", due: "14:10", status: "Em deslocamento", priority: "Alta" },
      { id: "PLN-118", item: "Publicar plano integrado 72h v4", owner: "Planejamento", due: "14:30", status: "Em revisão", priority: "Alta" },
    ],
  },
  {
    id: "02",
    key: "climate",
    code: "CL",
    icon: "≈",
    title: "Clima e Previsões",
    shortTitle: "Clima",
    mission: "Traduzir sinais globais, regionais e locais em previsão probabilística útil para a operação.",
    result: "Nowcasting, ensemble, climatologia, sazonal, CMIP6, anomalias e confiança explicável.",
    status: "Nova rodada",
    tone: "info",
    badge: 2,
    metrics: makeMetrics(
      ["Chuva P50 · 24h", "73 mm", "+25 mm", "P90 104 mm · ECMWF 12Z", "alert"],
      ["Prob. > 50 mm", "76%", "+27 pp", "39 de 51 membros", "watch"],
      ["Rajada máxima", "82 km/h", "+11 km/h", "Janela 20–22h", "watch"],
      ["Confiança da rodada", "82%", "+8 pp", "Trust Score · bias corrigido", "ok"],
    ),
    features: ["Observações com QA e fallback", "Nowcasting 0–6h", "Forecast probabilístico 0–72h", "Ensemble e comparação de runs", "EFI/SOT, climatologia e anomalias", "Subseasonal, seasonal e drivers", "CMIP6 e verificação"],
    flow: ["Ingerir observações", "Executar QA e assimilação", "Receber rodadas", "Calibrar ensemble", "Comparar com clima", "Detectar mudança material", "Publicar ClimateSignal e briefing"],
    forms: ["ClimateSignal", "Configuração de previsão", "Revisão de briefing", "Registro de anomalia", "Solicitação de rerun"],
    inputs: ["ECMWF / Copernicus", "CPTEC / INPE", "INMET / Incaper", "Radar e satélite", "Estações, raios e marégrafos"],
    outputs: ["Campos previstos", "Probabilidade de excedência", "Anomalias", "Confiança e limitações", "Datasets para modelos físicos"],
    reports: ["Boletim 72h", "Boletim sazonal", "Análise de evento", "Scorecard de habilidade", "Previsto × observado"],
    charts: ["Plumas de ensemble", "Meteogramas", "Rosa dos ventos", "Acumulado de chuva", "Skill score"],
    external: ["ECMWF", "ERA5", "CPTEC / INPE", "INMET", "Incaper", "Redes de raios"],
    internal: ["Estações Vale", "Historian", "Model factory", "Planejamento", "Alertas"],
    agents: ["METEOROLOGISTA Orquestrador", "OBSERVATION QA", "NOWCAST", "ENSEMBLE", "RUN COMPARATOR", "ANOMALY", "SEASONAL", "CLIMATE PROJECTION", "VERIFICATION", "PUBLISHER"],
    jobs: [
      { id: "RUN-12Z", item: "Validar ensemble corrigido para Tubarão", owner: "Meteorologia", due: "13:38", status: "Em validação", priority: "Crítica" },
      { id: "BRF-091", item: "Publicar briefing de mudança material", owner: "NIMBUS", due: "13:42", status: "Rascunho pronto", priority: "Alta" },
      { id: "QA-338", item: "Comparar radar × pluviômetros locais", owner: "Modelagem", due: "14:00", status: "Executando", priority: "Média" },
    ],
  },
  {
    id: "03",
    key: "hazards",
    code: "PM",
    icon: "△",
    title: "Perigos e Modelos",
    shortTitle: "Perigos",
    mission: "Converter condições meteorológicas em intensidade física, extensão, duração e probabilidade de impacto.",
    result: "Superfícies de inundação, vento, raios, calor, fogo, encostas e costa com incerteza rastreável.",
    status: "6 modelos ativos",
    tone: "watch",
    badge: 2,
    metrics: makeMetrics(
      ["Perigos ativos", "4", "2 relevantes", "Flood · wind · lightning · heat", "alert"],
      ["Área potencial", "2,6 km²", "+42%", "Inundação P90 · D-04", "critical"],
      ["Primeiro impacto", "01h24", "−18 min", "Chegada provável 19:42", "alert"],
      ["Hazard confidence", "79/100", "QA PASS", "HMR-882 · HS-882", "ok"],
    ),
    features: ["Situação multiameaças", "Model Registry versionado", "Fast e full model routing", "Hidrologia e hidráulica 1D/2D", "13 motores físicos", "Eventos compostos", "QA, validação e SLO"],
    flow: ["Receber ClimateSignal", "Selecionar modelos", "Validar pré-condições", "Executar física", "Quantificar incerteza", "QA técnico", "Publicar HazardSurface e Signal"],
    forms: ["Novo HazardModelRun", "Override de condição inicial", "Validação técnica", "Publicação controlada", "Registro de limitação"],
    inputs: ["ForecastRun FR-2204", "DEM, drenagem e batimetria", "Bombas, solo e reservatórios", "Maré, ondas e vento", "Vegetação, geologia e observações"],
    outputs: ["HazardSurface e HazardZone", "Intensity, arrival e duration", "HazardProbability e Evolution", "CompoundHazard", "HazardSignal HSIG-1032"],
    reports: ["Model Run Report", "Hazard Situation Report", "Flood Assessment", "Compound Event Assessment", "Model Performance Report"],
    charts: ["Hietograma e hidrograma", "Comparação P50 × P90", "Sensibilidade operacional", "Fator de segurança", "Skill e SLO"],
    external: ["ECMWF / Copernicus", "Terrain / LiDAR", "Sentinel-2 Land Cover", "VIIRS Hotspots · Living Atlas", "Maré, ondas e batimetria"],
    internal: ["M2 · Climate", "SCADA / Historian", "EAM / CMMS", "M4 · Gêmeo Operacional", "M6 · Planejamento"],
    agents: ["MODEL ORCHESTRATOR", "PRE-CONDITION", "QA", "INCONSISTENCY", "SENSITIVITY", "SCENARIO", "VALIDATION", "PUBLISHER"],
    jobs: [
      { id: "HMR-882", item: "Executar hidráulica 1D/2D · cenário P90", owner: "MODEL ORCHESTRATOR", due: "18:45", status: "QA aprovado", priority: "Crítica" },
      { id: "VAL-220", item: "Revisar condição inicial da bomba D04-03", owner: "Eng. Hídrica", due: "18:47", status: "Aguardando", priority: "Alta" },
      { id: "HS-882", item: "Publicar flood depth P50/P90", owner: "PUBLISHER", due: "18:48", status: "Pronto", priority: "Alta" },
    ],
  },
  {
    id: "04",
    key: "twin",
    code: "GO",
    icon: "◇",
    title: "Gêmeo Operacional",
    shortTitle: "Gêmeo Operacional",
    mission: "Representar ativos, processos, capacidades, sensores e dependências em uma referência espacial comum.",
    result: "Cockpit 360° de cada ativo com estado, limites, riscos, dependências, manutenção e evidências.",
    status: "3 ativos restritos",
    tone: "watch",
    badge: 3,
    metrics: makeMetrics(
      ["Ativos monitorados", "1.284", "+12", "97% georreferenciados", "ok"],
      ["Ativos críticos", "46", "3 restritos", "Atualização < 8 s", "watch"],
      ["Saúde média", "88,6%", "−1,8 pp", "Ponderada por criticidade", "watch"],
      ["Dependências sem N+1", "7", "+1", "Plano de ação ativo", "alert"],
    ),
    features: ["Mapa 2D e cena 3D", "Árvore de ativos", "Capacidade nominal/disponível", "Dependências e redundância", "Sensores e manutenção", "Vulnerabilidade por ameaça"],
    flow: ["Selecionar ativo", "Observar estado", "Verificar dependências", "Cruzar risco previsto", "Simular restrição", "Criar inspeção", "Liberar retorno"],
    forms: ["Cadastro de ativo", "Limite operacional", "Dependência", "Modo de falha", "Vistoria e liberação"],
    inputs: ["BIM / CAD / GIS", "EAM / CMMS", "SCADA / Historian", "Inspeções", "Documentos técnicos"],
    outputs: ["Estado e capacidade", "Mapa de vulnerabilidade", "Grafo de dependências", "Tarefas e ordens", "Histórico e evidências"],
    reports: ["Saúde de ativos críticos", "Exposição por ameaça", "Dependências sem redundância", "Indisponibilidades", "Inspeções pendentes"],
    charts: ["Sparklines de sensores", "Radar de saúde", "Pareto de falhas", "Árvore de dependências", "Calendário de manutenção"],
    external: ["Terrain 3D", "Ortoimagem", "LiDAR", "Cadastros públicos", "Living Atlas"],
    internal: ["EAM / CMMS", "SCADA / MES", "BIM / Engenharia", "Field Maps", "Survey123"],
    agents: ["GUARDIÃO Ativos", "NEXO Dependências", "CAMPO Vistorias"],
    jobs: [
      { id: "AST-D04", item: "Bomba drenagem D-04 em capacidade degradada", owner: "Manutenção", due: "13:40", status: "Derating 22%", priority: "Crítica" },
      { id: "INS-773", item: "Inspeção termográfica SE-03", owner: "Elétrica", due: "15:00", status: "Programada", priority: "Alta" },
      { id: "DEP-044", item: "Validar redundância telecom do berço 2", owner: "TI/OT", due: "16:30", status: "Em análise", priority: "Média" },
    ],
  },
  {
    id: "05",
    key: "chain",
    code: "CG",
    icon: "⇄",
    title: "Cadeia e Gargalos",
    shortTitle: "Cadeia",
    mission: "Modelar como restrições locais se propagam por produção, estoques, logística, contratos e entrega.",
    result: "Critical path, capacidade perdida, filas, demurrage, contrato afetado e contingência recomendada.",
    status: "1 gargalo crítico",
    tone: "alert",
    badge: 1,
    metrics: makeMetrics(
      ["Throughput projetado", "83,4%", "−7,1 pp", "Próximas 24h", "alert"],
      ["Estoque pulmão", "11,8 h", "−2,4 h", "Pátio norte", "watch"],
      ["Navios afetados", "2", "+1", "Berços 1 e 2", "alert"],
      ["Demurrage evitável", "R$ 1,9 mi", "+R$ 0,4 mi", "Com plano alternativo", "ok"],
    ),
    features: ["Grafo de processos", "Capacidade por nó e arco", "Estoques e buffers", "Filas ferroviárias e portuárias", "Contratos e prioridades", "Propagação de derating"],
    flow: ["Receber restrição", "Reduzir capacidade", "Recalcular balanço", "Identificar gargalo", "Propagar cascata", "Valorar impacto", "Recomendar contingência"],
    forms: ["Nó e arco", "Capacidade", "Estoque mínimo/máximo", "Regra de prioridade", "Contrato e override"],
    inputs: ["Produção e planos", "Capacidade e estoque", "Trens e navios", "Contratos e custos", "Tempos de ciclo"],
    outputs: ["Gargalos", "Toneladas em risco", "Atraso e fila", "Demurrage", "Ação recomendada"],
    reports: ["Mapa de gargalos", "Capacidade diária", "Risco de entrega", "Perdas evitadas", "Pós-evento da cadeia"],
    charts: ["Sankey de material", "Grafo causal", "Throughput", "Estoque projetado", "Gantt de trens/navios"],
    external: ["AIS", "Condição ferroviária", "Rodovias", "Janela marítima", "Fornecedores críticos"],
    internal: ["MES / APS", "TOS / Porto", "Ferrovia", "ERP / Comercial", "EAM"],
    agents: ["ATLAS Cascata", "GARGALO Detector", "CONTRATO Analista"],
    jobs: [
      { id: "CAS-511", item: "Recalcular cadeia com bomba D-04 degradada", owner: "ATLAS", due: "13:39", status: "Executando", priority: "Crítica" },
      { id: "NAV-203", item: "Reordenar janela dos navios B1/B2", owner: "Planejamento Porto", due: "14:20", status: "Alternativas geradas", priority: "Alta" },
      { id: "FER-088", item: "Reduzir chegada EFVM no bloco 18h", owner: "Logística", due: "15:00", status: "Aguardando aceite", priority: "Alta" },
    ],
  },
  {
    id: "06",
    key: "planning",
    code: "PC",
    icon: "⌁",
    title: "Planejamento e Cenários",
    shortTitle: "Planejamento",
    mission: "Transformar previsão e risco em planos adaptativos de operação, manutenção, logística e recursos.",
    result: "Três alternativas comparáveis e um plano executável com responsáveis, prazos e rastreabilidade.",
    status: "Plano v4 em revisão",
    tone: "info",
    badge: 1,
    metrics: makeMetrics(
      ["Plano recomendado", "Cenário B", "84/100", "Maior valor preservado", "ok"],
      ["Produção projetada", "128,6 kt", "+9,2 kt", "Vs. plano sem ação", "ok"],
      ["Risco residual", "Médio", "−2 níveis", "Após 7 medidas", "watch"],
      ["Recursos em conflito", "3", "−5", "Turnos e bombas", "watch"],
    ),
    features: ["Plano integrado 72h", "Cenários what-if", "Otimização multiobjetivo", "Reprogramação de manutenção", "Janelas porto/ferrovia", "Plano de adaptação"],
    flow: ["Carregar baseline", "Aplicar previsão", "Gerar alternativas", "Comparar trade-offs", "Aprovar plano", "Publicar agenda", "Monitorar aderência"],
    forms: ["Criação de cenário", "Premissas e restrições", "Meta de produção", "Plano de recursos", "Decisão e aprovação"],
    inputs: ["Previsões e perigos", "Capacidades", "Manutenção e recursos", "Estoques e contratos", "Custos e políticas"],
    outputs: ["Planos alternativos", "Plano aprovado", "Agenda e recursos", "Produção/custo/risco", "Alertas de desvio"],
    reports: ["Plano 72h", "Cenário recomendado", "Aderência ao plano", "Decisão × resultado", "Portfólio de adaptação"],
    charts: ["Gantt operacional", "Risco × custo", "Tornado de sensibilidade", "Comparação de cenários", "Curva de estoque"],
    external: ["Forecast marítimo", "Restrições viárias", "Concessionárias", "Cenários climáticos"],
    internal: ["APS / MES", "EAM", "Workforce", "ERP", "Workflow Manager"],
    agents: ["PRISMA Planejador", "ÓTIMO Simulador", "ADERÊNCIA Monitor"],
    jobs: [
      { id: "SCN-B04", item: "Revisar cenário B · antecipação + drenagem", owner: "Planejamento", due: "13:50", status: "84/100", priority: "Crítica" },
      { id: "APR-921", item: "Aprovar plano 72h v4", owner: "Gerência Operacional", due: "14:10", status: "Aguardando", priority: "Alta" },
      { id: "RES-287", item: "Reservar equipe de drenagem adicional", owner: "Workforce", due: "14:25", status: "Pré-reservada", priority: "Alta" },
    ],
  },
  {
    id: "07",
    key: "risk",
    code: "RF",
    icon: "▥",
    title: "Riscos e Finanças",
    shortTitle: "Riscos & Finanças",
    mission: "Consolidar riscos físicos, de transição, ambientais e sociais em impactos operacionais e financeiros.",
    result: "Perdas esperadas, EBITDA/caixa em risco, cobertura, retorno de adaptação e risco residual.",
    status: "Stress test ativo",
    tone: "watch",
    metrics: makeMetrics(
      ["Perda bruta P90", "R$ 12,4 mi", "+R$ 2,1 mi", "Evento composto", "alert"],
      ["Perda líquida", "R$ 8,7 mi", "+R$ 1,3 mi", "Após seguro", "alert"],
      ["Mitigação potencial", "R$ 5,2 mi", "+11%", "7 medidas", "ok"],
      ["Risco residual", "R$ 3,5 mi", "−40%", "Plano recomendado", "watch"],
    ),
    features: ["Taxonomia integrada", "NGFS e CMIP6", "Funções de dano", "Stress tests", "Seguro e cobertura", "CAPEX de adaptação"],
    flow: ["Selecionar cenário", "Definir exposição", "Executar propagação", "Valorar impacto", "Aplicar mitigação/seguro", "Comparar residual", "Recomendar investimento"],
    forms: ["Registro de risco", "Stress test", "Função de dano", "Cobertura de seguro", "Medida de adaptação"],
    inputs: ["Perigos e ativos", "Cadeia operacional", "Finanças e contratos", "Seguros", "NGFS e CMIP6"],
    outputs: ["VaR climático", "Perda esperada", "EBITDA/caixa em risco", "Gap de cobertura", "Retorno de adaptação"],
    reports: ["Stress test", "Risco físico e transição", "Adaptação", "Seguro", "Materialidade executiva"],
    charts: ["Waterfall de EBITDA", "Matriz de risco", "Fan chart", "Curva de excedência", "Tornado de premissas"],
    external: ["NGFS", "CMIP6 / IPCC", "Dados macroeconômicos", "Preço de carbono", "Mercados"],
    internal: ["ERP / FP&A", "ERM", "Seguros", "Contratos", "Sustentabilidade"],
    agents: ["VALOR Financeiro", "STRESS Analista", "ADAPTA Recomendador"],
    jobs: [
      { id: "STR-044", item: "Recalcular P90 com cenário hidráulico v3.8", owner: "VALOR", due: "13:48", status: "Executando", priority: "Crítica" },
      { id: "SEG-182", item: "Validar franquia e cobertura de interrupção", owner: "Seguros", due: "15:00", status: "Em análise", priority: "Alta" },
      { id: "CAP-033", item: "Atualizar benefício do CAPEX drenagem", owner: "Riscos", due: "16:00", status: "Pendente", priority: "Média" },
    ],
  },
  {
    id: "08",
    key: "emergency",
    code: "EC",
    icon: "!",
    title: "Emergência e Continuidade",
    shortTitle: "Emergência",
    mission: "Gerenciar preparação, alerta, comando de incidente, resposta, continuidade, retomada e recuperação.",
    result: "Incidente comandado no mapa, equipes despachadas, SITREP, inspeção, liberação e lições aprendidas.",
    status: "Pré-incidente",
    tone: "alert",
    badge: 5,
    metrics: makeMetrics(
      ["Nível de ativação", "N2", "+1 nível", "Pré-incidente", "alert"],
      ["Equipes prontas", "6 / 7", "+2", "1 em deslocamento", "watch"],
      ["Tarefas no prazo", "92%", "+4 pp", "Últimos 60 min", "ok"],
      ["Tempo de resposta", "08:42", "−02:18", "Mediana por despacho", "ok"],
    ),
    features: ["Planos por ameaça", "Comando de incidente", "Mapa operacional comum", "Equipes e recursos", "Tarefas e checklists", "Recuperação segura"],
    flow: ["Exceder limiar", "Validar e ativar", "Abrir incidente", "Montar comando", "Despachar", "Controlar execução", "Inspecionar e recuperar", "Encerrar e aprender"],
    forms: ["Abertura de incidente", "SITREP", "Tarefa e recurso", "Ocorrência e dano", "Vistoria e liberação"],
    inputs: ["Alertas e mapas", "Pessoas e recursos", "Planos e contatos", "Dados de campo", "Ativos, vias e serviços"],
    outputs: ["Plano de ação", "Mapa operacional", "Tarefas e mensagens", "Status de recursos", "Relatório final"],
    reports: ["SITREP", "Cronologia", "Desempenho de resposta", "Danos e recuperação", "After Action Review"],
    charts: ["Timeline do incidente", "Tarefas por status", "SLA", "Recursos", "Curva de recuperação"],
    external: ["Defesa Civil", "Bombeiros", "Concessionárias", "Trânsito", "Saúde"],
    internal: ["ArcGIS Mission", "Workflow Manager", "Field Maps", "Survey123", "RH / HSE"],
    agents: ["AURORA Incidente", "PULSO Despachante", "CAMPO Vistoria", "RECUPERA Retomada"],
    jobs: [
      { id: "INC-2026-17", item: "Preparar comando N2 · chuva e drenagem", owner: "HSE", due: "13:35", status: "Ativo", priority: "Crítica" },
      { id: "DSP-556", item: "Posicionar bomba móvel no setor norte", owner: "Brigada 03", due: "13:55", status: "Confirmado", priority: "Crítica" },
      { id: "COM-410", item: "Validar canais e contatos externos", owner: "Comunicação", due: "14:00", status: "88% confirmado", priority: "Alta" },
    ],
  },
  {
    id: "09",
    key: "environment",
    code: "AS",
    icon: "⌾",
    title: "Ambiente, Sociedade e Entorno",
    shortTitle: "Ambiente & Entorno",
    mission: "Integrar riscos ambientais e sociais da unidade ao comportamento do território e das comunidades do entorno.",
    result: "Área de influência, receptores, vulnerabilidade, ação, comunicação e evidência de conclusão.",
    status: "Monitoramento",
    tone: "info",
    metrics: makeMetrics(
      ["Receptores expostos", "14", "+3", "P90 hidráulico", "watch"],
      ["Serviços essenciais", "4", "+1", "Na área de influência", "alert"],
      ["Índice ambiental", "82 / 100", "−3", "Água e sedimentos", "watch"],
      ["Compromissos no prazo", "96%", "+2 pp", "Últimos 30 dias", "ok"],
    ),
    features: ["Água e efluentes", "Ar, poeira e fumaça", "Fogo e vegetação", "Costa e áreas sensíveis", "Vulnerabilidade social", "Ocorrências e condicionantes"],
    flow: ["Detectar pressão", "Modelar influência", "Identificar receptores", "Avaliar impacto", "Acionar controle", "Comunicar", "Monitorar evidência"],
    forms: ["Ocorrência socioambiental", "Amostragem", "Receptor e comunidade", "Condicionante", "Manifestação e devolutiva"],
    inputs: ["Sensores ambientais", "Satélite", "Cadastros territoriais", "Comunidades e serviços", "Qualidade de água/ar"],
    outputs: ["Mapa de impacto", "Públicos expostos", "Ações e comunicação", "Obrigações", "Risco residual"],
    reports: ["Qualidade ambiental", "Impacto territorial", "Comunidades", "Fogo e água", "Prestação de contas"],
    charts: ["Séries de qualidade", "Rosa de poluição", "Mapa de receptores", "Indicadores sociais", "Cumprimento de compromissos"],
    external: ["IEMA", "ANA", "INPE / VIIRS", "Defesa Civil", "Dados municipais"],
    internal: ["LIMS Ambiental", "CRM Comunitário", "HSE", "Jurídico", "Comunicação"],
    agents: ["TERRITÓRIO Analista", "RECEPTOR Detector", "COMPROMISSO Guardião"],
    jobs: [
      { id: "AMB-338", item: "Cruzar mancha P90 com serviços essenciais", owner: "TERRITÓRIO", due: "13:46", status: "Executando", priority: "Alta" },
      { id: "COM-222", item: "Validar escolas e unidades de saúde", owner: "Relações Institucionais", due: "14:20", status: "Em revisão", priority: "Alta" },
      { id: "MON-901", item: "Programar amostragem pós-evento", owner: "Meio Ambiente", due: "17:00", status: "Planejada", priority: "Média" },
    ],
  },
  {
    id: "10",
    key: "communications",
    code: "CA",
    icon: "))",
    title: "Comunicação e Alertas",
    shortTitle: "Comunicação",
    mission: "Garantir alertas consistentes, geográficos, compreensíveis, acionáveis e coordenados com autoridades.",
    result: "Mensagem por público, canal e área, com autoridade emissora, entrega, confirmação e devolutiva.",
    status: "2 rascunhos",
    tone: "watch",
    badge: 2,
    metrics: makeMetrics(
      ["Cobertura planejada", "98,4%", "+1,2 pp", "Públicos prioritários", "ok"],
      ["Contatos confirmados", "88%", "+6 pp", "Autoridades e parceiros", "watch"],
      ["Tempo estimado envio", "01:24", "−00:18", "Multicanal", "ok"],
      ["Conflitos de mensagem", "0", "−2", "Checagem concluída", "ok"],
    ),
    features: ["Alertas por impacto", "Templates CAP", "Gestão de públicos", "Orquestração multicanal", "Confirmação e escalonamento", "Prestação de contas"],
    flow: ["Receber impacto", "Definir público", "Selecionar template", "Validar autoridade", "Distribuir", "Confirmar", "Atualizar e encerrar"],
    forms: ["Criação de alerta", "Template por público", "Contato e instituição", "Confirmação", "Registro de ocorrência"],
    inputs: ["Impacto e área", "Severidade e certeza", "Cadastros territoriais", "Protocolos", "Status de entrega"],
    outputs: ["Mensagem CAP", "Mapa de alcance", "Lista de destinatários", "Escalonamentos", "Boletim público"],
    reports: ["Cobertura e entrega", "Confirmação por canal", "Falhas de contato", "Simulados", "Dúvidas recorrentes"],
    charts: ["Funil enviado–confirmado", "Timeline de mensagens", "Heatmap de canais", "Mapa de alcance", "Ocorrências recebidas"],
    external: ["Defesa Civil", "Prefeituras", "Saúde e segurança", "Mídia e SMS", "Concessionárias"],
    internal: ["Teams / E-mail", "CRM / Contatos", "HSE", "Jurídico", "Workflow Manager"],
    agents: ["VOZ Comunicador", "PÚBLICO Adequação", "CONFIRMA Escalonamento"],
    jobs: [
      { id: "ALT-118", item: "Mensagem preventiva · drenagem e acessos", owner: "VOZ", due: "13:50", status: "Aguardando autoridade", priority: "Crítica" },
      { id: "PUB-032", item: "Confirmar pontos focais municipais", owner: "Relações Institucionais", due: "14:00", status: "88% concluído", priority: "Alta" },
      { id: "TMP-077", item: "Atualizar Q&A para chuva extrema", owner: "Comunicação", due: "15:30", status: "Em revisão", priority: "Média" },
    ],
  },
  {
    id: "11",
    key: "data",
    code: "DQ",
    icon: "∷",
    title: "Dados, Devices e Qualidade",
    shortTitle: "Dados & Devices",
    mission: "Operar a infraestrutura observacional e de integração com cobertura, confiança, baixa latência e modo degradado.",
    result: "Feeds georreferenciados, score de confiança, SLA, qualidade, incidentes e evidência de manutenção.",
    status: "1 feed degradado",
    tone: "watch",
    badge: 1,
    metrics: makeMetrics(
      ["Fontes ativas", "146 / 148", "−2", "99,2% disponibilidade", "watch"],
      ["Latência P95", "4,8 s", "+1,1 s", "Meta < 5 s", "watch"],
      ["Qualidade média", "96,7%", "+0,8 pp", "Regras espaciais", "ok"],
      ["Sensores em drift", "6", "−3", "De 1.284 devices", "watch"],
    ),
    features: ["Catálogo de devices", "Ingestão IoT", "Qualidade em tempo real", "Cobertura e redundância", "Data products e linhagem", "Store-and-forward"],
    flow: ["Cadastrar fonte", "Configurar conexão", "Validar esquema/local", "Publicar feed", "Monitorar qualidade", "Abrir incidente", "Reconciliar"],
    forms: ["Sensor/device", "Fonte e integração", "Regra de qualidade", "Calibração", "Data product e incidente"],
    inputs: ["MQTT / OPC-UA", "APIs e arquivos", "SCADA / Historian", "Satélite", "Serviços externos"],
    outputs: ["Feeds e layers", "Score de confiança", "Alertas de qualidade", "Catálogo", "SLA e evidências"],
    reports: ["Disponibilidade", "Latência e cobertura", "Qualidade", "Calibração", "Consumo de APIs"],
    charts: ["Uptime", "Latência", "Completude", "Mapa de cobertura", "Sensor drift"],
    external: ["APIs meteorológicas", "Living Atlas", "IoT parceiros", "Dados públicos", "Satélite"],
    internal: ["ArcGIS Velocity", "Lakehouse", "Broker MQTT", "SCADA", "ITSM / Observabilidade"],
    agents: ["GUARDIÃO Dados", "DRIFT Detector", "RECONCILIA Espacial"],
    jobs: [
      { id: "DAT-901", item: "Reconciliar sensor PLU-044 congelado", owner: "GUARDIÃO", due: "13:42", status: "Modo degradado", priority: "Crítica" },
      { id: "MNT-388", item: "Despachar manutenção na estação MET-03", owner: "TI/OT", due: "14:15", status: "Atribuída", priority: "Alta" },
      { id: "API-109", item: "Renovar cache do serviço costeiro", owner: "Integrações", due: "15:00", status: "Programado", priority: "Média" },
    ],
  },
  {
    id: "12",
    key: "governance",
    code: "GA",
    icon: "§",
    title: "Governança e Auditoria",
    shortTitle: "Governança",
    mission: "Controlar versões, responsabilidades, modelos, limiares, decisões, evidências, acessos e mudanças.",
    result: "Toda recomendação e decisão reproduzível por dados, versão, responsável, horário e evidência.",
    status: "2 pendências",
    tone: "watch",
    badge: 2,
    metrics: makeMetrics(
      ["Modelos vigentes", "37 / 39", "+1", "2 em validação", "watch"],
      ["Limiar sem revisão", "2", "−3", "Vencem em 14 dias", "watch"],
      ["Evidências completas", "97,8%", "+1,4 pp", "Eventos últimos 30d", "ok"],
      ["Exceções abertas", "4", "−2", "1 alta criticidade", "alert"],
    ),
    features: ["Model registry", "Threshold registry", "Evidence ledger", "Controle de mudança", "Segregação de acesso", "Monitoramento de drift"],
    flow: ["Cadastrar artefato", "Validar técnico/operacional", "Aprovar", "Publicar versão", "Monitorar uso", "Abrir mudança", "Revisar e retirar"],
    forms: ["Ficha de modelo", "Limiar", "Mudança", "Aprovação e exceção", "Evidência e revisão"],
    inputs: ["Modelos e parâmetros", "Dados e regras", "Decisões e logs", "Usuários", "Documentos"],
    outputs: ["Versão vigente", "Trilha de auditoria", "Pacote de evidências", "Alerta de drift", "Plano de ação"],
    reports: ["Inventário", "Modelos vencidos", "Limiar sem validação", "Mudanças e acessos", "Auditoria de evento"],
    charts: ["Status por estágio", "Aging", "Drift", "Cobertura de validação", "Heatmap de acesso"],
    external: ["IPCC / WMO", "Normas ISO", "Referenciais Esri", "Regulação", "Academia"],
    internal: ["IAM / SIEM", "GRC", "MLOps", "Documentos", "Todos os workspaces"],
    agents: ["LEDGER Evidências", "POLÍTICA Limiares", "CONFORME Auditor"],
    jobs: [
      { id: "GOV-442", item: "Aprovar modelo HIDRO-2D v3.8", owner: "Comitê de Modelos", due: "14:00", status: "Revisão independente", priority: "Crítica" },
      { id: "THR-091", item: "Revalidar limiar D-04 de extravasamento", owner: "Engenharia", due: "Amanhã", status: "Evidência pendente", priority: "Alta" },
      { id: "EVD-718", item: "Completar cadeia de custódia INS-771", owner: "LEDGER", due: "15:00", status: "1 anexo ausente", priority: "Média" },
    ],
  },
  {
    id: "13",
    key: "admin",
    code: "AD",
    icon: "⚙",
    title: "Administração e Demonstração",
    shortTitle: "Administração",
    mission: "Configurar perfis, catálogos, templates, cenários e recursos necessários à operação e à demonstração.",
    result: "Ambiente reproduzível, seed determinística, feature flags, logs e sessão exportável.",
    status: "Cenário 04",
    tone: "info",
    metrics: makeMetrics(
      ["Cenários disponíveis", "12", "+2", "4 executivos", "ok"],
      ["Perfis ativos", "10", "0", "RBAC demonstrativo", "ok"],
      ["Cobertura funcional", "86%", "+9 pp", "Rotas prioritárias", "ok"],
      ["Erros de sessão", "0", "−3", "Últimas 10 execuções", "ok"],
    ),
    features: ["Perfis e permissões", "Menus e templates", "Scenario engine", "Relógio acelerado", "Seed e reset", "Feature flags e logs"],
    flow: ["Selecionar cenário", "Carregar seed", "Escolher perfil", "Iniciar relógio", "Executar gatilhos", "Demonstrar", "Exportar e resetar"],
    forms: ["Usuário e grupo", "Cenário", "Evento programado", "Template", "Integração e feature flag"],
    inputs: ["JSON / GeoJSON", "Configuração", "Catálogo de cenários", "Usuários demo", "Portal items"],
    outputs: ["Sessão reproduzível", "Logs", "Exportação de eventos", "Configuração versionada", "Feedback"],
    reports: ["Uso do mockup", "Roteiro executado", "Erros", "Performance", "Cobertura de funcionalidades"],
    charts: ["Eventos por cenário", "Tempo por tela", "Erros", "Funcionalidades usadas", "Performance"],
    external: ["ArcGIS Online", "Living Atlas", "CDN Esri", "Serviços demo"],
    internal: ["Frontend", "Scenario Engine", "Local storage", "Telemetria de aplicação", "Feature flags"],
    agents: ["NARRA Demonstração", "SEED Gerador", "CONFIG Validador"],
    jobs: [
      { id: "DEM-004", item: "Cenário chuva extrema · seed 2417", owner: "Scenario Engine", due: "Ativo", status: "Marco T−12h", priority: "Alta" },
      { id: "CFG-118", item: "Validar fallback das camadas externas", owner: "CONFIG", due: "14:30", status: "Em execução", priority: "Média" },
      { id: "UX-207", item: "Consolidar feedback da sessão executiva", owner: "Produto", due: "17:00", status: "Aberto", priority: "Média" },
    ],
  },
];

const agents: Agent[] = [
  { name: "Orquestrador Operacional", codename: "AURORA", role: "Mantém contexto e coordena agentes especializados.", trigger: "Novo evento, alerta ou mudança material", actions: "Abre contexto, consolida plano, monitora dependências e escala pendências.", control: "Decisões críticas exigem aprovação humana.", status: "Executando" },
  { name: "Meteorologista Assistente", codename: "NIMBUS", role: "Interpreta a nova rodada e sua utilidade operacional.", trigger: "Nova rodada ou mudança de ensemble", actions: "Compara modelos, skill, anomalias, confiança e efeitos locais; gera briefing.", control: "Validação por especialista em meteorologia.", status: "Monitorando" },
  { name: "Orquestrador de Modelos", codename: "HYDRA", role: "Executa pipelines físicos versionados.", trigger: "Gatilho, agenda ou solicitação de cenário", actions: "Valida pré-condições, executa modelos, monitora qualidade e publica resultados.", control: "Publicação crítica sujeita a aceite técnico.", status: "Executando" },
  { name: "Analista de Cascata", codename: "ATLAS", role: "Propaga restrições pela cadeia de valor.", trigger: "Perda de capacidade em ativo ou processo", actions: "Recalcula capacidade, estoque, fila, contrato, custo e critical path.", control: "Simulação automática; alteração de plano é humana.", status: "Executando" },
  { name: "Planejador Operacional", codename: "PRISMA", role: "Gera alternativas e trade-offs executáveis.", trigger: "Risco acima da tolerância ou desvio do plano", actions: "Compara segurança, produção, custo, recursos e risco residual.", control: "Publicação do plano conforme alçada.", status: "Aguardando aprovação" },
  { name: "Despachante de Processos", codename: "PULSO", role: "Transforma decisão em tarefas rastreáveis.", trigger: "Decisão aprovada ou protocolo ativado", actions: "Cria jobs, atribui responsáveis, define SLA, envia avisos e escala atrasos.", control: "Alta autonomia dentro de protocolos aprovados.", status: "Monitorando" },
  { name: "Agente de Vistoria", codename: "CAMPO", role: "Prepara inspeção e liberação segura.", trigger: "Alerta, incidente ou requisito de retorno", actions: "Seleciona mapa, roteiro, formulário, checklist e evidências obrigatórias.", control: "Pode recusar formulário incompleto; liberação é humana.", status: "Executando" },
  { name: "Analista de Inconsistências", codename: "SENTINELA", role: "Confronta dados, modelos, campo e sistemas.", trigger: "Conflito, drift ou valor fisicamente improvável", actions: "Classifica causa provável, prioriza fonte, solicita evidência e encaminha correção.", control: "Não altera registro oficial sem aprovação.", status: "Monitorando" },
  { name: "Analista Financeiro", codename: "VALOR", role: "Converte impacto em produção, custos e caixa.", trigger: "Cenário novo ou perda operacional", actions: "Calcula toneladas, receita, demurrage, seguro, caixa e benefício de mitigação.", control: "Premissas e aprovação rastreadas por finanças.", status: "Executando" },
  { name: "Auditor de Evidências", codename: "LEDGER", role: "Garante completude da cadeia de custódia.", trigger: "Conclusão de tarefa, evento ou decisão", actions: "Confere quem, quando, onde, anexos, versão, aprovação e lacunas.", control: "Pode bloquear encerramento sem evidência mínima.", status: "Monitorando" },
];

const scenarioStages = [
  { label: "Normal", time: "T+00", note: "Capacidade 97%", tone: "ok" as Tone },
  { label: "Nova previsão", time: "T+10", note: "ECMWF 12Z processado", tone: "info" as Tone },
  { label: "Mudança", time: "T+20", note: "AURORA detecta materialidade", tone: "info" as Tone },
  { label: "Modelo", time: "T+25", note: "H2D v4.3 em execução", tone: "watch" as Tone },
  { label: "Impacto", time: "T+35", note: "D-04 e C17 expostos", tone: "watch" as Tone },
  { label: "Sinal", time: "T+40", note: "S-482 publicado", tone: "watch" as Tone },
  { label: "Alerta", time: "T+50", note: "AL-0187 em análise", tone: "alert" as Tone },
  { label: "Decisão", time: "T+60", note: "DEC-0248 criada", tone: "alert" as Tone },
  { label: "Despacho", time: "T+70", note: "WF-CTRL-02 iniciado", tone: "info" as Tone },
  { label: "Campo", time: "T+85", note: "Equipe aceita vistoria", tone: "info" as Tone },
  { label: "Sensor", time: "T+90", note: "Nível aumenta 14 cm", tone: "alert" as Tone },
  { label: "Alagamento", time: "T+105", note: "Geofence confirmado", tone: "critical" as Tone },
  { label: "Restrição", time: "T+110", note: "C17 opera a 82%", tone: "critical" as Tone },
  { label: "Reotimização", time: "T+125", note: "Plano recalculado", tone: "watch" as Tone },
  { label: "Mitigação", time: "T+140", note: "BM-07 estabiliza nível", tone: "info" as Tone },
  { label: "Recuperação", time: "T+160", note: "Vistoria e retomada", tone: "ok" as Tone },
  { label: "Resultado", time: "T+170", note: "R$ 7,3 mi preservados", tone: "ok" as Tone },
  { label: "Encerramento", time: "T+180", note: "Briefing automático", tone: "ok" as Tone },
];

const climateScenarioStages = [
  { label: "ECMWF 00Z", time: "T+00", note: "P50 48 mm · sem sinal", tone: "ok" as Tone },
  { label: "Radar", time: "T+10", note: "Célula C-028 detectada", tone: "info" as Tone },
  { label: "Observações", time: "T+20", note: "Pressão ↓ · umidade ↑", tone: "watch" as Tone },
  { label: "ECMWF 12Z", time: "T+30", note: "P50 sobe para 73 mm", tone: "alert" as Tone },
  { label: "Ensemble", time: "T+35", note: "Spread reduz · P90 104", tone: "watch" as Tone },
  { label: "Extremo", time: "T+40", note: "EFI 0,86 · SOT 1,20", tone: "critical" as Tone },
  { label: "Mudança", time: "T+42", note: "+52% classificado material", tone: "alert" as Tone },
  { label: "ClimateSignal", time: "T+45", note: "CS-204 · 82%", tone: "alert" as Tone },
  { label: "Torre", time: "T+50", note: "Sinal entregue ao M1", tone: "info" as Tone },
  { label: "Perigos", time: "T+60", note: "FR-2204 dispara modelo", tone: "watch" as Tone },
];

const baseFeed: FeedItem[] = [
  { id: 1, time: "13:31:48", agent: "HYDRA", text: "Run hidráulico P90 atingiu 82%; sem falhas numéricas.", type: "info" },
  { id: 2, time: "13:30:16", agent: "SENTINELA", text: "PLU-044 congelado. Série reconciliada com MET-03; confiança 0,86.", type: "watch" },
  { id: 3, time: "13:28:40", agent: "ATLAS", text: "Derating da bomba D-04 desloca gargalo para recebimento às 18h20.", type: "alert" },
  { id: 4, time: "13:26:09", agent: "PRISMA", text: "Cenário B preserva 9,2 kt e reduz risco residual em dois níveis.", type: "ok" },
  { id: 5, time: "13:24:52", agent: "AURORA", text: "Decisão DEC-284 preparada e encaminhada à Sala de Controle.", type: "info" },
];

const climateBaseFeed: FeedItem[] = [
  { id: 201, time: "18:41:15", agent: "PUBLISHER", text: "ClimateSignal CS-204 validado para publicação.", type: "watch" },
  { id: 202, time: "18:41:13", agent: "CLIMATE ORCHESTRATOR", text: "Mudança 00Z → 12Z classificada como material.", type: "alert" },
  { id: 203, time: "18:41:10", agent: "ANOMALY", text: "EFI 0,86 e SOT 1,20 detectados para precipitação.", type: "critical" },
  { id: 204, time: "18:41:07", agent: "ENSEMBLE", text: "51 membros processados; spread reduziu 21%.", type: "info" },
  { id: 205, time: "18:41:04", agent: "DATA", text: "ECMWF 12Z completo e QA aprovado em 98%.", type: "ok" },
];

const hazardInitialFeed: FeedItem[] = hazardBaseFeed.map((item, index) => ({
  id: 301 + index,
  time: ["18:45:25", "18:45:21", "18:45:02", "18:44:07", "18:44:04"][index],
  ...item,
}));

const scenarioFeed: Record<number, { agent: string; text: string; type: Tone }> = {
  1: { agent: "NIMBUS", text: "ECMWF 12Z recebido; chuva prevista passou de 48 para 73 mm.", type: "info" },
  2: { agent: "AURORA", text: "Mudança material detectada em D-04, Pátio Norte e C17.", type: "info" },
  3: { agent: "HYDRA", text: "Pré-check aprovado; H2D v4.3 iniciado com maré elevada.", type: "watch" },
  4: { agent: "ATLAS", text: "Impacto IA-0041: 7 ativos e 3 processos dependentes expostos.", type: "watch" },
  5: { agent: "AURORA", text: "Sinal S-482 publicado com relevância alta e contexto espacial.", type: "watch" },
  6: { agent: "SENTINELA", text: "AL-0187 preparado; redundância NIV-D04-02 validada.", type: "alert" },
  7: { agent: "PRISMA", text: "DEC-0248 criada com três alternativas e trade-offs.", type: "alert" },
  8: { agent: "PULSO", text: "WF-CTRL-02 iniciado: 4 jobs, 3 equipes e SLA crítico.", type: "info" },
  9: { agent: "CAMPO", text: "HSE-02 aceitou VS-204 e iniciou navegação ao acesso norte.", type: "info" },
  10: { agent: "SENTINELA", text: "Nível D-04 subiu 14 cm; confiança reduzida para 68%.", type: "alert" },
  11: { agent: "AURORA", text: "Geofence de alagamento confirmado; modo incidente N2 ativado.", type: "critical" },
  12: { agent: "ATLAS", text: "C17 restrita a 82%; Usina 3 e MV Atlas recalculados.", type: "critical" },
  13: { agent: "PRISMA", text: "Plano reotimizado preserva 9,2 kt e reduz demurrage.", type: "watch" },
  14: { agent: "PULSO", text: "BM-07 operacional; nível estabilizado por 18 minutos.", type: "info" },
  15: { agent: "CAMPO", text: "Vistoria aprovada; sequência de retomada liberada pelo gestor.", type: "ok" },
  16: { agent: "VALOR", text: "Resultado: R$ 8,4 mi potencial, R$ 1,1 mi realizado, R$ 7,3 mi preservado.", type: "ok" },
  17: { agent: "LEDGER", text: "Briefing e cadeia de evidências encerrados sem pendências.", type: "ok" },
};

const climateScenarioFeed: Record<number, { agent: string; text: string; type: Tone }> = {
  1: { agent: "NOWCAST", text: "Radar detectou C-028; ETA inicial para Tubarão em 1h34.", type: "info" },
  2: { agent: "OBSERVATION QA", text: "Estações registram queda de pressão, umidade e vento em elevação.", type: "watch" },
  3: { agent: "DATA", text: "ECMWF 12Z publicado: P50 alterado de 48 para 73 mm.", type: "alert" },
  4: { agent: "ENSEMBLE", text: "P90 104 mm; probabilidade >50 mm em 76% dos membros.", type: "watch" },
  5: { agent: "ANOMALY", text: "EFI 0,86 e SOT 1,20 indicam condição extrema no M-climate.", type: "critical" },
  6: { agent: "RUN COMPARATOR", text: "Mudança de +52%, pico 2 h mais cedo e núcleo 11 km a oeste.", type: "alert" },
  7: { agent: "METEOROLOGISTA", text: "ClimateSignal CS-204 gerado com probabilidade 82% e confiança 81%.", type: "alert" },
  8: { agent: "PUBLISHER", text: "CS-204 enviado pelo Event Bus à Torre de Controle.", type: "info" },
  9: { agent: "ORCHESTRATOR", text: "Forecast Run FR-2204 encaminhado ao módulo de Perigos.", type: "watch" },
};

function ArcGISMap({
  activeWorkspace,
  layerVisibility,
  onMapStatus,
  onAssetSelect,
}: {
  activeWorkspace: Workspace;
  layerVisibility: Record<string, boolean>;
  onMapStatus: (value: string) => void;
  onAssetSelect?: (assetId: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<Record<string, any>>({});
  const mapElementRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    let retry = 0;
    let clickHandle: { remove?: () => void } | null = null;

    const setup = async () => {
      if (cancelled || !containerRef.current) return;
      const arcgis = (window as any).$arcgis;
      const mapDefined = customElements.get("arcgis-map");
      if (!arcgis || !mapDefined) {
        retry += 1;
        if (retry < 80) window.setTimeout(setup, 250);
        else onMapStatus("Fallback geoespacial ativo");
        return;
      }

      containerRef.current.innerHTML = "";
      const mapEl = document.createElement("arcgis-map") as any;
      mapEl.setAttribute("basemap", "dark-gray-vector");
      mapEl.setAttribute("center", "-40.252,-20.285");
      mapEl.setAttribute("zoom", "14");
      mapEl.setAttribute("attribution-mode", "dark");
      mapEl.className = "arcgis-live-map";

      const zoom = document.createElement("arcgis-zoom");
      zoom.setAttribute("slot", "top-left");
      const compass = document.createElement("arcgis-compass");
      compass.setAttribute("slot", "top-left");
      const basemap = document.createElement("arcgis-basemap-toggle");
      basemap.setAttribute("slot", "bottom-right");
      basemap.setAttribute("next-basemap", "satellite");
      mapEl.append(zoom, compass, basemap);
      containerRef.current.appendChild(mapEl);
      mapElementRef.current = mapEl;

      mapEl.addEventListener(
        "arcgisViewReadyChange",
        async () => {
          if (cancelled) return;
          try {
            const [GraphicsLayer, Graphic, FeatureLayer, ImageryLayer] = await arcgis.import([
              "@arcgis/core/layers/GraphicsLayer.js",
              "@arcgis/core/Graphic.js",
              "@arcgis/core/layers/FeatureLayer.js",
              "@arcgis/core/layers/ImageryLayer.js",
            ]);

            const assetLayer = new GraphicsLayer({ title: "Ativos críticos · Vale" });
            const riskLayer = new GraphicsLayer({ title: "Impacto simulado P90" });
            const assets = [
              { id: "MV-ATLAS", name: "Terminal Marítimo · Berço 2", x: -40.242, y: -20.282, state: "Atenção", capacity: "Janela +3h20", color: [242, 164, 61, 1] },
              { id: "PATIO-N", name: "Pátio Norte", x: -40.252, y: -20.279, state: "Vigilância", capacity: "91%", color: [242, 164, 61, 1] },
              { id: "PEL-03", name: "Usina 3", x: -40.261, y: -20.276, state: "Normal", capacity: "92%", color: [48, 203, 169, 1] },
              { id: "D04", name: "Drenagem D-04", x: -40.250, y: -20.288, state: "Restrita", capacity: "2,3 m³/s", color: [239, 105, 93, 1] },
              { id: "SE-04", name: "Subestação SE-04", x: -40.247, y: -20.286, state: "Atenção", capacity: "Carga 83%", color: [242, 164, 61, 1] },
              { id: "CONV-C17", name: "Correia C17", x: -40.255, y: -20.284, state: "Atenção", capacity: "2.300 t/h", color: [242, 164, 61, 1] },
            ];

            assets.forEach((asset) => {
              assetLayer.add(
                new Graphic({
                  geometry: { type: "point", longitude: asset.x, latitude: asset.y },
                  symbol: {
                    type: "simple-marker",
                    style: "diamond",
                    color: asset.color,
                    size: 11,
                    outline: { color: [255, 255, 255, 0.95], width: 1.4 },
                  },
                  attributes: { AssetId: asset.id, Nome: asset.name, Estado: asset.state, Capacidade: asset.capacity, Workspace: activeWorkspace.title },
                  popupTemplate: {
                    title: "{Nome}",
                    content: [{ type: "fields", fieldInfos: [{ fieldName: "Estado" }, { fieldName: "Capacidade" }, { fieldName: "Workspace" }] }],
                  },
                }),
              );
            });

            riskLayer.add(
              new Graphic({
                geometry: {
                  type: "polygon",
                  rings: [[
                    [-40.259, -20.292], [-40.251, -20.294], [-40.244, -20.290],
                    [-40.246, -20.284], [-40.254, -20.282], [-40.261, -20.286], [-40.259, -20.292],
                  ]],
                },
                symbol: {
                  type: "simple-fill",
                  color: [239, 105, 93, 0.19],
                  outline: { color: [239, 105, 93, 0.9], width: 1.5, style: "dash" },
                },
                attributes: { Cenário: "Chuva P90 + maré elevada", Probabilidade: "72%" },
                popupTemplate: { title: "Impacto simulado P90", content: "Probabilidade: {Probabilidade}<br/>Cenário: {Cenário}" },
              }),
            );

            const viirs = new FeatureLayer({
              portalItem: { id: "dece90af1a0242dcbf0ca36d30276aa3" },
              title: "VIIRS Thermal Hotspots · Living Atlas",
              visible: layerVisibility.viirs,
              opacity: 0.85,
            });
            const landCover = new ImageryLayer({
              url: "https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer",
              title: "Sentinel-2 Land Cover 10 m · Living Atlas",
              visible: layerVisibility.landCover,
              opacity: 0.5,
            });

            assetLayer.visible = layerVisibility.assets;
            riskLayer.visible = layerVisibility.risk;
            layerRefs.current = { assets: assetLayer, risk: riskLayer, viirs, landCover };
            mapEl.map.addMany([landCover, viirs, riskLayer, assetLayer]);

            if (mapEl.view?.on && onAssetSelect) {
              clickHandle = mapEl.view.on("click", async (event: unknown) => {
                const response = await mapEl.view.hitTest(event);
                const hit = response?.results?.find((result: any) => result.graphic?.layer === assetLayer);
                const assetId = hit?.graphic?.attributes?.AssetId;
                if (assetId) onAssetSelect(String(assetId));
              });
            }

            const settled = await Promise.allSettled([viirs.load(), landCover.load()]);
            const loaded = settled.filter((item) => item.status === "fulfilled").length;
            onMapStatus(`ArcGIS 5.1 · Living Atlas ${loaded}/2`);
          } catch {
            onMapStatus("ArcGIS 5.1 · camada operacional ativa");
          }
        },
        { once: true },
      );
    };

    setup();
    return () => {
      cancelled = true;
      clickHandle?.remove?.();
      if (mapElementRef.current?.destroy) mapElementRef.current.destroy();
      layerRefs.current = {};
    };
  }, [activeWorkspace.key, onMapStatus, onAssetSelect]);

  useEffect(() => {
    Object.entries(layerVisibility).forEach(([key, visible]) => {
      if (layerRefs.current[key]) layerRefs.current[key].visible = visible;
    });
  }, [layerVisibility]);

  return (
    <div className="map-stage">
      <div className="map-fallback" aria-hidden="true">
        <div className="fallback-coast" />
        <span className="fallback-label label-port">Terminal</span>
        <span className="fallback-label label-yard">Pátio Norte</span>
        <span className="fallback-label label-plant">Usinas</span>
        <span className="fallback-label label-access">Acesso Norte</span>
      </div>
      <div ref={containerRef} className="map-host" aria-label="Mapa operacional ArcGIS da Unidade de Tubarão" />
      <div className="map-scan" aria-hidden="true" />
    </div>
  );
}

function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`status-pill tone-${tone}`}><span className="status-dot" />{children}</span>;
}

function MiniBars({ values, tone = "info" }: { values: number[]; tone?: Tone }) {
  return (
    <div className={`mini-bars tone-${tone}`} aria-label="Tendência histórica">
      {values.map((value, index) => <span key={index} style={{ height: `${value}%` }} />)}
    </div>
  );
}

export default function Home() {
  const [activeKey, setActiveKey] = useState("control");
  const [subview, setSubview] = useState("Situação integrada");
  const [scenarioStep, setScenarioStep] = useState(2);
  const [scenarioRunning, setScenarioRunning] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [incidentMode, setIncidentMode] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogKey, setCatalogKey] = useState("control");
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>(baseFeed);
  const [decisionState, setDecisionState] = useState("Aguardando aprovação");
  const [toast, setToast] = useState("");
  const [mapStatus, setMapStatus] = useState("Carregando ArcGIS 5.1…");
  const [now, setNow] = useState(new Date("2026-08-07T13:32:10-03:00"));
  const [layers, setLayers] = useState<Record<string, boolean>>({ assets: true, risk: true, viirs: false, landCover: false });
  const [scenarioName, setScenarioName] = useState("Chuva extrema + maré elevada");
  const [horizon, setHorizon] = useState("+24H");
  const [profile, setProfile] = useState("Executivo");
  const [selectedAsset, setSelectedAsset] = useState("D04");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const lastScenarioFeed = useRef(2);

  const active = useMemo(() => workspaces.find((item) => item.key === activeKey) ?? workspaces[0], [activeKey]);
  const catalogModule = useMemo(() => workspaces.find((item) => item.key === catalogKey) ?? workspaces[0], [catalogKey]);
  const activeScenarioStages = activeKey === "climate" ? climateScenarioStages : activeKey === "hazards" ? hazardScenarioStages : scenarioStages;
  const stage = activeScenarioStages[Math.min(scenarioStep, activeScenarioStages.length - 1)];

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#control/")) {
      const route = hash.replace(/^#control\//, "");
      const matchedTab = controlTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("control");
        setSubview(matchedTab);
      }
    } else if (hash.startsWith("#climate/")) {
      const route = hash.replace(/^#climate\//, "");
      const matchedTab = climateTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("climate");
        setSubview(matchedTab);
        setScenarioStep(0);
        setFeed(climateBaseFeed);
      }
    } else if (hash.startsWith("#hazards/")) {
      const route = hash.replace(/^#hazards\//, "");
      const matchedTab = hazardTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("hazards");
        setSubview(matchedTab);
        setScenarioStep(0);
        setFeed(hazardInitialFeed);
      }
    }
  }, []);

  useEffect(() => {
    if (activeKey !== "control" && activeKey !== "climate" && activeKey !== "hazards") return;
    window.history.replaceState(null, "", `#${activeKey}/${controlRouteSlug(subview)}`);
  }, [activeKey, subview]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow((value) => new Date(value.getTime() + 1000 * speed)), 1000);
    return () => window.clearInterval(timer);
  }, [speed]);

  useEffect(() => {
    if (!scenarioRunning) return;
    const delay = speed === 60 ? 700 : speed === 10 ? 1300 : 2600;
    const timer = window.setInterval(() => {
      setScenarioStep((value) => {
        if (value >= activeScenarioStages.length - 1) {
          setScenarioRunning(false);
          return value;
        }
        return value + 1;
      });
    }, delay);
    return () => window.clearInterval(timer);
  }, [scenarioRunning, speed, activeScenarioStages]);

  useEffect(() => {
    if (scenarioStep === lastScenarioFeed.current) return;
    lastScenarioFeed.current = scenarioStep;
    const entry = (activeKey === "climate" ? climateScenarioFeed : activeKey === "hazards" ? hazardScenarioFeed : scenarioFeed)[scenarioStep];
    if (entry) {
      setFeed((items) => [
        { id: Date.now(), time: now.toLocaleTimeString("pt-BR", { hour12: false }), ...entry },
        ...items,
      ].slice(0, 8));
    }
    if (activeKey === "control" && scenarioStep === 11) setIncidentMode(true);
  }, [activeKey, scenarioStep, now]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const liveMetrics = active.metrics.map((metric, index) => {
    if (active.key !== "control") return metric;
    if (index === 0) return { ...metric, value: `${Math.max(76.5, 98.2 - scenarioStep * 3.2).toFixed(1).replace(".", ",")}%` };
    if (index === 1) return { ...metric, value: `${(18.4 + scenarioStep * 8.1).toFixed(1).replace(".", ",")} kt` };
    if (index === 2) return { ...metric, value: `R$ ${(3.3 + scenarioStep * 2.7).toFixed(1).replace(".", ",")} mi` };
    return metric;
  });

  const selectWorkspace = (key: string) => {
    setActiveKey(key);
    setSubview(key === "control" ? "Situação integrada" : key === "climate" ? "Visão Geral" : key === "hazards" ? "Situação Multiameaças" : "Visão geral");
    setScenarioStep(key === "control" ? 2 : 0);
    setScenarioRunning(false);
    setIncidentMode(false);
    setFeed(key === "climate" ? climateBaseFeed : key === "hazards" ? hazardInitialFeed : baseFeed);
    lastScenarioFeed.current = key === "control" ? 2 : 0;
  };

  const approveDecision = () => {
    setDecisionState("Aprovada e publicada");
    setFeed((items) => [{
      id: Date.now(),
      time: now.toLocaleTimeString("pt-BR", { hour12: false }),
      agent: "PULSO",
      text: "DEC-0248 aprovada. WF-CTRL-02 publicado e confirmações iniciadas.",
      type: "ok" as Tone,
    }, ...items].slice(0, 8));
    setToast("Decisão aprovada · plano e tarefas publicados");
  };

  const submitDispatch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const target = String(data.get("target") || "equipe de campo");
    setFeed((items) => [{
      id: Date.now(),
      time: now.toLocaleTimeString("pt-BR", { hour12: false }),
      agent: "PULSO",
      text: `Despacho criado para ${target}; SLA de aceite iniciado.`,
      type: "info" as Tone,
    }, ...items].slice(0, 8));
    setDispatchOpen(false);
    setToast("Despacho criado · responsável notificado");
  };

  const resetScenario = () => {
    setScenarioStep(0);
    setScenarioRunning(false);
    setIncidentMode(false);
    setDecisionState("Aguardando aprovação");
    setFeed(activeKey === "climate" ? climateBaseFeed : activeKey === "hazards" ? hazardInitialFeed : baseFeed);
    lastScenarioFeed.current = 0;
    setToast("Cenário reiniciado com seed 2417");
  };

  const publishClimateSignal = () => {
    setFeed((items) => [{
      id: Date.now(),
      time: now.toLocaleTimeString("pt-BR", { hour12: false }),
      agent: "PUBLISHER",
      text: "ClimateSignal CS-204 publicado no Event Bus e entregue à Torre de Controle.",
      type: "ok" as Tone,
    }, ...items].slice(0, 8));
    setToast("CS-204 publicado · Torre de Controle e Perigos notificados");
  };

  const publishHazardSignal = () => {
    setFeed((items) => [{
      id: Date.now(),
      time: now.toLocaleTimeString("pt-BR", { hour12: false }),
      agent: "PUBLISHER",
      text: "HSIG-1032 publicado na Torre e HS-882 entregue ao Gêmeo Operacional.",
      type: "ok" as Tone,
    }, ...items].slice(0, 8));
    setToast("HSIG-1032 publicado · Torre, Gêmeo, Planejamento e Emergência notificados");
  };

  const tabNames = activeKey === "control" ? controlTabs : activeKey === "climate" ? climateTabs : activeKey === "hazards" ? hazardTabs : ["Visão geral", "Mapa vivo", "Workflows", "Relatórios", "Integrações"];
  const timeLabel = now.toLocaleTimeString("pt-BR", { hour12: false, timeZone: "America/Sao_Paulo" });

  return (
    <main className={`app-shell ${incidentMode ? "incident-mode" : ""}`}>
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">GD</div>
          <div className="brand-copy"><strong>ATLAS CLIMA</strong><span>Gêmeo Digital · Tubarão</span></div>
        </div>

        <nav className="workspace-nav" aria-label="Workspaces da plataforma">
          <span className="nav-label">WORKSPACES</span>
          {workspaces.map((item) => (
            <button
              key={item.key}
              className={`workspace-link ${item.key === activeKey ? "active" : ""}`}
              onClick={() => selectWorkspace(item.key)}
              title={item.title}
            >
              <span className="workspace-icon">{item.icon}</span>
              <span className="workspace-name">{item.shortTitle}</span>
              {item.badge ? <span className="workspace-badge">{item.badge}</span> : null}
            </button>
          ))}
          {activeKey === "control" ? <div className="control-sidebar-subnav"><span>TORRE DE CONTROLE</span>{controlTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Alertas" ? <b>3</b> : tab === "Decisões" ? <b>1</b> : null}</button>)}</div> : null}
          {activeKey === "climate" ? <div className="control-sidebar-subnav climate-sidebar-subnav"><span>CLIMA E PREVISÕES</span>{climateTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Observações" ? <b>1</b> : tab === "Nowcasting" ? <b>1</b> : null}</button>)}</div> : null}
          {activeKey === "hazards" ? <div className="control-sidebar-subnav hazards-sidebar-subnav"><span>PERIGOS E MODELOS</span>{hazardTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Execuções" ? <b>1</b> : tab === "Validação & QA" ? <b>1</b> : null}</button>)}</div> : null}
        </nav>

        <div className="sidebar-actions">
          <button className="sidebar-action" onClick={() => { setCatalogKey(activeKey); setCatalogOpen(true); }}><span>▦</span> Catálogo de módulos</button>
          <button className="sidebar-action" onClick={() => setAgentOpen(true)}><span>AI</span> Central de agentes</button>
        </div>

        <div className="system-health">
          <div><span className="health-pulse" /><strong>Operação assistida</strong></div>
          <span>12/12 serviços essenciais</span>
        </div>
      </aside>

      <section className="workspace-shell">
        <header className="topbar">
          <div className="context-selectors">
            <button className="context-button"><span className="context-kicker">UNIDADE</span><strong>Tubarão · Vitória/ES</strong><span>⌄</span></button>
            <button className="context-button scenario-select"><span className="context-kicker">CENÁRIO</span><strong>{scenarioName}</strong><span>⌄</span>
              <select aria-label="Selecionar cenário" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)}>
                <option>Chuva extrema + maré elevada</option>
                <option>Vento, ondas e restrição portuária</option>
                <option>Calor + estiagem + fogo + energia</option>
                <option>Raios + falha de energia</option>
              </select>
            </button>
          </div>

          <div className="topbar-center">
            <span className="operational-date">07 AGO 2026</span>
            <strong className="operational-clock">{timeLabel}</strong>
            <span className="timezone">BRT · {speed}×</span>
          </div>

          <div className="topbar-actions">
            <button className="ask-button" onClick={() => setAgentOpen(true)}><span>AI</span> Pergunte à plataforma</button>
            <button className="data-health-button" onClick={() => selectWorkspace("data")}><span className="health-pulse" /><strong>97,8%</strong><small>dados · 2 offline</small></button>
            <button className="icon-button" aria-label="Buscar" onClick={() => setSearchOpen((value) => !value)}>⌕</button>
            <button className="icon-button notification" aria-label="Notificações">◌<span>6</span></button>
            <button className="profile-button profile-select"><span className="avatar">MS</span><span><strong>Marina Silva</strong><small>{profile} · Unidade</small></span><b>⌄</b><select aria-label="Selecionar perfil" value={profile} onChange={(event) => setProfile(event.target.value)}><option>Executivo</option><option>Operação</option><option>HSE</option><option>Meteorologia</option><option>Modelador</option></select></button>
          </div>
          {searchOpen ? <form className="universal-search" onSubmit={(event) => { event.preventDefault(); setToast(searchTerm ? `Busca contextual: ${searchTerm} · 7 resultados` : "Digite um ativo, alerta, incidente, job ou decisão"); }}><span>⌕</span><input autoFocus value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar D-04, C17, AL-0187, DEC-0248…" /><button type="submit">Buscar</button><button type="button" onClick={() => setSearchOpen(false)}>×</button></form> : null}
        </header>

        <div className="incident-strip">
          <div><span className="incident-symbol">!</span><strong>Modo incidente N2</strong><span>Chuva extrema · comando preparado</span></div>
          <button onClick={() => setIncidentMode(false)}>Sair do modo incidente</button>
        </div>

        <div className="workspace-heading">
          <div className="title-row">
            <div>
              <div className="breadcrumb"><span>Plataforma</span><b>/</b><span>{active.id}</span></div>
              <h1>{active.title}</h1>
              <p>{active.mission}</p>
            </div>
            <div className="heading-actions">
              <StatusPill tone={active.tone}>{active.status}</StatusPill>
              <button className="secondary-button" onClick={() => { setCatalogKey(active.key); setCatalogOpen(true); }}>Ficha do módulo</button>
              <button className="primary-button" onClick={activeKey === "climate" ? publishClimateSignal : activeKey === "hazards" ? () => setSubview("Execuções") : () => setDispatchOpen(true)}>{activeKey === "climate" ? "＋ Publicar sinal" : activeKey === "hazards" ? "＋ Novo model run" : "＋ Novo despacho"}</button>
            </div>
          </div>
          {activeKey === "control" || activeKey === "climate" || activeKey === "hazards" ? <div className="operational-context-bar"><div className="horizon-control"><span>HORIZONTE</span>{(activeKey === "climate" ? ["AGORA", "+6H", "+24H", "+72H", "15D", "6M", "2050"] : activeKey === "hazards" ? ["AGORA", "+1H", "+3H", "+6H", "+12H", "+24H", "CENÁRIO"] : ["AGORA", "+6H", "+24H", "+72H", "7D", "30D", "CENÁRIO"]).map((item) => <button className={horizon === item ? "active" : ""} key={item} onClick={() => { setHorizon(item); setToast(`Contexto sincronizado em ${item}: mapa, gráficos, probabilidades e briefing`); }}>{item}</button>)}</div><div className="context-summary"><span>{activeKey === "climate" ? "ClimateContext" : activeKey === "hazards" ? "HazardContext" : "OperationalContext"}</span><strong>Tubarão · {horizon} · {scenarioName}</strong><small>{profile} · {activeKey === "climate" ? "FR-2204" : activeKey === "hazards" ? "HMR-882 · HS-882" : selectedAsset} · {stage.label}</small></div></div> : null}
          <div className="subnav" role="tablist" aria-label={`Navegação de ${active.title}`}>
            {tabNames.map((tab) => <button key={tab} role="tab" aria-selected={subview === tab} className={subview === tab ? "active" : ""} onClick={() => setSubview(tab)}>{tab}</button>)}
          </div>
        </div>

        <div className="workspace-scroll">
          {activeKey === "control" ? <ControlModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            scenarioName={scenarioName}
            mapStatus={mapStatus}
            layers={layers}
            selectedAsset={selectedAsset}
            feed={feed}
            decisionState={decisionState}
            incidentMode={incidentMode}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onSelectAsset={setSelectedAsset}
            onApproveDecision={approveDecision}
            onDispatch={() => setDispatchOpen(true)}
            onAgents={() => setAgentOpen(true)}
            onIncidentMode={setIncidentMode}
            onToast={setToast}
          /> : null}

          {activeKey === "climate" ? <ClimateModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} />}
            onHorizon={setHorizon}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onClimateSignal={publishClimateSignal}
            onHazards={() => { selectWorkspace("hazards"); setToast("Forecast Run FR-2204 encaminhado ao Módulo 3 · Perigos"); }}
          /> : null}

          {activeKey === "hazards" ? <HazardsModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} />}
            onHorizon={setHorizon}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTower={() => { publishHazardSignal(); selectWorkspace("control"); setSubview("Sinais"); }}
            onTwin={() => { selectWorkspace("twin"); setToast("HS-882 entregue ao Gêmeo Operacional · intersect com ativos preparado"); }}
          /> : null}

          {activeKey !== "control" && activeKey !== "climate" && activeKey !== "hazards" && subview === "Visão geral" && (
            <>
              <section className="metrics-grid" aria-label="Indicadores principais">
                {liveMetrics.map((metric, index) => (
                  <article className={`metric-card tone-${metric.tone}`} key={metric.label}>
                    <div className="metric-top"><span>{metric.label}</span><button aria-label={`Detalhes de ${metric.label}`}>•••</button></div>
                    <div className="metric-value-row"><strong>{metric.value}</strong><span>{metric.delta}</span></div>
                    <div className="metric-bottom"><small>{metric.caption}</small><MiniBars values={[28, 35, 31, 46, 54, 49 + index * 3, 63, 58, 72]} tone={metric.tone} /></div>
                  </article>
                ))}
              </section>

              <section className="main-grid">
                <article className="panel map-panel">
                  <div className="panel-header">
                    <div><span className="eyebrow">MAPA OPERACIONAL</span><h2>Tubarão · situação integrada</h2></div>
                    <div className="map-header-actions"><StatusPill tone={stage.tone}>{stage.label}</StatusPill><button className="quiet-button" onClick={() => setSubview("Mapa vivo")}>Expandir ↗</button></div>
                  </div>
                  <div className="map-wrap">
                    <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} />
                    <div className="map-layer-panel">
                      <strong>Camadas</strong>
                      {[
                        ["assets", "Ativos críticos", "Vale"],
                        ["risk", "Impacto P90", "Modelo"],
                        ["viirs", "Focos VIIRS", "Living Atlas"],
                        ["landCover", "Uso do solo 10 m", "Living Atlas"],
                      ].map(([key, label, source]) => (
                        <label key={key}><input type="checkbox" checked={layers[key]} onChange={() => setLayers((value) => ({ ...value, [key]: !value[key] }))} /><span className={`layer-swatch layer-${key}`} /><span><b>{label}</b><small>{source}</small></span></label>
                      ))}
                    </div>
                    <div className="map-legend"><span><i className="legend-normal" />Normal</span><span><i className="legend-watch" />Atenção</span><span><i className="legend-alert" />Restrito</span></div>
                    <div className="map-status"><span className="health-pulse" />{mapStatus}</div>
                  </div>
                </article>

                <article className="panel decision-panel">
                  <div className="panel-header compact"><div><span className="eyebrow">DECISÃO PRIORITÁRIA</span><h2>DEC-284</h2></div><StatusPill tone={decisionState.startsWith("Aprovada") ? "ok" : "watch"}>{decisionState}</StatusPill></div>
                  <div className="decision-body">
                    <span className="decision-confidence">84% confiança · PRISMA v4</span>
                    <h3>Antecipar bombeamento e reduzir exposição no setor D-04</h3>
                    <p>A nova rodada aumenta o tempo de operação acima da capacidade de drenagem. A ação preserva capacidade de recebimento e reduz o risco sobre a SE-03.</p>
                    <div className="decision-impact-grid">
                      <div><span>Valor preservado</span><strong>R$ 5,2 mi</strong></div>
                      <div><span>Produção protegida</span><strong>9,2 kt</strong></div>
                      <div><span>Prazo para agir</span><strong>00:27:18</strong></div>
                      <div><span>Risco residual</span><strong>Médio</strong></div>
                    </div>
                    <div className="explain-block"><strong>Por que agora?</strong><span>3 gatilhos excedidos</span><p>Chuva P90 186 mm · maré +0,42 m · bomba D-04 com derating de 22%.</p></div>
                    <div className="decision-actions">
                      <button className="primary-button" onClick={approveDecision} disabled={decisionState.startsWith("Aprovada")}>{decisionState.startsWith("Aprovada") ? "✓ Aprovada" : "Aprovar plano"}</button>
                      <button className="secondary-button" onClick={() => setToast("Alternativas A, B e C abertas para comparação")}>Comparar</button>
                      <button className="icon-button" onClick={() => setAgentOpen(true)} aria-label="Solicitar explicação">?</button>
                    </div>
                  </div>
                </article>
              </section>

              <section className="lower-grid">
                <article className="panel chart-panel">
                  <div className="panel-header compact"><div><span className="eyebrow">IMPACTO PROJETADO</span><h2>Capacidade · próximas 24h</h2></div><button className="quiet-button">Ver análise</button></div>
                  <div className="capacity-chart">
                    <div className="chart-scale"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div>
                    <div className="chart-bars">
                      {[95, 92, 87, 78, 72, 79, 86, 91].map((value, index) => <div key={index}><div className="bar-planned" style={{ height: `${Math.min(100, value + 6)}%` }} /><div className={`bar-available ${value < 80 ? "alert" : ""}`} style={{ height: `${value}%` }} /><span>{String(index * 3).padStart(2, "0")}h</span></div>)}
                    </div>
                  </div>
                  <div className="chart-legend"><span><i className="planned" />Planejada</span><span><i className="available" />Disponível</span><b>Gargalo previsto: 09h–15h</b></div>
                </article>

                <article className="panel workflow-panel">
                  <div className="panel-header compact"><div><span className="eyebrow">WORKFLOW ATIVO</span><h2>WF-04 · Replanejamento 72h</h2></div><span className="sla">SLA 00:27:18</span></div>
                  <div className="workflow-steps">
                    {active.flow.slice(0, 6).map((stepName, index) => {
                      const state = index < Math.min(3, scenarioStep) ? "done" : index === Math.min(3, scenarioStep) ? "current" : "next";
                      return <div className={`workflow-step ${state}`} key={stepName}><span>{state === "done" ? "✓" : index + 1}</span><div><strong>{stepName}</strong><small>{state === "done" ? "Concluído com evidência" : state === "current" ? "Em execução" : "Aguardando pré-requisito"}</small></div></div>;
                    })}
                  </div>
                  <button className="full-button" onClick={() => setSubview("Workflows")}>Abrir workflow completo →</button>
                </article>

                <article className="panel agent-feed-panel">
                  <div className="panel-header compact"><div><span className="eyebrow">AGENTES EM TEMPO REAL</span><h2>Trilha de orquestração</h2></div><button className="quiet-button" onClick={() => setAgentOpen(true)}>Central AI</button></div>
                  <div className="agent-feed">
                    {feed.slice(0, 5).map((item) => <div className="feed-item" key={item.id}><span className={`feed-node tone-${item.type}`}>{item.agent.slice(0, 2)}</span><div><div><strong>{item.agent}</strong><time>{item.time}</time></div><p>{item.text}</p></div></div>)}
                  </div>
                </article>
              </section>

              <section className="panel task-table-panel">
                <div className="panel-header compact"><div><span className="eyebrow">EXECUÇÃO</span><h2>Tarefas, decisões e evidências</h2></div><div className="table-tools"><button className="quiet-button">Filtrar</button><button className="secondary-button" onClick={() => setDispatchOpen(true)}>＋ Criar tarefa</button></div></div>
                <div className="task-table-wrap">
                  <table className="task-table">
                    <thead><tr><th>ID</th><th>Item operacional</th><th>Responsável</th><th>Prazo</th><th>Status</th><th>Prioridade</th><th /></tr></thead>
                    <tbody>{active.jobs.map((job) => <tr key={job.id}><td><strong>{job.id}</strong></td><td>{job.item}</td><td><span className="owner-avatar">{job.owner.slice(0, 2).toUpperCase()}</span>{job.owner}</td><td>{job.due}</td><td><StatusPill tone={job.status.includes("Aguard") || job.status.includes("Bloque") ? "watch" : job.status.includes("Ativo") || job.status.includes("Derating") ? "alert" : "info"}>{job.status}</StatusPill></td><td><span className={`priority priority-${job.priority.toLowerCase().replace("í", "i").replace("é", "e")}`}>{job.priority}</span></td><td><button className="row-action">•••</button></td></tr>)}</tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeKey !== "control" && activeKey !== "climate" && activeKey !== "hazards" && subview === "Mapa vivo" && (
            <section className="map-product-view">
              <article className="panel full-map-panel">
                <div className="panel-header"><div><span className="eyebrow">MAPA-TEMPO 2D/3D</span><h2>{active.title} · contexto geoespacial</h2></div><div className="map-header-actions"><StatusPill tone={stage.tone}>{stage.time} · {stage.label}</StatusPill><button className="secondary-button" onClick={() => setDispatchOpen(true)}>Criar ação no mapa</button></div></div>
                <div className="full-map-layout">
                  <div className="full-map"><ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} /></div>
                  <aside className="map-side-inspector">
                    <span className="eyebrow">CONTEÚDO DO MAPA</span>
                    <h3>Camadas e análises</h3>
                    {[["assets", "Ativos críticos", "1.284 feições"], ["risk", "Impacto P90", "HIDRO-2D v3.8"], ["viirs", "VIIRS Thermal Hotspots", "Living Atlas"], ["landCover", "Sentinel-2 Land Cover", "Living Atlas"]].map(([key, label, meta]) => <label className="big-layer-toggle" key={key}><input type="checkbox" checked={layers[key]} onChange={() => setLayers((value) => ({ ...value, [key]: !value[key] }))} /><span className={`layer-swatch layer-${key}`} /><span><strong>{label}</strong><small>{meta}</small></span><b>⌄</b></label>)}
                    <div className="selected-feature"><span className="eyebrow">SELEÇÃO</span><h4>Bomba de drenagem D-04</h4><div><span>Estado</span><strong className="text-alert">Restrita · −22%</strong></div><div><span>Última leitura</span><strong>13:32:08 · 4,8 s</strong></div><div><span>Risco P90</span><strong>Alto</strong></div><button className="full-button">Abrir cockpit do ativo →</button></div>
                  </aside>
                </div>
              </article>
            </section>
          )}

          {subview === "Workflows" && (
            <section className="detail-view-grid">
              <article className="panel detail-hero">
                <div><span className="eyebrow">FLUXO PONTA A PONTA</span><h2>{active.title}</h2><p>{active.result}</p></div>
                <StatusPill tone={active.tone}>{active.status}</StatusPill>
                <div className="horizontal-flow">{active.flow.map((stepName, index) => <div key={stepName} className={index <= Math.min(scenarioStep, active.flow.length - 1) ? "active" : ""}><span>{index < scenarioStep ? "✓" : index + 1}</span><strong>{stepName}</strong>{index < active.flow.length - 1 ? <i>→</i> : null}</div>)}</div>
              </article>
              <article className="panel detail-card"><span className="eyebrow">FEATURES PRINCIPAIS</span><h3>Capacidades do produto</h3><ul className="check-list">{active.features.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></article>
              <article className="panel detail-card"><span className="eyebrow">FORMULÁRIOS DE ENTRADA</span><h3>Registros e comandos</h3><ul className="form-list">{active.forms.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item}</strong><small>Validação · localização · evidência</small></div><b>›</b></li>)}</ul><button className="full-button" onClick={() => setDispatchOpen(true)}>Abrir formulário operacional</button></article>
              <article className="panel detail-card io-card"><span className="eyebrow">INPUTS</span><h3>Dados consumidos</h3><div className="tag-cloud">{active.inputs.map((item) => <span key={item}>{item}</span>)}</div></article>
              <article className="panel detail-card io-card output"><span className="eyebrow">OUTPUTS</span><h3>Entregáveis e decisões</h3><div className="tag-cloud">{active.outputs.map((item) => <span key={item}>{item}</span>)}</div></article>
              <article className="panel detail-card"><span className="eyebrow">AGENTES DO WORKSPACE</span><h3>Automação e controle</h3><div className="workspace-agents">{active.agents.map((agentName) => <div key={agentName}><span>AI</span><strong>{agentName}</strong><small>Rastreável · human-in-the-loop</small></div>)}</div><button className="full-button" onClick={() => setAgentOpen(true)}>Ver autonomia e guardrails →</button></article>
              <article className="panel task-table-panel detail-table"><div className="panel-header compact"><div><span className="eyebrow">JOBS DO WORKFLOW</span><h2>Execução e SLA</h2></div><button className="secondary-button" onClick={() => setDispatchOpen(true)}>＋ Novo job</button></div><div className="task-table-wrap"><table className="task-table"><thead><tr><th>ID</th><th>Job</th><th>Owner</th><th>SLA</th><th>Status</th><th>Prioridade</th></tr></thead><tbody>{active.jobs.map((job) => <tr key={job.id}><td><strong>{job.id}</strong></td><td>{job.item}</td><td>{job.owner}</td><td>{job.due}</td><td><StatusPill tone="info">{job.status}</StatusPill></td><td>{job.priority}</td></tr>)}</tbody></table></div></article>
            </section>
          )}

          {subview === "Relatórios" && (
            <section className="reports-view">
              <div className="report-summary-row"><article className="panel report-highlight"><span className="eyebrow">REPORT PACK</span><h2>{active.reports[0]}</h2><p>Gerado às 13:30 · fontes citadas · modelo e premissas versionados.</p><button className="primary-button" onClick={() => setToast("Relatório gerado e adicionado à trilha de evidências")}>Gerar relatório</button></article>{active.reports.slice(1).map((report, index) => <article className="panel report-card" key={report}><span className="report-type">{index % 2 ? "PDF" : "LIVE"}</span><h3>{report}</h3><p>Atualização automática · distribuição controlada</p><button>Visualizar →</button></article>)}</div>
              <div className="report-charts-grid">
                <article className="panel large-report-chart"><div className="panel-header compact"><div><span className="eyebrow">ANÁLISE TEMPORAL</span><h2>{active.charts[0]}</h2></div><StatusPill tone="info">Tempo real</StatusPill></div><div className="line-chart-css"><div className="line-grid" />{[42, 48, 44, 59, 64, 56, 70, 82, 76, 88, 84, 92].map((value, index) => <span key={index} style={{ left: `${index * 8.6 + 2}%`, bottom: `${value - 24}%` }}><i /></span>)}</div><div className="axis-labels"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span></div></article>
                <article className="panel chart-catalog"><span className="eyebrow">VISUALIZAÇÕES DISPONÍVEIS</span><h3>Gráficos do módulo</h3>{active.charts.map((chartName, index) => <div className="chart-catalog-item" key={chartName}><span>{index + 1}</span><strong>{chartName}</strong><MiniBars values={[30 + index * 2, 54, 46, 71 - index, 63, 82]} tone={index === 1 ? "watch" : "info"} /></div>)}</article>
              </div>
            </section>
          )}

          {subview === "Integrações" && (
            <section className="integrations-view">
              <article className="panel integration-hero"><div><span className="eyebrow">ARQUITETURA FEDERADA</span><h2>ArcGIS como backbone geoespacial</h2><p>Sistemas corporativos permanecem como registros oficiais; o GIS organiza localização, tempo, contexto e decisão.</p></div><div className="arcgis-core"><span>GIS</span><strong>ArcGIS Enterprise</strong><small>Maps · Velocity · Image · Knowledge · Workflow</small></div></article>
              <div className="integration-columns">
                <article className="panel integration-column"><span className="eyebrow">FONTES EXTERNAS</span><h3>Dados públicos e parceiros</h3>{active.external.map((source, index) => <div className="integration-row" key={source}><span className="source-icon">EXT</span><div><strong>{source}</strong><small>{index % 2 ? "API / feature service" : "Feed / portal item"}</small></div><StatusPill tone={index === 0 ? "ok" : "info"}>{index === 3 ? "Cache" : "Online"}</StatusPill></div>)}</article>
                <article className="integration-bus"><div className="bus-line" /><div className="bus-node node-gis"><span>GIS</span><strong>ArcGIS</strong></div><div className="bus-node node-ai"><span>AI</span><strong>Agentes</strong></div><div className="bus-node node-flow"><span>WF</span><strong>Workflow</strong></div><div className="bus-node node-data"><span>DQ</span><strong>Qualidade</strong></div></article>
                <article className="panel integration-column"><span className="eyebrow">SISTEMAS INTERNOS</span><h3>Interfaces corporativas</h3>{active.internal.map((source, index) => <div className="integration-row" key={source}><span className="source-icon internal">SYS</span><div><strong>{source}</strong><small>{index % 2 ? "REST / eventos / CDC" : "Somente leitura / deep link"}</small></div><StatusPill tone={index === 4 ? "watch" : "ok"}>{index === 4 ? "Mock" : "Integrado"}</StatusPill></div>)}</article>
              </div>
              <article className="panel lineage-panel"><div className="panel-header compact"><div><span className="eyebrow">LINHAGEM DA DECISÃO</span><h2>DEC-284 · dados → modelo → impacto → plano</h2></div><button className="quiet-button">Exportar evidência</button></div><div className="lineage-flow">{["ECMWF 12Z", "PLU-044 + MET-03", "HIDRO-2D v3.8", "ATLAS Cascata", "PRISMA Plano B", "DEC-284"].map((node, index) => <div key={node}><span>{index + 1}</span><strong>{node}</strong><small>{index < 2 ? "Dados" : index === 2 ? "Modelo" : index === 3 ? "Analytics" : index === 4 ? "Recomendação" : "Decisão humana"}</small>{index < 5 ? <b>→</b> : null}</div>)}</div></article>
            </section>
          )}
        </div>

        <footer className="timeline-footer">
          <div className="timeline-controls"><button className="timeline-button" onClick={resetScenario} aria-label="Reiniciar cenário">↺</button><button className={`timeline-play ${scenarioRunning ? "playing" : ""}`} onClick={() => setScenarioRunning((value) => !value)} aria-label={scenarioRunning ? "Pausar cenário" : "Executar cenário"}>{scenarioRunning ? "Ⅱ" : "▶"}</button><button className="timeline-button" onClick={() => setScenarioStep((value) => Math.min(activeScenarioStages.length - 1, value + 1))} aria-label="Próximo evento">⏭</button><button className="speed-button" onClick={() => setSpeed((value) => value === 1 ? 5 : value === 5 ? 10 : value === 10 ? 60 : 1)}>{speed}×</button></div>
          <div className={`scenario-timeline ${activeKey === "climate" ? "climate-timeline" : activeKey === "hazards" ? "hazard-timeline" : ""}`}>{activeScenarioStages.map((item, index) => <button key={item.label} className={`${index === scenarioStep ? "active" : ""} ${index < scenarioStep ? "passed" : ""}`} onClick={() => setScenarioStep(index)}><span className={`tone-${item.tone}`}>{index < scenarioStep ? "✓" : ""}</span><div><strong>{item.time} · {item.label}</strong><small>{item.note}</small></div></button>)}</div>
          <div className="footer-health"><span className="health-pulse" /><div><strong>{activeKey === "climate" ? "Climate Data Cube" : activeKey === "hazards" ? "Model Factory" : "Dados operacionais"}</strong><small>{activeKey === "climate" ? "FR-2204 · QA 98% · 51 membros" : activeKey === "hazards" ? "HMR-882 · HS-882 · QA PASS · confidence 79%" : "Atualizado há 4,8 s · confiança 96,7%"}</small></div><button className="footer-status" onClick={() => activeKey === "hazards" ? setSubview("Execuções") : selectWorkspace("data")}>{activeKey === "climate" ? "98%" : activeKey === "hazards" ? "6/6" : "12/12"}</button></div>
        </footer>
      </section>

      {agentOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setAgentOpen(false); }}>
          <section className="modal agent-center" role="dialog" aria-modal="true" aria-label="Central de agentes">
            <header className="modal-header"><div><span className="eyebrow">ORQUESTRAÇÃO MULTIAGENTE</span><h2>Central de agentes</h2><p>Analytics, recomendação e execução controlada com rastreabilidade e aprovação humana.</p></div><button className="modal-close" onClick={() => setAgentOpen(false)}>×</button></header>
            <div className="agent-center-summary"><div><strong>10</strong><span>Agentes especializados</span></div><div><strong>4</strong><span>Executando agora</span></div><div><strong>1</strong><span>Aguardando aprovação</span></div><div><strong>100%</strong><span>Ações auditadas</span></div></div>
            <div className="agent-center-grid">{agents.map((agent) => <article className="agent-card" key={agent.codename}><div className="agent-card-top"><span className="agent-orb">AI</span><div><small>{agent.codename}</small><h3>{agent.name}</h3></div><StatusPill tone={agent.status === "Executando" ? "info" : agent.status === "Aguardando aprovação" ? "watch" : "ok"}>{agent.status}</StatusPill></div><p>{agent.role}</p><dl><div><dt>Gatilho</dt><dd>{agent.trigger}</dd></div><div><dt>Ações</dt><dd>{agent.actions}</dd></div><div><dt>Controle</dt><dd>{agent.control}</dd></div></dl><footer><button onClick={() => { setToast(`${agent.codename}: explicação aberta com fontes citadas`); setAgentOpen(false); }}>Ver raciocínio</button><button onClick={() => setToast(`${agent.codename}: execução pausada para revisão`)}>Pausar</button></footer></article>)}</div>
          </section>
        </div>
      )}

      {catalogOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setCatalogOpen(false); }}>
          <section className="modal catalog-modal" role="dialog" aria-modal="true" aria-label="Catálogo de módulos">
            <header className="modal-header"><div><span className="eyebrow">BLUEPRINT DE PRODUTO</span><h2>Catálogo de módulos da plataforma</h2><p>Features, fluxo operacional, formulários, entradas, saídas, reports, gráficos e integrações.</p></div><button className="modal-close" onClick={() => setCatalogOpen(false)}>×</button></header>
            <div className="catalog-layout">
              <nav className="catalog-list">{workspaces.map((item) => <button key={item.key} className={item.key === catalogKey ? "active" : ""} onClick={() => setCatalogKey(item.key)}><span>{item.id}</span><div><strong>{item.title}</strong><small>{item.result}</small></div><b>›</b></button>)}</nav>
              <div className="catalog-detail">
                <div className="catalog-title"><span className="catalog-code">{catalogModule.code}</span><div><span className="eyebrow">WORKSPACE {catalogModule.id}</span><h2>{catalogModule.title}</h2><p>{catalogModule.mission}</p></div><StatusPill tone={catalogModule.tone}>{catalogModule.status}</StatusPill></div>
                <div className="catalog-section full"><span className="eyebrow">FLUXO OPERACIONAL PONTA A PONTA</span><div className="catalog-flow">{catalogModule.flow.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong></div>)}</div></div>
                <div className="catalog-detail-grid">
                  {[
                    ["Features principais", catalogModule.features],
                    ["Formulários de entrada", catalogModule.forms],
                    ["Inputs", catalogModule.inputs],
                    ["Outputs", catalogModule.outputs],
                    ["Reports", catalogModule.reports],
                    ["Gráficos", catalogModule.charts],
                    ["Fontes externas", catalogModule.external],
                    ["Interfaces internas", catalogModule.internal],
                  ].map(([title, list]) => <section className="catalog-section" key={title as string}><span className="eyebrow">{title as string}</span><ul>{(list as string[]).map((item) => <li key={item}><span>→</span>{item}</li>)}</ul></section>)}
                </div>
                <div className="catalog-footer"><div><span className="eyebrow">AGENTES ESPECIALIZADOS</span><div>{catalogModule.agents.map((agent) => <span key={agent}>AI · {agent}</span>)}</div></div><button className="primary-button" onClick={() => { selectWorkspace(catalogModule.key); setCatalogOpen(false); }}>Abrir workspace</button></div>
              </div>
            </div>
          </section>
        </div>
      )}

      {dispatchOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDispatchOpen(false); }}>
          <form className="modal dispatch-modal" role="dialog" aria-modal="true" aria-label="Novo despacho operacional" onSubmit={submitDispatch}>
            <header className="modal-header"><div><span className="eyebrow">WORKFLOW CONTROLADO</span><h2>Novo despacho operacional</h2><p>A ação ficará vinculada ao cenário, mapa, responsável, SLA e evidências.</p></div><button type="button" className="modal-close" onClick={() => setDispatchOpen(false)}>×</button></header>
            <div className="form-grid">
              <label><span>Tipo de ação</span><select name="type" required><option>Vistoria preventiva</option><option>Despacho de equipe</option><option>Bloqueio operacional</option><option>Ordem de manutenção</option><option>Comunicação</option></select></label>
              <label><span>Ativo / área</span><select name="target" required><option>Bomba de drenagem D-04</option><option>Canal Norte</option><option>Subestação SE-03</option><option>Acesso Norte</option><option>Terminal · Berço 2</option></select></label>
              <label><span>Responsável</span><select name="owner" required><option>Equipe HSE-02</option><option>Brigada 03</option><option>Manutenção Drenagem</option><option>Operação Porto</option></select></label>
              <label><span>Prazo / SLA</span><input name="due" type="datetime-local" defaultValue="2026-08-07T14:15" required /></label>
              <label><span>Prioridade</span><select name="priority"><option>Crítica</option><option>Alta</option><option>Média</option></select></label>
              <label><span>Checklist</span><select name="checklist"><option>Vistoria drenagem v3.2</option><option>Liberação elétrica v2.7</option><option>Prontidão portuária v4.1</option></select></label>
              <label className="full-field"><span>Instruções e critério de aceite</span><textarea name="notes" defaultValue="Confirmar condição, registrar foto georreferenciada e validar capacidade operacional antes da liberação." rows={4} /></label>
              <label className="evidence-field"><input type="checkbox" defaultChecked /><span>Exigir foto, geolocalização, horário e assinatura do responsável</span></label>
            </div>
            <footer className="modal-footer"><button type="button" className="secondary-button" onClick={() => setDispatchOpen(false)}>Cancelar</button><button type="submit" className="primary-button">Criar e despachar</button></footer>
          </form>
        </div>
      )}

      {toast ? <div className="toast"><span>✓</span>{toast}</div> : null}
    </main>
  );
}
