"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

type Tone = "ok" | "watch" | "alert" | "critical" | "info";

type FeedItem = {
  id: number;
  time: string;
  agent: string;
  text: string;
  type: Tone;
};

type Stage = { label: string; time: string; note: string; tone: Tone };

type Props = {
  subview: string;
  horizon: string;
  profile: string;
  scenarioStep: number;
  stage: Stage;
  scenarioName: string;
  mapStatus: string;
  layers: Record<string, boolean>;
  selectedAsset: string;
  feed: FeedItem[];
  decisionState: string;
  incidentMode: boolean;
  renderMap: () => ReactNode;
  onToggleLayer: (key: string) => void;
  onSelectAsset: (assetId: string) => void;
  onApproveDecision: () => void;
  onDispatch: () => void;
  onAgents: () => void;
  onIncidentMode: (active: boolean) => void;
  onToast: (message: string) => void;
};

export const controlTabs = [
  "Situação integrada",
  "Mapa vivo",
  "Sinais",
  "Alertas",
  "Impactos",
  "Decisões",
  "Trabalho",
  "Agentes",
  "Incidentes",
  "Briefing",
];

const signals = [
  { id: "CS-204", time: "18:41", signal: "Chuva extrema · ClimateSignal", origin: "M2 · FR-2204", change: "+52% vs. 00Z", relevance: "Alta", state: "Recebido", tone: "critical" as Tone },
  { id: "S-482", time: "16:32", signal: "Chuva extrema", origin: "ECMWF 12Z", change: "48 → 73 mm", relevance: "Alta", state: "Novo", tone: "alert" as Tone },
  { id: "S-483", time: "16:31", signal: "Nível D-04", origin: "IoT · NIV-D04-02", change: "+14 cm / 10 min", relevance: "Alta", state: "Observando", tone: "watch" as Tone },
  { id: "S-477", time: "16:28", signal: "ETA MV Atlas", origin: "AIS", change: "+52 min", relevance: "Média", state: "Avaliado", tone: "info" as Tone },
  { id: "S-471", time: "16:22", signal: "Saturação do solo", origin: "Sentinel + modelo", change: "+11 pp", relevance: "Alta", state: "Correlacionado", tone: "watch" as Tone },
  { id: "S-468", time: "16:18", signal: "Bomba BP-D04-03", origin: "SCADA", change: "Derating −22%", relevance: "Crítica", state: "Em análise", tone: "critical" as Tone },
];

const alerts = [
  { id: "AL-0187", title: "Chuva extrema + drenagem", area: "Pátio Norte / D-04", probability: "82%", validity: "17:40–23:30", impact: "−8 a −12% capacidade", state: "Em análise", tone: "critical" as Tone },
  { id: "AL-0182", title: "Raios na aproximação portuária", area: "Terminal / Berços 1–3", probability: "64%", validity: "18:10–20:40", impact: "Janela operacional restrita", state: "Validado", tone: "alert" as Tone },
  { id: "AL-0176", title: "Vento lateral acima do limite", area: "Viradores 3 e 4", probability: "58%", validity: "19:00–22:00", impact: "Vigilância operacional", state: "Reconhecido", tone: "watch" as Tone },
];

const cascade = [
  { id: "D04", label: "Drenagem D-04", detail: "capacidade excedida", value: "68%", tone: "critical" as Tone },
  { id: "ACC-N", label: "Acesso Pátio Norte", detail: "restrição provável", value: "+01h20", tone: "alert" as Tone },
  { id: "CONV-C17", label: "Correia C17", detail: "capacidade disponível", value: "−18%", tone: "alert" as Tone },
  { id: "PEL-03", label: "Usina 3", detail: "recebimento projetado", value: "−8%", tone: "watch" as Tone },
  { id: "STK-PEL", label: "Estoque produto", detail: "desvio em 24h", value: "−12 kt", tone: "watch" as Tone },
  { id: "MV-ATLAS", label: "Navio MV Atlas", detail: "ETA contratual", value: "+3h20", tone: "info" as Tone },
  { id: "FIN-DEM", label: "Demurrage", detail: "exposição incremental", value: "R$ 420 mil", tone: "critical" as Tone },
];

const alternatives = [
  { id: "A", title: "Não agir", production: "91%", cost: "R$ 0", risk: "Alto", loss: "R$ 2,8 mi", recommended: false },
  { id: "B", title: "Reduzir nível + bomba móvel", production: "96%", cost: "R$ 18 mil", risk: "Baixo", loss: "R$ 410 mil", recommended: true },
  { id: "C", title: "Somente bombas móveis", production: "94%", cost: "R$ 38 mil", risk: "Moderado", loss: "R$ 970 mil", recommended: false },
];

const jobs = [
  { id: "JOB-003291", task: "Limpar grade e canal da D-04", owner: "Manutenção Drenagem", sla: "00:18", status: "Concluída", evidence: "4 fotos + assinatura", tone: "ok" as Tone },
  { id: "JOB-003292", task: "Posicionar bomba móvel BM-07", owner: "Utilidades · EQ-12", sla: "00:38", status: "Em execução", evidence: "GPS ativo", tone: "info" as Tone },
  { id: "JOB-003293", task: "Vistoriar acesso ao Pátio Norte", owner: "HSE-02", sla: "00:44", status: "Em deslocamento", evidence: "Rota Mission", tone: "watch" as Tone },
  { id: "JOB-003294", task: "Comunicar restrição preventiva", owner: "Sala de Controle", sla: "00:27", status: "Aguardando aceite", evidence: "2/3 confirmaram", tone: "alert" as Tone },
];

