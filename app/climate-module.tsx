"use client";

import { useMemo, useState, type ReactNode } from "react";

type Tone = "ok" | "watch" | "alert" | "critical" | "info";
type Stage = { label: string; time: string; note: string; tone: Tone };

type Props = {
  subview: string;
  horizon: string;
  profile: string;
  scenarioStep: number;
  stage: Stage;
  mapStatus: string;
  renderMap: () => ReactNode;
  onHorizon: (value: string) => void;
  onAgents: () => void;
  onToast: (message: string) => void;
  onClimateSignal: () => void;
  onHazards: () => void;
};

export const climateTabs = [
  "Visão Geral",
  "Observações",
  "Nowcasting",
  "Forecast 0–72h",
  "Ensemble",
  "Extremos",
  "Subseasonal",
  "Seasonal",
  "Drivers Climáticos",
  "Climatologia",
  "Anomalias",
  "Projeções",
  "Verificação",
  "Rodadas",
  "Briefing",
];

const stations = [
  { id: "MET-07", area: "Pátio Norte", rain: "13,4 mm/h", wind: "31 km/h", gust: "48 km/h", temp: "29,8 °C", quality: 98, state: "LIVE" },
  { id: "MET-03", area: "Terminal", rain: "7,8 mm/h", wind: "41 km/h", gust: "62 km/h", temp: "28,7 °C", quality: 72, state: "DEGRADED" },
  { id: "MET-04", area: "Terminal Leste", rain: "8,1 mm/h", wind: "16 km/h", gust: "24 km/h", temp: "28,9 °C", quality: 91, state: "LIVE" },
  { id: "MET-09", area: "Usina 3", rain: "2,4 mm/h", wind: "22 km/h", gust: "35 km/h", temp: "30,2 °C", quality: 96, state: "LIVE" },
  { id: "BOIA-02", area: "Costa", rain: "—", wind: "38 km/h", gust: "55 km/h", temp: "26,1 °C", quality: 94, state: "CURRENT" },
];

const runs = [
  { id: "FR-2204", model: "ECMWF ENS", base: "12Z", horizon: "+360h", members: "51", qa: "98%", status: "PUBLICADO" },
  { id: "FR-2203", model: "WRF-TUB v4.2", base: "12Z", horizon: "+72h", members: "21", qa: "96%", status: "READY" },
  { id: "FR-2201", model: "ECMWF ENS", base: "00Z", horizon: "+360h", members: "51", qa: "97%", status: "SUPERADO" },
  { id: "FR-2199", model: "ICON Global", base: "06Z", horizon: "+180h", members: "40", qa: "92%", status: "READY" },
  { id: "FR-2198", model: "GFS", base: "06Z", horizon: "+240h", members: "31", qa: "90%", status: "READY" },
  { id: "FR-SEA-08", model: "Seasonal MM", base: "AGO", horizon: "+7m", members: "156", qa: "91%", status: "PUBLICADO" },
];

const climateAgents = [
  ["METEOROLOGISTA", "Orquestra interpretação e briefing", "Nova rodada em análise", "Especialista aprova publicação crítica"],
  ["OBSERVATION QA", "Valida estações, radar e redundância", "MET-03 divergente", "Nunca fabrica observação"],
  ["NOWCAST", "Detecta e rastreia células", "C-028 · ETA 41 min", "Publica somente probabilidade"],
  ["ENSEMBLE", "Interpreta 51 membros e clusters", "Spread moderado", "Preserva cenários minoritários"],
  ["RUN COMPARATOR", "Compara intensidade, posição e timing", "+25 mm vs. 00Z", "Não altera a rodada"],
  ["ANOMALY", "Cruza normal, percentis e M-climate", "EFI 0,86", "EFI é guidance"],
  ["SEASONAL", "Combina centros e calibração local", "Outlook atualizado", "Sem previsão pontual"],
  ["CLIMATE PROJECTION", "Processa ensembles CMIP6", "18 modelos · SSP2-4.5", "Não prevê dia específico"],
  ["VERIFICATION", "Atualiza skill e ranking", "4 forecasts avaliados", "Métrica condicionada"],
  ["PUBLISHER", "Valida contrato e envia eventos", "CS-204 pronto", "Sem ordem operacional"],
];

const forecastBars = [4, 7, 5, 9, 16, 28, 42, 61, 78, 92, 73, 55, 39, 26, 18, 12, 9, 7, 5, 4, 3, 2, 2, 1];
const temperatureBars = [28, 28, 27, 27, 27, 28, 29, 30, 31, 32, 34, 36, 37, 37, 36, 35, 33, 32, 31, 30, 30, 29, 29, 28];

function Pill({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`climate-pill tone-${tone}`}><i />{children}</span>;
}

function PanelHead({ eyebrow, title, side }: { eyebrow: string; title: string; side?: ReactNode }) {
  return <div className="climate-panel-head"><div><span>{eyebrow}</span><h2>{title}</h2></div>{side}</div>;
}

function Spark({ values, tone = "info" }: { values: number[]; tone?: Tone }) {
  return <div className={`climate-spark tone-${tone}`}>{values.map((value, index) => <i key={index} style={{ height: `${Math.max(6, value)}%` }} />)}</div>;
}

function WeatherMap({ props, variable, hour, compare = false }: { props: Props; variable: string; hour: number; compare?: boolean }) {
  return <div className={`climate-map-wrap ${compare ? "compare" : ""}`}>
    {props.renderMap()}
    <div className={`weather-raster weather-${variable.toLowerCase().replace(/[^a-z]/g, "")}`} />
    <div className="radar-cell cell-one"><span>C-028</span></div>
    <div className="radar-cell cell-two" />
    <div className="storm-track"><i /><i /><i /><i /><b>ETA 41 min</b></div>
    <button className="weather-pixel" onClick={() => props.onToast(`${variable} · ${String(hour).padStart(2, "0")}:00 · P50 12 mm/h · P90 24 mm/h · EFI 0,84`)}><span>＋</span><b>TUB-NORTH</b><small>{hour}:00 · P50 12 · P90 24</small></button>
    <div className="climate-map-legend"><span><i className="legend-low" />Baixa</span><span><i className="legend-med" />Moderada</span><span><i className="legend-high" />Alta</span><b>{props.mapStatus}</b></div>
  </div>;
}

function ClimateKpis({ scenarioStep }: { scenarioStep: number }) {
  const changed = scenarioStep >= 3;
  const items: Array<[string, string, string, string, Tone]> = [
    ["Chuva máxima prevista · 24h", changed ? "73 mm" : "48 mm", changed ? "P90 104 mm" : "P90 76 mm", "ECMWF ENS · P50", "alert"],
    ["Rajada máxima", changed ? "82 km/h" : "71 km/h", "20:00–22:00", "WRF-TUB v4.2", "watch"],
    ["Temperatura máxima", "37,4 °C", "+5,2 °C vs. normal", "ZONE-MET-02", "watch"],
    ["Probabilidade de raio", changed ? "86%" : "68%", "próximas 2h", "Radar + GLM", "alert"],
    ["Principal anomalia", "EFI 0,86", "SOT 1,20 · precipitação", "M-climate", "critical"],
    ["Confiança geral", changed ? "82%" : "76%", changed ? "ALTA" : "MODERADA", "Trust Score", "ok"],
  ];
  return <section className="climate-kpi-grid">{items.map(([label, value, note, source, tone], index) => <button className={`climate-kpi tone-${tone}`} key={label}>
    <span>{label}</span><strong>{value}</strong><b>{note}</b><footer><small>{source}</small><small>há {index + 1} min</small></footer>
  </button>)}</section>;
}

