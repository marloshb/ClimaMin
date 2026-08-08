"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";

type Tone = "ok" | "watch" | "alert" | "critical" | "info";
type Stage = { label: string; time: string; note: string; tone: Tone };

type Props = {
  subview: string;
  horizon: string;
  profile: string;
  scenarioStep: number;
  stage: Stage;
  mapStatus: string;
  layers: Record<string, boolean>;
  renderMap: () => ReactNode;
  onHorizon: (value: string) => void;
  onToggleLayer: (key: string) => void;
  onAgents: () => void;
  onToast: (message: string) => void;
  onTower: () => void;
  onTwin: () => void;
};

export const hazardTabs = [
  "Situação Multiameaças",
  "Catálogo de Modelos",
  "Execuções",
  "Hidrologia & Inundação",
  "Vento, Raios & Fumaça",
  "Calor, Seca & Fogo",
  "Encostas, Árvores & Costa",
  "Eventos Compostos",
  "Comparar",
  "Validação & QA",
  "Hazard Signals",
  "Agentes",
  "Integrações ArcGIS",
  "Relatórios & SLO",
];

export const hazardScenarioStages: Stage[] = [
  { label: "Normal", time: "T+00", note: "P90 0,19 m · sem perigo", tone: "ok" },
  { label: "Nova previsão", time: "T+10", note: "FR-2204 recebido", tone: "info" },
  { label: "Chuva inicia", time: "T+20", note: "Intensidade 42 mm/h", tone: "watch" },
  { label: "Solo satura", time: "T+30", note: "Saturação 84%", tone: "watch" },
  { label: "Model run", time: "T+40", note: "HMR-881 → HMR-882", tone: "info" },
  { label: "Bomba falha", time: "T+50", note: "D04-03 indisponível", tone: "critical" },
  { label: "Rerun", time: "T+55", note: "Condição inicial atualizada", tone: "watch" },
  { label: "Perigo aumenta", time: "T+65", note: "P90 sobe para 0,51 m", tone: "critical" },
  { label: "HazardSignal", time: "T+70", note: "HSIG-1032 publicado", tone: "alert" },
  { label: "Bomba móvel", time: "T+90", note: "BM-07 ativada", tone: "info" },
  { label: "Novo rerun", time: "T+95", note: "Cenário mitigado", tone: "info" },
  { label: "Recessão", time: "T+110", note: "P90 reduz para 0,27 m", tone: "ok" },
];

export const hazardBaseFeed = [
  { agent: "PUBLISHER", text: "HazardSurface HS-882 publicada no ArcGIS Image Service.", type: "ok" as Tone },
  { agent: "QA", text: "HMR-882 aprovado: ranges físicos, tempo, extent e NoData consistentes.", type: "ok" as Tone },
  { agent: "HYDRAULIC", text: "Rede 1D + superfície 2D concluídas em 41 s.", type: "info" as Tone },
  { agent: "PRE-CHECK", text: "Inputs aprovados com ressalva: umidade do solo há 34 min.", type: "watch" as Tone },
  { agent: "ORCHESTRATOR", text: "ClimateSignal CS-204 acionou HYDRO-TUB-02.", type: "alert" as Tone },
];

export const hazardScenarioFeed: Record<number, { agent: string; text: string; type: Tone }> = {
  1: { agent: "ORCHESTRATOR", text: "FR-2204 e ClimateSignal CS-204 recebidos pelo Event Bus.", type: "info" },
  2: { agent: "RAINFALL", text: "Hietograma operacional atualizado: intensidade máxima 42 mm/h.", type: "watch" },
  3: { agent: "PRE-CONDITIONS", text: "Saturação antecedente chegou a 84%; condição inicial material.", type: "watch" },
  4: { agent: "HYDROLOGY", text: "HMR-881 concluído: Q pico P50 7,8 m³/s; hidráulica iniciada.", type: "info" },
  5: { agent: "INCONSISTENCY", text: "Telemetria confirma bomba D04-03 OFF; cenário baseline ficou obsoleto.", type: "critical" },
  6: { agent: "SCENARIO", text: "HMR-882 reexecutado preservando dado original e override operacional.", type: "watch" },
  7: { agent: "HYDRAULIC", text: "D-04 excede capacidade às 20:12; profundidade P90 agora 0,51 m.", type: "critical" },
  8: { agent: "PUBLISHER", text: "HSIG-1032 enviado à Torre; HS-882 entregue ao Gêmeo Operacional.", type: "alert" },
  9: { agent: "STREAM", text: "Estado BM-07 ON recebido; condição inicial atualizada em tempo real.", type: "info" },
  10: { agent: "SCENARIO", text: "Cenário com bomba móvel executado e comparado ao HMR-882.", type: "info" },
  11: { agent: "QA", text: "Perigo reduzido: P90 0,27 m; resultado validado e versão anterior superada.", type: "ok" },
};

const modelRegistry = [
  ["HYDRO-TUB-02", "Hidrologia", "5.2", "10 m / sub-bacias", "72 h", "OPERACIONAL", "82"],
  ["HYDRAULIC-TUB-03", "Hidráulica 1D/2D", "4.3", "5 m", "24 h", "OPERACIONAL", "78"],
  ["WIND-TUB-02", "Vento local", "3.1", "25 m", "72 h", "OPERACIONAL", "76"],
  ["HEAT-WBGT-01", "Calor / WBGT", "2.6", "Zonas", "10 d", "OPERACIONAL", "89"],
  ["FIRE-SPREAD-02", "Fogo", "2.2", "30 m", "48 h", "VALIDATION", "71"],
  ["SLOPE-GEO-03", "Encostas", "1.9", "5 m", "72 h", "RESTRICTED", "74"],
  ["COAST-TUB-03", "Costa / ondas", "3.4", "50 m", "7 d", "OPERACIONAL", "81"],
];

const agents = [
  ["MODEL ORCHESTRATOR", "Seleciona fast/full model, coordena jobs e Event Bus.", "2 modelos ativos", "Não emite ordem operacional"],
  ["PRE-CONDITION", "Valida inputs, domínio, unidade, estado inicial e compatibilidade.", "WIND-023 em validação", "Ressalva exige aceite técnico"],
  ["QA", "Testa range físico, NoData, artefatos, tempo e extensão.", "1 run em revisão", "Pode bloquear publicação"],
  ["INCONSISTENCY", "Confronta modelo, sensores, câmeras e campo.", "D04-03 reconciliada", "Não altera fonte oficial"],
  ["SENSITIVITY", "Quantifica drivers e elasticidade do resultado.", "HMR-882 concluído", "Expõe evidências, não chain-of-thought"],
  ["SCENARIO", "Clona cenário, altera estado e compara outputs.", "BM-07 simulado", "Override sempre preserva original"],
  ["VALIDATION", "Compara modelado × observado e atualiza performance.", "Aguardando observações", "Recalibração requer especialista"],
  ["PUBLISHER", "Publica superfícies e sinais com contrato completo.", "4 superfícies publicadas", "Só após QA PASS"],
];

function Pill({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`hazard-pill tone-${tone}`}><i />{children}</span>;
}

function PanelHead({ eyebrow, title, side }: { eyebrow: string; title: string; side?: ReactNode }) {
  return <div className="hazard-panel-head"><div><span>{eyebrow}</span><h2>{title}</h2></div>{side}</div>;
}

function HazardMap({ props, hazard = "flood", label = "Profundidade P90", compact = false }: { props: Props; hazard?: string; label?: string; compact?: boolean }) {
  return <div className={`hazard-map ${compact ? "compact" : ""}`}>
    {props.renderMap()}
    <div className={`hazard-surface surface-${hazard}`} />
    <div className="hazard-contour contour-a" /><div className="hazard-contour contour-b" />
    <button className="hazard-pixel" onClick={() => props.onToast(`${label} · 21:10 · P50 0,34 m · P90 0,51 m · probabilidade 76%`)}><span>＋</span><strong>D-04</strong><small>21:10 · {label}</small></button>
    {hazard === "lightning" ? <><i className="lightning-dot l1">ϟ</i><i className="lightning-dot l2">ϟ</i><i className="lightning-dot l3">ϟ</i><div className="lightning-geofence">ETA 31 min</div></> : null}
    {hazard === "wind" ? <div className="wind-streams">{Array.from({ length: 9 }, (_, index) => <i key={index}>→</i>)}</div> : null}
    {hazard === "fire" ? <div className="fire-front"><i /><i /><i /><b>F-018 · 0,7 km/h</b></div> : null}
    <div className="hazard-map-id"><b>{label}</b><span>HMR-882 · v4.3</span><span>VALID 21:10 · CONF 79%</span></div>
    <div className="hazard-map-legend"><span><i />Baixa</span><span><i />Moderada</span><span><i />Alta</span><b>{props.mapStatus}</b></div>
  </div>;
}

