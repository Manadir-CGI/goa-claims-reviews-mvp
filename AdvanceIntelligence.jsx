/* AdvanceIntelligence — portfolio-level predictive view for the claims-advance program.
   Grounding: ease-of-review lever #1 (data-viz & insights) + #7 (Pattern Analyzer integration);
   the advance-recovery vision (discovery §6, split-payment reconciliation) and the guardrail
   "surface data-integrity / advance issues early". Answers a different question than the QA queue:
   across the whole portfolio, where is the advance over-running the actual claim, and what will
   next period need? All GoA components + semantic tokens, compact. Numbers illustrative (G5). */

/* Readiness waits are event + MessageChannel driven, never a timer: the preview clamps
   setInterval/setTimeout when it is not the visible tab, so a poll for a late-arriving global is
   starved and the component renders its "not ready" branch forever (2026-08-24: this latched the
   whole page in React #130 with every module already loaded). G45 bans the timer form. */
function whenReady(pred, cb) {
  if (pred()) { cb(); return () => {}; }
  let live = true;
  const take = () => { if (!live) return true; if (pred()) { live = false; cb(); return true; } return false; };
  const onReady = () => { take(); };
  window.addEventListener('dc-module-ready', onReady);
  /* TICK BUDGET, then a sparse timer. An unbounded MessageChannel loop is not free: measured at
     ~29,000 ticks/second it monopolises the macrotask queue, and a 300ms fetch failed to complete
     inside 10s while one was live — i.e. the loop starves the very module loads it waits for, during
     exactly the cold-load window when they are in flight. 120 ticks covers the same-turn fast path;
     after that a 250ms timer takes over (clamped to ~1s off-tab, which still recovers and costs
     nothing, where the tight loop can peg the tab forever if a global never arrives at all). */
  let ticks = 0, timer = null;
  const stop = () => { live = false; window.removeEventListener('dc-module-ready', onReady); if (timer) clearTimeout(timer); };
  const net = () => { if (live && !take()) timer = setTimeout(net, 250); };
  const ch = new MessageChannel();
  ch.port1.onmessage = () => {
    if (!live) return;
    if (take()) return;
    if (++ticks < 120) ch.port2.postMessage(0); else net();
  };
  ch.port2.postMessage(0);
  return stop;
}
const NS = () => window.GovernmentOfAlbertaDesignSystem_eddb08 || {};
const MONO = "'Roboto Mono', monospace";
const dsReady = () => { const n = NS(); return !!(n.GoabButton && n.GoabTable && n.GoabBadge && n.GoabCallout && n.GoabIcon); };
function useDS() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    if (dsReady()) return undefined;
    return whenReady(dsReady, force);
  }, []);
  return dsReady();
}
const Ico = ({ name, size = 16, color }) => { const { GoabIcon } = NS(); return GoabIcon ? <GoabIcon type={name} size={typeof size === "number" ? size + "px" : size} fillColor={color} /> : null; };
const fmtK = (n) => "$" + (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "K" : n);
const fmtM = (n) => "$" + (n / 1000).toFixed(2) + "M";
const fmt$ = (n) => (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-CA");

/* Per-vehicle chrome comes from a map — add or retire a funding vehicle here alone (G3 modular). */
const VEHICLE_META = {
  Subsidy: { icon: "wallet-outline" },
  Affordability: { icon: "cash-outline" },
  WTU: { icon: "trending-up-outline" },
  FDH: { icon: "people-outline" },
  ICC: { icon: "ribbon-outline" },
};
const MONTHS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const ADVANCE = [820, 840, 860, 880, 900, 910, 930, 950, 970, 990, 1010, 1040];
const ACTUAL = [800, 810, 835, 850, 862, 878, 892, 905, 915, 930, 946, 960];

/* Ranked provider exposure — projected actual vs advance paid. Negative balance = advance over-ran
   the claim (recovery shortfall). Sorted worst-first. Ties to the "Negative balance" model rule. */
const RAW_PROVIDERS = [
  { pid: "80031442", name: "Horse Shoe Lake Daycare", pay: "Subsidy", advance: 18240, actual: 12190, driver: "Total Payments", months: 3 },
  { pid: "80010511", name: "Aurora Learning House", pay: "Affordability", advance: 9860, actual: 7420, driver: "Capacity Utilization", months: 2 },
  { pid: "80022190", name: "Chinook Kids Club", pay: "WTU", advance: 7300, actual: 5610, driver: "Vacation Hours per ECE", months: 4 },
  { pid: "80014073", name: "Willow Family Day Home", pay: "FDH", advance: 6120, actual: 4980, driver: "% Change in ECE Hours", months: 2 },
  { pid: "80019904", name: "Prairie Rose Preschool", pay: "ICC", advance: 5040, actual: 4360, driver: "Child-to-Staff Ratio", months: 1 },
  { pid: "80007720", name: "Foothills Early Learning", pay: "Subsidy", advance: 8600, actual: 8180, driver: "% Change in Total Payments", months: 1 },
  { pid: "80028816", name: "Aspen Grove Childcare", pay: "Affordability", advance: 4300, actual: 4210, driver: "ECE Payments", months: 0 },
  { pid: "80033055", name: "Bright Beginnings OSC", pay: "WTU", advance: 3900, actual: 3980, driver: "Capacity Utilization", months: 0 },
];
const PROVIDERS = RAW_PROVIDERS
  .map((p) => { const bal = p.actual - p.advance; return { ...p, bal, variance: Math.round((bal / p.advance) * 100) }; })
  .sort((a, b) => a.bal - b.bal);
const riskBand = (variance) => variance <= -20 ? { t: "High exposure", type: "emergency", tone: "var(--goa-color-emergency-dark)" }
  : variance <= -8 ? { t: "Watch", type: "important", tone: "var(--goa-color-warning-text)" }
  : { t: "On track", type: "success", tone: "var(--goa-color-success-dark)" };

function AIChart() {
  const [hidden, setHidden] = React.useState({});
  const [hi, setHi] = React.useState(null);
  const svgRef = React.useRef(null);
  const W = 560, H = 250, padL = 46, padR = 16, padT = 16, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const yMax = 1100, yStep = 220;
  const x = (i) => padL + (plotW * i) / (MONTHS.length - 1);
  const y = (v) => padT + plotH - (plotH * v) / yMax;
  const series = [
    { key: "adv", name: "Advance paid", data: ADVANCE, color: "var(--goa-color-interactive-default)" },
    /* The neutral series is greyscale-600, the token behind --goa-color-text-secondary. It was a raw
       #6b6b6b — off-token by 4 steps and invisible to G10, which only sees var(). RULES TOKENS. */
    { key: "act", name: "Actual claim", data: ACTUAL, color: "var(--goa-color-greyscale-600)" },
  ];
  const path = (d) => d.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const gapArea = ADVANCE.map((v, i) => x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" L ") + " L " + ACTUAL.map((v, i) => x(ACTUAL.length - 1 - i).toFixed(1) + " " + y(ACTUAL[ACTUAL.length - 1 - i]).toFixed(1)).join(" L ");
  const ticks = Math.round(yMax / yStep);
  const showGap = !hidden.adv && !hidden.act;
  const onMove = (e) => { if (!svgRef.current) return; const r = svgRef.current.getBoundingClientRect(); const rx = (e.clientX - r.left) / r.width * W; let idx = Math.round((rx - padL) / plotW * (MONTHS.length - 1)); idx = Math.max(0, Math.min(MONTHS.length - 1, idx)); setHi(idx); };
  return (
    <div style={{ flex: 1, minWidth: 340, display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>Advance paid vs actual claim <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", fontWeight: 400 }}>· $000s · Jul 2025 – Jun 2026</span></span>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {series.map((s) => { const off = hidden[s.key]; return (
          <span key={s.key} onClick={() => setHidden((h) => ({ ...h, [s.key]: !h[s.key] }))} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, opacity: off ? 0.4 : 1 }}>
            <span style={{ width: 14, height: 3, borderRadius: 2, background: s.color }}></span>
            <span style={{ font: "var(--goa-typography-body-xs)", textDecoration: off ? "line-through" : "none" }}>{s.name}</span>
          </span>
        ); })}
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 10, borderRadius: 2, background: "var(--goa-color-important-background)", border: "1px solid var(--goa-color-warning-dark)" }}></span><span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Recovery gap</span></span>
      </div>
      <div style={{ position: "relative" }}>
        <svg ref={svgRef} viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "auto", display: "block" }} onMouseMove={onMove} onMouseLeave={() => setHi(null)}>
          {[...Array(ticks + 1)].map((_, t) => { const gy = padT + (plotH * t) / ticks; const gv = yMax * (1 - t / ticks); return (
            <g key={t}>
              <line x1={padL} y1={gy} x2={W - padR} y2={gy} style={{ stroke: "var(--goa-color-greyscale-200)" }} strokeWidth="1" />
              <text x={padL - 6} y={gy + 3} textAnchor="end" style={{ fill: "var(--goa-color-text-secondary)", fontSize: 12, fontFamily: MONO }}>{Math.round(gv)}</text>
            </g>
          ); })}
          {showGap ? <polygon points={gapArea} style={{ fill: "var(--goa-color-important-background)", opacity: 0.7 }} /> : null}
          {MONTHS.map((m, i) => <text key={i} x={x(i)} y={H - 10} textAnchor="middle" style={{ fill: "var(--goa-color-text-secondary)", fontSize: 12, fontFamily: MONO }}>{m}</text>)}
          {series.filter((s) => !hidden[s.key]).map((s) => <path key={s.key} d={path(s.data)} fill="none" style={{ stroke: s.color }} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />)}
          {series.filter((s) => !hidden[s.key]).map((s) => s.data.map((v, i) => <circle key={s.key + i} cx={x(i)} cy={y(v)} r="2.6" style={{ fill: "var(--goa-color-greyscale-white)", stroke: s.color }} strokeWidth="1.5" />))}
          {hi != null ? <line x1={x(hi)} y1={padT} x2={x(hi)} y2={padT + plotH} style={{ stroke: "var(--goa-color-greyscale-400)" }} strokeWidth="1" /> : null}
        </svg>
        {hi != null ? (
          <div style={{ position: "absolute", top: 0, left: (x(hi) / W * 100) + "%", transform: x(hi) > W / 2 ? "translateX(-105%)" : "translateX(5%)", background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-400)", borderRadius: "var(--goa-border-radius-s)", boxShadow: "var(--goa-shadow-raised-light)", padding: "6px 10px", pointerEvents: "none", whiteSpace: "nowrap" }}>
            <div style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, marginBottom: 2 }}>{MONTHS[hi]} {hi >= 6 ? "2026" : "2025"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-xs)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--goa-color-interactive-default)" }}></span>Advance: <b style={{ fontFamily: MONO }}>${ADVANCE[hi]}K</b></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-xs)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--goa-color-greyscale-600)" }}></span>Actual: <b style={{ fontFamily: MONO }}>${ACTUAL[hi]}K</b></div>
            <div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-warning-text)", marginTop: 2 }}>Gap: <b style={{ fontFamily: MONO }}>${ADVANCE[hi] - ACTUAL[hi]}K</b></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RecoveryBars() {
  const rate = ADVANCE.map((a, i) => Math.round((ACTUAL[i] / a) * 100));
  const target = 98;
  const W = 560, H = 250, padL = 40, padR = 16, padT = 16, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const yMin = 85, yMax = 100;
  const bw = (plotW / MONTHS.length) * 0.6;
  const x = (i) => padL + (plotW * (i + 0.5)) / MONTHS.length;
  const y = (v) => padT + plotH - (plotH * (v - yMin)) / (yMax - yMin);
  const [hi, setHi] = React.useState(null);
  return (
    <div style={{ flex: 1, minWidth: 340, display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>Advance recovery rate <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", fontWeight: 400 }}>· actual ÷ advance · target 98%</span></span>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 10, borderRadius: 2, background: "var(--goa-color-interactive-default)" }}></span><span style={{ font: "var(--goa-typography-body-xs)" }}>Monthly recovery %</span></span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, borderTop: "2px dashed var(--goa-color-success-dark)" }}></span><span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Target 98%</span></span>
      </div>
      <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "auto", display: "block" }}>
        {[85, 90, 95, 100].map((gv) => (
          <g key={gv}>
            <line x1={padL} y1={y(gv)} x2={W - padR} y2={y(gv)} style={{ stroke: "var(--goa-color-greyscale-200)" }} strokeWidth="1" />
            <text x={padL - 6} y={y(gv) + 3} textAnchor="end" style={{ fill: "var(--goa-color-text-secondary)", fontSize: 12, fontFamily: MONO }}>{gv}</text>
          </g>
        ))}
        {rate.map((v, i) => { const below = v < target; return (
          <rect key={i} x={x(i) - bw / 2} y={y(v)} width={bw} height={padT + plotH - y(v)} rx="2" onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)}
            style={{ fill: below ? "var(--goa-color-warning-dark)" : "var(--goa-color-interactive-default)", opacity: hi == null || hi === i ? 1 : 0.55, cursor: "pointer" }} />
        ); })}
        <line x1={padL} y1={y(target)} x2={W - padR} y2={y(target)} style={{ stroke: "var(--goa-color-success-dark)" }} strokeWidth="1.5" strokeDasharray="5 4" />
        {MONTHS.map((m, i) => <text key={i} x={x(i)} y={H - 10} textAnchor="middle" style={{ fill: "var(--goa-color-text-secondary)", fontSize: 12, fontFamily: MONO }}>{m}</text>)}
        {hi != null ? <text x={x(hi)} y={y(rate[hi]) - 5} textAnchor="middle" style={{ fill: "var(--goa-color-text-default)", fontSize: 12, fontFamily: MONO, fontWeight: 700 }}>{rate[hi]}%</text> : null}
      </svg>
    </div>
  );
}

