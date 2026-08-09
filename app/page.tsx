"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ControlModule, controlTabs } from "./control-module";
import { ClimateModule, climateTabs } from "./climate-module";
import { HazardsModule, hazardBaseFeed, hazardScenarioFeed, hazardScenarioStages, hazardTabs } from "./hazards-module";
import { TwinModule, twinBaseFeed, twinScenarioFeed, twinScenarioStages, twinTabs } from "./twin-module";
import { ChainModule, chainBaseFeed, chainScenarioFeed, chainScenarioStages, chainTabs } from "./chain-module";
import { PlanningModule, planningBaseFeed, planningScenarioFeed, planningScenarioStages, planningTabs } from "./planning-module";
import { RiskModule, riskBaseFeed, riskScenarioFeed, riskScenarioStages, riskTabs } from "./risk-module";
import { EmergencyModule, emergencyBaseFeed, emergencyScenarioFeed, emergencyScenarioStages, emergencyTabs } from "./emergency-module";
import { EnvironmentModule, environmentBaseFeed, environmentScenarioFeed, environmentScenarioStages, environmentTabs } from "./environment-module";
import { DataModule, dataBaseFeed, dataScenarioFeed, dataScenarioStages, dataTabs } from "./data-module";
import { GovernanceModule, governanceBaseFeed, governanceScenarioFeed, governanceScenarioStages, governanceTabs } from "./governance-module";
import { CommunicationsModule, communicationsBaseFeed, communicationsScenarioFeed, communicationsScenarioStages, communicationsTabs } from "./communications-module";

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
    mission: "Converter perigo físico em exposição, vulnerabilidade, condição, capacidade e restrição operacional de cada ativo.",
    result: "Ativo + tempo + capacidade disponível + restrição + dependências + confiança, prontos para decisão e otimização.",
    status: "12 restritos · 3 críticos",
    tone: "watch",
    badge: 3,
    metrics: makeMetrics(
      ["Disponibilidade global", "94,2%", "+0,6 pp", "Ativos críticos · tempo real", "ok"],
      ["Capacidade disponível", "92,4%", "−4,8 pp", "Versus planejamento", "watch"],
      ["Ativos expostos", "27", "próximas 24h", "2 críticos · HS-882", "alert"],
      ["Dependências críticas", "4", "sem redundância", "SE-04 · D-04 · V-08", "critical"],
    ),
    features: ["Situação operacional asset-first", "Mapa 2D e WebScene 3D sincronizados", "Cockpit 360° por ativo", "Exposição e curvas de vulnerabilidade", "Capacidade e restrições temporais", "Dependências, redundância e SPOF", "Sensores, health e confidence", "Manutenção, vistoria e liberação"],
    flow: ["Receber HazardSurface", "Intersectar ativos no espaço-tempo", "Aplicar vulnerabilidade e limiares", "Prever estado e capacidade", "Propagar dependências", "Publicar AssetConstraint", "Despachar inspeção e liberar retorno"],
    forms: ["Novo ativo", "Dependência", "Curva de vulnerabilidade", "Restrição e override", "Vistoria Field Maps / Survey123", "Liberação parcial ou total"],
    inputs: ["HazardSurface HS-882", "BIM / CAD / GIS", "EAM / CMMS", "SCADA / DCS / PLC", "Historian e MES", "Inspeções e documentos"],
    outputs: ["AssetExposure", "AssetImpact", "Estado e capacidade previstos", "AssetConstraint para M5", "Grafo de dependências e redundância", "Inspeção, liberação e evidências"],
    reports: ["Asset Situation Report", "Critical Asset Report", "Exposure & Vulnerability", "Capacity Forecast", "Dependency & Redundancy Gap", "Inspection & Asset Release", "Post-event Report"],
    charts: ["Health score explicável", "Waterfall de capacidade", "Timeline observado × previsto", "Curva de fragilidade", "Grafo de dependências", "Gantt manutenção × perigo"],
    external: ["ArcGIS Terrain 3D", "Living Atlas · VIIRS", "Sentinel-2 Land Cover", "Ortoimagem / LiDAR", "Cadastros e redes públicas"],
    internal: ["EAM / CMMS", "SCADA / DCS / PLC", "Historian / MES", "BIM / Engenharia", "Field Maps / Survey123", "M3 · M5 · M1 · M6"],
    agents: ["ASSET GUARDIAN", "EXPOSURE", "VULNERABILITY", "DEPENDENCY", "REDUNDANCY", "MAINTENANCE", "INSPECTION", "INCONSISTENCY", "RELEASE", "SPOF"],
    jobs: [
      { id: "CONST-201", item: "C17 restrita a 2.300 t/h por HS-882", owner: "ASSET GUARDIAN", due: "20:10", status: "Ativa", priority: "Crítica" },
      { id: "VS-204", item: "Vistoria pré-evento da drenagem D-04", owner: "Equipe HSE-02", due: "19:05", status: "Em campo", priority: "Crítica" },
      { id: "WO-54820", item: "Replanejar preventiva C17 × evento extremo", owner: "Manutenção", due: "19:20", status: "Conflito", priority: "Alta" },
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
    result: "Operational Supply Chain Digital Twin com balanço de massa, propagação temporal, gargalos, filas, compromissos e recovery.",
    status: "BOT-022 · 1 compromisso crítico",
    tone: "alert",
    badge: 1,
    metrics: makeMetrics(
      ["Throughput atual", "92,4%", "−7,6 pp", "Forecast 24h · 88,7%", "alert"],
      ["Produção em risco", "12,4 kt", "P90", "C17 → U3", "critical"],
      ["Buffer mínimo", "4h32", "Pátio Produto", "Tempo até limite", "watch"],
      ["MV Atlas", "+3h20", "C-2048", "Demurrage US$ 3,3k · proxy", "alert"],
    ),
    features: ["Dynamic Process Network", "Mass balance e network flow", "Inventários e buffers por qualidade", "Discrete event para filas", "Propagação causal temporal", "Bottleneck e next bottleneck", "Rail, port e vessel intelligence", "Commitments e recovery"],
    flow: ["Receber AssetConstraint", "Localizar na cadeia", "Reconciliar balanço", "Aplicar proteção do buffer", "Propagar fluxo e filas", "Detectar gargalo efetivo", "Alcançar compromisso", "Modelar recovery", "Publicar ChainSignal"],
    forms: ["ProcessNode / ProcessEdge", "InventoryBuffer", "ProcessConstraint LIVE / SCENARIO", "TrainMovement", "VesselCall", "DeliveryCommitment", "Override auditável"],
    inputs: ["AssetConstraint e HazardSurface", "MES / APS e capacidades", "Inventários e qualidade", "Trens / ETA / filas", "Navios / AIS / berços", "Contratos e compromissos"],
    outputs: ["PropagationRun / Result", "Bottleneck e CriticalPath", "ThroughputForecast", "ChainSignal", "PlanningConstraintSet", "RecoveryCurve e confidence"],
    reports: ["Chain Situation Report", "Bottleneck Report", "Throughput Forecast", "Inventory & Buffer Report", "Rail Flow Report", "Port & Vessel Report", "Delivery Risk Report", "Recovery Report"],
    charts: ["Dynamic network graph", "Sankey de volume", "Throughput", "Curva de inventário", "Fila temporal", "Gantt", "Waterfall operacional", "Critical path", "Recovery curve"],
    external: ["ArcGIS Living Atlas", "AIS / VTS", "Condição ferroviária", "Clima marítimo", "Fornecedores e origem"],
    internal: ["MES / APS", "SCADA / Historian", "TOS / Porto", "EFVM", "ERP / Comercial", "EAM / CMMS", "Event Store"],
    agents: ["CHAIN ORCHESTRATOR", "PROPAGATION", "BOTTLENECK", "BUFFER", "QUEUE", "RAIL", "PORT", "COMMITMENT", "RECONCILIATION", "CAUSALITY", "RECOVERY", "SENSITIVITY"],
    jobs: [
      { id: "PR-881", item: "Propagar CONST-201 por fluxo, buffers e filas", owner: "PROPAGATION", due: "18:45", status: "Concluído", priority: "Crítica" },
      { id: "BOT-022", item: "Monitorar C17 e próximo gargalo Berço 2", owner: "BOTTLENECK", due: "20:10", status: "Ativo", priority: "Crítica" },
      { id: "CHS-0184", item: "Publicar impacto de 12,4 kt e recovery 9h30", owner: "CHAIN ORCHESTRATOR", due: "18:46", status: "Publicado", priority: "Alta" },
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
    result: "Alternativas factíveis, explicáveis e robustas convertidas em plano versionado, executável e monitorável.",
    status: "PLN-v19 · decisão em 28 min",
    tone: "watch",
    badge: 1,
    metrics: makeMetrics(
      ["Plano recomendado", "Cenário B", "86/100", "Robustez · 17/20 variantes", "ok"],
      ["Produção preservada", "7,6 kt", "12,4 → 4,8", "Versus nenhuma ação", "ok"],
      ["Risco residual", "Baixo", "78% confiança", "Safety e ambiente mantidos", "ok"],
      ["Janela de decisão", "28 min", "1h42 útil", "MB-02 · primeira ruptura 21:04", "alert"],
    ),
    features: ["Risk-informed planning 72h", "Scenario Factory e branching", "Otimização multiobjetivo", "Robust planning P10/P50/P90", "Production e inventory planning", "Rail, port e maintenance windows", "Resource allocation", "Aderência e replanejamento contínuo"],
    flow: ["Receber sinal material", "Carregar baseline e constraints", "Gerar alternativas", "Validar factibilidade", "Simular M3–M5", "Otimizar e comparar", "Recomendar", "Aprovar", "Publicar workflows", "Monitorar e replanejar"],
    forms: ["PlanningScenario em 7 etapas", "ScenarioOverride", "ConstraintSet", "Otimização básica/avançada", "Aprovação de plano", "BufferTarget e ResourcePlan"],
    inputs: ["ForecastProbability e HazardSurface", "AssetConstraint e ChainSignal", "Produção, estoques e filas", "Manutenção, recursos e contratos", "Limites ambientais e safety"],
    outputs: ["DecisionAlternative", "PlanningRecommendation", "ApprovedPlan e PlanAction", "Resource/Maintenance/Logistics Plan", "PlanAdherence e ReplanTrigger"],
    reports: ["72h Operational Plan", "Scenario Comparison", "Optimization Report", "Resource & Maintenance Plan", "Plan Adherence", "Replanning Report", "Adaptation Options"],
    charts: ["Gantt operacional", "Fronteira risco × custo", "Tornado de sensibilidade", "Decision matrix", "Robustez P10/P50/P90", "Curva de estoque"],
    external: ["ArcGIS Living Atlas", "Forecast marítimo", "AIS / VTS", "Restrições viárias", "Cenários climáticos"],
    internal: ["APS / MES", "EAM / CMMS", "TOS / Ferrovia", "Workforce", "ERP / Contratos", "Workflow Manager"],
    agents: ["PLANNING ORCHESTRATOR", "SCENARIO GENERATOR", "CONSTRAINT GUARDIAN", "OPTIMIZATION", "RESOURCE", "MAINTENANCE", "LOGISTICS", "RECOMMENDATION", "ADHERENCE", "REPLANNING"],
    jobs: [
      { id: "DEC-0248", item: "Aprovar ALT-B · +7,6 kt preservadas", owner: "Gerência Operacional", due: "19:14", status: "28 min restantes", priority: "Crítica" },
      { id: "OPT-882", item: "Validar robustez P10/P50/P90", owner: "OPTIMIZATION", due: "18:46", status: "Concluído", priority: "Alta" },
      { id: "JOB-3948", item: "Mobilizar MB-02 para D04", owner: "Utilities", due: "17:45", status: "Planejado", priority: "Alta" },
    ],
  },
  {
    id: "07",
    key: "risk",
    code: "RF",
    icon: "▥",
    title: "Riscos e Finanças",
    shortTitle: "Riscos & Finanças",
    mission: "Traduzir perigo, ativo, restrição operacional, cadeia e alternativas de plano em risco, distribuição de perdas, materialidade financeira, risco residual e valor de adaptação.",
    result: "Enterprise Climate Risk Engine com perda esperada/P90, EBITDA e caixa em risco, stress tests, exposição contratual, cobertura, adaptação, apetite e disclosure rastreável.",
    status: "RS-041 · decisão requerida",
    tone: "alert",
    badge: 3,
    metrics: makeMetrics(
      ["Perda esperada", "R$ 4,8 mi", "+R$ 1,7 mi", "FI-021 · cenário ativo", "alert"],
      ["Perda P90", "R$ 12,7 mi", "+R$ 4,5 mi", "P95 R$ 17,4 mi", "critical"],
      ["EBITDA em risco", "R$ 7,4 mi", "+R$ 2,2 mi", "Ponte volume → margem", "alert"],
      ["Risco residual", "ALTO", "acima do limite", "ALT-B reduz para moderado", "watch"],
    ),
    features: ["Taxonomia integrada e Risk Register", "Risco físico agudo e crônico", "NGFS e transição", "Funções de dano e financeiras", "Stress tests assíncronos", "Contratos, seguros e Loss Events", "Adaptação e perda evitada", "Residual, apetite e disclosure"],
    flow: ["Receber sinais e exposições", "Construir cadeia causal", "Executar risco físico/transição", "Propagar incerteza", "Valorar e reconciliar", "Aplicar controles, seguro e alternativas", "Comparar residual e apetite", "Publicar RiskSignal e apoiar decisão", "Validar resultado pós-evento"],
    forms: ["Risk / RiskAssessment", "Stress Test Wizard", "Financial Function", "Insurance Policy & Recovery", "Contract Exposure", "Loss Event", "Adaptation Investment", "Risk Acceptance", "Disclosure Claim"],
    inputs: ["ClimateSignal e HazardSurface", "AssetConstraint e ChainSignal", "PlanningAlternative", "Incident / Damage Assessment", "ERP / FP&A e contratos", "Apólices e recuperações", "NGFS / CMIP6", "Materialidade territorial"],
    outputs: ["RiskSignal RS-041", "Expected / P90 / P95 Loss", "EBITDA e caixa em risco", "Contract / Insurance Exposure", "Avoided Loss e Residual Risk", "Stress Test Run", "Disclosure Support Pack"],
    reports: ["Executive Risk", "Physical Risk", "Transition Risk", "Climate Stress Test", "Financial Impact", "Expected Loss", "Contract Exposure", "Insurance Exposure", "Residual Risk", "Adaptation Business Case", "Climate Risk Portfolio", "Disclosure Support", "Post-Event Financial Review"],
    charts: ["Distribuição P50/P90/P95", "Waterfall de perdas", "Ponte operacional-financeira", "Curva de excedência", "Tornado de sensibilidade", "Risco inerente → residual", "Concentração espacial", "Cash timeline"],
    external: ["NGFS Climate Scenarios", "CMIP6 / IPCC", "ArcGIS Living Atlas", "Dados macroeconômicos e setoriais", "Preço de carbono", "Mercados e apólices"],
    internal: ["M2–M6 · clima, perigo, ativos, cadeia e plano", "M8 · danos e recovery", "M9 · materialidade territorial", "M10 · Data Fabric", "M11 · Governance Control Plane", "ERP / FP&A / ERM / Seguros / Contratos"],
    agents: ["RISK ORCHESTRATOR", "PHYSICAL RISK", "FINANCIAL", "TRANSITION", "STRESS TEST", "INSURANCE", "CONTRACT", "ADAPTATION", "SENSITIVITY", "FINANCIAL RECONCILIATION", "NGFS SCENARIO", "MATERIALITY", "RESIDUAL RISK", "FINANCIAL VALIDATION", "DEPENDENCY RISK"],
    jobs: [
      { id: "RS-041", item: "Aprovar ALT-B · valor preservado R$ 4,7 mi", owner: "Diretoria Operacional", due: "19:14", status: "Decisão requerida", priority: "Crítica" },
      { id: "ST-204", item: "Revisar stress test Rain P90 + High Tide", owner: "Risco + FP&A", due: "19:30", status: "READY", priority: "Alta" },
      { id: "INS-018", item: "Validar cobertura potencial da apólice P-018", owner: "Seguros", due: "20:00", status: "Sob análise humana", priority: "Alta" },
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
    result: "Alerta e ativação governados, comando no mapa, continuidade, retomada gradual, evidências e aprendizado.",
    status: "N2 · AL-0187",
    tone: "alert",
    badge: 5,
    metrics: makeMetrics(
      ["Estado geral", "Prontidão N2", "AL-0187 severo", "Ativação sem incidente", "alert"],
      ["Equipes mobilizadas", "7 / 11", "+2", "Drenagem 2 em campo", "watch"],
      ["Tarefas críticas", "18", "3 atrasadas", "Mission MIS-024", "alert"],
      ["Recursos disponíveis", "83%", "gap 1 bomba", "SA-01 · staging", "watch"],
    ),
    features: ["Multi-Hazard Early Warning", "Impact-Based Warning e CAP 1.2", "Preparação e protocolos executáveis", "Ativação N0–N4", "Incident Command e COP", "ArcGIS Mission e Workflow Manager", "Field Maps/Survey123 offline", "Continuidade, damage, recovery e restart", "Exercícios e After-Event Review"],
    flow: ["Conhecer risco", "Preparar", "Antecipar", "Validar alerta", "Ativar prontidão", "Despachar ações preventivas", "Declarar incidente quando necessário", "Comandar e responder", "Estabilizar", "Avaliar danos", "Recuperar e retomar", "Aprender"],
    forms: ["Declaração de incidente", "MissionTask e recurso", "Field Report", "SITREP", "Damage Assessment", "Restart Gate", "After-Event Review"],
    inputs: ["ClimateSignal / HazardSignal", "Asset e Chain State", "ApprovedPlan / RiskSignal", "IncidentEvent / FieldReport", "Pessoas, recursos e infraestrutura"],
    outputs: ["Alert / CAPMessage", "Activation / Incident", "Mission / Task / SITREP", "ContinuityActivation", "Damage / Recovery / Restart", "AER / ImprovementAction"],
    reports: ["Preparedness Report", "Alert Report", "Incident Situation Report", "Operational Period Brief", "Resource Status Report", "Field Activity Report", "Damage Assessment Report", "Continuity Status Report", "Recovery Report", "Restart Report", "After-Event Review", "Exercise Report"],
    charts: ["Timeline do incidente", "ACK por canal", "Recursos e gaps", "Incident forecast", "Continuidade mínima", "Curva de recuperação", "Expected × actual loss"],
    external: ["Defesa Civil", "Bombeiros", "Concessionárias", "Saúde e municípios", "CAP feed / sistemas públicos"],
    internal: ["ArcGIS Mission", "Workflow Manager", "Field Maps", "Survey123", "SCADA / HSE / Event Bus"],
    agents: ["EMERGENCY ORCHESTRATOR", "EARLY WARNING", "PROTOCOL", "ACTIVATION", "DISPATCH", "RESOURCE", "FIELD QA", "SITUATION", "SITREP", "COMMUNICATION", "CONTINUITY", "DAMAGE TRIAGE", "RECOVERY", "RESTART", "AER"],
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
    mission: "Representar como eventos, operações e decisões interagem com o território, os serviços, o ambiente e as comunidades ao redor de Tubarão.",
    result: "Território, receptores, exposição populacional, impactos, ocorrências, ação institucional, mitigação e recuperação auditável.",
    status: "TS-081 · impacto alto",
    tone: "alert",
    badge: 5,
    metrics: makeMetrics(
      ["Pessoas potencialmente expostas", "4.820", "+3.620", "Próximas 6h · estimate", "alert"],
      ["Receptores sensíveis", "14", "+11", "3 prioritários", "watch"],
      ["Ocorrências abertas", "27", "+23", "5 críticas · 17 agrupadas", "critical"],
      ["Comunicação territorial", "86%", "+11 pp", "Alcance confirmado", "ok"],
    ),
    features: ["Territorial Digital Twin", "Sensitive Receptor Management", "Social Exposure Analysis", "Air & Water Intelligence", "Infraestrutura e mobilidade", "Ocorrências comunitárias", "Coordenação institucional", "Mitigação e recuperação", "ArcGIS Hub Publication Gate"],
    flow: ["Localizar evento", "Identificar receptores", "Estimar exposição", "Cruzar observações", "Triar ocorrências", "Verificar em campo", "Decidir e comunicar", "Mitigar", "Recuperar ao baseline", "Aprender"],
    forms: ["Receptor e comunidade", "Ocorrência", "Monitoramento ambiental", "Amostra e cadeia de custódia", "Vistoria", "Stakeholder", "Comunicação", "Mitigação", "Recuperação"],
    inputs: ["HazardSurface / Incident", "IBGE Censo 2022", "GeoBases ES", "Sensores e laboratório", "Living Atlas", "Serviços e infraestrutura", "Relatos e campo"],
    outputs: ["TerritorialSignal", "TerritorialExposure", "Environmental / Social Impact", "ServiceDisruption", "Comunicação segmentada", "MitigationMeasure", "RemediationAction"],
    reports: ["Territorial Situation Report", "Community Exposure Report", "Sensitive Receptor Report", "Environmental Situation Report", "Infrastructure Disruption Report", "Territorial Post-Event Review"],
    charts: ["Mapa de exposição", "Sankey source–pathway–receptor", "Séries de ar e água", "Heatmap de ocorrências", "Disponibilidade de serviços", "Communication coverage", "Recovery curve"],
    external: ["GeoBases / IEMA", "IBGE Censo 2022", "CEMADEN", "ANA / SNIRH", "Living Atlas · VIIRS / Sentinel-2", "Municípios e Defesa Civil"],
    internal: ["Environmental Monitoring / LIMS", "Operational GIS", "SCADA / HSE", "Community Service", "Field Maps / Survey123", "ArcGIS Hub Publication Gate"],
    agents: ["TERRITORIAL ORCHESTRATOR", "RECEPTOR AGENT", "SOCIAL EXPOSURE", "ENVIRONMENTAL", "COMMUNITY TRIAGE", "CAUSALITY", "INFRASTRUCTURE", "INSTITUTIONAL", "COMMUNICATION", "FIELD VERIFICATION", "MITIGATION", "RECOVERY", "HOTSPOT", "PRIVACY GUARDIAN", "DATA QUALITY"],
    jobs: [
      { id: "TS-081", item: "Validar impacto de acesso C-07 e publicar sinal territorial", owner: "ORCHESTRATOR", due: "19:55", status: "Executando", priority: "Crítica" },
      { id: "FIELD-204", item: "Confirmar lâmina d'água em V-EXT-04", owner: "Equipe 04", due: "19:54", status: "Em campo", priority: "Crítica" },
      { id: "MIT-032", item: "Comparar efeito esperado × observado do desvio", owner: "MITIGATION", due: "20:40", status: "Monitorando", priority: "Alta" },
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
    status: "ALT-118 · aprovação 1/2",
    tone: "watch",
    badge: 2,
    metrics: makeMetrics(
      ["Cobertura planejada", "98,4%", "+1,2 pp", "Públicos prioritários", "ok"],
      ["Entrega multicanal", "94,7%", "4.617 entregues", "126 falhas tratadas", "watch"],
      ["Confirmação crítica", "88%", "22 / 25", "Autoridades e parceiros", "watch"],
      ["Conflitos de mensagem", "0", "−2", "Checagem concluída", "ok"],
    ),
    features: ["Alertas por impacto", "Redação assistida e acessível", "CAP 1.2", "Públicos e geofencing ArcGIS", "Orquestração multicanal", "Autoridade e publication gate", "Recibos, ACK e escalonamento", "Boletins, Q&A e rumor monitoring", "Privacy by design", "After-action review"],
    flow: ["Receber impacto", "Cruzar públicos", "Redigir por canal", "Checar consistência", "Validar autoridade", "Gerar CAP", "Despachar", "Monitorar entrega", "Confirmar", "Escalonar", "Atualizar", "Encerrar e aprender"],
    forms: ["Caso de comunicação", "Alerta por impacto", "Mensagem CAP 1.2", "Público geográfico", "Template e versão", "Instituição e contato", "Aprovação", "Confirmação estruturada", "Ocorrência e devolutiva"],
    inputs: ["RiskStatement e impacto", "Incident / Mission", "TerritorialContext", "Geofence e receptores", "Matriz de autoridade", "Templates aprovados", "CRM / contatos", "Saúde dos canais", "Delivery receipts"],
    outputs: ["CommunicationCase", "Mensagem CAP 1.2", "MessageVersion", "GeoAudience", "ChannelDispatch", "DeliveryReceipt", "Acknowledgement", "Escalation", "Boletim público", "EvidencePack"],
    reports: ["Communication Situation Report", "Alert Delivery Report", "Critical Acknowledgement Report", "Audience Coverage Report", "Channel Performance Report", "Failed Contact Report", "Institutional Coordination Report", "Communication After-Action Review"],
    charts: ["Funil target–delivery–ACK–action", "Timeline de versões", "Matriz público × canal", "Mapa de alcance e gaps", "Latência P95", "Falhas e retries", "Dúvidas e sinais conflitantes"],
    external: ["Defesa Civil / CAP", "Prefeituras e Saúde", "Provedores SMS e voz", "ArcGIS Hub", "ArcGIS Living Atlas", "Autoridade Portuária"],
    internal: ["HSE / Incident Command", "CRM / Contatos", "Teams / E-mail", "Workflow Manager", "Industrial Data Fabric", "Governance Control Plane"],
    agents: ["COMMUNICATION ORCHESTRATOR", "IMPACT TRANSLATOR", "AUDIENCE", "MESSAGE COMPOSER", "CAP AGENT", "CHANNEL ROUTER", "AUTHORITY GUARDIAN", "CONSISTENCY CHECKER", "DELIVERY MONITOR", "ACKNOWLEDGEMENT", "ESCALATION", "INSTITUTIONAL LIAISON", "RUMOR MONITOR", "ACCESSIBILITY & LANGUAGE", "PRIVACY GUARDIAN", "ARCHIVIST"],
    jobs: [
      { id: "ALT-118", item: "Aprovar e despachar alerta preventivo · drenagem e acessos", owner: "AUTHORITY GUARDIAN", due: "19:56", status: "Aprovação 1/2", priority: "Crítica" },
      { id: "ESC-018", item: "Obter ACK crítico da Defesa Civil", owner: "INSTITUTIONAL LIAISON", due: "20:06", status: "Escalonando", priority: "Crítica" },
      { id: "BOL-045", item: "Preparar atualização pública das 20:30", owner: "MESSAGE COMPOSER", due: "20:24", status: "Rascunho", priority: "Alta" },
    ],
  },
  {
    id: "11",
    key: "data",
    code: "DQ",
    icon: "∷",
    title: "Dados, Sensores e Infraestrutura",
    shortTitle: "Dados & Infra",
    mission: "Operar o sistema nervoso da plataforma com dados confiáveis, disponíveis, atualizados, rastreáveis, espaciais, redundantes, seguros e observáveis.",
    result: "Captura, transmissão, validação, normalização, publicação, monitoração, linhagem e recuperação ponta a ponta.",
    status: "7 incidentes · 2 críticos",
    tone: "watch",
    badge: 1,
    metrics: makeMetrics(
      ["Fontes online", "147 / 153", "96,1%", "6 em modo degradado", "watch"],
      ["Devices online", "1.842 / 1.911", "96,4%", "3 críticos indisponíveis", "watch"],
      ["Qualidade de dados", "94,7%", "108 rejeitados/s", "RAW preservado com flag", "watch"],
      ["Latência crítica P95", "1,8 s", "SLA 5 s", "7 incidentes · 2 críticos", "ok"],
    ),
    features: ["Industrial Data Fabric L0–L7", "Catálogo de fontes e produtos", "Device & sensor operations", "Quality flags e fallback", "Linhagem ponta a ponta", "Blast radius", "Store-and-forward", "HA, observabilidade e DR"],
    flow: ["Capturar", "Transmitir", "Receber", "Validar", "Normalizar", "Georreferenciar", "Enriquecer", "Publicar", "Monitorar", "Armazenar", "Rastrear", "Recuperar"],
    forms: ["Fonte e contrato", "Device / sensor / gateway", "Regra de qualidade", "Schema", "Pipeline", "Incidente de dados", "Manutenção", "Plano de recovery"],
    inputs: ["MQTT / OPC-UA", "APIs e arquivos", "SCADA / Historian", "Satélite", "Serviços externos"],
    outputs: ["Feeds e layers", "Score de confiança", "Alertas de qualidade", "Catálogo", "SLA e evidências"],
    reports: ["Disponibilidade", "Latência e cobertura", "Qualidade", "Calibração", "Consumo de APIs"],
    charts: ["Uptime", "Latência", "Completude", "Mapa de cobertura", "Sensor drift"],
    external: ["APIs meteorológicas", "Living Atlas", "IoT parceiros", "Dados públicos", "Satélite"],
    internal: ["ArcGIS Velocity", "Lakehouse", "Broker MQTT", "SCADA", "ITSM / Observabilidade"],
    agents: ["DATA GUARDIAN", "SOURCE GUARDIAN", "QUALITY", "SCHEMA GUARDIAN", "LATENCY", "DRIFT", "SPATIAL", "DEPENDENCY", "COVERAGE", "DEVICE HEALTH", "MAINTENANCE DISPATCHER", "API GUARDIAN", "BACKLOG", "SPOF", "RECOVERY", "CHANGE IMPACT"],
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
    status: "Health 92/100 · 3 exceções críticas",
    tone: "watch",
    badge: 2,
    metrics: makeMetrics(
      ["Controles efetivos", "96,4%", "281 / 292", "Continuous assurance", "ok"],
      ["Decisões críticas auditáveis", "100%", "48 / 48", "Snapshots reproduzíveis", "ok"],
      ["Modelos válidos", "27 / 29", "2 bloqueados", "Validação e uso permitido", "watch"],
      ["Exceções abertas", "12", "3 críticas", "Override com expiração", "critical"],
    ),
    features: ["Decision governance", "Evidence graph e vault", "Tamper-evident ledger", "Policies as code", "Controles contínuos", "Authority & SOD", "Model / threshold / AI governance", "Overrides, exceções e aceites", "Reprodutibilidade e assurance"],
    flow: ["Registrar contexto", "Validar artefatos", "Avaliar policies", "Aprovar com quorum", "Criar DecisionSnapshot", "Executar e evidenciar", "Monitorar controles", "Reproduzir", "Emitir assurance"],
    forms: ["Ficha de modelo", "Limiar", "Mudança", "Aprovação e exceção", "Evidência e revisão"],
    inputs: ["Modelos e parâmetros", "Dados e regras", "Decisões e logs", "Usuários", "Documentos"],
    outputs: ["Versão vigente", "Trilha de auditoria", "Pacote de evidências", "Alerta de drift", "Plano de ação"],
    reports: ["Inventário", "Modelos vencidos", "Limiar sem validação", "Mudanças e acessos", "Auditoria de evento"],
    charts: ["Status por estágio", "Aging", "Drift", "Cobertura de validação", "Heatmap de acesso"],
    external: ["IPCC / WMO", "Normas ISO", "Referenciais Esri", "Regulação", "Academia"],
    internal: ["IAM / SIEM", "GRC", "MLOps", "Documentos", "Todos os workspaces"],
    agents: ["GOVERNANCE ORCHESTRATOR", "POLICY GUARDIAN", "EVIDENCE AUDITOR", "MODEL GOVERNANCE", "THRESHOLD GOVERNANCE", "AI GOVERNANCE", "DECISION AUDITOR", "ACCESS GOVERNANCE", "EXCEPTION", "COMPLIANCE MAPPING", "REPRODUCIBILITY", "CONTROL MONITOR", "CHANGE IMPACT"],
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
            const [GraphicsLayer, Graphic, FeatureLayer, ImageryLayer, GeoJSONLayer, MapImageLayer] = await arcgis.import([
              "@arcgis/core/layers/GraphicsLayer.js",
              "@arcgis/core/Graphic.js",
              "@arcgis/core/layers/FeatureLayer.js",
              "@arcgis/core/layers/ImageryLayer.js",
              "@arcgis/core/layers/GeoJSONLayer.js",
              "@arcgis/core/layers/MapImageLayer.js",
            ]);

            const assetLayer = new GraphicsLayer({ title: "Ativos críticos · Vale" });
            const riskLayer = new GraphicsLayer({ title: "Impacto simulado P90" });
            const territoryLayer = new GraphicsLayer({ title: "Comunidades e áreas territoriais" });
            const receptorLayer = new GraphicsLayer({ title: "Receptores sensíveis" });
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

            [
              { id: "C-07", name: "Comunidade C-07", pop: "2.480", rings: [[[-40.271,-20.292],[-40.262,-20.295],[-40.257,-20.290],[-40.261,-20.285],[-40.269,-20.286],[-40.271,-20.292]]] },
              { id: "C-03", name: "Comunidade C-03", pop: "3.120", rings: [[[-40.266,-20.279],[-40.258,-20.282],[-40.254,-20.276],[-40.260,-20.271],[-40.267,-20.274],[-40.266,-20.279]]] },
            ].forEach((area) => territoryLayer.add(new Graphic({
              geometry: { type: "polygon", rings: area.rings },
              symbol: { type: "simple-fill", color: [214,165,66,.13], outline: { color: [214,165,66,.9], width: 1.2, style: "dash" } },
              attributes: { Id: area.id, Nome: area.name, Populacao: area.pop, Fonte: "Área operacional de referência · SIMULATED" },
              popupTemplate: { title: "{Nome}", content: "População estimada: {Populacao}<br/>Fonte: {Fonte}" },
            })));

            [
              { id: "E-014", name: "Escola E-014", type: "Educação", x: -40.264, y: -20.289, criticality: "Alta" },
              { id: "US-03", name: "Unidade de Saúde US-03", type: "Saúde", x: -40.267, y: -20.284, criticality: "Crítica" },
              { id: "L-03", name: "Lagoa L-03", type: "Ambiental", x: -40.258, y: -20.296, criticality: "Alta" },
              { id: "V-EXT-04", name: "Acesso V-EXT-04", type: "Infraestrutura", x: -40.262, y: -20.292, criticality: "Crítica" },
            ].forEach((receptor) => receptorLayer.add(new Graphic({
              geometry: { type: "point", longitude: receptor.x, latitude: receptor.y },
              symbol: { type: "simple-marker", style: receptor.type === "Ambiental" ? "triangle" : "circle", color: receptor.criticality === "Crítica" ? [199,67,79,1] : [210,138,46,1], size: 10, outline: { color: [255,255,255,.95], width: 1.5 } },
              attributes: { ReceptorId: receptor.id, Nome: receptor.name, Tipo: receptor.type, Criticidade: receptor.criticality },
              popupTemplate: { title: "{Nome}", content: "Tipo: {Tipo}<br/>Criticidade: {Criticidade}" },
            })));

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
            const geobases = new MapImageLayer({
              url: "https://gis.geobases.es.gov.br/server/rest/services/gb/IJSN_SEDU_Edificacoes_de_Ensino_ES/MapServer",
              title: "Edificações de ensino · GeoBases ES",
              visible: layerVisibility.geobases,
              opacity: 0.72,
            });
            const ibge = new GeoJSONLayer({
              url: "https://servicodados.ibge.gov.br/api/v3/malhas/municipios/3205309?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio",
              title: "Malha municipal de Vitória · IBGE",
              visible: layerVisibility.ibge,
              opacity: 0.18,
              renderer: { type: "simple", symbol: { type: "simple-fill", color: [91,107,176,.08], outline: { color: [126,142,210,.9], width: 1.2 } } },
            });

            assetLayer.visible = layerVisibility.assets;
            riskLayer.visible = layerVisibility.risk;
            territoryLayer.visible = layerVisibility.territory;
            receptorLayer.visible = layerVisibility.receptors;
            layerRefs.current = { assets: assetLayer, risk: riskLayer, territory: territoryLayer, receptors: receptorLayer, geobases, ibge, viirs, landCover };
            mapEl.map.addMany([landCover, ibge, geobases, viirs, territoryLayer, riskLayer, receptorLayer, assetLayer]);

            if (mapEl.view?.on && onAssetSelect) {
              clickHandle = mapEl.view.on("click", async (event: unknown) => {
                const response = await mapEl.view.hitTest(event);
                const hit = response?.results?.find((result: any) => result.graphic?.layer === assetLayer);
                const assetId = hit?.graphic?.attributes?.AssetId;
                if (assetId) onAssetSelect(String(assetId));
              });
            }

            const settled = await Promise.allSettled([viirs.load(), landCover.load(), geobases.load(), ibge.load()]);
            const loaded = settled.filter((item) => item.status === "fulfilled").length;
            onMapStatus(`ArcGIS 5.1 · fontes abertas ${loaded}/4`);
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
  const [layers, setLayers] = useState<Record<string, boolean>>({ assets: true, risk: true, territory: true, receptors: true, geobases: true, ibge: true, viirs: false, landCover: false });
  const [scenarioName, setScenarioName] = useState("Chuva extrema + maré elevada");
  const [horizon, setHorizon] = useState("+24H");
  const [profile, setProfile] = useState("Executivo");
  const [selectedAsset, setSelectedAsset] = useState("C17");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const lastScenarioFeed = useRef(2);
  const routeInitialized = useRef(false);

  const active = useMemo(() => workspaces.find((item) => item.key === activeKey) ?? workspaces[0], [activeKey]);
  const catalogModule = useMemo(() => workspaces.find((item) => item.key === catalogKey) ?? workspaces[0], [catalogKey]);
  const activeScenarioStages = activeKey === "climate" ? climateScenarioStages : activeKey === "hazards" ? hazardScenarioStages : activeKey === "twin" ? twinScenarioStages : activeKey === "chain" ? chainScenarioStages : activeKey === "planning" ? planningScenarioStages : activeKey === "risk" ? riskScenarioStages : activeKey === "emergency" ? emergencyScenarioStages : activeKey === "environment" ? environmentScenarioStages : activeKey === "communications" ? communicationsScenarioStages : activeKey === "data" ? dataScenarioStages : activeKey === "governance" ? governanceScenarioStages : scenarioStages;
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
    } else if (hash.startsWith("#twin/")) {
      const route = hash.replace(/^#twin\//, "");
      const matchedTab = twinTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("twin");
        setSubview(matchedTab);
        setScenarioStep(3);
        setSelectedAsset("C17");
        setFeed(twinBaseFeed.map((item, index) => ({ id: 410 + index, time: `18:45:${String(24 + index * 2).padStart(2, "0")}`, ...item })));
      }
    } else if (hash.startsWith("#chain/")) {
      const route = hash.replace(/^#chain\//, "");
      const matchedTab = chainTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("chain");
        setSubview(matchedTab);
        setScenarioStep(10);
        setSelectedAsset("CONV-C17");
        setFeed(chainBaseFeed.map((item, index) => ({ id: 510 + index, time: `18:45:${String(31 + index * 3).padStart(2, "0")}`, ...item })));
      }
    } else if (hash.startsWith("#planning/")) {
      const route = hash.replace(/^#planning\//, "");
      const matchedTab = planningTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("planning");
        setSubview(matchedTab);
        setScenarioStep(9);
        setSelectedAsset("CONV-C17");
        setFeed(planningBaseFeed.map((item, index) => ({ id: 610 + index, time: `18:45:${String(44 + index * 3).padStart(2, "0")}`, ...item })));
      }
    } else if (hash.startsWith("#risk/")) {
      const route = hash.replace(/^#risk\//, "");
      const matchedTab = riskTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("risk");
        setSubview(matchedTab);
        setScenarioStep(5);
        setSelectedAsset("R-021");
        setFeed(riskBaseFeed.map((item, index) => ({ id: 710 + index, time: `18:50:${String(5 + index * 7).padStart(2, "0")}`, ...item })));
      }
    } else if (hash.startsWith("#emergency/")) {
      const route = hash.replace(/^#emergency\//, "");
      const matchedTab = emergencyTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("emergency");
        setSubview(matchedTab);
        setScenarioStep(7);
        setSelectedAsset("D-04");
        setFeed(emergencyBaseFeed.map((item, index) => ({ id: 810 + index, time: `18:41:${String(15 + index * 7).padStart(2, "0")}`, ...item })));
      }
    } else if (hash.startsWith("#environment/")) {
      const route = hash.replace(/^#environment\//, "");
      const matchedTab = environmentTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("environment");
        setSubview(matchedTab);
        setScenarioStep(9);
        setSelectedAsset("C-07");
        setFeed(environmentBaseFeed.map((item, index) => ({ id: 910 + index, time: `19:34:${String(5 + index * 3).padStart(2, "0")}`, ...item })));
      }
    } else if (hash.startsWith("#communications/")) {
      const route = hash.replace(/^#communications\//, "");
      const matchedTab = communicationsTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("communications");
        setSubview(matchedTab);
        setScenarioStep(5);
        setSelectedAsset("C-07");
        setFeed(communicationsBaseFeed.map((item, index) => ({ id: 1210 + index, time: `19:${String(45 + index * 2).padStart(2, "0")}:00`, ...item })));
      }
    } else if (hash.startsWith("#data/")) {
      const route = hash.replace(/^#data\//, "");
      const matchedTab = dataTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("data");
        setSubview(matchedTab);
        setScenarioStep(5);
        setFeed(dataBaseFeed.map((item, index) => ({ id: 1010 + index, time: `09:25:${String(2 + index * 3).padStart(2, "0")}`, ...item })));
      }
    } else if (hash.startsWith("#governance/")) {
      const route = hash.replace(/^#governance\//, "");
      const matchedTab = governanceTabs.find((tab) => controlRouteSlug(tab) === route);
      if (matchedTab) {
        setActiveKey("governance");
        setSubview(matchedTab);
        setScenarioStep(6);
        setFeed(governanceBaseFeed.map((item, index) => ({ id: 1110 + index, time: `19:45:${String(1 + index * 3).padStart(2, "0")}`, ...item })));
      }
    }
    const routeTimer = window.setTimeout(() => { routeInitialized.current = true; }, 0);
    return () => window.clearTimeout(routeTimer);
  }, []);

  useEffect(() => {
    if (!routeInitialized.current) return;
    if (activeKey !== "control" && activeKey !== "climate" && activeKey !== "hazards" && activeKey !== "twin" && activeKey !== "chain" && activeKey !== "planning" && activeKey !== "risk" && activeKey !== "emergency" && activeKey !== "environment" && activeKey !== "communications" && activeKey !== "data" && activeKey !== "governance") return;
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
    const entry = (activeKey === "climate" ? climateScenarioFeed : activeKey === "hazards" ? hazardScenarioFeed : activeKey === "twin" ? twinScenarioFeed : activeKey === "chain" ? chainScenarioFeed : activeKey === "planning" ? planningScenarioFeed : activeKey === "risk" ? riskScenarioFeed : activeKey === "emergency" ? emergencyScenarioFeed : activeKey === "environment" ? environmentScenarioFeed : activeKey === "communications" ? communicationsScenarioFeed : activeKey === "data" ? dataScenarioFeed : activeKey === "governance" ? governanceScenarioFeed : scenarioFeed)[scenarioStep];
    if (entry) {
      setFeed((items) => [
        { id: Date.now(), time: now.toLocaleTimeString("pt-BR", { hour12: false }), ...entry },
        ...items,
      ].slice(0, 8));
    }
    if ((activeKey === "control" && scenarioStep === 11) || (activeKey === "emergency" && scenarioStep >= 8 && scenarioStep < 14) || (activeKey === "environment" && scenarioStep >= 4 && scenarioStep < 13)) setIncidentMode(true);
    if ((activeKey === "emergency" || activeKey === "environment") && scenarioStep >= 14) setIncidentMode(false);
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
    setSubview(key === "control" ? "Situação integrada" : key === "climate" ? "Visão Geral" : key === "hazards" ? "Situação Multiameaças" : key === "twin" ? "Situação Operacional" : key === "chain" ? "Situação da Cadeia" : key === "planning" ? "Situação do Plano" : key === "risk" ? "Situação" : key === "emergency" ? "Situação" : key === "environment" ? "Situação Territorial" : key === "communications" || key === "data" || key === "governance" ? "Situação" : "Visão geral");
    setScenarioStep(key === "control" ? 2 : key === "twin" ? 3 : key === "chain" ? 10 : key === "planning" ? 9 : key === "risk" ? 5 : key === "emergency" ? 7 : key === "environment" ? 9 : key === "communications" ? 5 : key === "data" ? 5 : key === "governance" ? 6 : 0);
    setScenarioRunning(false);
    setIncidentMode(false);
    setFeed(key === "climate" ? climateBaseFeed : key === "hazards" ? hazardInitialFeed : key === "twin" ? twinBaseFeed.map((item, index) => ({ id: 410 + index, time: `18:45:${String(24 + index * 2).padStart(2, "0")}`, ...item })) : key === "chain" ? chainBaseFeed.map((item, index) => ({ id: 510 + index, time: `18:45:${String(31 + index * 3).padStart(2, "0")}`, ...item })) : key === "planning" ? planningBaseFeed.map((item, index) => ({ id: 610 + index, time: `18:45:${String(44 + index * 3).padStart(2, "0")}`, ...item })) : key === "risk" ? riskBaseFeed.map((item, index) => ({ id: 710 + index, time: `18:50:${String(5 + index * 7).padStart(2, "0")}`, ...item })) : key === "emergency" ? emergencyBaseFeed.map((item, index) => ({ id: 810 + index, time: `18:41:${String(15 + index * 7).padStart(2, "0")}`, ...item })) : key === "environment" ? environmentBaseFeed.map((item, index) => ({ id: 910 + index, time: `19:34:${String(5 + index * 3).padStart(2, "0")}`, ...item })) : key === "communications" ? communicationsBaseFeed.map((item, index) => ({ id: 1210 + index, time: `19:${String(45 + index * 2).padStart(2, "0")}:00`, ...item })) : key === "data" ? dataBaseFeed.map((item, index) => ({ id: 1010 + index, time: `09:25:${String(2 + index * 3).padStart(2, "0")}`, ...item })) : key === "governance" ? governanceBaseFeed.map((item, index) => ({ id: 1110 + index, time: `19:45:${String(1 + index * 3).padStart(2, "0")}`, ...item })) : baseFeed);
    lastScenarioFeed.current = key === "control" ? 2 : key === "twin" ? 3 : key === "chain" ? 10 : key === "planning" ? 9 : key === "risk" ? 5 : key === "emergency" ? 7 : key === "environment" ? 9 : key === "communications" ? 5 : key === "data" ? 5 : key === "governance" ? 6 : 0;
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
    setFeed(activeKey === "climate" ? climateBaseFeed : activeKey === "hazards" ? hazardInitialFeed : activeKey === "twin" ? twinBaseFeed.map((item, index) => ({ id: 410 + index, time: `18:45:${String(24 + index * 2).padStart(2, "0")}`, ...item })) : activeKey === "chain" ? chainBaseFeed.map((item, index) => ({ id: 510 + index, time: `18:45:${String(31 + index * 3).padStart(2, "0")}`, ...item })) : activeKey === "planning" ? planningBaseFeed.map((item, index) => ({ id: 610 + index, time: `18:45:${String(44 + index * 3).padStart(2, "0")}`, ...item })) : activeKey === "risk" ? riskBaseFeed.map((item, index) => ({ id: 710 + index, time: `18:50:${String(5 + index * 7).padStart(2, "0")}`, ...item })) : activeKey === "emergency" ? emergencyBaseFeed.map((item, index) => ({ id: 810 + index, time: `18:41:${String(15 + index * 7).padStart(2, "0")}`, ...item })) : activeKey === "environment" ? environmentBaseFeed.map((item, index) => ({ id: 910 + index, time: `19:34:${String(5 + index * 3).padStart(2, "0")}`, ...item })) : activeKey === "communications" ? communicationsBaseFeed.map((item, index) => ({ id: 1210 + index, time: `19:${String(45 + index * 2).padStart(2, "0")}:00`, ...item })) : activeKey === "data" ? dataBaseFeed.map((item, index) => ({ id: 1010 + index, time: `09:25:${String(2 + index * 3).padStart(2, "0")}`, ...item })) : activeKey === "governance" ? governanceBaseFeed.map((item, index) => ({ id: 1110 + index, time: `19:45:${String(1 + index * 3).padStart(2, "0")}`, ...item })) : baseFeed);
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

  const tabNames = activeKey === "control" ? controlTabs : activeKey === "climate" ? climateTabs : activeKey === "hazards" ? hazardTabs : activeKey === "twin" ? twinTabs : activeKey === "chain" ? chainTabs : activeKey === "planning" ? planningTabs : activeKey === "risk" ? riskTabs : activeKey === "emergency" ? emergencyTabs : activeKey === "environment" ? environmentTabs : activeKey === "communications" ? communicationsTabs : activeKey === "data" ? dataTabs : activeKey === "governance" ? governanceTabs : ["Visão geral", "Mapa vivo", "Workflows", "Relatórios", "Integrações"];
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
          {activeKey === "twin" ? <div className="control-sidebar-subnav twin-sidebar-subnav"><span>GÊMEO OPERACIONAL</span>{twinTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Inspeções" ? <b>2</b> : tab === "Liberações" ? <b>1</b> : null}</button>)}</div> : null}
          {activeKey === "chain" ? <div className="control-sidebar-subnav chain-sidebar-subnav"><span>CADEIA E GARGALOS</span>{chainTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Restrições" ? <b>4</b> : tab === "Compromissos" ? <b>1</b> : null}</button>)}</div> : null}
          {activeKey === "planning" ? <div className="control-sidebar-subnav planning-sidebar-subnav"><span>PLANEJAMENTO E CENÁRIOS</span>{planningTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Alternativas & Decisão" ? <b>1</b> : tab === "Aderência & Replan" ? <b>2</b> : null}</button>)}</div> : null}
          {activeKey === "risk" ? <div className="control-sidebar-subnav risk-sidebar-subnav"><span>RISCOS E FINANÇAS</span>{riskTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Registro de Riscos" ? <b>4</b> : tab === "Stress Tests" ? <b>2</b> : tab === "Apetite" ? <b>1</b> : null}</button>)}</div> : null}
          {activeKey === "emergency" ? <div className="control-sidebar-subnav emergency-sidebar-subnav"><span>EMERGÊNCIA E CONTINUIDADE</span>{emergencyTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Alertas" ? <b>4</b> : tab === "Incidentes" ? <b>1</b> : tab === "Tarefas" ? <b>3</b> : null}</button>)}</div> : null}
          {activeKey === "environment" ? <div className="control-sidebar-subnav environment-sidebar-subnav"><span>AMBIENTE, SOCIEDADE E ENTORNO</span>{environmentTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Ocorrências" ? <b>5</b> : tab === "Campo" ? <b>4</b> : tab === "Comunicação" ? <b>3</b> : null}</button>)}</div> : null}
          {activeKey === "communications" ? <div className="control-sidebar-subnav communications-sidebar-subnav"><span>COMUNICAÇÃO E ALERTAS</span>{communicationsTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Alertas" ? <b>2</b> : tab === "Confirmações" ? <b>3</b> : tab === "Escalonamentos" ? <b>1</b> : tab === "Aprovações" ? <b>7</b> : null}</button>)}</div> : null}
          {activeKey === "data" ? <div className="control-sidebar-subnav"><span>DADOS, SENSORES E INFRAESTRUTURA</span>{dataTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Incidentes" ? <b>7</b> : tab === "Sensores" ? <b>3</b> : null}</button>)}</div> : null}
          {activeKey === "governance" ? <div className="control-sidebar-subnav"><span>GOVERNANÇA E AUDITORIA</span>{governanceTabs.map((tab) => <button className={subview === tab ? "active" : ""} key={tab} onClick={() => setSubview(tab)}><i />{tab}{tab === "Aprovações" ? <b>7</b> : tab === "Exceções" ? <b>12</b> : null}</button>)}</div> : null}
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
          <div><span className="incident-symbol">!</span><strong>{activeKey === "emergency" ? "INC-024 · Modo comando N3" : activeKey === "environment" ? "TS-081 · Impacto territorial HIGH" : "Modo incidente N2"}</strong><span>{activeKey === "emergency" ? "Inundação · OP-01 · 7 equipes" : activeKey === "environment" ? "C-07 · 4.820 pessoas · V-EXT-04" : "Chuva extrema · comando preparado"}</span></div>
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
              <button className="primary-button" onClick={activeKey === "climate" ? publishClimateSignal : activeKey === "hazards" ? () => setSubview("Execuções") : activeKey === "twin" ? () => setSubview("Inspeções") : activeKey === "chain" ? () => setSubview("Restrições") : activeKey === "planning" ? () => setSubview("Cenários") : activeKey === "risk" ? () => setSubview("Stress Tests") : activeKey === "emergency" ? () => setSubview("Incidentes") : activeKey === "environment" ? () => setSubview("Ocorrências") : activeKey === "communications" ? () => setSubview("Redação Assistida") : activeKey === "data" ? () => setSubview("Incidentes") : activeKey === "governance" ? () => setSubview("Aprovações") : () => setDispatchOpen(true)}>{activeKey === "climate" ? "＋ Publicar sinal" : activeKey === "hazards" ? "＋ Novo model run" : activeKey === "twin" ? "＋ Nova vistoria" : activeKey === "chain" ? "＋ Nova restrição" : activeKey === "planning" ? "＋ Novo cenário" : activeKey === "risk" ? "＋ Novo stress test" : activeKey === "emergency" ? "＋ Declarar incidente" : activeKey === "environment" ? "＋ Nova ocorrência" : activeKey === "communications" ? "＋ Novo alerta" : activeKey === "data" ? "＋ Novo incidente" : activeKey === "governance" ? "＋ Nova aprovação" : "＋ Novo despacho"}</button>
            </div>
          </div>
          {activeKey === "control" || activeKey === "climate" || activeKey === "hazards" || activeKey === "twin" || activeKey === "chain" || activeKey === "planning" || activeKey === "risk" || activeKey === "emergency" || activeKey === "environment" || activeKey === "communications" || activeKey === "data" || activeKey === "governance" ? <div className="operational-context-bar"><div className="horizon-control"><span>HORIZONTE</span>{(activeKey === "climate" ? ["AGORA", "+6H", "+24H", "+72H", "15D", "6M", "2050"] : activeKey === "planning" ? ["AGORA", "+6H", "+12H", "+24H", "+48H", "+72H", "7D", "CENÁRIO"] : activeKey === "risk" ? ["AGORA", "+24H", "1Y", "2030", "2050", "EVENTO", "STRESS"] : activeKey === "emergency" ? ["AGORA", "+30M", "+2H", "+6H", "+12H", "OP-01", "RECOVERY"] : activeKey === "environment" ? ["AGORA", "+1H", "+3H", "+6H", "+12H", "EVENTO", "RECOVERY"] : activeKey === "communications" ? ["AGORA", "+15M", "+1H", "+3H", "+6H", "EVENTO", "PÓS-EVENTO"] : activeKey === "data" ? ["AGORA", "+5M", "+30M", "+2H", "+6H", "INCIDENTE", "RECOVERY"] : activeKey === "governance" ? ["AGORA", "DECISÃO", "EVENTO", "30D", "90D", "AUDIT", "REPLAY"] : activeKey === "hazards" || activeKey === "twin" || activeKey === "chain" ? ["AGORA", "+1H", "+3H", "+6H", "+12H", "+24H", "CENÁRIO"] : ["AGORA", "+6H", "+24H", "+72H", "7D", "30D", "CENÁRIO"]).map((item) => <button className={horizon === item ? "active" : ""} key={item} onClick={() => { setHorizon(item); setToast(`Contexto sincronizado em ${item}: mapa, gráficos, probabilidades e briefing`); }}>{item}</button>)}</div><div className="context-summary"><span>{activeKey === "climate" ? "ClimateContext" : activeKey === "hazards" ? "HazardContext" : activeKey === "twin" ? "AssetContext" : activeKey === "chain" ? "ChainContext" : activeKey === "planning" ? "ScenarioContext" : activeKey === "risk" ? "RiskContext" : activeKey === "emergency" ? "IncidentContext" : activeKey === "environment" ? "TerritorialContext" : activeKey === "communications" ? "CommunicationContext" : activeKey === "data" ? "DataQualityContext" : activeKey === "governance" ? "GovernanceContext" : "OperationalContext"}</span><strong>Tubarão · {horizon} · {scenarioName}</strong><small>{profile} · {activeKey === "climate" ? "FR-2204" : activeKey === "hazards" ? "HMR-882 · HS-882" : activeKey === "twin" ? `${selectedAsset} · HS-882` : activeKey === "chain" ? `PR-881 · BOT-022 · ${selectedAsset}` : activeKey === "planning" ? "SCN-0184 · PLN-v18 → ALT-B" : activeKey === "risk" ? "RS-041 · R-021 · FI-021" : activeKey === "emergency" ? "AL-0187 · ACT-019 · INC-024" : activeKey === "environment" ? "TS-081 · C-07 · OCC-GROUP-018" : activeKey === "communications" ? "COM-2026-018 · ALT-118 · TS-081" : activeKey === "data" ? "GW-03 · NIV-04 · 147/153 sources" : activeKey === "governance" ? "DEC-0248 · DS-0248 · POL-OPS-17" : selectedAsset} · {stage.label}</small></div></div> : null}
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
            onTwin={() => { selectWorkspace("twin"); setSubview("Exposição & Vulnerabilidade"); setToast("HS-882 entregue ao Gêmeo Operacional · intersect com ativos preparado"); }}
          /> : null}

          {activeKey === "twin" ? <TwinModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            selectedAsset={selectedAsset}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onHorizon={setHorizon}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onSelectAsset={setSelectedAsset}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onHazards={() => { selectWorkspace("hazards"); setSubview("Hidrologia & Inundação"); setToast("Abrindo HazardSurface HS-882 no Módulo 3"); }}
            onChain={() => { selectWorkspace("chain"); setSubview("Propagação"); setToast("AssetConstraint AC-2084 entregue ao Módulo 5 · PropagationRun PR-881 iniciado"); }}
            onTower={() => { selectWorkspace("control"); setSubview("Situação integrada"); setToast("Mudança de estado e capacidade publicada na Torre de Controle"); }}
          /> : null}

          {activeKey === "chain" ? <ChainModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            selectedAsset={selectedAsset}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onHorizon={setHorizon}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onSelectAsset={setSelectedAsset}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTwin={() => { selectWorkspace("twin"); setSubview("Capacidade & Restrições"); setSelectedAsset("C17"); setToast("Abrindo AC-2084 e CONST-201 no Gêmeo Operacional"); }}
            onHazards={() => { selectWorkspace("hazards"); setSubview("Hidrologia & Inundação"); setToast("Abrindo HMR-882 e HS-882 no Módulo 3"); }}
            onTower={() => { selectWorkspace("control"); setSubview("Sinais"); setToast("ChainSignal CHS-0184 aberto na Torre de Controle"); }}
            onPlanning={() => { selectWorkspace("planning"); setSubview("Cenários"); setToast("CHS-0184 e PlanningConstraintSet carregados no wizard do Módulo 6"); }}
            onRisk={() => { selectWorkspace("risk"); setSubview("Financeiro"); setToast("CHS-0184, impacto operacional e demurrage carregados no Módulo 7"); }}
          /> : null}

          {activeKey === "planning" ? <PlanningModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            selectedAsset={selectedAsset}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onHorizon={setHorizon}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onSelectAsset={setSelectedAsset}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTower={() => { selectWorkspace("control"); setSubview("Decisões"); setToast("DEC-0248 e PlanningRecommendation abertos na Torre de Controle"); }}
            onClimate={() => { selectWorkspace("climate"); setSubview("Previsão 0–72h"); setToast("Abrindo ForecastRun FR-2204 e premissas P10/P50/P90"); }}
            onHazards={() => { selectWorkspace("hazards"); setSubview("Hidrologia & Inundação"); setToast("Abrindo HMR-882; rerun físico SCN-B disponível"); }}
            onTwin={() => { selectWorkspace("twin"); setSubview("Capacidade & Restrições"); setSelectedAsset("C17"); setToast("Abrindo AssetConstraint AI-2084 e Scenario Asset State"); }}
            onChain={() => { selectWorkspace("chain"); setSubview("Cenários & Histórico"); setToast("Abrindo CHS-0184 e ChainScenario ALT-B no Módulo 5"); }}
            onRisk={() => { selectWorkspace("risk"); setSubview("Adaptação"); setToast("Alternativas, custos, risco residual e perdas evitadas carregados no Módulo 7"); }}
          /> : null}

          {activeKey === "risk" ? <RiskModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onHorizon={setHorizon}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTower={() => { selectWorkspace("control"); setSubview("Decisões"); setToast("RS-041 e recomendação ALT-B abertos na Torre de Controle"); }}
            onClimate={() => { selectWorkspace("climate"); setSubview("Projeções"); setToast("Premissas físicas, CMIP6 e ClimateContext do risco abertos no Módulo 2"); }}
            onHazards={() => { selectWorkspace("hazards"); setSubview("Hidrologia & Inundação"); setToast("HMR-882 e função de intensidade abertos no Módulo 3"); }}
            onTwin={() => { selectWorkspace("twin"); setSubview("Exposição & Vulnerabilidade"); setSelectedAsset("C17"); setToast("AI-2084, vulnerabilidade e capacidade C17 abertos no Módulo 4"); }}
            onChain={() => { selectWorkspace("chain"); setSubview("Propagação"); setToast("CHS-0184, contratos e atraso MV Atlas abertos no Módulo 5"); }}
            onPlanning={() => { selectWorkspace("planning"); setSubview("Alternativas & Decisão"); setToast("SCN-0184 e ALT-B abertos no Módulo 6"); }}
            onEmergency={() => { selectWorkspace("emergency"); setSubview("Danos"); setToast("LOSS-2026-018 e Damage Assessment abertos no Módulo 8"); }}
            onTerritory={() => { selectWorkspace("environment"); setSubview("Situação Territorial"); setToast("Materialidade TS-081 e receptores C-07 abertos no Módulo 9"); }}
            onData={() => { selectWorkspace("data"); setSubview("Qualidade"); setToast("DataQualityContext e fontes financeiras abertas no Módulo 10"); }}
            onGovernance={() => { selectWorkspace("governance"); setSubview("Evidências"); setToast("Snapshot, autoridade, evidências e publication gate abertos no Módulo 11"); }}
          /> : null}

          {activeKey === "emergency" ? <EmergencyModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTower={() => { selectWorkspace("control"); setSubview("Situação integrada"); setToast("INC-024, objetivos, tarefas críticas e recovery abertos na Torre"); }}
            onHazards={() => { selectWorkspace("hazards"); setSubview("Hidrologia & Inundação"); setToast("HMR-882 e evolução do perigo abertos no Módulo 3"); }}
            onTwin={() => { selectWorkspace("twin"); setSubview("Situação Operacional"); setSelectedAsset("D-04"); setToast("FR-288 e estado D-04 abertos no Gêmeo Operacional"); }}
            onChain={() => { selectWorkspace("chain"); setSubview("Recuperação"); setToast("RP-024 e milestones de recovery abertos no Módulo 5"); }}
            onPlanning={() => { selectWorkspace("planning"); setSubview("Plano Aprovado"); setToast("PLN-v19 e ações preventivas abertos no Módulo 6"); }}
            onRisk={() => { selectWorkspace("risk"); setSubview("Perdas"); setToast("Danos, downtime, recursos e recovery carregados em Loss Events no Módulo 7"); }}
            onTerritory={() => { selectWorkspace("environment"); setSubview("Situação Territorial"); setToast("INC-024 e HMR-882 enviados à análise territorial do Módulo 9"); }}
          /> : null}

          {activeKey === "environment" ? <EnvironmentModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTower={() => { selectWorkspace("control"); setSubview("Situação integrada"); setToast("TS-081, população, receptores e decisão material abertos na Torre"); }}
            onHazards={() => { selectWorkspace("hazards"); setSubview("Hidrologia & Inundação"); setToast("HMR-882 e HazardSurface abertos no Módulo 3"); }}
            onTwin={() => { selectWorkspace("twin"); setSubview("Situação Operacional"); setSelectedAsset("SE-04"); setToast("External utility disruption aberto no Gêmeo Operacional"); }}
            onPlanning={() => { selectWorkspace("planning"); setSubview("Aderência & Replan"); setToast("TerritorialConstraint e rota +18 min abertos no Módulo 6"); }}
            onRisk={() => { selectWorkspace("risk"); setSubview("Ambiental e Social"); setToast("Materialidade ambiental, social e custo de recovery carregados no Módulo 7"); }}
            onEmergency={() => { selectWorkspace("emergency"); setSubview("Situação"); setToast("TS-081 e receptores críticos abertos no Módulo 8"); }}
          /> : null}

          {activeKey === "communications" ? <CommunicationsModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onHorizon={setHorizon}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTower={() => { selectWorkspace("control"); setSubview("Decisões"); setToast("COM-2026-018, ALT-118 e APR-118 abertos na Torre de Controle"); }}
            onEmergency={() => { selectWorkspace("emergency"); setSubview("Comunicações"); setToast("INC-024, missões e confirmações críticas abertos no Módulo 8"); }}
            onTerritory={() => { selectWorkspace("environment"); setSubview("Situação Territorial"); setToast("TS-081, geofence C-07 e receptores abertos no Módulo 9"); }}
            onRisk={() => { selectWorkspace("risk"); setSubview("Situação"); setToast("RS-041, materialidade e decisão de comunicar abertos no Módulo 7"); }}
            onData={() => { selectWorkspace("data"); setSubview("Integrações"); setToast("Saúde dos canais, receipts e latência abertos no Módulo 10"); }}
            onGovernance={() => { selectWorkspace("governance"); setSubview("Aprovações"); setToast("APR-118, authority matrix, snapshots e evidências abertos no Módulo 11"); }}
            onPlanning={() => { selectWorkspace("planning"); setSubview("Plano Aprovado"); setToast("PLN-v19, ações e janelas de comunicação abertos no Módulo 6"); }}
          /> : null}

          {activeKey === "data" ? <DataModule
            subview={subview}
            horizon={horizon}
            profile={profile}
            scenarioStep={scenarioStep}
            stage={stage}
            mapStatus={mapStatus}
            layers={layers}
            renderMap={() => <ArcGISMap activeWorkspace={active} layerVisibility={layers} onMapStatus={setMapStatus} onAssetSelect={setSelectedAsset} />}
            onToggleLayer={(key) => setLayers((value) => ({ ...value, [key]: !value[key] }))}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTower={() => { selectWorkspace("control"); setSubview("Situação integrada"); setToast("DataQualityContext e blast radius abertos na Torre"); }}
            onClimate={() => { selectWorkspace("climate"); setSubview("Observações"); setToast("Observações, fallback e quality flags abertos no Módulo 2"); }}
            onHazards={() => { selectWorkspace("hazards"); setSubview("Execuções"); setToast("InputReadiness e confidence penalty abertos no Módulo 3"); }}
            onTwin={() => { selectWorkspace("twin"); setSubview("Sensores & Saúde"); setToast("Device health e estado NIV-04 abertos no Módulo 4"); }}
            onChain={() => { selectWorkspace("chain"); setSubview("Porto & Navios"); setToast("Feeds AIS/VTS e lineage abertos no Módulo 5"); }}
            onPlanning={() => { selectWorkspace("planning"); setSubview("Restrições"); setToast("Disponibilidade dos dados consumidos pelo cenário aberta no Módulo 6"); }}
            onRisk={() => { selectWorkspace("risk"); setSubview("Situação"); setToast("Confidence, disponibilidade e exposição de dados carregadas no Módulo 7"); }}
            onEmergency={() => { selectWorkspace("emergency"); setSubview("Comunicações"); setToast("Conectividade e field sync abertos no Módulo 8"); }}
            onTerritory={() => { selectWorkspace("environment"); setSubview("Qualidade do Ar"); setToast("Sensores ambientais e cobertura abertos no Módulo 9"); }}
            onGovernance={() => { selectWorkspace("governance"); setSubview("Evidências"); setToast("Linhagem de dados entregue ao grafo de evidências do Módulo 11"); }}
          /> : null}

          {activeKey === "governance" ? <GovernanceModule
            subview={subview}
            scenarioStep={scenarioStep}
            stage={stage}
            onAgents={() => setAgentOpen(true)}
            onToast={setToast}
            onTower={() => { selectWorkspace("control"); setSubview("Decisões"); setToast("DEC-0248 e seu DecisionSnapshot abertos na Torre"); }}
            onData={() => { selectWorkspace("data"); setSubview("Linhagem"); setToast("Input snapshot, produtos e lineage abertos no Módulo 10"); }}
            onHazards={() => { selectWorkspace("hazards"); setSubview("Execuções"); setToast("HMR-882, modelo v3.8 e validação abertos no Módulo 3"); }}
            onTwin={() => { selectWorkspace("twin"); setSubview("Capacidade & Restrições"); setToast("Override de C17 e estado original abertos no Módulo 4"); }}
            onChain={() => { selectWorkspace("chain"); setSubview("Causal Graph"); setToast("RootCauseTrace RCT-024 aberto no Módulo 5"); }}
            onPlanning={() => { selectWorkspace("planning"); setSubview("Alternativas & Decisão"); setToast("ALT-B e aprovação de cenário abertos no Módulo 6"); }}
            onRisk={() => { selectWorkspace("risk"); setSubview("Apetite"); setToast("Aceite, apetite, materialidade e autoridade do Módulo 7 abertos"); }}
            onEmergency={() => { selectWorkspace("emergency"); setSubview("Evidências"); setToast("Evidências INC-024 abertas no Módulo 8"); }}
            onTerritory={() => { selectWorkspace("environment"); setSubview("Comunicação"); setToast("Publication Gate e evidências territoriais abertos no Módulo 9"); }}
          /> : null}

          {activeKey !== "control" && activeKey !== "climate" && activeKey !== "hazards" && activeKey !== "twin" && activeKey !== "chain" && activeKey !== "planning" && activeKey !== "risk" && activeKey !== "emergency" && activeKey !== "environment" && activeKey !== "communications" && activeKey !== "data" && activeKey !== "governance" && subview === "Visão geral" && (
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

          {activeKey !== "control" && activeKey !== "climate" && activeKey !== "hazards" && activeKey !== "twin" && subview === "Mapa vivo" && (
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

          {subview === "Relatórios" && activeKey !== "risk" && activeKey !== "emergency" && activeKey !== "environment" && activeKey !== "communications" && activeKey !== "data" && activeKey !== "governance" && (
            <section className="reports-view">
              <div className="report-summary-row"><article className="panel report-highlight"><span className="eyebrow">REPORT PACK</span><h2>{active.reports[0]}</h2><p>Gerado às 13:30 · fontes citadas · modelo e premissas versionados.</p><button className="primary-button" onClick={() => setToast("Relatório gerado e adicionado à trilha de evidências")}>Gerar relatório</button></article>{active.reports.slice(1).map((report, index) => <article className="panel report-card" key={report}><span className="report-type">{index % 2 ? "PDF" : "LIVE"}</span><h3>{report}</h3><p>Atualização automática · distribuição controlada</p><button>Visualizar →</button></article>)}</div>
              <div className="report-charts-grid">
                <article className="panel large-report-chart"><div className="panel-header compact"><div><span className="eyebrow">ANÁLISE TEMPORAL</span><h2>{active.charts[0]}</h2></div><StatusPill tone="info">Tempo real</StatusPill></div><div className="line-chart-css"><div className="line-grid" />{[42, 48, 44, 59, 64, 56, 70, 82, 76, 88, 84, 92].map((value, index) => <span key={index} style={{ left: `${index * 8.6 + 2}%`, bottom: `${value - 24}%` }}><i /></span>)}</div><div className="axis-labels"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span></div></article>
                <article className="panel chart-catalog"><span className="eyebrow">VISUALIZAÇÕES DISPONÍVEIS</span><h3>Gráficos do módulo</h3>{active.charts.map((chartName, index) => <div className="chart-catalog-item" key={chartName}><span>{index + 1}</span><strong>{chartName}</strong><MiniBars values={[30 + index * 2, 54, 46, 71 - index, 63, 82]} tone={index === 1 ? "watch" : "info"} /></div>)}</article>
              </div>
            </section>
          )}

          {subview === "Integrações" && activeKey !== "communications" && activeKey !== "data" && activeKey !== "governance" && (
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
          <div className={`scenario-timeline ${activeKey === "climate" ? "climate-timeline" : activeKey === "hazards" ? "hazard-timeline" : activeKey === "twin" ? "twin-timeline" : activeKey === "chain" ? "chain-timeline" : activeKey === "planning" ? "planning-timeline" : activeKey === "risk" ? "risk-timeline" : activeKey === "emergency" ? "emergency-timeline" : activeKey === "environment" ? "environment-timeline" : activeKey === "communications" ? "communications-timeline" : activeKey === "data" ? "data-timeline" : activeKey === "governance" ? "governance-timeline" : ""}`}>{activeScenarioStages.map((item, index) => <button key={item.label} className={`${index === scenarioStep ? "active" : ""} ${index < scenarioStep ? "passed" : ""}`} onClick={() => setScenarioStep(index)}><span className={`tone-${item.tone}`}>{index < scenarioStep ? "✓" : ""}</span><div><strong>{item.time} · {item.label}</strong><small>{item.note}</small></div></button>)}</div>
          <div className="footer-health"><span className="health-pulse" /><div><strong>{activeKey === "climate" ? "Climate Data Cube" : activeKey === "hazards" ? "Model Factory" : activeKey === "twin" ? "Operational Twin" : activeKey === "chain" ? "Chain Engine" : activeKey === "planning" ? "Planning Orchestrator" : activeKey === "risk" ? "Enterprise Climate Risk Engine" : activeKey === "emergency" ? "Emergency Orchestrator" : activeKey === "environment" ? "Territorial Orchestrator" : activeKey === "communications" ? "Communication Orchestrator" : activeKey === "data" ? "Industrial Data Fabric" : activeKey === "governance" ? "Governance Control Plane" : "Dados operacionais"}</strong><small>{activeKey === "climate" ? "FR-2204 · QA 98% · 51 membros" : activeKey === "hazards" ? "HMR-882 · HS-882 · QA PASS · confidence 79%" : activeKey === "twin" ? "C17 · HS-882 · 6 fontes · confidence 79%" : activeKey === "chain" ? "PR-881 · BOT-022 · 9 fontes · confidence 74%" : activeKey === "planning" ? "SCN-0184 · PLN-v19 · robustness 86% · confidence 78%" : activeKey === "risk" ? "RS-041 · FI-021 · confidence 73/100 · 15 agentes" : activeKey === "emergency" ? "AL-0187 · ACT-019 · INC-024 · Mission MIS-024" : activeKey === "environment" ? "TS-081 · C-07 · 4.820 estimate · confidence 78%" : activeKey === "communications" ? "COM-2026-018 · ALT-118 · delivery 94,7% · ACK 88%" : activeKey === "data" ? "147/153 sources · 1.842 devices · quality 94,7%" : activeKey === "governance" ? "DEC-0248 · 96,4% controls · 100% critical auditability" : "Atualizado há 4,8 s · confiança 96,7%"}</small></div><button className="footer-status" onClick={() => activeKey === "hazards" ? setSubview("Execuções") : activeKey === "twin" ? setSubview("Sensores & Saúde") : activeKey === "chain" || activeKey === "planning" || activeKey === "risk" || activeKey === "emergency" || activeKey === "environment" || activeKey === "communications" || activeKey === "data" || activeKey === "governance" ? setSubview("Agentes & Integrações") : selectWorkspace("data")}>{activeKey === "climate" ? "98%" : activeKey === "hazards" ? "6/6" : activeKey === "twin" ? "94%" : activeKey === "chain" ? "74%" : activeKey === "planning" ? "86%" : activeKey === "risk" ? "15/15" : activeKey === "emergency" ? "15/15" : activeKey === "environment" ? "15/15" : activeKey === "communications" ? "16/16" : activeKey === "data" ? "16/16" : activeKey === "governance" ? "13/13" : "12/12"}</button></div>
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
