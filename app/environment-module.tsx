"use client";

/* eslint-disable react/prop-types, jsx-a11y/label-has-associated-control -- TypeScript props and wrapped controls are used throughout this operational mockup. */

import { useState, type FormEvent, type ReactNode } from "react";

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
  onToggleLayer: (key: string) => void;
  onAgents: () => void;
  onToast: (message: string) => void;
  onTower: () => void;
  onHazards: () => void;
  onTwin: () => void;
  onPlanning: () => void;
  onRisk: () => void;
  onEmergency: () => void;
};

export const environmentTabs = [
  "Situação Territorial", "Mapa Integrado", "Comunidades", "População", "Receptores", "Vulnerabilidade",
  "Qualidade do Ar", "Água", "Ruído", "Fogo e Fumaça", "Ecossistemas", "Costa", "Infraestrutura",
  "Serviços", "Mobilidade", "Ocorrências", "Stakeholders", "Engajamento", "Comunicação", "Campo",
  "Mitigação", "Recuperação", "Histórico", "Agentes & Integrações", "Relatórios",
];

export const environmentScenarioStages: Stage[] = [
  ["Incidente", "T+00", "INC-024 ativo · contexto territorial", "critical"],
  ["Flood surface", "T+02", "HMR-882 expandindo a oeste", "alert"],
  ["Receptores", "T+03", "2 áreas · 12 receptores", "watch"],
  ["Exposição", "T+04", "4.820 pessoas · ESTIMATE", "alert"],
  ["Infraestrutura", "T+05", "V-EXT-04 AT RISK", "critical"],
  ["Ocorrência", "T+08", "acesso alagado · C-07", "alert"],
  ["Triagem", "T+10", "8 relatos → OCC-GROUP-018", "watch"],
  ["Vistoria", "T+12", "FIELD-204 despachada", "info"],
  ["Confirmação", "T+20", "0,28 m sobre a via", "critical"],
  ["TerritorialSignal", "T+21", "TS-081 · HIGH · conf. 78%", "critical"],
  ["Replanejamento", "T+24", "M6 recalculou rota +18 min", "watch"],
  ["Recuo", "T+40", "nível em queda · mitigação ativa", "info"],
  ["Restrita", "T+60", "via liberada parcialmente", "watch"],
  ["Aberta", "T+100", "serviço normal verificado", "ok"],
  ["Recuperação", "T+120", "baseline + evidência · REC-014", "ok"],
].map(([label, time, note, tone]) => ({ label, time, note, tone: tone as Tone }));

export const environmentBaseFeed = [
  { agent: "TERRITORIAL ORCHESTRATOR", text: "INC-024 localizado; HMR-882 intersectado com territórios e receptores.", type: "alert" as Tone },
  { agent: "RECEPTOR AGENT", text: "12 receptores na projeção; Escola E-014 e acesso V-EXT-04 priorizados.", type: "watch" as Tone },
  { agent: "SOCIAL EXPOSURE", text: "4.820 pessoas estimadas · Censo 2022 · confiança moderada.", type: "alert" as Tone },
  { agent: "COMMUNITY TRIAGE", text: "8 relatos correlacionados em OCC-GROUP-018; originais preservados.", type: "info" as Tone },
  { agent: "FIELD VERIFICATION", text: "FIELD-204 em rota para C-07 · ETA 11 min.", type: "ok" as Tone },
];

export const environmentScenarioFeed: Record<number, { agent: string; text: string; type: Tone }> = {
  1: { agent: "HAZARD CONNECTOR", text: "19:34:05 · HMR-882: superfície de inundação expandindo a oeste.", type: "alert" },
  2: { agent: "RECEPTOR AGENT", text: "19:34:07 · 2 áreas e 12 receptores intersectados.", type: "watch" },
  3: { agent: "SOCIAL EXPOSURE", text: "19:34:09 · 4.820 pessoas potencialmente expostas.", type: "alert" },
  4: { agent: "INFRASTRUCTURE", text: "19:34:12 · V-EXT-04 AT RISK; 3 receptores críticos dependentes.", type: "critical" },
  5: { agent: "COMMUNITY TRIAGE", text: "19:42:00 · primeiro relato de acesso alagado recebido.", type: "alert" },
  6: { agent: "COMMUNITY TRIAGE", text: "19:44:00 · 8 relatos agrupados em OCC-GROUP-018.", type: "watch" },
  7: { agent: "FIELD VERIFICATION", text: "19:46:00 · FIELD-204 criada com checklist e rota segura.", type: "info" },
  8: { agent: "FIELD QA", text: "19:54:00 · 0,28 m sobre a via confirmado por foto e medição.", type: "critical" },
  9: { agent: "TERRITORIAL ORCHESTRATOR", text: "19:55:00 · TS-081 publicado; M1, M8 e M7 notificados.", type: "critical" },
  10: { agent: "PLANNING CONNECTOR", text: "19:58:00 · M6 recalculou rota dos recursos: +18 min.", type: "watch" },
  11: { agent: "MITIGATION", text: "20:14:00 · desvio e barreira ativos; água começando a recuar.", type: "info" },
  13: { agent: "INFRASTRUCTURE", text: "21:14:00 · V-EXT-04 OPEN; serviço normal verificado.", type: "ok" },
  14: { agent: "RECOVERY", text: "21:34:00 · impacto fechado com vistoria, baseline e evidência.", type: "ok" },
};

const agents = [
  ["TERRITORIAL ORCHESTRATOR", "Localiza eventos, coordena análises e publica sinais materiais.", "3 impactos"],
  ["RECEPTOR AGENT", "Intersecta HazardSurface com comunidades, ambiente e infraestrutura.", "18 analisados"],
  ["SOCIAL EXPOSURE", "Estima população, duração e receptores críticos sem score individual.", "4.820 est."],
  ["ENVIRONMENTAL", "Valida ar, água, ruído e campo antes de afirmar impacto.", "1 anomalia"],
  ["COMMUNITY TRIAGE", "Classifica, geocodifica, agrupa duplicidades e roteia relatos.", "17 → 1"],
  ["CAUSALITY", "Reconstrói source → pathway → receptor com níveis de evidência.", "LIKELY"],
  ["INFRASTRUCTURE", "Monitora energia, água, vias, telecom e dependências.", "1 via"],
  ["INSTITUTIONAL", "Identifica ator, jurisdição, contato e protocolo; prepara draft.", "2 atores"],
  ["COMMUNICATION", "Adapta drafts técnico, comunitário e institucional por geofence.", "3 drafts"],
  ["FIELD VERIFICATION", "Seleciona checklist, equipe, prioridade, rota e evidência.", "4 abertas"],
  ["MITIGATION", "Compara efeito esperado e observado das medidas territoriais.", "18% real"],
  ["RECOVERY", "Verifica retorno ao baseline sazonal e condição-alvo.", "72%"],
  ["HOTSPOT", "Detecta recorrência, pressões cumulativas e baixa redundância.", "H-07"],
  ["PRIVACY GUARDIAN", "Segrega contatos, reduz precisão e governa publicação pública.", "PASS"],
  ["DATA QUALITY", "Avalia fonte, freshness, cobertura, geocodificação e consistência.", "94%"],
];