function Overview(props: Props) {
  const [variable, setVariable] = useState("Chuva");
  const [hour, setHour] = useState(20);
  const changed = props.scenarioStep >= 3;
  return <div className="climate-view">
    <ClimateKpis scenarioStep={props.scenarioStep} />
    <section className="climate-overview-grid">
      <article className="panel climate-map-card">
        <PanelHead eyebrow="METEOROLOGIA ESPACIAL" title="Tubarão · condição e previsão" side={<Pill tone={props.stage.tone}>{props.stage.label}</Pill>} />
        <div className="weather-variable-tabs">{["Chuva", "Vento", "Calor", "Raios", "Ondas"].map(item => <button className={variable === item ? "active" : ""} onClick={() => setVariable(item)} key={item}>{item}</button>)}</div>
        <WeatherMap props={props} variable={variable} hour={hour} />
        <div className="climate-time-control"><button onClick={() => setHour(Math.max(18, hour - 1))}>◀</button><button>Ⅱ</button><input aria-label="Hora da previsão" type="range" min="18" max="23" value={hour} onChange={event => setHour(Number(event.target.value))} /><strong>{hour}:00</strong><button onClick={() => setHour(Math.min(23, hour + 1))}>▶</button><span>OBS</span><b>FORECAST</b></div>
      </article>
      <aside className="climate-overview-side">
        <article className="panel climate-brief-card"><PanelHead eyebrow="METEOROLOGISTA · IA" title="Briefing das próximas 24h" side={<Pill tone="ok">82% confiança</Pill>} /><p>A nova rodada {changed ? "aumentou" : "mantém"} a probabilidade de precipitação intensa entre 18h e 23h. O núcleo convectivo está mais próximo dos setores norte e oeste.</p><dl><div><dt>Condição principal</dt><dd>Chuva extrema</dd></div><div><dt>Prob. &gt;50 mm</dt><dd>{changed ? "76%" : "49%"}</dd></div><div><dt>Maior incerteza</dt><dd>posição ±12 km</dd></div><div><dt>Próximo marco</dt><dd>Radar · 19:00</dd></div></dl><div className="climate-action-row"><button onClick={() => props.onToast("Evidências e linhagem do briefing abertas")}>Evidências</button><button onClick={() => props.onToast("Incerteza principal: posição e intensidade da célula")}>Incerteza</button></div></article>
        <article className="panel climate-change-card"><PanelHead eyebrow="MATERIAL CHANGE" title="O que mudou desde 00Z?" /><div><span>Chuva +24h</span><strong>48 → {changed ? "73" : "48"} mm</strong><b>{changed ? "+52%" : "estável"}</b></div><div><span>Pico</span><strong>{changed ? "2 h mais cedo" : "21:00"}</strong><b>timing</b></div><div><span>Núcleo</span><strong>{changed ? "11 km oeste" : "sem mudança"}</strong><b>posição</b></div><button className="climate-primary" onClick={() => props.onToast("Comparação 00Z × 12Z sincronizada no mapa")}>Comparar rodadas</button></article>
      </aside>
    </section>
    <section className="climate-lower-grid">
      <article className="panel climate-ensemble-mini"><PanelHead eyebrow="ENSEMBLE · 51 MEMBROS" title="Futuros plausíveis" side={<Pill tone="watch">Spread moderado</Pill>} /><div className="ensemble-band"><span className="band-p90" /><span className="band-p50" /><i className="control-line" /></div><div className="ensemble-legend"><span>P10 39</span><span>P50 73</span><span>P90 104 mm</span></div></article>
      <article className="panel climate-signal-card"><PanelHead eyebrow="CLIMATE SIGNAL" title="CS-204 · pronto para publicação" side={<Pill tone="alert">ALTA</Pill>} /><p>Chuva extrema · TUB-NORTH · 19:05–23:00</p><div><span><small>Probabilidade</small><strong>82%</strong></span><span><small>Confiança</small><strong>81%</strong></span><span><small>Materialidade</small><strong>Alta</strong></span></div><button className="climate-primary" onClick={props.onClimateSignal}>Publicar na Torre</button></article>
      <article className="panel climate-agent-mini"><PanelHead eyebrow="AGENTES EM TEMPO REAL" title="Pipeline climático" side={<button onClick={props.onAgents}>Ver central →</button>} />{[["18:41:07","ENSEMBLE","51 membros processados"],["18:41:10","ANOMALY","EFI 0,86 detectado"],["18:41:13","ORCHESTRATOR","Mudança material"],["18:41:15","PUBLISHER","CS-204 validado"]].map(([time,agent,text]) => <div key={time}><span>{time}</span><b>{agent}</b><small>{text}</small></div>)}</article>
    </section>
    <article className="panel climate-table-card"><PanelHead eyebrow="PRIORIDADES METEOROLÓGICAS" title="Condições que exigem acompanhamento" side={<button>Exportar briefing</button>} /><div className="climate-table-wrap"><table><thead><tr><th>Prioridade</th><th>Fenômeno</th><th>Área</th><th>Janela</th><th>Prob.</th><th>Confiança</th><th>Mudança</th><th>Estado</th></tr></thead><tbody><tr><td><Pill tone="critical">Alta</Pill></td><td>Chuva extrema</td><td>TUB-NORTH</td><td>18–23h</td><td>82%</td><td>Alta</td><td className="up">↑ 25 mm</td><td>ClimateSignal</td></tr><tr><td><Pill tone="alert">Alta</Pill></td><td>Raios</td><td>Porto</td><td>19–21h</td><td>74%</td><td>Média</td><td className="up">↑ 18 pp</td><td>Monitorando</td></tr><tr><td><Pill tone="watch">Média</Pill></td><td>Vento costeiro</td><td>Costa</td><td>21–02h</td><td>61%</td><td>Média</td><td>→ estável</td><td>Forecast</td></tr></tbody></table></div></article>
  </div>;
}

