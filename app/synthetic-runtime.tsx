"use client";

import { useEffect, useMemo, useState } from "react";

type Tone = "ok" | "watch" | "alert" | "critical" | "info";

type Metric = { label: string; base: number; unit?: string; prefix?: string; decimals?: number; volatility: number; tone: Tone; note: string };
type RuntimeEvent = { agent: string; action: string; object: string; tone: Tone };
type RuntimeProfile = {
  code: string;
  domain: string;
  context: string;
  throughput: string;
  metrics: Metric[];
  events: RuntimeEvent[];
  objects: string[];
  sources: string[];
};

const m = (label: string, base: number, unit: string, volatility: number, tone: Tone, note: string, decimals = 0, prefix = ""): Metric => ({ label, base, unit, volatility, tone, note, decimals, prefix });

export const syntheticRuntimeProfiles: Record<string, RuntimeProfile> = {
  control: {
    code: "M1", domain: "Integrated Command", context: "CTRL-OP-2026-018", throughput: "1.842 eventos/min",
    metrics: [m("Sinais ativos",18,"",2,"watch","4 materiais"),m("Decisões abertas",7,"",1,"alert","1 vence em 18 min"),m("Aderência do plano",86,"%",1.8,"ok","PLN-v19"),m("Tarefas no SLA",92,"%",1.1,"ok","84 / 91"),m("Confiança integrada",81,"%",1.4,"info","8 módulos")],
    events: [{agent:"PULSO",action:"correlacionou chuva, maré e restrição C17",object:"SIG-2048",tone:"watch"},{agent:"PRISMA",action:"recalculou valor preservado da alternativa B",object:"DEC-0248",tone:"info"},{agent:"GUARDA",action:"bloqueou decisão sem quorum operacional",object:"GATE-088",tone:"alert"},{agent:"NEXO",action:"atualizou cadeia causal do evento",object:"RCT-024",tone:"ok"},{agent:"PULSO",action:"publicou mudança material para os workspaces",object:"OPS-STATE-19",tone:"ok"},{agent:"SENTINELA",action:"elevou prioridade de três tarefas",object:"SLA-091",tone:"watch"}],
    objects:["DEC-0248 · Antecipar bombeamento","SIG-2048 · Capacidade C17","TSK-882 · Isolar D-04","BRF-118 · Briefing 20:00","ALT-B · Replanejamento","INC-024 · Comando N3"],
    sources:["Central State Store","ArcGIS Enterprise","Event Bus","Workflow Manager","Teams Operations","Evidence Vault"],
  },
  climate: {
    code:"M2",domain:"Climate Intelligence",context:"FR-2204 · 12Z",throughput:"51 membros · 384 observações/min",
    metrics:[m("Estações online",51," / 53",1,"ok","96,2%"),m("Chuva acumulada",104.2," mm",3.2,"alert","P90 · 6h",1),m("Prob. > 100 mm",78,"%",2.4,"alert","ensemble"),m("Latência ingestão",42," s",6,"watch","SLA 60 s"),m("Spread ensemble",18.4," mm",1.8,"info","P10–P90",1)],
    events:[{agent:"CLIMA ORCHESTRATOR",action:"ingeriu rodada ECMWF 12Z e 51 membros",object:"FR-2204",tone:"info"},{agent:"NOWCAST",action:"detectou intensificação no setor oeste",object:"NC-081",tone:"alert"},{agent:"QC MET",action:"aplicou fallback PLU-045 para sensor suspeito",object:"OBS-445",tone:"watch"},{agent:"BIAS CORRECTOR",action:"recalculou correção quantílica costeira",object:"BC-208",tone:"ok"},{agent:"PUBLISHER",action:"atualizou ClimateContext para M1 e M3",object:"CS-204",tone:"ok"},{agent:"ANALOG",action:"localizou três eventos históricos similares",object:"ANA-118",tone:"info"}],
    objects:["FR-2204 · ECMWF 12Z","NC-081 · Nowcast 0–3h","OBS-445 · PLU-044","BC-208 · Bias correction","ENS-051 · Ensemble","CS-204 · Climate signal"],
    sources:["ECMWF Open Data","INMET","CEMADEN","MET-03 / PLU-044","ERA5 Land","NOAA GFS"],
  },
  hazards: {
    code:"M3",domain:"Hazard Model Factory",context:"HMR-882 · HS-882",throughput:"6 runs · 2,4M células avaliadas",
    metrics:[m("Model runs",6," / 6",0,"ok","QA PASS"),m("Células em alerta",284," k",9,"alert","P90"),m("Confiança",79,"%",1.6,"watch","penalty −4 pp"),m("Lâmina máxima",0.86," m",.05,"critical","D-04",2),m("Compute P95",47," s",5,"ok","GPU pool")],
    events:[{agent:"MODEL ORCHESTRATOR",action:"finalizou HMR-882 com seed determinística",object:"RUN-882",tone:"ok"},{agent:"FLOOD AGENT",action:"detectou overtopping em três células",object:"HS-882",tone:"critical"},{agent:"INPUT GUARDIAN",action:"aplicou confidence penalty por NIV-04",object:"DQC-091",tone:"watch"},{agent:"VALIDATION",action:"comparou footprint com 18 eventos",object:"VAL-208",tone:"ok"},{agent:"THRESHOLD",action:"cruzou gatilho de lâmina em V-EXT-04",object:"THR-044",tone:"alert"},{agent:"PUBLISHER",action:"publicou HazardSurface para M4 e M8",object:"HSIG-1032",tone:"info"}],
    objects:["HMR-882 · Hidrologia 2D","HS-882 · Flood surface","WIND-208 · Rajada P90","HEAT-044 · Calor","FIRE-018 · Propagação","QA-882 · Validation pack"],
    sources:["Climate Data Cube","DEM 1 m","Drenagem D-04","NIV-04 / NIV-05","Maré DHN","GPU Model Pool"],
  },
  twin: {
    code:"M4",domain:"Operational Digital Twin",context:"C17 · D-04 · HS-882",throughput:"18.420 telemetrias/s",
    metrics:[m("Ativos sincronizados",1284,"",11,"ok","99,4%"),m("Restrições ativas",6,"",1,"alert","2 críticas"),m("Capacidade C17",74,"%",2.1,"alert","−8 pp"),m("Freshness P95",4.8," s",.7,"ok","SLA 10 s",1),m("Ordens abertas",12,"",2,"watch","3 urgentes")],
    events:[{agent:"TWIN ORCHESTRATOR",action:"reconciliou estado físico e operacional",object:"AS-2084",tone:"ok"},{agent:"ANOMALY",action:"detectou assinatura de cavitação em D-04",object:"AN-441",tone:"alert"},{agent:"CAPACITY",action:"recalculou throughput disponível de C17",object:"AC-2084",tone:"watch"},{agent:"INSPECTION",action:"gerou roteiro de vistoria orientado a risco",object:"INSP-204",tone:"info"},{agent:"RELEASE GUARDIAN",action:"manteve bloqueio por evidência incompleta",object:"REL-081",tone:"critical"},{agent:"STATE PUBLISHER",action:"publicou AssetState versionado",object:"AST-192",tone:"ok"}],
    objects:["C17 · Correia transportadora","D-04 · Bomba de drenagem","SE-04 · Subestação","PÁTIO-3 · Estoque","BERÇO-2 · Atracação","V-11 · Acesso alternativo"],
    sources:["SCADA Tubarão","EAM / SAP PM","ArcGIS Utility Network","Historiador PI","Field Maps","Computer Vision"],
  },
  chain: {
    code:"M5",domain:"Chain & Bottleneck Engine",context:"PR-881 · BOT-022",throughput:"42,8 kt/h · 9 elos monitorados",
    metrics:[m("Fluxo disponível",42.8," kt/h",1.7,"watch","−6,4 kt/h",1),m("Gargalos",4,"",1,"alert","BOT-022 líder"),m("Cobertura estoque",18.6," h",1.2,"ok","PÁTIO-3",1),m("Atraso navio",3.3," h",.4,"alert","MV Atlas",1),m("Demurrage",1.8," mi",.2,"watch","R$ estimado",1,"R$ ")],
    events:[{agent:"CHAIN ORCHESTRATOR",action:"propagou restrição C17 por nove elos",object:"PR-881",tone:"alert"},{agent:"BOTTLENECK",action:"reclassificou BOT-022 como material",object:"BOT-022",tone:"critical"},{agent:"VESSEL",action:"atualizou ETA e janela do MV Atlas",object:"VOY-118",tone:"watch"},{agent:"STOCK",action:"projetou cobertura de pátio por 18,6 h",object:"STK-044",tone:"ok"},{agent:"RECOVERY",action:"simulou recuperação com buffer e desvio",object:"RP-024",tone:"info"},{agent:"CONTRACT",action:"sinalizou exposição contratual C-2048",object:"CTR-2048",tone:"watch"}],
    objects:["BOT-022 · C17 → Pátio","MV Atlas · ETA +3h20","PÁTIO-3 · 18,6 h","C-2048 · Compromisso","RP-024 · Recovery","CHS-0184 · Chain signal"],
    sources:["AIS / VTS","MES Produção","Yard Management","SAP Contracts","Port Community","Operational Twin"],
  },
  planning: {
    code:"M6",domain:"Scenario & Planning Orchestrator",context:"SCN-0184 · PLN-v19",throughput:"18 cenários · 1.240 restrições avaliadas",
    metrics:[m("Cenários avaliados",18,"",2,"info","A / B / C"),m("Robustez ALT-B",86,"%",1.5,"ok","lidera ranking"),m("Aderência plano",82,"%",2,"watch","−5 pp"),m("Violações",3,"",1,"alert","1 material"),m("Valor preservado",4.7," mi",.3,"ok","R$ modelado",1,"R$ ")],
    events:[{agent:"PLANNING ORCHESTRATOR",action:"reotimizou plano com restrição C17",object:"PLN-v19",tone:"info"},{agent:"SCENARIO",action:"gerou 18 combinações física-operacionais",object:"SCN-0184",tone:"ok"},{agent:"FEASIBILITY",action:"eliminou alternativa C por segurança",object:"ALT-C",tone:"critical"},{agent:"ROBUSTNESS",action:"recalculou score da alternativa B",object:"ALT-B",tone:"ok"},{agent:"CONSTRAINT",action:"incluiu desvio V-11 com acréscimo de 18 min",object:"PC-208",tone:"watch"},{agent:"PLAN PUBLISHER",action:"preparou PLN-v19 para aprovação",object:"APR-PLN-19",tone:"info"}],
    objects:["SCN-0184 · Evento composto","ALT-A · Manter ritmo","ALT-B · Redução preventiva","ALT-C · Parada seletiva","PLN-v19 · Plano proposto","PC-208 · Restrição territorial"],
    sources:["Operational Twin","Chain Engine","Risk Engine","Resource Roster","Shift Calendar","Workflow Manager"],
  },
  risk: {
    code:"M7",domain:"Enterprise Climate Risk",context:"RS-041 · FI-021",throughput:"124 riscos · 10.000 simulações/run",
    metrics:[m("Perda esperada",4.8," mi",.35,"alert","P50 R$ 3,2 mi",1,"R$ "),m("Perda P90",12.7," mi",.6,"critical","P95 R$ 17,4 mi",1,"R$ "),m("Produção em risco",12.4," kt",.7,"alert","C17",1),m("Recuperação seguro",1.2," mi",.15,"watch","em análise",1,"R$ "),m("Confiança",73," / 100",2,"watch","6 premissas")],
    events:[{agent:"RISK ORCHESTRATOR",action:"atualizou registro com CHS-0184",object:"RS-041",tone:"alert"},{agent:"FINANCIAL",action:"executou Monte Carlo de perdas",object:"FI-021",tone:"info"},{agent:"RECONCILIATION",action:"removeu dupla contagem de demurrage",object:"REC-208",tone:"ok"},{agent:"INSURANCE",action:"avaliou cobertura e franquia P-018",object:"INS-018",tone:"watch"},{agent:"ADAPTATION",action:"recalculou benefício/custo de D-04",object:"ADP-044",tone:"ok"},{agent:"MATERIALITY",action:"publicou recomendação acima do apetite",object:"R-021",tone:"critical"}],
    objects:["R-021 · Inundação D-04","R-044 · Disponibilidade hídrica","R-087 · Transição","FI-021 · Loss distribution","P-018 · Seguro BI","ADP-044 · Drenagem"],
    sources:["Finance Data Mart","ChainSignal","Asset Exposure","Insurance Registry","NGFS Scenarios","Evidence Vault"],
  },
  emergency: {
    code:"M8",domain:"Emergency & Continuity",context:"INC-024 · OP-01",throughput:"7 equipes · 38 tarefas · 4 missões",
    metrics:[m("Equipes mobilizadas",7," / 8",1,"watch","1 em trânsito"),m("Tarefas críticas",11,"",2,"alert","3 vencem < 15 min"),m("Pessoas confirmadas",246,"",8,"info","accountability"),m("Tempo de resposta",8.4," min",.8,"ok","P95 12 min",1),m("Recovery estimado",6.2," h",.5,"watch","RP-024",1)],
    events:[{agent:"EMERGENCY ORCHESTRATOR",action:"atualizou objetivos do período operacional",object:"IAP-024",tone:"info"},{agent:"MISSION DISPATCH",action:"despachou equipe 04 para C-07",object:"MIS-024",tone:"alert"},{agent:"ACCOUNTABILITY",action:"confirmou 246 pessoas e 7 equipes",object:"ACC-118",tone:"ok"},{agent:"SAFETY",action:"bloqueou entrada sem avaliação atmosférica",object:"SAFE-081",tone:"critical"},{agent:"CONTINUITY",action:"ativou processo alternativo de logística",object:"BCP-044",tone:"watch"},{agent:"RECOVERY",action:"atualizou marcos de retorno ao baseline",object:"REC-014",tone:"ok"}],
    objects:["INC-024 · Inundação","MIS-024 · Vistoria C-07","ACT-019 · Bloqueio V-EXT-04","IAP-024 · Plano de ação","BCP-044 · Continuidade","REC-014 · Recovery"],
    sources:["Incident Command","Radio Dispatch","Field Maps","People Roster","SCADA / HSE","Teams Emergency"],
  },
  environment: {
    code:"M9",domain:"Territorial Intelligence",context:"TS-081 · C-07",throughput:"27 ocorrências · 14 receptores",
    metrics:[m("População exposta",4820,"",120,"alert","estimativa"),m("Receptores críticos",8,"",1,"critical","3 sociais"),m("Ocorrências",27,"",3,"watch","8 confirmadas"),m("PM2.5",31.4," µg/m³",2.8,"watch","setor oeste",1),m("Confiança territorial",78,"%",1.7,"info","campo + modelos")],
    events:[{agent:"TERRITORIAL ORCHESTRATOR",action:"recalculou exposição no geofence C-07",object:"TS-081",tone:"alert"},{agent:"RECEPTOR",action:"detectou impacto funcional em unidade de saúde",object:"REC-C07",tone:"critical"},{agent:"COMMUNITY TRIAGE",action:"agrupou cinco relatos correlatos",object:"OCC-GRP-018",tone:"watch"},{agent:"FIELD VERIFICATION",action:"confirmou lâmina em V-EXT-04",object:"FIELD-204",tone:"ok"},{agent:"ENVIRONMENTAL",action:"validou tendência de PM2.5 sem causalidade",object:"AIR-081",tone:"info"},{agent:"MITIGATION",action:"comparou efeito observado do desvio V-11",object:"MIT-032",tone:"ok"}],
    objects:["TS-081 · Sinal territorial","C-07 · Comunidade","V-EXT-04 · Acesso","AIR-081 · PM2.5","OCC-GRP-018 · Relatos","MIT-032 · Mitigação"],
    sources:["IBGE Censo 2022","GeoBases ES","CEMADEN","IEMA / LIMS","Survey123","Living Atlas"],
  },
  communications: {
    code:"M10",domain:"Communication Operations",context:"COM-2026-018 · ALT-118",throughput:"4.875 despachos · 5 canais",
    metrics:[m("Entrega",94.7,"%",1.1,"watch","4.617 / 4.875",1),m("ACK crítico",88,"%",2,"watch","22 / 25"),m("Latência P95",41," s",5,"ok","SLA 120 s"),m("Falhas em retry",126,"",12,"alert","2,6%"),m("Conflitos",0,"",.3,"ok","consistency pass")],
    events:[{agent:"COMMUNICATION ORCHESTRATOR",action:"sincronizou estado oficial e validade",object:"COM-2026-018",tone:"info"},{agent:"AUDIENCE",action:"atualizou 12 públicos no geofence",object:"PUB-SNAP-118",tone:"ok"},{agent:"DELIVERY MONITOR",action:"classificou 31 timeouts para retry",object:"DSP-018",tone:"watch"},{agent:"ACKNOWLEDGEMENT",action:"registrou confirmação da Prefeitura",object:"ACK-204",tone:"ok"},{agent:"ESCALATION",action:"acionou fallback humano para Defesa Civil",object:"ESC-018",tone:"alert"},{agent:"RUMOR MONITOR",action:"sinalizou narrativa operacional conflitante",object:"RUM-044",tone:"watch"}],
    objects:["ALT-118 · Alerta preventivo","CAP-BR-2026-018","DSP-018 · Multicanal","ACK-204 · Confirmação","ESC-018 · Escalonamento","BOL-044 · Boletim"],
    sources:["CAP Gateway","SMS Provider","Teams / E-mail","CRM Contacts","ArcGIS Hub","Social Listening"],
  },
  data: {
    code:"M11",domain:"Industrial Data Fabric",context:"DQ-CTX-081 · GW-03",throughput:"18.420 eventos/s · 147 fontes",
    metrics:[m("Fontes online",147," / 153",2,"watch","96,1%"),m("Devices online",1842," / 1911",12,"watch","96,4%"),m("Qualidade",94.7,"%",.9,"watch","108 rejects/s",1),m("Latência P95",1.8," s",.3,"ok","SLA 5 s",1),m("Backlog",1.2," M",.15,"alert","reconciliation",1)],
    events:[{agent:"DATA GUARDIAN",action:"propagou quality context para oito módulos",object:"DQC-081",tone:"watch"},{agent:"DEVICE HEALTH",action:"detectou stuck sensor NIV-04",object:"DI-091",tone:"alert"},{agent:"RECOVERY",action:"reconciliou 1,2M eventos do edge buffer",object:"REC-204",tone:"ok"},{agent:"SCHEMA GUARDIAN",action:"bloqueou breaking change no AIS",object:"SCH-018",tone:"critical"},{agent:"LATENCY",action:"isolou degradação no enlace LTE",object:"LAT-044",tone:"watch"},{agent:"API GUARDIAN",action:"renovou cache meteorológico",object:"API-109",tone:"ok"}],
    objects:["GW-03 · Gateway","NIV-04 · Water level","AIS-VTS · Vessel feed","PIPE-204 · Telemetry","SCH-018 · AIS v2","REC-204 · Backfill"],
    sources:["MQTT Broker","SCADA / OPC-UA","ArcGIS Velocity","Lakehouse","API Gateway","Observability Stack"],
  },
  governance: {
    code:"M12",domain:"Governance Control Plane",context:"DEC-0248 · DS-0248",throughput:"292 controles · 48 decisões críticas",
    metrics:[m("Controles efetivos",96.4,"%",.5,"ok","281 / 292",1),m("Decisões auditáveis",100,"%",0,"ok","48 / 48"),m("Exceções abertas",12,"",2,"alert","3 críticas"),m("Modelos válidos",27," / 29",1,"watch","2 bloqueados"),m("Evidence coverage",98.2,"%",.6,"ok","critical path",1)],
    events:[{agent:"GOVERNANCE ORCHESTRATOR",action:"avaliou policies da DEC-0248",object:"POL-RUN-118",tone:"info"},{agent:"EVIDENCE",action:"anexou snapshot de dados e modelos",object:"DS-0248",tone:"ok"},{agent:"AUTHORITY",action:"validou quorum e segregação de funções",object:"APR-118",tone:"ok"},{agent:"MODEL GUARDIAN",action:"bloqueou uso de modelo com validade expirada",object:"MDL-044",tone:"critical"},{agent:"CONTROL MONITOR",action:"detectou três exceções críticas",object:"EXC-081",tone:"alert"},{agent:"REPRODUCIBILITY",action:"reexecutou decisão com hash equivalente",object:"RPL-0248",tone:"ok"}],
    objects:["DEC-0248 · Decision","DS-0248 · Snapshot","APR-118 · Approval","POL-OPS-17 · Policy","MDL-044 · Model","EXC-081 · Exception"],
    sources:["Evidence Vault","Policy Engine","Identity / RBAC","Model Registry","Audit Ledger","Change Management"],
  },
};