const receptors = [
  ["E-014", "Escola", "C-07", "820 pessoas", "Fumaça · ETA 42 min", "ALTA"],
  ["US-03", "Unidade de saúde", "Setor Oeste", "210 pessoas", "Acesso +18 min", "CRÍTICA"],
  ["L-03", "Lagoa", "Sub-bacia 04", "2 downstream", "Turbidez ↑", "ALTA"],
  ["V-EXT-04", "Via estratégica", "C-07", "12.400 pessoas", "0,28 m · bloqueio", "CRÍTICA"],
  ["SE-EXT-02", "Subestação", "Setor Oeste", "3 serviços", "Capacidade degradada", "ALTA"],
];

const communities = [
  ["C-07", "2.480", "Inundação viária", "71", "4", "ACESSO"],
  ["C-03", "3.120", "Fumaça / poeira", "64", "12", "AR"],
  ["B-12", "1.860", "Energia", "58", "2", "SERVIÇO"],
  ["C-11", "4.340", "Calor + mobilidade", "61", "1", "MOBILIDADE"],
];

function Pill({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`ter-pill tone-${tone}`}><i />{children}</span>;
}

function Head({ eyebrow, title, side }: { eyebrow: string; title: string; side?: ReactNode }) {
  return <div className="ter-head"><div><span>{eyebrow}</span><h2>{title}</h2></div>{side}</div>;
}

function LayerList({ props }: { props: Props }) {
  const list = [
    ["risk", "HMR-882 · inundação P90", "M3 · MODEL"],
    ["territory", "Comunidades e áreas", "VALE · SIMULATED"],
    ["ibge", "Malha municipal · IBGE", "IBGE · OFFICIAL"],
    ["geobases", "Escolas · GeoBases ES", "GEOBASES · PUBLIC"],
    ["receptors", "Receptores sensíveis", "VALE · OFFICIAL"],
    ["viirs", "VIIRS Thermal Hotspots", "LIVING ATLAS"],
    ["landCover", "Sentinel-2 Land Cover 10 m", "LIVING ATLAS"],
  ];
  return <div className="ter-layers"><div><strong>CAMADAS TERRITORIAIS</strong><small>{props.mapStatus}</small></div>{list.map(([key, label, meta]) => <label key={key}><input type="checkbox" checked={Boolean(props.layers[key])} onChange={() => props.onToggleLayer(key)} /><i className={`layer-${key}`} /><span><b>{label}</b><small>{meta}</small></span></label>)}</div>;
}

function TerritorialMap({ props, expanded = false }: { props: Props; expanded?: boolean }) {
  return <article className={`panel ter-map ${expanded ? "expanded" : ""}`}><Head eyebrow="MAP FIRST · ARCGIS MAPS SDK 5.1" title="Território · Tubarão e entorno" side={<Pill tone={props.stage.tone}>{props.stage.label}</Pill>} /><div className="ter-map-wrap">{props.renderMap()}<LayerList props={props} /><div className="ter-map-legend"><span><i className="critical" />Impacto alto</span><span><i className="receptor" />Receptor</span><span><i className="occurrence" />Ocorrência</span></div><button className="ter-map-focus" onClick={() => props.onToast("Foco em C-07 · 4.820 pessoas · 3 receptores críticos")}>C-07 · TS-081</button></div><div className="ter-time"><span>T0</span><input aria-label="Time slider territorial" type="range" min="0" max="100" value={Math.round((props.scenarioStep / 14) * 100)} readOnly /><span>T+120</span><strong>{props.horizon} · Event footprint 3,8 km²</strong></div></article>;
}

function Situation(props: Props) {
  const impact = props.scenarioStep >= 9;
  const kpis: Array<[string, string, string, Tone]> = [
    ["Pessoas potencialmente expostas", props.scenarioStep < 3 ? "1.200" : "4.820", "Próximas 6h · ESTIMATE", "alert"],
    ["Receptores sensíveis", props.scenarioStep < 2 ? "3" : "14", "3 prioritários", "watch"],
    ["Ocorrências abertas", props.scenarioStep < 5 ? "4" : "27", "5 críticas · 17 agrupadas", "critical"],
    ["Qualidade ambiental", "3", "anomalias · 1 confirmada", "watch"],
    ["Serviços externos afetados", props.scenarioStep < 4 ? "0" : "2", "acesso + energia", "alert"],
    ["Comunicação territorial", "86%", "alcance confirmado", "ok"],
  ];
  return <div className="ter-view">
    <section className="ter-command"><div><span>TERRITORIAL DIGITAL TWIN</span><h2>{impact ? "TS-081 · IMPACTO TERRITORIAL MATERIAL" : "O evento não termina no limite da unidade"}</h2><p>INC-024 → HMR-882 → C-07 → OCC-GROUP-018 → FIELD-204 → DEC-088 → MIT-032 → REC-014</p></div><div className="ter-concept">{["SOURCE", "PATHWAY", "RECEPTOR", "EXPOSURE", "IMPACT", "ACTION"].map((item, index) => <span className={index <= Math.min(5, Math.floor(props.scenarioStep / 2)) ? "active" : ""} key={item}><i>{index + 1}</i>{item}</span>)}</div><button onClick={() => props.onToast("Explicação aberta: acesso afetado, 2 receptores sensíveis e 8 relatos confirmados")}>Por que prioridade?</button></section>
    <section className="ter-kpis">{kpis.map(([label, value, note, tone]) => <article className={`panel tone-${tone}`} key={label}><header><span>{label}</span><Pill tone={tone}>{note}</Pill></header><strong>{value}</strong><div>{[34, 48, 39, 56, 61, 70, 66, 82].map((v, i) => <i key={i} style={{ height: `${v}%` }} />)}</div></article>)}</section>
    <section className="ter-situation-grid"><TerritorialMap props={props} /><aside className="ter-side-stack"><article className="panel ter-impact"><Head eyebrow="IMPACTOS ATIVOS" title="Externo à unidade" />{[
      ["TS-081", "Acesso C-07", "4.820 pessoas · 3 receptores", "critical"],
      ["EI-044", "Qualidade do ar", "modelado + 2 sensores", "watch"],
      ["SD-019", "Energia Setor Oeste", "3.800 pessoas · degradada", "alert"],
    ].map(([id, title, meta, tone]) => <button key={id} onClick={() => props.onToast(`${id}: linhagem e evidências abertas`)}><span>{id}</span><div><b>{title}</b><small>{meta}</small></div><Pill tone={tone as Tone}>{tone === "critical" ? "HIGH" : "WATCH"}</Pill></button>)}</article><article className="panel ter-occurrence-live"><Head eyebrow="OCORRÊNCIAS" title="Sinais do território" side={<strong>27 abertas</strong>} />{[
      ["19:48", "Alagamento", "C-07", "8 relatos · CONFIRMED"],
      ["19:51", "Poeira", "C-03", "12 relatos · ANALYSING"],
      ["19:54", "Energia", "B-12", "2 relatos · VERIFIED"],
    ].map((row) => <div key={row[0] + row[1]}><time>{row[0]}</time><i /><span><b>{row[1]} · {row[2]}</b><small>{row[3]}</small></span></div>)}</article></aside></section>
    <section className="ter-bottom-grid"><article className="panel ter-decisions"><Head eyebrow="TERRITORIAL DECISION BOARD" title="Decisões materiais" side={<Pill tone="watch">2 aguardando</Pill>} />{[
      ["DEC-088", "Adicionar monitoramento em C-07?", "8 relatos + pluma prevista + cobertura regional insuficiente"],
      ["DEC-091", "Informar Defesa Civil e concessionária?", "via estadual e energia externa com impacto funcional"],
      ["DEC-094", "Ativar desvio e barreira?", "V-EXT-04 · água 0,28 m · alternativa +18 min"],
    ].map(([id, title, reason], index) => <div key={id}><span>{id}</span><p><b>{title}</b><small>{reason}</small></p><button onClick={() => props.onToast(`${id} aprovado e registrado na linhagem`)}>{index === 2 ? "ATIVO" : "APROVAR"}</button></div>)}</article><article className="panel ter-agent-feed"><Head eyebrow="AGENTES TERRITORIAIS" title="Orquestração em tempo real" side={<button onClick={props.onAgents}>Ver centro →</button>} />{[
      ["19:34:07", "RECEPTOR", "12 receptores na área projetada"], ["19:34:09", "EXPOSURE", "4.820 pessoas estimadas"],
      ["19:34:12", "INFRA", "V-EXT-04 afetada"], ["19:34:15", "TRIAGE", "8 relatos correlacionados"],
      ["19:34:18", "ORCHESTRATOR", "TS-081 publicado"], ["19:34:20", "CONNECTOR", "M8 notificado"],
    ].map((row, i) => <div className={i === 4 ? "current" : ""} key={row[0] + row[1]}><time>{row[0]}</time><i>{i === 4 ? "!" : "✓"}</i><b>{row[1]}</b><span>{row[2]}</span></div>)}</article></section>
  </div>;
}

