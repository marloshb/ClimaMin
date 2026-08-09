"use client";

import { useMemo, useState, type ReactNode } from "react";

type Tone = "ok" | "watch" | "alert" | "critical" | "info";
type Stage = { label: string; time: string; note: string; tone: Tone };
type Props = {
  subview: string; horizon: string; profile: string; scenarioStep: number; stage: Stage;
  mapStatus: string; layers: Record<string, boolean>; selectedAsset: string; renderMap: () => ReactNode;
  onHorizon: (value: string) => void; onToggleLayer: (key: string) => void; onSelectAsset: (value: string) => void;
  onAgents: () => void; onToast: (message: string) => void; onTwin: () => void; onHazards: () => void;
  onTower: () => void; onPlanning: () => void; onRisk: () => void;
};

const normalIncident = [
  ["Capacidade C17", "3.200 t/h", "3.072 t/h", "2.624 t/h", "−448 t/h", "critical"],
  ["Throughput 24h", "100,0%", "94,0%", "88,7%", "−5,3 pp", "alert"],
  ["Pátio Minério", "420 kt", "386 kt", "316 kt", "−70 kt", "watch"],
  ["Autonomia buffer", "12h20", "8h42", "4h32", "−4h10", "critical"],
  ["Produção U3", "100%", "98%", "92%", "−6 pp", "alert"],
  ["MV Atlas", "No plano", "No plano", "+3h20", "+3h20", "critical"],
  ["Recovery debt", "0 kt", "0 kt", "12,4 kt", "+12,4 kt", "critical"],
];

const causalNodes = [
  ["FR-2204", "Chuva P90", "CLIMA", "info", 4, 22],
  ["HMR-882", "Inundação D-04", "PERIGO", "alert", 21, 22],
  ["AI-2084", "Exposição C17", "ATIVO", "alert", 38, 22],
  ["CONST-201", "C17 96 → 82%", "RESTRIÇÃO", "critical", 54, 22],
  ["BOT-022", "Gargalo efetivo", "BOTTLENECK", "critical", 69, 22],
  ["PR-881", "Fluxo −8,4%", "PROPAGAÇÃO", "alert", 54, 63],
  ["BUF-031", "Proteção 2h15", "BUFFER", "watch", 69, 63],
  ["C-2048", "Entrega em risco", "COMPROMISSO", "critical", 85, 63],
] as const;

function Pill({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`chain-pill tone-${tone}`}><i />{children}</span>;
}

function Head({ eyebrow, title, side }: { eyebrow: string; title: string; side?: ReactNode }) {
  return <div className="chain-panel-head"><div><span>{eyebrow}</span><h2>{title}</h2></div>{side}</div>;
}