const ensoRuntimeBindings: Record<string, RuntimeEvent> = {
  control: {agent:"PULSO",action:"incorporou ENSO-026 ao contexto executivo sem elevar alerta",object:"ENSO-026",tone:"info"},
  climate: {agent:"ENSO MONITOR",action:"consolidou RONI, acoplamento e cenário NDJ",object:"ENSO-026",tone:"watch"},
  hazards: {agent:"INPUT GUARDIAN",action:"aplicou ENSO-026 como prior de regime, não como perigo",object:"ENSO-026",tone:"info"},
  twin: {agent:"TWIN ORCHESTRATOR",action:"anotou horizonte sazonal ENSO nos ativos sensíveis",object:"ENSO-026",tone:"info"},
  chain: {agent:"CHAIN ORCHESTRATOR",action:"testou buffers sazonais condicionados ao ENSO",object:"ENSO-026",tone:"watch"},
  planning: {agent:"SCENARIO",action:"gerou ramo sazonal P10/P50/P90 a partir do ENSO",object:"ENSO-026",tone:"info"},
  risk: {agent:"SENSITIVITY",action:"condicionou caudas de perda ao regime ENSO",object:"ENSO-026",tone:"watch"},
  emergency: {agent:"EARLY WARNING",action:"atualizou prontidão sazonal sem ativação automática",object:"ENSO-026",tone:"info"},
  environment: {agent:"TERRITORIAL ORCHESTRATOR",action:"cruzou pressões sazonais com receptores sensíveis",object:"ENSO-026",tone:"info"},
  communications: {agent:"MESSAGE COMPOSER",action:"preparou boletim ENSO explicativo e não alarmista",object:"ENSO-026",tone:"ok"},
  data: {agent:"DATA GUARDIAN",action:"validou linhagem RONI, ERSSTv5 e ensemble sazonal",object:"ENSO-026",tone:"ok"},
  governance: {agent:"MODEL GUARDIAN",action:"validou threshold e rótulo VERY_STRONG_CANDIDATE",object:"ENSO-026",tone:"watch"},
};