function Directory({ props, mode }: { props: Props; mode: "communities" | "population" | "receptors" | "vulnerability" }) {
  const config = {
    communities: ["COMUNIDADES", "Condições, exposição e necessidades territoriais"],
    population: ["POPULAÇÃO · CENSO 2022", "Perfis agregados, densidade e acesso a serviços"],
    receptors: ["SENSITIVE RECEPTOR MANAGEMENT", "Quem ou o que está exposto — e por quê"],
    vulnerability: ["EXPOSURE + SENSITIVITY + ADAPTIVE CAPACITY", "Vulnerabilidade explicável, nunca individual"],
  }[mode];
  const [selected, setSelected] = useState(mode === "receptors" ? "E-014" : "C-07");
  return <div className="ter-view"><section className="ter-directory-hero"><article className="panel"><Head eyebrow={config[0]} title={config[1]} side={<Pill tone="alert">TS-081</Pill>} /><div className="ter-directory-tools"><input aria-label="Buscar território ou receptor" placeholder="Buscar por ID, nome, área ou serviço…" /><button onClick={() => props.onToast("Filtros espaciais aplicados")}>Filtrar por exposição</button><button onClick={() => props.onToast("Cadastro aberto com geometry, source e version")}>＋ Novo registro</button></div></article><article className="panel ter-score"><span>TERRITORIAL CONFIDENCE</span><strong>78%</strong><small>Hazard 79% · Censo 2022 · Field confirmed</small></article></section>
    {mode === "vulnerability" ? <section className="ter-vulnerability"><article className="panel"><Head eyebrow="SETOR SC-204" title="Por que 71 / 100?" /><div className="ter-dimensions">{[["EXPOSURE",82,"flood + recorrência"],["SENSITIVITY",64,"dependência de serviços"],["ADAPTIVE CAPACITY",58,"uma única via"],["COMBINED",71,"método v2.4"]].map(([label,value,note]) => <button key={String(label)} onClick={() => props.onToast(`${label}: indicadores e fontes abertos`)}><span>{label}</span><b>{value}</b><i><strong style={{width:`${value}%`}} /></i><small>{note}</small></button>)}</div></article><TerritorialMap props={props} /></section> : null}
    {mode === "communities" || mode === "population" ? <section className="ter-community-grid">{communities.map(([id,pop,hazard,score,reports,service]) => <button className={`panel ${selected === id ? "selected" : ""}`} key={id} onClick={() => setSelected(id)}><header><span>COMUNIDADE {id}</span><Pill tone={Number(score) > 68 ? "alert" : "watch"}>COMBINED {score}</Pill></header><strong>{pop}</strong><small>pessoas · Censo-based estimate</small><dl><div><dt>Principal ameaça</dt><dd>{hazard}</dd></div><div><dt>Serviço crítico</dt><dd>{service}</dd></div><div><dt>Ocorrências</dt><dd>{reports}</dd></div></dl></button>)}</section> : null}
    {mode === "receptors" ? <section className="ter-receptor-layout"><article className="panel ter-receptor-table"><Head eyebrow="RECEPTORES" title="Social · ambiental · infraestrutura" />{receptors.map(([id,type,area,occupancy,risk,level]) => <button className={selected === id ? "selected" : ""} key={id} onClick={() => setSelected(id)}><span>{id}</span><div><b>{type}</b><small>{area} · {occupancy}</small></div><strong>{risk}</strong><Pill tone={level === "CRÍTICA" ? "critical" : "watch"}>{level}</Pill></button>)}</article><article className="panel ter-receptor-cockpit"><Head eyebrow={`COCKPIT · ${selected}`} title="Escola E-014" side={<Pill tone="alert">SENSITIVE</Pill>} /><div className="ter-receptor-facts"><div><span>População estimada</span><b>820 pessoas</b></div><div><span>Ocupação</span><b>07–18h</b></div><div><span>Risco atual</span><b>Fumaça</b></div><div><span>ETA pluma</span><b>42 min</b></div></div><div className="ter-exposure-track"><span>20:00 · sem exposição</span><span className="active">21:00 · início</span><span className="peak">21:40 · pico</span><span>23:10 · dissipação</span></div><div className="ter-cockpit-actions"><button onClick={() => props.onHazards()}>Abrir HMR-882 no M3</button><button onClick={() => props.onToast("Draft comunitário e institucional preparado")}>Preparar comunicação</button><button onClick={() => props.onToast("FIELD-221 criada para E-014")}>Criar vistoria</button></div></article></section> : null}
    {mode === "population" ? <section className="ter-population panel"><Head eyebrow="PERFIL AGREGADO" title={`${selected} · população e acesso`} /><div className="ter-pop-charts"><article><span>Faixa etária</span>{[["0–14",22],["15–64",66],["65+",12]].map(([l,v]) => <div key={String(l)}><b>{l}</b><i><strong style={{width:`${v}%`}} /></i><em>{v}%</em></div>)}</article><article><span>Acesso a serviços</span>{[["Saúde",78],["Transporte",61],["Água",94],["Telecom",87]].map(([l,v]) => <div key={String(l)}><b>{l}</b><i><strong style={{width:`${v}%`}} /></i><em>{v}%</em></div>)}</article><article className="privacy"><span>PRIVACY GUARDIAN</span><strong>Agregado por setor</strong><p>Nenhum score individual. Contatos e dados pessoais permanecem segregados da camada territorial.</p><Pill tone="ok">PASS</Pill></article></div></section> : null}
  </div>;
}