function NormalIncident(props: Props) {
  const [basis, setBasis] = useState("Operational baseline");
  return <div className="chain-view chain-v2-view">
    <section className="chain-v2-hero panel"><div><span>EVENT COMPARISON · BL-071 × ICS-024</span><h2>Normal × Incidente × Delta</h2><p>O mesmo objeto operacional, no mesmo horizonte e com a mesma regra de cálculo. Sem misturar capacidade de projeto com comportamento real.</p></div><div className="chain-v2-basis"><small>BASE COMPARATIVA</small>{["Design / nominal", "Operational baseline", "Evento atual"].map(item => <button className={basis === item ? "active" : ""} onClick={() => setBasis(item)} key={item}>{item}</button>)}</div><Pill tone="ok">ALIGNED · +24H</Pill></section>
    <section className="chain-v2-states">{[
      ["01 · DESIGN / NOMINAL", "Capacidade de engenharia", "100%", "Limites e capacidades aprovadas", "info"],
      ["02 · OPERATIONAL BASELINE", "Normal observado", "94%", "P50 móvel · 30 dias comparáveis", "ok"],
      ["03 · INCIDENT STATE", "Evento INC-024", "88,7%", "P90 · cenário sem ação", "critical"],
    ].map(([tag,title,value,note,tone]) => <article className={`panel tone-${tone}`} key={tag}><span>{tag}</span><h3>{title}</h3><strong>{value}</strong><small>{note}</small><div>{[92,94,91,96,93,95,94,Number(value.toString().replace("%","").replace(",","."))].map((v,i)=><i style={{height:`${v}%`}} key={i}/>)}</div></article>)}</section>
    <article className="panel chain-v2-delta-table"><Head eyebrow="BASELINE / INCIDENT / DELTA FLOW" title="O que mudou, quanto mudou e por quê" side={<button onClick={() => props.onToast("Event Comparison EC-024 congelado como evidência")}>Congelar comparação</button>}/><table><thead><tr><th>Variável</th><th>Design</th><th>Baseline operacional</th><th>Evento</th><th>Delta vs baseline</th><th>Causa dominante</th></tr></thead><tbody>{normalIncident.map(([metric,design,baseline,event,delta,tone],i)=><tr key={metric}><td><strong>{metric}</strong></td><td>{design}</td><td>{baseline}</td><td>{event}</td><td><Pill tone={tone as Tone}>{delta}</Pill></td><td>{i<2?"CONST-201 · C17":i<5?"propagação + buffer":i===5?"cargo readiness":"catch-up pendente"}</td></tr>)}</tbody></table></article>
    <section className="chain-v2-compare-grid"><article className="panel"><Head eyebrow="NO ACTION × ACTION" title="Efeito da contingência operacional"/><div className="chain-v2-action-compare"><div><span>SEM AÇÃO</span><strong>−12,4 kt</strong><small>MV Atlas +3h20 · recovery 9h30</small><i><b style={{width:"82%"}}/></i></div><div><span>PLANO B · C17 88%</span><strong>−4,8 kt</strong><small>MV Atlas +1h05 · recovery 6h00</small><i><b style={{width:"38%"}}/></i></div><em>Δ 7,6 kt preservadas</em></div><button onClick={props.onPlanning}>Abrir premissas e aprovação no M6</button></article><article className="panel"><Head eyebrow="INVENTORY PROPAGATION" title="Buffers não eliminam impacto; deslocam no tempo"/>{[["Pátio Minério","8h42","5h18","−3h24"],["Intermediário U3","6h10","2h15","−3h55"],["Pátio Produto","7h30","4h32","−2h58"]].map(r=><div className="chain-v2-buffer" key={r[0]}><span><b>{r[0]}</b><small>baseline {r[1]}</small></span><i><strong style={{width:r[2]}}/></i><b>{r[2]}</b><Pill tone="watch">{r[3]}</Pill></div>)}</article></section>
  </div>;
}