function HazardKpis({ scenarioStep }: { scenarioStep: number }) {
  const pumpFailed = scenarioStep >= 5 && scenarioStep < 9;
  const mitigated = scenarioStep >= 9;
  const floodDepth = pumpFailed ? "0,51 m" : mitigated ? "0,27 m" : "0,37 m";
  const floodArea = pumpFailed ? "2,6 km²" : mitigated ? "1,1 km²" : "1,8 km²";
  const items: Array<[string, string, string, string, Tone]> = [
    ["Perigos ativos", scenarioStep >= 7 ? "4" : "2", "2 relevantes", "Flood · wind · lightning · heat", "alert"],
    ["Área potencialmente afetada", floodArea, pumpFailed ? "+42% vs. run anterior" : mitigated ? "−58% após mitigação" : "P90 · HMR-882", "Flood depth · HMR-882", pumpFailed ? "critical" : "watch"],
    ["Ativos espacialmente expostos", pumpFailed ? "17" : mitigated ? "8" : "12", "M4 determinará impacto", "INTERSECT pendente", "watch"],
    ["Principal perigo", "INUNDAÇÃO", "Pátio Norte · D-04", `P90 ${floodDepth}`, "critical"],
    ["Até primeiro impacto físico", pumpFailed ? "01h24" : "01h42", "chegada provável 19:42", "Pico 21:10", "alert"],
    ["Modelos ativos", scenarioStep >= 4 && scenarioStep < 8 ? "6 · 1 rodando" : "6", "HYDRO + HYDRAULIC", "QA e publicação monitorados", "ok"],
  ];
  return <section className="hazard-kpi-grid">{items.map(([label, value, note, source, tone]) => <article className={`hazard-kpi tone-${tone}`} key={label}><span>{label}</span><strong>{value}</strong><b>{note}</b><footer><small>{source}</small><Pill tone={tone}>{tone === "ok" ? "CURRENT" : "LIVE"}</Pill></footer></article>)}</section>;
}

function Overview(props: Props) {
  const [hazard, setHazard] = useState("flood");
  const [hour, setHour] = useState(21);
  const pumpFailed = props.scenarioStep >= 5 && props.scenarioStep < 9;
  return <div className="hazard-view">
    <HazardKpis scenarioStep={props.scenarioStep} />
    <section className="hazard-overview-grid">
      <article className="panel hazard-map-card">
        <PanelHead eyebrow="MAPA MULTI-HAZARD · ARCGIS" title="Situação física prevista · Tubarão" side={<Pill tone={props.stage.tone}>{props.stage.label}</Pill>} />
        <div className="hazard-variable-tabs">{[["flood","Inundação"],["wind","Vento"],["lightning","Raios"],["heat","Calor"],["fire","Fogo"],["coast","Costa"]].map(([key,label]) => <button className={hazard === key ? "active" : ""} onClick={() => setHazard(key)} key={key}>{label}</button>)}</div>
        <HazardMap props={props} hazard={hazard} label={hazard === "flood" ? "Profundidade P90" : hazard === "wind" ? "Rajada P90" : hazard === "lightning" ? "Ingresso geofence" : hazard === "heat" ? "WBGT" : hazard === "fire" ? "Propagação" : "Nível combinado"} />
        <div className="hazard-time"><button onClick={() => setHour(Math.max(18, hour - 1))}>◀</button><button onClick={() => props.onToast("Animação temporal iniciada · 18:00 → 23:00")}>▶</button><input aria-label="Tempo válido do perigo" type="range" min="18" max="23" value={hour} onChange={event => setHour(Number(event.target.value))} /><strong>{hour}:00</strong><span>CHEGADA</span><b>PICO 21:10</b><em>RECESSÃO</em></div>
      </article>
      <aside className="hazard-overview-side">
        <article className="panel hazard-summary"><PanelHead eyebrow="RESUMO DE PERIGOS" title="D-04 · Pátio Norte" side={<Pill tone="critical">RELEVANTE</Pill>} /><div className="hazard-summary-main"><span>PROFUNDIDADE P90</span><strong>{pumpFailed ? "0,51 m" : props.scenarioStep >= 9 ? "0,27 m" : "0,37 m"}</strong><small>Prob. 76% · confiança 79%</small></div><dl><div><dt>Chegada</dt><dd>19:42</dd></div><div><dt>Pico</dt><dd>21:10</dd></div><div><dt>Duração &gt;0,20 m</dt><dd>{pumpFailed ? "4h10" : "2h40"}</dd></div><div><dt>Velocidade</dt><dd>0,54 m/s</dd></div><div><dt>Modelo</dt><dd>HYDRAULIC 4.3</dd></div></dl><button onClick={() => props.onToast("Popup técnico aberto: depth, velocity, arrival e recession")}>Abrir superfície técnica</button></article>
        <article className="panel hazard-changed"><PanelHead eyebrow="WHAT CHANGED?" title="Desde o run anterior" /><div><span>Área inundada</span><strong>{pumpFailed ? "+42%" : props.scenarioStep >= 9 ? "−58%" : "+8%"}</strong></div><div><span>Profundidade</span><strong>{pumpFailed ? "+0,14 m" : props.scenarioStep >= 9 ? "−0,24 m" : "+0,03 m"}</strong></div><div><span>Chegada</span><strong>{pumpFailed ? "−18 min" : "+7 min"}</strong></div><div><span>Principal causa</span><strong>{pumpFailed ? "Bomba 3 OFF" : props.scenarioStep >= 9 ? "BM-07 ON" : "Chuva + solo"}</strong></div><button onClick={() => props.onToast("Explicação estruturada aberta com evidências do forecast, solo, bombas e maré")}>Por que mudou?</button></article>
      </aside>
    </section>
    <section className="hazard-lower-grid">
      <article className="panel hazard-pipeline"><PanelHead eyebrow="MODEL FACTORY · TEMPO REAL" title="CS-204 → HMR-882 → HS-882" side={<button onClick={props.onAgents}>Central de agentes →</button>} /><div className="hazard-pipeline-flow">{["ClimateSignal","Pre-check","Hydrology","Hydraulic","QA","Publish"].map((item,index) => <span className={index <= Math.min(5, Math.floor(props.scenarioStep / 1.5)) ? "done" : index === Math.min(5, Math.ceil(props.scenarioStep / 1.5)) ? "current" : ""} key={item}><i>{index < Math.floor(props.scenarioStep / 1.5) ? "✓" : index + 1}</i><b>{item}</b><small>{["CS-204","1 ressalva","HMR-881","HMR-882","PASS","HS-882"][index]}</small></span>)}</div></article>
      <article className="panel hazard-confidence"><PanelHead eyebrow="HAZARD CONFIDENCE" title="79 / 100" side={<Pill tone="ok">BOA</Pill>} />{[["Forecast",82],["Input data",94],["Model skill",78],["Initial condition",71],["Model agreement",72]].map(([label,value]) => <div key={label as string}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>)}<button onClick={() => props.onToast("Confiança explicada · maior incerteza: condição inicial da bomba")}>Por que 79%?</button></article>
      <article className="panel hazard-agent-feed"><PanelHead eyebrow="AGENTES CIENTÍFICOS" title="Feed agentic" />{hazardBaseFeed.slice(0,4).map((item,index) => <div key={item.agent}><time>18:4{index + 1}:{String(index * 7 + 2).padStart(2,"0")}</time><b>{item.agent}</b><small>{item.text}</small></div>)}</article>
    </section>
    <article className="panel hazard-table"><PanelHead eyebrow="PRIORIDADES FÍSICAS" title="Perigos ativos e previstos" side={<button onClick={() => props.onToast("Hazard Situation Report gerado com mapas, incerteza e limitações")}>Gerar situation report</button>} /><div><table><thead><tr><th>Perigo</th><th>Área</th><th>Início / pico</th><th>Intensidade P90</th><th>Prob.</th><th>Conf.</th><th>Run</th><th>Estado</th></tr></thead><tbody>{[["Inundação","D-04 / Pátio Norte","19:42 / 21:10","0,51 m","76%","79%","HMR-882","HAZARD EXPECTED","critical"],["Rajada","Pátio Norte","20:10 / 20:40","84 km/h","64%","78%","HMR-901","MODELLING","watch"],["Raios","Porto","19:05 / 19:38","82% ingresso 10 km","82%","81%","HMR-907","MONITORING","alert"],["Calor","Pátios","13:40 / 14:20","WBGT 31,8 °C","71%","84%","HMR-861","HAZARD EXPECTED","watch"]].map(row => <tr key={row[0]}><td><strong>{row[0]}</strong></td>{row.slice(1,7).map((cell,index) => <td key={index}>{cell}</td>)}<td><Pill tone={row[8] as Tone}>{row[7]}</Pill></td></tr>)}</tbody></table></div></article>
  </div>;
}