function EnvironmentMonitor({ props, mode }: { props: Props; mode: string }) {
  const data: Record<string, { title: string; id: string; metric: string; value: string; status: string; tone: Tone; source: string; sequence: string[] }> = {
    "Qualidade do Ar": { title: "Air & plume intelligence", id: "AQ-04", metric: "PM10", value: "42 µg/m³", status: "INVESTIGATING", tone: "watch", source: "FIELD SENSOR · QA 98%", sequence: ["SENSOR", "QA", "METEOROLOGIA", "MODELO", "RECEPTOR"] },
    "Água": { title: "Lagoa L-03 · impacto hídrico", id: "WQ-03", metric: "Turbidez", value: "+38%", status: "AMOSTRAGEM", tone: "alert", source: "FIELD SENSOR · LAB PENDING", sequence: ["ANOMALIA", "VALIDAR", "UPSTREAM", "DOWNSTREAM", "INSPEÇÃO"] },
    "Ruído": { title: "Campanha de ruído territorial", id: "N-07", metric: "LAeq", value: "58 dB", status: "POTENTIALLY RELATED", tone: "watch", source: "CAMPAIGN · VERIFIED", sequence: ["MEDIÇÃO", "VENTO", "TRÁFEGO", "OPERAÇÃO", "VERIFICAÇÃO"] },
    "Fogo e Fumaça": { title: "Fire, smoke & receptor outlook", id: "FIRE-08", metric: "ETA C-03", value: "45 min", status: "PLUME MODEL", tone: "critical", source: "M3 + VIIRS LIVING ATLAS", sequence: ["HOTSPOT", "VALIDATE", "FIRE MODEL", "SMOKE", "RECEPTORS"] },
    "Ecossistemas": { title: "Ecossistemas e cobertura", id: "ECO-12", metric: "Mudança 2025", value: "1,8 ha", status: "CONTEXT", tone: "info", source: "SENTINEL-2 LAND COVER", sequence: ["BASELINE", "IMAGERY", "CHANGE", "FIELD", "EVIDENCE"] },
    "Costa": { title: "Costa e ambiente marinho", id: "COAST-04", metric: "Nível + ondas", value: "+0,42 m", status: "ATTENTION", tone: "watch", source: "M3 · GEOBASES · FIELD", sequence: ["COAST HAZARD", "PATHWAY", "HABITAT", "INFRA", "ACTION"] },
  };
  const cfg = data[mode] ?? data["Qualidade do Ar"];
  const series = mode === "Água" ? [22,26,28,31,42,55,61,58,49,44,40,37] : [31,34,30,37,42,41,50,58,55,62,57,53];
  return <div className="ter-view"><section className="ter-monitor-hero"><article className="panel"><Head eyebrow="ENVIRONMENTAL INTELLIGENCE" title={cfg.title} side={<Pill tone={cfg.tone}>{cfg.status}</Pill>} /><div className="ter-monitor-value"><span>{cfg.id} · {cfg.metric}</span><strong>{cfg.value}</strong><small>{cfg.source}</small></div><div className="ter-validation-flow">{cfg.sequence.map((item, index) => <span className={index <= Math.min(4, Math.floor(props.scenarioStep / 3)) ? "active" : ""} key={item}><i>{index + 1}</i>{item}</span>)}</div></article><article className="panel ter-evidence"><span>EVIDENCE STATE</span><strong>{mode === "Ruído" ? "CONSISTENT" : mode === "Água" ? "UNDER VERIFICATION" : "LIKELY"}</strong><p>Correlação não é causalidade. O agente mantém medido, modelado e percebido separados até a verificação.</p><button onClick={() => props.onToast("Explicação com dados, qualidade e fontes aberta")}>Ver evidências</button></article></section>
    <section className="ter-monitor-grid"><TerritorialMap props={props} /><article className="panel ter-series"><Head eyebrow="OBSERVADO × BASELINE" title={`${cfg.metric} · últimas 12h`} side={<Pill tone="info">LIVE</Pill>} /><div className="ter-line-chart"><div /><i className="baseline" />{series.map((value,index) => <span key={index} style={{left:`${index*8.7+2}%`,bottom:`${value}%`}}><i /></span>)}</div><footer><span>12h</span><span>6h</span><span>Agora</span></footer><div className="ter-series-notes"><span><i className="measured" />MEASURED</span><span><i className="modelled" />MODELLED</span><span><i className="perceived" />PERCEIVED</span></div></article></section>
    <section className="ter-samples"><article className="panel"><Head eyebrow="OBSERVAÇÕES" title="Qualidade antes do impacto" />{[["AQ-04","42 µg/m³","98%","↑"],["AQ-05","27 µg/m³","96%","→"],["MET-03","ENE 18 km/h","100%","→"],["FIELD-204","Consistente","HIGH","✓"]].map(row => <div key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><small>QA {row[2]}</small><strong>{row[3]}</strong></div>)}</article><article className="panel ter-custody"><Head eyebrow="AMOSTRAGEM" title="SMP-024 · cadeia de custódia" />{["COLLECTED","SEALED","TRANSFERRED","LAB RECEIVED","ANALYZED","VALIDATED"].map((item,index) => <span className={index < (mode === "Água" ? 4 : 2) ? "passed" : ""} key={item}><i>{index < (mode === "Água" ? 4 : 2) ? "✓" : index+1}</i>{item}</span>)}<button onClick={() => props.onToast("Formulário: ponto, parâmetros, lacre, foto, coordenada e laboratório")}>＋ Nova amostra</button></article><article className="panel ter-agent-explain"><Head eyebrow="ENVIRONMENTAL AGENT" title="Recomendação" /><p>{mode === "Água" ? "Turbidez plausível e a jusante do evento. Manter contenção preventiva e aguardar laboratório." : "AQ-04 e AQ-05 elevados com vento da unidade e pluma consistente. Evento requer investigação."}</p><dl><div><dt>Confidence</dt><dd>76%</dd></div><div><dt>Guardrail</dt><dd>Sem declaração oficial</dd></div><div><dt>Próxima ação</dt><dd>Field verification</dd></div></dl><button onClick={() => props.onToast("FIELD-226 despachada com checklist ambiental")}>Despachar vistoria</button></article></section>
  </div>;
}