function TemporalImpact(props: Props) {
  const [cursor, setCursor] = useState(7);
  const points = [["T+00","Normal","94%","ok"],["T+10","Restrição C17","94%","critical"],["T+14","Buffer protege","94%","info"],["T+35","Buffer crítico","93%","watch"],["T+45","U3 reduz","92%","alert"],["T+65","Navio afetado","89%","critical"],["T+100","Plano B","93%","watch"],["T+220","Normalização","100%","ok"]];
  return <div className="chain-view chain-v2-view"><section className="chain-v2-time-hero panel"><div><span>IMPACTO TEMPORAL · PR-881</span><h2>Da restrição local à recuperação completa</h2><p>Propagation reach 6 nós · tempo até primeiro impacto 35 min · pico de perda T+75 · dívida operacional 12,4 kt.</p></div><div>{[["First impact","35 min"],["Max capacity loss","−18%"],["Cumulative loss","12,4 kt"],["Recovery debt","9h30"]].map(r=><span key={r[0]}><small>{r[0]}</small><strong>{r[1]}</strong></span>)}</div></section>
    <article className="panel chain-v2-timeline"><Head eyebrow="SPACE–TIME PROPAGATION" title={`${points[cursor][0]} · ${points[cursor][1]}`} side={<Pill tone={points[cursor][3] as Tone}>{points[cursor][2]}</Pill>}/><div>{points.map(([time,label,value,tone],i)=><button className={`${i<=cursor?"passed":""} ${i===cursor?"active":""}`} onClick={()=>setCursor(i)} key={time}><i className={`tone-${tone}`}>{i<cursor?"✓":i+1}</i><time>{time}</time><strong>{label}</strong><small>{value}</small></button>)}</div><input aria-label="Tempo do evento" type="range" min="0" max="7" value={cursor} onChange={e=>setCursor(Number(e.target.value))}/></article>
    <section className="chain-v2-time-grid"><article className="panel chain-v2-waterfall"><Head eyebrow="OPERATIONAL WATERFALL" title="Throughput normal → evento → ação → resultado"/>{[["Baseline",94,"base"],["C17",-8.4,"loss"],["Buffer",2.1,"gain"],["Fila",-1.7,"loss"],["Plano B",4.9,"gain"],["Resultado",90.9,"result"]].map(([n,v,k])=><span className={String(k)} key={n}><b>{Number(v)>0&&k!=="base"&&k!=="result"?"+":""}{v}{k==="base"||k==="result"?"%":" pp"}</b><i style={{height:`${Math.max(16,Math.abs(Number(v))*2.2)}px`}}/><small>{n}</small></span>)}</article><article className="panel"><Head eyebrow="PROPAGATION MAP" title="Upstream → downstream"/>{[["C17","T+10","ROOT","critical"],["Pátio Minério","T+14","UPSTREAM","watch"],["U3","T+45","DOWNSTREAM","alert"],["Pátio Produto","T+60","DOWNSTREAM","watch"],["Berço 2","T+65","DOWNSTREAM","alert"],["MV Atlas","T+70","COMMITMENT","critical"]].map(([n,t,r,tone],i)=><div className="chain-v2-reach" key={n}><i>{i+1}</i><p><b>{n}</b><small>{r}</small></p><time>{t}</time><Pill tone={tone as Tone}>{i===0?"−18%":`${Math.max(3,12-i*2)}%`}</Pill></div>)}</article></section>
    <article className="panel chain-v2-current-future"><Head eyebrow="CURRENT × FUTURE BOTTLENECK" title="A contingência move a restrição dominante" side={<button onClick={()=>props.onToast("NextBottleneck NB-014 publicado no PlanningConstraintSet")}>Publicar next bottleneck</button>}/><div><span><small>AGORA</small><strong>C17</strong><b>score 9,2 · 82%</b></span><em>PLANO B<br/>C17 88% →</em><span><small>DEPOIS DA AÇÃO</small><strong>Berço 2</strong><b>score 7,4 · vento 22h</b></span></div></article>
  </div>;
}

function BottleneckExplorer(props: Props) {
  const [selected, setSelected] = useState("C17");
  const rows = [["C17","9,2","82%","CONST-201","4h32","1"],["Berço 2","7,4","87%","vento > 18 m/s","7h10","2"],["Pátio Produto","6,8","89%","mínimo operacional","4h32","3"],["U3","5,3","92%","alimentação","2h15","4"]];
  const current = rows.find(r=>r[0]===selected) ?? rows[0];
  return <div className="chain-view chain-v2-view"><section className="chain-v2-explorer"><article className="panel"><Head eyebrow="BOTTLENECK RANKING" title="Restrição local ≠ gargalo sistêmico" side={<Pill tone="critical">BOT-022</Pill>}/><div className="chain-v2-ranking">{rows.map(r=><button className={selected===r[0]?"selected":""} key={r[0]} onClick={()=>setSelected(r[0])}><i>{r[5]}</i><span><b>{r[0]}</b><small>{r[3]}</small></span><strong>{r[1]}</strong><Pill tone={r[5]==="1"?"critical":"watch"}>{r[2]}</Pill></button>)}</div></article><article className="panel chain-v2-bottleneck-detail"><Head eyebrow="BOTTLENECK DETAIL" title={current[0]} side={<button onClick={()=>props.onToast(`${current[0]}: RootCauseTrace aberto`)}>Explicar</button>}/><div className="chain-v2-score"><strong>{current[1]}</strong><span>/ 10</span><i><b style={{width:`${Number(current[1].replace(",","."))*10}%`}}/></i></div><dl>{[["Constraint",current[3]],["Available capacity",current[2]],["Time to impact",current[4]],["Upstream reach","3 nós"],["Downstream reach","5 nós"],["Confidence","82%"]].map(r=><div key={r[0]}><dt>{r[0]}</dt><dd>{r[1]}</dd></div>)}</dl><footer><button onClick={props.onTwin}>Origem no M4</button><button onClick={props.onPlanning}>Criar cenário M6</button></footer></article></section><section className="chain-v2-levers">{[["CAPACITY","Restaurar C17","46%","+7,6 kt"],["BUFFER","Aumentar estoque útil","24%","+3,1 kt"],["SEQUENCE","Resequenciar U3","19%","+2,4 kt"],["BERTH","Alternar berço","11%","−1h40"]].map(([k,n,p,v],i)=><article className="panel" key={k}><span>{k}</span><h3>{n}</h3><strong>{p}</strong><i><b style={{width:p}}/></i><small>contribuição marginal · {v}</small><button onClick={()=>props.onToast(`${n}: sensitivity run SR-${220+i}`)}>Simular</button></article>)}</section><article className="panel chain-v2-why"><Head eyebrow="WHAT CHANGED / WHY CHANGED" title="Explicação material do ranking"/><div><p><b>1. Mudou:</b> C17 saiu de 96% para 82%.</p><p><b>2. Por quê:</b> restrição operacional CONST-201, ligada à inundação D-04.</p><p><b>3. Por que é gargalo:</b> spare capacity downstream não compensa após o buffer atingir 48 min.</p><p><b>4. O que muda após agir:</b> C17 sobe a 88%; Berço 2 passa a limitar a recuperação.</p></div></article></div>;
}