function Catalog(props: Props) {
  const [selected, setSelected] = useState("HYDRAULIC-TUB-03");
  const model = modelRegistry.find(item => item[0] === selected) ?? modelRegistry[1];
  const engines = [["01","Chuva & acumulação","P10 · P50 · P90"],["02","Hidrologia","Q · volume · tempo ao pico"],["03","Drenagem & hidráulica","Depth · velocity · duration"],["04","Vento & rajadas","Downscaling · CFD"],["05","Descargas atmosféricas","Célula · geofence · ETA"],["06","Calor extremo","WBGT · carga térmica"],["07","Estiagem & água","Balanço · autonomia"],["08","Fogo","Ignição · propagação"],["09","Fumaça & dispersão","Pluma · concentração"],["10","Movimentos de massa","FS · evolução"],["11","Queda de árvores","Probabilidade · direção"],["12","Costa, ondas & ressaca","Nível · inundação"],["13","Eventos compostos","Interação física"]];
  return <div className="hazard-view">
    <section className="hazard-catalog-hero panel"><div><span>PHYSICAL HAZARD MODELING FACTORY</span><h2>Catálogo científico e Model Registry</h2><p>Modelos físicos versionados, métodos, domínios, limitações, performance e condições de uso.</p></div><div><strong>24</strong><span>modelos registrados</span></div><div><strong>18</strong><span>operacionais</span></div><div><strong>3</strong><span>em validação</span></div><button onClick={() => props.onToast("Novo modelo encaminhado ao fluxo DEVELOPMENT → VALIDATION")}>＋ Registrar modelo</button></section>
    <section className="hazard-engine-grid">{engines.map(([id,name,outputs]) => <button className="panel" key={id} onClick={() => props.onToast(`Motor ${id} · ${name}: ficha científica aberta`)}><span>{id}</span><div><strong>{name}</strong><small>{outputs}</small></div><b>→</b></button>)}</section>
    <section className="hazard-registry-grid">
      <article className="panel hazard-table registry-table"><PanelHead eyebrow="MODEL REGISTRY" title="Modelos disponíveis" side={<div className="registry-filter"><button className="active">Todos</button><button>Operacionais</button><button>Validação</button></div>} /><div><table><thead><tr><th>ID</th><th>Fenômeno</th><th>Versão</th><th>Resolução</th><th>Horizonte</th><th>Status</th><th>Skill</th></tr></thead><tbody>{modelRegistry.map(row => <tr className={selected === row[0] ? "selected" : ""} onClick={() => setSelected(row[0])} key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><Pill tone={row[5] === "OPERACIONAL" ? "ok" : row[5] === "VALIDATION" ? "info" : "watch"}>{row[5]}</Pill></td><td>{row[6]}/100</td></tr>)}</tbody></table></div></article>
      <aside className="panel model-detail"><PanelHead eyebrow="MODEL CARD" title={model[0]} side={<Pill tone={model[5] === "OPERACIONAL" ? "ok" : "watch"}>{model[5]}</Pill>} /><h3>{model[1]}</h3><dl><div><dt>Versão</dt><dd>{model[2]}</dd></div><div><dt>Domínio</dt><dd>Tubarão + entorno</dd></div><div><dt>Resolução</dt><dd>{model[3]}</dd></div><div><dt>Horizonte</dt><dd>{model[4]}</dd></div><div><dt>Owner</dt><dd>Model Factory</dd></div><div><dt>Última validação</dt><dd>24 JUL 2026</dd></div><div><dt>Skill</dt><dd>{model[6]}/100 · BOM</dd></div></dl><div className="model-limit"><span>LIMITAÇÕES</span><p>DEM 5 m no setor oeste · condição de bomba depende de telemetria · maré proveniente de modelo.</p></div><footer><button onClick={() => props.onToast(`Metodologia, inputs e parâmetros de ${model[0]} abertos`)}>Ver ficha</button><button onClick={() => props.onToast(`${model[0]} selecionado para comparação`)}>Comparar</button><button className="hazard-primary" onClick={() => props.onToast(`${model[0]} selecionado no wizard de execução`)}>Executar</button></footer></aside>
    </section>
  </div>;
}

function Executions(props: Props) {
  const [launched, setLaunched] = useState(false);
  const [published, setPublished] = useState(false);
  const [fast, setFast] = useState(false);
  const [pump, setPump] = useState("OFF · telemetria 18:44");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLaunched(true); setPublished(false); props.onToast(`HMR-${fast ? "FAST-884" : "884"} criado · job assíncrono enviado ao Model Orchestrator`); };
  return <div className="hazard-view">
    <section className="execution-hero panel"><div><span>MODEL EXECUTION</span><h2>Novo HazardModelRun</h2><p>Configuração rastreável de fenômeno, modelo, forecast, estado inicial, cenário e ensemble.</p></div><Pill tone={launched ? "info" : "watch"}>{launched ? "RUNNING · 63%" : "DRAFT"}</Pill><div className="execution-id"><span>FORECAST</span><strong>FR-2204</strong><small>ECMWF ENS 12Z · QA 98%</small></div></section>
    <section className="execution-grid">
      <form className="panel model-run-form" onSubmit={submit}><PanelHead eyebrow="WIZARD · 7 ETAPAS" title="Execução controlada" side={<button type="button" onClick={() => props.onToast("Template de execução salvo para reuso")}>Salvar template</button>} /><div className="run-form-grid"><label>1 · Fenômeno<select><option>Inundação</option><option>Vento local</option><option>Fogo</option><option>Encosta</option><option>Costa</option></select></label><label>2 · Modelo<select><option>HYDRAULIC-TUB-03</option><option>HYDRAULIC-TUB-LITE</option></select></label><label>Versão<select><option>4.3 · OPERATIONAL</option><option>4.2 · SUPERSEDED</option></select></label><label>3 · Forecast Run<select><option>FR-2204 · ECMWF 12Z</option><option>FR-2203 · WRF-TUB</option></select></label><label>Período<input type="text" defaultValue="07 AGO 18:00 → 08 AGO 06:00" /></label><label>Área<select><option>TUB-NORTH · D-04</option><option>Unidade inteira</option></select></label><label>4 · Umidade do solo<input type="text" defaultValue="84% · observado há 34 min" /></label><label>Estado bomba D04-03<select value={pump} onChange={event => setPump(event.target.value)}><option>OFF · telemetria 18:44</option><option>ON · override de simulação</option></select></label><label>Maré<select><option>+0,82 m · modelo costeiro</option><option>P90 +1,02 m</option></select></label><label>5 · Cenário<select><option>Baseline operacional</option><option>Bomba móvel BM-07</option><option>Obstrução 50%</option></select></label><label>6 · Ensemble<select><option>P50 + P90 + 21 members</option><option>P50 determinístico</option></select></label><label>Resolução<select><option>5 m · full model</option><option>25 m · fast model</option></select></label><label>Prioridade<select><option>Crítica</option><option>Alta</option><option>Normal</option></select></label><label className="wide">Observações<textarea defaultValue="Executar com ressalva da umidade antecedente. Preservar dado original de D04-03 e registrar qualquer override." /></label></div><div className="run-form-actions"><label><input type="checkbox" checked={fast} onChange={event => setFast(event.target.checked)} /> Fast Hazard preliminar antes do full model</label><button type="button" onClick={() => props.onToast("Domínio TUB-NORTH desenhado no mapa e validado")}>Definir área no mapa</button><button className="hazard-primary" type="submit">7 · Executar modelo</button></div></form>
      <aside className="execution-side">
        <article className="panel precheck-card"><PanelHead eyebrow="AGENTE PRE-CONDITION" title="Pré-check automático" side={<Pill tone="watch">1 RESSALVA</Pill>} />{[["Precipitação","FR-2204","ok"],["DEM","5 m · v8","ok"],["Drenagem","DN-2026.08","ok"],["Estado bombas",pump.startsWith("OFF") ? "D04-03 OFF" : "override ON","ok"],["Maré","COAST-03","ok"],["Umidade do solo","há 34 min","watch"]].map(([label,value,tone]) => <div key={label}><span className={`precheck-icon ${tone}`}>{tone === "ok" ? "✓" : "!"}</span><p><strong>{label}</strong><small>{value}</small></p><b>{tone === "ok" ? "VALID" : "STALE"}</b></div>)}<button onClick={() => props.onToast("Ressalva aceita por Eng. Hídrica · justificativa anexada")}>Executar com limitação</button></article>
        <article className="panel run-status-card"><PanelHead eyebrow="JOB ASSÍNCRONO" title={launched ? "HMR-884" : "Aguardando execução"} side={<Pill tone={published ? "ok" : launched ? "info" : "watch"}>{published ? "PUBLISHED" : launched ? "RUNNING" : "QUEUED"}</Pill>} /><div className="run-progress"><i><b style={{ width: launched ? "63%" : "6%" }} /></i><strong>{launched ? "63%" : "6%"}</strong></div>{["QUEUED","VALIDATING","RUNNING","POST-PROCESSING","QA","READY","PUBLISHED"].map((state,index) => <div className={`run-state ${index < (published ? 7 : launched ? 3 : 1) ? "done" : index === (published ? 7 : launched ? 3 : 1) ? "current" : ""}`} key={state}><span>{index < (published ? 7 : launched ? 3 : 1) ? "✓" : index + 1}</span><b>{state}</b><small>{index === 2 && launched ? "HPC-02 · ETA 38 s" : index === 4 ? "range · extent · NoData" : "—"}</small></div>)}<button disabled={!launched} onClick={() => { setPublished(true); props.onToast("QA PASS · HS-884 publicada e hazard.surface.published emitido"); }}>Publicar após QA</button></article>
      </aside>
    </section>
    <article className="panel execution-architecture"><PanelHead eyebrow="EXECUTION BACKBONE" title="ArcGIS integra; o motor científico permanece federado" /><div>{["Frontend","Model Orchestrator","Python / C++ / HPC","Result Store","ArcGIS Image Service","Event Bus"].map((item,index) => <span key={item}><i>{index + 1}</i><strong>{item}</strong><small>{["configuração","routing + jobs","física","COG + metadata","visualização","publish"][index]}</small>{index < 5 ? <b>→</b> : null}</span>)}</div></article>
  </div>;
}