function Infrastructure({ props, mode }: { props: Props; mode: string }) {
  return <div className="ter-view"><section className="ter-infra-hero"><article className="panel"><Head eyebrow="CRITICAL EXTERNAL INFRASTRUCTURE" title={mode === "Mobilidade" ? "Mobilidade, rotas e acessibilidade" : mode === "Serviços" ? "Serviços externos e áreas dependentes" : "Dependências externas e efeito cascata"} side={<Pill tone="critical">2 afetados</Pill>} /><div className="ter-cascade">{["CHUVA","VIA ALAGADA","ÔNIBUS DESVIADO","ACESSO ESCOLA","+24 MIN"].map((item,index) => <span key={item}><i>{index+1}</i><b>{item}</b>{index<4?<em>→</em>:null}</span>)}</div></article><article className="panel ter-access"><span>ACESSIBILIDADE AO HOSPITAL</span><div><strong>12 min</strong><i>→</i><strong>28 min</strong></div><small>baseline · durante evento</small><Pill tone="alert">+16 min</Pill></article></section>
    <section className="ter-infra-grid"><article className="panel ter-service-table"><Head eyebrow="SERVICE DISRUPTIONS" title="Quem depende de quê?" />{[["V-EXT-04","ROAD","BLOCKED","12.400","+18 min"],["PWR-02","POWER","DEGRADED","3.800","2 críticos"],["WTR-06","WATER","RESTORING","8.200","3 setores"],["TEL-04","TELECOM","NORMAL","6.100","redundante"]].map(([id,type,status,pop,effect]) => <button key={id} onClick={() => props.onToast(`${id}: service area e dependências abertas`)}><span>{id}</span><b>{type}</b><Pill tone={status === "BLOCKED" ? "critical" : status === "DEGRADED" ? "alert" : status === "RESTORING" ? "watch" : "ok"}>{status}</Pill><small>{pop} pessoas</small><strong>{effect}</strong></button>)}</article><article className="panel ter-dependency"><Head eyebrow="EXTERNAL DEPENDENCY GRAPH" title="Subestação externa · Rede A" /><div className="ter-tree"><div className="root">SE-EXT-02</div><i /><div className="branches"><button>Hospital<br/><small>critical</small></button><button>Água<br/><small>2 estações</small></button><button>Telecom<br/><small>redundante</small></button><button onClick={props.onTwin}>Tubarão<br/><small>M9 → M4</small></button></div></div></article></section>
    <section className="ter-routing panel"><Head eyebrow="ISOCHRONES · ARCGIS ROUTING" title="Rotas seguras e tempos de resposta" side={<button onClick={() => props.onToast("Barreira V-EXT-04 adicionada; rota alternativa calculada")}>Recalcular rota</button>} /><div>{[["Bombeiros","8 min","11 min","+3"],["Hospital","12 min","28 min","+16"],["Equipe de campo","6 min","17 min","+11"],["Rota de recursos","18 min","36 min","+18"]].map(row => <span key={row[0]}><b>{row[0]}</b><small>baseline {row[1]}</small><i><strong style={{width:`${Math.min(100,parseInt(row[2])*2.5)}%`}} /></i><em>{row[2]}</em><Pill tone={parseInt(row[3])>12?"alert":"watch"}>{row[3]} min</Pill></span>)}</div><footer><button onClick={props.onPlanning}>Enviar restrição ao M6</button><button onClick={props.onEmergency}>Coordenar no M8</button><button onClick={props.onTwin}>Abrir dependência no M4</button></footer></section>
  </div>;
}

function Occurrences(props: Props) {
  const [status, setStatus] = useState("UNDER VERIFICATION");
  const [created, setCreated] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); setCreated(true); props.onToast("OCC-238 criada, geocodificada e enviada à triagem"); };
  return <div className="ter-view"><section className="ter-occ-hero"><article className="panel"><Head eyebrow="COMMUNITY OCCURRENCE MANAGEMENT" title="Central de ocorrências" side={<Pill tone="alert">27 abertas · 5 críticas</Pill>} /><div className="ter-intake-flow">{["RECEIVED","TRIAGED","DUPLICATE","VERIFY","ACTIONING","RESPONDED","CLOSED"].map((item,index) => <span className={index<4?"active":""} key={item}><i>{index<3?"✓":index+1}</i>{item}</span>)}</div></article><article className="panel ter-group"><span>DUPLICATE DETECTION</span><strong>17 relatos → 1 evento</strong><small>mesma área · 20 min · mesma categoria</small><Pill tone="watch">OCC-GROUP-018</Pill></article></section>
    <section className="ter-occ-grid"><article className="panel ter-occ-table"><Head eyebrow="TRIAGEM" title="Ocorrências por prioridade" />{[["ALTA","Alagamento","C-07","8","CONFIRMED","ACTIONING"],["MÉDIA","Poeira","C-03","12","ANALYSING","OPEN"],["ALTA","Energia","B-12","2","VERIFIED","ACTIONING"],["BAIXA","Ruído","C-11","5","UNVERIFIED","TRIAGED"]].map(row => <button key={row[1]+row[2]} onClick={() => setStatus(row[4])}><Pill tone={row[0]==="ALTA"?"alert":"watch"}>{row[0]}</Pill><b>{row[1]}</b><span>{row[2]}</span><strong>{row[3]} relatos</strong><small>{row[4]}</small><em>{row[5]}</em></button>)}</article><form className="panel ter-occ-form" onSubmit={submit}><Head eyebrow="NOVO INTAKE" title={created ? "OCC-238 · RECEIVED" : "Registrar ocorrência"} /><label>Categoria<select><option>Alagamento</option><option>Poeira</option><option>Odor</option><option>Ruído</option><option>Fumaça</option></select></label><label>Área / referência<input defaultValue="perto da Escola E-014" /></label><label className="wide">Descrição<textarea defaultValue="Água sobre o acesso principal, passagem difícil." /></label><label>Canal<select><option>Portal</option><option>Telefone</option><option>Survey123</option></select></label><label>Urgência<select><option>Alta</option><option>Média</option><option>Baixa</option></select></label><div className="ter-geocode"><span>AI</span><p><b>Localização sugerida</b><small>C-07 · V-EXT-04 · confidence 82%</small></p><button type="button" onClick={() => props.onToast("Localização sugerida confirmada pelo usuário")}>Confirmar</button></div><button type="submit">Registrar e triar</button></form></section>
    <section className="ter-verify"><article className="panel"><Head eyebrow="VERIFY OCCURRENCE" title="OCC-GROUP-018 · alagamento C-07" side={<Pill tone="watch">{status}</Pill>} /><div className="ter-verification-evidence">{[["RELATOS","8","consistent"],["MODELO","0,31 m","consistent"],["SENSOR","0,27 m","measured"],["FOTOS","5","geo QA pass"],["OPERAÇÃO","INC-024","related"]].map(row => <button key={row[0]}><span>{row[0]}</span><b>{row[1]}</b><small>{row[2]}</small></button>)}</div><p><b>Agente de inconsistências:</b> modelo, sensor e relatos são consistentes. Causa classificada como <strong>LIKELY RELATED</strong>, não como confirmada.</p><footer><button onClick={() => {setStatus("CONFIRMED");props.onToast("Ocorrência confirmada com evidência auditável")}}>Confirmar condição</button><button onClick={() => props.onToast("FIELD-204 despachada com rota e checklist")}>Despachar vistoria</button><button onClick={() => props.onToast("Draft de resposta comunitária gerado")}>Preparar resposta</button></footer></article></section>
  </div>;
}