function CausalGraph(props: Props) {
  const [selected, setSelected] = useState("BOT-022");
  return <div className="chain-view chain-v2-view"><section className="chain-v2-causal-layout"><article className="panel chain-v2-causal"><Head eyebrow="ROOT CAUSE TRACE · RCT-024" title="Clima → perigo → ativo → gargalo → compromisso" side={<Pill tone="ok">8/8 EVIDENCES</Pill>}/><div className="chain-v2-canvas"><div className="chain-v2-edge e1"/><div className="chain-v2-edge e2"/><div className="chain-v2-edge e3"/><div className="chain-v2-edge e4"/><div className="chain-v2-edge e5"/><div className="chain-v2-edge e6"/><div className="chain-v2-edge e7"/>{causalNodes.map(([id,name,type,tone,x,y])=><button className={`tone-${tone} ${selected===id?"selected":""}`} style={{left:`${x}%`,top:`${y}%`}} key={id} onClick={()=>setSelected(id)}><span>{type}</span><b>{id}</b><small>{name}</small></button>)}</div></article><aside className="panel chain-v2-trace"><Head eyebrow="CAUSAL INSPECTOR" title={selected}/><Pill tone={selected==="BOT-022"?"critical":"info"}>{selected==="FR-2204"?"TRIGGER":selected==="C-2048"?"OUTCOME":"VERIFIED"}</Pill><h3>{causalNodes.find(n=>n[0]===selected)?.[1]}</h3><p>A ligação é causal e temporalmente compatível. Correlação isolada não promove o nó para causa dominante.</p><dl>{[["Classification",selected==="CONST-201"?"ROOT CONSTRAINT":"CONTRIBUTOR"],["Valid from","18:45:31"],["Confidence","82%"],["Evidence","EVP-024-08"],["Rule","CAUSAL-07"],["Owner","Chain Ops"]].map(r=><div key={r[0]}><dt>{r[0]}</dt><dd>{r[1]}</dd></div>)}</dl><button onClick={()=>props.onToast(`${selected}: source snapshots, versions and hashes opened`)}>Abrir evidências</button></aside></section><section className="chain-v2-cause-grid">{[["Causa raiz","Inundação D-04 → CONST-201","critical"],["Causa contribuinte","Estoque útil abaixo do nominal","watch"],["Amplificador","Vento na janela do Berço 2","alert"],["Proteção","Buffer intermediário +2h15","ok"]].map(([k,v,t])=><article className="panel" key={k}><Pill tone={t as Tone}>{k}</Pill><strong>{v}</strong><small>classificação versionada · {t==="critical"?"material":"contextual"}</small></article>)}</section><article className="panel chain-v2-lineage"><Head eyebrow="ROOTCAUSETRACE OBJECT" title="Lineage reproduzível"/><pre>{`RootCauseTrace RCT-024\ntrigger: FR-2204 / HMR-882\nrootConstraint: CONST-201\nbottleneck: BOT-022\npropagationRun: PR-881\noperationalOutcome: -12.4 kt\ncommitment: C-2048 AT_RISK\nconfidence: 0.82\nevidencePackage: EVP-024-08`}</pre><div><button onClick={props.onHazards}>Abrir causa física M3</button><button onClick={props.onTwin}>Abrir ativo M4</button><button onClick={props.onTower}>Abrir decisão M1</button></div></article></div>;
}