const controlAgents = [
  { code: "AURORA", name: "Orquestrador Geral", status: "Consolidando contexto", autonomy: "A", detail: "12 eventos correlacionados · 6 agentes acionados", tone: "info" as Tone },
  { code: "NIMBUS", name: "Meteorologista", status: "Rodada analisada", autonomy: "B", detail: "ECMWF 12Z · confiança 82%", tone: "ok" as Tone },
  { code: "ATLAS", name: "Impacto e Cascata", status: "Propagando restrição", autonomy: "B", detail: "7 nós · 3 processos dependentes", tone: "alert" as Tone },
  { code: "PRISMA", name: "Planejador", status: "Aguardando aprovação", autonomy: "C", detail: "3 alternativas executáveis", tone: "watch" as Tone },
  { code: "PULSO", name: "Despachante", status: "3/4 tarefas aceitas", autonomy: "B", detail: "SLA crítico em 38 min", tone: "info" as Tone },
  { code: "SENTINELA", name: "Guardião de Dados", status: "1 inconsistência", autonomy: "A", detail: "Fallback NIV-D04-02 ativo", tone: "watch" as Tone },
];

const assets: Record<string, { name: string; type: string; state: string; capacity: string; exposure: string; impact: string; dependencies: string[]; recommendation: string }> = {
  D04: { name: "Drenagem D-04", type: "Sistema de drenagem", state: "Restrita · −22%", capacity: "2,3 m³/s de 2,8 m³/s", exposure: "Água prevista 0,32 m", impact: "68% de exceder capacidade", dependencies: ["Acesso Pátio Norte", "Correia C17", "SE-04"], recommendation: "Limpar grade e posicionar BM-07 até 17:20." },
  "CONV-C17": { name: "Correia C17", type: "Transportador", state: "Operando · atenção", capacity: "2.300 t/h de 2.800 t/h", exposure: "Chuva alta em 2h40", impact: "63% de redução operacional", dependencies: ["Pátio Norte", "Usina 3", "Estoque de pelotas"], recommendation: "Antecipar lote e preparar rota alternativa C12." },
  "SE-04": { name: "Subestação SE-04", type: "Infraestrutura elétrica", state: "Atenção", capacity: "Carga atual 83%", exposure: "Prob. inundação 61%", impact: "Pelotização 3 e bombas D-04", dependencies: ["Pelotização 3", "Correia C17", "Bombas D-04"], recommendation: "Transferir cargas não críticas e posicionar geração móvel." },
  "PATIO-N": { name: "Pátio Norte", type: "Pátio operacional", state: "Vigilância", capacity: "91% disponível", exposure: "Solo saturado · 87%", impact: "Acesso pode restringir em +2h", dependencies: ["Drenagem D-04", "Correia C17", "Usina 3"], recommendation: "Restringir tráfego pesado e manter equipe de inspeção." },
};

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`status-pill tone-${tone}`}><span className="status-dot" />{children}</span>;
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <div className="panel-header compact"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action}</div>;
}