function HydrologyFlooding(props: Props) {
  const [scenario, setScenario] = useState("B · Bomba 3 indisponível");
  const [obstruction, setObstruction] = useState(25);
  const [tide, setTide] = useState("+0,82 m");
  const result = useMemo(() => {
    const base = scenario.startsWith("A") ? 0.37 : scenario.startsWith("B") ? 0.51 : 0.24;
    const adjusted = Math.max(0.12, base + (obstruction - 25) * 0.0015 + (tide === "+1,02 m · P90" ? 0.06 : 0));
    return { depth: adjusted.toFixed(2).replace(".", ","), area: scenario.startsWith("A") ? "1,8" : scenario.startsWith("B") ? "2,6" : "1,1", duration: scenario.startsWith("A") ? "2h40" : scenario.startsWith("B") ? "4h10" : "1h35" };
  }, [scenario, obstruction, tide]);
  return <div className="hazard-view">
    <article className="panel hydraulic-controls"><label>Cenário<select value={scenario} onChange={event => setScenario(event.target.value)}><option>A · Estado atual</option><option>B · Bomba 3 indisponível</option><option>C · Limpeza + bomba móvel</option></select></label><label>Obstrução D-04<strong>{obstruction}%</strong><input type="range" min="0" max="75" step="25" value={obstruction} onChange={event => setObstruction(Number(event.target.value))} /></label><label>Maré<select value={tide} onChange={event => setTide(event.target.value)}><option>+0,82 m</option><option>+1,02 m · P90</option></select></label><label>Solo<select><option>84% saturado</option><option>65% baseline</option></select></label><button onClick={() => props.onToast(`HMR-SIM criado · P90 ${result.depth} m · cenário preservado para M6`)}>Simular cenário</button></article>
    <section className="hydraulic-main">
      <article className="panel hydraulic-map"><PanelHead eyebrow="MODELO ACOPLADO 1D / 2D" title="Rede de drenagem + superfície" side={<Pill tone="critical">P90 {result.depth} m</Pill>} /><HazardMap props={props} hazard="flood" label="Flood depth · P90" /><div className="flood-popup"><span>INUNDAÇÃO · 21:10</span><strong>{result.depth} m</strong><dl><div><dt>Velocidade</dt><dd>0,54 m/s</dd></div><div><dt>Chegada</dt><dd>19:42</dd></div><div><dt>Recessão</dt><dd>23:58</dd></div><div><dt>Probabilidade</dt><dd>76%</dd></div></dl></div></article>
      <aside className="hydraulic-side">
        <article className="panel basin-card"><PanelHead eyebrow="HIDROLOGIA · SUB-BACIA" title="D04" side={<Pill tone="watch">CAPACIDADE 8,4</Pill>} /><div className="basin-kpis"><div><span>Q atual</span><strong>4,2 m³/s</strong></div><div><span>Q pico P50</span><strong>7,8 m³/s</strong></div><div><span>Q pico P90</span><strong>10,4 m³/s</strong></div><div><span>Tempo ao pico</span><strong>2h15</strong></div></div><div className="hydrograph"><i className="capacity-line" /><div>{[18,22,31,48,71,92,78,55,38,24,16].map((value,index) => <span style={{ height: `${value}%` }} key={index} />)}</div><footer><span>18h</span><span>21h</span><span>00h</span></footer></div></article>
        <article className="panel sensitivity-card"><PanelHead eyebrow="SENSIBILIDADE OPERACIONAL" title="Maiores drivers" />{[["Chuva",41],["Bombeamento",26],["Maré",18],["Saturação",11],["Outros",4]].map(([label,value]) => <div key={label as string}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}%</strong></div>)}</article>
      </aside>
    </section>
    <section className="panel scenario-comparator"><PanelHead eyebrow="COMPARADOR HIDRÁULICO" title="Alternativas físicas comparáveis" side={<button onClick={() => props.onToast("Três cenários enviados ao Módulo 6 · Planejamento")}>Enviar ao Planejamento</button>} /><div className="scenario-cards">{[["A","Estado atual","3 bombas","1,8 km²","0,37 m","2h40"],["B","Bomba 3 indisponível","2 bombas","2,6 km²","0,51 m","4h10"],["C","Limpeza + bomba móvel","BM-07 ON","1,1 km²","0,24 m","1h35"]].map(row => <button className={scenario.startsWith(row[0]) ? "selected" : ""} onClick={() => setScenario(`${row[0]} · ${row[1]}`)} key={row[0]}><span>CENÁRIO {row[0]}</span><h3>{row[1]}</h3><small>{row[2]}</small><div><b>{row[3]}<small>área</small></b><b>{row[4]}<small>pico</small></b><b>{row[5]}<small>duração</small></b></div></button>)}</div></section>
  </div>;
}