function FinancialValue(props: Props) {
  const [mode, setMode] = useState("Com ação");
  const values = mode === "Sem ação" ? [12.4,3.3,1.9,0,8.7] : [4.8,1.1,.7,1.4,3.2];
  return <div className="chain-view chain-v2-view"><section className="chain-v2-fin-hero panel"><div><span>FINANCIAL PROPAGATION · FD-024</span><h2>Driver operacional → exposição → valor preservado</h2><p>M5 calcula volume, horas, fila, demurrage e recuperação. Materialidade contábil, contrato, câmbio e risco financeiro são validados no M7.</p></div><div><Pill tone="watch">OPERATIONAL PROXY</Pill><button onClick={props.onRisk}>Validar no M7 →</button></div></section><div className="chain-v2-toggle">{["Sem ação","Com ação"].map(x=><button className={mode===x?"active":""} key={x} onClick={()=>setMode(x)}>{x}</button>)}</div><section className="chain-v2-fin-kpis">{[["Produção em risco",`${values[0].toFixed(1).replace(".",",")} kt`,"M5"],["Demurrage",`US$ ${values[1].toFixed(1).replace(".",",")}k`,"proxy M5"],["Recuperação",`${values[2].toFixed(1).replace(".",",")} turno`,"driver"],["Custo de ação",`R$ ${values[3].toFixed(1).replace(".",",")} mi`,"M6/M7"],["Exposição estimada",`R$ ${values[4].toFixed(1).replace(".",",")} mi`,"M7 validate"]].map(([l,v,o],i)=><article className={`panel tone-${i===4?"critical":i===3?"watch":"info"}`} key={l}><span>{l}</span><strong>{v}</strong><small>{o}</small></article>)}</section><section className="chain-v2-fin-grid"><article className="panel"><Head eyebrow="OPERATIONAL → FINANCIAL DRIVERS" title="Propagação sem dupla contagem"/>{[["C17 −18%","volume perdido","12,4 kt","OP-01"],["Cargo readiness","atraso navio","3h20","LOG-04"],["Catch-up +1,6 kt/h","energia e overtime","7h45","REC-02"],["C-2048","janela contratual","AT RISK","COM-08"]].map((r,i)=><div className="chain-v2-fin-flow" key={r[0]}><i>{i+1}</i><b>{r[0]}</b><span>→ {r[1]}</span><strong>{r[2]}</strong><Pill tone={i===3?"critical":"watch"}>{r[3]}</Pill></div>)}</article><article className="panel chain-v2-value"><Head eyebrow="NO ACTION × ACTION" title="Valor potencialmente preservado"/><div><span>SEM AÇÃO<strong>R$ 8,7 mi</strong></span><i>−</i><span>COM AÇÃO<strong>R$ 3,2 mi</strong></span><em>=</em><span className="saved">PRESERVADO<strong>R$ 5,5 mi</strong></span></div><p>Indicativo até validação do M7. Confidence composto 72%; câmbio, laytime e critérios de reconhecimento versionados.</p><button onClick={props.onRisk}>Abrir materialidade e premissas no M7</button></article></section><article className="panel chain-v2-authority"><Head eyebrow="AUTHORITY BOUNDARY" title="Responsabilidade por domínio"/><div>{[["M5","volume · atraso · fila · recovery","AUTHORITATIVE"],["M6","ação · restrições · plano","AUTHORITATIVE"],["M7","financeiro · materialidade · risco","FINAL AUTHORITY"],["M11","evidência · versão · aprovação","GOVERNED"]].map(([m,s,a])=><span key={m}><b>{m}</b><small>{s}</small><Pill tone={m==="M7"?"ok":"info"}>{a}</Pill></span>)}</div></article></div>;
}

export function ChainV2View(props: Props) {
  return useMemo(() => {
    if (props.subview === "Normal × Incidente") return <NormalIncident {...props}/>;
    if (props.subview === "Impacto Temporal") return <TemporalImpact {...props}/>;
    if (props.subview === "Bottleneck Explorer") return <BottleneckExplorer {...props}/>;
    if (props.subview === "Causal Graph") return <CausalGraph {...props}/>;
    return <FinancialValue {...props}/>;
  }, [props]);
}