function Relationship({ props, mode }: { props: Props; mode: string }) {
  const isComm = mode === "Comunicação";
  return <div className="ter-view"><section className="ter-relation-hero"><article className="panel"><Head eyebrow={isComm ? "TERRITORIAL COMMUNICATION" : "STAKEHOLDER & ENGAGEMENT"} title={isComm ? "Mensagem certa para território, receptor e público" : "Coordenação institucional e relacionamento contínuo"} side={<Pill tone="ok">GOVERNED</Pill>} />{isComm ? <div className="ter-audience">{[["TÉCNICO","Pluma modelada alcança C-03 em 45 min…"],["COMUNIDADE","Pode ocorrer aumento de fumaça no setor…"],["INSTITUCIONAL","Cenário requer prontidão e retorno formal…"]].map(row => <button key={row[0]} onClick={() => props.onToast(`Draft ${row[0].toLowerCase()} aberto para aprovação`)}><span>{row[0]}</span><p>{row[1]}</p><Pill tone="watch">DRAFT</Pill></button>)}</div> : <div className="ter-engagement-types">{["INFORMAÇÃO","CONSULTA","REUNIÃO","TREINAMENTO","SIMULADO","MONITORAMENTO PARTICIPATIVO","FEEDBACK"].map(item => <span key={item}>{item}</span>)}</div>}</article><article className="panel ter-publishing"><span>PUBLICATION GATE</span><strong>INTERNAL → REVIEW → PUBLIC</strong><p>Dados pessoais, ativos críticos e processos internos são removidos antes do ArcGIS Hub.</p><Pill tone="ok">PRIVACY PASS</Pill></article></section>
    <section className="ter-relation-grid"><article className="panel ter-stakeholders"><Head eyebrow="COORDENAÇÃO INSTITUCIONAL" title="Ator, evento, ação e retorno" />{[["Defesa Civil","Inundação","Informar","ACK","Monitorar"],["Concessionária","Energia","Verificar","EM AÇÃO","Retorno 20:15"],["Município","V-EXT-04","Desvio","ACK","Sinalização"],["Escola E-014","Fumaça","Preparar","DRAFT","Aprovação"]].map(row => <div key={row[0]}><span>{row[0]}</span><b>{row[1]}</b><small>{row[2]}</small><Pill tone={row[3]==="ACK"?"ok":"watch"}>{row[3]}</Pill><strong>{row[4]}</strong></div>)}</article><article className="panel ter-coverage"><Head eyebrow="ALCANCE" title="Comunicação georreferenciada" /><div className="ter-coverage-ring"><strong>75%</strong><span>coverage</span></div><dl><div><dt>Público estimado</dt><dd>4.800</dd></div><div><dt>Entregas</dt><dd>4.100</dd></div><div><dt>Confirmadas</dt><dd>3.620</dd></div><div><dt>Delivery estimated</dt><dd>480</dd></div></dl><button onClick={() => props.onToast("Métricas por geofence, público e canal abertas")}>Abrir distribuição</button></article></section>
    <section className="ter-commitments panel"><Head eyebrow="COMPROMISSOS TERRITORIAIS" title="Recebido → entregue → verificado" side={<button onClick={() => props.onToast("Novo compromisso aberto")}>＋ Compromisso</button>} /><div className="ter-kanban">{[["RECEIVED",3],["ASSESSED",4],["COMMITTED",5],["IN DELIVERY",7],["VERIFYING",2],["CLOSED",18]].map(([name,count],index) => <section key={String(name)}><header><b>{name}</b><span>{count}</span></header>{index<5?<article><strong>{["CR-219 · acesso","CR-207 · poeira","CR-198 · reunião","CR-184 · monitor","CR-172 · água"][index]}</strong><small>{index===3?"due soon":"owner · prazo · área"}</small><Pill tone={index===3?"alert":"info"}>{index===3?"AT RISK":"ON TRACK"}</Pill></article>:<article><strong>18 verificadas</strong><small>evidências publicáveis</small><Pill tone="ok">CLOSED</Pill></article>}</section>)}</div></section>
  </div>;
}

function Field(props: Props) {
  const [sent, setSent] = useState(false);
  return <div className="ter-view"><section className="ter-field-hero"><article className="panel"><Head eyebrow="ENVIRONMENTAL FIELD OPERATIONS" title="FIELD-204 · Vistoria territorial C-07" side={<Pill tone="alert">EM CAMPO</Pill>} /><div className="ter-field-route"><span>BASE · equipe 04</span><i /><span>V-11 · rota segura</span><i /><span>C-07 · ETA 11 min</span></div></article><article className="panel ter-offline"><span>FIELD MAPS / SURVEY123</span><strong>OFFLINE READY</strong><small>sync 19:42 · pacote 14 MB</small><Pill tone="ok">GPS 4 m</Pill></article></section><section className="ter-field-grid"><form className="panel ter-field-form" onSubmit={(e) => {e.preventDefault();setSent(true);props.onToast("FIELD-204 enviado ao QA e à linhagem TS-081")}}><Head eyebrow="FORMULÁRIO DE VISTORIA" title={sent ? "Evidência sincronizada" : "Condição e evidência"} /><label>Evento<input defaultValue="INC-024 · TS-081" /></label><label>Receptor<input defaultValue="V-EXT-04 · C-07" /></label><label>Condição<select><option>Água sobre a via</option><option>Sem impacto</option></select></label><label>Medição<input defaultValue="0,28 m" /></label><label className="wide">Impacto<textarea defaultValue="Acesso principal interrompido; desvio disponível pela V-11." /></label><div className="ter-field-checks">{["Foto geo","Timestamp","Medição","Receptor","Rota","Urgência"].map(item => <label key={item}><input type="checkbox" defaultChecked={item!=="Urgência"}/>{item}</label>)}</div><label className="ter-upload wide">＋ FOTO / VÍDEO / DOCUMENTO<small>hash e metadados preservados</small><input type="file" hidden /></label><button type="submit">Enviar para validação</button></form><article className="panel ter-field-qa"><Head eyebrow="FIELD QA AGENT" title="Checklist e plausibilidade" />{[["Localização","PASS","4 m"],["Timestamp","PASS","19:54:08"],["Foto","PASS","hash ok"],["Medição","PASS","plausível"],["Modelo","CONSISTENT","0,31 m"]].map(row => <div key={row[0]}><span>{row[0]}</span><Pill tone={row[1]==="PASS"?"ok":"info"}>{row[1]}</Pill><small>{row[2]}</small></div>)}<p>Resultado proposto: <b>CONDITION CONFIRMED</b>. Causalidade permanece LIKELY até revisão.</p><button onClick={() => props.onToast("DEC-088 atualizada com FIELD-204")}>Anexar à decisão</button></article></section></div>;
}