Object.entries(ensoRuntimeBindings).forEach(([key,event]) => {
  const profile = syntheticRuntimeProfiles[key];
  if (!profile) return;
  profile.events = [event,...profile.events];
  profile.objects = ["ENSO-026 · ClimateRegimeSignal",...profile.objects];
  profile.sources = ["ClimateRegimeSignal / Event Bus",...profile.sources];
});

const statuses: Array<[string,Tone]> = [["EXECUTANDO","info"],["VALIDADO","ok"],["ATENÇÃO","watch"],["AÇÃO REQUERIDA","alert"],["PUBLICADO","ok"],["AGUARDANDO HUMANO","watch"]];

function clockMinus(clock: string, seconds: number) {
  const parts = clock.split(":").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return clock;
  const total = ((parts[0] * 3600 + parts[1] * 60 + parts[2] - seconds) % 86400 + 86400) % 86400;
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60].map(value => String(value).padStart(2,"0")).join(":");
}

function displayMetric(metric: Metric, pulse: number, index: number) {
  const wave = Math.sin((pulse + index * 1.7) * .58) * metric.volatility;
  const value = Math.max(0, metric.base + wave);
  const formatted = metric.decimals ? value.toFixed(metric.decimals).replace(".",",") : Math.round(value).toLocaleString("pt-BR");
  return `${metric.prefix ?? ""}${formatted}${metric.unit ?? ""}`;
}