function AdvanceIntelligence() {
  if (!useDS()) return <p style={{ padding: 24, font: "var(--goa-typography-body-m)" }}>Loading components…</p>;
  const { GoabButton, GoabBadge, GoabCallout, GoabTable } = NS();
  const [open, setOpen] = React.useState({});
  const totalAdvance = PROVIDERS.reduce((a, p) => a + p.advance, 0);
  const totalActual = PROVIDERS.reduce((a, p) => a + p.actual, 0);
  const atRisk = PROVIDERS.filter((p) => p.variance <= -8).length;
  const kpis = [
    { l: "Advanced this period", v: fmtM(1040), sub: "Jun 2026 · all vehicles", icon: "wallet-outline", tone: "var(--goa-color-interactive-default)", tint: "var(--goa-color-info-background)" },
    { l: "Recovered to date", v: "92.3%", sub: fmtM(960) + " of " + fmtM(1040), icon: "swap-horizontal-outline", tone: "var(--goa-color-success-dark)", tint: "var(--goa-color-success-background)" },
    { l: "Net exposure", v: fmtM(1420), sub: "outstanding advance not yet recovered", icon: "trending-up-outline", tone: "var(--goa-color-warning-text)", tint: "var(--goa-color-warning-background)" },
    { l: "Providers at risk", v: String(atRisk), sub: "projected negative balance", icon: "alert-circle", tone: "var(--goa-color-emergency-dark)", tint: "var(--goa-color-emergency-background)" },
    { l: "Forecast shortfall", v: fmtK(88000), sub: "predicted next-period recovery gap", icon: "bar-chart-outline", tone: "var(--goa-color-text-default)", tint: "var(--goa-color-greyscale-100)" },
  ];
  const th = { padding: "10px 14px", textAlign: "left", font: "var(--goa-typography-body-xs)", fontWeight: 700, color: "var(--goa-color-text-secondary)", whiteSpace: "nowrap" };
  const td = { padding: "10px 14px", verticalAlign: "middle", font: "var(--goa-typography-body-s)" };
  const num = { ...td, textAlign: "right", fontFamily: MONO, fontSize: 13, whiteSpace: "nowrap" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)", paddingTop: "var(--goa-space-s)", paddingBottom: "var(--goa-space-xl)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 320 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Ico name="sparkles-outline" size={18} color="#5b4a9e" /><span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700, color: "#4a3d7a", letterSpacing: ".02em", textTransform: "uppercase" }}>Predictive · Pattern Analyzer</span></span>
          <span style={{ font: "var(--goa-typography-body-m)", color: "var(--goa-color-text-secondary)", maxWidth: 820, lineHeight: 1.5 }}>Where the advance is out-running the actual claim across the portfolio, and what next period will need. Use it to right-size advances and catch recovery shortfalls before payment — not to reject a claim.</span>
        </div>
        <GoabButton type="tertiary" size="compact" leadingIcon="download">Export</GoabButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "var(--goa-space-s)", alignItems: "stretch" }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-l)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "var(--goa-border-radius-m)", background: k.tint }}><Ico name={k.icon} size={19} color={k.tone} /></span>
            <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: k.tone, lineHeight: 1 }}>{k.v}</span>
            <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{k.l}</span>
            <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", lineHeight: 1.4 }}>{k.sub}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", padding: "16px 18px", background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-l)" }}>
        <AIChart />
        <RecoveryBars />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ font: "var(--goa-typography-heading-s)", fontWeight: 700 }}>Provider advance exposure</span>
          <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>ranked by projected balance · worst first · expand a row for the recovery breakdown</span>
        </div>
        <div style={{ background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-l)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <GoabTable width="100%">
              <thead>
                <tr>
                  <th style={th}>Program</th>
                  <th style={th}>Vehicle</th>
                  <th style={{ ...th, textAlign: "right" }}>Advance paid</th>
                  <th style={{ ...th, textAlign: "right" }}>Projected actual</th>
                  <th style={{ ...th, textAlign: "right" }}>Variance</th>
                  <th style={{ ...th, textAlign: "right" }}>Projected balance</th>
                  <th style={th}>Exposure</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {PROVIDERS.map((p) => {
                  const rb = riskBand(p.variance);
                  const isOpen = !!open[p.pid];
                  const vm = VEHICLE_META[p.pay] || {};
                  const recover = p.actual;
                  return (
                    <React.Fragment key={p.pid}>
                      <tr style={{ background: isOpen ? "var(--goa-color-greyscale-100)" : undefined }}>
                        <td style={td}>
                          <span style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                            <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--goa-color-text-secondary)" }}>{p.pid}</span>
                          </span>
                        </td>
                        <td style={td}><span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Ico name={vm.icon} size={15} color="var(--goa-color-text-secondary)" />{p.pay}</span></td>
                        <td style={num}>{fmt$(p.advance)}</td>
                        <td style={num}>{fmt$(p.actual)}</td>
                        <td style={{ ...num, color: rb.tone, fontWeight: 700 }}>{p.variance > 0 ? "+" : ""}{p.variance}%</td>
                        <td style={{ ...num, color: p.bal < 0 ? "var(--goa-color-emergency-dark)" : "var(--goa-color-success-dark)", fontWeight: 700 }}>{fmt$(p.bal)}</td>
                        <td style={td}><GoabBadge type={rb.type} content={rb.t} emphasis="subtle" icon={rb.type !== "success"} /></td>
                        <td style={{ ...td, whiteSpace: "nowrap", textAlign: "right" }}>
                          <GoabButton type="tertiary" size="compact" leadingIcon={isOpen ? "chevron-down" : "chevron-forward"} onClick={() => setOpen((o) => ({ ...o, [p.pid]: !o[p.pid] }))}>{isOpen ? "Hide" : "Details"}</GoabButton>
                        </td>
                      </tr>
                      {isOpen ? (
                        <tr>
                          <td colSpan={8} style={{ padding: 0 }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, padding: "14px 18px", background: "#eef4f9", borderTop: "1px solid var(--goa-color-greyscale-200)", borderBottom: "2px solid var(--goa-color-greyscale-400)" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)" }}>Recovery math</span>
                                {[["Advance paid", fmt$(p.advance)], ["Projected actual claim", fmt$(p.actual)], ["Projected recovery", fmt$(recover)], ["Projected balance", fmt$(p.bal)]].map(([l, v], i) => (
                                  <span key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "var(--goa-typography-body-s)", borderTop: i === 3 ? "1px solid var(--goa-color-greyscale-300)" : "none", paddingTop: i === 3 ? 6 : 0 }}>
                                    <span style={{ color: "var(--goa-color-text-secondary)" }}>{l}</span>
                                    <b style={{ fontFamily: MONO, color: i === 3 ? (p.bal < 0 ? "var(--goa-color-emergency-dark)" : "var(--goa-color-success-dark)") : "var(--goa-color-text-default)" }}>{v}</b>
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)" }}>What the model sees</span>
                                <span style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>Top driver: <b>{p.driver}</b>.</span>
                                <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", lineHeight: 1.5 }}>{p.months > 0 ? p.months + " consecutive month" + (p.months > 1 ? "s" : "") + " the actual claim came in under the advance." : "First period the actual claim tracked its advance — within tolerance."}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)" }}>Recommended</span>
                                <span style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>{p.bal < -1000 ? "Right-size next advance down by ~" + fmt$(Math.round(-p.bal / 100) * 100) + " and flag for adjustment." : p.bal < 0 ? "Monitor — small shortfall recovers within tolerance." : "No action — advance is well-matched to the claim."}</span>
                                <GoabButton type="secondary" size="compact" leadingIcon="open-outline">Open in claims review</GoabButton>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </GoabTable>
          </div>
        </div>
      </div>

      <GoabCallout type="important" size="medium" heading="Next-period forecast">
        <span style={{ display: "block", lineHeight: 1.55 }}>On current trend, advances for July 2026 are projected at <b style={{ fontFamily: MONO }}>{fmtM(1058)}</b> against an expected actual claim of <b style={{ fontFamily: MONO }}>{fmtM(970)}</b> — a projected <b style={{ fontFamily: MONO }}>{fmtK(88000)}</b> recovery shortfall concentrated in {atRisk} providers. Right-sizing the flagged advances above closes an estimated <b style={{ fontFamily: MONO }}>{fmtK(61000)}</b> of it before payment. FDH is forecast separately.</span>
      </GoabCallout>
    </div>
  );
}
window.AdvanceIntelligence = AdvanceIntelligence;