function Recovery({ props, mode }: { props: Props; mode: string }) {
  const recovery = mode === "Recuperação";
  return <div className="ter-view"><section className="ter-recovery-hero"><article className="panel"><Head eyebrow={recovery ? "SOCIOENVIRONMENTAL RECOVERY" : "IMPACT MITIGATION"} title={recovery ? "Retorno à condição-alvo exige evidência" : "Efeito esperado × efeito observado"} side={<Pill tone={recovery?"watch":"info"}>{recovery?"72% RECOVERED":"3 ACTIVE"}</Pill>} />{recovery?<div className="ter-recovery-scale"><span>PRE-EVENT<b>Baseline sazonal</b></span><i /><span>EVENT<b>Peak 21:20</b></span><i /><span className="active">RECOVERY<b>72%</b></span><i /><span>TARGET<b>Verificação</b></span></div>:<div className="ter-measures">{[["MIT-032","Umectação","25%","18%"],["MIT-041","Desvio V-11","+18 min","+16 min"],["MIT-044","Contenção L-03","85%","PENDING"]].map(row => <button key={row[0]}><span>{row[0]}</span><b>{row[1]}</b><small>expected {row[2]}</small><strong>actual {row[3]}</strong></button>)}</div>}</article><article className="panel ter-baseline"><span>BASELINE</span><strong>{recovery?"72%":"Sazonal v4.2"}</strong><p>Turbidez não é comparada apenas ao instante anterior, mas à distribuição sazonal de referência.</p><Pill tone="ok">CONF. HIGH</Pill></article></section><section className="ter-recovery-grid"><article className="panel"><Head eyebrow="CORPO D'ÁGUA L-03" title="Baseline × evento × estado atual" />{[["Turbidez","18 NTU","47 NTU","25 NTU"],["pH","7,1","6,8","7,0"],["Oxigênio","7,4","5,9","6,9"],["Nível","0,82 m","1,44 m","0,91 m"]].map(row => <div key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><span className="event">{row[2]}</span><span className="current">{row[3]}</span></div>)}</article><article className="panel ter-recovery-curve"><Head eyebrow="RECOVERY CURVE" title="Ambiente, serviço e comunidade" />{[["Água",72],["Acesso",100],["Energia",84],["Comunicação",96]].map(([label,value]) => <div key={String(label)}><span>{label}</span><i><strong style={{width:`${value}%`}} /></i><b>{value}%</b></div>)}</article><article className="panel ter-close-gates"><Head eyebrow="CLOSE GATES" title="Impacto não fecha com o fim do evento" />{["Vistoria concluída","Serviço normal","Baseline avaliado","Evidência anexada","Stakeholder informado"].map((item,index)=><span className={index<4?"passed":""} key={item}><i>{index<4?"✓":"!"}</i>{item}</span>)}<button onClick={() => props.onToast("Fechamento bloqueado: confirmação institucional pendente")}>Solicitar fechamento</button></article></section></div>;
}

function History(props: Props) {
  return <div className="ter-view"><section className="ter-history-hero"><article className="panel"><Head eyebrow="EVENT REPLAY" title="INC-024 · impacto territorial ponta a ponta" side={<Pill tone="ok">AUDITABLE</Pill>} /><div className="ter-replay">{[["19:34","HMR-882","Flood footprint"],["19:42","V-EXT-04","Primeiro impacto"],["19:48","OCC-GROUP-018","Relatos agrupados"],["20:04","DEC-088","Bloqueio + desvio"],["21:20","PEAK","4.820 expostos"],["23:10","REC-014","Recovery"]].map((row,index)=><button key={row[0]} onClick={() => props.onToast(`${row[0]} · estado territorial reconstruído`)}><i>{index+1}</i><time>{row[0]}</time><b>{row[1]}</b><small>{row[2]}</small></button>)}</div></article><article className="panel ter-hotspot"><span>HOTSPOT H-07</span><strong>3 eventos</strong><small>12 ocorrências · 1 acesso crítico · 2 receptores sensíveis</small><Pill tone="alert">STRUCTURAL</Pill></article></section><section className="ter-lineage panel"><Head eyebrow="LINHAGEM" title="Hazard → receptor → decisão → recuperação" side={<button onClick={() => props.onToast("Evidence pack territorial exportado")}>Exportar evidência</button>} /><div>{["HMR-882","TS-081","C-07","OCC-GROUP-018","FIELD-204","DEC-088","MIT-032","REC-014"].map((node,index)=><span key={node}><i>{index+1}</i><b>{node}</b><small>{["Hazard","Signal","Territory","Occurrences","Field","Decision","Mitigation","Recovery"][index]}</small>{index<7?<em>→</em>:null}</span>)}</div></section><section className="ter-changed panel"><Head eyebrow="WHAT CHANGED?" title="Desde 18:30" />{[["Population exposure","1.200","4.820"],["Sensitive receptors","3","8"],["Community occurrences","4","17"],["Road disruption","none","1"],["Air quality","normal","attention"]].map(row=><div key={row[0]}><span>{row[0]}</span><small>{row[1]}</small><i>→</i><strong>{row[2]}</strong></div>)}</section></div>;
}