function Observations(props: Props) {
  const [selected, setSelected] = useState("MET-07");
  const [degraded, setDegraded] = useState(false);
  const station = stations.find(item => item.id === selected) ?? stations[0];
  return <div className="climate-view observations-view">
    <section className="observation-summary">{[["Estações online",degraded ? "11/14" : "13/14","92,8%",degraded ? "watch" : "ok"],["Radar",degraded ? "DEGRADED" : "LIVE",degraded ? "15 min sem frame" : "frame 18:36",degraded ? "alert" : "ok"],["Raios · 15 min","148","42/min célula C-028","alert"],["Qualidade média",degraded ? "86/100" : "94/100",degraded ? "fallback ativo" : "QA aprovado","info"]].map(([label,value,note,tone]) => <article className="panel" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small><Pill tone={tone as Tone}>{tone === "ok" ? "CURRENT" : tone === "alert" ? "ATENÇÃO" : "MONITOR"}</Pill></article>)}</section>
    <section className="observation-grid">
      <article className="panel observation-map"><PanelHead eyebrow="OBSERVED · NÃO É FORECAST" title="Rede meteorológica e sensoriamento" side={<Pill tone={degraded ? "alert" : "ok"}>{degraded ? "FALLBACK" : "LIVE"}</Pill>} /><WeatherMap props={props} variable="Radar" hour={18} /><div className="station-overlay">{stations.slice(0,4).map((item,index) => <button style={{ left: `${24 + index * 14}%`, top: `${35 + (index % 2) * 18}%` }} className={selected === item.id ? "active" : ""} key={item.id} onClick={() => setSelected(item.id)}>{item.id}<small>{item.rain}</small></button>)}</div></article>
      <article className="panel station-inspector"><PanelHead eyebrow="ESTAÇÃO SELECIONADA" title={`${station.id} · ${station.area}`} side={<Pill tone={station.quality < 80 ? "alert" : "ok"}>{station.state}</Pill>} /><div className="station-reading-grid"><div><span>Chuva</span><strong>{station.rain}</strong></div><div><span>Vento</span><strong>{station.wind}</strong></div><div><span>Rajada</span><strong>{station.gust}</strong></div><div><span>Temperatura</span><strong>{station.temp}</strong></div></div><div className="quality-score"><span>QUALITY SCORE</span><strong>{degraded ? 72 : station.quality}<small>/100</small></strong><i><b style={{ width: `${degraded ? 72 : station.quality}%` }} /></i></div><dl className="quality-checks">{[["Completude",degraded ? "88%" : "100%"],["Latência",degraded ? "15 min" : "4,2 s"],["Range check","OK"],["Consistência espacial",degraded ? "Falha" : "OK"],["Redundância",degraded ? "MET-04" : "Concordante"],["Calibração","Válida"]].map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></article>
    </section>
    <section className="observation-bottom">
      <article className="panel divergence-card"><PanelHead eyebrow="GUARDIÃO METEOROLÓGICO" title="Sensor divergente detectado" side={<Pill tone="alert">INCONSISTÊNCIA ALTA</Pill>} /><div className="sensor-compare"><div><span>MET-03 · vento</span><strong>41 km/h</strong></div><b>↔<small>420 m</small></b><div><span>MET-04 · vento</span><strong>16 km/h</strong></div></div><p>A diferença excede a tolerância espacial. A análise utilizará MET-04, BOIA-02 e radar de vento como redundância.</p><button className="climate-primary" onClick={() => { setDegraded(true); setSelected("MET-03"); props.onToast("Guardião ativado · radar degradado · confiança reduzida de 84% para 68%"); }}>Analisar e aplicar fallback</button></article>
      <article className="panel climate-table-card station-table"><PanelHead eyebrow="OBSERVATION INVENTORY" title="Leituras atuais" /><div className="climate-table-wrap"><table><thead><tr><th>ID</th><th>Área</th><th>Chuva</th><th>Vento</th><th>Rajada</th><th>Temp.</th><th>QA</th><th>Estado</th></tr></thead><tbody>{stations.map(item => <tr className={selected === item.id ? "selected" : ""} key={item.id} onClick={() => setSelected(item.id)}><td><strong>{item.id}</strong></td><td>{item.area}</td><td>{item.rain}</td><td>{item.wind}</td><td>{item.gust}</td><td>{item.temp}</td><td>{item.quality}</td><td><Pill tone={item.quality < 80 ? "alert" : "ok"}>{item.state}</Pill></td></tr>)}</tbody></table></div></article>
    </section>
  </div>;
}

function Nowcasting(props: Props) {
  const [signalForm, setSignalForm] = useState(false);
  return <div className="climate-view nowcast-view">
    <article className="panel nowcast-hero"><div><span>NOWCAST · 0–6 HORAS</span><h2>Célula convectiva C-028</h2><p>Detectada por radar, GLM, estações e modelo de alta resolução.</p></div><div className="eta-block"><span>ETA TUBARÃO</span><strong>41 min</strong><small>±12 min · confiança 84%</small></div><Pill tone="critical">SEVERIDADE ALTA</Pill></article>
    <section className="nowcast-grid">
      <article className="panel nowcast-map"><PanelHead eyebrow="TRAJETÓRIA OBSERVADA + PREVISTA" title="C-028 · deslocamento SE · 34 km/h" side={<button onClick={() => props.onToast("Cone de incerteza recalculado: ±12 km")}>Recalcular ETA</button>} /><WeatherMap props={props} variable="Radar" hour={19} /><div className="nowcast-metrics">{[["Raios/min","42"],["Chuva máx.","67 mm/h"],["Rajada","74 km/h"],["Crescimento","+18% / 10 min"]].map(([key,value]) => <div key={key}><span>{key}</span><strong>{value}</strong></div>)}</div></article>
      <aside className="nowcast-side"><article className="panel nowcast-evolution"><PanelHead eyebrow="EVOLUÇÃO" title="Rastreamento em tempo real" />{[["18:10","Detectada","Radar"],["18:22","Crescimento","+14 dBZ"],["18:34","Raios ↑","42/min"],["19:05","Entrada geofence","TUB-NORTH"],["21:20","Saída provável","Costa"]].map(([time,title,note],index) => <div className={index < 3 ? "done" : index === 3 ? "current" : ""} key={time}><span>{index < 3 ? "✓" : index + 1}</span><p><strong>{time} · {title}</strong><small>{note}</small></p></div>)}</article><article className="panel nowcast-agent"><PanelHead eyebrow="AGENTE NOWCAST" title="Interpretação" side={<Pill tone="info">AUTOMÁTICO</Pill>} /><p>A célula mantém organização e deslocamento consistente. A intensificação dos raios precede o aumento esperado da chuva nos setores norte.</p><dl><div><dt>Radar</dt><dd>crescendo</dd></div><div><dt>Modelo</dt><dd>concordante</dd></div><div><dt>Posição</dt><dd>±12 km</dd></div></dl><button onClick={() => setSignalForm(true)} className="climate-primary">Criar ClimateSignal</button></article></aside>
    </section>
    <article className="panel climate-signal-object"><PanelHead eyebrow="OBJETO INTEROPERÁVEL" title="ClimateSignal CS-204" side={<Pill tone="watch">DRAFT</Pill>} /><div className="signal-code"><span>type</span><b>convective_storm</b><span>validity</span><b>19:05–21:20</b><span>area</span><b>TUB-NORTH</b><span>probability</span><b>0.84</b><span>rain / gust</span><b>67 mm/h · 74 km/h</b><span>confidence</span><b>0.81</b></div><div className="signal-flow"><span>M2 · Climate</span><b>→</b><span>Event Bus</span><b>→</b><span>M1 · Torre</span><b>→</b><span>M3 · Perigos</span></div></article>
    {signalForm ? <form className="panel climate-inline-form" onSubmit={event => { event.preventDefault(); setSignalForm(false); props.onClimateSignal(); }}><PanelHead eyebrow="FORMULÁRIO CONTROLADO" title="Publicar ClimateSignal" side={<button type="button" onClick={() => setSignalForm(false)}>×</button>} /><div><label>Tipo<select><option>Chuva</option><option>Vento</option><option>Raios</option></select></label><label>Área<select><option>TUB-NORTH</option><option>ZONE-MET-03 · Porto</option></select></label><label>Início<input type="datetime-local" defaultValue="2026-08-07T19:05" /></label><label>Fim<input type="datetime-local" defaultValue="2026-08-07T21:20" /></label><label>Probabilidade<input type="number" defaultValue="84" /></label><label>Confiança<input type="number" defaultValue="81" /></label><label>Materialidade<select><option>Alta</option><option>Média</option><option>Baixa</option></select></label><label>Fonte<input defaultValue="FR-2204 · Radar · GLM" /></label><label className="wide">Observação técnica<textarea defaultValue="Célula convectiva organizada, trajetória provável sobre TUB-NORTH." /></label></div><footer><label><input type="checkbox" defaultChecked /> Enviar para Torre</label><button className="climate-primary" type="submit">Validar e publicar</button></footer></form> : null}
  </div>;
}

function Forecast(props: Props) {
  const [model, setModel] = useState("ECMWF ENS");
  const [run, setRun] = useState("12Z · FR-2204");
  const [variable, setVariable] = useState("Precipitação");
  const [zone, setZone] = useState("TUB-NORTH");
  const [hour, setHour] = useState(21);
  return <div className="climate-view forecast-view">
    <article className="panel climate-config-bar"><label>Modelo<select value={model} onChange={event => setModel(event.target.value)}><option>ECMWF ENS</option><option>WRF-TUB v4.2</option><option>ICON Global</option><option>GFS</option></select></label><label>Rodada<select value={run} onChange={event => setRun(event.target.value)}><option>12Z · FR-2204</option><option>00Z · FR-2201</option></select></label><label>Variável<select value={variable} onChange={event => setVariable(event.target.value)}><option>Precipitação</option><option>Vento</option><option>Temperatura</option><option>CAPE</option><option>Ondas</option></select></label><label>Área<select value={zone} onChange={event => setZone(event.target.value)}>{["TUB-NORTH","ZONE-MET-01 · Usinas","ZONE-MET-02 · Pátios","ZONE-MET-03 · Porto","ZONE-MET-07 · Costa"].map(item => <option key={item}>{item}</option>)}</select></label><label>Horizonte<select value={props.horizon} onChange={event => props.onHorizon(event.target.value)}><option>+24H</option><option>+72H</option><option>7D</option><option>15D</option></select></label><button onClick={() => props.onToast("Configuração FR-2204 salva como visão operacional")}>Salvar visão</button></article>
    <section className="forecast-main-grid"><article className="panel forecast-map"><PanelHead eyebrow="FORECAST FIELD · BIAS CORRECTED" title={`${variable} · ${zone} · ${hour}:00`} side={<Pill tone="info">{model}</Pill>} /><WeatherMap props={props} variable={variable} hour={hour} /><div className="forecast-time"><span>18h</span><input type="range" min="18" max="72" value={hour} onChange={event => setHour(Number(event.target.value))} /><strong>+{hour}h</strong><span>+72h</span></div></article><aside className="panel forecast-probability"><PanelHead eyebrow="PROBABILIDADE" title="Excedência · chuva 24h" /><div className="probability-gauge"><strong>76%</strong><span>&gt; 50 mm</span><i><b style={{ width: "76%" }} /></i></div><div className="probability-gauge critical"><strong>18%</strong><span>&gt; 100 mm</span><i><b style={{ width: "18%" }} /></i></div><dl><div><dt>P10</dt><dd>39 mm</dd></div><div><dt>P50</dt><dd>73 mm</dd></div><div><dt>P90</dt><dd>104 mm</dd></div><div><dt>Trust</dt><dd>82/100</dd></div></dl><button className="climate-primary" onClick={props.onHazards}>Modelar impacto</button></aside></section>
    <article className="panel meteogram-card"><PanelHead eyebrow="METEOGRAMA OPERACIONAL" title={`${zone} · 0–72h`} side={<div className="meteogram-toggle"><button className="active">P50</button><button>P90</button><button>OBS</button></div>} /><div className="meteogram-row"><span>Precipitação<small>mm/h</small></span><div className="meteogram-bars rain">{forecastBars.map((value,index) => <i key={index} style={{ height: `${value}%` }}><b>{index % 6 === 0 ? `${index}h` : ""}</b></i>)}</div></div><div className="meteogram-row"><span>Temperatura<small>°C</small></span><div className="temperature-line">{temperatureBars.map((value,index) => <i key={index} style={{ height: `${(value - 24) * 7}%` }}><b>{index % 6 === 0 ? value : ""}</b></i>)}</div></div><div className="meteogram-row wind"><span>Vento<small>km/h</small></span><div>{["→","→","↘","↘","↓","↓","↙","↙","←","←","↖","↑"].map((arrow,index) => <i key={index}>{arrow}<small>{22 + index * 3}</small></i>)}</div></div></article>
  </div>;
}

function Ensemble(props: Props) {
  const [mode, setMode] = useState("Agregado");
  return <div className="climate-view ensemble-view">
    <section className="ensemble-top"><article className="panel ensemble-plume-card"><PanelHead eyebrow="ECMWF ENS · 51 MEMBROS" title="Pluma de precipitação acumulada · TUB-NORTH" side={<div className="meteogram-toggle">{["Agregado","Membros","Clusters"].map(item => <button className={mode === item ? "active" : ""} onClick={() => setMode(item)} key={item}>{item}</button>)}</div>} /><div className={`ensemble-plume ${mode.toLowerCase()}`}><div className="plume-grid"><span>120</span><span>80</span><span>40</span><span>0</span></div><i className="plume-p10-p90" /><i className="plume-p25-p75" /><i className="plume-median" /><i className="plume-control" />{mode === "Membros" ? Array.from({length:18}).map((_,index) => <i className="plume-member" style={{ transform: `rotate(${index % 2 ? -2-index*.05 : 2+index*.04}deg)`, opacity: .12 + index*.01 }} key={index} />) : null}<div className="plume-axis"><span>+6</span><span>+12</span><span>+24</span><span>+36</span><span>+48</span><span>+72h</span></div></div><div className="plume-legend"><span><i className="p1090" />P10–P90</span><span><i className="p2575" />P25–P75</span><span><i className="median" />Mediana</span><span><i className="control" />Controle</span></div></article><aside className="panel spread-card"><PanelHead eyebrow="FORECAST UNCERTAINTY" title="Spread" side={<Pill tone="watch">MODERADO</Pill>} /><strong className="spread-value">0,42</strong><p>Concordância aumentou 11% na rodada 12Z, mas 18% dos membros ainda ultrapassam 100 mm.</p><div className="cluster-list"><div><span>Cluster A</span><i><b style={{width:"51%"}} /></i><strong>51% · 70–85 mm</strong></div><div><span>Cluster B</span><i><b style={{width:"31%"}} /></i><strong>31% · 50–69 mm</strong></div><div><span>Cauda crítica</span><i><b style={{width:"18%"}} /></i><strong>18% · &gt;100 mm</strong></div></div></aside></section>
    <section className="ensemble-bottom"><article className="panel distribution-card"><PanelHead eyebrow="DISTRIBUIÇÃO PROBABILÍSTICA" title="Chuva acumulada · 24h" /><div className="histogram">{[["0–25",7],["25–50",17],["50–75",31],["75–100",27],[">100",18]].map(([label,value]) => <div key={label}><strong>{value}%</strong><i style={{height:`${Number(value)*2.2}%`}} /><span>{label} mm</span></div>)}</div></article><article className="panel ensemble-agent-card"><PanelHead eyebrow="AGENTE ENSEMBLE" title="Cenário minoritário relevante" side={<Pill tone="info">EXPLICÁVEL</Pill>} /><p>Embora a mediana indique 73 mm, nove membros apresentam acumulado superior a 100 mm. Esse ramo merece análise por ultrapassar limiares relevantes para drenagem.</p><dl><div><dt>Membros</dt><dd>51</dd></div><div><dt>Cauda</dt><dd>9 membros</dd></div><div><dt>Run anterior</dt><dd>5 membros</dd></div><div><dt>Materialidade</dt><dd>Alta</dd></div></dl><div className="climate-action-row"><button onClick={() => props.onToast("Comparação de clusters 00Z × 12Z aberta")}>Comparar runs</button><button onClick={props.onClimateSignal}>Publicar probabilidade</button></div></article></section>
  </div>;
}

function Extremes(props: Props) {
  return <div className="climate-view extremes-view"><section className="extreme-hero-grid">{[["Precipitação","0,86","1,20","EXTREMO","critical"],["Rajada","0,71","0,84","ANÔMALO","alert"],["Temperatura","0,67","0,55","ELEVADO","watch"]].map(([variable,efi,sot,label,tone]) => <article className={`panel extreme-score tone-${tone}`} key={variable}><span>{variable}</span><div><strong>EFI {efi}</strong><b>SOT {sot}</b></div><Pill tone={tone as Tone}>{label}</Pill><Spark values={[18,22,25,31,43,58,76,92]} tone={tone as Tone} /></article>)}</section><section className="extreme-main-grid"><article className="panel extreme-map"><PanelHead eyebrow="EXTREME FORECAST INDEX" title="Anomalia em relação ao clima do modelo" side={<Pill tone="critical">EFI 0,86</Pill>} /><WeatherMap props={props} variable="Extremo" hour={21} /><div className="efi-scale"><span>−1</span><i /><strong>0</strong><i /><span>+1</span></div></article><aside className="extreme-explain"><article className="panel model-climate-card"><PanelHead eyebrow="DISTINÇÃO CIENTÍFICA" title="Normal observada ≠ M-climate" /><div><span>Normal observacional</span><strong>1991–2020</strong><small>Estações + ERA5 · clima real observado</small></div><div><span>Model Climate</span><strong>Reforecasts ECMWF</strong><small>Específico de local, época e lead time</small></div><p>O EFI compara a previsão com o clima do próprio modelo. É guidance especializado, não uma ordem automática.</p></article><article className="panel sot-card"><PanelHead eyebrow="SHIFT OF TAILS" title="Cauda extrema" /><strong>1,20</strong><p>Membros avançam além do M-climate, indicando evento extremo possível.</p><button onClick={() => props.onToast("Incerteza EFI/SOT: cauda representada por 9 de 51 membros")}>Ver incerteza</button></article></aside></section><article className="panel extreme-matrix"><PanelHead eyebrow="EXTREMOS POR HORIZONTE" title="Guidance operacional" /><div className="extreme-matrix-grid"><span /><b>+6h</b><b>+12h</b><b>+24h</b><b>+48h</b>{["Chuva","Vento","Calor","Raios"].flatMap((label,row) => [<strong key={`${label}-l`}>{label}</strong>,...[0,1,2,3].map(col => <i className={`level-${Math.min(3,Math.max(0,(row+col+props.scenarioStep)%4))}`} key={`${label}-${col}`}>{["Normal","Atenção","Anômalo","Extremo"][Math.min(3,Math.max(0,(row+col+props.scenarioStep)%4))]}</i>)])}</div></article></div>;
}

function Subseasonal(props: Props) {
  const weeks = [["SEMANA 1","Acima normal",62,"alert"],["SEMANA 2","Acima normal",71,"critical"],["SEMANA 3","Normal",52,"info"],["SEMANA 4","Abaixo normal",58,"watch"],["SEMANA 5","Normal",46,"info"],["SEMANA 6","Acima normal",54,"watch"]];
  return <div className="climate-view subseasonal-view"><article className="panel horizon-warning"><span>2–6 SEMANAS</span><strong>Regime e probabilidade, não previsão horária</strong><p>Produtos calibrados com hindcasts e combinação multi-modelo.</p><Pill tone="info">Atualizado 01 AGO</Pill></article><section className="week-grid">{weeks.map(([week,label,value,tone]) => <article className="panel week-card" key={week as string}><span>{week}</span><strong>{label}</strong><div className="ternary-prob"><i className="below" style={{width:`${Math.max(12,100-Number(value)-22)}%`}} /><i className="normal" style={{width:"22%"}} /><i className="above" style={{width:`${value}%`}} /></div><b>{value}%</b><small>Confiança {Number(value)>60?"moderada":"baixa"}</small></article>)}</section><section className="subseasonal-bottom"><article className="panel subseasonal-map"><PanelHead eyebrow="MULTI-MODEL · WEEK 2" title="Precipitação acima do normal" side={<Pill tone="watch">71%</Pill>} /><WeatherMap props={props} variable="Anomalia" hour={2} /></article><article className="panel planning-apps"><PanelHead eyebrow="APLICAÇÕES" title="Horizonte de planejamento" />{[["Manutenção","Reprogramar janelas externas","Alta"],["Logística","Ajustar buffers ferroviários","Média"],["Porto","Revisar janela de navios","Média"],["HSE","Preparar campanha de calor/raios","Alta"],["Recursos","Antecipar bombas e inspeções","Alta"]].map(([area,action,priority]) => <div key={area}><span>{area}</span><strong>{action}</strong><Pill tone={priority==="Alta"?"watch":"info"}>{priority}</Pill></div>)}</article></section></div>;
}

function Seasonal(props: Props) {
  const [model,setModel] = useState("MULTI-MODEL");
  const [bias,setBias] = useState("LOCAL CALIBRATED");
  return <div className="climate-view seasonal-view"><article className="panel seasonal-controls"><div><span>MODELO</span>{["ECMWF","CPTEC","UKMO","NOAA","MULTI-MODEL"].map(item => <button className={model===item?"active":""} onClick={()=>setModel(item)} key={item}>{item}</button>)}</div><div><span>PROCESSAMENTO</span>{["RAW MODEL","CORRECTED","LOCAL CALIBRATED"].map(item => <button className={bias===item?"active":""} onClick={()=>setBias(item)} key={item}>{item}</button>)}</div></article><section className="seasonal-grid">{[["AGO",19,44,37],["SET",16,28,56],["OUT",14,25,61],["NOV",22,39,39],["DEZ",24,42,34],["JAN",18,37,45]].map(([month,below,normal,above]) => <article className="panel seasonal-month" key={month}><span>{month}</span><div className="seasonal-bars"><i className="below" style={{height:`${Number(below)}%`}}><b>{below}%</b></i><i className="normal" style={{height:`${Number(normal)}%`}}><b>{normal}%</b></i><i className="above" style={{height:`${Number(above)}%`}}><b>{above}%</b></i></div><footer><span>Abaixo</span><span>Normal</span><span>Acima</span></footer></article>)}</section><section className="seasonal-bottom"><article className="panel seasonal-map"><PanelHead eyebrow={`${model} · ${bias}`} title="Outlook trimestral · SON" side={<Pill tone="watch">Skill 0,61</Pill>} /><WeatherMap props={props} variable="Seasonal" hour={3} /></article><article className="panel seasonal-consensus"><PanelHead eyebrow="CONSENSO MULTI-MODELO" title="Precipitação" /><div className="consensus-ring"><strong>61%</strong><span>acima do normal</span></div><dl><div><dt>Concordância</dt><dd>4 de 5 modelos</dd></div><div><dt>Calibração</dt><dd>ERA5 + estações</dd></div><div><dt>Hindcast skill</dt><dd>Bom</dd></div><div><dt>Confiança</dt><dd>Moderada</dd></div></dl><p>Interpretação probabilística mensal. Não utilizar para data ou volume diário específico.</p></article></section></div>;
}

function Drivers(props: Props) {
  const [selected,setSelected] = useState("ENSO");
  const drivers = [["ENSO","El Niño forte","Alta","67%"],["Atlântico Sul","SST +0,8 °C","Alta","74%"],["MJO","Fase 8","Média","58%"],["SAM","Negativo","Baixa","42%"],["ZCAS","Favorável","Média","63%"],["SST costeira","+1,1 °C","Média","71%"]];
  return <div className="climate-view drivers-view"><section className="driver-grid">{drivers.map(([name,state,importance,agreement]) => <button className={`panel driver-card ${selected===name?"selected":""}`} onClick={()=>setSelected(name)} key={name}><span>{name}</span><strong>{state}</strong><small>Importância {importance}</small><b>Concordância {agreement}</b></button>)}</section><section className="drivers-main"><article className="panel enso-card"><PanelHead eyebrow="PACÍFICO EQUATORIAL" title="ENSO · El Niño muito forte" side={<Pill tone="alert">IMPORTÂNCIA ALTA</Pill>} /><div className="enso-index"><span>Índice observado</span><strong>+2,1 °C</strong><b>↘ enfraquecendo</b></div><div className="enso-probs"><div><span>El Niño</span><i><b style={{width:"78%"}} /></i><strong>78%</strong></div><div><span>Neutro</span><i><b style={{width:"19%"}} /></i><strong>19%</strong></div><div><span>La Niña</span><i><b style={{width:"3%"}} /></i><strong>3%</strong></div></div></article><article className="panel teleconnection-card"><PanelHead eyebrow="AGENTE DE DRIVERS" title="Teleconexão global → local" /><div className="teleconnection-flow">{["ENSO","Circulação","Prob. regional","Downscaling","Tubarão"].map((item,index)=><div key={item}><span>{index+1}</span><strong>{item}</strong>{index<4?<b>→</b>:null}</div>)}</div><p>O fortalecimento do Pacífico aumenta o contexto de risco, mas o sinal sobre Tubarão permanece condicionado pelo Atlântico e pela circulação regional.</p><button className="climate-primary" onClick={()=>props.onToast(`Teleconexão ${selected} analisada · influência local moderada`)}>Analisar teleconexão</button></article></section></div>;
}

function Climatology() {
  const [variable,setVariable] = useState("Chuva");
  const months=["J","F","M","A","M","J","J","A","S","O","N","D"];
  return <div className="climate-view climatology-view"><article className="panel climatology-head"><div><span>REFERÊNCIA OBSERVACIONAL</span><h2>Normal Climatológica 1991–2020</h2><p>Estações locais + ERA5 · período padrão de 30 anos</p></div><div>{["Chuva","Temperatura","Vento","Ondas"].map(item=><button className={variable===item?"active":""} onClick={()=>setVariable(item)} key={item}>{item}</button>)}</div></article><section className="climatology-main"><article className="panel climate-calendar"><PanelHead eyebrow="CALENDÁRIO CLIMÁTICO" title="Regimes mensais · Tubarão" /><div className="calendar-grid"><span />{months.map(m=><b key={m}>{m}</b>)}{[["CHUVA",3,3,3,2,1,1,1,1,2,3,3,3],["CALOR",3,3,3,2,1,1,1,1,1,2,3,3],["VENTO",1,1,1,1,2,2,3,3,3,3,2,1],["RAIOS",3,3,2,1,1,1,1,1,1,2,3,3]].flatMap(row=>[<strong key={`${row[0]}-l`}>{row[0]}</strong>,...row.slice(1).map((v,i)=><i className={`cal-${v}`} key={`${row[0]}-${i}`} />)])}</div></article><article className="panel percentile-card"><PanelHead eyebrow="PERCENTIS" title={`${variable} · agosto`} /><div className="percentile-stack">{[["P10","28 mm",18],["Mediana","67 mm",42],["P90","118 mm",72],["P95","142 mm",86],["P99","192 mm",100]].map(([label,value,width])=><div key={label as string}><span>{label}</span><i><b style={{width:`${width}%`}} /></i><strong>{value}</strong></div>)}</div><p>Percentil contextualiza o valor; não substitui a modelagem física de perigo.</p></article></section><article className="panel normal-curve"><PanelHead eyebrow="CURVA CLIMATOLÓGICA" title="Chuva mensal · média, mediana e faixa P10–P90" /><div className="normal-chart"><div className="normal-band" /><div className="normal-median" /><div className="normal-current" /><div className="normal-axis">{months.map(m=><span key={m}>{m}</span>)}</div></div></article></div>;
}

function Anomalies(props: Props) {
  const [mode,setMode]=useState("Forecast");
  return <div className="climate-view anomaly-view"><section className="anomaly-cards">{[["Chuva · agosto","142 mm","Normal 82 mm","+73% · P94","critical"],["Temperatura máx.","37,4 °C","Normal 32,2 °C","+5,2 °C · P97","alert"],["Vento costeiro","61 km/h","Normal 38 km/h","+61% · P91","watch"],["Nível costeiro","+0,42 m","Normal +0,08 m","+0,34 m · P89","watch"]].map(([label,value,normal,delta,tone])=><article className={`panel anomaly-card tone-${tone}`} key={label}><span>{label}</span><strong>{value}</strong><small>{normal}</small><b>{delta}</b></article>)}</section><article className="panel anomaly-compare"><PanelHead eyebrow="COMPARISON MODE" title="Normal × anomalia" side={<div className="meteogram-toggle">{["Observado","Forecast","Seasonal","CMIP6"].map(item=><button className={mode===item?"active":""} onClick={()=>setMode(item)} key={item}>{item}</button>)}</div>} /><div className="split-weather-map"><div><span>NORMAL 1991–2020</span><WeatherMap props={props} variable="Normal" hour={21} /></div><div><span>{mode.toUpperCase()} · ANOMALIA</span><WeatherMap props={props} variable="Anomalia" hour={21} /></div><i className="split-handle">◀▶</i></div></article><section className="anomaly-bottom"><article className="panel anomaly-types"><PanelHead eyebrow="MÉTODOS" title="Quatro leituras da mesma condição" />{[["Absoluta","+60 mm"],["Relativa","+73%"],["Percentil","P94"],["Model climate","EFI 0,86"]].map(([key,value])=><div key={key}><span>{key}</span><strong>{value}</strong></div>)}</article><article className="panel anomaly-agent"><PanelHead eyebrow="AGENTE ANOMALY" title="Interpretação contextual" side={<Pill tone="critical">MATERIAL</Pill>} /><p>O acumulado previsto está no P94 observado e apresenta EFI 0,86 no M-climate. As duas referências concordam em anomalia alta, embora respondam a perguntas diferentes.</p><button onClick={props.onClimateSignal}>Publicar anomalia como sinal</button></article></section></div>;
}

function Projections(props: Props) {
  const [period,setPeriod]=useState("2041–2060"); const [ssp,setSsp]=useState("SSP2-4.5"); const [variable,setVariable]=useState("Temperatura máxima");
  return <div className="climate-view projections-view"><article className="panel projection-controls"><label>Baseline<select><option>1991–2020</option></select></label><label>Futuro<select value={period} onChange={e=>setPeriod(e.target.value)}><option>2031–2050</option><option>2041–2060</option><option>2081–2100</option></select></label><label>Cenário<select value={ssp} onChange={e=>setSsp(e.target.value)}><option>SSP1-2.6</option><option>SSP2-4.5</option><option>SSP3-7.0</option><option>SSP5-8.5</option></select></label><label>Variável<select value={variable} onChange={e=>setVariable(e.target.value)}><option>Temperatura máxima</option><option>Precipitação intensa</option><option>Dias secos consecutivos</option><option>Nível do mar</option></select></label><label>Ensemble<select><option>18 modelos · mediana</option><option>P25</option><option>P75</option></select></label></article><article className="panel projection-compare"><PanelHead eyebrow="CMIP6 · FUTUROS PLAUSÍVEIS" title={`${variable} · ${ssp}`} side={<Pill tone="info">PROJECTION · não é forecast</Pill>} /><div className="projection-maps"><div><span>PRESENTE · 1991–2020</span><WeatherMap props={props} variable="Normal" hour={20} /></div><div><span>FUTURO · {period}</span><WeatherMap props={props} variable="Calor" hour={50} /></div></div></article><section className="projection-bottom"><article className="panel projection-stats"><PanelHead eyebrow="ENSEMBLE CLIMÁTICO" title="18 modelos" /><div><span>Mediana</span><strong>+2,1 °C</strong></div><div><span>P25</span><strong>+1,7 °C</strong></div><div><span>P75</span><strong>+2,8 °C</strong></div><div><span>Concordância</span><strong>83%</strong></div></article><article className="panel downscaling-card"><PanelHead eyebrow="LINHAGEM CIENTÍFICA" title="Downscaling e contexto local" /><div className="projection-flow">{["CMIP6","Modelo regional","Dinâmico","Bias correction","Tubarão","Perigos"].map((item,index)=><span key={item}>{item}{index<5?<b>→</b>:null}</span>)}</div><p>O módulo entrega mudanças físicas e incerteza. Exposição, perigo e risco financeiro permanecem nos módulos especializados.</p></article></section></div>;
}

function Verification() {
  const [threshold,setThreshold]=useState("Chuva >50 mm");
  return <div className="climate-view verification-view"><section className="skill-cards">{[["PRECIPITAÇÃO 24H","82/100","Bias +4,2%","POD 0,81","ok"],["RAJADA 6H","76/100","RMSE 7,4","FAR 0,19","info"],["TEMPERATURA MÁX.","89/100","MAE 1,2 °C","POD 0,88","ok"],["RAIOS 2H","71/100","Brier 0,18","AUC 0,79","watch"]].map(([label,score,a,b,tone])=><article className="panel skill-card" key={label}><span>{label}</span><strong>{score}</strong><Pill tone={tone as Tone}>{Number((score as string).split("/")[0])>80?"BOM":"MODERADO"}</Pill><small>{a}</small><small>{b}</small></article>)}</section><section className="verification-main"><article className="panel reliability-card"><PanelHead eyebrow="FORECAST PERFORMANCE · 90 DIAS" title="Confiabilidade probabilística" side={<select value={threshold} onChange={e=>setThreshold(e.target.value)}><option>Chuva &gt;50 mm</option><option>Vento &gt;60 km/h</option><option>Temperatura &gt;35 °C</option></select>} /><div className="reliability-chart"><i className="perfect-line" /><i className="model-line" /><div className="reliability-points">{[18,29,41,57,66,79,86].map((v,i)=><b style={{left:`${10+i*13}%`,bottom:`${v}%`}} key={v} />)}</div><span className="axis-y">Frequência observada</span><span className="axis-x">Probabilidade prevista</span></div></article><article className="panel trust-score"><PanelHead eyebrow="FORECAST TRUST SCORE" title={threshold} /><strong>82<small>/100</small></strong>{[["Skill histórico",84],["Spread",78],["Concordância",81],["Observações",94],["Lead time",88],["Consistência",76]].map(([label,value])=><div key={label as string}><span>{label}</span><i><b style={{width:`${value}%`}} /></i><em>{value}</em></div>)}</article></section><article className="panel ranking-table climate-table-card"><PanelHead eyebrow="MODEL RANKING" title="Desempenho condicionado por evento" /><div className="climate-table-wrap"><table><thead><tr><th>#</th><th>Modelo</th><th>Versão</th><th>Evento</th><th>Bias</th><th>CRPS</th><th>POD</th><th>FAR</th><th>Trust</th></tr></thead><tbody>{[[1,"WRF-TUB","v4.2","Chuva >50","+3,8%","0,14","0,84","0,15","86"],[2,"ECMWF ENS","IFS 49r1","Chuva >50","+4,2%","0,16","0,81","0,17","82"],[3,"ICON","2026.3","Chuva >50","−6,1%","0,22","0,73","0,21","75"],[4,"GFS","v16","Chuva >50","−8,4%","0,25","0,69","0,24","71"]].map(row=><tr key={String(row[0])}>{row.map((value,index)=><td key={index}>{index===1?<strong>{value}</strong>:value}</td>)}</tr>)}</tbody></table></div></article></div>;
}

function Runs(props: Props) {
  const [selected,setSelected]=useState("FR-2204"); const run=runs.find(item=>item.id===selected)??runs[0];
  return <div className="climate-view runs-view"><section className="runs-grid"><article className="panel climate-table-card runs-table"><PanelHead eyebrow="FORECAST RUN CATALOG" title="Rodadas disponíveis" side={<button onClick={()=>props.onToast("Solicitação de rerun WRF-TUB v4.2 registrada")}>＋ Solicitar rerun</button>} /><div className="climate-table-wrap"><table><thead><tr><th>Run</th><th>Modelo</th><th>Base</th><th>Horizonte</th><th>Membros</th><th>QA</th><th>Status</th></tr></thead><tbody>{runs.map(item=><tr className={selected===item.id?"selected":""} onClick={()=>setSelected(item.id)} key={item.id}><td><strong>{item.id}</strong></td><td>{item.model}</td><td>{item.base}</td><td>{item.horizon}</td><td>{item.members}</td><td>{item.qa}</td><td><Pill tone={item.status==="PUBLICADO"?"ok":item.status==="SUPERADO"?"watch":"info"}>{item.status}</Pill></td></tr>)}</tbody></table></div></article><aside className="panel run-detail"><PanelHead eyebrow="FORECAST RUN" title={run.id} side={<Pill tone="ok">{run.status}</Pill>} /><h3>{run.model}</h3><dl><div><dt>Base</dt><dd>07/08/2026 · {run.base}</dd></div><div><dt>Ingestão</dt><dd>15:44 BRT</dd></div><div><dt>Membros</dt><dd>{run.members}</dd></div><div><dt>Horizonte</dt><dd>{run.horizon}</dd></div><div><dt>Domínio</dt><dd>Global + subset Tubarão</dd></div><div><dt>Bias correction</dt><dd>QDM Local v2.3</dd></div><div><dt>Owner</dt><dd>Climate Factory</dd></div></dl><button onClick={()=>props.onToast(`Data lineage ${run.id} aberta`)}>Ver metadados completos</button></aside></section><article className="panel run-lineage"><PanelHead eyebrow="DATA LINEAGE" title={`${run.id} · origem ao serviço ArcGIS`} /><div>{["RAW GRIB","INGEST","CONVERT","SUBSET","BIAS CORRECTION","LOCAL ZONES","IMAGE SERVICE","PUBLISH"].map((item,index)=><span className={index<7?"done":"current"} key={item}><i>{index<7?"✓":8}</i><strong>{item}</strong><small>{["ECMWF","15:44","Zarr","ES + oceano","QDM v2.3","7 zonas","ArcGIS","15:52"][index]}</small>{index<7?<b>→</b>:null}</span>)}</div></article><article className="panel run-comparison"><PanelHead eyebrow="WHAT CHANGED?" title="ECMWF 00Z × 12Z" side={<Pill tone="alert">MATERIAL</Pill>} /><div className="run-delta-grid">{[["Chuva +24h","48 mm","73 mm","+25 mm · +52%"],["Pico","23:00","21:00","−2 h"],["Núcleo","Costa","TUB-NORTH","11 km oeste"],["Spread","0,53","0,42","−21%"],["EFI","0,68","0,86","+0,18"],["Confiança","74%","82%","+8 pp"]].map(([metric,oldValue,newValue,delta])=><div key={metric}><span>{metric}</span><small>00Z · {oldValue}</small><strong>12Z · {newValue}</strong><b>{delta}</b></div>)}</div><footer><button onClick={()=>props.onToast("Mapa dividido 00Z | 12Z aberto")}>Comparar no mapa</button><button className="climate-primary" onClick={props.onClimateSignal}>Publicar mudança</button></footer></article></div>;
}

function Briefing(props: Props) {
  const [format,setFormat]=useState("Operacional"); const [published,setPublished]=useState(false);
  return <div className="climate-view briefing-climate-view"><article className="panel briefing-format"><span>FORMATO</span>{["Flash · 30 s","Operacional","Técnico","Executivo"].map(item=><button className={format===item.replace(" · 30 s","")?"active":""} onClick={()=>setFormat(item.replace(" · 30 s",""))} key={item}>{item}</button>)}<b>Gerado 18:41:18 · NIMBUS</b></article><section className="briefing-climate-grid"><article className="panel climate-brief-document"><header><div><span>BOLETIM METEOROLÓGICO · {format.toUpperCase()}</span><h2>Próximas 24 horas · Unidade de Tubarão</h2><p>Validade 07 AGO 18:00 → 08 AGO 18:00 · versão 4</p></div><Pill tone={published?"ok":"watch"}>{published?"PUBLICADO":"EM REVISÃO"}</Pill></header><section><h3>1. Condição principal</h3><p>A nova rodada aumentou a probabilidade de precipitação extrema entre 18h e 23h. O núcleo convectivo está 11 km mais a oeste, aproximando-se de TUB-NORTH.</p></section><div className="briefing-stat-row"><div><span>Prob. &gt;50 mm</span><strong>76%</strong></div><div><span>Prob. &gt;100 mm</span><strong>18%</strong></div><div><span>EFI / SOT</span><strong>0,86 / 1,20</strong></div><div><span>Confiança</span><strong>82%</strong></div></div><section><h3>2. Evolução esperada</h3><p>C-028 cruza a geofence norte por volta de 19:05. O pico de chuva ocorre próximo de 21:00, com rajadas entre 65 e 82 km/h e atividade elétrica elevada.</p></section><section><h3>3. Incerteza</h3><p>A maior fonte de incerteza é a posição do núcleo, estimada em ±12 km. A intensidade provável varia entre 58 e 104 mm no acumulado de 24h.</p></section><section><h3>4. Distribuição recomendada</h3><div className="briefing-distribution"><label><input type="checkbox" defaultChecked /> Torre</label><label><input type="checkbox" defaultChecked /> Operação</label><label><input type="checkbox" defaultChecked /> HSE</label><label><input type="checkbox" defaultChecked /> Planejamento</label></div></section><footer><button onClick={()=>props.onToast("Briefing exportado em PDF com fontes e versões")}>Exportar PDF</button><button onClick={()=>props.onToast("Revisão técnica aberta com comentários")}>Revisar</button><button className="climate-primary" onClick={()=>{setPublished(true);props.onClimateSignal();}}>Aprovar e distribuir</button></footer></article><aside className="briefing-climate-side"><article className="panel briefing-lineage"><PanelHead eyebrow="BASE CIENTÍFICA" title="Fontes e versões" />{[["Forecast","FR-2204 · ECMWF ENS 12Z"],["Local","WRF-TUB v4.2"],["Observado","Radar 18:36 · 13 estações"],["Clima","Normal 1991–2020"],["Extremos","M-climate · EFI/SOT"],["Skill","Verification 90d · 82/100"]].map(([key,value])=><div key={key}><span>{key}</span><strong>{value}</strong></div>)}</article><article className="panel briefing-confidence"><PanelHead eyebrow="POR QUE CONFIAR?" title="Confiança alta · 82%" /><ul><li>Ensemble convergente</li><li>Nova rodada consistente</li><li>Radar disponível</li><li>Bom skill histórico</li><li>Lead time curto</li></ul><button onClick={()=>props.onToast("Trust Score explicado: skill 84 · spread 78 · observações 94")}>Ver cálculo</button></article></aside></section></div>;
}

function Agents(props: Props) {
  return <div className="climate-view climate-agent-center"><article className="panel climate-agent-guardrail"><div><span>AGENTIC METEOROLOGICAL ANALYSIS</span><h2>10 agentes especializados</h2><p>Processam, comparam, explicam e publicam — sem fabricar observação ou emitir ordem operacional.</p></div><div>{["DADOS","QA","CIÊNCIA","PUBLICAÇÃO","HUMANO"].map((item,index)=><span key={item}><b>{index+1}</b>{item}{index<4?<i>→</i>:null}</span>)}</div></article><section className="climate-agent-grid">{climateAgents.map(([name,role,state,control],index)=><article className="panel climate-agent-card" key={name}><header><span>AI</span><div><small>AGENTE {String(index+1).padStart(2,"0")}</small><h3>{name}</h3></div><Pill tone={index===1?"alert":index===9?"watch":index<5?"info":"ok"}>{index===1?"ATENÇÃO":index===9?"AGUARDANDO":"ATIVO"}</Pill></header><p>{role}</p><dl><div><dt>Agora</dt><dd>{state}</dd></div><div><dt>Guardrail</dt><dd>{control}</dd></div></dl><footer><button onClick={()=>props.onToast(`${name}: raciocínio e fontes abertos`)}>Raciocínio</button><button onClick={()=>props.onToast(`${name}: execução pausada para revisão`) }>Pausar</button></footer></article>)}</section></div>;
}

export function ClimateModule(props: Props) {
  const view = useMemo(() => {
    if (props.subview === "Observações") return <Observations {...props} />;
    if (props.subview === "Nowcasting") return <Nowcasting {...props} />;
    if (props.subview === "Forecast 0–72h") return <Forecast {...props} />;
    if (props.subview === "Ensemble") return <Ensemble {...props} />;
    if (props.subview === "Extremos") return <Extremes {...props} />;
    if (props.subview === "Subseasonal") return <Subseasonal {...props} />;
    if (props.subview === "Seasonal") return <Seasonal {...props} />;
    if (props.subview === "Drivers Climáticos") return <Drivers {...props} />;
    if (props.subview === "Climatologia") return <Climatology />;
    if (props.subview === "Anomalias") return <Anomalies {...props} />;
    if (props.subview === "Projeções") return <Projections {...props} />;
    if (props.subview === "Verificação") return <Verification />;
    if (props.subview === "Rodadas") return <Runs {...props} />;
    if (props.subview === "Briefing") return <Briefing {...props} />;
    if (props.subview === "Agentes") return <Agents {...props} />;
    return <Overview {...props} />;
  }, [props]);
  return view;
}