function Atmosphere(props: Props) {
  const [mode, setMode] = useState("Vento");
  return <div className="hazard-view">
    <article className="panel motor-switch"><div><span>MOTORES ATMOSFÉRICOS</span><h2>Vento local, descargas e dispersão</h2></div>{["Vento","Raios","Fumaça"].map(item => <button className={mode === item ? "active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}</article>
    <section className="atmosphere-grid">
      <article className="panel atmosphere-map"><PanelHead eyebrow={mode === "Vento" ? "DOWNSCALING + CFD" : mode === "Raios" ? "LIGHTNING HAZARD" : "ATMOSPHERIC DISPERSION"} title={mode === "Vento" ? "Campo de vento local · Pátio Norte" : mode === "Raios" ? "Célula C-028 · trajetória e geofences" : "Pluma modelada · 20:00"} side={<Pill tone={mode === "Raios" ? "critical" : "watch"}>{mode === "Vento" ? "P90 84 km/h" : mode === "Raios" ? "ETA 31 min" : "3,2 km²"}</Pill>} /><HazardMap props={props} hazard={mode === "Vento" ? "wind" : mode === "Raios" ? "lightning" : "smoke"} label={mode === "Vento" ? "Rajada P90" : mode === "Raios" ? "Prob. ingresso 10 km" : "Concentração"} /></article>
      <aside className="atmosphere-side">
        {mode === "Vento" ? <><article className="panel atmosphere-inspector"><PanelHead eyebrow="WIND HAZARD" title="Pátio Norte" /><div className="big-reading"><span>RAJADA P90</span><strong>84 km/h</strong><small>ENE · pico 20:40 · confiança 78%</small></div><dl><div><dt>Vento médio</dt><dd>39 km/h</dd></div><div><dt>Rajada P50</dt><dd>68 km/h</dd></div><div><dt>Turbulência</dt><dd>18%</dd></div><div><dt>Duração &gt;60</dt><dd>1h35</dd></div></dl></article><article className="panel cfd-card"><PanelHead eyebrow="ESCALA" title="Regional → local → ativo" /><div>{["WRF-TUB","Topografia","Edificações","CFD","Shiploader"].map((item,index) => <span key={item}>{item}{index < 4 ? <b>→</b> : null}</span>)}</div><p>3D disponível para corredores de vento, turbulência e estruturas críticas.</p><button onClick={() => props.onToast("SceneView 3D aberto no domínio do shiploader")}>Abrir análise 3D</button></article></> : null}
        {mode === "Raios" ? <><article className="panel atmosphere-inspector"><PanelHead eyebrow="LIGHTNING CELL" title="C-028" /><div className="big-reading"><span>PROB. INGRESSO 10 KM</span><strong>82%</strong><small>44 raios/min · tendência ↑</small></div><dl><div><dt>Distância</dt><dd>18 km</dd></div><div><dt>Direção</dt><dd>Tubarão</dd></div><div><dt>ETA</dt><dd>31 min</dd></div><div><dt>Confiança</dt><dd>81%</dd></div></dl></article><article className="panel geofence-card"><PanelHead eyebrow="SUPORTE À DECISÃO" title="Geofences dinâmicas" />{[["30 km","ingresso"],["20 km","monitorar"],["10 km","82%"],["5 km","ETA 42 min"]].map(([range,note]) => <div key={range}><span>{range}</span><i /><strong>{note}</strong></div>)}<p>Distância é combinada com direção, velocidade, frequência, tendência e atividade exposta.</p></article></> : null}
        {mode === "Fumaça" ? <><article className="panel atmosphere-inspector"><PanelHead eyebrow="PLUME MODEL" title="Fonte F-018" /><div className="big-reading"><span>ÁREA PROVÁVEL</span><strong>3,2 km²</strong><small>SW · 20:00–23:40</small></div><dl><div><dt>Emissão</dt><dd>1,8 kg/s</dd></div><div><dt>Estabilidade</dt><dd>Classe D</dd></div><div><dt>Altura mistura</dt><dd>680 m</dd></div><div><dt>Confiança</dt><dd>73%</dd></div></dl></article><article className="panel cfd-card"><PanelHead eyebrow="BOUNDARY" title="Fonte → atmosfera → pluma" /><div>{["Emissão","Vento","Estabilidade","Topografia","Pluma"].map((item,index) => <span key={item}>{item}{index < 4 ? <b>→</b> : null}</span>)}</div><p>M3 produz concentração e pluma; o M9 identifica receptores sociais e ambientais.</p><button onClick={props.onTwin}>Enviar superfície ao Gêmeo</button></article></> : null}
      </aside>
    </section>
  </div>;
}

function HeatDroughtFire(props: Props) {
  const [mode, setMode] = useState("Fogo");
  const [mitigation, setMitigation] = useState("Baseline");
  return <div className="hazard-view">
    <article className="panel motor-switch"><div><span>MOTORES TÉRMICOS E HÍDRICOS</span><h2>Calor, estiagem, disponibilidade e fogo</h2></div>{["Calor","Seca","Fogo"].map(item => <button className={mode === item ? "active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}</article>
    {mode === "Calor" ? <section className="thermal-grid"><article className="panel thermal-map"><PanelHead eyebrow="WBGT · ZONAS TÉRMICAS" title="Pátio Norte · pico 13:40–15:30" side={<Pill tone="alert">31,8 °C</Pill>} /><HazardMap props={props} hazard="heat" label="WBGT P90" /></article><aside className="panel mitigation-card"><PanelHead eyebrow="SIMULAÇÃO" title="Mitigação térmica" /><div className="mitigation-options">{["Baseline","Sombra","Alterar jornada","Resfriamento","Pausas"].map(item => <button className={mitigation === item ? "active" : ""} onClick={() => setMitigation(item)} key={item}>{item}</button>)}</div><div className="mitigation-result"><span>WBGT P90</span><strong>{mitigation === "Baseline" ? "31,8 °C" : mitigation === "Sombra" ? "29,4 °C" : mitigation === "Resfriamento" ? "28,8 °C" : "30,1 °C"}</strong><small>{mitigation === "Baseline" ? "sem mitigação" : `cenário ${mitigation.toLowerCase()}`}</small></div><p>M3 calcula a mudança no perigo físico. Planejamento do trabalho pertence aos módulos 6 e 8.</p><button onClick={() => props.onToast(`Cenário térmico ${mitigation} enviado ao planejamento`)}>Comparar no M6</button></aside></section> : null}
    {mode === "Seca" ? <section className="drought-grid"><article className="panel water-balance"><PanelHead eyebrow="BALANÇO FÍSICO" title="Disponibilidade hídrica · R-02" side={<Pill tone="watch">MONITORING</Pill>} /><div className="water-equation">{["Precipitação","ET","Infiltração","Armazenamento","Afluência","Captação","Demanda"].map((item,index) => <span key={item}><b>{index < 5 ? "+" : "−"}</b>{item}</span>)}<strong>= DISPONIBILIDADE</strong></div><div className="drought-stats"><div><span>Volume</span><strong>68%</strong><small>baseline 81%</small></div><div><span>30 dias</span><strong>↓ 9%</strong><small>ensemble</small></div><div><span>90 dias</span><strong>↓ 18%</strong><small>P50</small></div><div><span>Autonomia</span><strong>47 dias</strong><small>demanda atual</small></div></div></article><aside className="panel drought-context"><PanelHead eyebrow="CONTEXTO · NÃO SUBSTITUI BALANÇO" title="Índices de seca" />{[["SPI-3","−1,28","Moderada"],["SPEI-3","−1,42","Moderada"],["Umidade solo","P18","Baixa"],["Restrição 90d","24%","Probabilidade"]].map(([name,value,note]) => <div key={name}><span>{name}</span><strong>{value}</strong><small>{note}</small></div>)}<button onClick={() => props.onToast("Cenário de recuperação hídrica recalculado para 90 dias")}>Simular recuperação</button></aside></section> : null}
    {mode === "Fogo" ? <section className="fire-grid"><article className="panel fire-map"><PanelHead eyebrow="IGNIÇÃO ≠ PROPAGAÇÃO" title="Fogo F-018 · frente provável" side={<Pill tone="alert">61% PROB.</Pill>} /><HazardMap props={props} hazard="fire" label="Tempo de chegada" /><div className="fire-layers"><label><input type="checkbox" checked={props.layers.viirs} onChange={() => props.onToggleLayer("viirs")} /> VIIRS Hotspots · Living Atlas</label><label><input type="checkbox" checked={props.layers.landCover} onChange={() => props.onToggleLayer("landCover")} /> Sentinel-2 Land Cover</label></div></article><aside className="panel fire-inspector"><PanelHead eyebrow="FIRE HAZARD" title="F-018" /><div className="big-reading"><span>ETA ÁREA INDUSTRIAL</span><strong>5h40</strong><small>distância 4,8 km · direção SE</small></div><dl><div><dt>Velocidade propagação</dt><dd>0,7 km/h</dd></div><div><dt>Intensidade</dt><dd>2,1 MW/m</dd></div><div><dt>Área provável</dt><dd>6,8 km²</dd></div><div><dt>Confiança</dt><dd>Moderada</dd></div></dl><div className="fire-flow">{["Hotspot","Validar","Vegetação","Vento","Propagação"].map((item,index) => <span key={item}>{item}{index < 4 ? <b>→</b> : null}</span>)}</div><button onClick={() => props.onToast("FIRE-SPREAD-02 reexecutado com vento P90 e combustível atualizado")}>Executar propagação P90</button></aside></section> : null}
  </div>;
}

function GeoCoast(props: Props) {
  const [mode, setMode] = useState("Encostas");
  const [profile, setProfile] = useState("Industrial embankment");
  return <div className="hazard-view">
    <article className="panel motor-switch"><div><span>MOTORES GEOTÉCNICOS E COSTEIROS</span><h2>Encostas, árvores, ondas e ressaca</h2></div>{["Encostas","Árvores","Costa"].map(item => <button className={mode === item ? "active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}</article>
    {mode === "Encostas" ? <section className="slope-grid"><article className="panel slope-map"><PanelHead eyebrow="PERIGO FUTURO · NÃO SUSCETIBILIDADE" title="Fator de segurança espacial" side={<Pill tone="alert">FS 1,14 · +12H</Pill>} /><HazardMap props={props} hazard="slope" label="Fator de segurança" /></article><aside className="panel slope-inspector"><PanelHead eyebrow="THRESHOLD PROFILE" title="Embankment E-07" /><label>Perfil<select value={profile} onChange={event => setProfile(event.target.value)}><option>Natural slope</option><option>Road cut</option><option>Industrial embankment</option><option>Critical structure</option></select></label><div className="fs-timeline">{[["AGORA","1,46","ok"],["+6H","1,31","watch"],["+12H","1,14","alert"],["+24H","1,09","critical"]].map(([time,value,tone]) => <div key={time}><span className={`tone-${tone}`}>{time}</span><strong>FS {value}</strong><small>{Number(value.replace(",",".")) > 1.2 ? "atenção" : "crítico"}</small></div>)}</div><p>Limites são parametrizados por especialista e tipo de estrutura; não são universalizados.</p><button onClick={() => props.onToast(`Análise 3D aberta com perfil ${profile}`)}>Abrir evolução em 3D</button></aside></section> : null}
    {mode === "Árvores" ? <section className="tree-grid"><article className="panel tree-map"><PanelHead eyebrow="TREE HAZARD" title="Inventário arbóreo + solo + vento" side={<Pill tone="alert">AR-882 · 63%</Pill>} /><HazardMap props={props} hazard="trees" label="Probabilidade de queda" /></article><aside className="panel tree-inspector"><PanelHead eyebrow="ÁRVORE SELECIONADA" title="AR-882" /><div className="big-reading"><span>PROBABILIDADE DE QUEDA</span><strong>63%</strong><small>solo saturado · rajada P90 84 km/h</small></div><dl><div><dt>Direção provável</dt><dd>SW</dd></div><div><dt>Receptor</dt><dd>Linha elétrica</dd></div><div><dt>Distância</dt><dd>5,2 m</dd></div><div><dt>Condição</dt><dd>Degradada</dd></div></dl><button onClick={() => props.onToast("Vistoria AR-882 despachada com rota, checklist e evidências obrigatórias")}>Solicitar vistoria</button></aside></section> : null}
    {mode === "Costa" ? <section className="coast-grid"><article className="panel coast-map"><PanelHead eyebrow="COASTAL MODEL" title="Condição portuária · nível combinado" side={<Pill tone="watch">1,13 m</Pill>} /><HazardMap props={props} hazard="coast" label="Nível costeiro combinado" /></article><aside className="panel coast-inspector"><PanelHead eyebrow="ONDA + MARÉ + SURGE" title="Janela costeira" /><div className="coast-readings">{[["Onda significativa","2,4 m"],["P90","3,1 m"],["Período","12 s"],["Direção","SE"],["Maré","+0,82 m"],["Surge","+0,31 m"]].map(([key,value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div><div className="coast-window">{["18","19","20","21","22","23","00","01"].map((time,index) => <span className={index > 2 && index < 7 ? "restricted" : "safe"} key={time}><b>{time}</b><i /></span>)}</div><p>A classificação operacional final depende dos limites dos ativos no M4.</p><button onClick={() => props.onToast("Evento composto chuva + maré + surge criado")}>Criar cenário composto</button></aside></section> : null}
  </div>;
}

function Compound(props: Props) {
  const [selected, setSelected] = useState("Chuva + maré + bomba OFF");
  const scenarios = [["Chuva + maré + bomba OFF","Inundação","1,42×","76%"],["Calor + seca + vento","Fogo → fumaça","1,31×","61%"],["Chuva + solo + vento","Encosta + árvore","1,18×","48%"],["Onda + vento + maré","Restrição costeira","1,26×","67%"]];
  const current = scenarios.find(item => item[0] === selected) ?? scenarios[0];
  return <div className="hazard-view">
    <section className="compound-hero panel"><div><span>COMPOUND HAZARD</span><h2>Eventos compostos não são soma de scores</h2><p>A amplificação é calculada pela interação física entre componentes, estado inicial e condições de contorno.</p></div><Pill tone="critical">AMPLIFICAÇÃO {current[2]}</Pill></section>
    <section className="compound-main">
      <article className="panel compound-graph"><PanelHead eyebrow="COMPOUND HAZARD GRAPH" title={selected} side={<button onClick={() => props.onToast("Grafo expandido com condições de contorno e evidências")}>Expandir grafo</button>} /><div className="hazard-graph">{selected.startsWith("Chuva") ? <><span className="node n1">CHUVA<strong>73 mm</strong></span><span className="node n2">MARÉ<strong>+0,82 m</strong></span><span className="node n3">BOMBA 3<strong>OFF</strong></span><i className="edge e1" /><i className="edge e2" /><i className="edge e3" /><span className="node result">INUNDAÇÃO<strong>P90 0,51 m</strong></span></> : <><span className="node n1">DRIVER A<strong>ativo</strong></span><span className="node n2">DRIVER B<strong>material</strong></span><span className="node n3">DRIVER C<strong>P90</strong></span><i className="edge e1" /><i className="edge e2" /><i className="edge e3" /><span className="node result">{current[1]}<strong>{current[2]}</strong></span></>}</div><div className="compound-metrics"><div><span>Probabilidade combinada</span><strong>{current[3]}</strong></div><div><span>Amplificação física</span><strong>{current[2]}</strong></div><div><span>Confiança</span><strong>74%</strong></div><div><span>Janela</span><strong>19:42–23:58</strong></div></div></article>
      <aside className="panel compound-scenarios"><PanelHead eyebrow="CENÁRIOS COMPOSTOS" title="Interações monitoradas" />{scenarios.map(row => <button className={selected === row[0] ? "selected" : ""} onClick={() => setSelected(row[0])} key={row[0]}><span>{row[0]}</span><strong>{row[1]}</strong><small>{row[2]} · prob. {row[3]}</small></button>)}<button className="hazard-primary" onClick={() => props.onToast(`${selected}: novo ensemble físico solicitado`)}>Executar ensemble composto</button></aside>
    </section>
    <article className="panel compound-object"><PanelHead eyebrow="OBJETO INTEROPERÁVEL" title="CompoundHazard CH-018" side={<Pill tone="alert">READY</Pill>} /><div>{[["componentHazards","rain · tide · pump_state"],["interactionType","hydraulic_boundary_amplification"],["combinedProbability","0.76"],["amplificationFactor",current[2].replace("×","")],["validFrom","2026-08-07T19:42−03:00"],["resultSurfaces","HS-882 · flood_depth"],["confidence","0.74"]].map(([key,value]) => <span key={key}><small>{key}</small><strong>{value}</strong></span>)}</div></article>
  </div>;
}

function Compare(props: Props) {
  const [left, setLeft] = useState("HYDRAULIC-TUB-03 · HMR-882");
  const [right, setRight] = useState("HYDRAULIC-TUB-LITE · HMR-883");
  return <div className="hazard-view">
    <article className="panel compare-controls"><label>MODELO / RUN A<select value={left} onChange={event => setLeft(event.target.value)}><option>HYDRAULIC-TUB-03 · HMR-882</option><option>HYDRAULIC-TUB-03 · HMR-881</option></select></label><span>VS</span><label>MODELO / RUN B<select value={right} onChange={event => setRight(event.target.value)}><option>HYDRAULIC-TUB-LITE · HMR-883</option><option>HYDRAULIC-TUB-03 · HMR-884</option></select></label><label>Variável<select><option>Flood depth P90</option><option>Arrival time</option><option>Duration</option></select></label><button onClick={() => props.onToast("Comparação sincronizada em 21:10 · diferença espacial calculada")}>Sincronizar</button></article>
    <section className="compare-maps"><article className="panel"><PanelHead eyebrow="MODELO A · FULL" title={left} side={<Pill tone="ok">79% CONF.</Pill>} /><HazardMap props={props} hazard="flood" label="P90 0,51 m" compact /></article><article className="panel"><PanelHead eyebrow="MODELO B · FAST" title={right} side={<Pill tone="watch">68% CONF.</Pill>} /><HazardMap props={props} hazard="flood-lite" label="P90 0,46 m" compact /></article><i className="compare-divider">◀▶</i></section>
    <section className="compare-bottom"><article className="panel hazard-table"><PanelHead eyebrow="SIDE-BY-SIDE" title="Métricas e custo computacional" /><div><table><thead><tr><th>Métrica</th><th>Modelo A</th><th>Modelo B</th><th>Δ</th></tr></thead><tbody>{[["Área","2,6 km²","2,3 km²","−0,3 km²"],["Pico","0,51 m","0,46 m","−0,05 m"],["Chegada","19:42","19:49","+7 min"],["Duração","4h10","3h45","−25 min"],["Resolução","5 m","25 m","5× menor"],["Tempo","2m31","18 s","−2m13"],["Confiança","79%","68%","−11 pp"]].map(row => <tr key={row[0]}>{row.map((cell,index) => <td key={index}>{index === 0 ? <strong>{cell}</strong> : cell}</td>)}</tr>)}</tbody></table></div></article><article className="panel uncertainty-card"><PanelHead eyebrow="INCERTEZAS SEPARADAS" title="De onde vem o spread?" />{[["Meteorológica",31],["Estado inicial",28],["Paramétrica",18],["Estrutural",15],["Dados",8]].map(([label,value]) => <div key={label as string}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}%</strong></div>)}<div className="model-limit"><span>LIMITAÇÕES</span><p>Fast model é preliminar, usa grade de 25 m e simplifica microdrenagem.</p></div></article></section>
  </div>;
}

function ValidationQA(props: Props) {
  const [failed, setFailed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  return <div className="hazard-view">
    <section className="validation-summary">{[["Runs avaliados","184","90 dias","info"],["Acerto de extensão","86%","flood models","ok"],["MAE profundidade","0,07 m","12 pontos","ok"],["Timing MAE","11 min","arrival time","watch"],["QA bloqueados","3","sem publicação","alert"]].map(([label,value,note,tone]) => <article className="panel" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small><Pill tone={tone as Tone}>{tone === "ok" ? "BOM" : "LIVE"}</Pill></article>)}</section>
    <section className="validation-main">
      <article className="panel validation-map"><PanelHead eyebrow="MODELADO × OBSERVADO" title="Validação espacial · evento EV-0187" side={<div><button className="active">Overlap</button><button>Erro</button><button>Observado</button></div>} /><HazardMap props={props} hazard="validation" label="Erro modelado − observado" /><div className="validation-overlap"><span>MODELADO</span><strong>86% overlap</strong><span>OBSERVADO</span></div></article>
      <aside className="panel validation-inspector"><PanelHead eyebrow="PONTO D-04" title="Profundidade máxima" side={<Pill tone="ok">GOOD</Pill>} /><div className="validation-values"><div><span>Previsto</span><strong>0,36 m</strong></div><b>−0,05 m</b><div><span>Observado</span><strong>0,41 m</strong></div></div><dl><div><dt>Extensão · CSI</dt><dd>0,86</dd></div><div><dt>Falso positivo</dt><dd>8%</dd></div><div><dt>Falso negativo</dt><dd>6%</dd></div><div><dt>Timing</dt><dd>−9 min</dd></div><div><dt>Fonte observada</dt><dd>NIV-D04 + câmera</dd></div></dl><button onClick={() => setSubmitted(true)}>Registrar validação</button></aside>
    </section>
    <section className="qa-grid"><article className={`panel qa-failure ${failed ? "active" : ""}`}><PanelHead eyebrow="QA AGENT" title={failed ? "RUN HR-882 · QA FAILED" : "Teste de falha controlado"} side={<Pill tone={failed ? "critical" : "info"}>{failed ? "BLOCKED" : "READY"}</Pill>} /><p>{failed ? "Nível negativo detectado em 12 células. Resultado não publicado; último resultado válido preservado." : "Simule um resultado fisicamente impossível para validar bloqueio, fallback e comunicação à Torre."}</p><div><span>Range físico</span><strong>{failed ? "FAILED" : "PASS"}</strong><span>Extent</span><strong>PASS</strong><span>NoData</span><strong>PASS</strong><span>Tempo válido</span><strong>PASS</strong></div><footer><button onClick={() => setFailed(true)}>Simular QA failure</button><button disabled={!failed} onClick={() => props.onToast("Fallback HYDRAULIC-TUB-LITE iniciado; Torre informada")}>Executar fallback</button></footer></article><article className="panel inconsistency-card"><PanelHead eyebrow="INCONSISTENCY AGENT" title="Evidências divergentes" side={<Pill tone="watch">REVISÃO</Pill>} /><div className="evidence-row"><span>MODELO</span><strong>inundação</strong><b>↔</b><span>SENSOR</span><strong>normal</strong><b>↔</b><span>CÂMERA</span><strong>água</strong></div><p>Timestamps e qualidade foram verificados. O sensor pode estar bloqueado; câmera e inspeção são evidências concordantes.</p><button onClick={() => props.onToast("Vistoria VS-882 criada para D-04 com prioridade alta")}>Solicitar vistoria</button></article></section>
    {submitted ? <form className="panel validation-form" onSubmit={event => { event.preventDefault(); setSubmitted(false); props.onToast("Validação VAL-220 registrada; registry atualizado sem recalibração automática"); }}><PanelHead eyebrow="FORMULÁRIO CONTROLADO" title="Registrar ModelValidation" side={<button type="button" onClick={() => setSubmitted(false)}>×</button>} /><div><label>Run<input defaultValue="HMR-882" /></label><label>Período<input defaultValue="07 AGO 19:42 → 23:58" /></label><label>Métrica<select><option>Profundidade + extensão + timing</option></select></label><label>Performance<select><option>GOOD</option><option>ACCEPTABLE</option><option>POOR</option></select></label><label>Dados observados<input defaultValue="NIV-D04 · CAM-07 · vistoria" /></label><label>Aprovado por<input defaultValue="Eng. Hídrica · Marina Silva" /></label><label className="wide">Comentários<textarea defaultValue="Boa aderência espacial; erro conservador de −0,05 m. Avaliar sensor NIV-D04 antes de sugerir calibração." /></label></div><footer><span>Recalibração exige revisão e aprovação de especialista.</span><button type="submit">Salvar validação</button></footer></form> : null}
  </div>;
}

function Signals(props: Props) {
  const [published, setPublished] = useState(false);
  const [targets, setTargets] = useState({ tower: true, twin: true, planning: true, emergency: true });
  const toggle = (key: keyof typeof targets) => setTargets(value => ({ ...value, [key]: !value[key] }));
  return <div className="hazard-view">
    <section className="signal-hero panel"><div><span>HAZARD SIGNAL</span><h2>HSIG-1032 · mudança física relevante</h2><p>Inundação · D-04 / Pátio Norte · derivada de HMR-882 e HS-882.</p></div><Pill tone={published ? "ok" : "alert"}>{published ? "PUBLISHED" : "READY"}</Pill><div className="signal-delta"><span>NOVA P90</span><strong>0,51 m</strong><small>anterior 0,34 m · Δ +0,17 m</small></div></section>
    <section className="signals-grid">
      <article className="panel signal-object"><PanelHead eyebrow="CONTRATO INTEROPERÁVEL" title="HazardSignal" side={<button onClick={() => props.onToast("JSON do objeto copiado com schema v3.0")}>Copiar JSON</button>} /><div>{[["id","HSIG-1032"],["hazardType","flood"],["modelRunId","HMR-882"],["surfaceId","HS-882"],["areaId","TUB-NORTH"],["validFrom","2026-08-07T19:42−03:00"],["peakTime","2026-08-07T21:10−03:00"],["depthP50","0.34 m"],["depthP90","0.51 m"],["probability","0.76"],["confidence","0.79"],["materiality","HIGH"]].map(([key,value]) => <span key={key}><small>{key}</small><strong>{value}</strong></span>)}</div></article>
      <aside className="panel publication-form"><PanelHead eyebrow="PUBLISHER AGENT" title="Publicação controlada" side={<Pill tone="ok">QA PASS</Pill>} /><div className="publication-checks">{[["Run complete",true],["QA passed",true],["Version valid",true],["Metadata complete",true]].map(([label,checked]) => <span key={label as string}><i>{checked ? "✓" : ""}</i>{label}</span>)}</div><h3>Publicar para</h3><label><input type="checkbox" checked={targets.tower} onChange={() => toggle("tower")} /> Torre de Controle <small>HazardSignal</small></label><label><input type="checkbox" checked={targets.twin} onChange={() => toggle("twin")} /> Gêmeo Operacional <small>HazardSurface + Evolution</small></label><label><input type="checkbox" checked={targets.planning} onChange={() => toggle("planning")} /> Planejamento <small>Cenários A / B / C</small></label><label><input type="checkbox" checked={targets.emergency} onChange={() => toggle("emergency")} /> Emergência <small>arrival · severity · duration</small></label><button className="hazard-primary" onClick={() => { setPublished(true); props.onTower(); }}>Publicar e emitir eventos</button></aside>
    </section>
    <article className="panel lineage-chain"><PanelHead eyebrow="LINHAGEM COMPLETA" title="Forecast → perigo → exposição → decisão" side={<Pill tone="ok">AUDITÁVEL</Pill>} /><div>{[["ECMWF 12Z","FR-2204"],["HYDRO-TUB 5.2","HMR-881"],["HYDRAULIC 4.3","HMR-882"],["Flood depth","HS-882"],["HazardSignal","HSIG-1032"],["Módulo 4","AssetImpact"]].map(([title,id],index) => <span key={id}><i>{index + 1}</i><strong>{title}</strong><small>{id}</small>{index < 5 ? <b>→</b> : null}</span>)}</div><footer><button onClick={props.onTower}>Ver sinal na Torre</button><button className="hazard-primary" onClick={props.onTwin}>Ver ativos expostos no Gêmeo</button></footer></article>
  </div>;
}

function Agents(props: Props) {
  return <div className="hazard-view">
    <article className="panel agentic-hero"><div><span>AGENTIC SCIENTIFIC OPERATIONS</span><h2>8 agentes para orquestração, QA e publicação</h2><p>Automatizam ciência e operação técnica com limites explícitos, auditoria e human-in-the-loop.</p></div><div>{["EVENTO","INPUTS","FÍSICA","QA","PUBLICAÇÃO","HUMANO"].map((item,index) => <span key={item}><i>{index + 1}</i>{item}{index < 5 ? <b>→</b> : null}</span>)}</div></article>
    <section className="hazard-agent-grid">{agents.map(([name,role,state,guardrail],index) => <article className="panel hazard-agent-card" key={name}><header><span>AI</span><div><small>AGENTE {String(index + 1).padStart(2,"0")}</small><h3>{name}</h3></div><Pill tone={index === 1 || index === 3 ? "watch" : index === 7 ? "ok" : "info"}>{index === 1 ? "VALIDANDO" : index === 3 ? "REVISÃO" : index === 7 ? "PUBLICANDO" : "ATIVO"}</Pill></header><p>{role}</p><dl><div><dt>Agora</dt><dd>{state}</dd></div><div><dt>Guardrail</dt><dd>{guardrail}</dd></div></dl><footer><button onClick={() => props.onToast(`${name}: fatores, fontes, evidências e ações abertas`)}>Evidências</button><button onClick={() => props.onToast(`${name}: execução pausada para revisão técnica`)}>Pausar</button></footer></article>)}</section>
    <article className="panel live-agent-feed"><PanelHead eyebrow="STREAM OPERACIONAL" title="Feed agentic · HMR-882" side={<Pill tone="ok">LIVE</Pill>} /><div>{[["18:44:02","EVENT BUS","ClimateSignal CS-204 recebido"],["18:44:04","ORCHESTRATOR","HYDRO-TUB-02 acionado"],["18:44:07","PRE-CHECK","Inputs aprovados com 1 ressalva"],["18:44:09","HYDROLOGY","Execução iniciada"],["18:44:37","HYDROLOGY","HMR-881 concluído"],["18:44:41","HYDRAULIC","HMR-882 iniciado"],["18:45:21","QA","Resultados consistentes"],["18:45:24","PUBLISHER","HazardSurface HS-882 publicada"],["18:45:25","EVENT BUS","hazard.surface.published"]].map(([time,agent,text],index) => <span className={index === 8 ? "current" : "done"} key={time}><time>{time}</time><i>{index < 8 ? "✓" : "●"}</i><b>{agent}</b><small>{text}</small></span>)}</div></article>
  </div>;
}

function Integrations(props: Props) {
  const layerGroups = [["RASTER","hazard_flood_depth · velocity · heat · wind · fire · coastal","ImageryLayer / ImageryTileLayer"],["FEATURE","hazard_zones · storm_cells · lightning · slopes · fire_fronts","FeatureLayer"],["STREAMING","water_level · fire_observations · mobile_weather · field_reports","StreamLayer / WebSocket"]];
  return <div className="hazard-view">
    <article className="panel integration-hazard-hero"><div><span>GEOSPATIAL INTEGRATION BACKBONE</span><h2>ArcGIS publica e operacionaliza a física</h2><p>Modelos podem executar em Python, C++, Fortran, containers, HPC ou Kubernetes; ArcGIS integra espaço, tempo, consulta, visualização e entrega.</p></div><div className="arcgis-mark">GIS<strong>ArcGIS Maps SDK 5.1</strong><small>component-first · 2D default · 3D when useful</small></div></article>
    <section className="layer-contracts">{layerGroups.map(([type,items,service]) => <article className="panel" key={type}><span>{type}</span><h3>{service}</h3><p>{items}</p><button onClick={() => props.onToast(`${type}: contrato de serviço, schema e cache abertos`)}>Ver contrato</button></article>)}</section>
    <section className="integration-hazard-grid">
      <article className="panel service-choice"><PanelHead eyebrow="RASTER DELIVERY" title="ImageryLayer × ImageryTileLayer" /><div><span>ImageryLayer</span><strong>Processamento dinâmico</strong><small>raster functions · queries · mosaicking · image service</small><Pill tone="info">DYNAMIC</Pill></div><div><span>ImageryTileLayer</span><strong>Performance e animação</strong><small>COG · multidimensional · pré-processado · tiled imagery</small><Pill tone="ok">FAST</Pill></div><p>Raster pesado não é recalculado no browser. Outputs, tiles, consultas, estatísticas e time slices são cacheados.</p></article>
      <article className="panel execution-connectors"><PanelHead eyebrow="MODEL CONNECTORS" title="Execução síncrona e assíncrona" />{[["ArcGIS GP / Web Tool","execute() · submitJob()","ONLINE"],["Model API","REST · container","ONLINE"],["HPC / Cloud Job","queue · callback","ONLINE"],["Raster Store","COG · Zarr · object store","ONLINE"],["Result Publisher","Image / Feature Service","ONLINE"]].map(([name,detail,status]) => <div key={name}><span>SYS</span><p><strong>{name}</strong><small>{detail}</small></p><Pill tone="ok">{status}</Pill></div>)}</article>
    </section>
    <section className="integration-hazard-grid systems"><article className="panel execution-connectors"><PanelHead eyebrow="FONTES EXTERNAS" title="Dados geoespaciais e científicos" />{[["ECMWF / Copernicus","Forecast fields"],["Living Atlas · VIIRS","Hotspots públicos"],["Sentinel-2 Land Cover","Combustível / cobertura"],["Maré, ondas e batimetria","Coastal boundary"],["Terrain / LiDAR","DEM e superfície"]].map(([name,detail]) => <div key={name}><span>EXT</span><p><strong>{name}</strong><small>{detail}</small></p><Pill tone="ok">ONLINE</Pill></div>)}</article><article className="panel execution-connectors"><PanelHead eyebrow="INTERFACES INTERNAS" title="Estado, decisão e distribuição" />{[["M2 · Climate","FR-2204 · CS-204"],["M4 · Twin","bombas · ativos · exposure"],["SCADA / Historian","nível · bombas · reservatórios"],["EAM / CMMS","estado e manutenção"],["M6 / M8","cenários · preparação"]].map(([name,detail],index) => <div key={name}><span>SYS</span><p><strong>{name}</strong><small>{detail}</small></p><Pill tone={index === 2 ? "watch" : "ok"}>{index === 2 ? "STREAM" : "INTEGRADO"}</Pill></div>)}</article></section>
    <article className="panel event-bus"><PanelHead eyebrow="EVENT BUS" title="Contratos entre módulos" side={<button onClick={() => props.onToast("Payload hazard.surface.published validado contra schema v3")}>Inspecionar payload</button>} /><div>{["hazard.model.requested","hazard.model.started","hazard.model.completed","hazard.qa.failed","hazard.surface.published","hazard.signal.created","hazard.compound.detected","hazard.validation.completed"].map((event,index) => <span key={event}><i>{String(index + 1).padStart(2,"0")}</i><strong>{event}</strong><small>{index < 4 ? "model-orchestrator" : "distribution-bus"}</small></span>)}</div></article>
  </div>;
}

function ReportsSLO(props: Props) {
  const reports = ["Model Run Report","Hazard Situation Report","Flood Assessment","Wind Assessment","Heat Assessment","Drought Assessment","Fire Assessment","Slope Assessment","Coastal Assessment","Compound Event Assessment","Model Performance Report"];
  return <div className="hazard-view">
    <section className="reports-hazard-hero panel"><div><span>REPORT PACK · GOVERNANÇA CIENTÍFICA</span><h2>Relatórios, performance e continuidade</h2><p>Todo resultado carrega forecast, modelo, versão, inputs, estado inicial, parâmetros, executor, QA, confidence, timestamp e limitações.</p></div><button onClick={() => props.onToast("Hazard Situation Report HSR-1032 gerado e anexado à evidência")}>Gerar report pack</button></section>
    <section className="reports-catalog">{reports.map((name,index) => <article className="panel" key={name}><span>{index % 3 === 0 ? "LIVE" : "PDF"}</span><h3>{name}</h3><p>{index === 0 ? "12 seções · linhagem completa" : index === 10 ? "Skill, SLO, falhas e validação" : "Mapas, métricas, incerteza e limitações"}</p><button onClick={() => props.onToast(`${name} aberto na versão mais recente`)}>Visualizar →</button></article>)}</section>
    <section className="model-performance-grid"><article className="panel slo-card"><PanelHead eyebrow="SLO OPERACIONAL" title="HYDRAULIC-TUB-03" side={<Pill tone="ok">99,2% AVAILABLE</Pill>} /><div className="slo-kpis"><div><span>Tempo P50</span><strong>38 s</strong></div><div><span>Tempo P95</span><strong>72 s</strong></div><div><span>Falhas 30d</span><strong>0,8%</strong></div><div><span>Skill</span><strong>78/100</strong></div></div><div className="slo-chart">{[62,71,68,82,77,91,86,94,88,96,92,98].map((value,index) => <i style={{ height: `${value}%` }} key={index} />)}</div></article><article className="panel fallback-card"><PanelHead eyebrow="CONTINUIDADE CRÍTICA" title="Full model + Fast Hazard" /><div className="fallback-model"><span>PRIMARY</span><strong>HYDRAULIC-TUB-03</strong><small>5 m · 2m31 · confidence 81%</small></div><b>↓ fallback / preliminary ↓</b><div className="fallback-model fast"><span>FAST</span><strong>HYDRAULIC-TUB-LITE</strong><small>25 m · 18 s · confidence 68%</small></div><p>Urgência alta → publica preliminar identificado → executa full model → atualiza e supera resultado.</p><button onClick={() => props.onToast("Roteamento agentic: Fast Hazard executado; full model permanece em fila prioritária")}>Testar modo emergência</button></article></section>
    <article className="panel audit-lineage"><PanelHead eyebrow="AUDITABILIDADE" title="Reconstrução de qualquer decisão futura" side={<Pill tone="ok">100% TRACEABLE</Pill>} /><div>{["ForecastRun","HazardModelRun","HazardSurface","AssetImpact","Constraint","Decision"].map((item,index) => <span key={item}><i>{index + 1}</i><strong>{item}</strong><small>{["FR-2204","HMR-882","HS-882","M4","M5 / M6","DEC-284"][index]}</small>{index < 5 ? <b>→</b> : null}</span>)}</div><footer><button onClick={() => props.onToast("Pacote de auditoria exportado com hashes, fontes, modelos e aprovações")}>Exportar evidência</button><button onClick={() => props.onToast("Limitações abertas: DEM, telemetria e condição costeira")}>Ver limitações</button></footer></article>
  </div>;
}

export function HazardsModule(props: Props) {
  return useMemo(() => {
    if (props.subview === "Catálogo de Modelos") return <Catalog {...props} />;
    if (props.subview === "Execuções") return <Executions {...props} />;
    if (props.subview === "Hidrologia & Inundação") return <HydrologyFlooding {...props} />;
    if (props.subview === "Vento, Raios & Fumaça") return <Atmosphere {...props} />;
    if (props.subview === "Calor, Seca & Fogo") return <HeatDroughtFire {...props} />;
    if (props.subview === "Encostas, Árvores & Costa") return <GeoCoast {...props} />;
    if (props.subview === "Eventos Compostos") return <Compound {...props} />;
    if (props.subview === "Comparar") return <Compare {...props} />;
    if (props.subview === "Validação & QA") return <ValidationQA {...props} />;
    if (props.subview === "Hazard Signals") return <Signals {...props} />;
    if (props.subview === "Agentes") return <Agents {...props} />;
    if (props.subview === "Integrações ArcGIS") return <Integrations {...props} />;
    if (props.subview === "Relatórios & SLO") return <ReportsSLO {...props} />;
    return <Overview {...props} />;
  }, [props]);
}