function AgentsAndIntegrations(props: Props) {
  return <div className="ter-view"><section className="ter-agent-hero"><div><span>AGENTIC TERRITORIAL INTELLIGENCE</span><h2>15 agentes · decisões explicáveis · ação governada</h2><p>Human-in-the-loop para causalidade, comunicação formal, publicação e encerramento.</p></div><div><strong>15 / 15</strong><span>healthy</span><Pill tone="ok">PRIVACY PASS</Pill></div></section><section className="ter-agent-grid">{agents.map(([name,role,status],index)=><article className="panel" key={name}><header><span>AI</span><div><small>AGENT {String(index+1).padStart(2,"0")}</small><h3>{name}</h3></div><Pill tone={status.includes("1 ")||status.includes("4 ")?"watch":"ok"}>LIVE</Pill></header><p>{role}</p><dl><div><dt>Estado</dt><dd>{status}</dd></div><div><dt>Autonomia</dt><dd>{index===7||index===8?"Draft only":"Observe + recommend"}</dd></div></dl><button onClick={() => props.onToast(`${name}: inputs, regra, evidências e guardrails abertos`)}>Explicar decisão</button></article>)}</section><section className="ter-integrations"><article className="panel"><Head eyebrow="FONTES TERRITORIAIS" title="Externas e públicas" />{[["GEOBASES ES","ArcGIS REST / WMS / WFS","ONLINE"],["IBGE Censo 2022","Malhas + agregados","VALID"],["CEMADEN","Pluviômetros","LIVE"],["ANA / SNIRH","Água","CACHE"],["IEMA / Municípios","Ambiente e serviços","ONLINE"],["LIVING ATLAS","VIIRS · Sentinel-2 · OpenAQ","2/3"]].map(row=><button key={row[0]}><span>EXT</span><p><b>{row[0]}</b><small>{row[1]}</small></p><Pill tone={row[2]==="CACHE"?"watch":"ok"}>{row[2]}</Pill></button>)}</article><article className="ter-gis-core"><span>GIS</span><strong>ArcGIS Enterprise</strong><small>FeatureLayer · StreamLayer · WMSLayer · WFSLayer · Routing · TimeSlider</small><i /><span>AI</span><strong>Territorial Orchestrator</strong><small>Event Bus · policies · evidence · lineage</small></article><article className="panel"><Head eyebrow="SISTEMAS INTERNOS" title="Interfaces corporativas" />{[["Environmental Monitoring","sensores + laboratório","LIVE"],["Operational GIS","ativos + fontes","SYNC"],["SCADA / HSE","estado + incidentes","LIVE"],["Community Service","intake + contatos segregados","GOV"],["Field Maps / Survey123","campo offline","READY"],["ArcGIS Hub","publicação aprovada","GATE"]].map(row=><button key={row[0]}><span>SYS</span><p><b>{row[0]}</b><small>{row[1]}</small></p><Pill tone={row[2]==="GATE"?"watch":"ok"}>{row[2]}</Pill></button>)}</article></section><section className="ter-module-bus panel"><Head eyebrow="EVENT CONTRACTS" title="M3 / M8 → M9 → M1 / M4 / M6 / M7 / M8" /><div>{[["M3","HazardSurface","Receptores"],["M8","INC-024","TerritoryContext"],["M1","TerritorialSignal","Decisão material"],["M4","UtilityDisruption","Asset impact"],["M6","TerritorialConstraint","Replan"],["M7","ImpactMateriality","Risco + custo"],["M8","TS-081","Resposta"]].map(row=><button key={row[0]} onClick={() => ({M3:props.onHazards,M8:props.onEmergency,M1:props.onTower,M4:props.onTwin,M6:props.onPlanning,M7:props.onRisk}[row[0] as "M3"]?.())}><span>{row[0]}</span><b>{row[1]}</b><small>{row[2]}</small></button>)}</div></section></div>;
}

function Reports(props: Props) {
  const reports = ["Territorial Situation Report","Community Exposure Report","Sensitive Receptor Report","Environmental Situation Report","Air Quality Event Report","Water Impact Report","Infrastructure Disruption Report","Community Occurrence Report","Institutional Coordination Report","Territorial Communication Report","Mitigation Effectiveness Report","Environmental Recovery Report","Community Engagement Report","Territorial Post-Event Review"];
  return <div className="ter-view"><section className="ter-reports"><aside className="panel"><Head eyebrow="REPORT PACK" title="Entregáveis territoriais" />{reports.map((report,index)=><button className={index===0?"active":""} key={report}><span>{index%3===0?"LIVE":"PDF"}</span><b>{report}</b><i>›</i></button>)}</aside><article className="panel ter-report-preview"><header><div><span>TERRITORIAL SITUATION REPORT · TSR-024</span><h2>INC-024 · Tubarão e entorno</h2><p>Período operacional 01 · fontes citadas · método e confiança versionados</p></div><Pill tone="alert">HIGH · 78%</Pill></header><section>{[["População","4.820"],["Receptores","14"],["Infraestrutura","2"],["Ocorrências","27"]].map(row=><div key={row[0]}><span>{row[0]}</span><b>{row[1]}</b></div>)}</section><div className="ter-report-body"><h3>Outlook territorial</h3><p>A inundação alcançou o acesso V-EXT-04 e afetou funcionalmente C-07. Oito relatos foram confirmados por vistoria. O desvio permanece ativo e o nível está em queda.</p><div className="ter-report-relations">{["PÁTIO","CHUVA","DRENAGEM","V-EXT-04","C-07"].map((item,index)=><span key={item}>{item}{index<4?<i>→</i>:null}</span>)}</div><h3>Ações e comunicação</h3><ul><li>Desvio V-11 e barreira ativos.</li><li>Defesa Civil e concessionária com ACK.</li><li>Comunicação comunitária com 75% de coverage.</li><li>Recuperação monitorada contra baseline sazonal.</li></ul></div><footer><span>Lineage: HMR-882 → TS-081 → DEC-088 → MIT-032</span><button onClick={() => props.onToast("TSR-024 gerado e adicionado à trilha de evidências")}>Gerar relatório</button></footer></article></section></div>;
}

export function EnvironmentModule(props: Props) {
  if (props.subview === "Situação Territorial") return <Situation {...props} />;
  if (props.subview === "Mapa Integrado") return <div className="ter-view"><TerritorialMap props={props} expanded /><section className="ter-map-summary">{[["Footprint","3,8 km²"],["População","4.820 est."],["Social","12 receptores"],["Ambiental","5 receptores"],["Serviços","2 disrupções"]].map(row=><article className="panel" key={row[0]}><span>{row[0]}</span><strong>{row[1]}</strong></article>)}</section></div>;
  if (props.subview === "Comunidades") return <Directory props={props} mode="communities" />;
  if (props.subview === "População") return <Directory props={props} mode="population" />;
  if (props.subview === "Receptores") return <Directory props={props} mode="receptors" />;
  if (props.subview === "Vulnerabilidade") return <Directory props={props} mode="vulnerability" />;
  if (["Qualidade do Ar","Água","Ruído","Fogo e Fumaça","Ecossistemas","Costa"].includes(props.subview)) return <EnvironmentMonitor props={props} mode={props.subview} />;
  if (["Infraestrutura","Serviços","Mobilidade"].includes(props.subview)) return <Infrastructure props={props} mode={props.subview} />;
  if (props.subview === "Ocorrências") return <Occurrences {...props} />;
  if (["Stakeholders","Engajamento","Comunicação"].includes(props.subview)) return <Relationship props={props} mode={props.subview} />;
  if (props.subview === "Campo") return <Field {...props} />;
  if (["Mitigação","Recuperação"].includes(props.subview)) return <Recovery props={props} mode={props.subview} />;
  if (props.subview === "Histórico") return <History {...props} />;
  if (props.subview === "Agentes & Integrações") return <AgentsAndIntegrations {...props} />;
  return <Reports {...props} />;
}