export function SyntheticRealtimeLayer({ activeKey, activeTitle, timeLabel, scenarioStep, onAgents, onToast }: { activeKey: string; activeTitle: string; timeLabel: string; scenarioStep: number; onAgents: () => void; onToast: (message: string) => void }) {
  const [pulse,setPulse] = useState(0);
  const [expanded,setExpanded] = useState(false);
  const [paused,setPaused] = useState(false);
  const profile = syntheticRuntimeProfiles[activeKey] ?? syntheticRuntimeProfiles.control;

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setPulse(value => value + 1), 1600);
    return () => window.clearInterval(timer);
  }, [paused]);

  const liveEvents = useMemo(() => Array.from({length:6},(_,offset) => {
    const index = (pulse - offset + profile.events.length * 100) % profile.events.length;
    return {...profile.events[index],time:clockMinus(timeLabel,offset * 7),seq:100840 + pulse - offset};
  }),[profile,pulse,timeLabel]);

  const records = useMemo(() => Array.from({length:12},(_,index) => {
    const object = profile.objects[index % profile.objects.length];
    const event = profile.events[(index + pulse) % profile.events.length];
    const status = statuses[(index + scenarioStep) % statuses.length];
    return {id:`${profile.code}-${String(2040 + index * 7).padStart(4,"0")}`,object,owner:event.agent,status:status[0],tone:status[1],sla:index%4===0?`${4+index} min`:`${18+index*3} min`,confidence:Math.max(68,98-index*2+(pulse%3))};
  }),[profile,pulse,scenarioStep]);

  return <section className={`syn-runtime ${expanded?"expanded":""}`} aria-label={`Operação sintética em tempo real de ${activeTitle}`}>
    <header className="syn-runtime-head">
      <div className="syn-live-title"><span className="syn-live-dot" /><div><span>LIVE SYNTHETIC OPERATIONS · {profile.code}</span><strong>{profile.domain}</strong></div><b>DADOS SINTÉTICOS</b></div>
      <div className="syn-runtime-context"><span>{profile.context}</span><small>{profile.throughput} · tick {String(pulse).padStart(5,"0")}</small></div>
      <div className="syn-runtime-actions"><button className={paused?"paused":""} onClick={()=>setPaused(value=>!value)}>{paused?"▶ Retomar":"Ⅱ Pausar"}</button><button onClick={onAgents}>AI Agentes</button><button className="primary" onClick={()=>setExpanded(value=>!value)}>{expanded?"Recolher":"Abrir malha realtime"}</button></div>
    </header>
    <div className="syn-runtime-strip">
      <div className="syn-live-metrics">{profile.metrics.map((metric,index)=><article className={`tone-${metric.tone}`} key={metric.label}><span>{metric.label}</span><strong>{displayMetric(metric,pulse,index)}</strong><small>{metric.note}</small><div>{Array.from({length:12},(_,bar)=><i style={{height:`${28+Math.abs(Math.sin((pulse+bar+index)*.42))*66}%`}} key={bar}/>)}</div></article>)}</div>
      <div className="syn-now-event" aria-live="polite"><time>{liveEvents[0].time}</time><span className={`tone-${liveEvents[0].tone}`}>AI</span><p><b>{liveEvents[0].agent}</b><strong>{liveEvents[0].action}</strong><small>{liveEvents[0].object} · trace #{liveEvents[0].seq}</small></p><i /></div>
    </div>
    {expanded?<div className="syn-runtime-detail">
      <section className="syn-runtime-grid">
        <article className="syn-card syn-stream"><div className="syn-card-head"><div><span>AGENT EVENT STREAM</span><h3>Operação em tempo real</h3></div><button onClick={onAgents}>Guardrails →</button></div>{liveEvents.map((event,index)=><button key={`${event.seq}-${event.agent}`} onClick={()=>onToast(`${event.agent}: trace #${event.seq}, inputs e evidências abertos`)}><time>{event.time}</time><span className={`tone-${event.tone}`}>{index===0?"●":"✓"}</span><p><b>{event.agent}</b><small>{event.action}</small></p><strong>{event.object}</strong></button>)}</article>
        <article className="syn-card syn-sources"><div className="syn-card-head"><div><span>DATA & INTEGRATION HEALTH</span><h3>{profile.sources.length} fontes críticas</h3></div><b>99,94% SLO</b></div>{profile.sources.map((source,index)=>{const quality=Math.max(86,99-((index+pulse)%8));return <div key={source}><span>{index<2?"LIVE":index<4?"API":"SYS"}</span><p><b>{source}</b><small>{index%3===0?"event stream":index%3===1?"REST / feature service":"CDC / internal bus"}</small></p><i><strong style={{width:`${quality}%`}} /></i><em>{quality}%</em><time>{(1.2+((index+pulse)%5)*.7).toFixed(1)} s</time></div>})}</article>
        <article className="syn-card syn-timeseries"><div className="syn-card-head"><div><span>60-MINUTE WINDOW</span><h3>Volume, risco e confiança</h3></div><b>1,6 s refresh</b></div><div className="syn-chart"><div className="syn-threshold">limiar</div>{Array.from({length:32},(_,index)=>{const value=38+Math.sin((index+pulse*.35)*.55)*13+index*.9;return <i key={index} style={{height:`${Math.min(92,Math.max(12,value))}%`}}><span /></i>})}</div><footer><span><i className="volume"/>Eventos</span><span><i className="risk"/>Limiar material</span><b>janela móvel · seed 2417</b></footer></article>
        <article className="syn-card syn-queue"><div className="syn-card-head"><div><span>WORK QUEUE</span><h3>Objetos, owners e SLA</h3></div><b>12 itens</b></div><div className="syn-queue-head"><span>ID / objeto</span><span>Owner</span><span>Conf.</span><span>SLA</span><span>Estado</span></div>{records.slice(0,6).map(record=><button key={record.id} onClick={()=>onToast(`${record.id}: cockpit, lineage e histórico abertos`)}><span><b>{record.id}</b><small>{record.object}</small></span><span>{record.owner}</span><strong>{record.confidence}%</strong><time>{record.sla}</time><em className={`tone-${record.tone}`}>{record.status}</em></button>)}</article>
      </section>
      <section className="syn-object-ribbon">{records.slice(6).map((record,index)=><button key={record.id} onClick={()=>onToast(`${record.object}: status sintético atualizado no tick ${pulse}`)}><span>{record.id}</span><b>{record.object}</b><small>{record.owner}</small><i className={`tone-${record.tone}`}>{index%3===0?"RUN":index%3===1?"QA":"WAIT"}</i></button>)}</section>
    </div>:null}
  </section>;
}