export function ControlModule(props: Props) {
  const [selectedSignal, setSelectedSignal] = useState("S-482");
  const [alertState, setAlertState] = useState("Em análise");
  const [alternative, setAlternative] = useState("B");
  const [justification, setJustification] = useState("Alternativa com menor risco residual, pronta execução e melhor preservação da capacidade de recebimento.");
  const [completedTasks, setCompletedTasks] = useState(1);
  const asset = assets[props.selectedAsset] ?? assets.D04;

  const kpis = useMemo(() => {
    const recovery = props.scenarioStep >= 15;
    const capacity = recovery ? 92.4 + (props.scenarioStep - 15) * 1.8 : Math.max(78.4, 97.2 - props.scenarioStep * 1.15);
    const productionRisk = recovery ? Math.max(8.2, 38.2 - (props.scenarioStep - 15) * 10) : Math.max(0, (props.scenarioStep - 2) * 3.2);
    const valueRisk = recovery ? 1.1 : Math.max(0.4, 0.7 + props.scenarioStep * 0.52);
    return [
      { label: "Estado da unidade", value: props.incidentMode ? "INCIDENTE N2" : props.scenarioStep < 3 ? "NORMAL" : "ATENÇÃO", unit: "2 condições relevantes", delta: props.stage.label, confidence: "96%", source: "COP operacional", tone: props.incidentMode ? "critical" as Tone : props.scenarioStep < 3 ? "ok" as Tone : "watch" as Tone },
      { label: `Capacidade disponível · ${props.horizon}`, value: `${capacity.toFixed(1).replace(".", ",")}%`, unit: "vs. plano 97,2%", delta: `${(capacity - 97.2).toFixed(1).replace(".", ",")} pp`, confidence: "94%", source: "MES + ATLAS", tone: capacity < 90 ? "alert" as Tone : "watch" as Tone },
      { label: "Produção em risco · 72h", value: `${productionRisk.toFixed(1).replace(".", ",")} kt`, unit: "desde 12:00", delta: productionRisk > 20 ? "↑ 12,4 kt" : "↑ 3,2 kt", confidence: "82%", source: "Cadeia v4", tone: productionRisk > 28 ? "alert" as Tone : "watch" as Tone },
      { label: "Impacto potencial", value: `R$ ${valueRisk.toFixed(1).replace(".", ",")} mi`, unit: "P90: R$ 13,1 mi", delta: recovery ? "↓ R$ 7,3 mi" : "↑ R$ 1,2 mi", confidence: "78%", source: "VALOR v2", tone: valueRisk > 6 ? "alert" as Tone : "watch" as Tone },
      { label: "Ativos críticos", value: props.scenarioStep < 4 ? "2" : "7", unit: "2 alta exposição", delta: props.scenarioStep < 4 ? "+1" : "+5", confidence: "91%", source: "Gêmeo + GIS", tone: props.scenarioStep < 4 ? "info" as Tone : "alert" as Tone },
      { label: "Decisões humanas", value: props.decisionState.startsWith("Aprovada") ? "2" : "3", unit: props.decisionState.startsWith("Aprovada") ? "0 críticas" : "1 crítica", delta: "SLA 00:28", confidence: "100%", source: "Workflow", tone: props.decisionState.startsWith("Aprovada") ? "ok" as Tone : "watch" as Tone },
    ];
  }, [props.scenarioStep, props.horizon, props.incidentMode, props.decisionState, props.stage.label]);

  if (props.subview === "Mapa vivo") {
    return <section className="control-map-layout">
      <aside className="panel control-layer-tree">
        <SectionHeader eyebrow="CONTEÚDO" title="Camadas operacionais" />
        {[
          ["assets", "Operação", "264 ativos · 18 equipes"], ["risk", "Perigos", "HIDRO-2D P90"],
          ["viirs", "Focos de calor", "Living Atlas · público"], ["landCover", "Uso do solo", "Sentinel-2 · público"],
        ].map(([key, label, meta]) => <label className="control-layer" key={key}><input type="checkbox" checked={props.layers[key]} onChange={() => props.onToggleLayer(key)} /><span className={`layer-swatch layer-${key}`} /><span><strong>{label}</strong><small>{meta}</small></span></label>)}
        <div className="layer-group-list"><strong>Grupos preparados</strong>{["Clima · radar, vento, raios", "Tempo real · estados e equipes", "Entorno · vias e comunidades", "Referência · relevo e imagens"].map((item) => <button key={item} onClick={() => props.onToast(`${item}: grupo preparado para integração`)}>＋ {item}</button>)}</div>
      </aside>
      <article className="panel control-full-map">
        <SectionHeader eyebrow="COMMON OPERATIONAL PICTURE" title={`Tubarão · ${props.horizon} · ${props.scenarioName}`} action={<Pill tone={props.stage.tone}>{props.stage.label}</Pill>} />
        <div className="control-map-stage">{props.renderMap()}<div className="map-tool-rail">{["⌕", "▤", "◎", "↔", "□", "2D"].map((tool) => <button key={tool} onClick={() => props.onToast(`Ferramenta ${tool} ativada`)}>{tool}</button>)}</div><div className="map-status"><span className="health-pulse" />{props.mapStatus}</div></div>
        <div className="time-slider-control"><span>−24H</span><input type="range" min="0" max="100" value={Math.min(100, props.scenarioStep * 5.8)} readOnly /><strong>AGORA</strong><span>+72H</span><small>observado · forecast · cenário</small></div>
      </article>
      <aside className="panel control-asset-inspector">
        <SectionHeader eyebrow="INVESTIGAÇÃO ESPACIAL" title={asset.name} action={<Pill tone="alert">{asset.state}</Pill>} />
        <div className="asset-switcher">{Object.keys(assets).map((id) => <button className={id === props.selectedAsset ? "active" : ""} key={id} onClick={() => props.onSelectAsset(id)}>{id}</button>)}</div>
        <dl className="asset-facts"><div><dt>Tipo</dt><dd>{asset.type}</dd></div><div><dt>Capacidade</dt><dd>{asset.capacity}</dd></div><div><dt>Exposição</dt><dd>{asset.exposure}</dd></div><div><dt>Impacto</dt><dd>{asset.impact}</dd></div></dl>
        <span className="eyebrow">DEPENDÊNCIAS</span><div className="dependency-list">{asset.dependencies.map((item) => <button key={item} onClick={() => props.onToast(`Contexto preservado · ${item}`)}>→ {item}</button>)}</div>
        <div className="recommendation-box"><strong>Recomendação</strong><p>{asset.recommendation}</p></div>
        <div className="inspector-actions"><button onClick={() => props.onToast(`/digital-twin?asset=${props.selectedAsset}&horizon=${props.horizon}`)}>Abrir gêmeo</button><button onClick={() => props.onToast(`/chain?asset=${props.selectedAsset}&event=EV-0187`)}>Ver cascata</button><button onClick={props.onDispatch}>Criar ação</button></div>
      </aside>
    </section>;
  }

  if (props.subview === "Sinais") {
    const signal = signals.find((item) => item.id === selectedSignal) ?? signals[0];
    return <section className="control-two-column wide-left">
      <article className="panel control-table-panel"><SectionHeader eyebrow="CHANGE DETECTION" title="Sinais materiais" action={<div className="data-badges"><span>5 ativos</span><span>LIVE · 5 s</span></div>} />
        <div className="control-filters">{["Todos", "Clima", "Água", "Operação", "Logística"].map((item) => <button key={item}>{item}</button>)}</div>
        <div className="task-table-wrap"><table className="task-table control-table"><thead><tr><th>Hora</th><th>ID / Sinal</th><th>Origem</th><th>Mudança</th><th>Relevância</th><th>Estado</th></tr></thead><tbody>{signals.map((item) => <tr className={item.id === selectedSignal ? "selected" : ""} key={item.id} onClick={() => setSelectedSignal(item.id)}><td>{item.time}</td><td><strong>{item.id}</strong><br />{item.signal}</td><td>{item.origin}</td><td>{item.change}</td><td><Pill tone={item.tone}>{item.relevance}</Pill></td><td>{item.state}</td></tr>)}</tbody></table></div>
      </article>
      <aside className="panel signal-inspector"><SectionHeader eyebrow="SINAL SELECIONADO" title={`${signal.id} · ${signal.signal}`} action={<Pill tone={signal.tone}>{signal.state}</Pill>} />
        <div className="change-compare"><div><span>Anterior</span><strong>{signal.id === "S-482" ? "48 mm" : "Referência"}</strong></div><b>→</b><div><span>Atual</span><strong>{signal.change.split("→").pop()}</strong></div></div>
        <p className="inspector-copy">AURORA correlacionou a mudança com D-04, acesso ao Pátio Norte e C17. Materialidade operacional confirmada.</p>
        <div className="agent-flow">{["Nova informação", "Mudança material", "Contextualizar", "Calcular impacto", "Avaliar alerta"].map((item, index) => <div key={item} className={index < 4 ? "done" : "current"}><span>{index < 4 ? "✓" : index + 1}</span><strong>{item}</strong></div>)}</div>
        <div className="degraded-notice"><strong>⚠ NIV-D04-01 indisponível</strong><span>Fallback NIV-D04-02 · confiança 82% → 68%</span><small>Último dado válido 16:21 · usando fonte redundante</small></div>
        <button className="primary-button" onClick={() => { setAlertState("Em análise"); props.onToast(`${signal.id} promovido para avaliação de alerta`); }}>Avaliar como alerta</button>
      </aside>
    </section>;
  }

  if (props.subview === "Alertas") {
    return <section className="control-alerts-view">
      <article className="panel alert-hero-card"><div className="alert-hero-top"><div><span className="eyebrow">ALERTA BASEADO EM IMPACTO</span><h2>AL-0187 · Chuva extrema + drenagem</h2></div><Pill tone="critical">{alertState}</Pill></div>
        <div className="alert-stat-grid"><div><span>Nível</span><strong>ALERTA</strong></div><div><span>Probabilidade</span><strong>82%</strong></div><div><span>Validade</span><strong>17:40–23:30</strong></div><div><span>Tempo para ação</span><strong>01:42</strong></div><div><span>Ativos expostos</span><strong>7</strong></div><div><span>Impacto</span><strong>−8 a −12%</strong></div></div>
        <div className="alert-recommendation"><div><span>Área</span><strong>Pátio Norte / D-04</strong></div><p><b>Recomendação:</b> executar protocolo CHUVA-03, antecipar limpeza e posicionar bomba móvel.</p></div>
        <div className="decision-actions"><button className="primary-button" onClick={() => { setAlertState("Emitido"); props.onToast("AL-0187 validado e emitido · workflow criado"); }}>Aprovar e emitir</button><button className="secondary-button" onClick={() => props.onToast("Parâmetros do alerta abertos para ajuste")}>Ajustar</button><button className="quiet-button" onClick={() => setAlertState("Descartado")}>Descartar</button></div>
      </article>
      <article className="panel alert-lifecycle"><SectionHeader eyebrow="CICLO CONTROLADO" title="Estado do alerta" />
        <div className="lifecycle-flow">{["Detectado", "Em análise", "Validado", "Emitido", "Reconhecido", "Em resposta", "Estabilizado", "Encerrado"].map((item, index) => <div className={index <= (alertState === "Emitido" ? 3 : 1) ? "active" : ""} key={item}><span>{index < (alertState === "Emitido" ? 3 : 1) ? "✓" : index + 1}</span><strong>{item}</strong></div>)}</div>
      </article>
      <article className="panel alert-list"><SectionHeader eyebrow="CENTRAL" title="Alertas correlacionados" />{alerts.map((item) => <button className="alert-list-row" key={item.id}><span className={`feed-node tone-${item.tone}`}>!</span><div><strong>{item.id} · {item.title}</strong><small>{item.area} · {item.validity}</small></div><div><b>{item.probability}</b><small>{item.impact}</small></div><Pill tone={item.tone}>{item.state}</Pill></button>)}</article>
    </section>;
  }

  if (props.subview === "Impactos") {
    return <section className="control-impact-view">
      <article className="panel cascade-panel"><SectionHeader eyebrow="IMPACT ASSESSMENT · IA-0041" title="Propagação da chuva extrema" action={<Pill tone="alert">P90 · 82%</Pill>} />
        <div className="cascade-flow">{cascade.map((node, index) => <button key={node.id} onClick={() => props.onToast(`/chain?asset=${node.id}&event=EV-0187&scenario=SCN-RAIN-03`)}><span className={`cascade-icon tone-${node.tone}`}>{index + 1}</span><div><strong>{node.label}</strong><small>{node.detail}</small></div><b>{node.value}</b>{index < cascade.length - 1 ? <i>↓</i> : null}</button>)}</div>
      </article>
      <aside className="impact-side-stack"><article className="panel bottleneck-card"><span className="eyebrow">PRINCIPAL GARGALO · 24H</span><h2>Drenagem D-04</h2><strong className="criticality">9,4<small>/10</small></strong><dl><div><dt>Probabilidade</dt><dd>68%</dd></div><div><dt>Capacidade afetada</dt><dd>−8,2%</dd></div><div><dt>Processos indiretos</dt><dd>3</dd></div></dl><button className="full-button" onClick={() => props.onToast("Módulo Cadeia aberto em D-04 · contexto preservado")}>Analisar cadeia →</button></article>
        <article className="panel waterfall-card"><SectionHeader eyebrow="WATERFALL FINANCEIRO" title="Impacto e mitigação" />{[["Produção", "−4,2M", 80], ["Logística", "−1,1M", 32], ["Demurrage", "−0,4M", 18], ["Recuperação", "−0,6M", 24], ["Mitigação", "+2,1M", 52]].map(([label, value, width], index) => <div className={index === 4 ? "positive" : ""} key={label as string}><span>{label}</span><i style={{ width: `${width}%` }} /><strong>{value}</strong></div>)}<footer><span>Impacto líquido</span><strong>R$ −4,2 mi</strong></footer></article></aside>
    </section>;
  }

  if (props.subview === "Decisões") {
    return <section className="control-decision-view">
      <article className="panel decision-command"><div className="decision-command-head"><div><span className="eyebrow">DEC-0248 · DECISÃO HUMANA</span><h2>Antecipar redução do reservatório R-02?</h2></div><Pill tone={props.decisionState.startsWith("Aprovada") ? "ok" : "watch"}>{props.decisionState}</Pill></div>
        <div className="decision-command-kpis"><div><span>Urgência</span><strong>28 min</strong></div><div><span>Risco sem ação</span><strong>R$ 4,2 mi</strong></div><div><span>Perda evitada</span><strong>R$ 1,6–4,2 mi</strong></div><div><span>Confiança</span><strong>78%</strong></div></div>
        <span className="eyebrow">COMPARAR ALTERNATIVAS</span><div className="alternative-grid">{alternatives.map((item) => <label className={`${alternative === item.id ? "selected" : ""} ${item.recommended ? "recommended" : ""}`} key={item.id}><input type="radio" name="alternative" value={item.id} checked={alternative === item.id} onChange={() => setAlternative(item.id)} /><span>Alternativa {item.id}{item.recommended ? <b>RECOMENDADA</b> : null}</span><h3>{item.title}</h3><dl><div><dt>Produção</dt><dd>{item.production}</dd></div><div><dt>Custo</dt><dd>{item.cost}</dd></div><div><dt>Risco residual</dt><dd>{item.risk}</dd></div><div><dt>Perda esperada</dt><dd>{item.loss}</dd></div></dl></label>)}</div>
        <div className="decision-form"><label><span>Justificativa obrigatória</span><textarea rows={3} value={justification} onChange={(event) => setJustification(event.target.value)} /></label><div><label><span>Responsável</span><input value="Marina Silva · Gestora da Unidade" readOnly /></label><label><span>Prazo</span><input value="07/08/2026 · 17:10 BRT" readOnly /></label></div><div className="decision-checks"><label><input type="checkbox" defaultChecked /> Converter em workflow</label><label><input type="checkbox" defaultChecked /> Solicitar inspeção</label><label><input type="checkbox" defaultChecked /> Comunicar áreas afetadas</label></div></div>
        <div className="decision-actions"><button className="primary-button" disabled={!justification || props.decisionState.startsWith("Aprovada")} onClick={props.onApproveDecision}>{props.decisionState.startsWith("Aprovada") ? "✓ Alternativa aprovada" : `Aprovar alternativa ${alternative}`}</button><button className="secondary-button" onClick={() => props.onToast("Premissas, modelos e evidências da DEC-0248 abertos")}>Ver evidências</button></div>
      </article>
      <article className="panel execution-plan"><SectionHeader eyebrow="DECISION EXECUTION PLAN" title="Decisão → execução → risco residual" />
        <div className="execution-flow">{["DEC-0248 aprovada", "WF-CTRL-02", "Limpar D-04", "Posicionar BM-07", "Vistoriar acesso", "Recalcular risco"].map((item, index) => <div className={props.decisionState.startsWith("Aprovada") && index < 3 ? "active" : ""} key={item}><span>{index + 1}</span><strong>{item}</strong>{index < 5 ? <b>→</b> : null}</div>)}</div>
      </article>
    </section>;
  }

  if (props.subview === "Trabalho") {
    return <section className="control-work-view">
      <div className="work-summary-grid"><article className="panel work-progress"><span className="eyebrow">JOB-003291</span><h2>Preparação chuva extrema</h2><Pill tone="info">Em execução</Pill><div className="progress-ring" style={{ "--progress": `${(completedTasks / 4) * 100}%` } as CSSProperties}><strong>{Math.round((completedTasks / 4) * 100)}%</strong></div><p>{completedTasks}/4 tarefas concluídas · SLA 00:38</p><button className="primary-button" onClick={() => setCompletedTasks((value) => Math.min(4, value + 1))}>Avançar próxima tarefa</button></article>
        <article className="panel workflow-detail"><SectionHeader eyebrow="WF-CTRL-02 · RESPOSTA PREVENTIVA" title="Etapas e dependências" />{["Validar condição", "Limpar drenagem", "Posicionar bomba", "Inspecionar acesso", "Confirmar condição futura"].map((item, index) => <div className={`workflow-line ${index < completedTasks ? "done" : index === completedTasks ? "current" : ""}`} key={item}><span>{index < completedTasks ? "✓" : index + 1}</span><div><strong>{item}</strong><small>{index < completedTasks ? "Concluído com evidência" : index === completedTasks ? "Em execução · responsável notificado" : "Aguardando pré-requisito"}</small></div></div>)}</article>
        <article className="panel workflow-templates"><SectionHeader eyebrow="WORKFLOW MANAGER" title="Templates disponíveis" />{["WF-CTRL-01 · Investigação de sinal", "WF-CTRL-02 · Resposta preventiva", "WF-CTRL-03 · Vistoria operacional", "WF-CTRL-04 · Replanejamento", "WF-CTRL-05 · Validação de alerta", "WF-CTRL-06 · Resposta a incidente", "WF-CTRL-07 · Recuperação", "WF-CTRL-08 · Inconsistência"].map((item) => <button key={item} onClick={() => props.onToast(`${item} selecionado`)}>{item}<span>›</span></button>)}</article></div>
      <article className="panel jobs-table"><SectionHeader eyebrow="TRABALHO E DESPACHOS" title="Jobs, responsáveis, SLA e evidências" action={<button className="secondary-button" onClick={props.onDispatch}>＋ Despachar vistoria</button>} /><div className="task-table-wrap"><table className="task-table"><thead><tr><th>ID</th><th>Tarefa</th><th>Responsável</th><th>SLA</th><th>Status</th><th>Evidência</th></tr></thead><tbody>{jobs.map((job) => <tr key={job.id}><td><strong>{job.id}</strong></td><td>{job.task}</td><td>{job.owner}</td><td>{job.sla}</td><td><Pill tone={job.tone}>{job.status}</Pill></td><td>{job.evidence}</td></tr>)}</tbody></table></div></article>
    </section>;
  }

  if (props.subview === "Agentes") {
    return <section className="control-agent-view">
      <article className="panel agent-guardrail"><div><span className="eyebrow">AGENTIC ORCHESTRATION</span><h2>Agentes trabalham; humanos mantêm a autoridade</h2><p>Evento → recomendação → regra/política → aprovação → workflow → sistema responsável.</p></div><div className="guardrail-chain">{["LLM / agente", "Política", "Aprovação", "Workflow", "Sistema mestre"].map((item, index) => <span key={item}>{item}{index < 4 ? <b>→</b> : null}</span>)}</div></article>
      <div className="control-agent-grid">{controlAgents.map((agent) => <article className="panel control-agent-card" key={agent.code}><header><span className="agent-orb">AI</span><div><small>{agent.code}</small><h3>{agent.name}</h3></div><Pill tone={agent.tone}>{agent.status}</Pill></header><p>{agent.detail}</p><footer><span>Autonomia nível {agent.autonomy}</span><button onClick={() => props.onToast(`${agent.code}: explicação operacional e fontes abertas`)}>Por que?</button><button onClick={() => props.onToast(`${agent.code}: ação solicitada com guardrails`)}>Ações</button></footer></article>)}</div>
      <article className="panel agent-live-feed"><SectionHeader eyebrow="EVENT BUS · TEMPO REAL" title="Atividade dos agentes" action={<button className="secondary-button" onClick={props.onAgents}>Abrir central completa</button>} /><div className="agent-feed horizontal">{props.feed.slice(0, 7).map((item) => <div className="feed-item" key={item.id}><span className={`feed-node tone-${item.type}`}>{item.agent.slice(0, 2)}</span><div><div><strong>{item.agent}</strong><time>{item.time}</time></div><p>{item.text}</p></div></div>)}</div></article>
    </section>;
  }

  if (props.subview === "Incidentes") {
    if (!props.incidentMode) return <section className="panel incident-empty-state"><span className="incident-ready-icon">◎</span><span className="eyebrow">PRONTIDÃO OPERACIONAL</span><h2>Sem incidentes ativos</h2><p>3 alertas em acompanhamento · recursos N2 pré-posicionados · missão preparada.</p><div className="incident-readiness"><div><strong>7</strong><span>equipes disponíveis</span></div><div><strong>12</strong><span>recursos críticos</span></div><div><strong>04:18</strong><span>último exercício</span></div><div><strong>96%</strong><span>prontidão</span></div></div><button className="primary-button" onClick={() => props.onIncidentMode(true)}>Ativar incidente simulado</button></section>;
    return <section className="incident-command-view">
      <article className="panel incident-command-hero"><div><span className="eyebrow">INCIDENT MODE · INC-024</span><h2>Inundação — Pátio Norte</h2><p>Ativo há 00:47 · Comandante Carlos A. · última atualização há 8 s</p></div><Pill tone="critical">ATIVO · N2</Pill><button onClick={() => props.onIncidentMode(false)}>Estabilizar simulação</button></article>
      <div className="incident-kpis">{[["Equipes", "7", "6 mobilizadas"], ["Tarefas", "18 / 24", "3 críticas"], ["Ativos afetados", "4", "C17 restrita"], ["Pessoas em risco", "0", "geofence ativo"], ["Risco operacional", "ALTO", "tendência estável"]].map(([label, value, note]) => <article className="panel" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div>
      <div className="incident-command-grid"><article className="panel incident-map"><SectionHeader eyebrow="MAPA DE COMANDO" title="Evento, equipes e recursos" />{props.renderMap()}</article><article className="panel incident-resources"><SectionHeader eyebrow="MISSÃO TÁTICA" title="Equipes e comunicação" />{["EQ-12 · Bomba BM-07 · no local", "HSE-02 · vistoria · 3 min", "BRG-03 · prontidão · Base Sul", "COM-01 · stakeholders · enviado"].map((item, index) => <div key={item}><span className={index < 2 ? "live-dot" : "standby-dot"} /><strong>{item}</strong></div>)}<button className="full-button" onClick={props.onDispatch}>Nova tarefa de incidente</button></article></div>
    </section>;
  }

  if (props.subview === "Briefing") {
    return <section className="control-briefing-view">
      <article className="panel briefing-document"><header><div><span className="eyebrow">BRIEFING OPERACIONAL · GERADO POR IA</span><h2>Passagem de turno B · 07/08/2026</h2><p>14:00–22:00 · Tubarão · Chuva extrema</p></div><div><Pill tone="ok">Fontes citadas</Pill><Pill tone="info">Confiança 82%</Pill></div></header>
        <div className="briefing-sections">{[
          ["Situação atual", "Operação em atenção. Nova rodada elevou chuva para 73 mm; D-04 e C17 concentram a exposição material."],
          ["Últimas 8 horas", "5 sinais, 3 alertas e 1 decisão crítica. Derating da BP-D04-03 confirmado e fallback de nível ativado."],
          ["Próximas 24 horas", "Pico previsto entre 18h e 22h. Capacidade mínima projetada em 88,4%; recuperação esperada após 02h."],
          ["Ações em curso", "JOB-003291 em 72%. Bomba BM-07 em posicionamento; HSE-02 a caminho do acesso norte."],
          ["Decisões pendentes", "DEC-0248 requer aprovação em 28 min. Comunicação externa permanece em nível C, aprovação obrigatória."],
          ["Pontos de atenção", "NIV-D04-01 offline; modelo usa redundância. Próxima rodada ECMWF às 18:20."],
        ].map(([title, text], index) => <section key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{text}</p></div></section>)}</div>
        <div className="briefing-basis"><strong>Base e linhagem</strong><span>ECMWF 12Z</span><span>H2D v4.3</span><span>ATLAS Cascata v4</span><span>NIV-D04-02</span><span>SCADA 16:30</span></div>
        <footer><button className="primary-button" onClick={() => props.onToast("Briefing executivo de 30 segundos gerado")}>Gerar versão executiva</button><button className="secondary-button" onClick={() => props.onToast("Relatório de turno registrado no histórico")}>Registrar passagem de turno</button><button className="quiet-button" onClick={() => props.onToast("Pacote de evidências preparado para exportação")}>Exportar evidências</button></footer>
      </article>
      <aside className="briefing-side"><article className="panel"><SectionHeader eyebrow="RESULTADO VERIFICADO" title="Valor preservado" /><div className="result-stack"><div><span>Perda potencial</span><strong>R$ 8,4 mi</strong></div><div><span>Perda realizada</span><strong>R$ 1,1 mi</strong></div><div className="positive"><span>Valor preservado</span><strong>R$ 7,3 mi</strong></div></div></article><article className="panel"><SectionHeader eyebrow="VERSÕES" title="Audiência" />{["30 s · Executivo", "3 min · Gerencial", "Técnica · Especialistas"].map((item) => <button className="briefing-version" key={item}>{item}<span>Gerar →</span></button>)}</article></aside>
    </section>;
  }

  return <section className="control-situation-view">
    <section className="control-kpi-grid" aria-label="Indicadores essenciais da Torre">{kpis.map((kpi) => <button className={`control-kpi-card tone-${kpi.tone}`} key={kpi.label} onClick={() => props.onToast(`${kpi.label}: explicação, fonte e histórico abertos`)}><span>{kpi.label}</span><strong>{kpi.value}</strong><b>{kpi.delta}</b><small>{kpi.unit}</small><footer><i>conf. {kpi.confidence}</i><i>{kpi.source}</i><i>há 5 s</i></footer></button>)}</section>
    <section className="control-situation-grid">
      <article className="panel situation-map"><SectionHeader eyebrow="COMMON OPERATIONAL PICTURE" title={`Tubarão · ${props.horizon}`} action={<><Pill tone={props.stage.tone}>{props.stage.label}</Pill><button className="quiet-button" onClick={() => props.onToast("Use a guia Mapa vivo para investigação completa")}>Ferramentas ↗</button></>} /><div className="situation-map-wrap">{props.renderMap()}<div className="situation-map-overlay"><strong>AL-0187</strong><span>Chuva extrema</span><b>82% · 18h–22h</b></div><div className="map-status"><span className="health-pulse" />{props.mapStatus}</div></div></article>
      <article className="panel what-changed"><SectionHeader eyebrow="EXCEPTION FIRST" title="O que mudou desde 15:00?" />{[["01", "Previsão de chuva", "48 → 73 mm", "Prob. D-04: 31% → 68%"], ["02", "Risco do Pátio Norte", "Moderado → Alto", "Nova rodada + saturação"], ["03", "Capacidade prevista", "96% → 92%", "Impacto provável: C17"]].map(([id, title, value, why]) => <button key={id} onClick={() => props.onToast(`${title}: evidências abertas`)}><span>{id}</span><div><strong>{title}</strong><b>{value}</b><small>{why}</small></div><i>›</i></button>)}</article>
      <article className="panel ai-briefing"><SectionHeader eyebrow="AURORA · BRIEFING IA" title="Situação → impacto → decisão" action={<Pill tone="info">82% confiança</Pill>} /><div className="brief-block"><span>Situação</span><p>A nova rodada aumentou a probabilidade de chuva extrema entre 18h e 22h. D-04, acesso norte e C17 concentram o risco.</p></div><div className="brief-block"><span>Impacto</span><p>Capacidade de recebimento pode cair 8% durante quatro horas, com 38,2 kt e R$ 8,4 mi em exposição.</p></div><div className="brief-block decision"><span>Principal decisão</span><p>Antecipar limpeza da D-04 e posicionar bombeamento móvel até 17h20.</p></div><div className="ai-brief-actions"><button onClick={() => props.onToast("Evidências: ECMWF 12Z · H2D v4.3 · SCADA 16:30")}>Ver evidências</button><button onClick={() => props.onToast("Alternativas A, B e C disponíveis na Central de Decisões")}>Comparar alternativas</button><button onClick={props.onDispatch}>Criar plano</button></div></article>
    </section>
    <section className="control-lower-grid"><article className="panel compact-cascade"><SectionHeader eyebrow="IMPACTO EM CASCATA" title="D-04 → cadeia → compromisso" /> <div>{cascade.slice(0, 5).map((node, index) => <button key={node.id} onClick={() => props.onToast(`${node.label}: contexto aberto na cadeia`)}><span className={`tone-${node.tone}`}>{index + 1}</span><strong>{node.label}</strong><b>{node.value}</b>{index < 4 ? <i>→</i> : null}</button>)}</div></article><article className="panel priority-decision"><SectionHeader eyebrow="DECISÃO PRIORITÁRIA" title="DEC-0248 · 28 min" action={<Pill tone={props.decisionState.startsWith("Aprovada") ? "ok" : "watch"}>{props.decisionState}</Pill>} /><p>Reduzir R-02 em 0,8 m e posicionar BM-07 preserva 9,2 kt com risco residual baixo.</p><div><span><small>Custo</small><strong>R$ 18 mil</strong></span><span><small>Perda evitada</small><strong>R$ 1,6–4,2 mi</strong></span><span><small>Confiança</small><strong>78%</strong></span></div><button className="primary-button" onClick={props.onApproveDecision} disabled={props.decisionState.startsWith("Aprovada")}>{props.decisionState.startsWith("Aprovada") ? "✓ Aprovada" : "Revisar e aprovar"}</button></article><article className="panel scenario-story"><SectionHeader eyebrow="PLATAFORMA VIVA" title="Timeline operacional" />{props.feed.slice(0, 4).map((item) => <div key={item.id}><span className={`feed-node tone-${item.type}`}>{item.agent.slice(0, 2)}</span><p><strong>{item.time} · {item.agent}</strong>{item.text}</p></div>)}</article></section>
    <article className="panel operational-table"><SectionHeader eyebrow="OPERAÇÃO" title="Prioridades, responsáveis e próxima ação" action={<button className="secondary-button" onClick={props.onDispatch}>＋ Criar despacho</button>} /><div className="task-table-wrap"><table className="task-table"><thead><tr><th>Prioridade</th><th>Objeto</th><th>Evento</th><th>Estado</th><th>Prob.</th><th>Impacto</th><th>Tempo</th><th>Responsável</th><th>Próxima ação</th><th>SLA</th></tr></thead><tbody><tr onClick={() => props.onSelectAsset("D04")}><td><Pill tone="critical">Crítica</Pill></td><td><strong>Drenagem D-04</strong></td><td>Chuva</td><td>Em resposta</td><td>82%</td><td>Alto</td><td>1h22</td><td>Utilidades</td><td>Bomba BM-07</td><td>00:38</td></tr><tr onClick={() => props.onSelectAsset("CONV-C17")}><td><Pill tone="alert">Alta</Pill></td><td><strong>Correia C17</strong></td><td>Restrição</td><td>Monitorando</td><td>63%</td><td>−18%</td><td>2h40</td><td>Operação</td><td>Rota C12</td><td>01:12</td></tr></tbody></table></div></article>
  </section>;
}
