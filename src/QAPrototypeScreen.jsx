/* QAPrototypeScreen — fully interactive QA claims-review queue, shared by the
   consolidated QA Review board (deltas="true" shows Δ pins).
   v5: one Filter button opens the Figma search side sheet verbatim (node
   8286:139560 — Status · Funding type · Received date range · Amount range ·
   Claim type, Clear all filters, Cancel/Apply); a separate Analyzer
   button opens the analyzer's own side sheet with the tool's exact filter set
   (Program ID · Claim Period · Review Status · Top Model Feature · Transaction
   Status · Rule Violations 11-multi-select · Claim Creation Date). Role-scoped
   tabs; KPI tiles colour-coded by severity. All real GoA components, compact. */

/* PERFORMANCE — ACCEPTED, do not re-investigate.
   First load pins the main thread for roughly a minute. It is not this file's rendering: the page
   loads ~9.5MB of pre-transpiled Figma bundles (cr/ 4.7MB + cr-extra/ 2.8MB + the GoA _ds_bundle
   2.0MB) and then Babel-transpiles this file at runtime. Mitigations already in place: frame 16 is
   lazy-mounted (LazyFrame), the overview tab caps at 14 rows with Show all, the working queue is
   the default tab instead of the KPI-heavy overview, closed drawers unmount, and the useDS
   readiness gate lives in a wrapper so hook order stays stable. The remaining lever would be
   splitting ClaimDetail / ClaimLookup into their own modules so the queue's first paint does not
   wait on them — not done, because the bundles dominate the floor either way. */

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
/* DS token, not a hardcoded stack (deviation sweep 2026-08-13): --goa-font-family-number resolves
   to roboto-mono, so every fontFamily: MONO use is now token-driven with zero visual change. */
const MONO = "var(--goa-font-family-number)";
/* One CSS override, injected the DS's own way (goa-tooltip.js / _ds_bundle.js idiom: a data-
   attributed <style>, once). The DS gives a table's FIRST and LAST sortable header a 24px edge
   inset — .goab-table thead th.goab-table__th--sort:first-child .goab-tsh — sized for its default
   cell padding. This queue's cells run 6px, so that inset stranded the first column's label 26px
   right of its own values (user cc-2 2026-08-24). There is no prop or token for it: GoabTable gives
   a th only a className and GoabTableSortHeader takes no style, so a scoped rule is the only reach.
   Scoped to [data-queue-table] — no other table on the page moves. */
(function () {
  if (typeof document === "undefined" || document.querySelector('style[data-cr="queue-table"]')) return;
  var el = document.createElement("style");
  el.setAttribute("data-cr", "queue-table");
  el.textContent = '[data-queue-table] .goab-table thead th.goab-table__th--sort{padding-left:6px;padding-right:6px}'
    + '[data-queue-table] .goab-table thead th.goab-table__th--sort:first-child{padding-left:10px}'
    + '[data-queue-table] .goab-table thead th.goab-table__th--sort .goab-tsh,'
    + '[data-queue-table] .goab-table thead th.goab-table__th--sort:first-child .goab-tsh,'
    + '[data-queue-table] .goab-table thead th.goab-table__th--sort:last-child .goab-tsh{padding-left:0;padding-right:0}'
    + '[data-queue-table] .goab-table thead th.goab-table__th--sort .goab-tsh__content{padding-left:0;padding-right:0}';
  document.head.appendChild(el);
})();
const dsReady = () => {
  const n = NS();
  return !!(n.GoabButton && n.GoabTable && n.GoabTabs && n.GoabDropdown && n.GoabBadge && n.GoabCallout && n.GoabCheckbox && n.GoabInput && n.GoabDrawer && window.CLKPIsFalse && window.GoaSelectionChip);
};
function useDS() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    if (dsReady()) return undefined;
    return whenReady(dsReady, force);
  }, []);
  return dsReady();
}

/* ---------- deterministic data ---------- */
/* CCFOPS-385 "Flags" — the flag catalogue is FIXED in the handoff: ten names, each with a severity
   that follows the priority-signal colour law (red = flagged / blocking, yellow = attention needed).
   Names and wording are the Figma callout strings verbatim (CalloutWTUDuplicateStaff,
   CalloutICCContractRisk, CalloutAffordabilityHigh …). Nothing outside this list is a flag. */
/* A contract has ONE expiry date. It was written twice — the flag said "expired Jun 30, 2026"
   while the ICC review surface said the contract expires Mar 31, 2027, so a claim carrying the
   flag stated both on the same screen. Both now read this. */
const CONTRACT = { term: "Mar 31, 2027", expired: "Jun 30, 2026" };
/* The catalogue's "Threshold exceeded" names this limit in prose; the WTU surface tests against it,
   prints it under the KPI and colours the chip row by it. One number, four readers. */
const HOURS_PER_CHILD_LIMIT = 30;
const FLAGS = [
  { name: "High variance", sev: "red", why: "Part of the 3% of claims with the highest variance in total claim amount from the past month.", metric: "3% highest variance" },
  { name: "Duplicate staff", sev: "red", why: "One or more staff has duplicate entry for hours claimed.", metric: "2 duplicate entries" },
  { name: "Threshold exceeded", sev: "red", why: "The ratio of total child care hours to the total number of children is more than " + HOURS_PER_CHILD_LIMIT + ".", metric: "limit " + HOURS_PER_CHILD_LIMIT + " child care hrs/child" },
  { name: "Contract exceeded", sev: "red", why: "The accumulated contract amount exceeds the total contract value.", metric: "104% of contract" },
  { name: "Contract expired", sev: "red", why: "The contract covering this payment expired before the claim period ended.", metric: "expired " + CONTRACT.expired },
  { name: "Random sample", sev: "yellow", why: "Part of the 5% of the claims flagged at random.", metric: "5% random" },
  { name: "High Children Claimed", sev: "yellow", why: "Total number of child spaces claimed exceed the licensed child spaces by 200%.", metric: "232 vs 110 licensed" },
  { name: "Excessive hours", sev: "yellow", why: "The childcare hours claimed by one or more staff are more than 185 hrs.", metric: "212 hrs max" },
  { name: "High admin hours", sev: "yellow", why: "The administrative hours claimed by one or more staff are more than 200 hrs.", metric: "234 hrs" },
  { name: "Contract limit risk", sev: "yellow", why: "The accumulated contract amount is greater than 80% of the total contract value.", metric: "86% of contract" },
];
const RULES = FLAGS.map((f) => f.name);
const RULE_DETAIL = {};
FLAGS.forEach((f) => { RULE_DETAIL[f.name] = { why: f.why, metric: f.metric, sev: f.sev }; });
/* Colour law: red flags are emergency, yellow flags are important. One lookup, used by the queue
   badge, the evidence card and the detail callout so they can never disagree. */
const flagTone = (n) => ((RULE_DETAIL[n] || {}).sev === "red" ? "emergency" : "important");
/* HQ QA's two flags are batch-level and already exist in CCIS, unlike every other role's. Priority
   decides which one shows: High variance outranks Random sample, and only the highest is displayed.
   A flagged claim is always status Review. */
const QA_FLAGS = [
  { key: "High variance", tone: "important", desc: "In the top 3% of the batch by change in claim amount against the previous month." },
  { key: "Random sample", tone: "information", desc: "Drawn in the 5% random sample of this batch." },
];
const qaFlagOf = (c) => QA_FLAGS.filter((f) => (c.qaFlags || []).indexOf(f.key) >= 0)[0] || null;
/* CCFOPS-378 — ICC delivery regions. The ICC queue shows region as its own column. */
const REGIONS = ["Northwest", "Northeast", "Edmonton", "Central", "Calgary", "South", "North central", "Metis settlement"];
/* CCFOPS-374 — a hold names WHO placed it, so QA can tell its own follow-ups from a teammate's. */
const HOLD_STAFF = ["Carla Legare", "Laurie Mosier", "Avery Solano", "Dana Whitfield"];
const FEATS = ["Total Payments", "Child-to-Staff Ratio", "% Change in ECE Hours", "Capacity Utilization", "Vacation Hours per ECE", "ECE Payments", "% Change in Total Payments"];
const ADJ = ["Sunrise", "Prairie", "Maple", "Northern", "Bright", "Little", "Wildrose", "Aurora", "Foothills", "Chinook", "Willow", "Aspen"];
const NOUN = ["Daycare", "Preschool", "FDH", "Kids Club", "Childcare Centre", "Learning House", "OSC", "Play Academy", "Early Learning"];
const CITY = ["Calgary", "Edmonton", "Red Deer", "Medicine Hat", "Fort McMurray", "Grande Prairie", "Airdrie", "St. Albert", "Sherwood Park", "Spruce Grove", "Okotoks", "Leduc", "Lloydminster"];
const TXN = "10 - Transaction Created…";
const FUND = [["Subsidy", "Subsidy"], ["Affordability grant", "Affordability"], ["Wage top-up (WTU)", "WTU"], ["Family day home (FDH)", "FDH"], ["Inclusive child care (ICC)", "ICC"]];
/* Modular routing (G3): a claim's vehicle decides which specialist stage it lands in after QA.
   Add/retire a vehicle by editing this map alone — no per-vehicle branching anywhere else.
   Five stages per the user's stated process (2026-08-11): QA Review · Subsidy EO · FDH EO · ICC EO ·
   Funding Manager — the June 2025 lineage in discovery-synthesis §16.3. Board 7 (Jul 2026) collapses
   FDH & ICC into one lane; the explicit instruction outranks that reading, so ICC keeps its own
   stage. FDH and ICC still share the $25k supervisor rule (§15.3), which SUPERVISOR.vehicles holds. */
const VEHICLE_STAGE = { Subsidy: "sub", FDH: "fdh", Affordability: "funding", WTU: "funding", ICC: "icc" };
/* Who receives a released batch, named. "specialist review" used to stand in for the QA hand-off
   (user 2026-08-12: "whats specialist review? shouldnt it be just the next review chain role?") — it
   was a collective noun because QA fans out to a DIFFERENT stage per funding vehicle. So derive the
   receiving roles from the batch's own vehicles via VEHICLE_STAGE + TRACK instead of naming a
   category: adding or retiring a vehicle needs no change here (RULES MODULAR). */
function stageLabelOf(k) { const t = TRACK.filter((x) => x.k === k)[0]; return (t && t.l) || k; }
function joinAnd(a) { return a.length < 2 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
/* Receiving stages for the claims actually in hand, as a LIST so copy can agree in number — one
   role takes "was notified", several take "were notified". Falls back to every stage the vehicle map
   can route to, so the string still names roles when the batch is empty. */
function nextLabels(R, batch) {
  if (R.release1GX) return ["1GX"];
  if (R.stage !== "qa") return [R.next || "Finance Officer"];
  const keys = (batch && batch.length ? batch.map((c) => VEHICLE_STAGE[c.pay]) : Object.keys(VEHICLE_STAGE).map((v) => VEHICLE_STAGE[v]));
  return TRACK.filter((t) => keys.indexOf(t.k) >= 0).map((t) => t.l);
}
/* CCFOPS-445 / 476 — the watchlist is per PROVIDER × ROLE, not per claim: the same provider can be
   watched by QA and by Affordability for different reasons, and each watcher edits only their own
   row. Roles derive from FUND, so a new funding vehicle brings its watcher with it (G3). */
const WATCH_ROLES = ["QA"].concat(FUND.map((f) => f[0]));
/* Display labels for the watch modal only. The source's watch modal (8531:12246) names roles
   "Affordability" and "Wage Top-up" with no abbreviation suffixes, while FUND's keys are the
   vehicle names used everywhere else and in WATCH_SEED. Mapping display-side keeps the keys
   stable instead of renaming a data key across the whole app (audit M2, specs/003). */
const WATCH_ROLE_LABEL = {
  "Affordability grant": "Affordability",
  "Wage top-up (WTU)": "Wage Top-up",
  "Family day home (FDH)": "Family day home",
  "Inclusive child care (ICC)": "Inclusive child care",
};
const watchRoleLabel = (r) => WATCH_ROLE_LABEL[r] || r;
/* Seeded register: the providers already being watched, and by whom. A provider watched by two
   roles carries two reasons — the case a single claim-level reason cannot express. */
const WATCH_SEED = [
  { id: 1, roles: { "QA": "History of over-reporting on children and staff." } },
  { id: 15, roles: { "QA": "Licence renewal outstanding \u2014 re-check next period.", "Affordability grant": "Grant spaces exceeded enrolled capacity twice this year." } },
  { id: 30, roles: { "Wage top-up (WTU)": "Admin hours trending above 200 hrs for two periods." } },
  { id: 60, roles: { "Inclusive child care (ICC)": "Contract at 86% with eight months left to run." } },
];
const seedWatch = (claims) => WATCH_SEED.map((s) => {
  const c = claims.filter((x) => x.id === s.id)[0];
  return c ? { pid: c.pid, name: c.name, addr: c.addr, roles: { ...s.roles }, at: "Jul 2, 2026", by: "Avery Solano" } : null;
}).filter(Boolean);
/* Which watch role the signed-in reviewer acts as. A one-click watch from the queue may only ever
   touch THIS key — another role's entry is theirs (CCFOPS-476: "providers associated with my role").
   Derived from the role's owned vehicles, so a new vehicle brings its watcher with it (G3). */
const watchRoleFor = (R) => {
  if (!R.vehicles || !R.vehicles.length) return "QA";
  const f = FUND.filter((x) => x[1] === R.vehicles[0])[0];
  return f ? f[0] : "QA";
};
/* CCFOPS-374 / 378 — the queue table is NOT one uniform column set. A column module names the base
   column it sits after, so a queue (Hold) or a vehicle (ICC) adds columns as DATA (G3). */
const COLUMNS = {
  /* Claim period is now a BASE column (after Program ID), so the Hold queue no longer adds it. */
  period: { label: "Period", after: "recv", cell: (c) => c.per },
  region: { label: "Region", after: "pid", cell: (c) => c.region },
  heldBy: { label: "Held by", after: "ctype", cell: (c) => c.heldBy || "\u2014" },
};
const VEHICLE_COLUMNS = { ICC: ["region"] };
const vehicleCols = (R) => {
  const out = [];
  (R.vehicles || []).forEach((v) => (VEHICLE_COLUMNS[v] || []).forEach((k) => { if (out.indexOf(k) < 0) out.push(k); }));
  return out;
};
/* Board 7 — "FDH & ICC EO Review": all payments under $25k are reviewed in-stage; anything
   over goes to a supervisor. Keyed by VEHICLE, not role, so extending the threshold to another
   funding vehicle is a one-line data change (G3). */
const SUPERVISOR = { threshold: 25000, vehicles: ["FDH", "ICC"] };
/* Where a claim currently sits. One entry per stage — adding a stage needs no other change. */
const STAGE_LABEL = { qa: "At QA", sub: "At Subsidy EO", fdh: "At FDH EO", icc: "At ICC EO", funding: "At Funding Manager", finance: "At Finance", released: "Released to 1GX" };
const StageTag = ({ c }) => {
  const { GoabBadge } = NS();
  const l = STAGE_LABEL[c.stage];
  return l && GoabBadge ? <GoabBadge type="information" content={l} emphasis="subtle" /> : null;
};
const needsSup = (c) => SUPERVISOR.vehicles.indexOf(c.pay) >= 0 && c.grossN > SUPERVISOR.threshold && c.stage === VEHICLE_STAGE[c.pay];
/* Board 7 — the final program-area sign-off (Funding Manager) reviews all NEW NEGATIVE payments
   plus 3–5 positives at random. These are the vehicles a negative can arise on. */
const NEG_VEHICLES = ["ICC", "Affordability", "WTU"];
/* Cents live on the SEEDED GROSS now, so no formatter adds them. The old "+ 0.18 at display"
   idiom meant amtN and its own rendered string disagreed by 18c in five places, and every
   reconciliation had to re-add it to agree. */
const fmtAmt = (n) => Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const fmtSum = (rows) => Math.abs(rows.reduce((a, c) => a + c.amtN, 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
/* GROSS MONTHLY CLAIM — ALWAYS POSITIVE (user 2026-08-20, cc-1: "how can claim amount be negative?
   it cant"). A claim is money owed for spaces, children and educators; it has no negative form.
   Only the NET (gross minus advance recovery) can go negative, and that is what the queue's Amount
   column shows and what "all new negative payments" means on the Funding Manager board. This
   supersedes the 2026-08-13 negNet swap, which put a sign belonging to the net onto the claim.
   Bands are PER VEHICLE because the vehicles are not the same size. The centre-claim vehicles carry
   the user's $35k-$90k (a licensed 60-90 space program claiming affordability + subsidy + WTU
   together); FDH and ICC are smaller single-purpose claims and straddle the $25k supervisor
   threshold on purpose - one flat $35k+ band would refer 100% of them to a supervisor and destroy
   the rule the threshold exists to exercise. [floor, span]. */
const GROSS_BAND = {
  Subsidy: [35000, 55000], Affordability: [35000, 55000], WTU: [35000, 55000],
  FDH: [14000, 24000], ICC: [9000, 25000],
};
const seedGross = (i, pay) => {
  const sup = SUPERVISOR.vehicles.indexOf(pay) >= 0;
  if (sup && i % 7 === 3) return 26400 + ((i * 331) % 22000);       // over-threshold tail -> supervisor referral
  if (!sup && i % 23 === 5) return 152000 + ((i * 613) % 108000);   // large multi-site operator (outliers kept: user 2026-08-20)
  const b = GROSS_BAND[pay] || GROSS_BAND.Subsidy;
  return b[0] + ((i * 997) % b[1]) + 0.18;
};
/* A negative net needs the PRIOR three months to sit well ABOVE this claim - a summer closure, a
   cohort ageing out, fewer educators. That is the only mechanism a negative payment has: the
   advance was 80% of a bigger past, so recovering it overshoots the smaller present. */
const seedDrop = (i, pay) => NEG_VEHICLES.indexOf(pay) >= 0 && i % 19 === 6;
const DROP_SCALE = 1.55;
const Amt = ({ c }) => <span style={{ color: c.neg ? "var(--goa-color-emergency-dark)" : undefined }}>{c.neg ? "($" + c.amt + ")" : "$" + c.amt}</span>;
/* One negative-money convention across the whole prototype: ACCOUNTING FORM (user 2026-08-19,
   cc-1) — parentheses, no minus sign of any kind, emergency red on the rendered figure. money()
   parenthesizes; moneyEl() adds the red where no component already colours by .neg. EVERY render
   of a figure that can go negative must be moneyEl(), not money()/fmt() — user 2026-08-20 (cc-1)
   caught the vehicle-accordion total shipping "($604.92)" in body colour: parentheses without the
   red is half the convention, and reads as a positive figure in brackets. G35 now has a rendered
   half that fails any parenthesised amount whose computed colour is not emergency-dark. Supersedes
   the 2026-08-11/13 minus-outside-the-dollar-sign convention. */
const money = (n) => (n < 0 ? "($" : "$") + Math.abs(n).toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + (n < 0 ? ")" : "");
const moneyEl = (n) => n < 0 ? <span style={{ color: "var(--goa-color-emergency-dark)" }}>{money(n)}</span> : money(n);
/* Month-over-month is the quotient of two months this page already prints in the advance basis —
   it was a typed string that disagreed with them. A month with no claim gives no comparison rather
   than a division by zero, and the sign uses the same true minus money() does. */
const momOf = (basis, now) => {
  const prev = (basis || []).length >= 2 ? basis[basis.length - 2].v : null;
  if (!prev) return null;
  const pct = ((now - prev) / Math.abs(prev)) * 100;
  return (pct < 0 ? "\u2212" : "+") + Math.abs(pct).toFixed(1) + "% MoM";
};

/* R6 — payments run Tuesdays and Fridays (§16.2), so the release deadline is a real date, not an
   abstract due date. Illustrative run list anchored to the prototype's "today" (Tue Aug 4 2026). */
const PAY_RUNS = [{ label: "Tue Aug 4", cutoff: "4:00 p.m." }, { label: "Fri Aug 7", cutoff: "4:00 p.m." }, { label: "Tue Aug 11", cutoff: "4:00 p.m." }];
const NEXT_RUN = PAY_RUNS[0];
/* A signed release report is named for the day it was signed — one fact, not two, so the id can
   never drift from the date beside it. Used by the seeded trail and by every new signature. */
const MON_N = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
const rrId = (d) => { const p = String(d).replace(",", "").split(" "); return "RR-2026-" + (MON_N[p[0]] || "00") + ("0" + p[1]).slice(-2); };
const TODAY = "Aug 4";

/* PPV features removed at the user's request. */
const ppvOf = () => null;

/* R12 — summer-closure / reduction requests are a per-program advance-rate modifier today tracked
   in a side spreadsheet log (§17.3). 100% unless the program asked for less. */
const ADVANCE_RATE = {
  "80031442": { pct: 50, months: "Jul–Aug 2026", reason: "Summer closure — program requested 50%" },
  "80010119": { pct: 25, months: "Jul–Aug 2026", reason: "Summer closure — program requested 25%" },
};

/* R3 + R11 — the advance is 80% of the average of the LAST THREE monthly claims; a month with no
   claim submitted contributes a ZERO; an overdue advance blocks the next one (§17.3). The inputs
   list is the ~7 financial sources plus licence/collection/log data the workbook pulls today. */
const ADVANCE_PCT = 0.8;
/* Month labels must come from the same place as the values. One parser/stepper, used by the chart
   and by every date the detail prints for this claim's period. */
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monIndex = (s) => { const p = String(s).split(" "); return parseInt(p[1], 10) * 12 + MON.indexOf(p[0]); };
const monLabel = (t) => MON[((t % 12) + 12) % 12] + " " + Math.floor(t / 12);
const dayAt = (t, d) => MON[((t % 12) + 12) % 12] + " " + d + ", " + Math.floor(t / 12);
/* The period every claim in this prototype is being reviewed for. The advance windows and every
   date on the claim detail derive from it. */
const CLAIM_PERIOD = "Jun 2026";
const CLAIM_PERIOD_T = monIndex(CLAIM_PERIOD);
const advanceOf = (c) => {
  const base = c.grossN > 0 ? c.grossN : 42000;
  const missing = c.id % 7 === 4;                       // a month with no claim submitted
  const missMonth = missing ? monLabel(CLAIM_PERIOD_T - 1) : null;
  const win = (endT, f) => [0, 1, 2].map((k) => { const m = monLabel(endT - 2 + k); return { m, v: m === missMonth ? 0 : Math.round(base * f[k]) }; });
  /* TWO advances, never one. `basis`/`amount` is the advance this period EARNS for next month —
     the basis panel's subject. `prior`/`paid` is the advance already paid at the start of this
     period and recovered from this claim; it is computed from the three months BEFORE the period,
     so a recovery can never depend on the claim it is recovered from. */
  const basis = win(CLAIM_PERIOD_T, [0.94, 1.06, 1]);
  /* drop (2026-08-20): the three months before this period sat well above this claim, so 80% of
     them exceeds it and the net payment goes negative. Scaling the WINDOW, not the result, keeps
     the basis panel honest - a reviewer can see the months the overshoot came from. */
  const ds = c.drop ? DROP_SCALE : 1;
  const prior = win(CLAIM_PERIOD_T - 1, [0.88 * ds, 0.97 * ds, 1.02 * ds]);
  const avg = basis.reduce((a, b) => a + b.v, 0) / 3;
  const priorAvg = prior.reduce((a, b) => a + b.v, 0) / 3;
  const rate = ADVANCE_RATE[c.pid];
  const pct = rate ? rate.pct / 100 : ADVANCE_PCT;
  const overdue = c.id % 11 === 3 ? Math.round(base * 0.8) : 0;
  return {
    basis, prior, missing, avg, pct, rate, overdue,
    amount: Math.round(avg * pct),
    paid: Math.round(priorAvg * pct),
    blocked: overdue > 0,
    submittedBy: "Jul 20, 2026",
    sources: [
      ["Claim amounts (last 3 periods)", "CCIS", "Aug 4, 2026, 2:00 a.m."],
      ["Adjustments in the 3-month window", "ECDS · Oscar", "Aug 4, 2026, 2:00 a.m."],
      ["Licence status · expiry date", "Licensing · Lima", "Aug 3, 2026"],
      ["Collection status (amounts owed)", "Financial Operations", "Aug 3, 2026"],
      ["Overdue advance balance", "Advance tracker", "Aug 4, 2026"],
      ["Reduction log", "Program area", "Jul 31, 2026"],
      ["Summer-closure log", "Program area", "Jul 31, 2026"],
    ],
  };
};

/* R7 — adjustments are never paid standalone: they wait for a claim and are processed together,
   against any claim in the last 12 months (§16.2). */
const adjTargetOf = (c) => c.ctype !== "Adjustment" ? null
  : (c.id % 3 === 0
    ? { state: "waiting", label: "Waiting for a claim", detail: "This adjustment is paid with the provider's next monthly claim \u2014 adjustments are never paid on their own." }
    : { state: "riding", label: "Paid with claim " + String(48200 + ((c.id + 5) % 100)), detail: "It is reviewed and paid together with that claim, in the same payment run." });
const adjPeriodOf = (c) => ["Jun 2026", "Apr 2026", "Jan 2026", "Sep 2025"][c.id % 4];

/* R8 — providers register ALL children regardless of funding, and Subsidy is OSC-only now (§16.1),
   so the capacity check has to say which of the two it is comparing. Licensed capacity is its OWN
   value, not the claimed count: comparing a number against itself is not a check. */
const childrenOf = (c) => {
  const cap = 110 - (c.id % 5) * 2;
  const total = cap - 10 + ((c.id * 7) % 13);
  const sub = Math.max(0, Math.round(total * 0.34) - (c.id % 3));
  return { cap, total, sub, reg: total - sub, over: total >= cap };
};

/* R10 — reconciliation matches on voucher codes (§16.2); one definition, used by the trail and the
   claim lookup so they can never disagree. */
const chequeOf = (c) => String(4180000 + c.id * 13);
const voucherOf = (c) => "1GX-" + String(90210 + c.id * 7);

/* R5 — QA's own perfect-case checklist (§17.4). Data-driven so bulk clear can show what it asserts. */
const PERFECT_CHECKS = [
  { key: "var", label: "No high variance between the last two claims", test: (c) => c.ccs !== "High variance" && !(c.risk >= 70) },
  { key: "adv", label: "No overdue claim advance", test: (c) => !advanceOf(c).overdue },
  { key: "neg", label: "No negative balance", test: (c) => !c.neg },
  { key: "lic", label: "No name, licence or contract issue", test: (c) => !(c.rules || []).some((r) => /licen|name|contract/i.test(r)) },
];
const perfectFails = (c) => PERFECT_CHECKS.filter((k) => !k.test(c));

/* R9 — an Excel version alongside the PDF is an explicit requirement (§16.5), and Finance
   reconciles in a spreadsheet. A dropdown, not a modal: picking a format is a one-step choice. */
/* "Export" is the CONTROL'S LABEL, not a format — it belongs in placeholder, not items.
   User-caught 2026-08-20 (cc-1): carrying it in items put "Export" in the open menu as a
   selectable option, marked aria-selected because it was also the value. The list is the
   formats only; the control reads "Export" via the DS placeholder and resets to it after a pick. */
const EXPORT_ITEMS = ["PDF", "Excel (.xlsx)", "CSV"];
function ExportMenu({ onPick }) {
  const { GoabDropdown } = NS();
  const [v, setV] = React.useState("");
  if (!GoabDropdown) return null;
  return (
    <GoabDropdown name="export-fmt" size="compact" items={EXPORT_ITEMS} value={v} placeholder="Export" width="132px" ariaLabel="Export"
      onChange={(...a) => { const pick = val(...a); if (pick && onPick) onPick(pick); setV(""); }} />
  );
}
const seedStage = (i, pay) => {
  if (i === 0) return "qa";
  if (i >= 71 && i <= 82) return VEHICLE_STAGE[pay]; // QA-released — now in the vehicle's specialist queue
  if (i >= 83 && i <= 92) return "finance";          // specialist-approved — awaiting Finance release
  if (i >= 93 && i <= 100) return "released";         // paid out to 1GX
  return "qa";
};
function genClaims() {
  const list = [];
  for (let i = 0; i < 107; i++) {
    /* Risk/violation bands are keyed off a decorrelated index — banding on `i` put every
       downstream stage (71–100) inside the zero-risk window, so four of the five roles saw
       "No risk flagged" on every claim. Same distribution, spread across all stages. */
    const r = (i * 37 + 11) % 107;
    let viol = 0, risk = 0;
    if (r < 14) { viol = 1 + (r % 3); risk = 25 + ((r * 17) % 71); }
    else if (r < 23) { risk = 70 + ((r * 13) % 26); }
    else if (r < 54) { risk = 1 + ((r * 11) % 69); }
    else if (r < 101) { risk = 0; }
    else { risk = null; }
    const p = (i * 53) % 107;
    const pay = p < 38 ? "Subsidy" : p < 60 ? "Affordability" : p < 78 ? "WTU" : p < 93 ? "ICC" : "FDH";
    const sn = (i % 24) + 1;
    const suf = sn % 10 === 1 && sn !== 11 ? "st" : sn % 10 === 2 && sn !== 12 ? "nd" : sn % 10 === 3 && sn !== 13 ? "rd" : "th";
    const addr = (100 + i * 7) + " " + sn + suf + " " + (i % 2 ? "Street" : "Avenue") + " " + ["NW", "SE", "NE", "SW"][i % 4] + ", " + CITY[i % CITY.length];
    list.push({
      id: i, clm: String(48200 + i), pid: String(80010000 + i * 7), name: ADJ[i % 12] + " " + NOUN[Math.floor(i / 12) % 9],
      recv: "Jul " + (15 + (i % 9)), day: 15 + (i % 9), pay, viol, risk, period: "202606", txn: TXN, ctype: i % 11 === 5 ? "Adjustment" : "Claim", addr,
      rules: viol ? Array.from({ length: viol }, (_, k) => RULES[(i + k * 3) % RULES.length]) : [],
      region: REGIONS[(i * 3) % REGIONS.length],
      per: ["Jun 2026", "May 2026", "Apr 2026"][i % 3],
      heldBy: i === 35 ? HOLD_STAFF[0] : null,
      feat: risk === null ? null : FEATS[i % 7],
      grossN: seedGross(i, pay), drop: seedDrop(i, pay),
      qaFlags: [i % 11 === 0 ? "High variance" : null, i % 13 === 0 ? "Random sample" : null].filter(Boolean),
      /* Only the highest-priority flag is displayed; QA_FLAGS order decides, so High variance wins. */
      ccs: i % 11 === 0 ? "High variance" : i % 13 === 0 ? "Random sample" : null,
      watch: [1, 15, 30, 60].includes(i),
      stage: seedStage(i, pay), status: i === 35 ? "hold" : "open",
    });
  }
  /* Guarantee each vehicle appears at its own specialist stage and in the Finance batch,
     whatever the vehicle mix does across the index windows. Iterates VEHICLE_STAGE — adding a
     vehicle needs no change here. Prefers one "notable" claim (over-threshold or negative) so
     each stage's sampling rule is actually exercised. */
  Object.keys(VEHICLE_STAGE).forEach((veh) => {
    const st = VEHICLE_STAGE[veh];
    const need = 3 - list.filter((c) => c.stage === st && c.pay === veh).length;
    if (need > 0) {
      const pool = list.filter((c) => c.pay === veh && c.stage === "qa" && c.id > 40);
      const notable = pool.filter((c) => c.grossN > SUPERVISOR.threshold || c.neg).slice(0, 1);
      const plain = pool.filter((c) => notable.indexOf(c) < 0).slice(0, need - notable.length);
      notable.concat(plain).forEach((c) => { c.stage = st; });
    }
    if (!list.some((c) => c.stage === "finance" && c.pay === veh)) {
      list.filter((c) => c.pay === veh && c.stage === "qa" && c.id > 40).slice(0, 2).forEach((c) => { c.stage = "finance"; });
    }
  });
  Object.assign(list[0], { name: "Horse Shoe Lake Daycare", clm: "48311", pid: "80031442", drop: true, viol: 3, risk: 87, rules: ["High Children Claimed", "Threshold exceeded", "High admin hours"], feat: "Total Payments", grossN: 46820.18, ccs: "High variance", addr: "1 Prospect Point NW, Canmore", pay: "Subsidy", region: "Calgary", per: "Jun 2026" });
  /* One ICC claim in the QA queue carries the contract flags, so the ICC review surface's
     expired-contract path (flag text + KPI flip) is reachable from the queue rather than only
     implemented. Picked from the existing ICC pool — no stage counts or vehicle mix change. */
  const iccQa = list.filter((c) => c.pay === "ICC" && c.stage === "qa" && c.status === "open" && c.id > 2)[0];
  if (iccQa) Object.assign(iccQa, {
    name: "Chinook Inclusive Child Care", viol: 2, risk: 74,
    rules: ["Contract expired", "Contract limit risk"], feat: "Capacity Utilization",
  });
  /* 004 S1/S2 seeds (spec 004; §19.1/§19.2). One multi-target forward request — the transcript's
     own ICC/WTU hour-conflict example — one backwards request (Funding → QA, "that also needs to
     happen backwards"), and one prior-period reviewer flag on the demo claim so carry-forward is
     visible. A request never changes status or stage. */
  const reqA = list.filter((c) => c.pay === "ICC" && c.stage === "qa" && c.status === "open" && c !== iccQa && c.id > 2)[0];
  if (reqA) reqA.reviewReq = { targets: ["icc", "funding"], question: "120 hours are claimed in both ICC and WTU for the same educators — please confirm which hours are correct.", by: "Avery Solano (QA)", at: "Aug 3, 2026", answered: false };
  const reqB = list.filter((c) => c.stage === "funding" && c.status === "open")[0];
  if (reqB) reqB.reviewReq = { targets: ["qa"], question: "The June advance recovery looks double-counted against the July basis — can QA confirm the recovery before we release?", by: "Alex Renn (Funding EO)", at: "Aug 3, 2026", answered: false };
  list[0].revFlags = [{ sev: "yellow", reason: "Hours are being claimed for educators after their termination dates — verify against the certification list each period.", by: "Dana Whitfield (Subsidy EO)", at: "May 30, 2026", period: "May 2026", carry: true }];
  /* NET IS DERIVED, NEVER SEEDED (2026-08-20). One formula — gross minus the advance already paid —
     so the queue's Amount column, the detail's Net amount tile, fmtSum, the release batch and the
     signed release reports cannot state different numbers. Runs last: every seed override above
     (the featured claim, the ICC contract claim, the flag/request seeds) is already applied, so
     changing a grossN or a drop up there needs no second edit down here. */
  list.forEach((c) => {
    const net = Math.round((c.grossN - advanceOf(c).paid) * 100) / 100;
    c.amtN = net; c.amt = fmtAmt(net); c.neg = net < 0;
  });
  return list;
}
const bandOf = (c) => c.viol > 0 ? "viol" : c.risk === null ? "wait" : c.risk >= 70 ? "high" : c.risk >= 1 ? "mod" : "norm";
const BANDS = [
  { key: "viol", icon: "warning", color: "var(--goa-color-emergency-dark)", bg: "var(--goa-color-emergency-light)", title: "Rule violations — review first", sub: "Mathematically derived and transparent" },
  { key: "high", icon: "trending-up-outline", color: "var(--goa-color-warning-text)", bg: "var(--goa-color-important-light)", title: "Model triage — high risk (≥70%)", sub: "No rule broke — unusual for the peer group" },
  { key: "mod", icon: "bar-chart-outline", color: "var(--goa-color-text-secondary)", bg: "var(--goa-color-greyscale-100)", title: "Moderate (1–69%)", sub: "Review if capacity allows" },
  { key: "norm", icon: "shield-checkmark-outline", color: "var(--goa-color-success-default)", bg: "var(--goa-color-success-light)", title: "Looks normal — bulk release", sub: "Perfect-case checklist: licence · claims 1·2·3 · no violations · 0% risk · no overdue advance · no negative balance" },
  { key: "wait", icon: "time-outline", color: "var(--goa-color-text-secondary)", bg: "var(--goa-color-greyscale-50)", title: "Awaiting AI scoring", sub: "Scores refresh as the peer group fills — excluded from bulk clear" },
];
/* Five reviewer roles + program lead, one shared page pattern (CLAUDE.md). Each role is data:
   its stage, the vehicles it owns, and where a release routes next. QA → specialist EO (by vehicle)
   → Finance Officer → 1GX. bulkClear + release1GX are capabilities, never hard-wired per vehicle. */
const ROLES = {
  "hq-qa": { label: "HQ QA reviewer", stage: "qa", stageLabel: "QA", next: null, bulkClear: true, vehicles: null },
  "subsidy-eo": { label: "Subsidy EO", stage: "sub", stageLabel: "Subsidy EO", next: "Finance Officer", bulkClear: false, vehicles: ["Subsidy"] },
  "fdh-eo": { label: "FDH EO", stage: "fdh", stageLabel: "FDH EO", next: "Finance Officer", bulkClear: false, vehicles: ["FDH"] },
  "icc-eo": { label: "ICC EO", stage: "icc", stageLabel: "ICC EO", next: "Finance Officer", bulkClear: false, vehicles: ["ICC"] },
  "funding-eo": { label: "Funding Manager (AG · WTU)", stage: "funding", stageLabel: "Funding Manager", next: "Finance Officer", bulkClear: false, vehicles: ["Affordability", "WTU"], holdRoute: "qa", holdRouteLabel: "QA" },
  "finance-officer": { label: "Finance Officer", stage: "finance", stageLabel: "Finance", next: "1GX", bulkClear: false, vehicles: null, release1GX: true },
  "lead": { label: "Program lead", stage: "qa", stageLabel: "QA", next: null, bulkClear: true, vehicles: null, supervisor: true },
};
/* Board 7 — every stage opens a release queue against an explicit sampling rule. The basis line
   tells the reviewer WHY these claims are in front of them; `reason` tags the individual claim
   when its selection basis is distinguishing (null = unremarkable, no badge). */
const SAMPLING = {
  qa: { basis: "Payments flagged by CCIS — 3% highest variance + 5% random", scope: "~8% of the period's claims", target: 8,
    reason: (c) => c.ccs ? [flagTone(c.ccs), c.ccs] : null },
  sub: { basis: "5 programs at random — one subsidy payment within each", scope: "5 programs this period", target: 20,
    reason: (c) => c.id % 5 === 0 ? ["information", "Random program"] : null },
  fdh: { basis: "All payments under $25k · over $25k referred to a supervisor", scope: "under $25k in-stage", target: 100,
    reason: (c) => needsSup(c) ? ["important", "Over $25k"] : null },
  /* FDH and ICC share the $25k rule — discovery-synthesis §15.3 states it as one "FDH & ICC EO"
     sampling rule even though the user's process keeps the two stages separate. */
  icc: { basis: "All payments under $25k · over $25k referred to a supervisor", scope: "under $25k in-stage", target: 100,
    reason: (c) => needsSup(c) ? ["important", "Over $25k"] : null },
  funding: { basis: "All new negative payments + 3–5 positive payments at random", scope: "negatives + random positives", target: 15,
    reason: (c) => c.neg ? ["emergency", "Negative payment"] : c.id % 6 === 0 ? ["information", "Random positive"] : null },
  finance: { basis: "Full reviewed batch — reconciled against the 1GX posted-voucher report", scope: "whole release batch", target: 100,
    reason: () => null },
};
const SampTag = ({ c, stage }) => {
  const { GoabBadge } = NS();
  const s = SAMPLING[c.stage] || SAMPLING[stage];
  const r = s && s.reason(c);
  return r && GoabBadge ? <GoabBadge type={r[0]} content={r[1]} emphasis="subtle" /> : null;
};
const PAGE = 6;
const val = (...a) => {
  if (typeof a[1] === "string") return a[1];
  const x = a[0];
  if (typeof x === "string") return x;
  if (x && typeof x.value === "string") return x.value;
  if (x && x.target && typeof x.target.value === "string") return x.target.value;
  return "";
};
let SHOW_DELTAS = false;
let EVIDENCE_LAYOUT = "banner";
let SHOW_REVIEW_UI = true;
/* ECDS Claims Review board ONLY. MVP V1 mounts this shared screen without these attributes and
   keeps its scoped-down build; the board passes them on. Restored 2026-08-25 on user instruction:
   an MVP-scoping pass stripped the row-evidence disclosure and the detail trend charts out of the
   SHARED file, which silently took the consolidated board down with it. Default off = MVP as-is. */
let ROW_EVIDENCE = false;
let DETAIL_CHARTS = false;
/* Stage context for the shared row/evidence components — set once per render by QAQueueScreen
   so the sampling tag, hold routing and supervisor referral stay data-driven. */
let ROLE_STAGE = "qa";
let HOLD_ROUTE = null;
function Delta({ n }) {
  return <span tabIndex={0} role="note" aria-label={"Change " + n + " versus the Figma QA queue — see note Δ" + n} title={"Change vs Figma QA queue — see note Δ" + n} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 17, height: 17, borderRadius: 999, background: "#5b4a9e", color: "var(--goa-color-greyscale-white)", fontFamily: MONO, fontSize: 12, fontWeight: 700, flexShrink: 0, cursor: "help" }}>{n}</span>;
}
const D = ({ n }) => (SHOW_DELTAS ? <Delta n={n} /> : null);
/* Claim CTAs (watchlist / hold / reviewed) are the SAME control everywhere they appear — the
   detail header and the queue's evidence card. Tertiary button on a solid status fill when active:
   watching = Status/Information Default, on hold = Text/Secondary, reviewed = Status/Success. */
const CTA_FILL = { watch: "var(--goa-color-info-dark)", hold: "var(--goa-color-text-secondary)", reviewed: "var(--goa-color-success-default)", sup: "var(--goa-color-info-default)" };
/* The tertiary label colour is NOT the button's own `color` — the DS consumes
   --goa-button-tertiary-color-text inside the component, so overriding color (even !important)
   loses. Set that token on the wrapper and the label inverts with the icon. */
/* CTAs hug their label in every state — no reserved width, no hidden sizer. The toolbar's
   Release + Export cluster is pinned separately, so nothing that must stay put depends on
   these widths. */
/* No ring on the wrapper: GoabButton tertiary already carries --goa-button-tertiary-border
   (1px greyscale-200) at --goa-button-border-radius. A wrapper ring drew a second concentric
   outline at a different radius. The wrapper only supplies the on-state fill, and matches the
   button's radius so the fill never peeks past its corners. */
const ctaFill = (on, k) => Object.assign(
  { display: "inline-flex", borderRadius: "var(--goa-button-border-radius)" },
  on
    ? { background: CTA_FILL[k], "--goa-button-tertiary-color-text": "var(--goa-color-greyscale-white)", "--goa-button-tertiary-border": "var(--goa-border-width-s) solid transparent" }
    : null
);
/* Hold badges wear the ACTIVATED On hold CTA's fill, so one state reads as one colour everywhere:
   CTA_FILL.hold is the Figma chip's "Text/Secondary" (8128:179141, rgb(102,102,102)). They were
   emergency red, which said "blocking rule breached" for what is really a paused claim, and clashed
   with the grey chip the reviewer had just pressed. GoabBadge has no grey FILLED type, so the dark
   badge's own background token is re-pointed on the wrapper — the same technique ctaFill uses for the
   tertiary button's text — rather than hardcoding a hex (G1 bans severity hex). Non-subtle on
   purpose: the CTA is a solid fill with white text and so is this. */
function HoldBadge({ content }) {
  const { GoabBadge } = NS();
  if (!GoabBadge) return null;
  return (
    <span style={{ display: "inline-flex", "--goa-badge-default-color-bg": CTA_FILL.hold }}>
      <GoabBadge type="dark" content={content} />
    </span>
  );
}
function ClaimCTAs({ watch, hold, reviewed, onWatch, onHold, onReviewed, supervisor, referred, onRefer, holdLabel }) {
  const { GoabButton } = NS();
  /* ICON STATE, read from the chip components rather than assumed:
       OFF  StateDefaultIconNo 8113:183325 — "State=Default, Icon=No". No icon. Correct as built.
       ON   a different component that DOES carry a 16px white goa-icon:
              Reviewed    8128:179183  bg rgb(0,111,76)  icon VariantBasic42 6923:108706 = checkmark
              On hold     8128:179141  bg rgb(102,102,102) icon VariantOutline84 = two plain bars
              Watching    8128:179122  bg rgb(0,74,143)  icon VariantOutline81 = eye outline
     The eye is GoaEye (figma node 7077:66734, variants outline|filled) — already in
     cr/Components.bundle.js and on window, and ChipWatchlist in that same bundle renders it as
     variant="outline", which confirms the mapping. It fills with currentColor, so the chip's white
     is set via color; its art is a 24px box, scaled to the source's 16px.
     An earlier comment here read "no icon on any of the three CTAs" — that generalised the OFF
     variant to both states and is why the on-state icons were missing. */
  const GoaEye = window.GoaEye;
  const eyeNode = GoaEye ? (
    /* GoaEye paints a fixed 24x24 box (its inner svg is absolutely positioned inside it), so it can't
       be resized by giving the wrapper a smaller width — it overflowed and sat off-centre. The
       wrapper is a positioned 16x16 frame and the 24px box is scaled 2/3 into it from its origin,
       which lands the art's centre exactly at 8,8. 16px and the white fill are the source's own
       values (SizeSmall2 goa-icon, overrideFill rgb(255,255,255)). */
    <span style={{ position: "relative", display: "inline-block", width: 16, height: 16, flexShrink: 0 }}>
      <GoaEye variant="outline" style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.66667)", transformOrigin: "0 0", color: "rgb(255,255,255)" }} />
    </span>
  ) : null;
  const one = (on, k, icon, offLabel, onLabel, fn, iconNode) => (
    <span style={ctaFill(on, k)} data-cta-on={on ? "1" : undefined}>
      <GoabButton type="tertiary" size="compact" leadingIcon={on && icon ? icon : undefined} onClick={fn}>
        {on && iconNode
          ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{iconNode}{onLabel}</span>
          : (on ? onLabel : offLabel)}
      </GoabButton>
    </span>
  );
  return (
    <React.Fragment>
      {one(watch, "watch", null, "Add to watchlist", "On watchlist", onWatch, eyeNode)}
      {one(hold, "hold", "pause", holdLabel || "Place on hold", "On hold", onHold)}
      {/* Over the $25k threshold this stage cannot sign off itself — the third action becomes the
         supervisor referral instead of Mark reviewed (board 7, FDH & ICC lane). The Figma chip set
         has no supervisor variant, so no icon is asserted for it. */}
      {supervisor
        ? one(referred, "sup", null, "Refer to supervisor", "With supervisor", onRefer)
        : one(reviewed, "reviewed", "checkmark", "Mark reviewed", "Reviewed", onReviewed)}
    </React.Fragment>
  );
}
const Ico = ({ name, size = 16, color }) => { const { GoabIcon } = NS(); return GoabIcon ? <GoabIcon type={name} size={typeof size === "number" ? size + "px" : size} fillColor={color} /> : null; };

function RiskBadge({ v }) {
  const { GoabBadge } = NS();
  if (v == null) return <span style={{ color: "var(--goa-color-greyscale-400)" }}>—</span>;
  if (v >= 70) return <GoabBadge type="emergency" content={v + "%"} emphasis="subtle" icon />;
  if (v >= 1) return <GoabBadge type="important" content={v + "%"} emphasis="subtle" />;
  return <span style={{ color: "var(--goa-color-greyscale-400)" }}>—</span>;
}
/* Tab labels carry a count badge instead of "(n)" text, coloured by the priority-signal law:
   red = flagged / on hold, yellow = attention needed (returned, supervisor), green = done,
   neutral grey when the count is zero so an empty Hold tab never reads as an alarm. */
const TAB_TONE = [[/^Flagged/, "emergency"], [/^Hold/, "hold"], [/^Returned/, "important"],
  [/^Supervisor/, "important"], [/^Watchlist/, "dark"], [/^Released/, "success"],
  [/^Release reports/, "midtone"], [/^Downstream/, "midtone"]];
function TabHeading({ h }) {
  /* "hold" is not a GoabBadge type — it routes to HoldBadge so the tab count wears the same grey. */
  const { GoabBadge } = NS();
  const m = /^(.*) \((\d+)\)$/.exec(h);
  if (!m || !GoabBadge) return h;
  const hit = TAB_TONE.find(([re]) => re.test(h));
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>{m[1]}
      {m[2] !== "0" && hit && hit[1] === "hold"
        ? <HoldBadge content={m[2]} />
        : <GoabBadge type={m[2] === "0" ? "midtone" : hit && hit[1] !== "hold" ? hit[1] : "information"} content={m[2]} emphasis="subtle" />}
    </span>
  );
}
/* Infinite scroll for capped tables. Replaces the "Showing 10 of 68 · Show all 68" footer row
   (removed by user instruction 2026-08-11): a 1px sentinel row sits after the last rendered row and
   asks for one more page whenever it comes within 400px of the viewport. No dep array — each render
   re-observes, so a sentinel still on screen after the list grows fires again until the list is
   exhausted. Falls back to revealing the next page immediately where IntersectionObserver is
   unavailable, so no row is ever unreachable. */
function MoreSentinel({ cols, onMore }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.IntersectionObserver) { onMore(); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) onMore(); }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  });
  return (
    <tr aria-hidden="true">
      <td colSpan={cols} style={{ padding: 0, border: 0 }}><div ref={ref} style={{ height: 1 }}></div></td>
    </tr>
  );
}
function Chip({ text, on, onClick, icon, tone }) {
  const fill = tone === "neutral" ? "var(--goa-color-greyscale-700)" : "var(--goa-color-interactive-default)";
  const fg = on ? "var(--goa-color-greyscale-white)" : "var(--goa-color-text-default)";
  return (
    <span role="button" tabIndex={0} aria-pressed={on} onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: icon ? 8 : 5, boxSizing: "border-box",
        borderRadius: 16, padding: icon ? "4px 12px 4px 8px" : (on ? "4px 11px 4px 7px" : "4px 11px"),
        font: "var(--goa-typography-body-s)", fontWeight: icon ? 400 : 600, whiteSpace: "nowrap", lineHeight: "22px",
        background: on ? fill : "var(--goa-color-greyscale-white)",
        color: fg,
        boxShadow: "inset 0 0 0 1px " + (on ? fill : "var(--goa-color-greyscale-700)") }}>
      {icon ? <Ico name={icon} size={16} color={fg} /> : (on ? <Ico name="checkmark-outline" size={14} color={fg} /> : null)}
      {text}
    </span>
  );
}

/* The GoA modal/drawer scrim absorbs clicks but not wheel scroll, so the content behind an open
   overlay still moves. Lock every scrollable ancestor while one is open, and restore on close. */
function useBackdropLock(active, ref) {
  React.useEffect(() => {
    if (!active) return;
    const root = ref && ref.current;
    if (!root) return;
    /* Walk up from the DIALOG (not the view root) so the view's own siblings — page header, tabs,
       queue — are covered too, then everything that is not on the path to the dialog gets `inert`:
       pointer-events:none alone left 69 background controls in the tab order, so Tab + Enter still
       drove the page behind the scrim (WCAG 2.4.3). inert removes them from hit-testing AND focus. */
    const dlg = root.querySelector('.goab-modal__root, .goab-drawer, [role="dialog"]') || root;
    const undo = [];
    const block = (el) => {
      undo.push([el, el.inert === true, el.getAttribute("aria-hidden"), el.style.pointerEvents]);
      el.inert = true;
      el.setAttribute("aria-hidden", "true");
      el.style.pointerEvents = "none";
    };
    let el = dlg;
    while (el && el.parentElement && el !== document.body) {
      const p = el.parentElement;
      const cs = window.getComputedStyle(p);
      if (/(auto|scroll)/.test(cs.overflowY + " " + cs.overflowX)) { const prev = p.style.overflow; undo.push([p, null, null, null, prev]); p.style.overflow = "hidden"; }
      Array.prototype.forEach.call(p.children, (sib) => { if (sib !== el && sib.nodeType === 1) block(sib); });
      if (p.classList && p.classList.contains("frame")) break;
      el = p;
    }
    const prevFocus = document.activeElement;
    const first = dlg.querySelector('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
    if (first && first.focus) { try { first.focus({ preventScroll: true }); } catch (e) { try { first.focus(); } catch (e2) {} } }
    return () => {
      undo.forEach((u) => {
        if (u[1] === null) { u[0].style.overflow = u[4]; return; }
        u[0].inert = u[1];
        if (u[2] == null) u[0].removeAttribute("aria-hidden"); else u[0].setAttribute("aria-hidden", u[2]);
        u[0].style.pointerEvents = u[3];
      });
      if (prevFocus && prevFocus.focus && document.contains(prevFocus)) { try { prevFocus.focus({ preventScroll: true }); } catch (e) {} }
    };
  }, [active]);
}

function EmptyState({ icon, art, title, hint, action }) {
  /* A GoA illustration outranks a bare glyph where one exists for the state (user 2026-08-24).
     Resolved off window.GoaIllustrations so a missing library degrades to the icon rather than
     throwing, and so the illustration file stays a plain <script> like the ionicons shim. */
  const Art = art && window.GoaIllustrations ? window.GoaIllustrations[art] : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "44px 24px" }}>
      {Art ? <Art /> : <Ico name={icon || "checkmark-done-outline"} size={30} color="var(--goa-color-greyscale-400)" />}
      <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>{title}</span>
      {hint ? <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", textAlign: "center", maxWidth: 460 }}>{hint}</span> : null}
      {action || null}
    </div>
  );
}

/* R1 — the reviewer's #1 ask: attach a note, a flag or a review criterion to a MODEL FINDING, not
   just to the claim (§17.1 — "we don't have a way with the AltML stuff to add those notes, to add
   those flags, to add those review criteria"). Criteria persist so the next period inherits them. */
function DriverRow({ c, f, k, band, maxD, st, act, variant }) {
  const { GoabLinkButton, GoabTextarea, GoabButton, GoabBadge } = NS();
  const key = c.id + "::" + f.name;
  const a = (st.annot || {})[key] || { note: "", flag: false, criteria: false };
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(a.note || "");
  const marked = a.flag || a.criteria || !!a.note;
  const sep = variant === "bars" ? "none" : variant === "quiet" ? "1px solid var(--goa-color-greyscale-200)" : (k ? "1px solid var(--goa-color-greyscale-100)" : "none");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: variant === "bars" ? "1px 0" : "5px 0", borderTop: sep }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {variant === "bars" || variant === "rows" ? <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "var(--goa-color-text-secondary)", width: 10, textAlign: "right", flexShrink: 0 }}>{k + 1}</span> : null}
        <span style={{ font: "var(--goa-typography-body-s)", fontWeight: variant === "quiet" ? 400 : 600, color: variant === "quiet" ? "var(--goa-color-text-secondary)" : undefined, flex: variant === "bars" ? "0 0 40%" : 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</span>
        {variant === "bars" ? (
          <span style={{ flex: 1, height: 5, borderRadius: 999, background: "var(--goa-color-greyscale-200)", overflow: "hidden", minWidth: 24 }}>
            <span style={{ display: "block", height: "100%", width: Math.round((f.d / maxD) * 100) + "%", background: band.textCol, borderRadius: 999 }}></span>
          </span>
        ) : null}
        <span style={{ fontFamily: MONO, fontWeight: 700, color: variant === "quiet" ? undefined : band.textCol, width: variant === "bars" ? 44 : undefined, textAlign: "right", flexShrink: 0 }}>+{f.d}%</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <GoabLinkButton size="compact" leadingIcon={a.flag ? "flag" : "flag-outline"} aria-label={(a.flag ? "Remove flag from" : "Flag") + " " + f.name} onClick={() => act.annotate(c.id, f.name, { flag: !a.flag })}>{a.flag ? "Flagged" : "Flag"}</GoabLinkButton>
          <GoabLinkButton size="compact" leadingIcon={a.note ? "document-text-outline" : "add"} aria-label={"Add a note to " + f.name} onClick={() => { setDraft(a.note || ""); setOpen((v) => !v); }}>{a.note ? "Note" : "Note"}</GoabLinkButton>
        </span>
      </span>
      {marked && !open ? (
        <span style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap", paddingLeft: variant === "bars" || variant === "rows" ? 20 : 0 }}>
          {a.criteria ? <GoabBadge type="information" content="Review criterion" emphasis="subtle" /> : null}
          {a.note ? <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", flex: 1, minWidth: 0 }}>“{a.note}”</span> : null}
        </span>
      ) : null}
      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 10px", background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 6 }}>
          <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Note against <b style={{ color: "var(--goa-color-text-default)" }}>{f.name}</b> — stays with this model finding.</span>
          {GoabTextarea ? <GoabTextarea name={"annot-" + key} value={draft} onChange={(...x) => { for (const v of x) { if (typeof v === "string") { setDraft(v); return; } if (v && typeof v.value === "string") { setDraft(v.value); return; } } }} rows="2" maxLength="200" placeholder="What did you check, and what did you conclude?" width="100%" /> : null}
          <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <GoabLinkButton size="compact" leadingIcon={a.criteria ? "checkmark-circle" : "checkmark-circle-outline"} onClick={() => act.annotate(c.id, f.name, { criteria: !a.criteria })}>{a.criteria ? "Is a review criterion" : "Keep as a review criterion"}</GoabLinkButton>
            <span style={{ flex: 1 }}></span>
            <GoabButton type="tertiary" size="compact" onClick={() => setOpen(false)}>Cancel</GoabButton>
            <GoabButton type="primary" size="compact" onClick={() => { act.annotate(c.id, f.name, { note: draft.trim() }); setOpen(false); }}>Save note</GoabButton>
          </span>
        </div>
      ) : null}
    </div>
  );
}

function EvidenceCard({ c, st, act, vertical }) {
  const { GoabButton, GoabLinkButton, GoabBadge } = NS();
  /* The CTA's on-state must read the SAME key its click writes — the acting role's entry, not
     "anyone is watching" (the Flag(s) badge already says that). */
  const iWatch = act.watch ? !!(((act.watch.find(c.pid) || {}).roles || {})[act.watch.role]) : (c.status === "watchlist" || !!c.watch);
  const [drv, setDrv] = React.useState(false);
  const rec = st.recheck[c.id];
  const annotCount = Object.keys(st.annot || {}).filter((k) => k.indexOf(c.id + "::") === 0 && (() => { const a = st.annot[k]; return a.flag || a.criteria || a.note; })()).length;
  const band = c.risk == null ? { w: "Not yet scored", tag: "WAIT", col: "var(--goa-color-text-secondary)", textCol: "var(--goa-color-text-secondary)", fill: "var(--goa-color-greyscale-400)", tint: "var(--goa-color-greyscale-100)", icon: "information-circle" }
    : c.risk >= 70 ? { w: "High risk", tag: "HIGH", col: "var(--goa-color-emergency-dark)", textCol: "var(--goa-color-emergency-dark)", fill: "var(--goa-color-emergency-default)", tint: "var(--goa-color-emergency-background)", icon: "warning" }
    : c.risk >= 1 ? { w: "Moderate risk", tag: "MOD", col: "var(--goa-color-warning-text)", textCol: "var(--goa-color-warning-text)", fill: "var(--goa-color-warning-dark)", tint: "var(--goa-color-warning-background)", icon: "alert-circle" }
    : { w: "No risk flagged", tag: "NONE", col: "var(--goa-color-text-secondary)", textCol: "var(--goa-color-text-secondary)", fill: "var(--goa-color-greyscale-400)", tint: "var(--goa-color-greyscale-100)", icon: "information-circle" };
  const scoreTxt = c.risk == null ? "N/A" : c.risk + "%";
  const feats = [0, 1, 2].map((k) => ({ name: FEATS[(c.id + k * 2) % 7], d: 12 + ((c.id * 7 + k * 13) % 40) })).sort((a, b2) => b2.d - a.d);
  const maxD = Math.max.apply(null, feats.map((f) => f.d).concat(1));
  const caveat = (
    <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", display: "inline-flex", alignItems: "flex-start", gap: 6, lineHeight: 1.45 }}>
      <Ico name="information-circle-outline" size={14} color="var(--goa-color-text-secondary)" />
      <span>Use this to decide what to review first — the <b style={{ fontWeight: 700, color: "var(--goa-color-text-default)" }}>rule violations are the confirmed problems</b>.</span>
    </span>
  );
  const bannerLayout = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: band.tint, borderRadius: 8, borderLeft: "4px solid " + band.col }}>
        <Ico name={band.icon} size={22} color={band.col} />
        <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 26, fontWeight: 700, lineHeight: 1, color: band.textCol }}>{scoreTxt}</span>
            <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700, color: band.textCol }}>{band.w}</span>
          </span>
          <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Analyzer · model risk vs similar providers · June 2026</span>
        </span>
        <span style={{ marginLeft: "auto" }}><D n={5} /></span>
      </div>
      {caveat}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
          <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--goa-color-text-default)" }}>What's raising this score</span>
          <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>vs similar providers</span>
        </span>
        {feats.map((f, k) => <DriverRow key={k} c={c} f={f} k={k} band={band} maxD={maxD} st={st} act={act} variant="bars" />)}
      </div>
    </div>
  );
  const ledgerLayout = (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
      <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--goa-color-text-secondary)", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Ico name="sparkles-outline" size={14} color="var(--goa-color-text-secondary)" />Analyzer · model risk<D n={5} />
      </span>
      <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, paddingBottom: 6 }}>
        <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600, color: "var(--goa-color-text-default)" }}>Model risk</span>
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, lineHeight: 1, color: band.textCol }}>{scoreTxt}</span>
          <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, color: band.textCol, background: band.tint, borderRadius: 4, padding: "1px 7px" }}>{band.w}</span>
        </span>
      </span>
      <span style={{ position: "relative", display: "block", height: 6, borderRadius: 999, background: "var(--goa-color-greyscale-200)", overflow: "hidden", marginBottom: 10 }}>
        <span style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: Math.min(c.risk || 0, 100) + "%", background: band.textCol, borderRadius: 999 }}></span>
        <span style={{ position: "absolute", top: -1, bottom: -1, left: "70%", width: 1, background: "var(--goa-color-greyscale-white)" }} title="High-risk threshold (70%)"></span>
      </span>
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", borderTop: "1px solid var(--goa-color-greyscale-200)", paddingTop: 7, paddingBottom: 2 }}>
        <span style={{ fontWeight: 700, color: "var(--goa-color-text-default)", textTransform: "uppercase", letterSpacing: ".04em" }}>What's raising this score</span><span>vs similar providers · June 2026</span>
      </span>
      {feats.map((f, k) => <DriverRow key={k} c={c} f={f} k={k} band={band} maxD={maxD} st={st} act={act} variant="rows" />)}
      <span style={{ borderTop: "1px solid var(--goa-color-greyscale-200)", paddingTop: 8, marginTop: 4 }}>{caveat}</span>
    </div>
  );
  /* ---- shared pieces (one definition, reused by every layout) ---- */
  const violCount = c.rules.length;
  const violHead = violCount ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-s)", fontWeight: 700, color: "var(--goa-color-emergency-dark)" }}>
      <Ico name="warning-outline" size={15} color="var(--goa-color-emergency-dark)" />{violCount} confirmed rule violation{violCount > 1 ? "s" : ""}
    </span>
  ) : null;
  const violNode = violCount ? c.rules.map((r) => { const rd = RULE_DETAIL[r] || {}; return (
    <div key={r} style={{ display: "flex", gap: 10, alignItems: "flex-start", paddingBottom: 6, borderBottom: "1px solid var(--goa-color-greyscale-100)" }}>
      <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, flex: 1 }}>
        <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{r}</span>
        <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", lineHeight: 1.45 }}>{rd.why || "Business rule breached this period."}</span>
      </span>
      {rd.metric ? <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, color: "var(--goa-color-emergency-dark)", whiteSpace: "nowrap", flexShrink: 0 }}>{rd.metric}</span> : null}
    </div>
  ); }) : <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-s)", color: "var(--goa-color-success-dark)" }}><Ico name="checkmark-circle-outline" size={16} color="var(--goa-color-success-default)" />No rule violations — checklist passed.</span>;
  const recheckNode = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Ico name="time-outline" size={16} color="#5b4a9e" />
      <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, color: "#4a3d7a" }}>Re-check in</span>
      {["3 mo", "6 mo", "9 mo"].map((m) => <Chip key={m} text={m} on={rec === m} onClick={() => act.recheck(c.id, m)} />)}
      {rec ? <span style={{ font: "var(--goa-typography-body-xs)", color: "#4a3d7a" }}>Flag set — resurfaces {rec === "3 mo" ? "Oct 2026" : rec === "6 mo" ? "Jan 2027" : "Apr 2027"}</span> : null}
      <D n={6} />
    </span>
  );
  const ctaNode = (
    <span style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
      <ClaimCTAs
        watch={iWatch}
        hold={c.status === "hold"}
        reviewed={c.status === "reviewed" || c.status === "cleared"}
        supervisor={needsSup(c)} referred={c.status === "supervisor"}
        holdLabel={HOLD_ROUTE ? "Hold \u2192 " + HOLD_ROUTE + " follow-up" : null}
        onRefer={() => act.setStatus([c.id], c.status === "supervisor" ? "open" : "supervisor")}
        onWatch={() => {
          /* Toggle only the acting role's entry — never the whole provider record. */
          if (!act.watch) { act.setStatus([c.id], (c.status === "watchlist" || c.watch) ? "open" : "watchlist"); return; }
          act.watch.setRole({ pid: c.pid, name: c.name, addr: c.addr }, iWatch ? null : "Added from the queue — re-check next period.");
        }}
        onHold={() => act.setStatus([c.id], c.status === "hold" ? "open" : "hold")}
        onReviewed={() => act.setStatus([c.id], (c.status === "reviewed" || c.status === "cleared") ? "open" : "reviewed")} />
    </span>
  );
  const shell = { padding: vertical ? "14px 16px" : "12px 20px 14px 48px", background: "var(--goa-color-greyscale-50)", borderTop: "1px solid var(--goa-color-greyscale-200)", borderBottom: "2px solid var(--goa-color-greyscale-400)" };
  const rule = "1px solid var(--goa-color-greyscale-200)";
  const actionRow = (
    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", borderTop: rule, paddingTop: 10 }}>
      {ctaNode}
      <span style={{ marginLeft: "auto" }}>{recheckNode}</span>
    </div>
  );

  /* v3 "calm" — one verdict line, violations full-width, actions last.
     Drops the tinted banner, the score bar, the rank column, the driver bars and
     the explainer paragraph: three stacked bands instead of two competing columns. */
  if (EVIDENCE_LAYOUT === "calm") return (
    <div style={Object.assign({}, shell, { display: "flex", flexDirection: "column", gap: 11 })}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Ico name={band.icon} size={18} color={band.col} />
        <span style={{ fontFamily: MONO, fontSize: 21, fontWeight: 700, lineHeight: 1, color: band.textCol }}>{scoreTxt}</span>
        <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700, color: band.textCol }}>{band.w}</span>
        <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>· driven by <b style={{ fontWeight: 700, color: "var(--goa-color-text-default)" }}>{feats[0].name}</b> <span style={{ fontFamily: MONO, fontWeight: 700, color: band.textCol }}>+{feats[0].d}%</span></span>
        {/* R1 must be reachable in the DEFAULT layout: a disclosure keeps calm calm while still
           exposing note / flag / review-criterion against each model finding (§17.1). */}
        <GoabLinkButton size="compact" leadingIcon={drv ? "close-outline" : "chevron-down-outline"} onClick={() => setDrv(!drv)}>{drv ? "Hide drivers" : "Annotate " + feats.length + " drivers"}</GoabLinkButton>
        {annotCount ? <GoabBadge type="information" content={annotCount + " annotated"} emphasis="subtle" /> : null}
        <span style={{ marginLeft: "auto", font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", display: "inline-flex", alignItems: "center", gap: 6 }}>Analyzer · June 2026<D n={5} /></span>
      </div>
      {drv ? (
        <div style={{ display: "flex", flexDirection: "column", borderTop: rule, paddingTop: 8 }}>
          {feats.map((f, k) => <DriverRow key={k} c={c} f={f} k={k} band={band} maxD={maxD} st={st} act={act} variant="plain" />)}
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: rule, paddingTop: 10 }}>
        {violHead}
        {violNode}
      </div>
      {actionRow}
    </div>
  );

  /* v4 "focus" — the confirmed violations lead; the model score is a single
     footnote line with the drivers behind a disclosure (opt-in, not always-on). */
  if (EVIDENCE_LAYOUT === "focus") return (
    <div style={Object.assign({}, shell, { display: "flex", flexDirection: "column", gap: 10 })}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {violHead}
        {violNode}
      </div>
      <div style={{ borderTop: rule, paddingTop: 9, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Ico name="sparkles-outline" size={15} color="var(--goa-color-text-secondary)" />
        <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Analyzer model risk <b style={{ fontFamily: MONO, fontWeight: 700, color: band.textCol }}>{scoreTxt}</b> <span style={{ fontWeight: 700, color: band.textCol }}>{band.w}</span></span>
        <GoabLinkButton size="compact" onClick={() => setDrv(!drv)}>{drv ? "Hide drivers" : "Show 3 drivers"}</GoabLinkButton>
        <D n={5} />
      </div>
      {drv ? (
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 460 }}>
          {feats.map((f, k) => <DriverRow key={k} c={c} f={f} k={k} band={band} maxD={maxD} st={st} act={act} variant="plain" />)}
        </div>
      ) : null}
      {actionRow}
    </div>
  );

  /* v5 "quiet" — keeps two columns but one voice: no tints, no bars, no uppercase
     eyebrows, a single vertical rule between the score facts and the violations. */
  if (EVIDENCE_LAYOUT === "quiet") return (
    <div style={Object.assign({}, shell, { display: "grid", gridTemplateColumns: vertical ? "1fr" : "minmax(0,320px) 1fr", gap: vertical ? 14 : 26 })}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Model risk</span>
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 7 }}>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, lineHeight: 1, color: band.textCol }}>{scoreTxt}</span>
            <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, color: band.textCol }}>{band.w}</span>
          </span>
        </span>
        {feats.map((f, k) => <DriverRow key={k} c={c} f={f} k={k} band={band} maxD={maxD} st={st} act={act} variant="quiet" />)}
        <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", display: "inline-flex", alignItems: "center", gap: 6, marginTop: 2 }}>Analyzer · June 2026<D n={5} /></span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, borderLeft: vertical ? "none" : rule, paddingLeft: vertical ? 0 : 22 }}>
        {violHead}
        {violNode}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 2 }}>
          {ctaNode}
          <span style={{ marginLeft: "auto" }}>{recheckNode}</span>
        </div>
      </div>
    </div>
  );

  const leftCol = EVIDENCE_LAYOUT === "ledger" ? ledgerLayout : bannerLayout;
  return (
    <div style={Object.assign({}, shell, { display: "grid", gridTemplateColumns: vertical ? "1fr" : "1fr 1.2fr", gap: vertical ? 14 : 20 })}>
      {leftCol}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {violCount ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-emergency-dark)" }}><Ico name="warning-outline" size={14} color="var(--goa-color-emergency-dark)" />Rule violations · confirmed</span> : null}
        {violNode}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>{recheckNode}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>{ctaNode}</div>
      </div>
    </div>
  );
}

/* A11y (#9): the two series must not be told apart by COLOUR ALONE (WCAG 1.4.1) — the second
   series is dashed, and the legend swatch carries the same dash, so the key reads without hue.
   Index-keyed so a third series would inherit the next pattern rather than need a code change. */
const SERIES_DASH = [null, "6 4", "2 3"];
function LineChart({ title, months, series, refLine, refLabel, unit, yMax, yStep, yMin = 0 }) {
  const [hidden, setHidden] = React.useState({});
  const [hi, setHi] = React.useState(null);
  const [kbd, setKbd] = React.useState(false);
  const svgRef = React.useRef(null);
  const dashOf = (k) => SERIES_DASH[series.findIndex((s) => s.key === k) % SERIES_DASH.length];
  const W = 520, H = 240, padL = unit === "$" ? 54 : 40, padR = 14, padT = 14, padB = 30;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const vis = series.filter((s) => !hidden[s.key]);
  const span = Math.max(yStep, yMax - yMin);
  const x = (i) => padL + (plotW * i) / (months.length - 1);
  const y = (v) => padT + plotH - (plotH * (v - yMin)) / span;
  const path = (d) => d.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const ticks = Math.max(1, Math.round(span / yStep));
  /* MONTH LABELS MUST BE THINNED, NOT JUST DRAWN. User-caught 2026-08-25 ("chart broken"): all 12
     "Mon YYYY" labels were rendered at every point — measured 58 units wide on a ~42-unit pitch, so
     every label overlapped its neighbour by ~28% and the first one ran back under the y-axis
     figures. A fixed every-Nth step still left a sub-unit collision on the money chart (its wider
     y-gutter shortens the pitch), so this is a real COLLISION PASS: walk the months, keep a label
     only when it clears the last kept one. Nothing is hardcoded to 12 points or to either chart's
     padding, so a 6- or 24-month series thins itself. */
  const LBL_W = 58, LBL_GAP = 6;
  const lblX = (i) => (i === 0 ? padL - 4 : Math.min(x(i), W - padR - LBL_W / 2));
  const lblIdx = [];
  {
    let prevR = -Infinity;
    for (let i = 0; i < months.length; i++) {
      const l = i === 0 ? lblX(i) : lblX(i) - LBL_W / 2;
      if (l >= prevR + LBL_GAP) { lblIdx.push(i); prevR = l + LBL_W; }
    }
  }
  const fmtV = (v) => unit === "$" ? (v < 0 ? "($" : "$") + Math.abs(Math.round(v)).toLocaleString("en-CA") + (v < 0 ? ")" : "") : String(Math.round(v));
  const onMove = (e) => { if (!svgRef.current) return; const r = svgRef.current.getBoundingClientRect(); const rx = (e.clientX - r.left) / r.width * W; let idx = Math.round((rx - padL) / plotW * (months.length - 1)); idx = Math.max(0, Math.min(months.length - 1, idx)); setHi(idx); };
  /* The readout was mouse-only. Arrow keys walk the months so a keyboard reviewer gets the same
     figures, and the live region announces them without needing the tooltip to be seen. */
  const onKey = (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (d) { e.preventDefault(); setHi((h) => Math.max(0, Math.min(months.length - 1, (h == null ? 0 : h) + d))); }
    else if (e.key === "Escape") setHi(null);
  };
  const readout = hi == null ? "" : months[hi] + " — " + vis.map((s) => s.name + " " + fmtV(s.data[hi])).join(", ");
  return (
    <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>{title}</span>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {series.map((s) => { const off = hidden[s.key]; const dash = dashOf(s.key); return (
          <button key={s.key} type="button" aria-pressed={!off} onClick={() => setHidden((h) => ({ ...h, [s.key]: !h[s.key] }))} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, opacity: off ? 0.4 : 1, background: "none", border: "none", padding: "2px 4px", margin: -2, borderRadius: 4, color: "var(--goa-color-text-default)" }}>
            <svg width="14" height="4" aria-hidden="true" style={{ flexShrink: 0, overflow: "visible" }}><line x1="0" y1="2" x2="14" y2="2" stroke={s.color} strokeWidth="3" strokeDasharray={dash || undefined} strokeLinecap="round" /></svg>
            <span style={{ font: "var(--goa-typography-body-xs)", textDecoration: off ? "line-through" : "none" }}>{s.name}</span>
          </button>
        ); })}
        {refLine != null ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, borderTop: "2px dashed var(--goa-color-text-secondary)" }}></span><span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{refLabel}</span></span> : null}
      </div>
      <div style={{ position: "relative" }}>
        <svg ref={svgRef} viewBox={"0 0 " + W + " " + H} tabIndex={0} role="img"
          aria-label={title + " — " + vis.map((s) => s.name).join(" and ") + " over " + months.length + " months, newest " + months[0] + ". Use the left and right arrow keys to read each month."}
          onKeyDown={onKey} onFocus={() => { setKbd(true); setHi((h) => h == null ? 0 : h); }} onBlur={() => { setKbd(false); setHi(null); }}
          style={{ width: "100%", height: "auto", display: "block", outline: kbd ? "3px solid var(--goa-color-interactive-focus)" : "none", outlineOffset: 2, borderRadius: 4 }} onMouseMove={onMove} onMouseLeave={() => { if (!kbd) setHi(null); }}>
          {[...Array(ticks + 1)].map((_, t) => { const gy = padT + (plotH * t) / ticks; const gv = yMax - span * (t / ticks); return (
            <g key={t}>
              <line x1={padL} y1={gy} x2={W - padR} y2={gy} style={{ stroke: "var(--goa-color-greyscale-200)" }} strokeWidth="1" />
              <text x={padL - 6} y={gy + 3} textAnchor="end" style={{ fill: "var(--goa-color-text-secondary)", fontSize: 12, fontFamily: MONO }}>{fmtV(gv)}</text>
            </g>
          ); })}
          {refLine != null ? <line x1={padL} y1={y(refLine)} x2={W - padR} y2={y(refLine)} style={{ stroke: "var(--goa-color-text-secondary)" }} strokeWidth="1.5" strokeDasharray="5 4" /> : null}
          {lblIdx.map((i) => (
            /* The newest month sits ON the y-axis, so centring it puts half the label under the
               axis figures — anchor it left. The rest are centred, clamped inside the plot. */
            <text key={i} x={lblX(i)} y={H - 10} textAnchor={i === 0 ? "start" : "middle"} style={{ fill: "var(--goa-color-text-secondary)", fontSize: 12, fontFamily: MONO }}>{months[i]}</text>
          ))}
          {vis.map((s) => <path key={s.key} d={path(s.data)} fill="none" style={{ stroke: s.color }} strokeWidth="2" strokeDasharray={dashOf(s.key) || undefined} strokeLinejoin="round" strokeLinecap="round" />)}
          {vis.map((s) => s.data.map((v, i) => <circle key={s.key + i} cx={x(i)} cy={y(v)} r="2.6" style={{ fill: "var(--goa-color-greyscale-white)", stroke: s.color }} strokeWidth="1.5" />))}
          {hi != null ? <line x1={x(hi)} y1={padT} x2={x(hi)} y2={padT + plotH} style={{ stroke: "var(--goa-color-greyscale-400)" }} strokeWidth="1" /> : null}
          {hi != null ? vis.map((s) => <circle key={s.key} cx={x(hi)} cy={y(s.data[hi])} r="3.5" style={{ fill: s.color }} />) : null}
        </svg>
        {hi != null ? (
          <div style={{ position: "absolute", top: 0, left: (x(hi) / W * 100) + "%", transform: x(hi) > W / 2 ? "translateX(-105%)" : "translateX(5%)", background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-400)", borderRadius: 6, boxShadow: "var(--goa-shadow-raised-light)", padding: "6px 10px", pointerEvents: "none", whiteSpace: "nowrap" }}>
            <div style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, marginBottom: 2 }}>{months[hi]}</div>
            {vis.map((s) => <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-xs)" }}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }}></span>{s.name}: <b style={{ fontFamily: MONO }}>{fmtV(s.data[hi])}</b></div>)}
          </div>
        ) : null}
        <span aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{readout}</span>
      </div>
    </div>
  );
}
/* The trend charts sit directly under the KPI strip, so they must read from the SAME source: the
   newest point is this claim's own signed figure at its own period, the months behind it are the
   ACTUAL advance-basis months printed further down the page, and the labels are those months' own
   names — so a $0 on the chart is the same month the basis panel calls "no claim submitted". Older
   months keep the illustrative shape but are SCALED, never shifted, so they can never be flattened
   to a fabricated zero. The reference line is this provider's licensed capacity, never a literal. */
function InteractiveTrends({ cap, childrenNow, staffNow, claimNow, advanceNow, basis, period }) {
  const hist = (basis || []).slice(0, -1).reverse(); // months BEFORE this claim's period, newest first
  const months = [period].concat(hist.map((b) => b.m));
  while (months.length < 12) months.push(monLabel(monIndex(months[months.length - 1]) - 1));
  const scaleTail = (shape, from, ref) => { const tail = shape.slice(from); const avg = tail.reduce((a, v) => a + v, 0) / tail.length; const k = avg > 0 ? ref / avg : 1; return tail.map((v) => Math.round(v * k)); };
  const refLevel = hist.length ? Math.max(1, hist.reduce((a, b) => a + b.v, 0) / hist.length) : Math.abs(claimNow);
  const claimShape = [3300, 2900, 3700, 4900, 4600, 5700, 4300, 6300, 6900, 6800, 6600, 6700];
  const advShape = [2500, 2950, 2800, 3700, 3800, 4900, 4200, 5300, 6400, 6600, 6300, 6000];
  const claim = [Math.round(claimNow)].concat(hist.map((b) => b.v), scaleTail(claimShape, 1 + hist.length, refLevel));
  const adv = [Math.round(advanceNow)].concat(scaleTail(advShape, 1, advanceNow));
  const anchor = (shape, now) => { const k = shape[0] > 0 ? Math.max(0, now) / shape[0] : 1; return shape.map((v, i) => i === 0 ? Math.round(now) : Math.round(v * k)); };
  const children = anchor([55, 34, 68, 77, 63, 82, 60, 103, 116, 98, 93, 113], childrenNow);
  const staff = anchor([11, 18, 17, 33, 50, 66, 55, 60, 75, 86, 79, 71], staffNow);
  const niceStep = (span) => { const raw = span / 7; const mag = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw)))); return Math.max(mag, Math.ceil(raw / mag) * mag); };
  const moneyVals = claim.concat(adv);
  const moneyStep = niceStep(Math.max.apply(null, moneyVals) - Math.min(0, Math.min.apply(null, moneyVals)));
  const moneyMax = Math.ceil(Math.max.apply(null, moneyVals) / moneyStep) * moneyStep;
  const moneyMin = Math.min(0, Math.floor(Math.min.apply(null, moneyVals) / moneyStep) * moneyStep);
  const countMax = Math.max(25, Math.ceil(Math.max.apply(null, children.concat(staff, [cap])) / 25) * 25);
  return (
    <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
      <LineChart title="Payment/Advance Amounts" months={months} unit="$" yMax={moneyMax} yMin={moneyMin} yStep={moneyStep} series={[{ key: "claim", name: "Claim amount", data: claim, color: "var(--goa-color-interactive-default)" }, { key: "adv", name: "Advance amount", data: adv, color: "var(--goa-color-brand-default)" }]} />
      <LineChart title="Staff/Child Capacity" months={months} yMax={countMax} yStep={25} series={[{ key: "children", name: "Children claimed", data: children, color: "var(--goa-color-interactive-default)" }, { key: "staff", name: "Staff claimed", data: staff, color: "var(--goa-color-brand-default)" }]} refLine={cap} refLabel="License capacity" />
    </div>
  );
}
/* Child list — Figma "Modal - Child list" (6032:112184) verbatim: a PER-CHILD table, not an
   aggregate pivot. Heading is provider name + program ID, then an Age group dropdown, then
   Child ID (link) · Name (+ Subsidized badge) · Current month fee · Hours attended ·
   Estimated Aff. grant · Estimated subsidy — every column sortable (the Figma sort glyphs).
   Names are fake (privacy); amounts illustrative (G5). */
/* Staff on this claim — one constant, used by the KPI strip and the trend chart so they agree. */
const STAFF_N = 27;
const CHILD_AGE_GROUPS = [
  "Daycare - less than 12 months",
  "Daycare - 12 months to less than 19 months",
  "Daycare - 19 months to less than 3 years",
  "Daycare - 3 years to less than 4 years 8 months",
  "Preschool - 3 years to less than 4 years 8 months",
  "Kindergarten (outside school hours only)",
  "Out of school care - grade 1 and up",
];
/* Comments are kept PER CLAIM PERIOD (Figma "First Release - Payment Details" 7843:102821):
   a Claim period / Claim ID / Comments-count table that expands to that period's thread. */
/* Earlier periods for this claim, derived from its own period — a hardcoded year here would put the
   comment history on a different timeline from the header (t = month index, see monIndex). */
const commentPeriods = (t, clm, rd) => [
  { period: monLabel(t - 1), clm: String(parseInt(clm, 10) - 1), items: [
    { who: "Dana Whitfield (Subsidy EO)", when: dayAt(t, rd) + ", 02:10 PM", pub: false, body: "Subsidy spaces reconcile against the " + MON[((t - 1) % 12 + 12) % 12] + " attendance file." },
    { who: "Avery Solano (QA)", when: dayAt(t, rd) + ", 11:45 AM", pub: true, body: "@Dana Whitfield previous claim cleared without adjustment." },
  ], n: 10 },
  { period: monLabel(t - 2), clm: String(parseInt(clm, 10) - 2), items: [
    { who: "Alex Renn (Funding EO)", when: dayAt(t - 1, rd) + ", 09:20 AM", pub: false, body: "ICC supported-children count matches the approved plan." },
  ], n: 5 },
  { period: monLabel(t - 3), clm: String(parseInt(clm, 10) - 3), items: [
    { who: "Avery Solano (QA)", when: dayAt(t - 2, rd) + ", 10:05 AM", pub: true, body: "Wage top-up educator list verified against the licence." },
  ], n: 3 },
];
const ACT_BADGE = { "Paid": "success", "Released to 1GX": "success", "Ready for release": "success", "Review": "important", "Flag detected": "emergency", "Submitted": "light", "Validation error": "emergency", "Hold": "dark" };
const CHILD_FIRST = ["Beebe", "Rowan", "Imani", "Nadia", "Theo", "Juno", "Mateo", "Elise", "Kofi", "Sana", "Devon", "Aurel"];
const CHILD_LAST = ["Adriana", "Kowalchuk", "Osei", "Lindqvist", "Marchand", "Tran", "Bellamy", "Okonkwo", "Reyes", "Sandhu", "Whitecalf", "Ferreira"];
/* Deterministic rows per age group. One child in the daycare 19-months band reports hours far past
   the monthly maximum — the data-integrity signal the header callout points at (guardrail:
   surface data-integrity issues early). */
function childrenFor(group, mi) {
  const seed = CHILD_AGE_GROUPS.indexOf(group) + 1;
  const m = mi == null ? 3 : mi;
  const n = 5 + ((seed + m) % 3);
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = seed * 7 + i * 5 + m * 3;
    const sub = (k % 3) !== 0;
    const flagged = seed === 3 && i === 2 && m === 3;
    out.push({
      id: String(120000 + k * 13),
      name: CHILD_LAST[k % 12] + ", " + CHILD_FIRST[(k + 3) % 12] + " " + CHILD_FIRST[(k + 7) % 12],
      sub,
      fee: 1275 + (k % 5) * 60,
      hours: flagged ? 310 : [56, 78, 12, 78, 54, 96, 33, 61][(k + i) % 8],
      ag: 275,
      subsidy: sub ? 75 + (k % 4) * 25 : null,
      flagged,
    });
  }
  return out;
}
/* CCFOPS-394 (FDH) / 391 (WTU) — a funding vehicle does not open into a flat line-item list: it
   opens into that vehicle's OWN review surface. The surface is DATA — a numbered flag list, the
   vehicle's modifier KPIs, a trend chart and a table — so a new vehicle is one entry here and
   nothing else changes (G3). Wording and column names are the Figma strings; figures are the
   designers' placeholders and stay illustrative. */
/* Muted DARK categorical fills — user 2026-08-13 ("apply more muted darker colors, this is too
   bright for a GOA space"), superseding the pastel -default fills of the same morning. The extended
   palette's dark values are published as its -text tokens — the only dark categorical values the
   DS defines — so their use as fills here is a deliberate, recorded role-reuse under instruction. */
/* Categorical bar fills are the extended palette's -default mid-tones (#90ebe7 / #d4c2ff / #ff9ac1
   — three separable hues). The a11y pass had swapped them to the -text shades — #093937 / #151d83 /
   #310c46, three near-blacks nobody can tell apart (user 2026-08-13, cc-2). -text is a FONT token
   (the DS adherence map types it "font"); bars are fills. Legend text never used series colour, so
   text contrast is untouched; the 0.18 inset stroke keeps pastel bars edged against white. */
const SERIES_COLORS = ["var(--goa-color-extended-sky-default)", "var(--goa-color-extended-lilac-default)", "var(--goa-color-extended-dawn-default)"];
/* Twelve months back from the claim's own period, newest first — the same derivation the
   Payment/Advance chart, the child-list tabs, the comments and the audit trail use. */
const CHART_MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => monLabel(CLAIM_PERIOD_T - k));
/* Vehicles held inert at the user's request (2026-08-10): listed with their badge and total, but
   the header does not open. Unclickable, NOT removed — "disable means unclickable, remove means
   remove". A list so a vehicle joins or leaves without touching the accordion's markup. */
const DISABLED_VEHICLES = { sub: true, icc: true };
const VEHICLE_DETAIL = {
  /* CCFOPS-394 "Claim Details - FDH" (8407:35170) + "Educator's information" (8354:220300),
     transcribed verbatim from figma-source/fdh-accordion.json. Two source oddities ship as-is per
     RULES SRC: the unfilled "[specified timeframe]" placeholder and the "modifers" misspelling.
     The source's own table does not sum to its header ($2,400 listed vs $1,234.56) — that is the
     file's arithmetic, not a scaling artefact, so no moneyBasis reconciliation is applied here. */
  fdh: {
    flags: [
      "License has not been updated within [specified timeframe], indicating potential discrepancies in Educator eligibility or status.",
      "No children associated to Educator Bradford Antwan Souza.",
      "Rural modifers associated to claim.",
    ],
    kpis: [
      { l: "Base Educators", v: "6", sub: "$2,400" },
      { l: "Rural Educators", v: "1", sub: "$83.33" },
      { l: "New Educators", v: "1", sub: "$1,000" },
      { l: "Inactive Educators", v: "1" },
      { l: "License Updated", v: "June 5th, 2024", warn: true },
    ],
    chart: {
      title: "Educator Trends", months: CHART_MONTHS, yMax: 12, yStep: 2, unit: " educators",
      series: [
        { name: "Base Educators", data: [6, 6, 6, 5, 5, 6, 6, 6, 5, 5, 4, 4] },
        { name: "Rural Educators", data: [1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1] },
        { name: "New Educators", data: [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0] },
      ],
    },
    table: {
      title: "Educators",
      /* CR — FDH MVP Review: this table's names open the Educator Information sheet. A data flag, so
         another vehicle opts in with one line rather than a branch (G3). */
      educatorSheet: true,
      cols: [{ k: "cert", l: "Cert ID", mono: true }, { k: "name", l: "Name" }, { k: "level", l: "Level", n: true }, { k: "rural", l: "Rural Modifier" }, { k: "region", l: "Region" }, { k: "newmod", l: "New Edu. Modifier" }, { k: "prev", l: "Prev Hours", n: true }, { k: "rate", l: "Base Rate", n: true }],
      rows: [
        { cert: "123456", name: "Jordyn Herwitz", active: true, level: "3", rural: "", region: "", newmod: "$1,000.00", prev: "0", rate: "$400.00" },
        { cert: "123456", name: "Ari Marcos", active: true, level: "1", rural: "", region: "", newmod: "", prev: "", rate: "$400.00" },
        { cert: "123456", name: "Bradford Antwan Souza", active: true, level: "1", rural: "", region: "", newmod: "", prev: "", rate: "$400.00", flag: "rate", note: "No children associated to Educator Bradford Antwan Souza." },
        { cert: "123456", name: "Dontae Forrest Milam", active: true, level: "3", rural: "$83.33", region: "Central", newmod: "", prev: "", rate: "$400.00", flag: "rural", note: "Rural modifers associated to claim." },
        { cert: "123456", name: "Duval Eva", active: true, level: "3", rural: "", region: "", newmod: "", prev: "", rate: "$400.00" },
        { cert: "123456", name: "Emalee Sandin", active: true, level: "2", rural: "", region: "", newmod: "", prev: "", rate: "$400.00" },
        { cert: "123456", name: "Milam Forrest Dontae", active: false, level: "2", rural: "", region: "", newmod: "", prev: "", rate: "$0.00" },
      ],
    },
  },
  /* CCFOPS-391 "First Release - Details - QA" (7710:225363), component "Expand=True" (6017:38556),
     transcribed verbatim from figma-source/wtu-accordion.json. The KPI strip is the source's five —
     an earlier build carried a sixth, "Child care hours per child", and re-read the source's 35.0
     as hours-per-child; the source labels 35.0 "Child-to-staff ratio" and that label is the file's.
     Row amounts are the source literals, including Smith Ethan's "462.00" with no dollar sign.
     Listed rows sum to $11,739.10 against a $2,123.00 header — the source's own arithmetic. */
  wtu: {
    flags: [
      "Child-to-staff ratio threshold exceeded.",
      "Excessive admin hours detected for Ari Marcos.",
    ],
    kpis: [
      { l: "Staff", v: "27" },
      { l: "Child care hours", v: "3,850" },
      { l: "Admin hours", v: "234" },
      { l: "Children", v: "110" },
      { l: "Child-to-staff ratio", v: "35.0" },
    ],
    chart: {
      title: "Child/Staff Trends", months: CHART_MONTHS, yMax: 240, yStep: 40, unit: "",
      /* The 12 ratio chips are the source's, verbatim and in source order — the current month
         first. The bar series shapes are NOT in the reconstruction (the frame gives axis ranges
         only), so they stay as authored; only the axis maxima come from the source. */
      ratioLabel: "Child-to-staff ratio", ratios: ["35.0", "25.8", "23.4", "21.5", "21.3", "26.0", "31.1", "24.4", "21.5", "22.5", "21.3", "21.5"],
      series: [
        { name: "Children claimed", data: [110, 108, 105, 106, 103, 106, 107, 101, 100, 103, 102, 98] },
        { name: "Staff hours (Direct child care)", data: [27, 29, 30, 29, 31, 30, 29, 32, 32, 31, 31, 33] },
      ],
    },
    table: {
      title: "Educator hours",
      cols: [{ k: "cert", l: "Cert ID", mono: true }, { k: "name", l: "Name" }, { k: "role", l: "Role" }, { k: "level", l: "Level", n: true }, { k: "care", l: "Child care hrs", n: true }, { k: "admin", l: "Admin hrs", n: true }, { k: "paid", l: "Paid hrs", n: true }, { k: "amt", l: "Amount", n: true }],
      rows: [
        { cert: "123456", name: "Ari Marcos", active: true, role: "Direct child care", level: "3", care: "0", admin: "175", paid: "175", amt: "$1,508.00", flag: "admin", note: "Excessive admin hours detected for Ari Marcos." },
        { cert: "123456", name: "Duval Eva", active: true, role: "Director/Assistant", level: "3", care: "175", admin: "0", paid: "175", amt: "$1,508.00" },
        { cert: "123456", name: "Johnson Maya", active: true, role: "Direct child care", level: "1", care: "175", admin: "0", paid: "175", amt: "$462.00" },
        { cert: "123456", name: "Smith Ethan", active: true, role: "Direct child care", level: "1", care: "175", admin: "0", paid: "175", amt: "462.00" },
        { cert: "123456", name: "Patel Aisha", active: true, role: "Director/Assistant", level: "3", care: "175", admin: "0", paid: "175", amt: "$1,508.00" },
        { cert: "123456", name: "Lee Michael", active: true, role: "Direct child care", level: "3", care: "60", admin: "0", paid: "60", amt: "$517.20" },
        { cert: "123456", name: "Kim Daniel", active: true, role: "Direct child care", level: "3", care: "0", admin: "145", paid: "145", amt: "$1,249.90" },
        { cert: "123456", name: "Williams Liam", active: true, role: "Direct child care", level: "3", care: "175", admin: "0", paid: "175", amt: "$1,508.00" },
        { cert: "123456", name: "Garcia Noah", active: true, role: "Direct child care", level: "3", care: "175", admin: "0", paid: "175", amt: "$1,508.00" },
        { cert: "123456", name: "Brown Isabella", active: true, role: "Direct child care", level: "1", care: "175", admin: "0", paid: "175", amt: "$1,508.00" },
      ],
    },
  },
  icc: {
    flags: ["Contract limit risk: the accumulated contract amount is greater than 80% of the total contract value."],
    /* Utilization is the quotient of the two figures above it, and the expiry KPI answers to the
       claim's own flags: a claim flagged "Contract expired" cannot also be told its contract runs
       to next March. Both come from the same place the flag text does. */
    derive: ({ flags }) => {
      const value = 68000, used = 58480;
      const dead = (flags || []).indexOf("Contract expired") >= 0;
      return {
      flags: (dead ? ["Contract expired: the contract covering this payment expired " + CONTRACT.expired + ", before the claim period ended. Payment cannot be released against an expired contract."] : [])
        .concat("Contract limit risk: the accumulated contract amount is greater than 80% of the total contract value."),
      kpis: [
        { l: "Contract value", v: money(value) },
        { l: "Accumulated to date", v: money(used) },
        { l: "Contract utilization", v: Math.round((used / value) * 100) + "%", warn: used / value > 0.8 },
        { l: "Supported children", v: "4" },
        { l: dead ? "Contract expired" : "Contract expires", v: dead ? CONTRACT.expired : CONTRACT.term, warn: dead },
      ] };
    },
  },
};

/* No GoA chart component exists, so this is a custom SVG — but it mirrors the Figma series order,
   axis direction (newest month LEFT), tick scale and labels, and it is interactive: hover reads
   out a month, and a legend entry toggles its series. Colours come from the extended (categorical)
   palette tokens, never the semantic set. */
function GroupedBars({ months, series, yMax, yStep, unit, ratios, ratioLabel, ratioLimit }) {
  const [off, setOff] = React.useState({});
  const [foc, setFoc] = React.useState(null);
  const [hov, setHov] = React.useState(null);
  const shown = series.filter((s) => !off[s.name]);
  const W = 760, H = 168, padL = 34, padB = 22, padT = 6;
  const iw = W - padL, ih = H - padB - padT;
  const step = iw / months.length;
  const bw = Math.max(3, (step - 10) / Math.max(1, shown.length));
  const ticks = []; for (let v = yMax; v >= 0; v -= yStep) ticks.push(v);
  const yOf = (v) => padT + ih - (v / yMax) * ih;
  const unitFor = (v) => !unit ? "" : (Math.abs(v) === 1 ? unit.replace(/s$/, "") : unit);
  const read = hov == null ? null : hov;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", minHeight: 22 }}>
        {series.map((s, i) => (
          <button key={s.name} type="button" aria-pressed={!off[s.name]} onClick={() => setOff((o) => ({ ...o, [s.name]: !o[s.name] }))}
            onFocus={() => setFoc(s.name)} onBlur={() => setFoc(null)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: "2px 4px", margin: -2, borderRadius: 4, cursor: "pointer", opacity: off[s.name] ? 0.4 : 1, font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-default)", outline: foc === s.name ? "3px solid var(--goa-color-interactive-focus)" : "none", outlineOffset: 1 }}>
            <span style={{ width: 11, height: 11, borderRadius: 2, flexShrink: 0, background: SERIES_COLORS[i % SERIES_COLORS.length], boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)" }}></span>
            <span style={{ textDecoration: off[s.name] ? "line-through" : "none" }}>{s.name}</span>
          </button>
        ))}
        <span style={{ flex: 1 }}></span>
        {read != null ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, font: "var(--goa-typography-body-xs)" }}>
            <b>{months[read]}</b>
            {shown.map((s, i) => <span key={s.name} style={{ fontFamily: MONO, fontSize: 12 }}>{s.name}: <b>{s.data[read]}{unitFor(s.data[read])}</b></span>)}
            {ratios ? <span style={{ fontFamily: MONO, fontSize: 12 }}>{ratioLabel}: <b>{ratios[read]}</b></span> : null}
          </span>
        ) : <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Hover a month for the readout · newest month first</span>}
      </div>
      {ratios ? (
        <div style={{ display: "grid", gridTemplateColumns: (padL / W * 100).toFixed(3) + "% 1fr" }}>
          <span></span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(" + months.length + ", 1fr)", gap: 2 }}>
            {ratios.map((r, i) => (
              <span key={i} style={{ textAlign: "center", fontFamily: MONO, fontSize: 12, fontWeight: 700, padding: "2px 0", borderRadius: 4, background: i === read ? "var(--goa-color-info-background)" : "var(--goa-color-greyscale-100)", color: ratioLimit != null && parseFloat(r) > ratioLimit ? "var(--goa-color-emergency-dark)" : "var(--goa-color-text-secondary)" }}>{r}</span>
            ))}
          </div>
        </div>
      ) : null}
      {/* A11y (#9) — same keyboard readout as the line charts, and a label that says what the
         chart is rather than "Trend chart". Focus starts on the newest month (leftmost). */}
      <svg viewBox={"0 0 " + W + " " + H} width="100%" role="img" tabIndex={0}
        aria-label={series.map((s) => s.name).join(", ") + " over " + months.length + " months, newest " + months[0] + " first. Use the left and right arrow keys to read each month."}
        onKeyDown={(e) => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { e.preventDefault(); setHov((h) => Math.max(0, Math.min(months.length - 1, (h == null ? 0 : h) + d))); } else if (e.key === "Escape") setHov(null); }}
        onFocus={() => setHov((h) => h == null ? 0 : h)} onBlur={() => setHov(null)}
        onMouseLeave={() => setHov(null)} style={{ display: "block", borderRadius: 4 }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={yOf(t)} y2={yOf(t)} stroke="var(--goa-color-greyscale-200)" strokeWidth="1" />
            <text x={padL - 6} y={yOf(t) + 4} textAnchor="end" fontFamily={MONO} fontSize="10" fill="var(--goa-color-text-secondary)">{t}</text>
          </g>
        ))}
        {months.map((m, mi) => {
          const gx = padL + mi * step;
          return (
            <g key={m} onMouseEnter={() => setHov(mi)}>
              <rect x={gx} y={padT} width={step} height={ih} fill={mi === read ? "var(--goa-color-info-background)" : "transparent"} />
              {shown.map((s, si) => {
                const v = s.data[mi];
                const h = Math.max(0, (v / yMax) * ih);
                return <rect key={s.name} x={gx + 5 + si * bw} y={padT + ih - h} width={bw - 1} height={h} rx="1"
                  fill={SERIES_COLORS[series.indexOf(s) % SERIES_COLORS.length]} stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />;
              })}
              <text x={gx + step / 2} y={H - 6} textAnchor="middle" fontFamily={MONO} fontSize="10" fill="var(--goa-color-text-secondary)">{m}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W} y1={padT + ih} y2={padT + ih} stroke="var(--goa-color-greyscale-400)" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* CR — FDH MVP Review (design in progress). The fee categories an agency claims per educator, each
   with the justification checklist the reviewer works through. An item marked `open` has no
   supporting record on file, and a tab's warning is DERIVED from those — the Admin fee reads as
   flagged because of what is missing, never because a warning was typed onto it. Categories are
   data: a new fee is a list entry, not a branch (G3). Items and amounts are the handoff's;
   figures stay illustrative. */
const FEE_JUSTIFICATION = [
  { key: "base", label: "Base Rate", amt: 400, note: "Last updated Jan 1, 2025",
    items: ["Backup care", "Monitoring visits", "Placement support", "Records forms", "Recruitment approval", "Safety checks", "Training", "Educator group meetings", "Other"] },
  { key: "admin", label: "Admin fees", amt: 600, note: "Last updated Jan 1, 2025",
    items: ["Backup care", "Monitoring visits", { l: "Placement support", open: true }, "Records forms", "Recruitment approval", "Safety checks", "Training", { l: "Educator group meetings", open: true }, { l: "Other", open: true }] },
  { key: "extra", label: "Extra fees", amt: 30, note: "Last updated Jan 1, 2025",
    items: [{ l: "Insurance services", open: true }, "Resource/Lending libraries", "Bookkeeping services", { l: "Marketing/Advertising", open: true }, "App/Website subscriptions", "Other"] },
];
const feeItems = (f) => f.items.map((it) => (typeof it === "string" ? { l: it, open: false } : it));
/* The sheet reads the ROW it was opened from — level, region, rural and active status have one
   home, so it can never state a different level than the table beside it. Only the fields the
   table does not carry are derived, deterministically from the certificate ID, on the same month
   stepper every other date on this page uses. */
function educatorRecord(r) {
  return {
    cert: "123456", name: r.name, active: r.active, level: "Level 1 Early Childhood Educator",
    region: "Central", rural: true,
    addr: "123 4th Street SW Calgary, T2E7N2",
    dob: "Dec 05, 2018", commenced: "Jul 05, 2020", certified: "Jul 05, 2020",
    terminated: null, vacation: null,
  };
}
/* Educator Information sheet — transcribed from CR — FDH MVP Review / "Educator details"
   (9545:29442). Sheet 571w, padding 48/24, inner column 523w with gap 32; header 498×44 with a
   36px/44px Acumin Pro SemiCondensed title in rgb(51,51,51) and a 40×40 close button; field rows
   are paired Text Rows, first column 275 minWidth 275, gap 10 across and 9 down; then goa-Tabs
   (52h) and THREE STACKED goa-List sections, gap 8, checkboxes two per row at 28h.
   Chrome is the COMPONENT'S: heading / onClose / actions props, never hand-built inside children.
   An earlier build rolled its own title row, close button and footer button to force the frame's
   36px title — hand-rolling what GoabDrawer already exposes. The heading therefore renders at the
   design system's drawer-heading size, not the frame's 36px; recorded as a divergence, not patched.
   An earlier build used a 2-column grid, an invented "Fee justification" eyebrow, and one fee
   category per tab. None of that is in the frame.
   Two source placeholders shipped verbatim until 2026-08-11, when the user named the real tab
   labels ("Agency fees", "Children (5)"). The frame's third placeholder — goa-Button's default
   label "Button" on the footer — shipped verbatim until 2026-08-13, when the user ruled it out
   (cc-3 "find correct one"): the button closes the drawer, so it reads Close, the Provider details
   drawer's own action word (exempt.actionLabel in educator-drawer.json). */
function EducatorSheet({ row, checks, onCheck, onClose }) {
  const { GoabDrawer, GoabButton, GoabBadge, GoabCheckbox, GoabTooltip, GoabTabs, GoabTab } = NS();
  if (!GoabDrawer) return null;
  const e = educatorRecord(row);
  /* GoA label + text component specs (user instruction 2026-08-11), copied into
     figma-source/frames/9545-29442/ as goa-Label.jsx and goa-Text.jsx:
       label  goa-Label 9581:27180 "optional/required=None, Size=Default" — 18px / 700 / 28px
       value  goa-Text  2531:25911 "Type=Text M (p)"                     — 18px / 400 / 28px
     both Acumin Pro SemiCondensed, rgb(51,51,51). The frame itself instances the Text component for
     its labels too (so 400), but the design system's Label component is the spec for a label and the
     instruction is explicit. Earlier today I moved these labels from 16px/700 to 18px/400: the size
     was right, the weight was wrong, and I justified the weight from a character-width estimate
     rather than from a component spec. */
  /* Label + value typography is the PROVIDER DETAILS drawer's, not the frame's own 18px/28px — user
     instruction 2026-08-12 ("follow the label+text sizes same as in provider information modal
     drawer"). The two drawers sit side by side in the same review, so one label/value treatment for
     both outranks matching each frame separately. Divergence recorded in educator-drawer.json. */
  const LBL = { font: "var(--goa-typography-body-s)", fontWeight: 700, color: "rgb(51,51,51)" };
  const VAL = { font: "var(--goa-typography-body-s)", fontWeight: 400, color: "rgb(51,51,51)" };
  const cell = (label, value, extra) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-start", minWidth: 0 }}>
      <span style={{ ...LBL, overflowWrap: "break-word" }}>{label}</span>
      <span style={{ ...VAL, wordBreak: "break-word" }}>{value}</span>
      {extra || null}
    </div>
  );
  /* Two equal columns that fill the drawer, the same grid the provider drawer's `pair` uses — user
     instruction 2026-08-12 ("make this info grid fill width with auto spacing").
     Replaces a fixed `flex: 0 1 180px` left column, which pinned every label to a 180px lane and left
     a wide dead gutter down the right of the drawer. The 180 was derived from the frame's widest
     first-column string; minmax(0,1fr) makes that derivation unnecessary rather than wrong — the
     columns now size themselves and long values still wrap because both tracks floor at 0. */
  const row2 = (a, b) => (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14, alignItems: "start" }}>{a}{b || null}</div>
  );
  return (
    <GoabDrawer open position="right" maxSize="571px" heading="Educator Information" onClose={onClose}
      actions={<GoabButton type="primary" size="compact" onClick={onClose}>Close</GoabButton>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "stretch" }}>
        {/* Active/Inactive badge rides beside the Certificate ID value — user instruction
           2026-08-12 ("move active badge beside cert id value"); it sat under the name. */}
        {row2(
          cell("Educator\u2019s name", e.name),
          cell("Certificate ID", <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{e.cert}<GoabBadge type={e.active ? "success" : "light"} content={e.active ? "Active" : "Inactive"} emphasis="subtle" /></span>))}
        {row2(
          cell("Day home address", e.addr),
          cell("Region", <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>{e.region}{e.rural ? <GoabBadge type="information" content="Rural Educator" emphasis="subtle" /> : null}</span>))}
        {row2(cell("Date of birth", e.dob), cell("Commencement date", e.commenced))}
        {row2(cell("Certification level", e.level), cell("Certification date", e.certified))}
        {row2(cell("Termination date", e.terminated || "-"), cell("Vacation date", e.vacation || "-"))}
        {GoabTabs ? (
          <div style={{ alignSelf: "stretch" }}>
            <GoabTabs initialTab={1}>
              {/* Labels set by the user 2026-08-11, overriding the frame's five placeholder "Tab item"
                 tabs (2603:57272 "# of tabs=5"). The count badge the frame put on one tab now
                 carries a real number via TabHeading instead of the placeholder "#". */}
              <GoabTab heading="Agency fees"><span></span></GoabTab>
              <GoabTab heading={<TabHeading h="Children (5)" />}><span></span></GoabTab>
            </GoabTabs>
          </div>
        ) : null}
        {FEE_JUSTIFICATION.map((f) => {
          const its = feeItems(f);
          const done = checks[f.key] || {};
          const isOn = (it) => (done[it.l] != null ? done[it.l] : !it.open);
          const missing = its.filter((it) => !isOn(it));
          return (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", alignSelf: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "row", gap: 12, alignItems: "flex-start", alignSelf: "stretch" }}>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ ...LBL, display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {f.label} - ${f.amt}
                    {/* The missing-record warning was a GoabCallout under each fee section, which put
                       three amber banners on one surface. User moved it onto this badge as a tooltip
                       (2026-08-11). The count stays as badge text so the warning is not hover-only. */}
                    {missing.length ? (() => {
                      const msg = missing.length + " item" + (missing.length > 1 ? "s" : "") + " without a supporting record: "
                        + missing.map((m) => m.l).join(" \u00b7 ") + " \u2014 confirm each with the agency before the " + f.label.toLowerCase() + " is released.";
                      const badge = <GoabBadge type="important" icon emphasis="subtle" content={String(missing.length)} />;
                      return GoabTooltip
                        ? <GoabTooltip content={msg} position="top" maxWidth="300px">{badge}</GoabTooltip>
                        : <span title={msg}>{badge}</span>;
                    })() : null}
                  </span>
                  <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{f.note}</span>
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, alignSelf: "stretch" }}>
                {its.map((it) => (
                  <GoabCheckbox key={it.l} size="compact" disabled name={"fee-" + f.key + "-" + it.l} text={it.l} checked={isOn(it)} onChange={() => onCheck(f.key, it.l, !isOn(it))} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </GoabDrawer>
  );
}

/* The vehicle's own table. A flagged cell carries a warning icon on an amber row (Figma). */
function VehicleTable({ cols, rows, scale, remainder, onOpen }) {
  const { GoabTooltip, GoabLinkButton, GoabBadge } = NS();
  /* One text size across the whole table — user instruction 2026-08-12 ("normalize table text
     size in all accordions"): cells matched headers at body-xs; the 12.5px mono override that made
     number columns read smaller than text columns is gone. */
  const th = { padding: "7px 10px", font: "var(--goa-typography-body-xs)", fontWeight: 700, whiteSpace: "nowrap", borderBottom: "2px solid var(--goa-color-greyscale-400)", background: "var(--goa-color-greyscale-white)" };
  const show = (cl, r) => cl.money ? money(r[cl.k] * (scale == null ? 1 : scale)) : r[cl.k];
  return (
    /* overflow must stay visible: a flagged cell's GoabTooltip renders inside the cell, so an
       overflowX:auto scroll box clips it (overflow-x:auto forces overflow-y to a clipping value —
       they cannot be split). This table's columns are few and narrow enough not to need the
       scroller; the two wider tables below keep theirs because they have no tooltips. */
    <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 6, overflow: "visible", background: "var(--goa-color-greyscale-white)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{cols.map((cl) => <th key={cl.k} style={{ ...th, textAlign: cl.n ? "right" : "left" }}>{cl.l}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.cert} style={{ background: r.flag ? "var(--goa-color-warning-background)" : undefined }}>
              {cols.map((cl) => {
                const td = { padding: "7px 10px", borderBottom: "1px solid var(--goa-color-greyscale-200)", textAlign: cl.n ? "right" : "left", whiteSpace: "nowrap", font: "var(--goa-typography-body-xs)", fontFamily: cl.mono || cl.n ? MONO : undefined };
                const isFlag = r.flag === cl.k;
                const body = cl.k === "name"
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: r.active ? "var(--goa-color-success-default)" : "var(--goa-color-greyscale-400)" }} title={r.active ? "Active" : "Inactive"}></span>{onOpen && GoabLinkButton ? <GoabLinkButton size="compact" onClick={() => onOpen(r)}>{r.name}</GoabLinkButton> : r.name}</span>
                  : show(cl, r);
                if (!isFlag) return <td key={cl.k} style={td}>{body}</td>;
                {/* GoA badge important/strong, icon only — user 2026-08-13 (cc-3): the flagged-cell
                   marker is the frames' own goa-Badge Type=Warning Icon=Yes Content=No, not a bare
                   glyph. Boolean icon lets the DS pick alert-circle for important. */}
                const cell = <span style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: cl.n ? "flex-end" : "flex-start", fontWeight: 700, color: "var(--goa-color-warning-text)" }}><GoabBadge type="important" icon ariaLabel="Flagged" />{body}</span>;
                return <td key={cl.k} style={td}>{GoabTooltip ? <GoabTooltip content={r.note} position="top" maxWidth="260px">{cell}</GoabTooltip> : <span title={r.note}>{cell}</span>}</td>;
              })}
            </tr>
          ))}
          {/* A sampled table must still reconcile to the vehicle it sits inside. */}
          {remainder ? (
            <tr>
              <td colSpan={cols.length - 1} style={{ padding: "8px 10px", font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{remainder.label}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", font: "var(--goa-typography-body-xs)", fontFamily: MONO, color: "var(--goa-color-text-secondary)" }}>{moneyEl(remainder.amt)}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

/* A vehicle's detail is resolved ONCE per render and shared. derive() used to run only inside
   VehicleReview, so a flag it added existed in the open panel but not in the header badge or the
   claim-level rollup, which both still counted the raw static array — one fact, three answers. */
function vehicleDetail(key, ctx) {
  const raw = VEHICLE_DETAIL[key];
  if (!raw) return null;
  return raw.derive ? Object.assign({}, raw, raw.derive(ctx || {})) : raw;
}
/* One review surface, rendered from VEHICLE_DETAIL — identical shape for every vehicle. */
function VehicleReview({ d, label, amt, showFlags = true }) {
  const { GoabCallout, GoabButton } = NS();
  /* Hooks stay above the guard so a vehicle without a detail can't change the hook order. */
  const [edu, setEdu] = React.useState(null);
  const [feeChecks, setFeeChecks] = React.useState({});
  const toggleFee = React.useCallback((cert, fk, item, next) => setFeeChecks((p) => {
    const per = p[cert] || {}; const grp = per[fk] || {};
    return Object.assign({}, p, { [cert]: Object.assign({}, per, { [fk]: Object.assign({}, grp, { [item]: next }) }) });
  }), []);
  if (!d) return null;
  /* Every dollar on this surface derives from the vehicle's own amount, which derives from c.amtN.
     A table that lists a SAMPLE scales to its share and reconciles with a remainder row; a complete
     table scales to the whole. Counts and hours are the design's and stay as they are. */
  const basis = d.moneyBasis;
  const rowN = d.table ? d.table.rows.length : 0;
  const pop = d.table && d.table.sampleOf ? d.table.sampleOf : rowN;
  const kpiScale = basis && amt != null ? amt / basis : 1;
  const rowScale = basis && amt != null ? (amt * (rowN / Math.max(1, pop))) / basis : 1;
  const listed = d.table ? d.table.rows.reduce((a, r) => a + (typeof r[(d.table.cols.filter((cl) => cl.money)[0] || {}).k] === "number" ? r[d.table.cols.filter((cl) => cl.money)[0].k] : 0), 0) * rowScale : 0;
  const remainder = d.table && d.table.sampleOf && amt != null
    ? { label: (pop - rowN) + " more of " + pop + " not shown \u2014 this table lists the highest-value sample", amt: amt - listed }
    : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "14px 16px", borderTop: "1px solid var(--goa-color-greyscale-200)", background: "var(--goa-color-greyscale-white)" }}>
      {/* CCFOPS-385 — several flags collapse into ONE callout with a numbered list, never N stacked callouts. */}
      {showFlags && d.flags && d.flags.length ? (
        <GoabCallout type="important" size="medium" mb="none" heading="Flag details">
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
            {d.flags.map((f, i) => <li key={i} style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>{f}</li>)}
          </ol>
        </GoabCallout>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {d.kpis.map((k) => (
          <div key={k.l} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 12px", borderRadius: 6, border: "1px solid " + (k.warn ? "var(--goa-color-warning-dark)" : "var(--goa-color-greyscale-200)"), background: k.warn ? "var(--goa-color-warning-background)" : "var(--goa-color-greyscale-50)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>
              {/* alert-circle, not the warning triangle — user 2026-08-13 "apply GOA warning icon, not
                 emergency icon": in GoA vocabulary the triangle belongs to EMERGENCY (Badge/Callout/
                 Notification.svelte all map emergency→warning, important→alert-circle). */}
              {k.warn ? <Ico name="alert-circle-outline" size={15} color="var(--goa-color-warning-dark)" /> : null}{k.l}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700 }}>{k.v}</span>
            {k.sub || k.subAmt != null ? <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{k.subAmt != null ? money(k.subAmt * kpiScale) : k.sub}</span> : null}
          </div>
        ))}
      </div>
      {d.chart ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{d.chart.title}</span>
          <GroupedBars {...d.chart} />
        </div>
      ) : null}
      {d.table ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{d.table.title}</span>
          <VehicleTable cols={d.table.cols} rows={d.table.rows} scale={rowScale} remainder={remainder} onOpen={d.table.educatorSheet ? setEdu : null} />
        </div>
      ) : null}
      {edu ? <EducatorSheet row={edu} checks={feeChecks[edu.cert] || {}} onCheck={(fk, item, next) => toggleFee(edu.cert, fk, item, next)} onClose={() => setEdu(null)} /> : null}
      {/* A vehicle-level "Reject <label>" button lived here, enabled by VEHICLE_DETAIL.wtu.reject and
         attributed in a comment to CCFOPS-391. Removed by user decision 2026-08-12 after the
         attribution was checked and found false: the WTU record has no reject entry, the copied WTU
         frame source (figma-source/frames/7710-225363, incl. ExpandTrue2 and WTU) has none, and the
         only Reject buttons in the .fig sit on the Funding / FDH / ICC claim-details accordions — so
         the build had it on the one vehicle the source omits and none of the three it gives it to.
         G14 bans the label so it cannot return without a source record. */}
    </div>
  );
}

/* CCFOPS-388 — the payment breakdown behind the claim total, in the handoff's THREE-table form
   ("First Release - Payment Details", 7953:179261): Program, then Children and Staff as separate
   tables, each with its own Total amount. Column sets and figures are the Figma set verbatim;
   figures stay illustrative. Funding types are categorical, so they use the extended (decorative)
   badge palette — never the semantic set, which is reserved for the priority-signal colour law. */
const PD_PROGRAM = [
  { adj: { badge: "Admin fee", tone: "sky", sub: "0-35 mos" }, spaces: "9", providers: "\u2013", staff: "\u2013", children: "9", a: 855 },
  { adj: { badge: "Admin fee", tone: "sky", sub: "36+ mos" }, spaces: "15", providers: "\u2013", staff: "\u2013", children: "15", a: 900 },
  { adj: { badge: "Aff. grant", tone: "dawn", sub: "19 mos - 3 yrs, 100+ hrs" }, spaces: "1", providers: "\u2013", staff: "\u2013", children: "\u2013", a: 452 },
  { adj: { badge: "Aff. grant", tone: "dawn", sub: "3 yrs - Pre K" }, spaces: "1", providers: "\u2013", staff: "\u2013", children: "\u2013", a: 150 },
  { adj: { badge: "CIRF", tone: "prairie" }, spaces: "\u2013", providers: "\u2013", staff: "\u2013", children: "\u2013", a: 452 },
  { adj: { badge: "MEC", tone: "pasture" }, spaces: "\u2013", providers: "\u2013", staff: "\u2013", children: "\u2013", a: 150 },
];
const PD_CHILDREN = [
  { pid: "5004821", name: "Beebe Adriana", desc: { badge: "Aff. grant", tone: "dawn", sub: "3 yrs - Pre K: 4 days" }, reg: "0", ext: "0", pre: "0", a: 75 },
  { pid: "5004821", name: "Beebe Adriana", desc: { badge: "Subsidy", tone: "sky" }, reg: "33", ext: "0", pre: "0", a: 100 },
  { pid: "5004822", name: "Rowan Kowalchuk", desc: { badge: "Aff. grant", tone: "dawn", sub: "3 yrs - Pre K: 3 days" }, reg: "0", ext: "0", pre: "0", a: 75 },
  { pid: "5004822", name: "Rowan Kowalchuk", desc: { badge: "Subsidy", tone: "sky" }, reg: "33", ext: "0", pre: "0", a: 100 },
  { pid: "5004823", name: "Imani Osei", desc: { badge: "Aff. grant", tone: "dawn", sub: "3 yrs - Pre K: 100+ hrs" }, reg: "0", ext: "0", pre: "0", a: 417 },
  { pid: "5004823", name: "Imani Osei", desc: { badge: "Subsidy", tone: "sky" }, reg: "85", ext: "0", pre: "0", a: 266 },
];
const PD_STAFF = [
  { pid: "202020075", name: "Ari Marcos", desc: { badge: "WTU", tone: "lilac", sub: "Pre school" }, level: "3", reg: "0", ext: "0", pre: "56", a: 123 },
  { pid: "202020076", name: "Bradford Antwan Souza", desc: { badge: "WTU", tone: "lilac", sub: "Pre school" }, level: "1", reg: "0", ext: "25", pre: "0", a: 123 },
  { pid: "202020078", name: "Duval Eva", desc: { badge: "WTU", tone: "lilac", sub: "Pre school" }, level: "2", reg: "32", ext: "0", pre: "0", a: 123 },
  { pid: "202020079", name: "Emalee Sandin", desc: { badge: "WTU", tone: "lilac", sub: "Pre school" }, level: "3", reg: "0", ext: "0", pre: "25", a: 123 },
];
const PD_COLS = {
  program: [{ k: "period", l: "Period" }, { k: "adj", l: "Adjustment" }, { k: "spaces", l: "Paid spaces", n: true }, { k: "providers", l: "Providers", n: true }, { k: "staff", l: "Educator/Staff", n: true }, { k: "children", l: "Children", n: true }, { k: "amt", l: "Amount", n: true }],
  children: [{ k: "period", l: "Period" }, { k: "pid", l: "CCPN", mono: true }, { k: "name", l: "Child name" }, { k: "desc", l: "Description" }, { k: "reg", l: "Reg hrs", n: true }, { k: "ext", l: "Ext hrs", n: true }, { k: "pre", l: "Pre sch hrs", n: true }, { k: "amt", l: "Amount", n: true }],
  staff: [{ k: "period", l: "Period" }, { k: "pid", l: "Certification ID", mono: true }, { k: "name", l: "Educator/Staff name" }, { k: "desc", l: "Description" }, { k: "level", l: "Level", n: true }, { k: "reg", l: "Reg hrs", n: true }, { k: "ext", l: "Ext hrs", n: true }, { k: "pre", l: "Pre sch hrs", n: true }, { k: "amt", l: "Amount", n: true }],
};
/* The tab is the breakdown BEHIND the claim total, so it has to reconcile to it and to this claim's
   own period — not to a literal. Amounts are numbers here and formatted once by money(), so the
   parenthesised negative and the rows that had lost their dollar sign can't come back, and every
   Total amount is the sum of the column above it rather than a figure typed beside it. Program is a
   sample of the payment lines, so it carries the same remainder row the vehicle tables use to
   reconcile; Children and Staff are per-person samples of different populations and total only
   what they show, which is why their totals are no longer the same number twice. */
function payDetail(period, subtotal) {
  const fill = (rows) => rows.map((r) => Object.assign({}, r, { period: period, amt: money(r.a) }));
  const sum = (rows) => rows.reduce((t, r) => t + r.a, 0);
  /* No advance row here. Claim details models the recovery as an adjustment sitting OUTSIDE the
     payments subtotal, and this table totals TO that subtotal — a table cannot both contain the
     recovery and total to a figure that excludes it. The recovery has one home (Adjustments, and
     the lifecycle beside it); duplicating it here is what let the two disagree. */
  const prog = PD_PROGRAM;
  const shown = sum(prog);
  const rest = Math.round((subtotal - shown) * 100) / 100;
  const progRows = fill(prog);
  return [
    { title: "Program", cols: PD_COLS.program, rows: progRows, total: money(shown) },
    { title: "Children", cols: PD_COLS.children, rows: fill(PD_CHILDREN), total: money(sum(PD_CHILDREN)) },
    { title: "Educator/Staff", cols: PD_COLS.staff, rows: fill(PD_STAFF), total: money(sum(PD_STAFF)) },
  ];
}

function SimpleTable({ cols, rows, total, holds, onHold, rowKey }) {
  const { GoabLinkButton } = NS();
  /* The hold badge rides the ID column where the table has one. */
  const badgeCol = (cols.filter((x) => x.k === "pid")[0] || cols[0]).k;
  const { GoabBadge } = NS();
  const th = { padding: "7px 10px", font: "var(--goa-typography-body-xs)", fontWeight: 700, whiteSpace: "nowrap", borderBottom: "2px solid var(--goa-color-greyscale-400)" };
  /* Badges LEFT of the cell text, left-aligned as a column — user 2026-08-13 ("line up badges left
     aligned and move them left of the cell text"), superseding the same-day right-edge line-up. */
  const cell = (v) => (v && typeof v === "object" && v.badge)
    ? (
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <GoabBadge type={v.tone} content={v.badge} emphasis="subtle" />
        {v.sub ? <span style={{ font: "var(--goa-typography-body-s)" }}>{v.sub}</span> : null}
      </span>
    ) : v;
  return (
    <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 6, overflowX: "auto", background: "var(--goa-color-greyscale-white)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{cols.map((cl) => <th key={cl.k} style={{ ...th, textAlign: cl.n ? "right" : "left" }}>{cl.l}</th>)}{onHold ? <th style={{ ...th, textAlign: "right" }}>Actions</th> : null}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((cl) => (
                <td key={cl.k} style={{ padding: "7px 10px", borderBottom: "1px solid var(--goa-color-greyscale-200)", textAlign: cl.n ? "right" : "left", whiteSpace: "nowrap", verticalAlign: "top", font: "var(--goa-typography-body-s)", fontFamily: cl.mono || cl.n ? MONO : undefined, color: onHold && (holds || {})[rowKey + "-" + i] ? "var(--goa-color-text-secondary)" : undefined, textDecoration: onHold && (holds || {})[rowKey + "-" + i] && cl.n ? "line-through" : undefined }}>{cell(r[cl.k])}{onHold && (holds || {})[rowKey + "-" + i] && cl.k === badgeCol ? <span style={{ marginLeft: 8 }}><HoldBadge content="On hold" /></span> : null}</td>
              ))}
              {onHold ? (() => { const k = rowKey + "-" + i; const on = !!(holds || {})[k];
                return <td style={{ padding: "7px 10px", borderBottom: "1px solid var(--goa-color-greyscale-200)", textAlign: "right", whiteSpace: "nowrap", verticalAlign: "top", font: "var(--goa-typography-body-s)" }}>
                  {GoabLinkButton ? <GoabLinkButton size="compact" leadingIcon={on ? "checkmark-circle-outline" : "pause-circle-outline"} onClick={() => onHold(k)}>{on ? "Clear hold" : "Hold"}</GoabLinkButton> : null}
                </td>; })() : null}
            </tr>
          ))}
          {total ? (
            <tr>
              <td colSpan={cols.length - 1} style={{ padding: "9px 10px", textAlign: "right", font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Total amount</td>
              <td style={{ padding: "9px 10px", textAlign: "right", font: "var(--goa-typography-body-s)", fontFamily: MONO, fontWeight: 700 }}>{total}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

/* CCFOPS-383 — the provider's contact record, reached from the ⓘ beside the claim title. The
   vendor block (Z-codes) is the concrete carrier for the "flag vendor/account inconsistency early"
   guardrail. Field set is the Figma sheet verbatim (Provider-Information 7710:248147). */
const providerOf = (c) => ({
  program: c.name + ": " + c.pid,
  type: c.pay === "FDH" ? "Family day home agency" : "Facility based",
  phone: "403-" + String(100 + (c.id % 800)) + "-" + String(4000 + ((c.id * 7) % 5000)),
  contactName: "Fabiola Beach",
  contactEmail: "fabiola@" + c.name.toLowerCase().replace(/[^a-z]+/g, "") + ".ca",
  officer: "Krista Lam",
  licence: String(56784293 - c.id * 11),
  addresses: [["Street address 1", c.addr], ["Street address 2", "123 School Name"], ["Mailing address 1", "P.O. Box 12345, Calgary AB, T2P2B8"], ["Mailing address 2", "Station main"]],
  vendor: [["Type", "Z009"], ["Legal Form", "Z5"], ["Organization Name", "JM BP Talend Test"], ["Group Name", "Just another test group"], ["Trading Partner", "-"]],
});

/* ONE banner per severity, never a stack. A worst-case claim used to raise nine full-width coloured
   bands above the tabs; at that density the reviewer reads none of them, and red stops meaning
   "stop". Three tiers instead:
     blocker  (red)    — stops a release: hold, PPV high risk, over threshold, returned, red flags
     attention(yellow) — shapes the decision: yellow flags, model risk, enrolment check
     state             — simply true: watchlist, reviewed, adjustment, advance rate → chips, no band
   Each condition is DATA (title, body, optional inline action), so a new rule adds a LIST ITEM,
   never another band. Collapsed the banner is two lines; expanded it is the numbered detail with
   each item's own action. Levers #3 improved flags and #4 information structure; nothing is lost. */
function ReviewBanner({ tier, items, open, onToggle }) {
  const { GoabCallout, GoabLinkButton } = NS();
  if (!items || !items.length) return null;
  const one = items.length === 1;
  const heading = one ? items[0].title
    : items.length + (tier === "blocker" ? " things to clear before release" : " checks need attention");
  return (
    <GoabCallout type={tier === "blocker" ? "emergency" : "important"} size="medium" mb="none" heading={heading}>
      {one ? (
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>{items[0].body}</span>
          {items[0].action}
        </span>
      ) : open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {items.map((it) => (
              <li key={it.id} style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>
                <b>{it.title}</b> — {it.body} {it.action}
              </li>
            ))}
          </ol>
          <span><GoabLinkButton size="compact" leadingIcon="chevron-up" onClick={onToggle}>Hide detail</GoabLinkButton></span>
        </div>
      ) : (
        <span style={{ display: "inline-flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>{items.map((i) => i.title).join(" \u00b7 ")}</span>
          <GoabLinkButton size="compact" leadingIcon="chevron-down" onClick={onToggle}>Show detail</GoabLinkButton>
        </span>
      )}
    </GoabCallout>
  );
}

/* Affordability Grant accordion body, rebuilt from GoA components per the project rule.
   STRUCTURE IS THE FIGMA'S, verbatim (see figma-source/affordability.json, which the G9 gate diffs
   against): rows are AGE GROUPS plus a Total row; columns are the day / hour BANDS, repeated under
   two colour-coded column groups — Subsidized children (greyscale) and Non-subsidized children
   (brand-light). Do not transpose it, do not split it into two tables, do not recompute a Total. */
var AG_SECTIONS = [
  {
    "title": "Preschool",
    "bands": [
      "1 Day",
      "2 Days",
      "3 Days",
      "4 Days",
      "5 Days"
    ],
    "rows": [
      {
        "age": "Kindergarten (during & outside school hrs)",
        "sub": [
          0,
          0,
          0,
          0,
          0
        ],
        "non": [
          0,
          0,
          0,
          0,
          0
        ]
      },
      {
        "age": "3 years to not yet in Kindergarten",
        "sub": [
          0,
          0,
          4,
          2,
          10
        ],
        "non": [
          0,
          0,
          6,
          4,
          2
        ]
      },
      {
        "age": "Kindergarten (during regular school hours)",
        "sub": [
          0,
          0,
          0,
          0,
          0
        ],
        "non": [
          0,
          0,
          0,
          0,
          0
        ]
      },
      {
        "age": "Total",
        "total": true,
        "sub": [
          0,
          0,
          4,
          2,
          10
        ],
        "non": [
          0,
          0,
          0,
          0,
          0
        ]
      }
    ]
  },
  {
    "title": "Daycare",
    "bands": [
      "Less than 50 Hours",
      "50 to Less than 100 Hours",
      "100 Hours or Greater"
    ],
    "rows": [
      {
        "age": "Infants less than 12 months",
        "sub": [
          4,
          23,
          0
        ],
        "non": [
          12,
          0,
          45
        ]
      },
      {
        "age": "Infants 12 months to less than 19 months",
        "sub": [
          0,
          0,
          21
        ],
        "non": [
          0,
          4,
          0
        ]
      },
      {
        "age": "19 months to less than 3 years",
        "sub": [
          22,
          0,
          14
        ],
        "non": [
          50,
          0,
          32
        ],
        "flag": 0
      },
      {
        "age": "3 years to less than 4 years",
        "sub": [
          0,
          33,
          0
        ],
        "non": [
          0,
          45,
          0
        ]
      },
      {
        "age": "4 years to not yet in kindergarten",
        "sub": [
          0,
          0,
          11
        ],
        "non": [
          45,
          0,
          0
        ]
      },
      {
        "age": "Kindergarten (during & outside school hrs)",
        "sub": [
          0,
          12,
          0
        ],
        "non": [
          0,
          0,
          32
        ]
      },
      {
        "age": "Kindergarten (outside school hrs only)",
        "sub": [
          11,
          24,
          0
        ],
        "non": [
          0,
          2,
          0
        ]
      },
      {
        "age": "Total",
        "total": true,
        "sub": [
          37,
          92,
          46
        ],
        "non": [
          57,
          51,
          109
        ]
      }
    ]
  },
  {
    "title": "Out of School",
    "bands": [
      "Less than 50 Hours",
      "50 to Less than 100 Hours",
      "100 Hours or Greater"
    ],
    "rows": [
      {
        "age": "19 months to less than 3 years",
        "sub": [
          4,
          23,
          0
        ],
        "non": [
          12,
          0,
          45
        ]
      },
      {
        "age": "3 years to not yet in Kindergarten",
        "sub": [
          0,
          0,
          21
        ],
        "non": [
          0,
          4,
          0
        ]
      },
      {
        "age": "Kindergarten (during regular school hrs)",
        "sub": [
          22,
          0,
          14
        ],
        "non": [
          0,
          0,
          32
        ]
      },
      {
        "age": "Total",
        "total": true,
        "sub": [
          26,
          23,
          45
        ],
        "non": [
          12,
          4,
          77
        ]
      }
    ]
  }
];
var AG_FIRST_COL = "Age groups";
var AG_GROUPS = ["Subsidized children","Non-subsidized children"];
function AGTable({ sec }) {
  const { GoabBadge } = NS();
  const SUB = "var(--goa-color-greyscale-100)";
  const NON = "var(--goa-color-brand-light)";
  const th = { padding: "10px 12px", font: "var(--goa-typography-body-s)", fontWeight: 700, whiteSpace: "nowrap", textAlign: "right" };
  const td = { padding: "10px 12px", font: "var(--goa-typography-body-s)", fontFamily: MONO, textAlign: "right", whiteSpace: "nowrap" };
  const n = sec.bands.length;
  return (
    <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 6, overflowX: "auto", background: "var(--goa-color-greyscale-white)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}></th>
            <th style={{ ...th, background: SUB, textAlign: "left", paddingTop: 14 }} colSpan={n}>{AG_GROUPS[0]}</th>
            <th style={{ ...th, background: NON, textAlign: "left", paddingTop: 14 }} colSpan={n}>{AG_GROUPS[1]}</th>
          </tr>
          <tr>
            <th style={{ ...th, textAlign: "left", borderBottom: "2px solid var(--goa-color-greyscale-600)" }}>{AG_FIRST_COL}</th>
            {sec.bands.map((bd, i) => <th key={"s" + i} style={{ ...th, background: SUB, borderBottom: "2px solid var(--goa-color-greyscale-600)", whiteSpace: "normal", maxWidth: 130 }}>{bd}</th>)}
            {sec.bands.map((bd, i) => <th key={"n" + i} style={{ ...th, background: NON, borderBottom: "2px solid var(--goa-color-greyscale-600)", whiteSpace: "normal", maxWidth: 130 }}>{bd}</th>)}
          </tr>
        </thead>
        <tbody>
          {sec.rows.map((r) => (
            <tr key={r.age} style={{ borderTop: r.total ? "1px solid var(--goa-color-greyscale-400)" : "1px solid var(--goa-color-greyscale-200)" }}>
              <td style={{ ...td, textAlign: "left", fontFamily: undefined, whiteSpace: "normal" }}>{r.age}</td>
              {r.sub.map((v, i) => <td key={"s" + i} style={{ ...td, background: SUB }}>{v}</td>)}
              {r.non.map((v, i) => (
                <td key={"n" + i} style={{ ...td, background: NON }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    {r.flag === i && GoabBadge ? <GoabBadge type="important" icon /> : null}
                    {v}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function AffordabilityDetail() {
  const { GoabCallout } = NS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {GoabCallout ? (
        <div style={{ width: "100%" }}>
          <GoabCallout type="important" size="medium" mb="none" heading="Flag details">
            Anomaly detected on daycare amounts for non-subsidized children aged 19 months to 3 years.
          </GoabCallout>
        </div>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", minHeight: 200, width: "100%", boxSizing: "border-box", padding: 16, background: "var(--goa-color-greyscale-100)", border: "2px dashed var(--goa-color-greyscale-400)", borderRadius: "var(--goa-border-radius-l)", boxSizing: "border-box" }}>
        <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 700, color: "var(--goa-color-text-secondary)" }}>Capacity utilization trends</span>
        <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", textAlign: "center" }}>Preschool &middot; Daycare &middot; Out of school against licence capacity, Oct 23 &ndash; Sep 24. To be determined.</span>
      </div>
      {AG_SECTIONS.map((sec) => (
        <div key={sec.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>{sec.title}</span>
          <AGTable sec={sec} />
        </div>
      ))}
    </div>
  );
}

function ClaimDetail({ c, act, onBack, isSpecialist, release1GX }) {
  /* ONE period for this claim, derived from the advance basis. Every date the detail prints — KPI,
     charts, child-list tabs, comment history, audit trail, lifecycle — reads from it, so no two
     surfaces can name different months. */
  const claimPeriod = CLAIM_PERIOD;
  const periodT = monIndex(claimPeriod);
  const subT = periodT + 1; // the month the claim is submitted and processed in
  const recvDay = c.day;    // the SAME day the queue's Received column and the trail tab print
  const childMonths = [3, 2, 1, 0].map((k) => monLabel(periodT - k));
  const claimAmtStr = money(c.amtN); // already the signed net, cents included
  const claimAmtParen = c.neg ? claimAmtStr : "(" + claimAmtStr + ")"; // negative money self-parenthesizes — never "(($n))" in prose
  const { GoabButton, GoabBadge, GoabTextarea, GoabModal, GoabTable, GoabCallout, GoabLinkButton, GoabIconButton, GoabDropdown, GoabInput, GoabCheckbox, GoabTemporaryNotification, GoabTabs, GoabTab, GoabTooltip, GoabDrawer, GoabTableSortHeader, GoabPagination, GoabRadioGroup, GoabRadioItem } = NS();
  const CalloutFlags = window.CLCalloutFlags;
  const DataVis = window.DataVisCharts;
  const [openV, setOpenV] = React.useState({});
  const [held, setHeld] = React.useState({});
  /* Per-line holds on the Payment details tab, keyed section-row. */
  const [pdHold, setPdHold] = React.useState({});
  const togglePdHold = (k) => setPdHold((h) => { const nn = { ...h }; if (nn[k]) delete nn[k]; else nn[k] = true; return nn; });
  const TAGS = ["Follow-up", "Adjustment", "Verified", "Data issue"];
  /* 004 S2 — an open request is also the newest thread entry (comment id 90), so the answer
     returns where the question lives (form 2026-08-19, A5). */
  const [comments, setComments] = React.useState(() => (c.reviewReq ? [{ id: 90, who: c.reviewReq.by, when: c.reviewReq.at, tags: ["Review request"], pinned: false, pub: false, body: c.reviewReq.question, replies: [] }] : []).concat([
    { id: 1, who: "Avery Solano (QA)", when: dayAt(subT, recvDay + 1) + ", 10:00 AM", tags: ["Follow-up"], pinned: false, pub: false, body: "@Dana Whitfield child attendance hours were slightly underreported, but within allowable range.", replies: [] },
    { id: 2, who: "Chris Halvard (FDH EO)", when: dayAt(subT, recvDay + 1) + ", 09:00 AM", tags: [], pinned: false, pub: true, body: "Part-time hours are within guidelines, no adjustments needed.", replies: [{ who: "Dana Whitfield (Subsidy EO)", when: dayAt(subT, recvDay + 1) + ", 08:30 AM", body: "@Avery Solano Can you double-check if the reported part-time hours meet the eligibility criteria?" }] },
    { id: 3, who: "Alex Renn (Funding EO)", when: dayAt(subT, recvDay + 1) + ", 08:00 AM", tags: ["Verified"], pinned: true, pub: false, body: "FDH contract balance is nearing the limit; monitor future submissions closely but this one is okay for release.", replies: [] },
    { id: 4, who: "Jamie Locke (Finance)", when: dayAt(subT, recvDay + 1) + ", 07:30 AM", tags: [], pinned: false, pub: true, body: "@Alex Renn can you confirm the calculations were applied correctly.", replies: [] },
  ]));

  const [replyTo, setReplyTo] = React.useState(null);
  const [rDraft, setRDraft] = React.useState("");
  const nextCid = React.useRef(100);
  const [draft, setDraft] = React.useState("");
  const [dtags, setDtags] = React.useState([]);
  const [approved, setApproved] = React.useState({});
  const [adj, setAdj] = React.useState({});
  const [adjModal, setAdjModal] = React.useState(null); // { mode:"adjust"|"approve", key, label, old }
  const [aAmt, setAAmt] = React.useState("");
  const [aReason, setAReason] = React.useState("");
  const [aPin, setAPin] = React.useState(false);
  /* Figma "First Release - Activity" (Date/time · User/System · Type · Description · Status). */
  const [events, setEvents] = React.useState([
    { when: dayAt(subT, recvDay + 1) + ", 04:00 PM", who: "1GX", sys: true, type: "Payment", desc: "1GX completed payment processing for the claim " + claimAmtParen, status: "Paid" },
    { when: dayAt(subT, recvDay + 1) + ", 01:01 PM", who: "CCIS", sys: true, type: "Release", desc: "Submitted to 1GX for payment processing " + claimAmtParen, status: "Released to 1GX" },
    { when: dayAt(subT, recvDay + 1) + ", 01:00 PM", who: "Dana Whitfield", email: "dana.whitfield@gov.ab.ca", type: "Release", desc: "Affordability grant payment " + claimAmtParen, status: "Ready for release" },
    { when: dayAt(subT, recvDay + 1) + ", 12:00 PM", who: "Dana Whitfield", email: "dana.whitfield@gov.ab.ca", type: "Comment", desc: "\u201cAffordability calculations look correct. No followup needed.\u201d", status: "Ready for release" },
    { when: dayAt(subT, recvDay + 1) + ", 11:00 AM", who: "Robin Aldercott", email: "robin.aldercott@gov.ab.ca", type: "Release", desc: "Subsidy payment " + claimAmtParen, status: "Ready for release" },
    { when: dayAt(subT, recvDay + 1) + ", 10:00 AM", who: "Alex Renn", email: "alex.renn@gov.ab.ca", type: "Release", desc: "Family day home payment " + claimAmtParen, status: "Ready for release" },
    { when: dayAt(subT, recvDay + 1) + ", 09:00 AM", who: "Avery Solano", email: "avery.solano@gov.ab.ca", type: "Approval", desc: "Claim ready for EO reviews", status: "Review" },
    { when: dayAt(subT, recvDay + 1) + ", 08:00 AM", who: "Avery Solano", email: "avery.solano@gov.ab.ca", type: "Comment", desc: "\u201cPlease verify the Affordability calculation for Daycare - 19 months to 3 years.\u201d", status: "Review" },
    { when: dayAt(subT, recvDay) + ", 07:00 PM", who: "CCIS", sys: true, type: "Review", desc: "Flagged for QA random sampling", status: "Flag detected" },
    { when: dayAt(subT, recvDay) + ", 06:05 PM", who: "Jane Doe", email: "jdoe@example-childcare.ca", type: "Submission", desc: "Claim received by CCIS/ECDS", status: "Submitted" },
    { when: dayAt(subT, recvDay) + ", 06:01 PM", who: "ECDS", sys: true, type: "Validation", desc: "Error, staff hours exceed the allowed limit", status: "Validation error" },
    { when: dayAt(subT, recvDay) + ", 06:00 PM", who: "Jane Doe", email: "jdoe@example-childcare.ca", type: "Submission", desc: "Operator submitted claim for review", status: "Submitted" },
  ]);
  /* The three header CTAs are independent toggles, not one status — a claim can be watched AND on
     hold AND reviewed at once, and each one contributes its own callout under the KPI strip
     (Figma "First Release - Details - Hold", 7359:250467). */
  const [flags, setFlags] = React.useState(() => ({
    hold: c.status === "hold" ? { reason: "Awaiting clarification from provider with regard to several outstanding compliance issues." } : null,
    watch: (() => { const e = act.watch && act.watch.find(c.pid); return e ? { roles: e.roles } : null; })(),
    reviewed: (c.status === "reviewed" || c.status === "cleared") ? { reason: "Random sample: Part of the 5% of the claims flagged at random.", note: { who: "Avery Solano", when: dayAt(subT, recvDay + 3) + ", 11:40 AM", body: "Spoke with Jane from ABC Childcare and confirmed the claim is accurate, this is ready to be released." } } : null,
  }));
  const setFlag = (k, v) => setFlags((f) => ({ ...f, [k]: v }));
  const [actQ, setActQ] = React.useState("");
  const [actSort, setActSort] = React.useState({ k: "when", dir: -1 });
  const [openPeriod, setOpenPeriod] = React.useState({ [claimPeriod]: true });
  const [pubDraft, setPubDraft] = React.useState(false);
  const [note, setNote] = React.useState(null);
  /* 004 S1/S2 (spec 004). dTab remounts the detail tabs so "Respond in comments" can jump to the
     Comments tab — same key-remount idiom the queue's goTab uses. Neither action touches claim
     status or stage: a review request is DISTINCT from hold (§19.2 "it shouldn't hold up the claim"). */
  const [dTab, setDTab] = React.useState({ i: 1, k: 0 });
  const [flagModal, setFlagModal] = React.useState(false);
  const [fSev, setFSev] = React.useState("yellow");
  const [fReason, setFReason] = React.useState("");
  const [fCarry, setFCarry] = React.useState(false);
  const [reqModal, setReqModal] = React.useState(false);
  const [reqTargets, setReqTargets] = React.useState([]);
  const [reqQ, setReqQ] = React.useState("");
  /* Every logged action also raises a GoA temporary notification (CCFOPS-459) — hold, reviewed,
     watchlist, line-item hold, adjust, approve and comments all confirm, not just bulk clear. */
  const logEvent = (text, type, status) => {
    setEvents((e) => [{ when: "Just now", who: "Avery Solano", email: "avery.solano@gov.ab.ca", type: type || "Review", desc: text, status: status || "Review" }, ...e]);
    setNote({ msg: text.length > 72 ? text.slice(0, 69) + "\u2026" : text, type: /^(Held|Placed|Un-approved|Removed|Cleared|Released line item|Raised|Requested)/.test(text) ? "information" : "success" });
  };
  const readVal = (...a) => { for (const x of a) { if (typeof x === "string") return x; if (x && typeof x === "object" && typeof x.value === "string") return x.value; } return ""; };
  const confirmRaiseFlag = () => {
    if (!fReason.trim()) return;
    act.raiseFlag(c.id, { sev: fSev, reason: fReason.trim(), by: "Avery Solano (QA)", at: "Just now", period: claimPeriod, carry: fCarry });
    logEvent("Raised a " + (fSev === "red" ? "red" : "yellow") + " flag — " + fReason.trim(), "Flag", "Review");
    setFlagModal(false);
  };
  const confirmRequest = () => {
    if (!reqTargets.length || !reqQ.trim()) return;
    act.setReviewReq(c.id, { targets: reqTargets.slice(), question: reqQ.trim(), by: "Avery Solano (QA)", at: "Just now", answered: false });
    setComments((cs) => [{ id: 90, who: "Avery Solano (QA)", when: "Just now", tags: ["Review request"], pinned: false, pub: false, body: reqQ.trim(), replies: [] }].concat(cs.filter((x) => x.id !== 90)));
    logEvent("Requested a review from " + joinAnd(reqTargets.map(stageLabelOf)) + " — " + reqQ.trim(), "Review", "Review");
    setReqModal(false);
  };
  const fmt = money;
  const st = c.status === "released" ? { t: "Released to 1GX", type: "success" }
    /* type is dead for hold (the header routes through HoldBadge below) — grey, not emergency, so
       a future reader can never revive a red hold from this literal. */
    : c.status === "hold" ? { t: "On hold", type: "dark" }
    : (c.status === "reviewed" || c.status === "cleared") ? { t: "Ready for release", type: "success" }
    : { t: "Review", type: "important" };
  const callout = c.status === "hold" ? "hold" : c.ccs === "High variance" ? "review reason variance" : c.ccs === "Random sample" ? "review reason random" : c.watch ? "watchlist" : (c.rules && c.rules.length > 1) ? "multiple reasons" : (c.rules && c.rules.length >= 1) ? "qa-variance" : (c.risk >= 70) ? "qa-variance" : "none";
  /* The line-item split is an illustrative SHAPE; its TOTAL must be this claim's GROSS amount —
     the same c.grossN the advance basis, the queue's Amount column (via the derived net), fmtSum,
     the release batch and the signed release reports are all built from. Scale once here: subtotal, the accordion, Total payment, the KPI
     strip and the anchored trend charts all read from `vehicles`, so one source feeds them all.
     The last item absorbs the rounding residue so the sum matches the queue to the cent. */
  const VEHICLE_SHAPE = [
    { key: "sub", label: "Subsidy", s: "ready", items: [{ label: "Base rate · 0–35 mos · 42 spaces", amt: 812.00 }, { label: "Base rate · 36 mos+ · 68 spaces", amt: 544.00 }] },
    { key: "ag", label: "Affordability Grant", s: "review", items: [{ label: "Affordability Grant", amt: 1856.00 }] },
    { key: "wtu", label: "Wage Top-Up", s: "review", items: [{ label: "Wage top-up · 27 educators", amt: 1923.00 }, { label: "Administrative hours", amt: 200.00 }] },
    { key: "icc", label: "Inclusive Child Care", s: "ready", items: [{ label: "Inclusive child care · 4 supported children", amt: 567.56 }] },
    { key: "fdh", label: "Family Day Home", s: "review", items: [{ label: "Family day home agency payment", amt: 400.00 }] },
  ];
  /* Three figures, one direction of derivation — user 2026-08-20 (cc-1), superseding the negNet
     swap of 2026-08-13. The swap made the CLAIM the negative figure and the ADVANCE the big one,
     which is backwards: a claim is money owed and has no negative form, and an advance is money
     already paid out. Both are positive by construction; the NET is the only signed figure, and it
     is a subtraction, so no tile can disagree with another and none needs a ternary. */
  const claimTotal = c.grossN;         // gross claim — positive, always
  const advance = advanceOf(c).paid;   // advance already paid, recovered from this claim — positive, always
  const shapeTotal = VEHICLE_SHAPE.reduce((a, v) => a + v.items.reduce((b, it) => b + it.amt, 0), 0);
  const scale = claimTotal / shapeTotal;
  const itemCount = VEHICLE_SHAPE.reduce((a, v) => a + v.items.length, 0);
  let seen = 0, running = 0;
  const vehicles = VEHICLE_SHAPE.map((v) => ({ ...v, items: v.items.map((it) => {
    seen++;
    const a = seen === itemCount ? Math.round((claimTotal - running) * 100) / 100 : Math.round(it.amt * scale * 100) / 100;
    running += a;
    return { ...it, amt: a };
  }) }));
  const eff = (vk, i, amt) => adj[vk + ":" + i] != null ? adj[vk + ":" + i] : amt;
  vehicles.forEach((v) => { v.amt = v.items.reduce((a, it, i) => a + eff(v.key, i, it.amt), 0); });
  const subtotal = vehicles.reduce((a, v) => a + v.amt, 0);
  /* Net is claim − advance, one formula for every claim — negative exactly when the recovery
     exceeds the claim (a drop month: the advance was 80% of a bigger three months). This must
     equal the queue's Amount column to the cent; both are the same subtraction. */
  const netAmt = subtotal - advance;
  /* A funding type that is showing flags is not ready for release, whatever its baseline says —
     the static "ready" is only the state of an UNFLAGGED vehicle. */
  const vStatus = (v) => (vehFlagsOn && ((v.det || {}).flags || []).length) || v.s !== "ready"
    ? { t: "Review", type: "important" } : { t: "Ready for release", type: "success" };
  const heldCount = (vk) => { const v = vehicles.find((x) => x.key === vk); return v.items.filter((_, i) => held[vk + ":" + i]).length; };
  const toggleItem = (vk, i, label) => { const willHold = !held[vk + ":" + i]; setHeld((h) => ({ ...h, [vk + ":" + i]: willHold })); logEvent((willHold ? "Held line item: " : "Released line item: ") + label); };
  const commentFor = (body, tag, pin) => setComments((cs) => [{ id: nextCid.current++, who: "Avery Solano (QA)", when: "Just now", tags: [tag], pinned: !!pin, body, replies: [] }, ...cs]);
  const approveVehicle = (vk, label) => { if (approved[vk]) { setApproved((a) => ({ ...a, [vk]: false })); logEvent("Un-approved payment: " + label); } else { openChange("approve", vk, label, 0); } };
  /* rejectVehicle removed with the Reject button (user 2026-08-12) — see the note in VehicleReview.
     The comment that stood here claimed "CCFOPS-391 — WTU carries a Reject action"; the record it
     cited contains no such entry and neither does the frame. */
  const openChange = (mode, key, label, old) => { setAdjModal({ mode, key, label, old }); setAAmt(String(old)); setAReason(""); setAPin(false); };
  const confirmChange = () => {
    const m = adjModal; if (!m) return;
    if (m.mode === "adjust") {
      const n = parseFloat(String(aAmt).replace(/[^0-9.]/g, ""));
      if (isNaN(n) || !aReason.trim()) return;
      setAdj((a) => ({ ...a, [m.key]: n }));
      logEvent("Adjusted " + m.label + " from " + fmt(m.old) + " to " + fmt(n) + " \u2014 " + aReason.trim());
      commentFor("Adjusted " + m.label + ": " + fmt(m.old) + " \u2192 " + fmt(n) + ". " + aReason.trim(), "Adjustment", aPin);
    } else {
      setApproved((a) => ({ ...a, [m.key]: true }));
      logEvent("Approved payment: " + m.label + (aReason.trim() ? " \u2014 " + aReason.trim() : ""));
      if (aReason.trim()) commentFor("Approved " + m.label + ". " + aReason.trim(), "Verified", aPin);
    }
    setAdjModal(null);
  };
  const addComment = () => { if (!draft.trim()) return; setComments((cs) => [{ id: nextCid.current++, who: "Avery Solano (QA)", when: "Just now", tags: dtags.slice(), pinned: false, pub: pubDraft, body: draft.trim(), replies: [] }, ...cs]); logEvent(draft.trim().length > 60 ? "\u201c" + draft.trim().slice(0, 57) + "\u2026\u201d" : "\u201c" + draft.trim() + "\u201d", "Comment"); setDraft(""); setDtags([]); setPubDraft(false); };
  const addReply = (id) => {
    if (!rDraft.trim()) return;
    setComments((cs) => cs.map((x) => x.id === id ? { ...x, replies: (x.replies || []).concat({ who: "Avery Solano (QA)", when: "Just now", body: rDraft.trim() }) } : x));
    /* 004 S2 — a reply on the request's own thread entry IS the answer (form 2026-08-19, A5). */
    const isReqAnswer = c.reviewReq && !c.reviewReq.answered && id === 90;
    if (isReqAnswer) act.answerReviewReq(c.id);
    logEvent(isReqAnswer ? "Answered the review request from " + c.reviewReq.by : "Replied to a comment");
    setReplyTo(null); setRDraft("");
  };
  const togglePin = (id) => { const cur = comments.find((x) => x.id === id); const on = !(cur && cur.pinned); setComments((cs) => cs.map((x) => x.id === id ? { ...x, pinned: on } : x)); logEvent(on ? "Pinned a comment for future claims" : "Unpinned a comment"); };
  const mention = (t) => String(t).split(/(@[A-Z][a-z]+(?: [A-Z][a-z]+)?)/g).map((p, i) => p.charAt(0) === "@" ? <b key={i} style={{ color: "var(--goa-color-interactive-default)", fontWeight: 700 }}>{p}</b> : <React.Fragment key={i}>{p}</React.Fragment>);
  const [modal, setModal] = React.useState(null);
  const [mReason, setMReason] = React.useState("");
  const MODALS = {
    hold: { heading: "Place claim on hold", label: "Hold comment", provider: true, required: true, confirm: "Place on hold", type: "primary", run: (r) => { act.setStatus([c.id], "hold"); setFlag("hold", { reason: r }); logEvent("Placed whole claim on hold \u2014 " + r, "Hold", "Hold"); } },
    /* CCFOPS-480 "Modal - Edit hold" — Clear hold is the destructive action; the comment field is
       the hold's record of why. No separate save step (user decision, Aug 2026). */
    editHold: { heading: "Edit hold", label: "Hold comment", provider: true, required: true, confirm: null, type: "primary",
      run: (r) => { setFlag("hold", { reason: r }); },
      destructive: { label: "Clear hold", run: () => { act.setStatus([c.id], "open"); setFlag("hold", null); logEvent("Cleared the hold", "Hold", "Review"); } } },
    release: { heading: "Release the hold?", label: "Note (optional)", required: false, confirm: "Release hold", type: "primary", run: (r) => { act.setStatus([c.id], "open"); setFlag("hold", null); logEvent("Released claim hold" + (r ? " \u2014 " + r : ""), "Hold", "Review"); } },
    reviewed: { heading: "Mark claim reviewed", label: "Review note (optional)", required: false, confirm: "Mark reviewed", type: "primary", run: (r) => { act.setStatus([c.id], "reviewed"); setFlag("reviewed", { reason: "Reviewed by Avery Solano (QA) \u2014 ready to be released.", note: r ? { who: "Avery Solano", when: "Just now", body: r } : null }); logEvent("Marked claim reviewed" + (r ? " \u2014 " + r : ""), "Approval", "Ready for release"); } },
    clear: { heading: "Clear reviewed status?", label: null, required: false, confirm: "Clear reviewed", type: "secondary", run: () => { act.setStatus([c.id], "open"); setFlag("reviewed", null); logEvent("Cleared reviewed", "Approval", "Review"); } },
    handoff: { heading: "Send to Finance Officer", label: "Note (optional)", required: false, confirm: "Send to Finance Officer", type: "primary", run: (r) => { act.setStatus([c.id], "reviewed"); logEvent("Approved and sent to Finance Officer" + (r ? " \u2014 " + r : ""), "Release", "Ready for release"); } },
    release1gx: { heading: "Release payment to 1GX?", label: "Note (optional)", required: false, confirm: "Release to 1GX", type: "primary", run: (r) => { act.setStatus([c.id], "released"); logEvent("Payment released to 1GX" + (r ? " \u2014 " + r : ""), "Payment", "Paid"); } },
    refer: { heading: "Refer to supervisor?", label: "Context for the supervisor", required: true, confirm: "Refer to supervisor", type: "primary", run: (r) => { act.setStatus([c.id], "supervisor"); logEvent("Referred to supervisor — payment over $" + (SUPERVISOR.threshold / 1000) + "k — " + r, "Escalation", "With supervisor"); } },
    unrefer: { heading: "Withdraw supervisor referral?", label: "Note (optional)", required: false, confirm: "Withdraw referral", type: "secondary", run: (r) => { act.setStatus([c.id], "open"); logEvent("Withdrew supervisor referral" + (r ? " \u2014 " + r : ""), "Escalation", "Review"); } },
  };
  const openModal = (k) => { setMReason(k === "editHold" && flags.hold ? flags.hold.reason : ""); setModal(k); };
  const confirmModal = () => { const cfg = MODALS[modal]; if (cfg.required && !mReason.trim()) return; cfg.run(mReason.trim()); setModal(null); };
  const [childOpen, setChildOpen] = React.useState(false);
  const [watchOpen, setWatchOpen] = React.useState(false);
  const [provOpen, setProvOpen] = React.useState(false);
  const prov = providerOf(c);
  const [ageGroup, setAgeGroup] = React.useState(CHILD_AGE_GROUPS[2]);
  const detailRef = React.useRef(null);
  useBackdropLock(!!modal || !!adjModal || childOpen || provOpen || watchOpen || flagModal || reqModal, detailRef);
  /* Sticky claim header (user decision 2026-08-10, X4 follow-up). The source carries the CTAs once
     in a header that never moves, because its frame is a static 1666px page. This build scrolls
     3208px inside .goab-wl__card, so that header leaves the viewport and the CTAs go out of reach
     mid-review. Pinning the WHOLE identity row rather than emitting a second CTA bar keeps one
     instance of the control (see CTA_FILL note) and keeps the claim you are acting on named while
     you act. Stuck test: a pinned sticky element stops fully intersecting its scrollport, so
     threshold 1 + a -1px top rootMargin flips exactly at the pin. */
  const hdrRef = React.useRef(null);
  const [hdrStuck, setHdrStuck] = React.useState(false);
  React.useEffect(() => {
    const el = hdrRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let root = el.parentElement;
    while (root && !/(auto|scroll)/.test(window.getComputedStyle(root).overflowY)) root = root.parentElement;
    const io = new IntersectionObserver(([e]) => setHdrStuck(e.intersectionRatio < 1), { root: root || null, threshold: [1], rootMargin: "-1px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [childSort, setChildSort] = React.useState({ k: "id", dir: 1 });
  const [childMonth, setChildMonth] = React.useState(3);
  const recSteps = [
    { t: "Advance paid", d: dayAt(periodT, 1), detail: moneyEl(advance), state: "done" },
    { t: claimPeriod + " claim submitted", d: dayAt(subT, recvDay), detail: moneyEl(subtotal), state: "done" },
    { t: "Nightly validation (net calculated)", d: dayAt(subT, recvDay + 1), detail: "", state: "done" },
    { t: "Advance recovered + net paid", d: "on release", detail: moneyEl(netAmt), state: "current" },
    { t: "Released to 1GX", d: "Finance Officer", detail: "", state: "todo" },
  ];
  const kids = childrenOf(c);
  const adv = advanceOf(c);
  const ppv = ppvOf(c);
  const adjT = adjTargetOf(c);
  const kpis = [
    { l: "Submitted by", v: "Sam Ridley", sub: "sridley@example-childcare.ca" },
    { l: "Claim period", v: claimPeriod },
    { l: "Received", v: c.recv },
    { l: "Capacity", v: String(kids.cap) },
    { l: "Children claimed", v: String(kids.total), sub2: kids.sub + " subsidized · " + kids.reg + " registered only" },
    { l: "Staff claimed", v: String(STAFF_N) },
    /* Tiles read the derived pair directly — the 2026-08-11 per-tile ternary swap is superseded by
       the data-level swap at claimTotal (user 2026-08-13); see that comment. */
    { l: "Claim amount", v: fmt(subtotal), delta: momOf(adv.basis, subtotal), neg: subtotal < 0 },
    { l: "Claim advance", v: fmt(advance), delta: "paid " + dayAt(periodT, 1), neg: advance < 0 },
    /* Net amount is the figure actually paid out: the advance was paid separately at the start of the
       month and is recovered from the net claim payment (rules/domain.md). Same subtotal - advance
       expression the release trail already uses for "Advance recovered + net paid", so the header and
       the trail cannot state different nets. */
    /* Accounting form is the prototype-wide convention (user 2026-08-19, cc-1) — money() itself
       parenthesizes negatives; .neg keeps the tile's emergency red. Net amount was the ONLY tile
       carrying .neg until 2026-08-20: on a negNet claim the Claim amount and Claim advance tiles
       both printed a parenthesised figure in body colour. The flag belongs on every money tile
       whose value can go negative, not on the one that usually is. */
    { l: "Net amount", v: fmt(netAmt), delta: "after advance recovery", neg: netAmt < 0 },
  ];
  const secTitle = (t) => <span style={{ font: "var(--goa-typography-heading-s)", fontWeight: 700 }}>{t}</span>;
  /* ---- everything that could shout, ranked once (see ReviewBanner) ---- */
  const [openBanner, setOpenBanner] = React.useState({});
  const toggleBanner = (k) => setOpenBanner((o) => ({ ...o, [k]: !o[k] }));
  const flagNames = (c.rules || []).slice();
  if (c.ccs && flagNames.indexOf(c.ccs) < 0) flagNames.push(c.ccs);
const advIssues = [];
  if (adv.blocked) advIssues.push({ id: "advb", title: "Overdue advance blocks the next one", body: money(adv.overdue) + " was advanced and has not been returned. The next advance is withheld until the balance clears." });
  if (adv.missing) advIssues.push({ id: "advm", title: "A month with no claim submitted counts as zero", body: "No claim was submitted for " + monLabel(CLAIM_PERIOD_T - 1) + ", so that month enters the three-month average as $0.00 and pulls the advance down." });
  if (adv.rate) advIssues.push({ id: "advr", title: "Program requested " + adv.rate.pct + "% of the advance", body: adv.rate.reason + " · effective " + adv.rate.months + ". Applied in place of the standard " + Math.round(ADVANCE_PCT * 100) + "%." });
  const blockers = [];
  const attention = [];
  const stateChips = [];
  if (flags.hold) blockers.push({ id: "hold", title: "On hold", body: flags.hold.reason, action: <GoabLinkButton size="compact" onClick={() => openModal("editHold")}>Edit hold</GoabLinkButton> });
  if (ppv && ppv.risk === "high") blockers.push({ id: "ppv", title: "Flagged for PPV — high risk", body: ppv.note + " Program-level modifier set by " + ppv.by + " on " + ppv.at + " — it applies to every claim for " + c.name + ".", action: !flags.hold ? <GoabLinkButton size="compact" onClick={() => { setMReason(ppv.note); setModal("hold"); }}>Hold for PPV</GoabLinkButton> : null });
  if (needsSup(c)) blockers.push({ id: "sup", title: "Over the $" + (SUPERVISOR.threshold / 1000) + "k supervisor threshold", body: c.pay + " payments above $" + (SUPERVISOR.threshold / 1000) + "k are signed off by a supervisor, not in-stage. " + (c.status === "supervisor" ? "Referred — awaiting the supervisor's decision." : "Refer this claim rather than marking it reviewed.") });
  if (c.returned) blockers.push({ id: "ret", title: "Returned by " + c.returned, body: c.returned + " held this payment and asked QA to follow up with the program before it moves forward again." });
  flagNames.forEach((n) => {
    const item = { id: "f-" + n, title: n, body: (RULE_DETAIL[n] || {}).why };
    (flagTone(n) === "emergency" ? blockers : attention).push(item);
  });
  /* 004 S1 — reviewer-raised flags join the SAME ranked tally under the same colour law (red →
     blocker, yellow → attention); the provenance line is what tells them apart from system flags
     (form 2026-08-19, A2). A prior-period flag names the claim it was raised on (A3). */
  (c.revFlags || []).forEach((f, i) => {
    const item = { id: "rev-" + i, title: "Reviewer-raised flag", body: f.reason + " Raised by " + f.by + " · " + f.at + (f.period && f.period !== claimPeriod ? " · on the " + f.period + " claim, carried forward" : "") + (f.carry ? " · applies to future periods" : "") };
    (f.sev === "red" ? blockers : attention).push(item);
  });
  if (!flagNames.length && c.risk != null && c.risk >= 70) attention.push({ id: "risk", title: "High model risk", body: "Unusual pattern versus the peer group — no business rule was broken." });
  if (ppv && ppv.risk !== "high") attention.push({ id: "ppvw", title: "Flagged for PPV — watch", body: ppv.note });
  /* Fires only when the claimed count reaches or passes licensed capacity — a band that is always
     on is chrome, not signal. Registered-only children are the usual cause, so name them. */
  if (kids.over) attention.push({ id: "kids", title: "Children claimed at or over licensed capacity", body: kids.total + " children claimed against a licensed capacity of " + kids.cap + " — " + kids.sub + " subsidized (OSC) and " + kids.reg + " registered only. Providers register every child regardless of funding, so confirm enrolment before release.", action: <GoabLinkButton size="compact" onClick={() => setChildOpen(true)}>View children</GoabLinkButton> });
  /* Vehicle-level flags and the advance's conditions are conditions too. If they never enter the
     tally, the header can assert "nothing flagged" over six red badges in the accordions below it.
     They roll up here as ONE item (rule: a new condition adds a list item, never another band);
     the advance keeps its own banner in its own section, but still counts toward the tally. */
  /* Resolve each vehicle's detail ONCE, now that the claim's flags and child/staff counts exist.
     The badge, the claim-level rollup, the status and the open panel all read v.det, so a flag
     added inside a derive() can never again reach one of them and leave the others behind. */
  const vehCtx = { kids: kids, staffN: STAFF_N, flags: flagNames };
  vehicles.forEach((v) => { v.det = vehicleDetail(v.key, vehCtx); });
  const vehFlagsOn = bandOf(c) !== "norm";
  const vehFlags = (v) => ((v.det || {}).flags || []);
  /* The badge takes the worst severity among that vehicle's own flags, via the same flagTone lookup
     the callouts inside the section use. It was hardcoded emergency, so a vehicle carrying only
     yellow flags showed a red badge over amber callouts — the exact disagreement flagTone exists to
     prevent (see its comment: "one lookup ... so they can never disagree"). */
  const vehTone = (v) => (vehFlags(v).some((n) => flagTone(n) === "emergency") ? "emergency" : "important");
  const vehFlagged = vehFlagsOn ? vehicles.filter((v) => vehFlags(v).length) : [];
  const vehFlagN = vehFlagged.reduce((a, v) => a + vehFlags(v).length, 0);
  if (vehFlagN) attention.push({ id: "veh", title: vehFlagN + (vehFlagN > 1 ? " flags" : " flag") + " across " + vehFlagged.length + (vehFlagged.length > 1 ? " funding types" : " funding type"), body: vehFlagged.map((v) => v.label + " (" + vehFlags(v).length + ")").join(" \u00b7 ") + " \u2014 expand a funding type under Payments to review them." });
  if (flags.watch) stateChips.push({ k: "w", tone: "dark", label: "Watchlist (" + Object.keys(flags.watch.roles || {}).length + ")" });
  if (flags.reviewed) stateChips.push({ k: "r", tone: "success", label: "Reviewed" });
  const stateLine = null;
  /* Provider-lane provenance, deterministic per claim (board 7 §15.1). */
  const trail = {
    submitted: dayAt(subT, recvDay) + ", " + (1 + (c.id % 4)) + ":" + String(10 + (c.id * 7) % 49) + " p.m.",
    reopened: c.id % 3 === 0,
    reopenedAt: (4 + (c.id % 2)) + ":" + String(20 + (c.id * 3) % 39) + " p.m.",
    validated: dayAt(subT, recvDay + 1) + ", 2:00 a.m.",
    ecdsErr: c.id % 4 === 1 ? 1 : 0,
    ccisErr: c.id % 6 === 2 ? 1 : 0,
    cheque: chequeOf(c),
    voucher: voucherOf(c),
    posted: dayAt(subT + 1, 1 + (c.id % 3)),
  };
  const trailRows = (rows) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map(([k, v]) => (
        <span key={k} style={{ display: "flex", justifyContent: "space-between", gap: 20, padding: "9px 0", borderBottom: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-s)" }}>
          <span style={{ color: "var(--goa-color-text-secondary)" }}>{k}</span>
          <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
        </span>
      ))}
    </div>
  );
  const payRow = (label, badge, amount, key) => (
    <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--goa-color-greyscale-100)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 4 }}>
      <Ico name="chevron-forward-outline" size={18} color="var(--goa-color-interactive-default)" />
      <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{label}</span>
      {badge}
      <span style={{ flex: 1 }}></span>
      <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600 }}>{amount}</span>
    </div>
  );
  const subtotalRow = (amount) => (
    <div style={{ display: "flex", alignItems: "center", padding: "6px 16px" }}>
      <span style={{ flex: 1 }}></span>
      <span style={{ font: "var(--goa-typography-body-s)", marginRight: 12 }}>Subtotal:</span>
      <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700 }}>{amount}</span>
    </div>
  );
  /* Does the provider drawer carry the "Incomplete vendor record" callout? Derived from the same
     providerOf().vendor data and the same "-" test the drawer renders it from, so the header mark and
     the callout can never disagree. */
  const vendorIncomplete = providerOf(c).vendor.some((pair) => pair[1] === "-");
  const GoaInfoCircle = window.GoaInformationCircle5;
  return (
    <div ref={detailRef} style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)", paddingBottom: "var(--goa-space-xl)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <GoabLinkButton size="compact" leadingIcon="arrow-back" onClick={onBack}>Claims reviews</GoabLinkButton>
        <D n={9} />
      </div>
      {/* borderBottom is transparent (not absent) at rest so the box height is identical pinned and
         unpinned — a border that appears on stick would shove the page 1px on every pin. */}
      <div ref={hdrRef} data-claim-header="1" data-stuck={hdrStuck ? "1" : "0"} style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--goa-color-greyscale-white)", padding: "8px 0", borderBottom: hdrStuck ? "1px solid var(--goa-color-greyscale-200)" : "1px solid transparent", boxShadow: hdrStuck ? "0 4px 10px -8px rgba(0,0,0,0.45)" : "none", display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
          {/* Flex + alignItems center, not inline-block + verticalAlign: middle. The heading is
             heading-xl/700 with a much taller line box than a medium icon button, so vertical-align
             centred each icon on the TEXT baseline box rather than on the row — they sat low. Flex
             centres every child on the row's own centre line. The two buttons share a nested row at
             gap 2 so they stay a tight pair while the pair sits 8 from the title. */}
          <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ font: "var(--goa-typography-heading-xl)", fontWeight: 700, minWidth: 0 }}>{c.name}: {c.pid}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            {/* The provider drawer can carry an "Incomplete vendor record" callout — the guardrail that a
               vendor/account inconsistency stops the payment at 1GX — but nothing on the header said
               so, and the drawer is closed by default. This warning mark appears only when that
               callout will be there.
               User 2026-08-12: the mark no longer opens the drawer. It is a non-interactive status
               glyph — the tooltip carries the reason, and the drawer is reached by its own affordance.
               Tone: warning-dark on the wrapper via the colour token rather than a hardcoded hex, so
               it stays under the callout's own `important` amber in the priority-signal colour law. */}
            {vendorIncomplete ? (
              /* Inside a ternary expression, NOT JSX children: a {…} JSX comment and a brace-wrapped
                 nested ternary are both illegal here — Babel read them as one object literal and the
                 whole module stopped compiling, which blanked the screen while every regex gate stayed
                 green. Plain JS comment, bare ternary.
                 goa-Badge important/strong icon-only — user 2026-08-13 (cc-1: "implement same to
                 badge-icon like whats in the accordion table"): the vendor mark wears the SAME
                 treatment as the accordion tables' flag markers, so one glyph vocabulary marks
                 "needs attention" everywhere. Boolean icon: the badge picks its own glyph + theme. */
              <span title="Incomplete vendor record — Trading Partner is not set." style={{ display: "inline-flex" }}>
                <GoabBadge type="important" icon ariaLabel="Warning: incomplete vendor record." />
              </span>
            ) : null}
              {/* The real GoA icon component (GoaInformationCircle5, figma node 2597:8544,
                 variant=outline) rather than GoabIconButton's ion-icon glyph. The DS button chrome is
                 kept by reusing its own classes, so hover, focus ring, padding and colour token are
                 the component's, not hand-rolled; color: inherit lets the icon follow
                 --goa-icon-button-default-color. Falls back to GoabIconButton if the bundle is absent. */}
              {GoaInfoCircle ? (
                <button type="button" className="goab-icon-btn goab-icon-btn--medium goab-icon-btn--color"
                  title="Provider information" aria-label="Provider information" onClick={() => setProvOpen(true)}>
                  <GoaInfoCircle variant="outline" style={{ color: "inherit" }} />
                </button>
              ) : (
                <GoabIconButton icon="information-circle-outline" size="medium" variant="color" title="Provider information" ariaLabel="Provider information" onClick={() => setProvOpen(true)} />
              )}
            </span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--goa-color-text-secondary)" }}>Claim ID: {c.clm}</span>
            {/* Hold routes through HoldBadge: this badge's tone comes from st.type, so the three
               literal swaps missed it and the header stayed emergency red while the queue went grey.
               Solid, not subtle, deliberately — it matches the activated CTA and the other hold badges
               rather than being a fourth variant. */}
            {c.status === "hold" ? <HoldBadge content={st.t} /> : <GoabBadge type={st.type} content={st.t} emphasis="subtle" />}
            {/* State chips: facts about the claim, not alarms. They carry no severity colour, so the
               two banners below stay the only things competing for peripheral attention. */}
            {stateChips.map((s) => <GoabBadge key={s.k} type={s.tone} content={s.label} emphasis="subtle" />)}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <div data-cta-group="1" style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <ClaimCTAs
              watch={!!(flags.watch && flags.watch.roles && act.watch && flags.watch.roles[act.watch.role])} hold={!!flags.hold} reviewed={!!flags.reviewed}
              supervisor={needsSup(c)} referred={c.status === "supervisor"}
              onRefer={() => openModal(c.status === "supervisor" ? "unrefer" : "refer")}
              onWatch={() => setWatchOpen(true)}
              onHold={() => openModal(flags.hold ? "editHold" : "hold")}
              onReviewed={() => openModal(flags.reviewed ? "clear" : "reviewed")} />
            {isSpecialist && !needsSup(c) ? <GoabButton type="primary" size="compact" leadingIcon="paper-plane" onClick={() => openModal("handoff")}>Send to Finance Officer</GoabButton> : null}
            {release1GX ? <GoabButton type="primary" size="compact" leadingIcon="card-outline" onClick={() => openModal("release1gx")}>Release to 1GX</GoabButton> : null}
          </div>
        </div>
      </div>
      {/* Responsive (#10) — the strip was eight hard-wired columns and could not reflow. 120px is
         the largest floor that still fits all eight tracks flat at the frame's own width (1179px),
         so the wide view is unchanged and the strip wraps cleanly below ~1000px. */}
      {/* Flex, not grid: at minmax(120px, 1fr) every track came out 159px while
         "sridley@example-childcare.ca" needs 185px and "34 subsidized · 66 registered" needs 205px,
         so those two subs wrapped to a second line. minmax(max-content, 1fr) would fix the width
         but is INVALID inside repeat(auto-fit, ...) — auto-fit needs a definite minimum, so the
         whole declaration would be dropped. Flex sizes each tile to its own content (measured
         max-content total 863px + 7×16px gaps = 975px, under the frame's 1179px) and still wraps
         cleanly when the frame narrows.
         flex is "0 0 auto", not "1 0 auto": with grow enabled the tiles stretched to fill the row,
         so the gaps varied with the frame width instead of the tiles hugging their content
         (user instruction 2026-08-11). justifyContent space-between then distributes the leftover
         space BETWEEN the tiles rather than growing them — each tile stays its own width and the row
         still fills the container. gap 16 remains the minimum spacing when the row is full. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between" }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2, flex: "0 0 auto", whiteSpace: "nowrap" }}>
            <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{k.l}</span>
            <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600, color: k.neg ? "var(--goa-color-emergency-dark)" : undefined }}>{k.v}</span>
            {k.sub ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}><span style={{ wordBreak: "break-all" }}>{k.sub}</span><GoabIconButton icon="documents-outline" size="small" variant="color" title="Copy" ariaLabel="Copy email address" onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText(k.sub); } catch (e) {} setNote({ msg: "Email copied to clipboard.", type: "success" }); }} /></span> : null}
            {k.sub2 ? <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{k.sub2}</span> : null}
            {k.delta ? <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--goa-color-text-secondary)" }}>{k.delta}</span> : null}
          </div>
        ))}
      </div>
      <div data-callout-stack="1" style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-xs)" }}>
        <ReviewBanner tier="blocker" items={blockers} open={!!openBanner.b} onToggle={() => toggleBanner("b")} />
        <ReviewBanner tier="attention" items={attention} open={!!openBanner.a} onToggle={() => toggleBanner("a")} />
        {!blockers.length && !attention.length && !advIssues.length ? (
          <GoabCallout type="success" size="medium" mb="none" heading="Nothing flagged on this claim">
            No rule was broken and no check needs attention. Review the payments below, then mark it reviewed.
          </GoabCallout>
        ) : null}
        {/* 004 S2 — the open request is information tone, never a blocker: the claim keeps moving
           (§19.2). One callout, whatever the target count; the answer lives in the thread. */}
        {c.reviewReq ? (
          <GoabCallout type="information" size="medium" mb="none" heading={c.reviewReq.answered ? "Review request answered" : "Review requested — " + joinAnd(c.reviewReq.targets.map(stageLabelOf))}>
            <span style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>{c.reviewReq.question}</span>
              <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", whiteSpace: "nowrap" }}>Asked by {c.reviewReq.by} · {c.reviewReq.at}</span>
              <GoabLinkButton size="compact" leadingIcon="chatbubble-outline" onClick={() => { setDTab((t) => ({ i: 4, k: t.k + 1 })); setReplyTo(90); setRDraft(""); }}>{c.reviewReq.answered ? "View in comments" : "Respond in comments"}</GoabLinkButton>
            </span>
          </GoabCallout>
        ) : null}
        {/* 004 — claim-level entry points (form 2026-08-19, A1: claim-level only this cycle).
           Hidden entirely when the showReviewFeatures tweak is off. */}
        {SHOW_REVIEW_UI ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <GoabButton type="tertiary" size="compact" leadingIcon="flag-outline" onClick={() => { setFSev("yellow"); setFReason(""); setFCarry(false); setFlagModal(true); }}>Raise a flag</GoabButton>
          <GoabButton type="tertiary" size="compact" leadingIcon="swap-horizontal-outline" onClick={() => { setReqTargets([]); setReqQ(""); setReqModal(true); }}>Request a review</GoabButton>
        </div>
        ) : null}
      </div>
      <GoabTabs key={"dt-" + dTab.k} variant="segmented" navigation="none" initialTab={dTab.i}>
        <GoabTab heading="Claim details">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-m)", paddingTop: 4 }}>
            {/* Figma "Data Vis – Charts" (TypeQA 6262:76259): the two trend charts read from the SAME
               figures as the KPI strip above them — this claim's own signed total, the actual
               advance-basis months, and this provider's licensed capacity as the reference line. */}
            {DETAIL_CHARTS ? (
              <InteractiveTrends cap={kids.cap} childrenNow={kids.total} staffNow={STAFF_N} claimNow={claimTotal} advanceNow={advance} basis={adv.basis} period={claimPeriod} />
            ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", minHeight: 220, padding: 16, background: "var(--goa-color-greyscale-100)", border: "2px dashed var(--goa-color-greyscale-400)", borderRadius: "var(--goa-border-radius-l)", boxSizing: "border-box" }}>
              <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 700, color: "var(--goa-color-text-secondary)" }}>Visuals TBD</span>
            </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {secTitle("Payments")}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {vehicles.map((v) => {
                  const vOff = !!DISABLED_VEHICLES[v.key];
                  const isOpen = !vOff && !!openV[v.key];
                  const hc = heldCount(v.key);
                  const vs = vStatus(v);
                  return (
                    <div key={v.key} style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 4, overflow: "visible" }}>
                      <div onClick={vOff ? undefined : () => setOpenV((o) => ({ ...o, [v.key]: !o[v.key] }))} role="button" tabIndex={vOff ? -1 : 0} aria-disabled={vOff ? "true" : undefined} aria-expanded={vOff ? undefined : (isOpen ? "true" : "false")}
                        onKeyDown={vOff ? undefined : (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); setOpenV((o) => ({ ...o, [v.key]: !o[v.key] })); } }}
                        style={{ cursor: vOff ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "var(--goa-color-greyscale-100)", borderRadius: isOpen ? "3px 3px 0 0" : 3, opacity: vOff ? 0.55 : 1 }}>
                        {/* Disabled (locked) vehicles show a LOCK, not an arrow — user 2026-08-13
                           (cc-3): a chevron promises expansion the row will not honour. Enabled rows
                           keep the DS disclosure chevrons. */}
                        <Ico name={vOff ? "lock-closed-outline" : isOpen ? "chevron-down-outline" : "chevron-forward-outline"} size={18} color={vOff ? "var(--goa-color-greyscale-500)" : "var(--goa-color-interactive-default)"} />
                        <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{v.label}</span>
                        {/* The "Ready for release" state badge is removed — user instruction 2026-08-12
                           ("remove badge"): a clean vehicle carries no badge; only exceptions surface
                           (hold count, Approved, Review). Matches the queue's exception-first status style.
                           Locked vehicles carry NO badges at all — user 2026-08-13 ("remove icc accordion
                           badges"): status and flag chips on a row this claim's reviewer cannot even open
                           are noise; the lock + dimming already say why.
                           Badges sit HERE, LEFT beside the label — the badges-left ruling (user
                           2026-08-13, queue cells) names the property, not the component, so the
                           accordion follows it. A same-day edit moved them past the spacer against
                           the amount AND pasted the label span twice ("Affordability Grant
                           Affordability Grant"); neither was asked for (user cc-1). Reverted;
                           G34 now catches the adjacent-duplicate class. */}
                        {vOff ? null : hc > 0 ? <HoldBadge content={hc + (hc > 1 ? " items on hold" : " item on hold")} /> : approved[v.key] ? <GoabBadge type="success" content="Approved" emphasis="subtle" /> : vs.type === "success" ? null : <GoabBadge type={vs.type} content={vs.t} emphasis="subtle" />}
                        {!vOff && vehFlagsOn && vehFlags(v).length ? <GoabBadge type={vehTone(v)} content={vehFlags(v).length + (vehFlags(v).length > 1 ? " flags" : " flag")} emphasis="subtle" icon /> : null}
                        <span style={{ flex: 1 }}></span>
                        {/* minWidth so amounts share a right edge across rows (verifier-measured 18px
                           ragged edge without it). */}
                        <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 600, minWidth: 110, textAlign: "right" }}>{moneyEl(v.amt)}</span>
                      </div>
                      {isOpen ? (
                        <React.Fragment>
                          {/* Line-item rows removed by user decision 2026-08-10: an open accordion shows no
                             line detail, only the header total. The per-line Adjust / Hold controls went
                             with them — G14 bans their marker so they cannot creep back silently. */}
                          <div style={{ borderTop: "1px solid var(--goa-color-greyscale-200)", background: "var(--goa-color-greyscale-white)", padding: "14px 16px" }}>
                            {/* Vehicle-level actions. The source carries these once, in the header — but that
                               header is static in a 1666px page, while this build scrolls 3208px, leaving the
                               CTAs at top:-569px and out of reach mid-review. Restored by user decision
                               2026-08-10, right-aligned to match the header group's alignment.
                               These sat inside a `v.key === "ag"` branch, so only Affordability Grant carried
                               them and every other vehicle opened with no actions (user 2026-08-12). Hoisted
                               out of the branch — one CTA row per open accordion, whatever the vehicle
                               (RULES MODULAR: no per-vehicle coupling). Only the affordability TABLE stays
                               vehicle-specific. */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", paddingBottom: v.key === "ag" ? 12 : 0 }}>
                              <ClaimCTAs
                                watch={!!(flags.watch && flags.watch.roles && act.watch && flags.watch.roles[act.watch.role])}
                                hold={!!flags.hold} reviewed={!!flags.reviewed}
                                onWatch={() => setWatchOpen(true)}
                                onHold={() => openModal(flags.hold ? "editHold" : "hold")}
                                onReviewed={() => openModal(flags.reviewed ? "clear" : "reviewed")} />
                            </div>
                            {v.key === "ag" ? <AffordabilityDetail /> : null}
                          </div>
                          <VehicleReview d={v.det} showFlags={vehFlagsOn} label={v.label} amt={v.amt} />
                        </React.Fragment>
                      ) : null}
                    </div>
                  );
                })}
                {subtotalRow(moneyEl(subtotal))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {secTitle("Adjustments")}
              {payRow("Claims Advance Recovery", <GoabBadge type="success" content={"Paid " + dayAt(periodT, 1)} emphasis="subtle" />, moneyEl(-advance), "adj")}
              {subtotalRow(moneyEl(-advance))}
            </div>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderTop: "2px solid var(--goa-color-greyscale-400)" }}>
              <span style={{ flex: 1 }}></span>
              <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700, marginRight: 16 }}>Total Payment:</span>
              <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700 }}>{moneyEl(netAmt)}</span>
            </div>
          </div>
        </GoabTab>
        <GoabTab heading="Payment details">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-m)", paddingTop: 4 }}>
            {payDetail(claimPeriod, subtotal).map((t) => (
              <div key={t.title} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {secTitle(t.title)}
                {t.note ? <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{t.note}</span> : null}
                <SimpleTable cols={t.cols} rows={t.rows} total={t.total} holds={pdHold} onHold={togglePdHold} rowKey={t.title} />
              </div>
            ))}
          </div>
        </GoabTab>
        <GoabTab heading={<TabHeading h={"Activity (" + events.length + ")"} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
            {/* Toolbar follows the QUEUE bar's design (user 2026-08-13 cc-7): right-aligned
               search · Filter · Export cluster, same order and labels as queueBar. */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "var(--goa-color-greyscale-100)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 4, padding: "10px 14px" }}>
              <span style={{ flex: 1 }}></span>
              <GoabInput name="act-q" size="compact" value={actQ} onChange={(...a) => setActQ(readVal(...a))} placeholder="Search activity" leadingIcon="search-outline" width="260px" />
              <GoabButton type="tertiary" size="compact" leadingIcon="filter-outline" onClick={() => {}}>Filter</GoabButton>
              <ExportMenu onPick={(fmt) => logEvent("Exported the activity log as " + fmt, "Export", null)} />
            </div>
            {(() => {
              const q = actQ.trim().toLowerCase();
              let rows = events.map((e, i) => ({ ...e, _i: i }));
              if (q) rows = rows.filter((e) => (e.desc + " " + e.who + " " + e.type + " " + e.status).toLowerCase().indexOf(q) >= 0);
              const k = actSort.k, d = actSort.dir;
              rows.sort((a, b2) => k === "when" ? (a._i - b2._i) * -d : String(a[k] || "").localeCompare(String(b2[k] || "")) * d);
              /* REAL GoA pattern (user 2026-08-13 "are these real GOA table header component?"):
                 GoabTable natively detects GoabTableSortHeader labels (goab-table__th--sort) — the
                 raw <table> + hand-styled th around the sort buttons was only half-real. */
              const ath = (label, key2) => GoabTableSortHeader
                ? <GoabTableSortHeader name={key2} direction={k === key2 ? (d === 1 ? "asc" : "desc") : "none"} onClick={() => setActSort((s) => ({ k: key2, dir: s.k === key2 ? -s.dir : 1 }))}>{label}</GoabTableSortHeader>
                : label;
              const atd = { font: "var(--goa-typography-body-s)", verticalAlign: "top" };
              return rows.length === 0 ? <EmptyState icon="search-outline" title="No activity matches that search" hint="Clear the search to see the full audit trail." />
                : (
                <GoabTable headers={[{ label: ath("Date/time", "when") }, { label: ath("User/System", "who") }, { label: ath("Type", "type") }, { label: ath("Description", "desc") }, { label: ath("Status", "status") }]} width="100%">
                      {rows.map((e, i) => (
                        <tr key={i}>
                          <td style={{ ...atd, width: 128, whiteSpace: "normal" }}>{e.when}</td>
                          <td style={{ ...atd, width: 168 }}>
                            <span style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontWeight: e.sys ? 700 : 400 }}>{e.who}</span>
                              {e.email ? <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", wordBreak: "break-all" }}>{e.email}</span> : null}
                            </span>
                          </td>
                          <td style={{ ...atd, width: 104 }}>{e.type}</td>
                          <td style={atd}>{e.desc}</td>
                          <td style={{ ...atd, width: 132 }}><GoabBadge type={ACT_BADGE[e.status] || "light"} content={e.status} emphasis="subtle" /></td>
                        </tr>
                      ))}
                </GoabTable>
              );
            })()}
          </div>
        </GoabTab>
        <GoabTab heading={<TabHeading h={"Comments (" + (comments.length + 18) + ")"} />}>
          <div style={{ display: "flex", flexDirection: "column", paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: "2px solid var(--goa-color-greyscale-400)", font: "var(--goa-typography-body-xs)", fontWeight: 700 }}>
              <span style={{ width: 26 }}></span><span style={{ width: 130 }}>Claim period</span><span style={{ width: 110 }}>Claim ID</span><span>Comments</span>
            </div>
            {[{ period: claimPeriod, clm: c.clm, current: true }].concat(commentPeriods(periodT, c.clm, recvDay)).map((p) => {
              const isOpen = !!openPeriod[p.period];
              const count = p.current ? comments.length : p.n;
              return (
                <div key={p.period} style={{ borderBottom: "1px solid var(--goa-color-greyscale-300)" }}>
                  <div onClick={() => setOpenPeriod((o) => ({ ...o, [p.period]: !o[p.period] }))} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
                    <span style={{ width: 26, display: "inline-flex" }}><Ico name={isOpen ? "chevron-down-outline" : "chevron-forward-outline"} size={18} color="var(--goa-color-interactive-default)" /></span>
                    <span style={{ width: 130, font: "var(--goa-typography-body-s)", fontWeight: 600 }}>{p.period}</span>
                    <span style={{ width: 110, fontFamily: MONO, fontSize: 13 }}>{p.clm}</span>
                    <span style={{ font: "var(--goa-typography-body-s)" }}>{count}</span>
                  </div>
                  {isOpen ? (
                    <div style={{ background: "var(--goa-color-greyscale-100)", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--goa-color-greyscale-300)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>Comments list</span>
                        <span style={{ flex: 1 }}></span>
                        {p.current ? <GoabButton type="secondary" size="compact" leadingIcon="chatbubble-outline" onClick={() => { const el = document.getElementById("comment-composer"); if (el && el.focus) el.focus(); }}>Add comment</GoabButton> : null}
                      </div>
                      {(p.current ? [...comments].sort((a, b2) => (b2.pinned ? 1 : 0) - (a.pinned ? 1 : 0)) : p.items).map((cm, i) => (
                        <div key={cm.id != null ? cm.id : i} style={{ display: "flex", flexDirection: "column", gap: 6, background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 6, padding: "12px 14px" }}>
                          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                            <b style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{cm.who}</b>
                            <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{cm.when}</span>
                            {cm.pinned ? <GoabBadge type="dark" content="Pinned" emphasis="subtle" /> : null}
                            <GoabBadge type={cm.pub ? "information" : "midtone"} content={cm.pub ? "Public" : "Internal"} emphasis="subtle" />
                            {(cm.tags || []).map((t) => <GoabBadge key={t} type="information" content={t} emphasis="subtle" />)}
                          </span>
                          <span style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>{mention(cm.body)}</span>
                          {p.current ? (
                            <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                              <GoabButton type="tertiary" size="compact" leadingIcon="arrow-undo-outline" onClick={() => { setReplyTo(replyTo === cm.id ? null : cm.id); setRDraft(""); }}>Reply{cm.replies && cm.replies.length ? " (" + cm.replies.length + ")" : ""}</GoabButton>
                              <GoabButton type="tertiary" size="compact" leadingIcon="bookmark-outline" onClick={() => togglePin(cm.id)}>{cm.pinned ? "Unpin" : "Pin"}</GoabButton>
                            </span>
                          ) : null}
                          {(cm.replies || []).length ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginLeft: 12, paddingLeft: 14, borderLeft: "2px solid var(--goa-color-greyscale-300)" }}>
                              {cm.replies.map((rp, ri) => (
                                <div key={ri} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                  <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                                    <b style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700 }}>{rp.who}</b>
                                    <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{rp.when}</span>
                                  </span>
                                  <span style={{ font: "var(--goa-typography-body-s)", lineHeight: 1.5 }}>{mention(rp.body)}</span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {replyTo === cm.id ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 12, paddingLeft: 14, borderLeft: "2px solid var(--goa-color-interactive-default)" }}>
                              <GoabTextarea name={"reply-" + cm.id} value={rDraft} onChange={(...a) => setRDraft(readVal(...a))} rows="2" placeholder={"Reply to " + cm.who + "\u2026"} width="100%" maxWidth="100%" />
                              <span style={{ display: "inline-flex", gap: 8 }}>
                                <GoabButton type="primary" size="compact" disabled={!rDraft.trim()} onClick={() => addReply(cm.id)}>Post reply</GoabButton>
                                <GoabButton type="tertiary" size="compact" onClick={() => setReplyTo(null)}>Cancel</GoabButton>
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ))}
                      {p.current ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 6, padding: "12px 14px" }}>
                          <GoabTextarea name="comment" id="comment-composer" value={draft} onChange={(...a) => setDraft(readVal(...a))} rows="3" placeholder="Add a comment for the claim record\u2026 use @ to mention a reviewer" width="100%" maxWidth="100%" />
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Tag:</span>
                            {TAGS.map((t) => <Chip key={t} text={t} on={dtags.includes(t)} onClick={() => setDtags((d) => d.includes(t) ? d.filter((x) => x !== t) : d.concat(t))} />)}
                            <GoabCheckbox size="compact" name="pub" checked={pubDraft} onChange={() => setPubDraft((v) => !v)} text="Public" />
                            <span style={{ flex: 1 }}></span>
                            <GoabButton type="primary" size="compact" leadingIcon="chatbubble-outline" disabled={!draft.trim()} onClick={addComment}>Add comment</GoabButton>
                          </div>
                        </div>
                      ) : <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Showing {p.items.length} of {p.n} — earlier periods are read-only.</span>}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div style={{ padding: "12px 14px" }}><GoabLinkButton size="compact" onClick={() => {}}>View older comments</GoabLinkButton></div>
          </div>
        </GoabTab>

      </GoabTabs>
      {modal && GoabModal ? (() => { const cfg = MODALS[modal]; return (
        <GoabModal heading={cfg.heading} open onClose={() => setModal(null)} maxWidth="480px">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {cfg.provider ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Provider</span>
                <GoabInput name="hold-provider" size="compact" value={c.name} readonly width="100%" ariaLabel="Provider" onChange={() => {}} />
              </div>
            ) : null}
            {cfg.label ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{cfg.label}</span>
                <GoabTextarea name="reason" value={mReason} onChange={(...a) => setMReason(readVal(...a))} rows="3" maxLength="250" placeholder="Add a short reason…" width="100%" />
                <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{cfg.required ? "Required · " : ""}{250 - mReason.length} characters remaining · saved to claim history</span>
              </div>
            ) : <span style={{ font: "var(--goa-typography-body-m)" }}>This action is logged to the claim history.</span>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
              <GoabButton type="tertiary" size="compact" onClick={() => setModal(null)}>Cancel</GoabButton>
              {/* GoabButton's own destructive variant — a hand-rolled red wrapper broke the hover
                 state, because the DS repaints tertiary's text and border on :hover underneath it. */}
              {cfg.destructive ? (
                <GoabButton type="secondary" size="compact" variant="destructive" leadingIcon="trash-outline" onClick={() => { cfg.destructive.run(); setModal(null); }}>{cfg.destructive.label}</GoabButton>
              ) : null}
              {cfg.confirm ? <GoabButton type={cfg.type} size="compact" disabled={cfg.required && !mReason.trim()} onClick={confirmModal}>{cfg.confirm}</GoabButton> : null}
            </div>
          </div>
        </GoabModal>
      ); })() : null}
      {adjModal && GoabModal ? (() => {
        const m = adjModal;
        const isAdjust = m.mode === "adjust";
        const parsed = parseFloat(String(aAmt).replace(/[^0-9.]/g, ""));
        const nextVal = isNaN(parsed) ? null : parsed;
        const delta = nextVal == null ? 0 : nextVal - m.old;
        const canConfirm = isAdjust ? (nextVal != null && !!aReason.trim()) : true;
        return (
          <GoabModal heading={isAdjust ? "Confirm a change" : "Approve payment amount"} open onClose={() => setAdjModal(null)} maxWidth="480px">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ font: "var(--goa-typography-body-m)" }}>{isAdjust ? "Adjusting " : "Approving "}<b>{m.label}</b>.</span>
              {isAdjust ? (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Current amount</span>
                    <span style={{ fontFamily: MONO, fontSize: 15, color: "var(--goa-color-text-secondary)", textDecoration: "line-through" }}>{fmt(m.old)}</span>
                  </div>
                  <Ico name="arrow-forward-outline" size={18} color="var(--goa-color-text-secondary)" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700 }}>New amount</span>
                    <GoabInput name="adj-amount" size="compact" value={aAmt} onChange={(...a) => setAAmt(readVal(...a))} width="150px" leadingContent="$" ariaLabel="New amount" />
                  </div>
                </div>
              ) : null}
              {isAdjust && nextVal != null && delta !== 0 ? (
                <GoabCallout type="important" size="medium" heading={(delta < 0 ? "Decrease of " : "Increase of ") + fmt(Math.abs(delta))}>
                  Changes the line item from {moneyEl(m.old)} to {moneyEl(nextVal)}. Logged to claim history and added as a tagged comment.
                </GoabCallout>
              ) : null}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{isAdjust ? "Reason for the change" : "Note (optional)"}</span>
                <GoabTextarea name="change-reason" value={aReason} onChange={(...a) => setAReason(readVal(...a))} rows="3" maxLength="250" placeholder={isAdjust ? "Why is this amount being adjusted?" : "Add a note for the record\u2026"} width="100%" maxWidth="100%" />
                <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{isAdjust ? "Required \u00b7 " : ""}{250 - aReason.length} characters remaining</span>
              </div>
              <GoabCheckbox size="compact" name="pin-comment" checked={aPin} onChange={() => setAPin((p) => !p)} text="Pin this note for future claims from this provider" />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <GoabButton type="tertiary" size="compact" onClick={() => setAdjModal(null)}>Cancel</GoabButton>
                <GoabButton type="primary" size="compact" disabled={!canConfirm} onClick={confirmChange}>{isAdjust ? "Confirm change" : "Approve amount"}</GoabButton>
              </div>
            </div>
          </GoabModal>
        );
      })() : null}
      {flagModal && GoabModal ? (
        <GoabModal heading="Raise a flag" open onClose={() => setFlagModal(false)} maxWidth="480px">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Severity</span>
              {GoabRadioGroup && GoabRadioItem ? (
                <GoabRadioGroup name="flag-sev" size="compact" value={fSev} onChange={(...a) => { const v = readVal(...a); if (v) setFSev(v); }}>
                  <GoabRadioItem value="red" label="Red — blocks release until cleared"></GoabRadioItem>
                  <GoabRadioItem value="yellow" label="Yellow — needs attention, does not block"></GoabRadioItem>
                </GoabRadioGroup>
              ) : (
                <span style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip text="Red — blocks release until cleared" on={fSev === "red"} onClick={() => setFSev("red")} />
                  <Chip text="Yellow — needs attention, does not block" on={fSev === "yellow"} onClick={() => setFSev("yellow")} />
                </span>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Reason for the flag</span>
              <GoabTextarea name="flag-reason" value={fReason} onChange={(...a) => setFReason(readVal(...a))} rows="3" maxLength="250" placeholder="What did you find, and what should the next reviewer check?" width="100%" maxWidth="100%" />
              <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Required · {250 - fReason.length} characters remaining · visible to every later stage</span>
            </div>
            <GoabCheckbox size="compact" name="flag-carry" checked={fCarry} onChange={() => setFCarry((v) => !v)} text="Carry this flag into future claim periods for this provider" />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <GoabButton type="tertiary" size="compact" onClick={() => setFlagModal(false)}>Cancel</GoabButton>
              <GoabButton type="primary" size="compact" disabled={!fReason.trim()} onClick={confirmRaiseFlag}>Raise flag</GoabButton>
            </div>
          </div>
        </GoabModal>
      ) : null}
      {reqModal && GoabModal ? (
        <GoabModal heading="Request a review" open onClose={() => setReqModal(false)} maxWidth="480px">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Non-blocking — the claim keeps moving while the receiving team answers. The answer returns to this claim's comments.</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Send to</span>
              {TRACK.filter((t) => t.k !== ROLE_STAGE).map((t) => (
                <GoabCheckbox key={t.k} size="compact" name={"req-" + t.k} checked={reqTargets.indexOf(t.k) >= 0} onChange={() => setReqTargets((x) => x.indexOf(t.k) >= 0 ? x.filter((y) => y !== t.k) : x.concat(t.k))} text={t.l} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Question for the receiving team</span>
              <GoabTextarea name="req-question" value={reqQ} onChange={(...a) => setReqQ(readVal(...a))} rows="3" maxLength="250" placeholder="What do you need them to confirm?" width="100%" maxWidth="100%" />
              <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Required · {250 - reqQ.length} characters remaining</span>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <GoabButton type="tertiary" size="compact" onClick={() => setReqModal(false)}>Cancel</GoabButton>
              <GoabButton type="primary" size="compact" disabled={!reqTargets.length || !reqQ.trim()} onClick={confirmRequest}>Send request</GoabButton>
            </div>
          </div>
        </GoabModal>
      ) : null}
      {childOpen && GoabModal ? (() => {
        const rows = childrenFor(ageGroup, childMonth);
        const key = childSort.k, dir = childSort.dir;
        const sorted = [...rows].sort((a, b2) => { const va = a[key], vb = b2[key]; if (va == null && vb == null) return 0; if (va == null) return 1; if (vb == null) return -1; return (typeof va === "string" ? va.localeCompare(vb) : va - vb) * dir; });
        const money = (v) => v == null ? "\u2014" : "$" + v.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const tdL = { font: "var(--goa-typography-body-s)", verticalAlign: "middle" };
        const tdN = { textAlign: "right", fontFamily: MONO, fontSize: 13, whiteSpace: "nowrap", verticalAlign: "middle" };
        const resort = (k) => setChildSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 }));
        const sortTh = (label, k) => GoabTableSortHeader ? <GoabTableSortHeader name={k} direction={key === k ? (dir === 1 ? "asc" : "desc") : "none"} onClick={() => resort(k)}>{label}</GoabTableSortHeader> : label;
        {/* Flag marker = goa-Badge important/strong icon-only — user 2026-08-13 (cc-3), same as the
           vehicle tables. */}
        const hoursCell = (kid) => kid.flagged
          ? (GoabTooltip
              ? <GoabTooltip content="Above the maximum billable hours for this claim period — confirm the attendance records before releasing payment." position="top" hAlign="right" maxWidth="260px"><span style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}><GoabBadge type="important" icon ariaLabel="Flagged" />{kid.hours}</span></GoabTooltip>
              : <span style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }} title="Above the maximum billable hours for this claim period"><GoabBadge type="important" icon ariaLabel="Flagged" />{kid.hours}</span>)
          : kid.hours;
        return (
          <GoabModal heading={c.name + " (" + c.pid + ")"} open onClose={() => setChildOpen(false)} maxWidth="840px">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
                <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Age group</span>
                <GoabDropdown name="age-group" size="compact" items={CHILD_AGE_GROUPS} value={ageGroup} width="360px" ariaLabel="Age group" onChange={(...a) => { const v = readVal(...a); if (v) setAgeGroup(v); }} />
              </div>
              {GoabTabs ? (
                <GoabTabs key={ageGroup} navigation="none" initialTab={childMonth + 1} onChange={(n) => setChildMonth(n - 1)}>
                  {childMonths.map((m, i) => <GoabTab key={m} heading={m + " (" + childrenFor(ageGroup, i).length + ")"}></GoabTab>)}
                </GoabTabs>
              ) : null}
              <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 8, maxHeight: "min(52vh, 420px)", overflowY: "auto" }}>
                <GoabTable headers={[{ label: sortTh("Child ID", "id") }, { label: sortTh("Name", "name") }, { label: sortTh("Current month fee", "fee"), numeric: true }, { label: sortTh("Hours attended", "hours"), numeric: true }, { label: sortTh("Estimated Aff. grant", "ag"), numeric: true }, { label: sortTh("Estimated subsidy", "subsidy"), numeric: true }]} width="100%">
                    {sorted.map((kid) => (
                      <tr key={kid.id}>
                        <td style={tdL}><GoabLinkButton size="compact" onClick={() => {}}>{kid.id}</GoabLinkButton></td>
                        <td style={tdL}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span style={{ font: "var(--goa-typography-body-s)" }}>{kid.name}</span>
                            {kid.sub ? <GoabBadge type="information" content="Subsidized" emphasis="subtle" /> : null}
                          </span>
                        </td>
                        <td style={tdN}>{money(kid.fee)}</td>
                        <td style={kid.flagged ? { ...tdN, color: "var(--goa-color-warning-text)", fontWeight: 700 } : tdN}>{hoursCell(kid)}</td>
                        <td style={tdN}>{money(kid.ag)}</td>
                        <td style={kid.subsidy == null ? { ...tdN, color: "var(--goa-color-text-secondary)" } : tdN}>{money(kid.subsidy)}</td>
                      </tr>
                    ))}
                </GoabTable>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Same source as the KPI strip and the enrolment banner — a drill-down must never
                   dispute the number that sent the reviewer to it. */}
                <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{rows.length} in this age group · {childMonths[childMonth]} · {kids.total} of {kids.cap} claimed across all age groups</span>
                <span style={{ flex: 1 }}></span>
                <GoabButton type="primary" size="compact" onClick={() => setChildOpen(false)}>Close</GoabButton>
              </div>
            </div>
          </GoabModal>
        );
      })() : null}
      {watchOpen ? (
        <WatchlistModal
          provider={{ pid: c.pid, name: c.name, addr: c.addr }}
          entry={flags.watch ? Object.assign({ roles: flags.watch.roles }, (act.watch && act.watch.find(c.pid)) || {}) : null}
          onClose={() => setWatchOpen(false)}
          onRemove={() => { if (act.watch) act.watch.remove(c.pid); else act.setStatus([c.id], "open"); setFlag("watch", null); setWatchOpen(false); logEvent("Removed the provider from the watchlist", "Watchlist", "Review"); }}
          onSave={(roles) => {
            if (act.watch) act.watch.save({ pid: c.pid, name: c.name, addr: c.addr }, roles); else act.setStatus([c.id], "watchlist");
            setFlag("watch", { roles });
            setWatchOpen(false);
            logEvent("Watchlist updated — watched by " + Object.keys(roles).join(", "), "Watchlist", "Review");
          }} />
      ) : null}
      {provOpen && GoabDrawer ? (
        <GoabDrawer open heading="Provider details" position="right" maxSize="520px" onClose={() => setProvOpen(false)}
          actions={<span style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}><GoabButton type="primary" size="compact" onClick={() => setProvOpen(false)}>Close</GoabButton></span>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 8 }}>
            {(() => {
              const field = (label, value, extra) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                  <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{label}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-s)", minWidth: 0 }}>
                    <span style={{ wordBreak: "break-word" }}>{value}</span>{extra}
                  </span>
                </div>
              );
              const pair = (a, b2) => <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>{a}{b2}</div>;
              return (
                <React.Fragment>
                  {field("Program", prov.program)}
                  {prov.addresses.map((a) => field(a[0], a[1]))}
                  {pair(field("Type", prov.type), field("Phone number", prov.phone))}
                  {pair(field("Contact Name", prov.contactName), field("Contact Email", prov.contactEmail,
                    <GoabIconButton icon="documents-outline" size="small" variant="color" title="Copy" ariaLabel="Copy contact email" onClick={() => { try { navigator.clipboard && navigator.clipboard.writeText(prov.contactEmail); } catch (e) {} setNote({ msg: "Email copied to clipboard.", type: "success" }); }} />))}
                  {pair(field("Licensing Officer", prov.officer), field("License Number", <span style={{ fontFamily: MONO }}>{prov.licence}</span>))}
                </React.Fragment>
              );
            })()}
            {/* Guardrail: vendor/account inconsistency shows up here first — a missing Trading Partner
               or a wrong Z-code is what stops a payment at 1GX. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4, borderTop: "2px solid var(--goa-color-greyscale-400)" }}>
              <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)" }}>Vendor record (1GX)</span>
              {prov.vendor.map(([k2, v2]) => (
                <span key={k2} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "6px 0", borderBottom: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-s)" }}>
                  <span style={{ color: "var(--goa-color-text-secondary)" }}>{k2}</span>
                  <span style={{ fontWeight: 600, textAlign: "right", fontFamily: v2 === "Z009" || v2 === "Z5" ? MONO : undefined }}>{v2}</span>
                </span>
              ))}
              {prov.vendor.some(([, v2]) => v2 === "-") ? (
                <GoabCallout type="important" size="medium" mb="none" heading="Incomplete vendor record">
                  Trading Partner is not set. Confirm the vendor record before release — an inconsistency here stops the payment at 1GX.
                </GoabCallout>
              ) : null}
            </div>
          </div>
        </GoabDrawer>
      ) : null}
      {GoabTemporaryNotification ? <GoabTemporaryNotification open={!!note} type={note ? note.type : "information"} message={note ? note.msg : ""} duration={4000} horizontalPosition="center" verticalPosition="bottom" onClose={() => setNote(null)} /> : null}
    </div>
  );
}

/* Claim lookup — cross-claim search. Figma "First Release - All - Claim lookup" (6966:49024)
   + "… - Results" (7178:81886): the field set, the four statuses and the result columns are the
   Figma set verbatim. Unlike the queue's Search box (which filters the CURRENT stage queue), this
   searches EVERY claim whatever stage it sits in — the find-&-filter gap from discovery Board 5.
   Funding types come from FUND, so adding/retiring a vehicle needs no change here (G3). */
const LOOK_STATUS = ["Review", "Ready for release", "Released to 1GX", "Hold"];
/* Stage → lookup status. The Finance stage is awaiting release, not paid. */
const LOOK_STAGE_STATUS = { finance: "Ready for release", released: "Released to 1GX" };
const LOOK_CTYPE = ["Claim", "Adjustment"];
const LOOK_PAGE = 12;
const REJECT_MSG = "Transaction rejected by financial institution (Royal Bank of Canada)";
const perLabel = (p) => ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(String(p).slice(4), 10)] + " " + String(p).slice(0, 4);
const lookStatus = (c) => c.status === "hold" ? "Hold" : (LOOK_STAGE_STATUS[c.stage] || "Review");
const lookType = (s) => s === "Hold" ? "emergency" : s === "Review" ? "important" : "success";
/* Namespaced so it cannot be read as a certificate or staff ID: the old 202020000+id range
   overlapped the FDH cert IDs (202020071\u2013076) and the payment-details staff IDs (202020075\u2013079),
   which put one 9-digit string with two meanings on the same screen once this became a primary
   queue column. Shared by the queue tables and Claim lookup, so both read the same value. */
const payIdOf = (c) => "PR-" + String(778400 + c.id * 3);
const vendorIdOf = (c) => "V" + String(c.pid).slice(-6);
const rejectedOf = (c) => c.id % 9 === 4;
const amtNum = (c) => parseFloat(String(c.amt).replace(/[^0-9.]/g, "")) || 0;

function ClaimLookup({ claims, onBack, onOpen }) {
  const { GoabButton, GoabBadge, GoabInput, GoabCheckbox, GoabTable, GoabCallout, GoabLinkButton, GoabDivider, GoabSkeleton } = NS();
  const F0 = { pname: "", pid: "", clm: "", vname: "", vid: "", voucher: "", cheque: "", ctype: [], status: [], fund: [], amtMin: "", amtMax: "" };
  const [f, setF] = React.useState(F0);
  const [query, setQuery] = React.useState(null);
  const [page, setPage] = React.useState(0);
  const [open, setOpen] = React.useState({});
  const [searching, setSearching] = React.useState(false);
  const rv = (...a) => { for (const x of a) { if (typeof x === "string") return x; if (x && typeof x === "object" && typeof x.value === "string") return x.value; } return ""; };
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const toggle = (k, v) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : x[k].concat(v) }));
  const has = (s, q) => !q.trim() || String(s).toLowerCase().indexOf(q.trim().toLowerCase()) >= 0;
  const match = (c, q) => {
    if (!has(c.name, q.pname) || !has(c.pid, q.pid) || !has(c.clm, q.clm)) return false;
    if (!has(c.name, q.vname) || !has(vendorIdOf(c), q.vid)) return false;
    if (!has(voucherOf(c), q.voucher) || !has(chequeOf(c), q.cheque)) return false;
    if (q.ctype.length && !q.ctype.includes(c.ctype)) return false;
    if (q.status.length && !q.status.includes(lookStatus(c))) return false;
    if (q.fund.length && !q.fund.includes(c.pay)) return false;
    if (q.amtMin && amtNum(c) < parseFloat(q.amtMin)) return false;
    if (q.amtMax && amtNum(c) > parseFloat(q.amtMax)) return false;
    return true;
  };
  const results = query ? claims.filter((c) => match(c, query)) : null;
  const total = results ? results.length : 0;
  const pages = Math.max(1, Math.ceil(total / LOOK_PAGE));
  const pg = Math.min(page, pages - 1);
  const shown = results ? results.slice(pg * LOOK_PAGE, pg * LOOK_PAGE + LOOK_PAGE) : [];
  const doSearch = () => { const snap = { ...f }; setSearching(true); setQuery(null); setPage(0); setOpen({}); setTimeout(() => { setQuery(snap); setSearching(false); }, 550); };
  const doClear = () => { setF(F0); setQuery(null); setPage(0); setOpen({}); setSearching(false); };
  const lbl = { font: "var(--goa-typography-body-s)", fontWeight: 700 };
  const field = (label, k, w) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={lbl}>{label}</span>
      <GoabInput name={"lk-" + k} size="compact" value={f[k]} onChange={(...a) => set(k, rv(...a))} width={w || "260px"} ariaLabel={label} />
    </div>
  );
  const ckGroup = (label, k, opts, withAll) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={lbl}>{label}</span>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {withAll ? <GoabCheckbox size="compact" name={"lk-all-" + k} checked={f[k].length === opts.length} indeterminate={f[k].length > 0 && f[k].length < opts.length} onChange={() => set(k, f[k].length === opts.length ? [] : opts.map((o) => o[1]))} text="Select all" /> : null}
        {opts.map((o) => <GoabCheckbox size="compact" key={o[1]} name={"lk-" + k + "-" + o[1]} checked={f[k].includes(o[1])} onChange={() => toggle(k, o[1])} text={o[0]} />)}
      </div>
    </div>
  );
  const dv = GoabDivider ? <GoabDivider /> : <div style={{ height: 1, background: "var(--goa-color-greyscale-200)" }}></div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)", paddingBottom: "var(--goa-space-xl)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <GoabLinkButton size="compact" leadingIcon="arrow-back" onClick={onBack}>Claims reviews</GoabLinkButton>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ font: "var(--goa-typography-heading-xl)", fontWeight: 700 }}>Claim lookup</span>
        <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Search every claim in ECDS — any stage, any queue, any funding type. Use this to trace a claim you no longer own.</span>
      </div>
      <div style={{ background: "rgb(241,241,241)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 4, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {field("Program name", "pname", "300px")}
          {field("Program ID", "pid", "220px")}
          {field("Claim ID", "clm", "200px")}
        </div>
        {dv}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {field("Vendor name", "vname", "300px")}
          {field("Vendor ID", "vid", "220px")}
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {field("Voucher ID (1GX)", "voucher", "220px")}
          {field("Cheque number", "cheque", "220px")}
        </div>
        {dv}
        {ckGroup("Claim type", "ctype", LOOK_CTYPE.map((t) => [t, t]), false)}
        {dv}
        {ckGroup("Status", "status", LOOK_STATUS.map((s) => [s, s]), true)}
        {dv}
        {ckGroup("Funding type", "fund", FUND.map(([label, key]) => [label, key]), true)}
        {dv}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={lbl}>Claim amount</span>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
            <GoabInput name="lk-amt-min" size="compact" value={f.amtMin} onChange={(...a) => set("amtMin", rv(...a))} width="150px" leadingContent="$" ariaLabel="Minimum amount" placeholder="Min" />
            <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", paddingBottom: 8 }}>to</span>
            <GoabInput name="lk-amt-max" size="compact" value={f.amtMax} onChange={(...a) => set("amtMax", rv(...a))} width="150px" leadingContent="$" ariaLabel="Maximum amount" placeholder="Max" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <GoabButton type="primary" size="compact" leadingIcon="search-outline" onClick={doSearch}>Search</GoabButton>
          <GoabButton type="secondary" size="compact" onClick={onBack}>Cancel</GoabButton>
          <span style={{ flex: 1 }}></span>
          <GoabButton type="tertiary" size="compact" onClick={doClear}>Clear all fields</GoabButton>
        </div>
      </div>
      {searching ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }} aria-live="polite">
          <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Searching all claims&hellip;</span>
          <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "var(--goa-color-greyscale-white)" }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (GoabSkeleton ? <GoabSkeleton key={i} variant="rect" width="100%" height="32px" /> : <div key={i} style={{ height: 32, borderRadius: 4, background: "var(--goa-color-greyscale-100)" }}></div>))}
          </div>
        </div>
      ) : results ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <span style={{ font: "var(--goa-typography-heading-s)", fontWeight: 700 }}>Showing {total ? pg * LOOK_PAGE + 1 : 0}&ndash;{Math.min(total, (pg + 1) * LOOK_PAGE)} of {total} result{total === 1 ? "" : "s"}</span>
            <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>across all stages and queues</span>
          </span>
          {total === 0 ? (
            <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 8, background: "var(--goa-color-greyscale-white)" }}>
              <EmptyState art="EmptySystemStateNoResults" title="No claims match these filters" hint="Try widening the claim amount, removing a status, or searching on the program ID alone." action={<GoabButton type="secondary" size="compact" onClick={doClear}>Clear all fields</GoabButton>} />
            </div>
          ) : (
            <React.Fragment>
              <div style={{ overflowX: "auto" }}>
                <GoabTable headers={["Payment ID", "Program ID", "Period", "Program name", "Status", { label: "Amount", numeric: true }, "Actions"]} width="100%">
                  {shown.map((c) => {
                    const isOpen = !!open[c.id];
                    const s = lookStatus(c);
                    const rej = rejectedOf(c);
                    const td = { padding: "8px 12px", verticalAlign: "middle", font: "var(--goa-typography-body-s)", background: isOpen ? "var(--goa-color-greyscale-50)" : undefined };
                    return (
                      <React.Fragment key={c.id}>
                        <tr>
                          <td style={{ ...td, fontFamily: MONO }}>{payIdOf(c)}</td>
                          <td style={{ ...td, fontFamily: MONO }}>{c.pid}</td>
                          <td style={{ ...td, whiteSpace: "nowrap", font: "var(--goa-typography-body-s)" }}>{perLabel(c.period)}</td>
                          <td style={{ ...td, minWidth: 200 }}>
                            <span style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600 }}>{c.name}</span>
                              <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{c.addr}</span>
                            </span>
                          </td>
                          <td style={td}>
                            <span style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
                              {s === "Hold" ? <HoldBadge content={s} /> : <GoabBadge type={lookType(s)} content={s} emphasis="subtle" />}
                              {rej ? <GoabBadge type="emergency" content="Rejected" emphasis="subtle" icon /> : null}
                            </span>
                          </td>
                          <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontWeight: 600, whiteSpace: "nowrap" }}><Amt c={c} /></td>
                          <td style={{ ...td, whiteSpace: "nowrap" }}>
                            <span style={{ display: "inline-flex", gap: 24, alignItems: "center" }}>
                              <GoabLinkButton size="compact" onClick={() => setOpen((o) => ({ ...o, [c.id]: !o[c.id] }))}>{isOpen ? "Hide" : "View"}</GoabLinkButton>
                              <GoabLinkButton size="compact" leadingIcon="open-outline" onClick={() => onOpen(c.id)}>Open</GoabLinkButton>
                            </span>
                          </td>
                        </tr>
                        {isOpen ? (
                          <tr>
                            <td colSpan={7} style={{ padding: 0, borderBottom: "2px solid var(--goa-color-greyscale-400)" }}>
                              <div style={{ padding: "14px 18px", background: "var(--goa-color-greyscale-50)", display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
                                  {[["Issue date", c.recv + ", 2026"], ["Claim ID", c.clm], ["Vendor name", c.name], ["Vendor ID", vendorIdOf(c)], ["Funding type", c.pay], ["Claim type", c.ctype], ["Voucher ID", voucherOf(c)], ["Cheque no.", chequeOf(c)]].map(([k, v]) => (
                                    <div key={k} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                      <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{k}</span>
                                      <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600 }}>{v}</span>
                                    </div>
                                  ))}
                                </div>
                                {rej ? (
                                  <GoabCallout type="emergency" size="medium" heading="Payment rejected">
                                    {REJECT_MSG} — correct the vendor or account details before re-issue.
                                  </GoabCallout>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </GoabTable>
              </div>
              {pages > 1 ? (
                /* DS pagination (deviation sweep 2026-08-13) — replaces the hand-rolled Previous/Next
                   pair. links variant: the page <select> is noise on a 2-3 page child list.
                   Plain JS comment — a {…} JSX comment here is expression position (G27). */
                GoabPagination ? <GoabPagination pageNumber={pg + 1} pageCount={pages} variant="links" onChange={(n) => setPage(n - 1)} /> : null
              ) : null}
            </React.Fragment>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* CCFOPS-445 / 476 "Modal - Watchlist modal - Multi role" — the roles are a checkbox list and each
   checked role reveals its OWN Watch reason. Shared by the claim detail and the Watchlist management
   tab so both write the same register.
   Provider field: read-only when the modal is opened FROM a claim (the provider is already known —
   the source frame shows it as a filled input). Opened from the Watchlist tab's own CTA there is no
   claim in hand, so the same slot becomes a picker over unwatched providers — user 2026-08-12,
   replacing a separate "Add provider" button that silently watched whichever claim sat first in the
   queue. */
function WatchlistModal({ provider, providers, entry, onClose, onSave, onRemove }) {
  const { GoabModal, GoabButton, GoabInput, GoabCheckbox, GoabTextarea, GoabDropdown } = NS();
  const [roles, setRoles] = React.useState(() => ({ ...((entry && entry.roles) || {}) }));
  const [pick, setPick] = React.useState("");
  if (!GoabModal) return null;
  const toggle = (r) => setRoles((x) => { const n = { ...x }; if (n[r] != null) delete n[r]; else n[r] = ""; return n; });
  const setReason = (r, v) => setRoles((x) => ({ ...x, [r]: v }));
  const checked = Object.keys(roles);
  const list = providers || [];
  const prov = provider || list.filter((p) => p.pid === pick)[0] || null;
  const valid = !!prov && checked.length > 0 && checked.every((r) => String(roles[r]).trim());
  return (
    <GoabModal heading="Add to watchlist" open onClose={onClose} maxWidth="480px">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {provider ? (
          <GoabInput name="watch-provider" size="compact" value={provider.name} readonly width="100%" ariaLabel="Provider" onChange={() => {}} />
        ) : (
          <GoabDropdown name="watch-provider-pick" size="compact" value={pick} width="100%" ariaLabel="Provider"
            placeholder={list.length ? "Choose a provider" : "Every provider is already watched"}
            items={list.map((p) => ({ label: p.name + " · " + p.pid, value: p.pid }))}
            onChange={(...a) => { const v = val(...a); if (v) setPick(v); }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Watching roles</span>
          {WATCH_ROLES.map((r) => (
            <div key={r} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <GoabCheckbox size="compact" name={"wr-" + r} checked={roles[r] != null} onChange={() => toggle(r)} text={watchRoleLabel(r)} />
              {roles[r] != null ? (
                <div style={{ margin: "0 0 4px 12px", padding: "16px 18px", border: "1px solid var(--goa-color-greyscale-200)", borderLeft: "4px solid var(--goa-color-greyscale-200)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700 }}>Watch reason</span>
                  <GoabTextarea name={"wreason-" + r} value={roles[r]} onChange={(...a) => setReason(r, val(...a))} rows="2" maxLength="200" placeholder={"Why is " + watchRoleLabel(r) + " watching this provider?"} width="100%" maxWidth="100%" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", alignItems: "center" }}>
          <GoabButton type="tertiary" size="compact" onClick={onClose}>Cancel</GoabButton>
          {entry && onRemove ? (
            <GoabButton type="secondary" size="compact" variant="destructive" leadingIcon="trash-outline" onClick={onRemove}>Remove</GoabButton>
          ) : null}
          <GoabButton type="primary" size="compact" disabled={!valid} onClick={() => onSave(roles, prov)}>{entry ? "Save changes" : "Add to watchlist"}</GoabButton>
        </div>
      </div>
    </GoabModal>
  );
}

/* Claim review status — the stage progression the Aug 2026 session asked for ("we need to see a
   checkbox. Red light, green light"). The stage set and the n/a rule both come from VEHICLE_STAGE,
   so adding or retiring a funding vehicle needs no change here (G3). Colour is never the only cue:
   every pip carries its stage letters and a tooltip naming the stage and its state. */
const TRACK = [
  { k: "qa", s: "QA", l: "QA Review" },
  { k: "sub", s: "SUB", l: "Subsidy EO" },
  { k: "fdh", s: "FDH", l: "FDH EO" },
  { k: "icc", s: "ICC", l: "ICC EO" },
  { k: "funding", s: "MGR", l: "Funding Manager" },
];
const TRACK_ORDER = TRACK.map((t) => t.k);
/* Subsidy is the ONLY stage that can read Not applicable (user rule, 2026-08-11). A claim is per
   provider per period and carries line items across several funding types — discovery §19.2 has one
   claim flagged to ICC and Funding at once, §19.3 has ICC seeing all 21 staff and picking out which
   carry ICC — so FDH EO and ICC EO both review part of most claims and are never n/a. c.pay is a
   single-vehicle simplification of the queue row, not grounds for hiding a stage. Subsidy differs
   because it covers OSC children only, so a provider can genuinely have none. */
const SPECIALIST_STAGES = ["sub"];
const TRACK_STATE = {
  done: { bg: "var(--goa-color-success-default)", fg: "var(--goa-color-greyscale-white)", w: "Complete" },
  current: { bg: "var(--goa-color-info-default)", fg: "var(--goa-color-greyscale-white)", w: "In review" },
  /* Hold is the CTA's grey, not emergency red — a paused claim is not a breached rule (user
     instruction 2026-08-11: one hold colour everywhere). CTA_FILL.hold is the Figma chip's fill. */
  hold: { bg: CTA_FILL.hold, fg: "var(--goa-color-greyscale-white)", w: "On hold" },
  pending: { bg: "var(--goa-color-greyscale-white)", fg: "var(--goa-color-text-default)", w: "Not started", outline: true },
  na: { bg: "var(--goa-color-greyscale-100)", fg: "var(--goa-color-text-default)", w: "Not applicable", outline: true, na: true },
};
/* A claim sitting at QA can still carry downstream history: the Funding EO's hold "requests QA to
   follow up with the program" (board 7 §15.3), so the claim comes BACK to QA with earlier stages
   already complete and a downstream stage red. One scalar stage cannot express that — this is the
   per-stage record. Seeded off the claim id so the queue shows the real mix on first load; a real
   implementation would read it from the stage log. */
const stageRecordOf = (c) => {
  if (c.stageStates) return c.stageStates;
  if (c.stage !== "qa" || c.id % 4 !== 1) return null;
  const veh = VEHICLE_STAGE[c.pay];
  /* The hold has to land on a stage this claim's vehicle actually routes through, otherwise the
     n/a rule correctly suppresses it. Subsidy always runs first; the vehicle's own stage is the
     last one, so a returned claim is held there. */
  const rec = { qa: "current" };
  if (veh !== "sub") rec.sub = "done";
  rec[veh] = "hold";
  return rec;
};
const rawTrackState = (c, k) => {
  if (SPECIALIST_STAGES.indexOf(k) >= 0 && VEHICLE_STAGE[c.pay] !== k) return "na";
  const rec = stageRecordOf(c);
  if (rec && rec[k]) return rec[k];
  /* Funding EO is the last review stage; a claim past it (awaiting release or paid) has cleared
     every stage that applies to it. */
  if (c.stage === "released" || TRACK_ORDER.indexOf(c.stage) < 0) return "done";
  const cur = TRACK_ORDER.indexOf(c.stage);
  const me = TRACK_ORDER.indexOf(k);
  if (me < cur) return "done";
  if (me > cur) return "pending";
  return c.status === "hold" ? "hold" : "current";
};
/* Stages run in order, so a green stage means every applicable stage before it is green too —
   a later completion can only have happened after the earlier ones. */
const trackStateOf = (c, k) => {
  const s = rawTrackState(c, k);
  if (s === "na" || s === "done") return s;
  for (let i = TRACK_ORDER.indexOf(k) + 1; i < TRACK_ORDER.length; i++) {
    if (rawTrackState(c, TRACK_ORDER[i]) === "done") return "done";
  }
  return s;
};
/* Claim review status. The five abbreviated pips this replaces asked the reviewer to decode
   QA/SUB/FDH/FUND/FIN and gave an n/a stage the same weight as a real one — three of five cells
   were noise. Two layers instead, answering the question the reviewer actually has ("is this
   blocked, and where?"):
     · a segmented bar as the glance layer — one segment per stage, left to right, with a stage the
       claim never routes through shown as a hairline rather than a full segment
     · a plain-language line naming the state, so nothing depends on a legend or on colour alone
   Considered and rejected: a status badge alone (loses which stage is red vs merely pending) and a
   dot sequence (still needs a legend to say what the dots count). */
/* Claim review status — four treatments, switchable with the statusStyle prop so the working
   session can compare them on real rows instead of in the abstract.

   Why more than one: every row in the QA queue is AT QA, so a five-stage progress readout mostly
   restates the tab heading. What varies is downstream history — the Funding EO's hold "requests QA
   to follow up with the program" (board 7 §15.3), so a claim returns to QA with earlier stages
   complete and one stage red. Each treatment makes a different trade on that.

     exception (default) — nothing unless there IS something: a red chip naming the blocking stage,
                           green when the chain is done, an em-dash otherwise. Least ink, strongest
                           peripheral signal, no legend needed.
     stages             — the applicable stages named in full, in order, colour-coded. No
                           abbreviations, no dead n/a cells; widest.
     meter              — "2 / 3" complete plus one dot in the worst state. Most compact; needs the
                           tooltip to say which stage.
     bar                — segmented bar + one plain-language line. Middle ground.

   All four carry the full stage list, n/a included, in the tooltip. */
var STATUS_STYLE = "exception";
function StageTrack({ c }) {
  const { GoabBadge, GoabTooltip } = NS();
  const states = TRACK.map((t) => ({ t, k: trackStateOf(c, t.k) }));
  const applicable = states.filter((x) => x.k !== "na");
  const held = states.filter((x) => x.k === "hold")[0];
  const cur = states.filter((x) => x.k === "current")[0];
  const doneN = states.filter((x) => x.k === "done").length;
  const lastDone = states.filter((x) => x.k === "done").slice(-1)[0];
  const allDone = doneN === applicable.length;
  const detail = states.map(({ t, k }) => t.l + ": " + TRACK_STATE[k].w).join(" \u00b7 ");
  const wrap = (body) => (GoabTooltip
    ? <GoabTooltip content={detail} position="top" maxWidth="320px">{body}</GoabTooltip>
    : <span title={detail}>{body}</span>);

  /* "stages": a progress timeline, not chips — a state pip + the stage label, joined by arrows.
     Colour is never the only cue: every stage still carries its full name inline and the tooltip
     names each stage's state (RULES A11Y). Arrow is arrow-forward, verified present in
     ionicons-offline.js (74 keys) rather than assumed from the audit's allowlist. */
  if (STATUS_STYLE === "stages") return wrap(
    <span style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 2, cursor: "default" }}>
      {applicable.map(({ t, k }, i) => {
        const st = TRACK_STATE[k];
        const pend = k === "pending";
        return (
          <React.Fragment key={t.k}>
            {i ? <span style={{ display: "inline-flex", padding: "0 4px", flexShrink: 0 }}><Ico name="arrow-forward-outline" size={11} color="var(--goa-color-greyscale-400)" /></span> : null}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: pend ? "var(--goa-color-greyscale-white)" : st.bg, boxShadow: pend ? "inset 0 0 0 1px var(--goa-color-greyscale-400)" : "none" }}></span>
              <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: pend ? 400 : 600, color: pend ? "var(--goa-color-text-secondary)" : "var(--goa-color-text-default)" }}>{t.l}</span>
            </span>
          </React.Fragment>
        );
      })}
    </span>
  );

  if (STATUS_STYLE === "meter") {
    const worst = held ? TRACK_STATE.hold : allDone ? TRACK_STATE.done : cur ? TRACK_STATE.current : TRACK_STATE.pending;
    return wrap(
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "default" }}>
        <span style={{ width: 10, height: 10, borderRadius: 999, flexShrink: 0, background: worst.bg, boxShadow: worst.outline ? "inset 0 0 0 1px var(--goa-color-greyscale-400)" : "none" }}></span>
        <span style={{ fontFamily: MONO, font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{doneN} / {applicable.length}</span>
      </span>
    );
  }

  if (STATUS_STYLE === "bar") return wrap(
    <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 116, cursor: "default" }}>
      <span style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {states.map(({ t, k }) => {
          const st = TRACK_STATE[k];
          return <span key={t.k} style={{ width: k === "na" ? 6 : 22, height: 8, borderRadius: 2, flexShrink: 0, background: k === "na" ? "var(--goa-color-greyscale-100)" : k === "pending" ? "var(--goa-color-greyscale-white)" : st.bg, boxShadow: k === "na" || k === "pending" ? "inset 0 0 0 1px var(--goa-color-greyscale-400)" : "none" }}></span>;
        })}
      </span>
      <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 600, color: held ? CTA_FILL.hold : allDone ? "var(--goa-color-success-dark)" : "var(--goa-color-text-default)", lineHeight: 1.3 }}>
        {held ? "Held at " + held.t.l : allDone ? "All stages complete" : cur ? "In review at " + cur.t.l : "Not started"}
      </span>
    </span>
  );

  if (!GoabBadge) return null;
  if (held) return wrap(<span style={{ cursor: "default" }}><HoldBadge content={"Held at " + held.t.l} /></span>);
  /* Progress and completion are the SAME statement — the last stage that finished, named, in green.
     "All stages complete" told you the chain ended but not who ended it, and read as a different fact
     from the partial case beside it (user 2026-08-12). The count and the per-stage states are in the
     tooltip.
     Every state is a badge: green for progress, light for not-started. */
  if (doneN) return wrap(<span style={{ cursor: "default" }}><GoabBadge type="success" content={lastDone.t.l + " complete"} emphasis="subtle" /></span>);
  if (cur) return wrap(<span style={{ cursor: "default" }}><GoabBadge type="information" content={"In review at " + cur.t.l} emphasis="subtle" /></span>);
  return wrap(<span style={{ cursor: "default" }}><span style={{ color: "var(--goa-color-greyscale-400)" }}>—</span></span>);
}

function Row({ c, st, act, cols, ro, noX, extra }) {
  const { GoabCheckbox, GoabBadge, GoabButton, GoabLinkButton } = NS();
  /* Δ5 — evidence opens INLINE on the row (score, top-3 drivers, plain-language violations), so the
     "reason for the flag" needs no trip to the detail. Off unless the board asks for it: split mode
     already shows evidence in its own panel (noX) and a read-only queue has nothing to annotate. */
  const canX = ROW_EVIDENCE && !noX && !ro;
  const open = canX && st.expanded.has(c.id);
  const td = { paddingTop: 6, paddingBottom: 6, verticalAlign: "middle", font: "var(--goa-typography-body-s)" };
  /* Cells are keyed so a per-queue / per-vehicle column module can splice itself in after its
     anchor (CCFOPS-374 Period + Held by, CCFOPS-378 Region) without a second row component. */
  const cells = [
    ["sel", <td key="sel" style={{ ...td, whiteSpace: "nowrap" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{ro ? null : <GoabCheckbox size="compact" name={"sel-" + c.id} checked={st.selected.has(c.id)} onChange={() => act.toggleSel(c.id)} ariaLabel={"Select " + c.clm} />}{c.status === "reviewed" || c.status === "cleared" ? <Ico name="checkmark-circle" size={18} color="var(--goa-color-success-default)" /> : null}</span></td>],
    ["recv", <td key="recv" style={{ ...td, whiteSpace: "nowrap", font: "var(--goa-typography-body-s)" }}>{c.recv}</td>],
    ["name", <td key="name" style={{ ...td, minWidth: 164 }}><span style={{ display: "flex", flexDirection: "column" }}><span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600 }}>{c.name}</span><span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{c.addr}</span></span></td>],
    ["pid", <td key="pid" style={{ ...td, fontFamily: MONO }}>{c.pid}</td>],
    ["per", <td key="per" style={{ ...td, whiteSpace: "nowrap", font: "var(--goa-typography-body-s)" }}>{perLabel(c.period)}</td>],
    /* §19.5 — the claim ID references the payment BUNDLE; what CCIS carries, and what reconciliation
       and operator calls quote, is the payment reference number assigned when the payment hits
       pending. Same payIdOf() the claim lookup uses, so the two can never disagree. */
    ["payref", <td key="payref" style={{ ...td, fontFamily: MONO, color: "var(--goa-color-text-default)", whiteSpace: "nowrap" }}>{payIdOf(c)}</td>],
    ["ctype", <td key="ctype" style={{ ...td, font: "var(--goa-typography-body-s)" }}>{c.ctype}</td>],
    ["flags", (
      <td key="flags" style={td}>
        <span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {/* Figma's Flag(s) column carries the CCIS flag, plus Hold when the claim is held. */}
          {c.ccs ? <GoabBadge type={flagTone(c.ccs)} content={c.ccs} emphasis="subtle" /> : null}
          {c.status === "hold" ? <HoldBadge content="Hold" /> : null}
          {/* 004 S2 — open review request: information tone (non-blocking, never the hold path). A
             row visiting a target stage's queue also names the stage it actually sits at. */}
          {c.reviewReq && !c.reviewReq.answered ? <GoabBadge type="information" content="Review requested" emphasis="subtle" /> : null}
          {c.reviewReq && !c.reviewReq.answered && c.stage !== ROLE_STAGE ? <StageTag c={c} /> : null}
          {!c.ccs && c.status !== "hold" && !(c.reviewReq && !c.reviewReq.answered) ? <span style={{ color: "var(--goa-color-greyscale-400)" }}>&mdash;</span> : null}
        </span>
      </td>
    )],
    /* Review status: column RESTORED with deliberately EMPTY cells (user instruction 2026-08-11).
       The stage track itself moved to the Claims overview, where the stages actually differ; here the
       column is a reserved slot, so the header and column count stay stable while the cell content is
       decided. Rendered as a real empty <td> rather than omitted, otherwise every cell after it would
       shift one column left of its header. */
    ["stat", <td key="stat" style={td}></td>],
    ["amt", <td key="amt" style={{ ...td, textAlign: "right", fontFamily: MONO, fontWeight: 600, whiteSpace: "nowrap" }}><Amt c={c} /></td>],
    /* The action pair is the SAME one the claim lookup uses (node 7178:81886): View/Hide toggles the
       evidence inline on the row, Open leaves for the claim detail. One vocabulary in both tables. */
    ["act", (
      <td key="act" style={{ ...td, whiteSpace: "nowrap" }}>
        <span style={{ display: "inline-flex", gap: 24, alignItems: "center" }}>
          {canX ? <GoabLinkButton size="compact" onClick={() => act.toggleX(c.id)}>{open ? "Hide" : "View"}</GoabLinkButton> : null}
          <GoabLinkButton size="compact" leadingIcon="open-outline" onClick={() => act.openWorkflow(c.id)}>Open</GoabLinkButton>
        </span>
      </td>
    )],
  ];
  (extra || []).forEach((k) => {
    const m = COLUMNS[k]; if (!m) return;
    const at = cells.findIndex((x) => x[0] === m.after);
    cells.splice(at + 1, 0, [k, <td key={k} style={{ ...td, font: "var(--goa-typography-body-s)", whiteSpace: "nowrap" }}>{m.cell(c)}</td>]);
  });
  return (
    <React.Fragment>
      <tr>{cells.map((x) => x[1])}</tr>
      {/* G7 — the expanded panel carries its own top rule so two adjacent open rows stay separable. */}
      {open ? (
        <tr><td colSpan={cols} style={{ padding: 0, borderTop: "1px solid var(--goa-color-greyscale-300)" }}>
          <EvidenceCard c={c} st={st} act={act} />
        </td></tr>
      ) : null}
    </React.Fragment>
  );
}

function RowFig({ c, st, act }) {
  const { GoabBadge, GoabButton, GoabLinkButton } = NS();
  const open = false;
  const td = { paddingTop: 10, paddingBottom: 10, verticalAlign: "middle", font: "var(--goa-typography-body-s)" };
  return (
    <React.Fragment>
      <tr>
        <td style={{ ...td, width: 26 }}>{c.status === "reviewed" || c.status === "cleared" ? <Ico name="checkmark-circle" size={18} color="var(--goa-color-success-default)" /> : null}</td>
        <td style={{ ...td, whiteSpace: "nowrap", font: "var(--goa-typography-body-s)" }}>{c.recv}</td>
        <td style={{ ...td, minWidth: 164 }}><span style={{ display: "flex", flexDirection: "column" }}><span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600 }}>{c.name}</span><span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{c.addr}</span></span></td>
        <td style={{ ...td, fontFamily: MONO }}>{c.pid}</td>
        <td style={{ ...td, whiteSpace: "nowrap", font: "var(--goa-typography-body-s)" }}>{perLabel(c.period)}</td>
        <td style={{ ...td, fontFamily: MONO, color: "var(--goa-color-text-default)", whiteSpace: "nowrap" }}>{payIdOf(c)}</td>
        <td style={{ ...td, font: "var(--goa-typography-body-s)" }}>{c.ctype}</td>
        <td style={td}>
          <span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {c.viol ? <GoabBadge type="emergency" content={c.viol + (c.viol > 1 ? " violations" : " violation")} emphasis="subtle" icon="warning-outline" /> : null}
            {c.risk != null && c.risk >= 70 && !c.viol ? <GoabBadge type="important" content="High risk" emphasis="subtle" /> : null}
            {c.ccs ? <GoabBadge type={flagTone(c.ccs)} content={c.ccs} emphasis="subtle" /> : null}
            {needsSup(c) ? <GoabBadge type="important" content="Over $25k" emphasis="subtle" /> : null}
            {c.returned ? <GoabBadge type="important" content={"Returned by " + c.returned} emphasis="subtle" /> : null}
            {c.status === "hold" ? <HoldBadge content="On hold" /> : null}
            {c.status === "watchlist" || c.watch ? <GoabBadge type="dark" content="Watchlist" emphasis="subtle" /> : null}
            {!c.viol && !(c.risk >= 70) && !c.ccs && c.status === "open" && !c.watch ? <span style={{ color: "var(--goa-color-greyscale-400)" }}>—</span> : null}
          </span>
        </td>
        <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontWeight: 600, whiteSpace: "nowrap" }}><Amt c={c} /></td>
        <td style={{ ...td, whiteSpace: "nowrap" }}><span style={{ display: "inline-flex", alignItems: "center" }}><GoabLinkButton size="compact" leadingIcon="open-outline" onClick={() => act.openWorkflow(c.id)}>Open</GoabLinkButton></span></td>
      </tr>
    </React.Fragment>
  );
}

function RowAll({ c, st, act }) {
  const { GoabBadge, GoabButton, GoabLinkButton } = NS();
  const open = false;
  const td = { paddingTop: 10, paddingBottom: 10, verticalAlign: "middle", font: "var(--goa-typography-body-s)" };
  const statusBadge = c.stage === "released"
    ? <GoabBadge type="success" content="Released to 1GX" emphasis="subtle" />
    : c.status === "reviewed" || c.status === "cleared"
    ? <GoabBadge type="success" content="Ready for release" emphasis="subtle" />
    : c.status === "supervisor" ? <GoabBadge type="information" content="With supervisor" emphasis="subtle" />
    : c.status === "hold" ? <HoldBadge content="Hold" />
    : c.status === "watchlist" ? <GoabBadge type="dark" content="Watchlist" emphasis="subtle" />
    : <GoabBadge type="important" content="Review" emphasis="subtle" />;
  return (
    <React.Fragment>
      <tr>
        <td style={{ ...td, whiteSpace: "nowrap", font: "var(--goa-typography-body-s)" }}>{c.recv}, 2026</td>
        <td style={{ ...td, minWidth: 220 }}>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600 }}>{c.name}</span>
            <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{c.addr}</span>
          </span>
        </td>
        <td style={{ ...td, fontFamily: MONO, whiteSpace: "nowrap" }}>{c.pid}</td>
        <td style={{ ...td, whiteSpace: "nowrap", font: "var(--goa-typography-body-s)" }}>{perLabel(c.period)}</td>
        <td style={{ ...td, fontFamily: MONO, whiteSpace: "nowrap" }}>{payIdOf(c)}</td>
        <td style={{ ...td, font: "var(--goa-typography-body-s)" }}>{c.ctype}</td>
        {/* Review status moved here from the queue (user instruction 2026-08-11). The overview spans
           every stage, so this is the one table where the stage track actually varies — in a
           single-stage queue it mostly restates the tab heading. Same StageTrack component, so the
           two surfaces cannot drift. The single-badge Status column it replaces carried "With
           supervisor" and "Watching", which the track has no state for; that badge is kept beside it
           only when it says something the track cannot. */}
        <td style={td}>
          <span style={{ display: "inline-flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
            <StageTrack c={c} />
            {c.status === "supervisor" || c.status === "watchlist" ? statusBadge : null}
            {c.reviewReq && !c.reviewReq.answered ? <GoabBadge type="information" content="Review requested" emphasis="subtle" /> : null}
          </span>
        </td>
        <td style={{ ...td, textAlign: "right", fontFamily: MONO, fontWeight: 600, whiteSpace: "nowrap" }}><Amt c={c} /></td>
        <td style={{ ...td, whiteSpace: "nowrap" }}><span style={{ display: "inline-flex", alignItems: "center" }}><GoabLinkButton size="compact" leadingIcon="open-outline" onClick={() => act.openWorkflow(c.id)}>Open</GoabLinkButton></span></td>
      </tr>
    </React.Fragment>
  );
}

/* Readiness gate lives in a WRAPPER, not inline. The gate used to be an early return sitting
   above ~20 useState/useEffect calls, so the render before the bundles landed registered 2 hooks
   and the render after registered ~22 — a hook-order violation that made React thrash and pinned
   the main thread for tens of seconds. The wrapper always runs exactly one hook; the inner screen
   only mounts once the design-system and Figma bundles are live, so its hook order is stable. */
function QAPrototypeScreen(props) {
  const ready = useDS();
  if (!ready) return <p style={{ padding: 24, font: "var(--goa-typography-body-m)" }}>Loading components…</p>;
  return <QAQueueScreen {...props} />;
}

/* paPlacement defaults to "none": MVP V1 mounts this screen without the attribute and is scoped
   without the analyzer entry. The consolidated QA Review board passes "toolbar" or "tab". */
function QAQueueScreen({ role = "hq-qa", grouping = "bands", deltas, paPlacement = "none", evidenceMode = "expand", evidenceLayout = "banner", statusStyle = "exception", showKpis = true, showReviewFeatures = true, rowEvidence = "off", detailCharts = "off", kpiStyle = "placeholder", signer = "Avery Solano" }) {
  SHOW_DELTAS = !!deltas && deltas !== "false";
  const onFlag = (v) => !!v && v !== "false" && v !== "off";
  ROW_EVIDENCE = onFlag(rowEvidence);
  DETAIL_CHARTS = onFlag(detailCharts);
  EVIDENCE_LAYOUT = evidenceLayout;
  STATUS_STYLE = statusStyle || "exception";
  SHOW_REVIEW_UI = !!showReviewFeatures && showReviewFeatures !== "false";
  const { GoabButton, GoabLinkButton, GoabTable, GoabTabs, GoabTab, GoabInput, GoabDropdown, GoabDropdownMultiselect, GoabCheckbox, GoabBadge, GoabCallout, GoabModal, GoabDrawer, GoabContainer, GoabText, GoabProgressIndicator, GoabTemporaryNotification, GoabFilterChip, GoabTooltip, GoabTableSortHeader, GoabPagination } = NS();
  const CLKPIs = window.CLKPIsFalse;
  const R = ROLES[role] || ROLES["hq-qa"];
  ROLE_STAGE = R.stage;
  HOLD_ROUTE = R.holdRouteLabel || null;
  const SAMP = SAMPLING[R.stage] || SAMPLING.qa;
  const [claims0, setClaims] = React.useState(genClaims);
  /* showReviewFeatures tweak — off strips the 004 S1/S2 claim data (revFlags, reviewReq) so every
     derived surface (tally rows, callout, badges, queue filter/count, comment seed) vanishes
     together; the entry buttons are gated on the same switch where they render. */
  const claims = React.useMemo(() => SHOW_REVIEW_UI ? claims0 : claims0.map((c) => (c.revFlags || c.reviewReq) ? { ...c, revFlags: undefined, reviewReq: undefined } : c), [claims0, showReviewFeatures]);
  const [selected, setSelected] = React.useState(() => new Set());
  const [expanded, setExpanded] = React.useState(() => new Set());
  const [wfId, setWfId] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [sheet, setSheet] = React.useState(null); // null | "q" | "pa"
  const QF0 = { statusSel: [], fundSel: [], ctypeSel: [], recvFrom: "", recvTo: "", amtMin: "", amtMax: "" };
  const PA0 = { pid: "", period: "All", status: "All", feat: "All", txn: "All", created: "All", rulesSel: RULES };
  const [qf, setQf] = React.useState(QF0);
  const [pa, setPa] = React.useState(PA0);
  const snap = React.useRef(null);
  const [showAll, setShowAll] = React.useState({});
  /* Queue column sorting — user 2026-08-13 ("have sorting in other queue tabs tables in appropriate
     columns"): the four identifier/measure columns sort; period/type/flags/status stay unsorted
     (low-cardinality labels). One state serves overview + QA queue — same columns, one visible
     table at a time. Band mode sorts WITHIN each band (banding is the primary order); overview
     sort replaces stageSpread; figma tab stays as-is (frame-faithful recreation, G9). */
  const [qSort, setQSort] = React.useState({ k: null, dir: 1 });
  /* Per-list revealed row count for infinite scroll. Separate from showAll, which bandRows still
     uses for its explicit "Show N more" inside a band. */
  const [rowsShown, setRowsShown] = React.useState({});
  const [normOpen, setNormOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [lookup, setLookup] = React.useState(false);
  /* 004 S2 — "Review requests" queue filter (form 2026-08-19, A4: badge + filter, no new tab). */
  const [reqOnly, setReqOnly] = React.useState(false);
  const queueRef = React.useRef(null);
  /* cc-1 (user 2026-08-25): the Pattern analyzer entry belongs in the WORKSPACE HEADER's action
     section, not the queue toolbar. The opener's state (sheet, pa, paCount) lives here while the
     header is rendered by ClaimsShell above us, so the button is portalled into the slot the shell
     always renders ([data-wl-actions]) rather than lifting the analyzer's filter state up. */
  const paInHeader = paPlacement === "header" || paPlacement === "toolbar";
  const [hdrSlot, setHdrSlot] = React.useState(null);
  const [recheck, setRecheck] = React.useState({});
  const [feedback, setFeedback] = React.useState({});
  const [annot, setAnnot] = React.useState({});
  const [modal, setModal] = React.useState(false);
  const [released, setReleased] = React.useState(false);
  const [goTab, setGoTab] = React.useState({ i: 1, k: 0 }); // 1 = Claims overview — the landing tab
  /* The toolbar rides the tab strip now, so the ACTIVE tab has to be known out here — GoabTabs
     keeps it internally and only reports it through onChange. */
  const [activeTab, setActiveTab] = React.useState(1);
  React.useEffect(() => { setActiveTab(goTab.i); }, [goTab.k, goTab.i, role]);
  /* The cluster is painted over the strip row, so it reserves no width of its own while
     .goab-tabs--segmented .goab-tabs__list is width:fit-content and grows freely underneath it.
     Roles with more tabs (FDH EO, Program lead, QA once a release is signed) overran it and the
     rightmost pills went under the cluster, unclickable. Cap the list against the measured cluster
     width instead — the pills scroll within the pill bar rather than disappear. */
  const stripRef = React.useRef(null);
  const barRef = React.useRef(null);
  React.useEffect(() => {
    const root = stripRef.current, bar = barRef.current;
    if (!root || !bar || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      const list = root.querySelector(".goab-tabs__list");
      if (!list) return;
      const avail = Math.max(160, root.clientWidth - bar.offsetWidth - 16);
      const next = avail + "px";
      /* Compact GoA controls are 40px, the segmented pill bar is 38px. The cluster sets the row
         height; nudge the pills 1px so both centre on the same line instead of the controls
         hanging proud of the row and being clipped. */
      list.style.marginTop = "1px";
      if (list.style.maxWidth === next) return;
      list.style.maxWidth = next;
      list.style.overflowX = "auto";
      list.style.overflowY = "hidden";
      list.style.scrollbarWidth = "none";
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(root); ro.observe(bar);
    return () => ro.disconnect();
  });
  const [focusIdx, setFocusIdx] = React.useState(null);
  const [sign, setSign] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(null);
  const [exportNote, setExportNote] = React.useState(null);
  const [clearConfirm, setClearConfirm] = React.useState(null);
  const [pageSize, setPageSize] = React.useState(10);
  /* CCFOPS-445 / 476 — the watchlist is a PROVIDER register, not a claim status: one entry per
     provider, carrying a reason per watching role. Seeded from the providers already watched. */
  const [watchEntries, setWatchEntries] = React.useState(() => seedWatch(genClaims()));
  const [watchModal, setWatchModal] = React.useState(null); // { provider, entry } | null
  const [watchSort, setWatchSort] = React.useState({ k: "name", dir: 1 });
  const watchApi = {
    entries: watchEntries,
    role: watchRoleFor(R),
    find: (pid) => watchEntries.filter((e) => e.pid === pid)[0] || null,
    save: (provider, roles) => {
      setWatchEntries((es) => {
        const rest = es.filter((e) => e.pid !== provider.pid);
        const keys = Object.keys(roles);
        return keys.length ? rest.concat({ pid: provider.pid, name: provider.name, addr: provider.addr, roles, at: "Aug 4, 2026", by: signer }) : rest;
      });
      /* Keep the queue badge in step with the register — one source of truth for "is this watched". */
      const on = Object.keys(roles).length > 0;
      setClaims((cs) => cs.map((c) => c.pid === provider.pid ? { ...c, watch: on, status: on && c.status === "open" ? "watchlist" : (!on && c.status === "watchlist" ? "open" : c.status) } : c));
    },
    /* Set or clear ONE role's reason on a provider, leaving every other role's entry untouched.
       The whole-record `remove` stays for the Watchlist tab's explicit Remove action. */
    setRole: (provider, reason) => {
      const cur = watchEntries.filter((e) => e.pid === provider.pid)[0];
      const roles = Object.assign({}, cur && cur.roles);
      if (reason == null) delete roles[watchApi.role]; else roles[watchApi.role] = reason;
      watchApi.save(provider, roles);
    },
    remove: (pid) => { setWatchEntries((es) => es.filter((e) => e.pid !== pid)); setClaims((cs) => cs.map((c) => c.pid === pid ? { ...c, watch: false, status: c.status === "watchlist" ? "open" : c.status } : c)); },
  };
  /* Board 7: every stage ends "digitally sign the release report and save it for record-keeping".
     Two prior periods are seeded so the record-keeping trail isn't empty on first load. */
  /* A release report is identified by the day it was signed, so its id and its date are ONE fact:
     rrId derives the id from the date and the generator below uses the same helper. The trail sits
     on the real Tuesday/Friday payment cadence (PAY_RUNS) in the fortnight before today, so the
     record-keeping history reads as a cycle that just ran rather than one that stopped in spring. */
  const [reports, setReports] = React.useState(() => []);

  const act = {
    watch: watchApi,
    toggleSel: (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }),
    toggleExpand: () => {},
    /* A hold at a stage with holdRoute set doesn't sit in that stage's Hold tab — board 7 has the
       Funding EO "hold the payments & request QA to follow up", i.e. the claim goes BACK to QA. */
    setStatus: (ids, status) => setClaims((cs) => cs.map((c) => {
      if (!ids.includes(c.id)) return c;
      /* Over-threshold claims can only leave this stage through a supervisor, so bulk
         "mark reviewed" / "bulk clear" must not sign them off. */
      if ((status === "reviewed" || status === "cleared") && needsSup(c)) return c;
      if (status === "hold" && R.holdRoute && c.stage === R.stage) return { ...c, status, heldBy: signer, stage: R.holdRoute, returned: R.stageLabel };
      if (status === "hold") return { ...c, status, heldBy: signer };
      if (status === "open" && c.returned && c.status === "hold") { const n = { ...c, status, heldBy: null }; delete n.returned; return n; }
      if (status === "open" && c.status === "hold") return { ...c, status, heldBy: null };
      return { ...c, status };
    })),
    recheck: (id, m) => setRecheck((r) => ({ ...r, [id]: r[id] === m ? undefined : m })),
    /* R1 — the Analyzer is AltaML's and read-only today: reviewers cannot attach notes, flags or
       review criteria to its output (§17.1). Annotations are keyed claim+feature and persist. */
    annotate: (id, feat, patch) => setAnnot((a) => {
      const k = id + "::" + feat;
      const cur = a[k] || { note: "", flag: false, criteria: false };
      return { ...a, [k]: { ...cur, ...patch } };
    }),
    feedback: (id, v) => setFeedback((r) => ({ ...r, [id]: r[id] === v ? undefined : v })),
    /* 004 S1/S2 — both live on the CLAIM record so they survive stage moves and role switches; a
       request never touches status or stage (§19.2 "it shouldn't hold up the claim"). */
    raiseFlag: (id, f) => setClaims((cs) => cs.map((x) => x.id === id ? { ...x, revFlags: (x.revFlags || []).concat(f) } : x)),
    setReviewReq: (id, req) => setClaims((cs) => cs.map((x) => x.id === id ? { ...x, reviewReq: req } : x)),
    answerReviewReq: (id) => setClaims((cs) => cs.map((x) => x.id === id && x.reviewReq ? { ...x, reviewReq: { ...x.reviewReq, answered: true } } : x)),
    openWorkflow: (id) => setWfId(id),
    /* Δ5 row-expand evidence — the disclosure the queue opens inline. */
    toggleX: (id) => setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }),
  };
  const num = (s) => { const m = String(s).match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; };
  const fMatch = (c) => {
    if (reqOnly && SHOW_REVIEW_UI && !(c.reviewReq && !c.reviewReq.answered && c.reviewReq.targets.indexOf(R.stage) >= 0)) return false;
    /* Searchable identifiers: program name, program ID, claim ID and the payment reference — the
       numbers a reviewer is actually handed (user instruction 2026-08-11). Payment ref is derived by
       payIdOf, so it was invisible to a search over the claim's own fields. */
    if (search) {
      const q = search.trim().toLowerCase();
      const hay = [c.name, c.pid, c.clm, payIdOf(c)].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (pa.pid && !c.pid.includes(pa.pid)) return false;
    if (pa.period !== "All" && c.period !== pa.period) return false;
    if (pa.status === "Unreviewed" && c.status !== "open") return false;
    if (pa.status === "Reviewed" && !(c.status === "reviewed" || c.status === "cleared")) return false;
    if (pa.feat !== "All" && c.feat !== pa.feat) return false;
    if (pa.txn !== "All" && c.txn !== pa.txn) return false;
    if (pa.rulesSel.length > 0 && pa.rulesSel.length < RULES.length && !c.rules.some((r) => pa.rulesSel.includes(r))) return false;
    if (qf.statusSel.length) {
      const ok = qf.statusSel.some((s) => s === "Ready for release" ? (c.status === "reviewed" || c.status === "cleared") : s === "Review" ? c.status === "open" : c.status === "hold");
      if (!ok) return false;
    }
    if (qf.fundSel.length && !qf.fundSel.includes(c.pay)) return false;
    if (qf.ctypeSel.length && !qf.ctypeSel.includes(c.ctype)) return false;
    const from = num(qf.recvFrom); if (from != null && c.day < from) return false;
    const to = num(qf.recvTo); if (to != null && c.day > to) return false;
    const mn = num(qf.amtMin); if (mn != null && c.amtN < mn) return false;
    const mx = num(qf.amtMax); if (mx != null && c.amtN > mx) return false;
    return true;
  };
  const qCount = (qf.statusSel.length ? 1 : 0) + (qf.fundSel.length ? 1 : 0) + (qf.ctypeSel.length ? 1 : 0) + (qf.recvFrom || qf.recvTo ? 1 : 0) + (qf.amtMin || qf.amtMax ? 1 : 0);
  const paCount = (pa.pid ? 1 : 0) + (pa.period !== "All") + (pa.status !== "All") + (pa.feat !== "All") + (pa.txn !== "All") + (pa.created !== "All") + (pa.rulesSel.length > 0 && pa.rulesSel.length < RULES.length ? 1 : 0);
  /* CCFOPS-467 — every applied constraint becomes a removable chip beside the table. Built from the
     same two filter objects the drawers write, so a chip can never drift from the actual filter. */
  const chips = [];
  if (reqOnly && SHOW_REVIEW_UI) chips.push({ k: "reqonly", label: "Review requests", clear: () => setReqOnly(false) });
  if (search) chips.push({ k: "search", label: "Search: " + search, clear: () => setSearch("") });
  qf.statusSel.forEach((s) => chips.push({ k: "st:" + s, label: "Status: " + s, clear: () => setQf((p) => ({ ...p, statusSel: p.statusSel.filter((x) => x !== s) })) }));
  qf.ctypeSel.forEach((s) => chips.push({ k: "ct:" + s, label: "Claim type: " + s, clear: () => setQf((p) => ({ ...p, ctypeSel: p.ctypeSel.filter((x) => x !== s) })) }));
  qf.fundSel.forEach((s) => chips.push({ k: "fd:" + s, label: "Funding: " + s, clear: () => setQf((p) => ({ ...p, fundSel: p.fundSel.filter((x) => x !== s) })) }));
  if (qf.recvFrom || qf.recvTo) chips.push({ k: "recv", label: "Received: " + (qf.recvFrom || "any") + " \u2013 " + (qf.recvTo || "any"), clear: () => setQf((p) => ({ ...p, recvFrom: "", recvTo: "" })) });
  if (qf.amtMin || qf.amtMax) chips.push({ k: "amt", label: "Amount: " + (qf.amtMin || "any") + " \u2013 " + (qf.amtMax || "any"), clear: () => setQf((p) => ({ ...p, amtMin: "", amtMax: "" })) });
  if (pa.pid) chips.push({ k: "pa-pid", label: "Program ID: " + pa.pid, clear: () => setPa((p) => ({ ...p, pid: "" })) });
  [["period", "Claim period"], ["status", "Review status"], ["feat", "Top model feature"], ["txn", "Transaction status"], ["created", "Created"]].forEach(([k2, lbl2]) => {
    if (pa[k2] !== "All") chips.push({ k: "pa-" + k2, label: lbl2 + ": " + pa[k2], clear: () => setPa((p) => ({ ...p, [k2]: "All" })) });
  });
  if (pa.rulesSel.length > 0 && pa.rulesSel.length < RULES.length) chips.push({ k: "pa-rules", label: "Flags: " + pa.rulesSel.length + " of " + RULES.length, clear: () => setPa((p) => ({ ...p, rulesSel: RULES })) });
  const clearAllFilters = () => { setSearch(""); setQf(QF0); setPa(PA0); };
  const stageList = (st) => claims.filter((c) => c.stage === st && fMatch(c));
  const qaQ = stageList("qa").filter((c) => c.status !== "hold");
  const myStageQ = stageList(R.stage).filter((c) => c.status !== "hold");
  const myQ = R.stage === "qa" ? qaQ : myStageQ;
  /* The Claims overview spans EVERY stage, not just this role's. Required by the Review status column
     moved into it (user instruction 2026-08-11): myQ is stage-scoped, so a stage track over it read
     identically on every row — exactly the "mostly restates the tab heading" failure StageTrack's own
     comment warns about. The role's operational counts above the table still read myQ. */
  const allQ = claims.filter((c) => fMatch(c));
  /* §19.2 — "it will automatically go into the Subsidy queue for review": an open request VISITS
     every target stage's queue without leaving its own stage — visibility, not routing. Release
     batches filter on c.stage, so a visiting row can never be released by the visited stage. */
  const reqFor = (c) => c.reviewReq && !c.reviewReq.answered && c.reviewReq.targets.indexOf(R.stage) >= 0;
  const reqIncoming = claims.filter((c) => c.stage !== R.stage && c.status !== "hold" && reqFor(c) && fMatch(c));
  const reqCount = claims.filter(reqFor).length;
  const flagged = myQ.filter((c) => c.viol > 0 || (c.risk != null && c.risk >= 70));
  const exceptions = [...flagged].sort((a, b2) => (b2.viol - a.viol) || ((b2.risk || 0) - (a.risk || 0)));
  const focusNext = () => setFocusIdx((i) => (i != null && i + 1 < exceptions.length ? i + 1 : null));
  const focusDo = (status) => { const c = exceptions[focusIdx]; if (c) act.setStatus([c.id], status); focusNext(); };
  React.useEffect(() => {
    if (focusIdx == null) return undefined;
    const h = (e) => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "Escape") setFocusIdx(null);
      else if (e.key === "r" || e.key === "R") focusDo("reviewed");
      else if (e.key === "h" || e.key === "H") focusDo("hold");
      else if (e.key === "w" || e.key === "W") focusDo("watchlist");
      else if (e.key === "ArrowRight") focusNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  const holdList = claims.filter((c) => c.stage === R.stage && c.status === "hold" && fMatch(c));
  /* Over-threshold claims this stage cannot sign off itself, plus the ones already referred. */
  const supList = claims.filter((c) => c.stage === R.stage && (needsSup(c) || c.status === "supervisor") && fMatch(c));
  const returnedList = claims.filter((c) => c.stage === R.stage && c.returned && fMatch(c));
  const myReports = reports.filter((r) => r.stage === R.stage);
  const watchList = claims.filter((c) => (c.status === "watchlist" || c.watch) && fMatch(c));
  const releasedList = claims.filter((c) => c.stage === "released" && fMatch(c));
  const downstream = claims.filter((c) => c.stage !== "qa" && fMatch(c));
  const myStage = claims.filter((c) => c.stage === R.stage);
  const reviewedN = myStage.filter((c) => c.status === "reviewed" || c.status === "cleared").length;
  const relTotal = fmtSum(myStage.filter((c) => c.status === "reviewed" || c.status === "cleared"));
  const supCount = myStage.filter((c) => needsSup(c) && c.status !== "reviewed" && c.status !== "cleared").length;
  const heldCount = myStage.filter((c) => c.status === "hold").length; // unfiltered — a search must not change a release total
  const mainTabPrefix = R.release1GX ? "Ready to release" : R.stage === "qa" ? "QA queue" : R.stageLabel + " queue";
  const releaseNode = (
    /* Width is reserved for the widest count so Export never shifts as claims are reviewed. */
    <span style={{ display: "grid", minWidth: 212, flexShrink: 0 }}>
      <GoabButton type="primary" size="compact" leadingIcon={R.release1GX ? "card-outline" : "paper-plane"} disabled={reviewedN === 0} onClick={() => setModal(true)}>{R.release1GX ? "Release " + reviewedN + " to 1GX" : "Release " + reviewedN + " reviewed"}</GoabButton>
    </span>
  );

  const roleCols = vehicleCols(R);
  const Q_SORT_FIELDS = { recv: (c) => c.day, name: (c) => c.clm, pid: (c) => c.pid, amt: (c) => c.amtN };
  const qSorted = (rows) => {
    if (!qSort.k || !Q_SORT_FIELDS[qSort.k]) return null;
    const f = Q_SORT_FIELDS[qSort.k];
    return [...rows].sort((a, b2) => { const va = f(a), vb = f(b2); return ((va < vb ? -1 : va > vb ? 1 : 0) * qSort.dir) || (a.id - b2.id); });
  };
  const qth = (label, k) => GoabTableSortHeader
    ? <GoabTableSortHeader name={k} direction={qSort.k === k ? (qSort.dir === 1 ? "asc" : "desc") : "none"} onClick={() => setQSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 }))}>{label}</GoabTableSortHeader>
    : label;
  const headersFor = (list, ex) => {
    const allSel = list.length > 0 && list.every((c) => selected.has(c.id));
    const hs = [
      ["sel", { label: <GoabCheckbox size="compact" name="all" checked={allSel} onChange={() => setSelected((s) => { const n = new Set(s); if (allSel) list.forEach((c) => n.delete(c.id)); else list.forEach((c) => n.add(c.id)); return n; })} ariaLabel="Select all" /> }],
      ["recv", { label: qth("Received", "recv") }], ["name", { label: qth("Program name", "name") }], ["pid", { label: qth("Program ID", "pid") }], ["per", "Claim period"], ["payref", "Payment ref #"], ["ctype", "Type"], ["flags", "Flag(s)"], ["stat", "Review status"],
      ["amt", { label: qth("Amount", "amt"), numeric: true }],
      ["act", "Actions"],
    ];
    (ex || []).forEach((k) => { const m = COLUMNS[k]; if (!m) return; const at = hs.findIndex((x) => x[0] === m.after); hs.splice(at + 1, 0, [k, m.label]); });
    return hs.map((x) => x[1]);
  };
  const headersFig = ["", "Received", "Program name", "Program ID", "Claim period", "Payment ref #", "Type", "Flag(s)", { label: "Amount", numeric: true }, "Actions"];
  const headersAll = [{ label: qth("Received", "recv") }, { label: qth("Program name", "name") }, { label: qth("Program ID", "pid") }, "Claim period", "Payment ref #", "Claim type", "Review status", { label: qth("Amount", "amt"), numeric: true }, "Actions"];
  /* 11 base columns: sel · recv · name · pid · per · payref · ctype · flags · stat · amt · act.
     colSpan reads this, so it has to track the header list exactly — an empty state or an expanded
     row spans the whole width. */
  const COLS = 11;
  const nCols = (ex) => COLS + ((ex && ex.length) || 0);
  const bandRows = (list, b, ex) => {
    const cols = nCols(ex);
    const rows0 = list.filter((c) => bandOf(c) === b.key && c.status !== "cleared");
    const rows = qSorted(rows0) || rows0;
    if (!rows.length) return null;
    const cap = showAll[b.key] ? rows.length : PAGE;
    const shown = b.key === "norm" && !normOpen ? [] : rows.slice(0, cap);
    const acts = b.key === "norm" && R.bulkClear ? (
      <span style={{ display: "inline-flex", gap: 6 }}>
        <GoabButton type="tertiary" size="compact" onClick={() => setNormOpen((o) => !o)}>{normOpen ? "Hide list" : "Review list"}</GoabButton>
        <GoabButton type="primary" size="compact" leadingIcon="checkmark-done" onClick={() => {
          const ids = rows.map((c) => c.id);
          const prev = claims.filter((c) => ids.includes(c.id)).map((c) => [c.id, c.status]);
          act.setStatus(ids, "cleared"); setToast({ n: ids.length, prev });
        }}>Release {rows.length}</GoabButton>
      </span>
    ) : null;
    return (
      <React.Fragment key={b.key}>
        <tr><td colSpan={cols} style={{ background: b.bg, padding: "6px 12px", borderTop: "1px solid var(--goa-color-greyscale-200)", borderBottom: "1px solid var(--goa-color-greyscale-200)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Ico name={b.icon} size={17} color={b.color} />
            <b style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{b.title}</b>
            {b.key === "viol" ? <D n={1} /> : null}{b.key === "norm" ? <D n={4} /> : null}
            <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{b.sub}</span>
            <span style={{ flex: 1 }}></span>
            <span style={{ font: "var(--goa-typography-body-xs)", fontFamily: MONO, fontWeight: 700, color: b.color, whiteSpace: "nowrap" }}>{rows.length} claims</span>
            {acts}
          </span>
        </td></tr>
        {shown.map((c) => <Row key={c.id} c={c} st={{ selected, expanded, recheck, feedback, annot }} act={act} cols={cols} extra={ex} noX={evidenceMode === "split"} />)}
        {shown.length && rows.length > shown.length ? (
          <tr><td colSpan={cols} style={{ padding: "5px 12px" }}>
            <GoabButton type="tertiary" size="compact" onClick={() => setShowAll((s) => ({ ...s, [b.key]: !s[b.key] }))}>Show {rows.length - shown.length} more</GoabButton>
          </td></tr>
        ) : null}
      </React.Fragment>
    );
  };
  /* The overview spans every stage, but sorted by date the first page could be all one stage — the
     column then shows one state repeated and proves nothing (user instruction 2026-08-11: show all
     the different stage types from the first row). Round-robin across the stages in TRACK order, each
     group still date-ordered inside, so row 1..n walk through the distinct stages before repeating. */
  const stageSpread = (rows) => {
    const by = {};
    [...rows].sort((a, b2) => a.day - b2.day || a.id - b2.id).forEach((c) => { (by[c.stage] = by[c.stage] || []).push(c); });
    const keys = TRACK_ORDER.filter((k) => by[k]).concat(Object.keys(by).filter((k) => TRACK_ORDER.indexOf(k) < 0));
    const out = [];
    for (let i = 0; out.length < rows.length; i++) {
      let moved = false;
      for (const k of keys) if (by[k][i]) { out.push(by[k][i]); moved = true; }
      if (!moved) break;
    }
    return out;
  };
  /* Cap long lists on first paint. The Claims overview tab is the default tab and rendered EVERY
     claim in the stage (~100 rows of badges + icons), which pushed first paint into the tens of
     seconds and left the board unresponsive. The cap now grows by a page as the reader scrolls
     (MoreSentinel) instead of offering a "Show all" footer. */
  const LIST_CAP = pageSize;
  const growTo = (key, cap, len) => setRowsShown((s) => ({ ...s, [key]: Math.min(len, (s[key] || cap) + cap) }));
  const capRows = (arr, key, cols, make) => {
    const show = arr.slice(0, rowsShown[key] || LIST_CAP);
    const out = show.map(make);
    if (arr.length > show.length) out.push(
      <MoreSentinel key="__more" cols={cols} onMore={() => growTo(key, LIST_CAP, arr.length)} />
    );
    return out;
  };
  const flatRows = (list, ro, ex) => {
    const sorted = qSorted(list) || [...list].sort((a, b2) => (b2.viol - a.viol) || ((b2.risk || 0) - (a.risk || 0)));
    const show = sorted.slice(0, rowsShown.flat || pageSize);
    const out = show.map((c) => <Row key={c.id} c={c} st={{ selected, expanded, recheck, feedback, annot }} act={act} cols={nCols(ex)} extra={ex} ro={ro} noX={evidenceMode === "split" && !ro} />);
    if (sorted.length > show.length) out.push(
      <MoreSentinel key="__more" cols={nCols(ex)} onMore={() => growTo("flat", pageSize, sorted.length)} />
    );
    return out;
  };

  /* ---------- side sheets ---------- */
  const openSheet = (which) => { snap.current = { qf: JSON.parse(JSON.stringify(qf)), pa: JSON.parse(JSON.stringify(pa)) }; setSheet(which); };
  const cancelSheet = () => { if (snap.current) { setQf(snap.current.qf); setPa(snap.current.pa); } setSheet(null); };
  const lbl = (t) => <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{t}</span>;
  const secDiv = <div style={{ borderTop: "1px solid var(--goa-color-greyscale-200)", margin: "2px 0" }}></div>;
  const ckList = (items, sel, setSel) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map(([label, v]) => (
        <GoabCheckbox size="compact" key={v} name={"ck-" + v} checked={sel.includes(v)} onChange={() => setSel(sel.includes(v) ? sel.filter((x) => x !== v) : sel.concat(v))} text={label} />
      ))}
    </div>
  );
  const matchCount = myQ.length;
  const sheetFooter = (onClear) => (
    <span style={{ display: "flex", gap: 10, alignItems: "center", width: "100%" }}>
      <GoabButton type="tertiary" size="compact" onClick={onClear}>Clear all filters</GoabButton>
      <span style={{ flex: 1 }}></span>
      <GoabButton type="secondary" size="compact" onClick={cancelSheet}>Cancel</GoabButton>
      <GoabButton type="primary" size="compact" onClick={() => setSheet(null)}>Apply filters</GoabButton>
    </span>
  );
  const filterSheet = sheet !== "q" ? null : (
    <GoabDrawer open heading="Filters" position="right" maxSize="440px" onClose={cancelSheet} actions={sheetFooter(() => setQf(QF0))}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lbl("Status")}
          {ckList([["Ready for release", "Ready for release"], ["Review", "Review"], ["Hold", "Hold"]], qf.statusSel, (v) => setQf((p) => ({ ...p, statusSel: v })))}
        </div>
        {secDiv}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lbl("Claim type")}
          {ckList([["Claim", "Claim"], ["Adjustment", "Adjustment"]], qf.ctypeSel, (v) => setQf((p) => ({ ...p, ctypeSel: v })))}
        </div>
        {secDiv}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lbl("Funding type")}
          <GoabCheckbox size="compact" name="fund-all" checked={qf.fundSel.length === 0} onChange={() => setQf((p) => ({ ...p, fundSel: [] }))} text="Select all" />
          {ckList(FUND, qf.fundSel, (v) => setQf((p) => ({ ...p, fundSel: v })))}
        </div>
        {secDiv}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lbl("Received date range")}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GoabInput name="recv-from" size="compact" value={qf.recvFrom} onChange={(...a) => setQf((p) => ({ ...p, recvFrom: val(...a) }))} placeholder="Jul 15" trailingIcon="calendar" width="150px" />
            <span style={{ font: "var(--goa-typography-body-s)" }}>to</span>
            <GoabInput name="recv-to" size="compact" value={qf.recvTo} onChange={(...a) => setQf((p) => ({ ...p, recvTo: val(...a) }))} placeholder="Jul 23" trailingIcon="calendar" width="150px" />
          </div>
        </div>
        {secDiv}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lbl("Amount range")}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <GoabInput name="amt-min" size="compact" value={qf.amtMin} onChange={(...a) => setQf((p) => ({ ...p, amtMin: val(...a) }))} placeholder="$ 0" width="150px" />
            <span style={{ font: "var(--goa-typography-body-s)" }}>to</span>
            <GoabInput name="amt-max" size="compact" value={qf.amtMax} onChange={(...a) => setQf((p) => ({ ...p, amtMax: val(...a) }))} placeholder="$ 20,000" width="150px" />
          </div>
        </div>
      </div>
    </GoabDrawer>
  );
  const paDD = (label, k, items, extra, w) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{label}</span>
      {extra || <GoabDropdown name={k} size="compact" items={items} value={pa[k]} width={w || "100%"} ariaLabel={label} onChange={(...a) => { const v = val(...a); if (v) setPa((p) => ({ ...p, [k]: v })); }} />}
    </div>
  );
  /* Δ3 — the analyzer's OWN side sheet, carrying the AltaML tool's exact filter set: Program ID ·
     Claim Period · Review Status · Top Model Feature · Transaction Status · Rule Violations
     (11-rule multi-select) · Claim Creation Date. Separate from the queue's Filter sheet so the
     standalone analyzer dashboard retires into this queue ("I just want stuff in one place").
     Period and feature options are DERIVED from the claims/FEATS, so a new period or model feature
     needs no change here (G3). Claim creation date is display-only — the seed carries no creation
     timestamp, so it filters nothing; it is kept because the tool's filter set includes it. */
  const paSheet = sheet !== "pa" ? null : (
    <GoabDrawer open heading="Pattern analyzer" position="right" maxSize="440px" onClose={cancelSheet} actions={sheetFooter(() => setPa(PA0))}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 8 }}>
        <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Model run {(claims[0] || {}).period === "202606" ? "Jul 30, 2026 · 7:19 a.m." : "latest"} — read-only output from the analyzer.</span>
        {paDD("Program ID", "pid", null, <GoabInput name="pa-pid" size="compact" value={pa.pid} onChange={(...a) => setPa((p) => ({ ...p, pid: val(...a) }))} placeholder="80010000" leadingIcon="search-outline" width="100%" />)}
        {secDiv}
        {paDD("Claim period", "period", ["All"].concat(Array.from(new Set(claims.map((c) => c.period)))))}
        {paDD("Review status", "status", ["All", "Unreviewed", "Reviewed"])}
        {secDiv}
        {paDD("Top model feature", "feat", ["All"].concat(FEATS))}
        {paDD("Transaction status", "txn", ["All", TXN])}
        {secDiv}
        {paDD("Rule violations", "rulesSel", null, GoabDropdownMultiselect
          ? <GoabDropdownMultiselect name="pa-rules" size="compact" width="100%" filterable showSelectAll labelFormat="count" ariaLabel="Rule violations"
              placeholder={"All " + RULES.length + " rules"} items={RULES} value={pa.rulesSel}
              onChange={(e) => setPa((p) => ({ ...p, rulesSel: (e && e.value) || [] }))} />
          : ckList(RULES.map((r) => [r, r]), pa.rulesSel, (v) => setPa((p) => ({ ...p, rulesSel: v }))))}
        {secDiv}
        {paDD("Claim creation date", "created", ["All", "Last 7 days", "Last 30 days", "This claim period"])}
      </div>
    </GoabDrawer>
  );

  /* The queue toolbar rides the tab strip (right-aligned beside the segmented pills) instead of
     sitting in a tinted band above the table, so it is built out here once and rendered for
     whichever tab is active. Release is NOT here — it lives on the selection row in the card. */
  const queueBar = ({ focusEntry, analyzer } = {}) => (
    <React.Fragment>
      {/* User instruction 2026-08-12: the long placeholder clipped at 260px — placeholder is just
         "Search"; the what-can-I-search-by hint moved to a tooltip whose trigger sits 8px left of
         the input (own inline-flex so the parent toolbar's gap doesn't decide the distance; gap 4
         because goa-tooltip's own target margin — --goa-tooltip-gap, 4px — carries the other half). */}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {GoabTooltip
          ? <GoabTooltip content="Search by Program ID, payment ref, or name" position="top" maxWidth="260px"><span style={{ display: "inline-flex" }}><Ico name="information-circle-outline" size={18} color="var(--goa-color-text-secondary)" /></span></GoabTooltip>
          : <span title="Search by Program ID, payment ref, or name" style={{ display: "inline-flex" }}><Ico name="information-circle-outline" size={18} color="var(--goa-color-text-secondary)" /></span>}
        <GoabInput name="find" size="compact" value={search} onChange={(...a) => setSearch(val(...a))} placeholder="Search" leadingIcon="search-outline" width="260px" />
      </span>
      <GoabButton type="tertiary" size="compact" leadingIcon="filter-outline" onClick={() => openSheet("q")}>Filter{qCount ? " (" + qCount + ")" : ""}</GoabButton>
      {/* Δ3 — in "tab" placement the analyzer's sheet opens from that tab's own bar. In header
         placement the button is portalled into the workspace header instead (cc-1). */}
      {analyzer ? <GoabButton type="tertiary" size="compact" leadingIcon="sparkles-outline" onClick={() => openSheet("pa")}>Pattern analyzer{paCount ? " (" + paCount + ")" : ""}</GoabButton> : null}
      {reqCount ? <GoabButton type="tertiary" size="compact" leadingIcon="swap-horizontal-outline" onClick={() => setReqOnly((v) => !v)}>Review requests</GoabButton> : null}
      {focusEntry && exceptions.length ? <GoabButton type="tertiary" size="compact" onClick={() => setFocusIdx(0)}>Focus mode ({exceptions.length})</GoabButton> : null}
      <D n={8} />
      <ExportMenu onPick={(fmt) => setExportNote(mainTabPrefix + " exported as " + fmt)} />
    </React.Fragment>
  );

  const Queue = ({ list, bands, ro, emptyMsg, figma, overview, focusEntry, releaseBtn, sampling, extra }) => {
    /* Bulk CTA on-state, read the SAME way the row's own CTAs read it (see iWatch / ctaNode) so a
       claim already marked reviewed shows the activated chip when it is selected again.
       ALL selected must be on — "any" would render "Reviewed" over a selection that mostly isn't. */
    const selClaims = [...selected].map((id) => claims.filter((x) => x.id === id)[0]).filter(Boolean);
    const everySel = (fn) => selClaims.length > 0 && selClaims.every(fn);
    const bulkOn = {
      watch: everySel((c) => (watchApi ? !!(((watchApi.find(c.pid) || {}).roles || {})[watchApi.role]) : (c.status === "watchlist" || !!c.watch))),
      hold: everySel((c) => c.status === "hold"),
      reviewed: everySel((c) => c.status === "reviewed" || c.status === "cleared"),
    };
    const ex = extra || roleCols;
    const selectable = !ro && !overview && !figma;
    const split = evidenceMode === "split" && !figma && !overview && !ro;
    const bd = {
      viol: list.filter((c) => c.viol > 0).length,
      high: list.filter((c) => !c.viol && c.risk >= 70).length,
      mod: list.filter((c) => !c.viol && c.risk >= 1 && c.risk < 70).length,
      norm: list.filter((c) => !c.viol && c.risk === 0).length,
      wait: list.filter((c) => c.risk === null).length,
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-s)", paddingTop: "var(--goa-space-s)" }}>
        {/* CCFOPS-467 — an applied filter is visible and removable at the table, not only inside
           the drawer that set it. One chip per active constraint; ⊗ clears just that one. */}
        {chips.length ? (
          <div style={{ background: "var(--goa-color-greyscale-white)", borderRadius: "var(--goa-container-border-radius)", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Applied filters</span>
            {chips.map((ch) => <GoabFilterChip key={ch.k} content={ch.label} onClick={ch.clear} />)}
            <GoabLinkButton size="compact" onClick={clearAllFilters}>Clear all</GoabLinkButton>
          </div>
        ) : null}
        {/* Release lives on this row, not the tab strip, and only once there is something to
           release — it read "Release 0 reviewed" on every queue before. The row also carries the
           bulk actions, so it appears for a selection OR a releasable batch. */}
        {(selected.size || (releaseBtn && reviewedN > 0)) && selectable ? (
          <div style={{ background: "var(--goa-color-info-background)", border: "var(--goa-container-border)", borderRadius: "var(--goa-container-border-radius)", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {selected.size ? <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>{selected.size} selected</span> : null}
            {selected.size ? <D n={4} /> : null}
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {releaseBtn && reviewedN > 0 ? releaseBtn : null}
              {selected.size ? (
                <React.Fragment>
                  <ClaimCTAs
                    watch={bulkOn.watch} hold={bulkOn.hold} reviewed={bulkOn.reviewed}
                    onWatch={() => { [...selected].forEach((id) => { const c = claims.filter((x) => x.id === id)[0]; if (c) watchApi.setRole({ pid: c.pid, name: c.name, addr: c.addr }, bulkOn.watch ? null : "Added in bulk from the " + R.stageLabel + " queue — re-check next period."); }); setSelected(new Set()); }}
                    onHold={() => { act.setStatus([...selected], bulkOn.hold ? "open" : "hold"); setSelected(new Set()); }}
                    onReviewed={() => act.setStatus([...selected], bulkOn.reviewed ? "open" : "reviewed")} />
                  <GoabLinkButton size="compact" onClick={() => setSelected(new Set())}>Clear</GoabLinkButton>
                </React.Fragment>
              ) : null}
            </span>
          </div>
        ) : null}
        <div style={{ background: "var(--goa-color-greyscale-white)", borderRadius: "var(--goa-border-radius-l)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "stretch" }}>
            <div data-queue-table style={{ flex: 1, minWidth: 0, overflowX: "auto", "--goa-table-padding-heading": "18px 0 16px" }}>
              <GoabTable headers={overview ? headersAll : figma ? headersFig : headersFor(list, ex)} width="100%">
                {list.length === 0
                  ? <tr><td colSpan={overview ? 9 : figma ? 10 : nCols(ex)} style={{ padding: 0 }}><EmptyState art="EmptySystemStateNoResults" title={emptyMsg || "No claims match the current filters"} hint={emptyMsg ? undefined : "Clear a filter or widen the search to see more."} /></td></tr>
                  : overview ? capRows(qSorted(list) || stageSpread(list), "ov", 9, (c) => <RowAll key={c.id} c={c} st={{ selected, expanded, recheck, feedback, annot }} act={act} />)
                  : figma ? capRows([...list].sort((a, b2) => a.day - b2.day || a.id - b2.id), "fig", 10, (c) => <RowFig key={c.id} c={c} st={{ selected, expanded, recheck, feedback, annot }} act={act} />)
                  : bands && grouping !== "flat" ? BANDS.map((b) => bandRows(list, b, ex)).filter(Boolean)
                  : flatRows(list, ro, ex)}
              </GoabTable>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const jump = (...prefixes) => { for (const pf of prefixes) { const i = tabs.findIndex((x) => x.h.indexOf(pf) === 0); if (i >= 0) { setGoTab((g) => ({ i: i + 1, k: g.k + 1 })); return; } } };
  /* R5 — bulk clear is grounded practice, but it was asserting QA's four perfect-case checks
     invisibly. Open a confirm that shows each check's pass count and names what it excludes. */
  const clearNormals = () => {
    const rows = myQ.filter((c) => bandOf(c) === "norm" && c.status !== "cleared");
    if (!rows.length) return;
    setClearConfirm({ pass: rows.filter((c) => !perfectFails(c).length), fail: rows.filter((c) => perfectFails(c).length) });
  };
  const runClear = (rows) => { const ids = rows.map((c) => c.id); const prev = claims.filter((c) => ids.includes(c.id)).map((c) => [c.id, c.status]); act.setStatus(ids, "cleared"); setToast({ n: ids.length, prev }); setClearConfirm(null); };
  const opCards = (p) => (
        <div style={{ display: "flex", gap: "var(--goa-space-s)", flexWrap: "wrap", alignItems: "stretch" }}>
          {[{ c: "var(--goa-color-success-default)", bg: "var(--goa-color-success-background)", ic: "shield-checkmark-outline", n: myQ.filter((c) => bandOf(c) === "norm" && c.status !== "cleared").length, t: " perfect cases", body: "Checklist passed — licence, claims 1·2·3, 0% risk. Release in one action.", btn: R.bulkClear ? <GoabButton key="b" type="primary" size="compact" leadingIcon="checkmark-done" disabled={!myQ.filter((c) => bandOf(c) === "norm" && c.status !== "cleared").length} onClick={clearNormals}>Release {myQ.filter((c) => bandOf(c) === "norm" && c.status !== "cleared").length} now</GoabButton> : <GoabButton key="b" type="primary" size="compact" leadingIcon="arrow-forward" onClick={() => jump(mainTabPrefix)}>Open queue</GoabButton> },
            { c: "var(--goa-color-emergency-default)", bg: "var(--goa-color-emergency-background)", ic: "trending-up-outline", n: myQ.filter((c) => (c.qaFlags || []).indexOf("High variance") >= 0 && c.status !== "cleared").length, t: " high variance", body: "Top 3% of the batch by change in claim amount against the previous month. Start here.", btn: <GoabButton key="b" type="secondary" size="compact" leadingIcon="arrow-forward" onClick={() => jump(mainTabPrefix)}>Start with high variance</GoabButton> },
            { c: "var(--goa-color-warning-dark)", bg: "var(--goa-color-warning-background)", ic: "swap-horizontal-outline", n: myQ.filter((c) => (c.qaFlags || []).indexOf("Random sample") >= 0 && c.status !== "cleared").length, t: " random sample", body: "Drawn in the 5% random sample of this batch. Review after high variance.", btn: <GoabButton key="b" type="tertiary" size="compact" leadingIcon="arrow-forward" onClick={() => jump(mainTabPrefix)}>Review sample</GoabButton> }].map((cd, i) => (
            <div key={i} style={{ flex: 1, minWidth: 250, alignSelf: "stretch", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 10, padding: 16, background: cd.bg, border: "2px solid " + cd.c, borderRadius: "var(--goa-border-radius-l)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Ico name={cd.ic} size={20} color={cd.c} />
                <b style={{ font: "var(--goa-typography-heading-xs)", color: cd.c }}>{cd.n}{cd.t}</b>
              </span>
              <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", lineHeight: 1.5 }}>{cd.body}</span>
              <span style={{ marginTop: "auto" }}>{cd.btn}</span>
            </div>
          ))}
        </div>
  );
  const kpiPeriod = (p) => (
    <div key={p.period} style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-xs)", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>{"Claim period " + (p.label || p.period) + (p.current ? " — current" : "")}</span>
        <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{p.n} claims · model run {p.run} · top feature {p.top}</span>
      </div>
      {p.current ? opCards(p) : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "var(--goa-space-s)", alignItems: "stretch" }}>
        <CLKPIs text1="Moderate (1–69%)" text2={String(p.mod)} text3="Awaiting scoring" text4={String(p.wait)} />
        <CLKPIs text1="Average model risk" text2={(p.avg != null ? p.avg : "—") + "%"} text3="Highest score" text4={(p.max != null ? p.max : "—") + "%"} />
        <CLKPIs text1="Re-checks due" text2={String(p.rechk)} text3="Programs flagged" text4={String(p.progs)} />
      </div>
    </div>
  );
  const featCounts = FEATS.map((f) => [f, claims.filter((c) => c.feat === f).length]).sort((x, y) => y[1] - x[1]);
  const periods = [
    { period: "202606", label: "June, 2026", current: true, n: claims.length, run: "Jul 30, 2026 · 7:19 a.m.",
      viol: claims.filter((c) => c.viol > 0).length, progs: 11,
      high: claims.filter((c) => !c.viol && c.risk >= 70).length, mod: claims.filter((c) => !c.viol && c.risk >= 1 && c.risk < 70).length,
      norm: claims.filter((c) => !c.viol && c.risk === 0).length, wait: claims.filter((c) => c.risk === null).length,
      rechk: claims.filter((c) => c.watch).length, top: featCounts[0][0],
      avg: Math.round(claims.filter((c) => c.risk != null).reduce((s, c) => s + c.risk, 0) / Math.max(1, claims.filter((c) => c.risk != null).length)), max: Math.max(...claims.filter((c) => c.risk != null).map((c) => c.risk)) },
  ];
  const allTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)", paddingTop: "var(--goa-space-s)" }}>
      {/* kpiStyle="full" restores the real CL-KPI tile strip (kpiPeriod, which carries opCards for
         the current period). "placeholder" is the MVP's scoped-down build: operational cards plus
         the TBD block. One toggle still clears every KPI block (showKpis). */}
      {showKpis && kpiStyle === "full" ? kpiPeriod(periods[0]) : null}
      {showKpis && kpiStyle !== "full" ? opCards(periods[0]) : null}
      {/* Remaining period KPIs to be determined — one placeholder below the operational cards.
         Hidden by the showKpis tweak so the overview can be shown without the TBD block. */}
      {showKpis && kpiStyle !== "full" ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center", minHeight: 160, padding: 20, background: "var(--goa-color-greyscale-100)", border: "2px dashed var(--goa-color-greyscale-400)", borderRadius: "var(--goa-border-radius-l)", boxSizing: "border-box" }}>
        <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 700, color: "var(--goa-color-text-secondary)" }}>KPIs</span>
        <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>To be determined</span>
      </div>
      ) : null}
      <Queue list={allQ} overview />
    </div>
  );
  const fc = focusIdx != null ? exceptions[focusIdx] : null;
  const kbd = (k2, l2) => (<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, border: "1px solid var(--goa-color-greyscale-200)", borderBottom: "2px solid var(--goa-color-greyscale-300)", borderRadius: 5, padding: "1px 7px", background: "var(--goa-color-greyscale-white)" }}>{k2}</span><span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{l2}</span></span>);
  const focusView = fc ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: "var(--goa-space-s)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <b style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Exceptions · {focusIdx + 1} of {exceptions.length}</b>
        <span style={{ flex: 1 }}><GoabProgressIndicator variant="linear" progress={Math.round(((focusIdx + 1) / Math.max(1, exceptions.length)) * 100)} percentVisibility="hidden" ariaLabel="Exception review progress" /></span>
        <GoabButton type="tertiary" size="compact" leadingIcon="close-outline" onClick={() => setFocusIdx(null)}>Exit focus</GoabButton>
      </div>
      <div style={{ maxWidth: 720, width: "100%", alignSelf: "center", boxSizing: "border-box", background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 10, boxShadow: "var(--goa-shadow-raised-heavy)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}>
          <span style={{ fontFamily: MONO, color: "var(--goa-color-text-default)" }}>{fc.clm}</span>
          <b style={{ font: "var(--goa-typography-heading-xs)" }}>{fc.name}</b>
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>${fc.amt}</span>
        </div>
        <EvidenceCard c={fc} st={{ selected, expanded, recheck, feedback, annot }} act={act} vertical />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "10px 16px", borderTop: "1px solid var(--goa-color-greyscale-100)", background: "var(--goa-color-greyscale-white)" }}>
          <GoabButton type="secondary" size="compact" leadingIcon="pause-circle-outline" onClick={() => focusDo("hold")}>Hold</GoabButton>
          <GoabButton type="tertiary" size="compact" leadingIcon="bookmark-outline" onClick={() => focusDo("watchlist")}>Watchlist</GoabButton>
          <span style={{ flex: 1 }}></span>
          <GoabButton type="tertiary" size="compact" onClick={focusNext}>Skip</GoabButton>
          <GoabButton type="primary" size="compact" leadingIcon="checkmark" onClick={() => focusDo("reviewed")}>Mark reviewed</GoabButton>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>{kbd("R", "reviewed")}{kbd("H", "hold")}{kbd("W", "watchlist")}{kbd("→", "skip")}{kbd("Esc", "exit")}</div>
    </div>
  ) : null;

  const overviewTab = { h: "Claims overview", el: allTab, bar: queueBar() };
  /* CCFOPS-476 \u2014 the Watchlist tab is a PROVIDER register, not a claim queue: one row per
     provider \u00d7 watching role, sortable on Program name and Watcher, each row edited by its watcher. */
  const watchRows = (() => {
    const q = search.trim().toLowerCase();
    const rows = [];
    watchEntries.forEach((e) => Object.keys(e.roles).forEach((r) => rows.push({ e, role: r, reason: e.roles[r] })));
    const f = q ? rows.filter((x) => (x.e.name + " " + x.e.pid + " " + x.role + " " + x.reason).toLowerCase().indexOf(q) >= 0) : rows;
    const k = watchSort.k, d = watchSort.dir;
    return [...f].sort((a, b2) => (k === "role" ? a.role.localeCompare(b2.role) : a.e.name.localeCompare(b2.e.name)) * d);
  })();
  const wSort = (k) => setWatchSort((s) => ({ k, dir: s.k === k ? -s.dir : 1 }));
  /* Real GoA pattern (user 2026-08-13): GoabTable + GoabTableSortHeader labels — DS owns th/td chrome. */
  const wlh = (label, key2) => key2 && GoabTableSortHeader ? <GoabTableSortHeader name={key2} direction={watchSort.k === key2 ? (watchSort.dir === 1 ? "asc" : "desc") : "none"} onClick={() => wSort(key2)}>{label}</GoabTableSortHeader> : label;
  const wtd = { font: "var(--goa-typography-body-s)", verticalAlign: "top" };
  const watchBar = (
    <React.Fragment>
      <GoabInput name="watch-find" size="compact" value={search} onChange={(...a) => setSearch(val(...a))} placeholder="Search providers" leadingIcon="search-outline" width="180px" />
      <GoabButton type="tertiary" size="compact" leadingIcon="filter-outline" onClick={() => openSheet("q")}>Filter{qCount ? " (" + qCount + ")" : ""}</GoabButton>
      {/* Same treatment as the claim CTA (CTARow `one`): tertiary, compact, no leading icon. */}
      <GoabButton type="tertiary" size="compact" onClick={() => setWatchModal({ provider: null, entry: null })}>Add to watchlist</GoabButton>
      <ExportMenu onPick={(fmt) => setExportNote("Watchlist exported as " + fmt)} />
    </React.Fragment>
  );
  const watchTab = { h: "Watchlist (" + watchEntries.length + ")", bar: watchBar, el: (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-s)", paddingTop: "var(--goa-space-s)" }}>
      <div style={{ background: "var(--goa-color-greyscale-white)", borderRadius: "var(--goa-border-radius-l)", overflow: "hidden" }}>
        {watchRows.length === 0 ? <EmptyState icon="bookmark-outline" title={search ? "No watched provider matches that search" : "No providers on the watchlist"} hint={search ? "Clear the search to see the whole register." : "Add one from a claim, or with Add provider above."} /> : (
          <GoabTable headers={[{ label: wlh("Program name", "name") }, { label: wlh("Program ID") }, { label: wlh("Watcher", "role") }, { label: wlh("Watch reason") }, { label: "" }]} width="100%">
              {watchRows.map((x) => (
                <tr key={x.e.pid + "::" + x.role}>
                  <td style={{ ...wtd, minWidth: 200 }}>
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>{x.e.name}</span>
                      <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{x.e.addr}</span>
                    </span>
                  </td>
                  <td style={{ ...wtd, fontFamily: MONO, whiteSpace: "nowrap" }}>{x.e.pid}</td>
                  <td style={wtd}><GoabBadge type={x.role === "QA" ? "dark" : "information"} content={x.role} emphasis="subtle" /></td>
                  <td style={wtd}>{x.reason}</td>
                  <td style={{ ...wtd, whiteSpace: "nowrap" }}><GoabLinkButton size="compact" onClick={() => setWatchModal({ provider: { pid: x.e.pid, name: x.e.name, addr: x.e.addr }, entry: x.e })}>Edit</GoabLinkButton></td>
                </tr>
              ))}
          </GoabTable>
        )}
      </div>
    </div>
  ) };
  /* Board 7 gap: over-$25k referrals (FDH & ICC), Funding EO's backwards hold, and the signed
     release-report trail each get their own tab, shown only where the stage actually has them. */
  const supTab = { h: "Supervisor review (" + supList.length + ")", bar: queueBar(), el: (
    <Queue list={supList} emptyMsg={"No payments over $" + (SUPERVISOR.threshold / 1000) + "k in your queue — those are the only ones a supervisor signs off."} />
  ) };
  const returnedTab = { h: "Returned (" + returnedList.length + ")", bar: queueBar(), el: (
    <Queue list={returnedList} emptyMsg="Nothing returned to you — a downstream EO can send a claim back here for follow-up with the program." />
  ) };
  const reportsTab = { h: "Release reports (" + myReports.length + ")", el: (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-s)", paddingTop: "var(--goa-space-s)" }}>
      <div style={{ background: "var(--goa-color-greyscale-white)", borderRadius: "var(--goa-border-radius-l)", overflow: "hidden" }}>
        {myReports.length === 0 ? <EmptyState icon="ribbon-outline" title="No release reports yet" hint="Sign a release from your queue and the report is saved here." /> : (
          <GoabTable width="100%" headers={["Report ID", "Released to", { label: "Claims", numeric: true }, { label: "Total", numeric: true }, { label: "Held back", numeric: true }, "Signed by", "Signed at", ""]}>
            {myReports.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: "8px 12px", fontFamily: MONO, whiteSpace: "nowrap" }}>{r.id}</td>
                <td style={{ padding: "8px 12px", font: "var(--goa-typography-body-s)" }}>{r.to}</td>
                <td style={{ padding: "8px 12px", fontFamily: MONO, textAlign: "right" }}>{r.claims}</td>
                <td style={{ padding: "8px 12px", fontFamily: MONO, textAlign: "right", whiteSpace: "nowrap" }}>${r.total}</td>
                <td style={{ padding: "8px 12px", fontFamily: MONO, textAlign: "right" }}>{r.held}</td>
                <td style={{ padding: "8px 12px", font: "var(--goa-typography-body-s)" }}>{r.signer}</td>
                <td style={{ padding: "8px 12px", font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", whiteSpace: "nowrap" }}>{r.at}</td>
                <td style={{ padding: "8px 12px", whiteSpace: "nowrap" }}><GoabLinkButton size="compact" onClick={() => setReportOpen(r)}>View</GoabLinkButton></td>
              </tr>
            ))}
          </GoabTable>
        )}
      </div>
    </div>
  ) };
  let tabs;
  if (R.release1GX) {
    tabs = [
      overviewTab,
      { h: "Ready to release (" + myStageQ.length + ")", bar: queueBar(), el: <Queue list={myStageQ} bands sampling releaseBtn={releaseNode} emptyMsg="Nothing awaiting release — reviewed claims from every funding stream land here for final release to 1GX." /> },
      { h: "Released to 1GX (" + releasedList.length + ")", bar: queueBar(), el: <Queue list={releasedList} ro emptyMsg="No payments released to 1GX yet this cycle." /> },
      watchTab,
      reportsTab,
    ];
  } else if (R.stage === "qa") {
    tabs = [
      overviewTab,
      { h: "QA queue (" + (qaQ.length + reqIncoming.length) + ")", bar: queueBar(), el: <Queue list={qaQ.concat(reqIncoming)} bands sampling releaseBtn={releaseNode} /> },
      { h: "Hold (" + holdList.length + ")", bar: queueBar(), el: <Queue list={holdList} extra={roleCols.concat(["heldBy"])} /> },
      watchTab,
    ];
    /* Released and Release reports stay hidden until this reviewer has actually signed a release. */
    if (myReports.length) tabs.push(
      { h: "Released (" + downstream.length + ")", bar: queueBar(), el: <Queue list={downstream} ro emptyMsg="Nothing released yet this cycle — cleared + reviewed claims move here when you release." /> },
      reportsTab
    );
    if (role === "lead") tabs.splice(3, 0, { h: "Downstream (" + downstream.length + ")", bar: queueBar(), el: <Queue list={downstream} ro emptyMsg="Nothing at a downstream stage yet." /> });
  } else {
    tabs = [
      overviewTab,
      { h: R.stageLabel + " queue (" + (myStageQ.length + reqIncoming.length) + ")", bar: queueBar(), el: <Queue list={myStageQ.concat(reqIncoming)} bands sampling releaseBtn={releaseNode} emptyMsg={"Nothing in the " + R.stageLabel + " stage yet — QA releases reviewed claims here as they clear."} /> },
      { h: "Hold (" + holdList.length + ")", bar: queueBar(), el: <Queue list={holdList} extra={roleCols.concat(["heldBy"])} emptyMsg={R.holdRoute ? "Nothing on hold here — a hold at this stage sends the claim back to " + R.holdRouteLabel + " to follow up with the program." : undefined} /> },
      watchTab,
      reportsTab,
    ];
    if (supList.length) tabs.splice(3, 0, supTab);
  }
  /* paPlacement="tab" — the analyzer gets its own tab immediately right of the stage queue, in place
     of the old Flagged tab: the same rows the queue holds, ordered violations-first by `exceptions`,
     with the analyzer's filter sheet on this tab's bar. */
  if (paPlacement === "tab") tabs.splice(2, 0, {
    h: "Pattern analyzer (" + exceptions.length + ")",
    bar: queueBar({ analyzer: true }),
    el: <Queue list={exceptions} bands emptyMsg="No claims in this queue carry a rule violation or a high model risk." />,
  });

  useBackdropLock(!!modal || !!sheet || !!clearConfirm || !!reportOpen || !!watchModal, queueRef);
  React.useEffect(() => {
    const root = queueRef.current;
    if (!root) { setHdrSlot(null); return; }
    const scope = root.closest(".goab-wl") || document;
    setHdrSlot(scope.querySelector("[data-wl-actions]") || null);
  }, [wfId, lookup]);

  if (lookup) return <ClaimLookup claims={claims} onBack={() => setLookup(false)} onOpen={(id) => { setLookup(false); setWfId(id); }} />;

  const wfClaim = wfId != null ? claims.find((c) => c.id === wfId) : null;
  /* Back from the detail returns to the tab the claim was opened FROM, not the landing tab. activeTab
     survives the detail (it lives out here; only the strip unmounts), so restoring it is a matter of
     re-seeding initialTab and bumping the remount key. Clamped because a role switch while the detail
     is open can shorten the tab list. User 2026-08-12. */
  if (wfClaim) return <ClaimDetail c={wfClaim} act={act} onBack={() => { setWfId(null); setGoTab((g) => ({ i: Math.min(activeTab, tabs.length) || 1, k: g.k + 1 })); }} isSpecialist={["subsidy-eo", "fdh-eo", "funding-eo"].includes(role)} release1GX={!!R.release1GX} />;

  /* Named receiving roles, derived from the batch in hand. After release the batch is gone, so the
     confirmation reads the roles STORED on the release report rather than recomputing an empty set. */
  const relBatch = claims.filter((c) => c.stage === R.stage && (c.status === "reviewed" || c.status === "cleared"));
  /* Providers the Add-to-watchlist picker can offer: one entry per program ID, minus the ones this
     role already watches (the register is per provider × role). */
  const unwatchedProviders = (() => {
    const seen = {}, out = [];
    claims.forEach((c) => {
      if (seen[c.pid]) return;
      seen[c.pid] = 1;
      const e = watchApi.find(c.pid);
      if (e && e.roles && e.roles[watchApi.role] != null) return;
      out.push({ pid: c.pid, name: c.name, addr: c.addr });
    });
    return out.sort((a, b) => a.name.localeCompare(b.name));
  })();
  const nextArr = nextLabels(R, relBatch);
  const nextTo = joinAnd(nextArr);
  const relRep = typeof released === "string" ? reports.filter((r) => r.id === released)[0] : null;
  const releasedTo = (relRep && relRep.to) || nextTo;


  return (
    <div ref={queueRef} style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-s)", paddingBottom: "var(--goa-space-l)" }}>
      {toast ? (
        <GoabCallout type="success" size="medium" heading={toast.n + " claims cleared"}>
          {/* User instruction 2026-08-12: Dismiss sits at the far right end (GoabCallout has no
             close-in-heading affordance — declared props end at heading/maxWidth). flex + a flex:1
             spacer, not inline-flex, so the row spans the callout and the spacer can push. */}
          <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>Checklist-verified, logged under your signature.
            <GoabButton type="tertiary" size="compact" leadingIcon="arrow-undo-outline" onClick={() => { setClaims((cs) => cs.map((c) => { const p = toast.prev.find(([id]) => id === c.id); return p ? { ...c, status: p[1] } : c; })); setToast(null); }}>Undo</GoabButton>
            <span style={{ flex: 1 }}></span>
            <GoabButton type="tertiary" size="compact" onClick={() => setToast(null)}>Dismiss</GoabButton>
          </span>
        </GoabCallout>
      ) : null}
      {released ? (
        <GoabCallout type="success" size="medium" heading={R.release1GX ? "Payments released to 1GX" : "Batch released to " + releasedTo}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* The "…was notified in ECDS — no Teams email" lead sentence removed — user
               instruction 2026-08-12 ("remove 1st sentence"); the report line stands alone. */}
            {typeof released === "string" ? <span>Release report <b style={{ fontFamily: MONO }}>{released}</b> signed by {signer} and saved.</span> : null}
            {typeof released === "string" ? <GoabLinkButton size="compact" onClick={() => { const r = reports.find((x) => x.id === released); if (r) setReportOpen(r); }}>View release report</GoabLinkButton> : null}
            {/* Dismiss, but no Undo: the sibling "cleared" callout can undo because clearing only sets a
                status, whereas release moved the claims to the next stage AND wrote a signed release
                report. Reversing that from a banner would be a fake affordance. User 2026-08-12.
                Far-right placement matches the cleared callout (same instruction). */}
            <span style={{ flex: 1 }}></span>
            <GoabButton type="tertiary" size="compact" onClick={() => setReleased(false)}>Dismiss</GoabButton>
          </span>
        </GoabCallout>
      ) : null}
      {/* Controls ride the tab strip row itself. Compact controls are 40px and the segmented pill
         bar is 38px, so the cluster sets the row height and the effect above nudges the pills 1px
         to share its centre line; that effect also caps the list so pills never run under it. */}
      <div ref={stripRef} style={{ position: "relative" }}>
        <GoabTabs key={role + "-" + goTab.k} variant="segmented" navigation="none" initialTab={goTab.i} onChange={(n) => setActiveTab(typeof n === "number" ? n : ((n && n.tab) || 1))}>
          {tabs.map((t) => <GoabTab key={t.h} heading={<TabHeading h={t.h} />}>{t.el}</GoabTab>)}
        </GoabTabs>
        <div ref={barRef} style={{ position: "absolute", top: 0, right: 0, height: 40, display: "flex", alignItems: "center", gap: "var(--goa-space-s)", flexShrink: 0 }}>
          {(tabs[activeTab - 1] || {}).bar || null}
        </div>
      </div>
      {filterSheet}
      {paSheet}
      {/* cc-1 — Pattern analyzer rides the workspace header's action section. "toolbar" is the legacy
         value for this placement and still resolves here, so an existing tweak keeps working. */}
      {paInHeader && hdrSlot && window.ReactDOM && window.ReactDOM.createPortal
        ? window.ReactDOM.createPortal(
            <GoabButton type="secondary" size="compact" leadingIcon="sparkles-outline" onClick={() => openSheet("pa")}>Pattern analyzer{paCount ? " (" + paCount + ")" : ""}</GoabButton>,
            hdrSlot)
        : null}
      {watchModal ? (
        <WatchlistModal
          key={(watchModal.provider && watchModal.provider.pid) || "new"}
          provider={watchModal.provider}
          providers={unwatchedProviders}
          entry={watchModal.entry}
          onClose={() => setWatchModal(null)}
          onRemove={() => { watchApi.remove(watchModal.provider.pid); setWatchModal(null); setExportNote("Removed " + watchModal.provider.name + " from the watchlist."); }}
          onSave={(roles, prov) => { const p = prov || watchModal.provider; const ex = watchModal.entry ? null : watchApi.find(p.pid); watchApi.save(p, ex && ex.roles ? { ...ex.roles, ...roles } : roles); setWatchModal(null); setExportNote(watchModal.entry ? "Watchlist entry updated." : "Added " + p.name + " to the watchlist."); }} />
      ) : null}
      {modal && GoabModal ? (
        <GoabModal heading={R.release1GX ? "Release payment to 1GX?" : "Release to " + nextTo + "?"} open onClose={() => { setModal(false); setSign(false); }} maxWidth="520px">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* The "N claims (cleared + reviewed) hand off…" summary sentence removed — user
               instruction 2026-08-12; the details box below already carries the release facts. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--goa-color-greyscale-50)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 6 }}>
              {[["Sampling basis", SAMP.basis], ["Payment run", NEXT_RUN.label + " · release by " + NEXT_RUN.cutoff], ["Total released", "$" + relTotal], ["Held back", (supCount ? supCount + " over $" + (SUPERVISOR.threshold / 1000) + "k · " : "") + heldCount + " on hold"]].map(([k, v]) => (
                <span key={k} style={{ display: "flex", justifyContent: "space-between", gap: 14, font: "var(--goa-typography-body-xs)" }}>
                  <span style={{ color: "var(--goa-color-text-secondary)" }}>{k}</span>
                  <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
                </span>
              ))}
            </div>
            {/* Board 7: each stage ends by digitally signing the release report for record-keeping. */}
            <GoabCheckbox size="compact" name="sign-release" text={"I digitally sign this release report as " + signer + " and save it for record-keeping."} checked={sign} onChange={() => setSign((v) => !v)} />
            <span style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <GoabButton type="secondary" size="compact" onClick={() => { setModal(false); setSign(false); }}>Cancel</GoabButton>
              <GoabButton type="primary" size="compact" disabled={!sign} leadingIcon={R.release1GX ? "card-outline" : "paper-plane"} onClick={() => {
                setClaims((cs) => cs.map((c) => {
                  if (c.stage !== R.stage || !(c.status === "reviewed" || c.status === "cleared")) return c;
                  if (R.release1GX) return { ...c, stage: "released", status: "released" };
                  const next = R.stage === "qa" ? VEHICLE_STAGE[c.pay] : "finance";
                  return { ...c, stage: next, status: "open" };
                }));
                const rid = rrId(TODAY);
                setReports((rs) => [{ id: rid, stage: R.stage, to: nextTo, toN: nextArr.length, claims: reviewedN, total: relTotal, at: TODAY + ", 2026, 9:02 a.m.", signer, basis: SAMP.basis, held: supCount + heldCount }].concat(rs));
                setModal(false); setSign(false); setReleased(rid);
              }}>Sign &amp; release</GoabButton>
            </span>
          </div>
        </GoabModal>
      ) : null}
      {GoabTemporaryNotification ? <GoabTemporaryNotification open={!!exportNote} type="information" message={exportNote || ""} duration={3500} horizontalPosition="center" verticalPosition="bottom" onClose={() => setExportNote(null)} /> : null}
      {clearConfirm && GoabModal ? (
        <GoabModal heading={"Bulk release " + clearConfirm.pass.length + " claim" + (clearConfirm.pass.length === 1 ? "" : "s") + "?"} open onClose={() => setClearConfirm(null)} maxWidth="560px">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ font: "var(--goa-typography-body-m)" }}>Releasing asserts the perfect-case checklist on every claim below. These are the four checks you run today.</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {PERFECT_CHECKS.map((k) => {
                const n = clearConfirm.pass.concat(clearConfirm.fail).filter((c) => k.test(c)).length;
                const total = clearConfirm.pass.length + clearConfirm.fail.length;
                return (
                  <span key={k.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-s)" }}>
                    <Ico name={n === total ? "checkmark-circle-outline" : "alert-circle-outline"} size={16} color={n === total ? "var(--goa-color-success-default)" : "var(--goa-color-warning-dark)"} />
                    <span style={{ flex: 1 }}>{k.label}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 700 }}>{n}/{total}</span>
                  </span>
                );
              })}
            </div>
            {clearConfirm.fail.length ? (
              <GoabCallout type="important" size="medium" mb="none" heading={clearConfirm.fail.length + " claim" + (clearConfirm.fail.length === 1 ? "" : "s") + " held out of this bulk clear"}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {clearConfirm.fail.slice(0, 6).map((c) => (
                    <span key={c.id} style={{ font: "var(--goa-typography-body-xs)" }}><b style={{ fontFamily: MONO }}>{c.clm}</b> {c.name} — {perfectFails(c).map((k) => k.label.replace(/^No /, "")).join("; ")}</span>
                  ))}
                  {clearConfirm.fail.length > 6 ? <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>+{clearConfirm.fail.length - 6} more — review these individually.</span> : null}
                </div>
              </GoabCallout>
            ) : null}
            <span style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <GoabButton type="secondary" size="compact" onClick={() => setClearConfirm(null)}>Cancel</GoabButton>
              <GoabButton type="primary" size="compact" leadingIcon="checkmark-circle-outline" disabled={!clearConfirm.pass.length} onClick={() => runClear(clearConfirm.pass)}>Release {clearConfirm.pass.length} that pass</GoabButton>
            </span>
          </div>
        </GoabModal>
      ) : null}
      {reportOpen && GoabModal ? (
        <GoabModal heading={"Release report " + reportOpen.id} open onClose={() => setReportOpen(null)} maxWidth="520px">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[["Report ID", reportOpen.id], ["Stage", (ROLES[Object.keys(ROLES).find((k) => ROLES[k].stage === reportOpen.stage)] || R).stageLabel], ["Released to", reportOpen.to], ["Claims released", String(reportOpen.claims)], ["Total released", "$" + reportOpen.total], ["Held back", String(reportOpen.held)], ["Sampling basis", reportOpen.basis]].map(([k, v]) => (
                <span key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "7px 0", borderBottom: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-s)" }}>
                  <span style={{ color: "var(--goa-color-text-secondary)" }}>{k}</span>
                  <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--goa-color-success-background)", borderRadius: 6 }}>
              <Ico name="ribbon-outline" size={20} color="var(--goa-color-success-dark)" />
              <span style={{ font: "var(--goa-typography-body-s)" }}>Digitally signed by <b>{reportOpen.signer}</b><br /><span style={{ color: "var(--goa-color-text-secondary)" }}>{reportOpen.at} · retained for audit</span></span>
            </div>
            <span style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <GoabButton type="secondary" size="compact" leadingIcon="document-text-outline" onClick={() => {}}>Excel (.xlsx)</GoabButton>
              <GoabButton type="secondary" size="compact" leadingIcon="download" onClick={() => {}}>PDF</GoabButton>
              <GoabButton type="primary" size="compact" onClick={() => setReportOpen(null)}>Close</GoabButton>
            </span>
          </div>
        </GoabModal>
      ) : null}
    </div>
  );
}
window.QAPrototypeScreen = QAPrototypeScreen;
