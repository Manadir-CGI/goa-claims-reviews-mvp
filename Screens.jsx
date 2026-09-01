/* Claims Advance — blue sky vision screens. One file, shared primitives
   defined once, each screen exposed as a window global and mounted by the
   canvas DC via <x-import>. GoA design-system components + tokens throughout.
   Generic placeholder data; realistic near-term vision. */

const NS = () => window.GovernmentOfAlbertaDesignSystem_eddb08 || {};

/* ---------- shared primitives ---------- */
const MONO = 'var(--goa-font-family-mono, "Roboto Mono", monospace)';
const money = (n) => "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Money({ v, size, weight, color }) {
  return <span style={{ fontFamily: MONO, fontSize: size || "inherit", fontWeight: weight || 600, color: color || "inherit", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{money(v)}</span>;
}

function Stat({ label, children, sub, icon, tone }) {
  const accent = tone === "success" ? "var(--goa-color-status-success, #006f4c)"
    : tone === "danger" ? "var(--goa-color-status-emergency, #da291c)"
    : tone === "brand" ? "var(--goa-color-brand-default, #0081a2)"
    : "var(--goa-color-interactive-default)";
  return (
    <div style={{ flex: "1 1 0", minWidth: 180, background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", padding: "var(--goa-space-l)", display: "flex", flexDirection: "column", gap: "var(--goa-space-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-2xs)", color: "var(--goa-color-text-secondary)", font: "var(--goa-typography-body-s)" }}>
        {icon ? <ion-icon name={icon} style={{ fontSize: 16, color: accent }}></ion-icon> : null}
        <span>{label}</span>
      </div>
      <div style={{ font: "var(--goa-typography-heading-l)", lineHeight: 1.05, color: "var(--goa-color-text-default)" }}>{children}</div>
      {sub ? <div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{sub}</div> : null}
    </div>
  );
}

function SectionCard({ title, desc, actions, children, pad = "var(--goa-space-l)" }) {
  return (
    <section style={{ background: "var(--goa-color-greyscale-white)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", overflow: "hidden" }}>
      {title ? (
        <header style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-m)", padding: "var(--goa-space-m) var(--goa-space-l)", borderBottom: "1px solid var(--goa-color-greyscale-200)", background: "var(--goa-color-greyscale-50)" }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ font: "var(--goa-typography-heading-s)", margin: 0 }}>{title}</h2>
            {desc ? <p style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", margin: "2px 0 0" }}>{desc}</p> : null}
          </div>
          <span style={{ flex: 1 }}></span>
          {actions}
        </header>
      ) : null}
      <div style={{ padding: pad }}>{children}</div>
    </section>
  );
}

/* semantic flag chip: colour + icon (never colour-only) */
function Flag({ type, children }) {
  const map = {
    mismatch: { c: "var(--goa-color-status-emergency, #da291c)", bg: "#fbeae8", icon: "alert-circle-outline" },
    missing: { c: "#8a5a00", bg: "#fdf3d7", icon: "warning-outline" },
    pending: { c: "var(--goa-color-status-info, #0077ad)", bg: "#e6f2f8", icon: "time-outline" },
    ok: { c: "var(--goa-color-status-success, #006f4c)", bg: "#e4f1ea", icon: "checkmark-circle-outline" },
    watch: { c: "#5b4a9e", bg: "#eeeaf7", icon: "bookmark" },
  };
  const s = map[type] || map.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px 2px 7px", borderRadius: 999, background: s.bg, color: s.c, font: "var(--goa-typography-body-xs)", fontWeight: 600, whiteSpace: "nowrap" }}>
      <ion-icon name={s.icon} style={{ fontSize: 13 }}></ion-icon>{children}
    </span>
  );
}

/* horizontal breakdown "waterfall" row */
function FlowRow({ label, v, tone, note, strong, minus }) {
  const c = tone === "success" ? "var(--goa-color-status-success, #006f4c)" : tone === "danger" ? "var(--goa-color-status-emergency, #da291c)" : "var(--goa-color-text-default)";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) 0", borderBottom: strong ? "none" : "1px solid var(--goa-color-greyscale-100)" }}>
      <div style={{ flex: 1, font: strong ? "var(--goa-typography-body-l)" : "var(--goa-typography-body-m)", fontWeight: strong ? 700 : 400, color: "var(--goa-color-text-default)" }}>
        {label}
        {note ? <div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", fontWeight: 400 }}>{note}</div> : null}
      </div>
      <Money v={v} size={strong ? 22 : 17} weight={strong ? 700 : 600} color={c} />
    </div>
  );
}

function StepTimeline({ steps }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {steps.map((s, i) => {
        const done = s.state === "done", cur = s.state === "current";
        const dot = done ? "var(--goa-color-status-success, #006f4c)" : cur ? "var(--goa-color-interactive-default)" : "var(--goa-color-greyscale-300)";
        return (
          <div key={i} style={{ display: "flex", gap: "var(--goa-space-m)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: done || cur ? dot : "var(--goa-color-greyscale-white)", border: `2px solid ${dot}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {done ? <ion-icon name="checkmark" style={{ color: "#fff", fontSize: 15 }}></ion-icon> : cur ? <div style={{ width: 8, height: 8, borderRadius: 999, background: "#fff" }}></div> : null}
              </div>
              {i < steps.length - 1 ? <div style={{ width: 2, flex: 1, minHeight: 30, background: done ? "var(--goa-color-status-success, #006f4c)" : "var(--goa-color-greyscale-200)" }}></div> : null}
            </div>
            <div style={{ paddingBottom: "var(--goa-space-l)" }}>
              <div style={{ font: "var(--goa-typography-body-m)", fontWeight: 600, color: cur ? "var(--goa-color-interactive-default)" : "var(--goa-color-text-default)" }}>{s.title}</div>
              <div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{s.date}{s.detail ? " · " + s.detail : ""}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* simple, honest bar list (no chart libs) */
function BarList({ items, max, unit }) {
  const hi = max || Math.max(...items.map((i) => i.v));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-s)" }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-m)" }}>
          <div style={{ width: 120, font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", textAlign: "right", flexShrink: 0 }}>{it.label}</div>
          <div style={{ flex: 1, height: 22, background: "var(--goa-color-greyscale-100)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${Math.round((it.v / hi) * 100)}%`, height: "100%", background: it.color || "var(--goa-color-brand-default, #0081a2)", borderRadius: 6 }}></div>
          </div>
          <div style={{ width: 96, fontFamily: MONO, fontSize: 13, fontWeight: 600, textAlign: "right", flexShrink: 0 }}>{unit === "$" ? money(it.v) : it.v.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

window.ClaimsUI = { NS, money, Money, Stat, SectionCard, Flag, FlowRow, StepTimeline, BarList, MONO };

/* ============================ OPERATOR SCREENS ============================ */

const LAST3 = [
  { label: "May 2025", v: 6180.40, color: "var(--goa-color-brand-light, #7ec8e0)" },
  { label: "Apr 2025", v: 5940.00, color: "var(--goa-color-brand-light, #7ec8e0)" },
  { label: "Mar 2025", v: 6288.24, color: "var(--goa-color-brand-light, #7ec8e0)" },
];
const AVG3 = 6136.21;

/* 1 — Operator Dashboard (A) */
function ScreenOperatorDashboard() {
  const { GoabButton, GoabBadge } = NS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
        <div>
          <p style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", margin: 0 }}>Little Learners Daycare · 800001237</p>
          <h1 style={{ font: "var(--goa-typography-heading-xl)", margin: "2px 0 0" }}>Claims dashboard</h1>
        </div>
        <span style={{ flex: 1 }}></span>
        <GoabButton type="secondary" size="compact" leadingIcon="document-text-outline">View statements</GoabButton>
        <GoabButton type="primary" size="compact" leadingIcon="add">Submit a claim</GoabButton>
      </div>

      <div style={{ display: "flex", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
        <Stat label="Next advance payment" icon="calendar-outline" tone="brand" sub="Pays Jul 1, 2025 · automatic">
          <Money v={6136.21} size={30} weight={700} />
        </Stat>
        <Stat label="Advance to recover" icon="arrow-undo-outline" tone="danger" sub="From your June claim">
          <Money v={5980.00} size={30} weight={700} color="var(--goa-color-status-emergency, #da291c)" />
        </Stat>
        <Stat label="Last net payment" icon="checkmark-circle-outline" tone="success" sub="Paid Jun 3 · ref 272191">
          <Money v={322.56} size={30} weight={700} color="var(--goa-color-status-success, #006f4c)" />
        </Stat>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: "var(--goa-space-l)" }}>
        <SectionCard title="Your claim advance this month" desc="How June's advance nets against your June claim">
          <FlowRow label="Advance paid" note="Jun 1, 2025 · avg of your last 3 claims" v={6136.21} tone="success" />
          <FlowRow label="June claim received" note="Submitted Jun 12 · processed Jun 30" v={5980.00} />
          <FlowRow label="Advance recovered" note="Deducted from this payment — no double payment" v={-6136.21} tone="danger" />
          <div style={{ height: "var(--goa-space-2xs)" }}></div>
          <FlowRow label="Net payment" v={322.56} strong tone="success" />
          <div style={{ marginTop: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-m)", background: "var(--goa-color-greyscale-50)", borderRadius: 8, font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>
            Because June's claim was slightly lower than your advance, a small balance carries to July. Nothing is owed by you.
          </div>
        </SectionCard>

        <SectionCard title="How your advance is calculated" desc="Average of your last 3 submitted claims">
          <BarList items={LAST3} unit="$" />
          <div style={{ marginTop: "var(--goa-space-m)", paddingTop: "var(--goa-space-m)", borderTop: "1px dashed var(--goa-color-greyscale-200)", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>Average → your advance</span>
            <Money v={AVG3} size={22} weight={700} color="var(--goa-color-brand-default, #0081a2)" />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent payment statements" actions={<GoabButton type="tertiary" size="compact" trailingIcon="arrow-forward">See all</GoabButton>}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            { period: "Claim advance: Jun 2025", date: "Jun 1, 2025", ref: "272191", amt: 6136.21, kind: "advance" },
            { period: "Claim: May 2025", date: "Jun 3, 2025", ref: "272188", amt: 322.56, kind: "claim" },
            { period: "Adjustment: Mar 2025", date: "May 6, 2025", ref: "272184", amt: 148.00, kind: "adj" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) 0", borderBottom: i < 2 ? "1px solid var(--goa-color-greyscale-100)" : "none" }}>
              <ion-icon name={r.kind === "advance" ? "arrow-up-circle-outline" : r.kind === "adj" ? "swap-horizontal-outline" : "checkmark-circle-outline"} style={{ fontSize: 22, color: "var(--goa-color-text-secondary)" }}></ion-icon>
              <div style={{ flex: 1 }}>
                <div style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{r.period}</div>
                <div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Processed {r.date} · Ref {r.ref}</div>
              </div>
              <Money v={r.amt} size={16} />
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--goa-color-interactive-default)", font: "var(--goa-typography-body-s)", fontWeight: 600 }}>PDF</a>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
window.ScreenOperatorDashboard = ScreenOperatorDashboard;

/* 1B — Operator Dashboard (single-focus advance card variant) */
function ScreenOperatorDashboardB() {
  const { GoabButton } = NS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      <div>
        <p style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", margin: 0 }}>Little Learners Daycare · 800001237</p>
        <h1 style={{ font: "var(--goa-typography-heading-xl)", margin: "2px 0 0" }}>Your claim advance</h1>
      </div>

      {/* hero advance band */}
      <div style={{ background: "var(--goa-color-brand-dark, #005072)", color: "#fff", borderRadius: "var(--goa-border-radius-xl, 12px)", padding: "var(--goa-space-xl)", display: "flex", gap: "var(--goa-space-2xl)", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ font: "var(--goa-typography-body-s)", opacity: 0.85, textTransform: "uppercase", letterSpacing: ".06em" }}>Next advance · pays Jul 1</div>
          <div style={{ fontFamily: MONO, fontSize: 46, fontWeight: 700, lineHeight: 1.1 }}>{money(6136.21)}</div>
          <div style={{ font: "var(--goa-typography-body-s)", opacity: 0.85 }}>Paid automatically at month start — no action needed.</div>
        </div>
        <span style={{ flex: 1 }}></span>
        <div style={{ display: "flex", gap: "var(--goa-space-2xl)" }}>
          {[{ l: "Method", v: "avg of last 3" }, { l: "Recovered from", v: "July claim" }, { l: "On record", v: "3 claims" }].map((x, i) => (
            <div key={i}><div style={{ font: "var(--goa-typography-body-xs)", opacity: 0.8 }}>{x.l}</div><div style={{ font: "var(--goa-typography-body-l)", fontWeight: 600 }}>{x.v}</div></div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--goa-space-l)" }}>
        <SectionCard title="Advance recovery timeline">
          <StepTimeline steps={[
            { title: "Advance paid", date: "Jul 1, 2025", detail: money(6136.21), state: "done" },
            { title: "Submit July claim", date: "By Aug 5, 2025", detail: "child + educator hours", state: "current" },
            { title: "Advance recovered", date: "Aug 6, 2025 (est.)", detail: "deducted from net", state: "todo" },
            { title: "Net payment", date: "Aug 6, 2025 (est.)", detail: "difference paid to you", state: "todo" },
          ]} />
        </SectionCard>
        <SectionCard title="Last 3 claims used" desc="The basis for your advance">
          <BarList items={LAST3} unit="$" />
          <div style={{ marginTop: "var(--goa-space-m)", paddingTop: "var(--goa-space-m)", borderTop: "1px dashed var(--goa-color-greyscale-200)", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>Average</span>
            <Money v={AVG3} size={22} weight={700} color="var(--goa-color-brand-default, #0081a2)" />
          </div>
          <div style={{ marginTop: "var(--goa-space-m)" }}>
            <GoabButton type="tertiary" size="compact" trailingIcon="arrow-forward">See full calculation</GoabButton>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
window.ScreenOperatorDashboardB = ScreenOperatorDashboardB;

/* 2 — Claim Advance Detail */
function ScreenClaimAdvanceDetail() {
  const { GoabButton, GoabCallout } = NS();
  const { ClaimHeader, CLKPIsFalse } = window;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--goa-color-interactive-default)", font: "var(--goa-typography-body-s)", fontWeight: 600 }}><ion-icon name="arrow-back-outline"></ion-icon>Back to dashboard</a>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
        <div>
          <p style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", margin: 0 }}>Claim advance · July 2025</p>
          <h1 style={{ font: "var(--goa-typography-heading-xl)", margin: "2px 0 0" }}>Advance detail</h1>
        </div>
        <span style={{ flex: 1 }}></span>
        <GoabButton type="secondary" size="compact" leadingIcon="download-outline">Download PDF</GoabButton>
      </div>

      {/* Real components: Claim Header + KPI tiles */}
      <ClaimHeader text1="Little Learners Daycare : 58000137" text2="Claim ID: 272194 · Facility-Based" />
      <div style={{ display: "flex", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
        <CLKPIsFalse text1="Advance paid" text2="$6,136.21" text3="Paid on" text4="Jul 1, 2025" />
        <CLKPIsFalse text1="Based on" text2="Avg of last 3" text3="Claims" text4="Mar–May 2025" />
        <CLKPIsFalse text1="Recovered from" text2="July claim" text3="Net paid" text4="Aug 6, 2025" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--goa-space-l)" }}>
        <SectionCard title="How this advance was calculated" desc="Average of your last 3 submitted claims">
          <BarList items={LAST3} unit="$" />
          <div style={{ marginTop: "var(--goa-space-m)", padding: "var(--goa-space-m)", background: "var(--goa-color-greyscale-50)", borderRadius: 8, fontFamily: MONO, fontSize: 14, color: "var(--goa-color-text-default)", lineHeight: 1.7 }}>
            ({money(6180.40)} + {money(5940.00)} + {money(6288.24)}) ÷ 3<br />
            = <strong>{money(AVG3)}</strong> advance
          </div>
        </SectionCard>

        <SectionCard title="Recovery timeline">
          <StepTimeline steps={[
            { title: "Advance paid", date: "Jul 1, 2025", detail: money(AVG3), state: "done" },
            { title: "July claim submitted", date: "Jul 14, 2025", detail: money(6402.00), state: "done" },
            { title: "Nightly validation (CCIS)", date: "Aug 1, 2025", detail: "net calculated", state: "current" },
            { title: "Advance recovered + net paid", date: "Aug 6, 2025", detail: "released to 1GX", state: "todo" },
          ]} />
        </SectionCard>
      </div>

      <SectionCard title="Payment history" actions={<GoabButton type="tertiary" size="compact" trailingIcon="open-outline">Export CSV</GoabButton>}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.6fr", gap: "var(--goa-space-m)", padding: "0 0 var(--goa-space-xs)", font: "var(--goa-typography-body-xs)", fontWeight: 700, color: "var(--goa-color-text-secondary)", textTransform: "uppercase", letterSpacing: ".04em", borderBottom: "2px solid var(--goa-color-greyscale-200)" }}>
            <div>Period</div><div>Advance</div><div>Claim</div><div>Net paid</div><div style={{ textAlign: "right" }}>Ref</div>
          </div>
          {[
            { p: "June 2025", a: 6136.21, c: 5980.00, n: 322.56, r: "272191" },
            { p: "May 2025", a: 6042.00, c: 6180.40, n: 6318.61, r: "272188" },
            { p: "April 2025", a: 5900.00, c: 5940.00, n: 5982.00, r: "272185" },
            { p: "March 2025", a: 5810.00, c: 6288.24, n: 6766.48, r: "272182" },
          ].map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.6fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) 0", borderBottom: "1px solid var(--goa-color-greyscale-100)", alignItems: "center", font: "var(--goa-typography-body-m)" }}>
              <div style={{ fontWeight: 600 }}>{r.p}</div>
              <Money v={r.a} size={14} weight={500} color="var(--goa-color-text-secondary)" />
              <Money v={r.c} size={14} weight={500} />
              <Money v={r.n} size={14} weight={600} color="var(--goa-color-status-success, #006f4c)" />
              <div style={{ textAlign: "right", fontFamily: MONO, fontSize: 13, color: "var(--goa-color-interactive-default)" }}>{r.r}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <GoabCallout type="information" size="medium" heading="New providers with fewer than 3 claims">
        If you have submitted fewer than 3 claims, your advance is based on the claims on record and may differ from your eventual claim. We flag this so there are no surprises at recovery.
      </GoabCallout>
    </div>
  );
}
window.ScreenClaimAdvanceDetail = ScreenClaimAdvanceDetail;

/* 3 — Payment Summary Report (PDF artifact) — rendered as a paper sheet */
function ScreenPaymentReport() {
  const rows = [
    { g: "Facility-Based Funding", period: "Jun 2025", type: "gross", v: 5980.00 },
    { g: "Wage Top-Up", period: "Jun 2025", type: "gross", v: 1120.00 },
  ];
  const gross = 7100.00;
  const ded = [
    { label: "Claim advance recovery", note: "Advance paid Jun 1, 2025 · ref 272191", v: -6136.21 },
    { label: "Prior overpayment recovery", note: "Installment 2 of 3", v: -420.00 },
  ];
  const net = 543.79;
  const L = ({ children, style }) => <div style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", ...style }}>{children}</div>;
  return (
    <div style={{ background: "var(--goa-color-greyscale-100)", padding: "var(--goa-space-xl)", height: "100%", overflowY: "auto" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", boxShadow: "0 10px 40px -12px rgba(0,0,0,0.35)", borderRadius: 4, padding: "56px 60px", fontFamily: "var(--goa-font-family-sans)" }}>
        {/* letterhead */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--goa-space-m)", borderBottom: "2px solid var(--goa-color-greyscale-800)", paddingBottom: "var(--goa-space-m)" }}>
          <img src="goa-logo.svg" alt="Government of Alberta" style={{ height: 30 }} />
          <div style={{ flex: 1 }}></div>
          <div style={{ textAlign: "right" }}>
            <div style={{ font: "var(--goa-typography-heading-s)", fontWeight: 700 }}>Payment Summary Statement</div>
            <L>Early Childhood Development System</L>
          </div>
        </div>
        {/* meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-l) 0", borderBottom: "1px solid var(--goa-color-greyscale-200)" }}>
          <div><L>Operator</L><div style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>Little Learners Daycare</div><L>800001237 · 123 456th Street SW, Calgary</L></div>
          <div style={{ textAlign: "right" }}><L>Payment period</L><div style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>June 2025</div><L>Processed Jun 30 · Ref 272191</L></div>
        </div>
        {/* gross */}
        <div style={{ padding: "var(--goa-space-l) 0 0" }}>
          <div style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--goa-color-text-secondary)", marginBottom: "var(--goa-space-xs)" }}>Gross payment</div>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", font: "var(--goa-typography-body-m)" }}>
              <span>{r.g} <span style={{ color: "var(--goa-color-text-secondary)" }}>· {r.period}</span></span><Money v={r.v} size={15} weight={500} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-m)", fontWeight: 700 }}>
            <span>Total gross</span><Money v={gross} size={16} weight={700} />
          </div>
        </div>
        {/* deductions */}
        <div style={{ padding: "var(--goa-space-l) 0 0" }}>
          <div style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--goa-color-text-secondary)", marginBottom: "var(--goa-space-xs)" }}>Deductions &amp; recoveries</div>
          {ded.map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", font: "var(--goa-typography-body-m)" }}>
              <span style={{ display: "flex", flexDirection: "column" }}>{d.label}<span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{d.note}</span></span>
              <Money v={d.v} size={15} weight={500} color="var(--goa-color-status-emergency, #da291c)" />
            </div>
          ))}
        </div>
        {/* net */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--goa-space-l)", padding: "var(--goa-space-m) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", border: "2px solid var(--goa-color-greyscale-800)", borderRadius: 6 }}>
          <span style={{ font: "var(--goa-typography-heading-s)", fontWeight: 700 }}>Net payment</span>
          <Money v={net} size={26} weight={700} color="var(--goa-color-status-success, #006f4c)" />
        </div>
        <p style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", marginTop: "var(--goa-space-l)", lineHeight: 1.6 }}>
          The claim advance recovery reflects the advance paid at the start of the period and prevents double payment. Questions? Contact the CCLP support desk. Classification: Protected A.
        </p>
      </div>
    </div>
  );
}
window.ScreenPaymentReport = ScreenPaymentReport;

/* 4 — Payment Summary Landing Page (operator + bulk download) */
function ScreenPaymentLanding() {
  const { GoabButton } = NS();
  const rows = [
    { id: "800001237", op: "Little Learners Daycare", date: "Jul 1, 2025", period: "Claim advance: Jul 2025", ref: "272194", amt: 6136.21, kind: "advance" },
    { id: "800001237", op: "Little Learners Daycare", date: "Jun 3, 2025", period: "Claim: May 2025", ref: "272191", amt: 322.56, kind: "claim" },
    { id: "800001237", op: "Little Learners Daycare", date: "May 6, 2025", period: "Adjustment: Mar 2025", ref: "272188", amt: 148.00, kind: "adj" },
    { id: "800001237", op: "Little Learners Daycare", date: "May 1, 2025", period: "Claim advance: May 2025", ref: "272185", amt: 6042.00, kind: "advance" },
    { id: "800001237", op: "Little Learners Daycare", date: "Apr 3, 2025", period: "Claim: Mar 2025", ref: "272182", amt: 6766.48, kind: "claim" },
    { id: "800001237", op: "Little Learners Daycare", date: "Apr 1, 2025", period: "Claim advance: Apr 2025", ref: "272179", amt: 5900.00, kind: "advance" },
  ];
  const kindTag = (k) => k === "advance"
    ? <Flag type="pending">Claim advance</Flag>
    : k === "adj" ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, background: "#eeeaf7", color: "#5b4a9e", font: "var(--goa-typography-body-xs)", fontWeight: 600 }}><ion-icon name="swap-horizontal" style={{ fontSize: 13 }}></ion-icon>Adjustment</span>
    : <Flag type="ok">Claim</Flag>;
  const Dropdown = ({ label, value, icon }) => (
    <div style={{ minWidth: 180 }}>
      <div style={{ font: "var(--goa-typography-body-s)", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ height: 42, borderRadius: 8, boxShadow: "inset 0 0 0 1px var(--goa-color-greyscale-300)", background: "#fff", display: "flex", alignItems: "center", gap: 8, padding: "0 12px", font: "var(--goa-typography-body-m)", color: "var(--goa-color-text-default)" }}>
        <span style={{ flex: 1 }}>{value}</span><ion-icon name={icon || "chevron-down-outline"} style={{ fontSize: 18, color: "var(--goa-color-text-secondary)" }}></ion-icon>
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      <h1 style={{ font: "var(--goa-typography-heading-xl)", margin: 0 }}>Payment summary statements</h1>
      {/* filter row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--goa-space-l)", flexWrap: "wrap" }}>
        <Dropdown label="Filter by program(s)" value="All programs" />
        <Dropdown label="Payment range" value="Last 12 months" />
        <Dropdown label="Claim period" value="Select" icon="calendar-outline" />
        <span style={{ flex: 1 }}></span>
        <GoabButton type="secondary" size="compact" leadingIcon="download-outline">Download (all)</GoabButton>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Showing <strong>6</strong> of 26 statements</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-s)", color: "var(--goa-color-interactive-default)", fontWeight: 600 }}><ion-icon name="checkbox-outline"></ion-icon>2 selected · bulk download</span>
      </div>
      {/* table */}
      <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "36px 1.6fr 1fr 1.4fr 0.8fr 1fr 1fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", borderBottom: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)" }}>
          <div></div><div>Program</div><div>Processed</div><div>Claim period</div><div>Ref #</div><div style={{ textAlign: "right" }}>Amount</div><div style={{ textAlign: "right" }}>Download</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1.6fr 1fr 1.4fr 0.8fr 1fr 1fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-l)", borderBottom: i < rows.length - 1 ? "1px solid var(--goa-color-greyscale-100)" : "none", alignItems: "center", background: i < 2 ? "var(--goa-color-greyscale-50)" : "#fff" }}>
            <div><div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid var(--goa-color-greyscale-400)", background: i < 2 ? "var(--goa-color-interactive-default)" : "#fff", borderColor: i < 2 ? "var(--goa-color-interactive-default)" : "var(--goa-color-greyscale-400)", display: "flex", alignItems: "center", justifyContent: "center" }}>{i < 2 ? <ion-icon name="checkmark" style={{ color: "#fff", fontSize: 13 }}></ion-icon> : null}</div></div>
            <div><div style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{r.op}</div><div style={{ fontFamily: MONO, fontSize: 12, color: "var(--goa-color-text-secondary)" }}>{r.id}</div></div>
            <div style={{ font: "var(--goa-typography-body-s)" }}>{r.date}</div>
            <div>{kindTag(r.kind)}<div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", marginTop: 2 }}>{r.period.split(": ")[1]}</div></div>
            <div style={{ fontFamily: MONO, fontSize: 13, color: "var(--goa-color-interactive-default)" }}>{r.ref}</div>
            <div style={{ textAlign: "right" }}><Money v={r.amt} size={14} /></div>
            <div style={{ textAlign: "right", display: "flex", gap: 10, justifyContent: "flex-end", font: "var(--goa-typography-body-s)", fontWeight: 600 }}>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--goa-color-interactive-default)" }}>PDF</a>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--goa-color-interactive-default)" }}>XLS</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
window.ScreenPaymentLanding = ScreenPaymentLanding;

/* ============================ STAFF SCREENS ============================ */

const STAGES = ["QA Review", "Subsidy EO", "FDH EO", "ICC EO", "Funding Manager"];
function ReviewerStepper({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
      {STAGES.map((s, i) => {
        const done = i < current, cur = i === current;
        const c = done ? "var(--goa-color-status-success, #006f4c)" : cur ? "var(--goa-color-interactive-default)" : "var(--goa-color-greyscale-400)";
        return (
          <React.Fragment key={i}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, background: done || cur ? c : "#fff", border: `2px solid ${c}`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>
                {done ? <ion-icon name="checkmark" style={{ fontSize: 14 }}></ion-icon> : <span style={{ color: cur ? "#fff" : c }}>{i + 1}</span>}
              </div>
              <span style={{ font: "var(--goa-typography-body-s)", fontWeight: cur ? 700 : 500, color: cur ? "var(--goa-color-interactive-default)" : done ? "var(--goa-color-text-default)" : "var(--goa-color-text-secondary)" }}>{s}</span>
            </div>
            {i < STAGES.length - 1 ? <div style={{ width: 28, height: 2, margin: "0 10px", background: done ? "var(--goa-color-status-success, #006f4c)" : "var(--goa-color-greyscale-200)" }}></div> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const BATCH_CLAIMS = [
  { id: "CLM-48217", op: "Sunrise Childcare", fund: "Facility-Based", period: "Jun 2025", amt: 6402.00, adv: 6136.21, flags: ["mismatch"], watch: true, comments: 2 },
  { id: "CLM-48219", op: "Bright Beginnings", fund: "Facility-Based", period: "Jun 2025", amt: 4980.00, adv: 4980.00, flags: [], watch: false, comments: 0 },
  { id: "CLM-48224", op: "Prairie Kids FDH", fund: "FDH", period: "Jun 2025", amt: 3120.00, adv: 3120.00, flags: ["missing"], watch: false, comments: 1 },
  { id: "CLM-48231", op: "Maple Grove ICC", fund: "ICC", period: "Jun 2025", amt: 8890.00, adv: 7400.00, flags: ["mismatch", "pending"], watch: true, comments: 4 },
  { id: "CLM-48240", op: "Little Owls Daycare", fund: "Facility-Based", period: "Jun 2025", amt: 5240.00, adv: 5180.00, flags: [], watch: false, comments: 0 },
  { id: "CLM-48245", op: "Rocky Mtn Care", fund: "FDH", period: "Jun 2025", amt: 2760.00, adv: 0, flags: ["pending"], watch: false, comments: 0 },
];
function flagChip(f, key) {
  const label = { mismatch: "Advance mismatch", missing: "Missing hours", pending: "Adjustment pending" }[f];
  return <Flag key={key} type={f}>{label}</Flag>;
}

/* 5 — Claims Review · QA Reviewer (A: table + detail drawer) */
function ScreenClaimsQA() {
  const { GoabButton } = NS();
  const { CLKPIsFalse, ChipReview, ChipWatchlist, ChipHold } = window;
  const [sel, setSel] = React.useState("CLM-48217");
  const active = BATCH_CLAIMS.find((c) => c.id === sel) || BATCH_CLAIMS[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      {/* batch KPIs — real CL KPI tiles */}
      <div style={{ display: "flex", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
        <CLKPIsFalse text1="Claims in batch" text2="148" text3="Batch total" text4="$689,420" />
        <CLKPIsFalse text1="Flagged items" text2="9" text3="Advance mismatches" text4="4" />
        <CLKPIsFalse text1="Ready to advance" text2="135" text3="Awaiting data" text4="4" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-l)", flexWrap: "wrap", padding: "var(--goa-space-m) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)" }}>
        <ReviewerStepper current={0} />
        <span style={{ flex: 1 }}></span>
        <GoabButton type="tertiary" size="compact" leadingIcon="funnel-outline">Show flagged only</GoabButton>
        <GoabButton type="primary" size="compact" trailingIcon="arrow-forward">Approve &amp; send to Subsidy EO</GoabButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "var(--goa-space-l)", alignItems: "start" }}>
        {/* flagged claims list */}
        <SectionCard title="Flagged claims" desc="Facility-Based · FDH · ICC — this batch" pad="0">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {BATCH_CLAIMS.map((c, i) => (
              <button key={c.id} type="button" onClick={() => setSel(c.id)} style={{ textAlign: "left", cursor: "pointer", border: "none", background: c.id === sel ? "var(--goa-color-interactive-background, #e8f2fb)" : "#fff", borderLeft: c.id === sel ? "3px solid var(--goa-color-interactive-default)" : "3px solid transparent", borderBottom: "1px solid var(--goa-color-greyscale-100)", padding: "var(--goa-space-s) var(--goa-space-l)", display: "flex", flexDirection: "column", gap: 6, font: "inherit" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-s)" }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "var(--goa-color-interactive-default)" }}>{c.id}</span>
                  <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{c.op}</span>
                  {c.watch ? <ion-icon name="bookmark" style={{ fontSize: 14, color: "#5b4a9e" }}></ion-icon> : null}
                  <span style={{ flex: 1 }}></span>
                  <Money v={c.amt} size={14} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{c.fund} · {c.period}</span>
                  {c.flags.map((f, j) => flagChip(f, j))}
                  {c.comments > 0 ? <span style={{ display: "inline-flex", alignItems: "center", gap: 3, font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}><ion-icon name="chatbubble-outline" style={{ fontSize: 12 }}></ion-icon>{c.comments}</span> : null}
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* detail drawer */}
        <div style={{ position: "sticky", top: 0, background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", overflow: "hidden" }}>
          <div style={{ padding: "var(--goa-space-m) var(--goa-space-l)", borderBottom: "1px solid var(--goa-color-greyscale-200)", background: "var(--goa-color-greyscale-50)", display: "flex", alignItems: "center", gap: "var(--goa-space-s)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "var(--goa-color-interactive-default)" }}>{active.id}</div>
              <div style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>{active.op}</div>
            </div>
            <ion-icon name="bookmark-outline" style={{ fontSize: 20, color: "#5b4a9e" }}></ion-icon>
            <ion-icon name="close-outline" style={{ fontSize: 22, color: "var(--goa-color-text-secondary)" }}></ion-icon>
          </div>
          <div style={{ padding: "var(--goa-space-l)", display: "flex", flexDirection: "column", gap: "var(--goa-space-m)" }}>
            <div style={{ display: "flex", gap: "var(--goa-space-s)", font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>
              <span>{active.fund}</span><span>·</span><span>{active.period}</span>
            </div>
            {active.flags.length ? <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{active.flags.map((f, j) => flagChip(f, j))}</div> : null}
            {/* real status chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ChipReview property1="inactive" />
              <ChipWatchlist property1={active.watch ? "active" : "inactive"} />
              <ChipHold property1="inactive" />
            </div>
            {/* advance vs claim comparison */}
            <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}><span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Claim amount</span><Money v={active.amt} size={14} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}><span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Advance paid</span><Money v={active.adv} size={14} color="var(--goa-color-text-secondary)" /></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", background: active.amt - active.adv !== 0 ? "#fbeae8" : "#e4f1ea" }}><span style={{ font: "var(--goa-typography-body-s)", fontWeight: 700 }}>Variance</span><Money v={active.amt - active.adv} size={15} weight={700} color={active.amt - active.adv !== 0 ? "var(--goa-color-status-emergency, #da291c)" : "var(--goa-color-status-success, #006f4c)"} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--goa-space-s)" }}>
              <div style={{ padding: "var(--goa-space-s)", background: "var(--goa-color-greyscale-50)", borderRadius: 8 }}><div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Child hours</div><div style={{ fontFamily: MONO, fontWeight: 600 }}>1,284</div></div>
              <div style={{ padding: "var(--goa-space-s)", background: "var(--goa-color-greyscale-50)", borderRadius: 8 }}><div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Educator hours</div><div style={{ fontFamily: MONO, fontWeight: 600 }}>612</div></div>
            </div>
            <div style={{ display: "flex", gap: "var(--goa-space-s)", flexWrap: "wrap" }}>
              <GoabButton type="tertiary" size="compact" leadingIcon="bookmark-outline">Watchlist</GoabButton>
              <GoabButton type="tertiary" size="compact" leadingIcon="chatbubble-outline">Comment</GoabButton>
              <span style={{ flex: 1 }}></span>
              <GoabButton type="secondary" size="compact" leadingIcon="close-outline">Hold</GoabButton>
              <GoabButton type="primary" size="compact" leadingIcon="checkmark">Clear flag</GoabButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ScreenClaimsQA = ScreenClaimsQA;

/* 5B — QA Reviewer (data-viz forward variant) */
function ScreenClaimsQAB() {
  const { GoabButton } = NS();
  const { CLKPIsFalse, DataVisCharts } = window;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-l)", flexWrap: "wrap", padding: "var(--goa-space-m) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)" }}>
        <ReviewerStepper current={0} />
      </div>

      {/* Real components: KPI tiles + the actual Data Vis chart (advance-mismatch insight) */}
      <div style={{ display: "flex", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
        <CLKPIsFalse text1="Batch" text2="B-2025-0742" text3="Claims" text4="148" />
        <CLKPIsFalse text1="Batch total" text2="$689,420" text3="Advance recovered" text4="$612,300" />
        <CLKPIsFalse text1="Advance mismatches" text2="4 providers" text3="Net variance" text4="+$1,490" />
      </div>
      <SectionCard title="Payment vs advance — batch data vis" desc="Real Data Vis component · the top-left panel is the advance-mismatch insight">
        <div style={{ maxHeight: 430, overflow: "hidden" }}>
          <DataVisCharts type="fdh" text1="Payment / Advance Amounts" text2="Staff / Child Capacity" />
        </div>
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--goa-space-l)" }}>
        <SectionCard title="Batch health" desc="B-2025-0742 · 148 claims">
          <div style={{ display: "flex", gap: "var(--goa-space-l)", alignItems: "center" }}>
            {/* progress ring via conic-gradient */}
            <div style={{ width: 132, height: 132, borderRadius: 999, background: "conic-gradient(var(--goa-color-status-success,#006f4c) 0 91%, var(--goa-color-status-emergency,#da291c) 91% 97%, var(--goa-color-greyscale-200) 97% 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: 96, height: 96, borderRadius: 999, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ font: "var(--goa-typography-heading-m)", fontWeight: 700 }}>91%</div>
                <div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>clean</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-s)", flex: 1 }}>
              {[{ c: "var(--goa-color-status-success,#006f4c)", l: "Ready to advance", v: "135" }, { c: "var(--goa-color-status-emergency,#da291c)", l: "Flagged", v: "9" }, { c: "var(--goa-color-greyscale-300)", l: "Awaiting data", v: "4" }].map((x, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: x.c }}></span><span style={{ flex: 1, font: "var(--goa-typography-body-s)" }}>{x.l}</span><span style={{ fontFamily: MONO, fontWeight: 700 }}>{x.v}</span></div>
              ))}
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Flags by type">
          <BarList items={[
            { label: "Advance mismatch", v: 4, color: "var(--goa-color-status-emergency, #da291c)" },
            { label: "Missing hours", v: 3, color: "#e0a400" },
            { label: "Adjustment pending", v: 2, color: "var(--goa-color-status-info, #0077ad)" },
          ]} />
          <div style={{ marginTop: "var(--goa-space-m)", display: "flex", gap: "var(--goa-space-s)" }}>
            <GoabButton type="secondary" size="compact" leadingIcon="flag-outline">Review 9 flagged</GoabButton>
            <GoabButton type="primary" size="compact" trailingIcon="arrow-forward">Approve batch</GoabButton>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Funding-type breakdown" desc="Modular by vehicle — each independently reviewable">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--goa-space-m)" }}>
          {[{ n: "Facility-Based", c: 96, f: 5, a: 431200 }, { n: "FDH", c: 28, f: 2, a: 96800 }, { n: "ICC", c: 18, f: 2, a: 132400 }, { n: "OSC", c: 6, f: 0, a: 29020 }].map((m, i) => (
            <div key={i} style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 10, padding: "var(--goa-space-m)" }}>
              <div style={{ font: "var(--goa-typography-body-m)", fontWeight: 700 }}>{m.n}</div>
              <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, margin: "4px 0" }}>{money(m.a)}</div>
              <div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{m.c} claims{m.f ? <span style={{ color: "var(--goa-color-status-emergency, #da291c)", fontWeight: 600 }}> · {m.f} flagged</span> : " · clean"}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
window.ScreenClaimsQAB = ScreenClaimsQAB;

/* 6 — Claims Review · EO Reviewer (FDH focus) */
function ScreenClaimsEO() {
  const { GoabButton } = NS();
  const { ClaimHeader, CLKPIsFalse, ChipReview, ChipWatchlist, ChipHold, GoaButton,
    AccordionSubsidy, AccordionAffordability, AccordionWTU, AccordionInclusiveChildCare } = window;
  const modules = [{ n: "Facility-Based", done: true }, { n: "FDH", active: true }, { n: "ICC" }, { n: "OSC" }];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      <div style={{ padding: "var(--goa-space-m) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)" }}>
        <ReviewerStepper current={2} />
      </div>
      {/* module tabs — modular by funding vehicle */}
      <div style={{ display: "flex", gap: "var(--goa-space-2xs)", borderBottom: "2px solid var(--goa-color-greyscale-200)" }}>
        {modules.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "var(--goa-space-s) var(--goa-space-m)", marginBottom: -2, borderBottom: m.active ? "3px solid var(--goa-color-interactive-default)" : "3px solid transparent", color: m.active ? "var(--goa-color-interactive-default)" : "var(--goa-color-text-secondary)", font: "var(--goa-typography-body-m)", fontWeight: m.active ? 700 : 500, cursor: "pointer" }}>
            {m.done ? <ion-icon name="checkmark-circle" style={{ fontSize: 16, color: "var(--goa-color-status-success, #006f4c)" }}></ion-icon> : null}
            {m.n}{m.active ? <span style={{ fontFamily: MONO, fontSize: 12, background: "var(--goa-color-interactive-default)", color: "#fff", borderRadius: 999, padding: "0 7px" }}>28</span> : null}
          </div>
        ))}
      </div>

      <p style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", margin: 0 }}>
        <ion-icon name="arrow-back-outline" style={{ fontSize: 14, verticalAlign: "-2px" }}></ion-icon>&nbsp;FDH module · 27 of 28 cleared — reviewing the last flagged provider
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "var(--goa-space-l)", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)", minWidth: 0 }}>
          {/* Real component: Claim Header */}
          <ClaimHeader text1="Prairie Kids Family Day Home : 58000241" text2="Claim ID: 272224 · FDH" />

          {/* Real components: status chips */}
          <div style={{ display: "flex", gap: "var(--goa-space-s)", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)", marginRight: 4 }}>Status</span>
            <ChipReview property1="inactive" />
            <ChipWatchlist property1="active" />
            <ChipHold property1="inactive" />
          </div>

          {/* Real component: KPI tiles */}
          <div style={{ display: "flex", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
            <CLKPIsFalse text1="Claim period" text2="Jun 2025" text3="Received" text4="Jul 3, 2025" />
            <CLKPIsFalse text1="Advance paid" text2="$3,120.00" text3="Recovered" text4="against this claim" />
            <CLKPIsFalse text1="Flags" text2="Missing hours (1)" text3="Region" text4="Northwest" />
          </div>

          {/* Real components: funding module accordions */}
          <div>
            <div style={{ font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)", marginBottom: "var(--goa-space-s)" }}>Funding modules — modular per vehicle</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <AccordionSubsidy expand={false} text1="Subsidy" text2="Ready for release" text3="$1,356.00" />
              <AccordionAffordability expand={false} text1="Affordability Grant" text2="$1,856.00" text3="$1,856.00" />
              <AccordionWTU expand={false} text1="Wage Top-Up" text2="$2,123.00" />
              <AccordionInclusiveChildCare expand={false} text1="Inclusive Child Care" text2="Ready for release" text3="$567.56" />
            </div>
          </div>

          {/* Real components: buttons */}
          <div style={{ display: "flex", gap: "var(--goa-space-s)", flexWrap: "wrap", alignItems: "center" }}>
            <GoaButton type="tertiary" compact={true} enterText="Add to watchlist" />
            <span style={{ flex: 1 }}></span>
            <GoaButton type="secondary" compact={true} enterText="Place on hold" />
            <GoaButton type="primary" compact={true} enterText="Sign off & advance to ICC EO" />
          </div>
        </div>

        {/* cross-stage reviewer notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
          <SectionCard title="Reviewer notes" desc="Visible across all stages">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-m)" }}>
              {[{ who: "M. Chen · QA", when: "2d ago", txt: "Facility-Based cleared. FDH provider Prairie Kids missing educator hours — flagged for you." }, { who: "You · FDH EO", when: "now", txt: "Contacted provider; hours resubmitted and validated. Clearing flag." }].map((n, i) => (
                <div key={i} style={{ display: "flex", gap: "var(--goa-space-s)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--goa-color-greyscale-200)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, font: "var(--goa-typography-body-xs)", fontWeight: 700 }}>{n.who[0]}</div>
                  <div><div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{n.who} · {n.when}</div><div style={{ font: "var(--goa-typography-body-s)" }}>{n.txt}</div></div>
                </div>
              ))}
            </div>
          </SectionCard>
          <div style={{ background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", padding: "var(--goa-space-l)", display: "flex", flexDirection: "column", gap: "var(--goa-space-s)" }}>
            <div style={{ font: "var(--goa-typography-body-m)", fontWeight: 700 }}>Sign off FDH review</div>
            <div style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Clear this provider to complete <strong>28 of 28</strong> FDH claims. On sign-off the batch advances to <strong>ICC EO</strong>.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ScreenClaimsEO = ScreenClaimsEO;

/* 7 — Claims Review · Funding Manager (final release) */
function ScreenFundingManager() {
  const { GoabButton, GoabCallout } = NS();
  const signoffs = [
    { s: "QA Review", who: "Morgan Tessaro", when: "Jun 28, 09:12" },
    { s: "Subsidy EO", who: "Nina Harlow", when: "Jun 29, 14:40" },
    { s: "FDH EO", who: "Robin Vance", when: "Jun 30, 11:05" },
    { s: "ICC EO", who: "Kit Lorne", when: "Jun 30, 16:22" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      <div style={{ padding: "var(--goa-space-m) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)" }}>
        <ReviewerStepper current={4} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--goa-space-l)", alignItems: "start" }}>
        <SectionCard title="Batch summary" desc="B-2025-0742 · Facility-Based, FDH, ICC, OSC">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <FlowRow label="Gross claims" note="148 claims across 4 funding types" v={689420.00} />
            <FlowRow label="Claim advance recovery" note="Advances paid Jun 1 · recovered here" v={-612300.00} tone="danger" />
            <FlowRow label="Other recoveries" note="Overpayments · installments" v={-8940.00} tone="danger" />
            <div style={{ height: "var(--goa-space-2xs)" }}></div>
            <FlowRow label="Net release to 1GX" v={68180.00} strong tone="success" />
          </div>
        </SectionCard>
        <SectionCard title="Sign-off trail" desc="Sequential approvals — all stages complete">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {signoffs.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-s)", padding: "var(--goa-space-s) 0", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}>
                <ion-icon name="checkmark-circle" style={{ fontSize: 20, color: "var(--goa-color-status-success, #006f4c)" }}></ion-icon>
                <span style={{ flex: 1, font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{r.s}</span>
                <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>{r.who}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--goa-color-text-secondary)" }}>{r.when}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-s)", padding: "var(--goa-space-s) 0" }}>
              <div style={{ width: 20, height: 20, borderRadius: 999, border: "2px solid var(--goa-color-interactive-default)" }}></div>
              <span style={{ flex: 1, font: "var(--goa-typography-body-m)", fontWeight: 700, color: "var(--goa-color-interactive-default)" }}>Funding Manager</span>
              <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>You · pending</span>
            </div>
          </div>
        </SectionCard>
      </div>
      <GoabCallout type="information" size="medium" heading="Release schedule">
        Approved batches are released to 1GX every Tuesday and Friday. This batch will be included in the <strong>Tuesday, Jul 1</strong> disbursement.
      </GoabCallout>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-m)", padding: "var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ font: "var(--goa-typography-heading-s)", fontWeight: 700 }}>Approve &amp; release batch</div>
          <div style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Releases <strong>{money(68180.00)}</strong> net to 1GX. This action is final and logged.</div>
        </div>
        <GoabButton type="tertiary" size="compact">Return to ICC EO</GoabButton>
        <GoabButton type="primary" leadingIcon="rocket-outline">Approve &amp; release</GoabButton>
      </div>
    </div>
  );
}
window.ScreenFundingManager = ScreenFundingManager;

/* 8 — FinOps Payment List */
function ScreenFinOps() {
  const { GoabButton } = NS();
  const [tab, setTab] = React.useState(0);
  const [sel, setSel] = React.useState("PR-90142");
  const tabs = [{ n: "All", c: 342 }, { n: "Released to 1GX", c: 128 }, { n: "Paid", c: 196 }, { n: "Incidents", c: 5 }];
  const statusChip = (s) => {
    const map = { paid: { c: "var(--goa-color-status-success, #006f4c)", bg: "#e4f1ea", i: "checkmark-circle", t: "Paid" }, released: { c: "var(--goa-color-status-info, #0077ad)", bg: "#e6f2f8", i: "paper-plane", t: "Released to 1GX" }, incident: { c: "var(--goa-color-status-emergency, #da291c)", bg: "#fbeae8", i: "alert-circle", t: "Incident" }, queued: { c: "var(--goa-color-greyscale-700)", bg: "var(--goa-color-greyscale-100)", i: "time", t: "Queued" } };
    const x = map[s];
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, background: x.bg, color: x.c, font: "var(--goa-typography-body-xs)", fontWeight: 600, whiteSpace: "nowrap" }}><ion-icon name={x.i} style={{ fontSize: 13 }}></ion-icon>{x.t}</span>;
  };
  const pays = [
    { id: "PR-90142", src: "CCIS · Claims", prog: "Facility-Based", amt: 68180.00, status: "incident", date: "Jul 1", note: "Bank rejection · invalid account" },
    { id: "PR-90141", src: "CCIS · Claims", prog: "FDH", amt: 96800.00, status: "released", date: "Jul 1" },
    { id: "PR-90138", src: "CCIS · Grants", prog: "Wage Top-Up", amt: 21400.00, status: "paid", date: "Jun 27" },
    { id: "PR-90135", src: "Manual · One-time", prog: "Space Creation", amt: 15000.00, status: "paid", date: "Jun 27" },
    { id: "PR-90131", src: "CCIS · Claims", prog: "ICC", amt: 132400.00, status: "queued", date: "Jul 4" },
  ];
  const active = pays.find((p) => p.id === sel) || pays[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      {/* status tabs */}
      <div style={{ display: "flex", gap: "var(--goa-space-2xs)" }}>
        {tabs.map((t, i) => {
          const on = i === tab, inc = t.n === "Incidents";
          return (
            <button key={i} type="button" onClick={() => setTab(i)} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, padding: "var(--goa-space-s) var(--goa-space-m)", borderRadius: 999, border: on ? "1px solid var(--goa-color-interactive-default)" : "1px solid var(--goa-color-greyscale-200)", background: on ? "var(--goa-color-interactive-background, #e8f2fb)" : "#fff", color: on ? "var(--goa-color-interactive-default)" : "var(--goa-color-text-default)", font: "var(--goa-typography-body-s)", fontWeight: on ? 700 : 500 }}>
              {t.n}<span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, background: inc ? "var(--goa-color-status-emergency, #da291c)" : on ? "var(--goa-color-interactive-default)" : "var(--goa-color-greyscale-200)", color: inc || on ? "#fff" : "var(--goa-color-text-secondary)", borderRadius: 999, padding: "0 7px" }}>{t.c}</span>
            </button>
          );
        })}
        <span style={{ flex: 1 }}></span>
        <GoabButton type="tertiary" size="compact" leadingIcon="download-outline">Export CSV</GoabButton>
      </div>
      {/* filters */}
      <div style={{ display: "flex", gap: "var(--goa-space-s)", flexWrap: "wrap" }}>
        {["Payment source: All", "Program: All", "Status: Any", "Date: This week"].map((f, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, border: "1px solid var(--goa-color-greyscale-200)", background: "#fff", font: "var(--goa-typography-body-s)" }}>{f}<ion-icon name="chevron-down-outline" style={{ fontSize: 14, opacity: 0.6 }}></ion-icon></span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--goa-space-l)", alignItems: "start" }}>
        <SectionCard pad="0" title="Payment requests" desc="Status-first · all sources">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", borderBottom: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)" }}>
            <div>Request</div><div>Source · program</div><div style={{ textAlign: "right" }}>Amount</div><div>Status</div>
          </div>
          {pays.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setSel(p.id)} style={{ width: "100%", textAlign: "left", cursor: "pointer", font: "inherit", border: "none", display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr 1.2fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-l)", borderBottom: i < pays.length - 1 ? "1px solid var(--goa-color-greyscale-100)" : "none", alignItems: "center", background: p.id === sel ? "var(--goa-color-interactive-background, #e8f2fb)" : p.status === "incident" ? "#fdf6f5" : "#fff", borderLeft: p.id === sel ? "3px solid var(--goa-color-interactive-default)" : "3px solid transparent" }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "var(--goa-color-interactive-default)" }}>{p.id}</div>
              <div><div style={{ font: "var(--goa-typography-body-s)", fontWeight: 600 }}>{p.prog}</div><div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{p.src}</div></div>
              <div style={{ textAlign: "right" }}><Money v={p.amt} size={14} /></div>
              <div>{statusChip(p.status)}</div>
            </button>
          ))}
        </SectionCard>

        {/* payment detail — advance recovery visible */}
        <div style={{ position: "sticky", top: 0, background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", overflow: "hidden" }}>
          <div style={{ padding: "var(--goa-space-m) var(--goa-space-l)", borderBottom: "1px solid var(--goa-color-greyscale-200)", background: active.status === "incident" ? "#fbeae8" : "var(--goa-color-greyscale-50)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "var(--goa-color-interactive-default)" }}>{active.id}</span>
              <span style={{ flex: 1 }}></span>{statusChip(active.status)}
            </div>
            <div style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700, marginTop: 4 }}>{active.prog} · {active.src}</div>
          </div>
          <div style={{ padding: "var(--goa-space-l)", display: "flex", flexDirection: "column", gap: "var(--goa-space-m)" }}>
            {active.status === "incident" ? (
              <div style={{ display: "flex", gap: 8, padding: "var(--goa-space-s) var(--goa-space-m)", background: "#fbeae8", borderRadius: 8, border: "1px solid #f3c9c4" }}>
                <ion-icon name="alert-circle" style={{ fontSize: 20, color: "var(--goa-color-status-emergency, #da291c)", flexShrink: 0 }}></ion-icon>
                <div><div style={{ font: "var(--goa-typography-body-s)", fontWeight: 700, color: "var(--goa-color-status-emergency, #da291c)" }}>Bank rejection — invalid account</div><div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Recommended: verify banking details with operator, then re-queue for next run.</div></div>
              </div>
            ) : null}
            <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}><span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Gross claims</span><Money v={689420.00} size={14} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", borderBottom: "1px solid var(--goa-color-greyscale-100)", background: "#fdf6f5" }}><span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600, color: "var(--goa-color-status-emergency, #da291c)" }}>Claim advance recovery</span><Money v={-612300.00} size={14} color="var(--goa-color-status-emergency, #da291c)" /></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}><span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Other recoveries</span><Money v={-8940.00} size={14} color="var(--goa-color-text-secondary)" /></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", background: "var(--goa-color-greyscale-50)" }}><span style={{ font: "var(--goa-typography-body-m)", fontWeight: 700 }}>Net payment</span><Money v={68180.00} size={16} weight={700} color="var(--goa-color-status-success, #006f4c)" /></div>
            </div>
            <div style={{ display: "flex", gap: "var(--goa-space-s)" }}>
              <GoabButton type="secondary" size="compact" leadingIcon="document-text-outline">View log</GoabButton>
              <span style={{ flex: 1 }}></span>
              {active.status === "incident" ? <GoabButton type="primary" size="compact" leadingIcon="refresh-outline">Re-queue payment</GoabButton> : <GoabButton type="tertiary" size="compact" leadingIcon="open-outline">Open in 1GX</GoabButton>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ScreenFinOps = ScreenFinOps;

/* 9 — Watchlist & Comments Panel */
function ScreenWatchlist() {
  const { GoabButton } = NS();
  const { ClaimHeader, ChipWatchlist, CommentingNewMessage } = window;
  const [sel, setSel] = React.useState("CLM-48231");
  const saved = [
    { id: "CLM-48231", op: "Maple Grove ICC", ref: "272231", fund: "ICC", tags: ["Advance mismatch", "Follow-up"], amt: 8890.00, when: "2d", by: "Kit Lorne (ICC EO)", at: "Jun 30, 2025, 4:22 PM", msg: "Confirmed with program area — the +$1,490 variance is a legitimate new ICC allocation this quarter. Recovery will true up next month. Clearing." },
    { id: "CLM-48217", op: "Sunrise Childcare", ref: "272217", fund: "Facility-Based", tags: ["Advance mismatch"], amt: 6402.00, when: "2d", by: "Morgan Tessaro (QA)", at: "Jun 28, 2025, 9:12 AM", msg: "Advance mismatch of +$265 vs advance paid. Within tolerance but tagging so recovery is watched next cycle." },
    { id: "CLM-47980", op: "Northern Lights FDH", ref: "271980", fund: "FDH", tags: ["New provider"], amt: 2410.00, when: "1w", by: "Robin Vance (FDH EO)", at: "Jun 23, 2025, 2:05 PM", msg: "New provider — only 1 claim on record, so the advance is based on partial history. Watching until 3 claims accrue." },
    { id: "CLM-47905", op: "Chinook OSC", ref: "271905", fund: "OSC", tags: ["Adjustment"], amt: 1980.00, when: "1w", by: "Nina Harlow (Subsidy EO)", at: "Jun 22, 2025, 11:40 AM", msg: "Adjustment pending from a prior period — flagged so the recovery ledger reconciles once it posts." },
  ];
  const active = saved.find((s) => s.id === sel) || saved[0];
  const TagPill = ({ children, on }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, background: on ? "#eeeaf7" : "var(--goa-color-greyscale-100)", color: on ? "#5b4a9e" : "var(--goa-color-text-secondary)", font: "var(--goa-typography-body-xs)", fontWeight: 600 }}>{on ? <ion-icon name="pricetag" style={{ fontSize: 11 }}></ion-icon> : null}{children}</span>;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "var(--goa-space-l)", alignItems: "start" }}>
      <SectionCard title="Watchlist" desc="Tagged for follow-up · does not block batches" pad="0" actions={<span style={{ fontFamily: MONO, fontSize: 12, background: "var(--goa-color-greyscale-200)", borderRadius: 999, padding: "1px 8px", fontWeight: 700 }}>5</span>}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {saved.map((s, i) => (
            <button key={s.id} type="button" onClick={() => setSel(s.id)} style={{ textAlign: "left", cursor: "pointer", font: "inherit", border: "none", background: s.id === sel ? "var(--goa-color-interactive-background, #e8f2fb)" : "#fff", borderLeft: s.id === sel ? "3px solid var(--goa-color-interactive-default)" : "3px solid transparent", borderBottom: "1px solid var(--goa-color-greyscale-100)", padding: "var(--goa-space-s) var(--goa-space-l)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ion-icon name="bookmark" style={{ fontSize: 15, color: "#5b4a9e" }}></ion-icon>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "var(--goa-color-interactive-default)" }}>{s.id}</span>
                <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{s.op}</span>
                <span style={{ flex: 1 }}></span>
                <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{s.when}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 23 }}>{s.tags.map((t, j) => <TagPill key={j} on>{t}</TagPill>)}</div>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Real components: Claim Header + Watchlist chip + the real commenting panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)", minWidth: 0 }}>
        <ClaimHeader text1={active.op + " : 5800" + active.ref.slice(0, 4)} text2={"Claim ID: " + active.ref + " · " + active.fund} />
        <div style={{ display: "flex", gap: "var(--goa-space-s)", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)", marginRight: 2 }}>Tags:</span>
          <ChipWatchlist property1="active" />
          {active.tags.map((t, j) => <TagPill key={j} on>{t}</TagPill>)}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 9px", borderRadius: 999, border: "1px dashed var(--goa-color-greyscale-300)", color: "var(--goa-color-text-secondary)", font: "var(--goa-typography-body-xs)", cursor: "pointer" }}><ion-icon name="add" style={{ fontSize: 12 }}></ion-icon>Add tag</span>
        </div>
        <CommentingNewMessage text1="Comments" text2={active.by} text3={active.at} text4={active.msg} />
      </div>
    </div>
  );
}
window.ScreenWatchlist = ScreenWatchlist;

/* ==================== CLAIMS ADVANCE LIFECYCLE (discovery) ==================== */

const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

/* 10 — Advance Calculation Cycle (month-start, program area) */
const RUN_PROVIDERS = [
  { id: "800001101", op: "Sunrise Childcare", fund: "Facility-Based", last3: [6402.00, 6180.00, 5940.00], status: "ready" },
  { id: "800001237", op: "Little Learners Daycare", fund: "Facility-Based", last3: [6180.40, 5940.00, 6288.24], status: "ready" },
  { id: "800001188", op: "Bright Beginnings", fund: "Facility-Based", last3: [4980.00, 5020.00, 4900.00], status: "ready" },
  { id: "800002044", op: "Prairie Kids FDH", fund: "FDH", last3: [3120.00, 3080.00, 3160.00], status: "ready" },
  { id: "800003310", op: "Maple Grove ICC", fund: "ICC", last3: [8890.00, 7400.00, 7200.00], status: "review", flag: "Advance up 6% vs 3-month history — confirm before release" },
  { id: "800002090", op: "Northern Lights FDH", fund: "FDH", last3: [2410.00], status: "review", flag: "New provider · only 1 claim on record — advance based on partial history" },
  { id: "800001560", op: "Cedar Home Care", fund: "FDH", last3: [2980.00, 2960.00], status: "excluded", flag: "Exiting program Jul 31 — advance held pending final claim" },
];
function ScreenAdvanceRun() {
  const { GoabButton, GoabCallout } = NS();
  const [sel, setSel] = React.useState("800003310");
  const active = RUN_PROVIDERS.find((p) => p.id === sel) || RUN_PROVIDERS[0];
  const advOf = (p) => p.status === "excluded" ? 0 : avg(p.last3);
  const statusChip = (s) => s === "ready" ? <Flag type="ok">Ready</Flag>
    : s === "review" ? <Flag type="missing">Needs review</Flag>
    : <Flag type="pending">Held</Flag>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      <div style={{ display: "flex", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
        <Stat label="Providers in cycle" icon="business-outline">1,284</Stat>
        <Stat label="Total advance to pay" icon="cash-outline" tone="brand"><Money v={7428900.00} size={22} weight={700} /></Stat>
        <Stat label="Needs review" icon="alert-circle-outline" tone="danger" sub="Anomalies + partial history">12</Stat>
        <Stat label="Held / excluded" icon="pause-circle-outline" sub="Exiting or ineligible">6</Stat>
      </div>

      {/* cycle pipeline */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-l)", flexWrap: "wrap", padding: "var(--goa-space-m) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
          {[{ t: "Computed", s: "done" }, { t: "Review exceptions", s: "current" }, { t: "Release to FinOps", s: "todo" }, { t: "Advances paid Jul 1", s: "todo" }].map((st, i, arr) => {
            const c = st.s === "done" ? "var(--goa-color-status-success, #006f4c)" : st.s === "current" ? "var(--goa-color-interactive-default)" : "var(--goa-color-greyscale-400)";
            return (
              <React.Fragment key={i}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 999, background: st.s !== "todo" ? c : "#fff", border: `2px solid ${c}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "#fff" }}>{st.s === "done" ? <ion-icon name="checkmark" style={{ fontSize: 14 }}></ion-icon> : <span style={{ color: st.s === "current" ? "#fff" : c }}>{i + 1}</span>}</div>
                  <span style={{ font: "var(--goa-typography-body-s)", fontWeight: st.s === "current" ? 700 : 500, color: st.s === "current" ? "var(--goa-color-interactive-default)" : st.s === "done" ? "var(--goa-color-text-default)" : "var(--goa-color-text-secondary)" }}>{st.t}</span>
                </div>
                {i < arr.length - 1 ? <div style={{ width: 28, height: 2, margin: "0 10px", background: st.s === "done" ? "var(--goa-color-status-success, #006f4c)" : "var(--goa-color-greyscale-200)" }}></div> : null}
              </React.Fragment>
            );
          })}
        </div>
        <span style={{ flex: 1 }}></span>
        <GoabButton type="tertiary" size="compact" leadingIcon="funnel-outline">Show exceptions</GoabButton>
        <GoabButton type="primary" size="compact" trailingIcon="arrow-forward">Release cycle to FinOps</GoabButton>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: "var(--goa-space-l)", alignItems: "start" }}>
        <SectionCard title="Advance calculation" desc="advance = average of last 3 submitted claims · sample of 1,284" pad="0">
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1.1fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", borderBottom: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)" }}>
            <div>Provider</div><div>Last 3 claims</div><div style={{ textAlign: "right" }}>Advance</div><div>Status</div>
          </div>
          {RUN_PROVIDERS.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setSel(p.id)} style={{ width: "100%", textAlign: "left", cursor: "pointer", font: "inherit", border: "none", display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1.1fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-l)", borderBottom: i < RUN_PROVIDERS.length - 1 ? "1px solid var(--goa-color-greyscale-100)" : "none", alignItems: "center", background: p.id === sel ? "var(--goa-color-interactive-background, #e8f2fb)" : p.status !== "ready" ? "#fdfaf4" : "#fff", borderLeft: p.id === sel ? "3px solid var(--goa-color-interactive-default)" : "3px solid transparent" }}>
              <div><div style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{p.op}</div><div style={{ fontFamily: MONO, fontSize: 12, color: "var(--goa-color-text-secondary)" }}>{p.id} · {p.fund}</div></div>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 30 }}>
                {p.last3.map((v, j) => <div key={j} title={money(v)} style={{ width: 12, height: `${Math.round((v / 9000) * 30) + 6}px`, background: "var(--goa-color-brand-light, #7ec8e0)", borderRadius: 2 }}></div>)}
                {p.last3.length < 3 ? <span style={{ font: "var(--goa-typography-body-xs)", color: "#8a5a00", alignSelf: "center" }}>partial</span> : null}
              </div>
              <div style={{ textAlign: "right" }}>{p.status === "excluded" ? <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--goa-color-text-secondary)" }}>held</span> : <Money v={advOf(p)} size={14} weight={600} />}</div>
              <div>{statusChip(p.status)}</div>
            </button>
          ))}
        </SectionCard>

        <div style={{ position: "sticky", top: 0, background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", overflow: "hidden" }}>
          <div style={{ padding: "var(--goa-space-m) var(--goa-space-l)", borderBottom: "1px solid var(--goa-color-greyscale-200)", background: "var(--goa-color-greyscale-50)" }}>
            <div style={{ fontFamily: MONO, fontSize: 12, color: "var(--goa-color-text-secondary)" }}>{active.id} · {active.fund}</div>
            <div style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>{active.op}</div>
          </div>
          <div style={{ padding: "var(--goa-space-l)", display: "flex", flexDirection: "column", gap: "var(--goa-space-m)" }}>
            {active.flag ? (
              <div style={{ display: "flex", gap: 8, padding: "var(--goa-space-s) var(--goa-space-m)", background: active.status === "excluded" ? "#e6f2f8" : "#fdf3d7", borderRadius: 8 }}>
                <ion-icon name={active.status === "excluded" ? "pause-circle-outline" : "warning-outline"} style={{ fontSize: 20, color: active.status === "excluded" ? "var(--goa-color-status-info, #0077ad)" : "#8a5a00", flexShrink: 0 }}></ion-icon>
                <div style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-default)" }}>{active.flag}</div>
              </div>
            ) : null}
            <BarList items={active.last3.map((v, i) => ({ label: ["3 mo ago", "2 mo ago", "Last claim"].slice(-active.last3.length)[i], v, color: "var(--goa-color-brand-light, #7ec8e0)" }))} unit="$" />
            <div style={{ padding: "var(--goa-space-m)", background: "var(--goa-color-greyscale-50)", borderRadius: 8, fontFamily: MONO, fontSize: 13, lineHeight: 1.7, color: "var(--goa-color-text-default)" }}>
              {active.status === "excluded" ? <span>Advance held — no payment this cycle.</span> : <>({active.last3.map((v) => money(v)).join(" + ")}) ÷ {active.last3.length}<br />= <strong>{money(avg(active.last3))}</strong> advance</>}
            </div>
            <div style={{ display: "flex", gap: "var(--goa-space-s)" }}>
              {active.status === "review" ? <><GoabButton type="secondary" size="compact" leadingIcon="pause">Hold</GoabButton><span style={{ flex: 1 }}></span><GoabButton type="primary" size="compact" leadingIcon="checkmark">Approve advance</GoabButton></>
                : active.status === "excluded" ? <GoabButton type="secondary" size="compact" leadingIcon="refresh-outline">Reinstate advance</GoabButton>
                : <><ion-icon name="checkmark-circle" style={{ fontSize: 20, color: "var(--goa-color-status-success, #006f4c)" }}></ion-icon><span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Clean — auto-included in run</span></>}
            </div>
          </div>
        </div>
      </div>

      <GoabCallout type="information" size="medium" heading="This cycle is a payment source into FinOps">
        Once released, the advance cycle enters the FinOps payment factory as its own request — validated, queued and posted to 1GX like any other payment. Recovery happens later, when each provider's claim arrives.
      </GoabCallout>
    </div>
  );
}
window.ScreenAdvanceRun = ScreenAdvanceRun;

/* 11 — Advance Recovery & Exceptions */
const RECOVERY_EXC = [
  { id: "800002091", op: "Rocky Mtn Care", fund: "FDH", cat: "no-claim", advance: 5180.00, claim: null, note: "No June claim submitted — full advance now outstanding" },
  { id: "800001560", op: "Cedar Home Care", fund: "FDH", cat: "exited", advance: 2980.00, claim: null, note: "Provider exited program — recovery cannot net against a claim" },
  { id: "800002099", op: "Aspen Meadows FDH", fund: "FDH", cat: "drift", advance: 4200.00, claim: 3300.00, note: "3rd consecutive month claim below advance — chronic over-advance" },
  { id: "800001237", op: "Little Learners Daycare", fund: "Facility-Based", cat: "shortfall", advance: 6136.21, claim: 5980.00, note: "Claim slightly below advance — small balance carries forward" },
  { id: "800004120", op: "Chinook OSC", fund: "OSC", cat: "adjustment", advance: 1980.00, claim: 2140.00, note: "Adjustment pending on the claim — recovery on hold until it clears" },
];
const CAT_META = {
  "no-claim": { label: "No claim received", flag: "missing" },
  "exited": { label: "Provider exited", flag: "mismatch" },
  "drift": { label: "Repeated shortfall", flag: "mismatch" },
  "shortfall": { label: "Claim < advance", flag: "pending" },
  "adjustment": { label: "Adjustment pending", flag: "pending" },
};
function ScreenAdvanceRecovery() {
  const { GoabButton } = NS();
  const [sel, setSel] = React.useState("800002091");
  const active = RECOVERY_EXC.find((r) => r.id === sel) || RECOVERY_EXC[0];
  const recovered = active.claim == null ? 0 : Math.min(active.advance, active.claim);
  const outstanding = active.advance - recovered;
  const resolution = {
    "no-claim": { chip: "Flag as outstanding", note: "No claim to net against. Balance is tracked in the ledger; follow up with the provider.", actions: [["secondary", "mail-outline", "Contact provider"], ["primary", "flag-outline", "Flag outstanding"]] },
    "exited": { chip: "Manual recovery", note: "Provider has left the program. Route to Financial Operations for manual recovery.", actions: [["secondary", "document-text-outline", "View account"], ["primary", "cash-outline", "Start manual recovery"]] },
    "drift": { chip: "Carry + recalibrate", note: "Recover what the claim allows, carry the rest, and flag the advance for recalibration next cycle.", actions: [["secondary", "trending-down-outline", "View trend"], ["primary", "options-outline", "Recalibrate advance"]] },
    "shortfall": { chip: "Carry to next month", note: "Recover the claim amount now; the small remainder carries and clears against the next claim. No action needed by the provider.", actions: [["tertiary", "arrow-forward-outline", "Carry forward (default)"]] },
    "adjustment": { chip: "Hold", note: "An adjustment is pending on this claim. Hold recovery until the adjustment is assessed, then reconcile.", actions: [["secondary", "time-outline", "Keep on hold"], ["primary", "checkmark-outline", "Reconcile now"]] },
  }[active.cat];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      {/* trust split summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--goa-space-l)" }}>
        <div style={{ background: "var(--goa-color-status-success, #006f4c)", color: "#fff", borderRadius: "var(--goa-border-radius-xl, 12px)", padding: "var(--goa-space-l) var(--goa-space-xl)", display: "flex", alignItems: "center", gap: "var(--goa-space-xl)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ font: "var(--goa-typography-body-s)", opacity: 0.9, textTransform: "uppercase", letterSpacing: ".05em" }}>Reconciled &amp; cleared automatically</div>
            <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>1,204</div>
            <div style={{ font: "var(--goa-typography-body-s)", opacity: 0.9 }}>advances recovered in full against June claims · <Money v={6142880.00} color="#fff" /> · no review needed</div>
          </div>
          <ion-icon name="shield-checkmark-outline" style={{ fontSize: 64, opacity: 0.85 }}></ion-icon>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", padding: "var(--goa-space-l)", display: "flex", flexDirection: "column", gap: "var(--goa-space-s)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}><span style={{ fontFamily: MONO, fontSize: 34, fontWeight: 700, color: "var(--goa-color-status-emergency, #da291c)" }}>18</span><span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>need attention</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["No claim received", 7], ["Repeated shortfall", 4], ["Provider exited", 3], ["Adjustment pending", 4]].map((x, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, font: "var(--goa-typography-body-s)" }}><span style={{ flex: 1, color: "var(--goa-color-text-secondary)" }}>{x[0]}</span><span style={{ fontFamily: MONO, fontWeight: 700 }}>{x[1]}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--goa-space-l)", alignItems: "start" }}>
        <SectionCard title="Recovery exceptions" desc="Advances that did not fully recover against a June claim" pad="0">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {RECOVERY_EXC.map((r, i) => {
              const rec = r.claim == null ? 0 : Math.min(r.advance, r.claim);
              const out = r.advance - rec;
              return (
                <button key={r.id} type="button" onClick={() => setSel(r.id)} style={{ textAlign: "left", cursor: "pointer", font: "inherit", border: "none", background: r.id === sel ? "var(--goa-color-interactive-background, #e8f2fb)" : "#fff", borderLeft: r.id === sel ? "3px solid var(--goa-color-interactive-default)" : "3px solid transparent", borderBottom: i < RECOVERY_EXC.length - 1 ? "1px solid var(--goa-color-greyscale-100)" : "none", padding: "var(--goa-space-s) var(--goa-space-l)", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "var(--goa-color-interactive-default)" }}>{r.id}</span>
                    <span style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{r.op}</span>
                    <span style={{ flex: 1 }}></span>
                    <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>outstanding</span>
                    <Money v={out} size={14} weight={700} color={out > 0 ? "var(--goa-color-status-emergency, #da291c)" : "var(--goa-color-status-success, #006f4c)"} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Flag type={CAT_META[r.cat].flag}>{CAT_META[r.cat].label}</Flag>
                    <span style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{r.fund}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <div style={{ position: "sticky", top: 0, background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", overflow: "hidden" }}>
          <div style={{ padding: "var(--goa-space-m) var(--goa-space-l)", borderBottom: "1px solid var(--goa-color-greyscale-200)", background: "var(--goa-color-greyscale-50)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: MONO, fontSize: 12, color: "var(--goa-color-text-secondary)" }}>{active.id}</span><span style={{ flex: 1 }}></span><Flag type={CAT_META[active.cat].flag}>{CAT_META[active.cat].label}</Flag></div>
            <div style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700, marginTop: 4 }}>{active.op}</div>
          </div>
          <div style={{ padding: "var(--goa-space-l)", display: "flex", flexDirection: "column", gap: "var(--goa-space-m)" }}>
            <div style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>{active.note}</div>
            <div style={{ border: "1px solid var(--goa-color-greyscale-200)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}><span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Advance paid</span><Money v={active.advance} size={14} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}><span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>June claim</span>{active.claim == null ? <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600, color: "#8a5a00" }}>none received</span> : <Money v={active.claim} size={14} />}</div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", borderBottom: "1px solid var(--goa-color-greyscale-100)" }}><span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Recovered</span><Money v={recovered} size={14} color="var(--goa-color-status-success, #006f4c)" /></div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--goa-space-s) var(--goa-space-m)", background: outstanding > 0 ? "#fbeae8" : "#e4f1ea" }}><span style={{ font: "var(--goa-typography-body-m)", fontWeight: 700 }}>Outstanding</span><Money v={outstanding} size={16} weight={700} color={outstanding > 0 ? "var(--goa-color-status-emergency, #da291c)" : "var(--goa-color-status-success, #006f4c)"} /></div>
            </div>
            <div style={{ padding: "var(--goa-space-s) var(--goa-space-m)", background: "var(--goa-color-greyscale-50)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <ion-icon name="arrow-redo-outline" style={{ fontSize: 16, color: "var(--goa-color-interactive-default)" }}></ion-icon>
              <span style={{ font: "var(--goa-typography-body-s)", fontWeight: 600 }}>Recommended: {resolution.chip}</span>
            </div>
            <div style={{ display: "flex", gap: "var(--goa-space-s)", flexWrap: "wrap" }}>
              {resolution.actions.map((a, i) => (<React.Fragment key={i}>{i === resolution.actions.length - 1 && resolution.actions.length > 1 ? <span style={{ flex: 1 }}></span> : null}<GoabButton type={a[0]} size="compact" leadingIcon={a[1]}>{a[2]}</GoabButton></React.Fragment>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ScreenAdvanceRecovery = ScreenAdvanceRecovery;

/* 12 — Advance Ledger / Provider account */
const LEDGER = [
  { id: "800002091", op: "Rocky Mtn Care", fund: "FDH", status: "outstanding", hist: [{ m: "Feb", adv: 5180, rec: 5180 }, { m: "Mar", adv: 5180, rec: 5180 }, { m: "Apr", adv: 5180, rec: 5180 }, { m: "May", adv: 5180, rec: 5180 }, { m: "Jun", adv: 5180, rec: 0 }] },
  { id: "800001560", op: "Cedar Home Care", fund: "FDH", status: "recovery", hist: [{ m: "Mar", adv: 2960, rec: 2960 }, { m: "Apr", adv: 2980, rec: 2980 }, { m: "May", adv: 2980, rec: 2980 }, { m: "Jun", adv: 2980, rec: 0 }] },
  { id: "800002099", op: "Aspen Meadows FDH", fund: "FDH", status: "watch", hist: [{ m: "Mar", adv: 4500, rec: 4500 }, { m: "Apr", adv: 4400, rec: 4100 }, { m: "May", adv: 4300, rec: 4000 }, { m: "Jun", adv: 4200, rec: 3300 }] },
  { id: "800001237", op: "Little Learners Daycare", fund: "Facility-Based", status: "current", hist: [{ m: "Feb", adv: 6042, rec: 6042 }, { m: "Mar", adv: 5810, rec: 5810 }, { m: "Apr", adv: 5900, rec: 5900 }, { m: "May", adv: 6042, rec: 6042 }, { m: "Jun", adv: 6136.21, rec: 5980 }] },
  { id: "800001101", op: "Sunrise Childcare", fund: "Facility-Based", status: "clear", hist: [{ m: "Mar", adv: 6174, rec: 6174 }, { m: "Apr", adv: 6174, rec: 6174 }, { m: "May", adv: 6174, rec: 6174 }, { m: "Jun", adv: 6174, rec: 6174 }] },
];
const sumIssued = (h) => h.reduce((a, b) => a + b.adv, 0);
const sumRec = (h) => h.reduce((a, b) => a + b.rec, 0);
function ScreenAdvanceLedger() {
  const { GoabButton } = NS();
  const [sel, setSel] = React.useState("800002091");
  const active = LEDGER.find((l) => l.id === sel) || LEDGER[0];
  const issued = sumIssued(active.hist), recovered = sumRec(active.hist), outstanding = issued - recovered;
  const statusChip = (s) => s === "clear" ? <Flag type="ok">Cleared</Flag>
    : s === "current" ? <Flag type="pending">Carry balance</Flag>
    : s === "watch" ? <Flag type="watch">Watch</Flag>
    : s === "recovery" ? <Flag type="mismatch">Manual recovery</Flag>
    : <Flag type="missing">Outstanding</Flag>;
  let running = 0;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "var(--goa-space-l)", alignItems: "start" }}>
      <SectionCard title="Advance ledger" desc="Running advance balance per provider · shared by program area and operators" pad="0">
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-l)", background: "var(--goa-color-greyscale-50)", borderBottom: "1px solid var(--goa-color-greyscale-200)", font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)" }}>
          <div>Provider</div><div style={{ textAlign: "right" }}>Outstanding</div>
        </div>
        {LEDGER.map((l, i) => {
          const out = sumIssued(l.hist) - sumRec(l.hist);
          return (
            <button key={l.id} type="button" onClick={() => setSel(l.id)} style={{ width: "100%", textAlign: "left", cursor: "pointer", font: "inherit", border: "none", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) var(--goa-space-l)", borderBottom: i < LEDGER.length - 1 ? "1px solid var(--goa-color-greyscale-100)" : "none", alignItems: "center", background: l.id === sel ? "var(--goa-color-interactive-background, #e8f2fb)" : "#fff", borderLeft: l.id === sel ? "3px solid var(--goa-color-interactive-default)" : "3px solid transparent" }}>
              <div><div style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{l.op}</div><div style={{ marginTop: 3 }}>{statusChip(l.status)}</div></div>
              <div style={{ textAlign: "right" }}><Money v={out} size={15} weight={700} color={out > 0.5 ? "var(--goa-color-status-emergency, #da291c)" : "var(--goa-color-status-success, #006f4c)"} /></div>
            </button>
          );
        })}
      </SectionCard>

      <div style={{ background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", overflow: "hidden" }}>
        <div style={{ padding: "var(--goa-space-m) var(--goa-space-l)", borderBottom: "1px solid var(--goa-color-greyscale-200)", background: "var(--goa-color-greyscale-50)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1 }}><div style={{ fontFamily: MONO, fontSize: 12, color: "var(--goa-color-text-secondary)" }}>{active.id} · {active.fund}</div><div style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700 }}>{active.op}</div></div>
          <GoabButton type="tertiary" size="compact" leadingIcon="download-outline">Statement</GoabButton>
        </div>
        <div style={{ padding: "var(--goa-space-l)", display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
          <div style={{ display: "flex", gap: "var(--goa-space-m)" }}>
            {[["Issued (YTD)", issued, "var(--goa-color-text-default)"], ["Recovered", recovered, "var(--goa-color-status-success, #006f4c)"], ["Outstanding", outstanding, outstanding > 0.5 ? "var(--goa-color-status-emergency, #da291c)" : "var(--goa-color-status-success, #006f4c)"]].map((t, i) => (
              <div key={i} style={{ flex: 1, padding: "var(--goa-space-m)", background: "var(--goa-color-greyscale-50)", borderRadius: 8 }}><div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{t[0]}</div><Money v={t[1]} size={18} weight={700} color={t[2]} /></div>
            ))}
          </div>
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--goa-space-m)", padding: "0 0 var(--goa-space-xs)", font: "var(--goa-typography-body-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--goa-color-text-secondary)", borderBottom: "2px solid var(--goa-color-greyscale-200)" }}>
              <div>Month</div><div style={{ textAlign: "right" }}>Advance</div><div style={{ textAlign: "right" }}>Recovered</div><div style={{ textAlign: "right" }}>Running</div>
            </div>
            {active.hist.map((h, i) => {
              running += h.adv - h.rec;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "var(--goa-space-m)", padding: "var(--goa-space-s) 0", borderBottom: "1px solid var(--goa-color-greyscale-100)", alignItems: "center", font: "var(--goa-typography-body-m)" }}>
                  <div style={{ fontWeight: 600 }}>{h.m} 2025</div>
                  <div style={{ textAlign: "right" }}><Money v={h.adv} size={13} weight={500} color="var(--goa-color-text-secondary)" /></div>
                  <div style={{ textAlign: "right" }}>{h.rec === 0 ? <span style={{ fontFamily: MONO, fontSize: 13, color: "#8a5a00" }}>—</span> : <Money v={h.rec} size={13} weight={500} />}</div>
                  <div style={{ textAlign: "right" }}><Money v={running} size={13} weight={700} color={running > 0.5 ? "var(--goa-color-status-emergency, #da291c)" : "var(--goa-color-text-secondary)"} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
window.ScreenAdvanceLedger = ScreenAdvanceLedger;

/* 13 — Advance Intelligence (future-state: predictive + exception-only) */
function Sparkbars({ series, danger }) {
  const hi = Math.max(...series, 1);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 34 }}>
      {series.map((v, i) => <div key={i} style={{ width: 10, height: `${Math.max(Math.round((v / hi) * 34), 3)}px`, background: v === 0 ? "var(--goa-color-greyscale-300)" : i === series.length - 1 && danger ? "var(--goa-color-status-emergency, #da291c)" : "var(--goa-color-brand-default, #0081a2)", borderRadius: 2 }}></div>)}
    </div>
  );
}
function ScreenAdvanceIntelligence() {
  const { GoabButton } = NS();
  const atRisk = [
    { op: "Aspen Meadows FDH", trend: [4500, 4400, 4300, 4200, 3300], advance: 4200, projected: 3600, note: "Claims down 27% over 4 months", rec: "Recalibrate advance to $3,600" },
    { op: "Rocky Mtn Care", trend: [5180, 5180, 5180, 0, 0], advance: 5180, projected: 0, note: "No claim submitted 2 months running", rec: "Suspend advance until claims resume" },
    { op: "Chinook OSC", trend: [2100, 2050, 1980, 1900, 1820], advance: 1980, projected: 1780, note: "Steady seasonal decline", rec: "Reduce advance to $1,800" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--goa-space-l)" }}>
      {/* vision band */}
      <div style={{ background: "var(--goa-color-brand-dark, #005072)", color: "#fff", borderRadius: "var(--goa-border-radius-xl, 12px)", padding: "var(--goa-space-xl)", display: "flex", gap: "var(--goa-space-xl)", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", borderRadius: 999, padding: "3px 12px", font: "var(--goa-typography-body-xs)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 12 }}><ion-icon name="sparkles-outline"></ion-icon>Future state · vision</span>
          <h2 style={{ font: "var(--goa-typography-heading-l)", margin: "0 0 6px", letterSpacing: "-0.01em", color: "#fff" }}>Trust-based advances</h2>
          <p style={{ font: "var(--goa-typography-body-m)", opacity: 0.92, margin: 0, maxWidth: 620 }}>The system clears every advance that reconciles cleanly and surfaces only what needs a person. Reviewers manage exceptions and forecast risk — not routine recoveries.</p>
        </div>
        <div style={{ display: "flex", gap: "var(--goa-space-xl)" }}>
          <div><div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700 }}>98.5%</div><div style={{ font: "var(--goa-typography-body-s)", opacity: 0.85 }}>cleared automatically</div></div>
          <div><div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 700 }}>18</div><div style={{ font: "var(--goa-typography-body-s)", opacity: 0.85 }}>routed to a human</div></div>
        </div>
      </div>

      {/* exception-only bar */}
      <SectionCard title="Where human attention goes" desc="1,222 advances this cycle — the system decides what a person sees">
        <div style={{ display: "flex", height: 26, borderRadius: 999, overflow: "hidden", marginBottom: "var(--goa-space-m)" }}>
          <div style={{ width: "98.5%", background: "var(--goa-color-status-success, #006f4c)" }}></div>
          <div style={{ width: "1.5%", background: "var(--goa-color-status-emergency, #da291c)" }}></div>
        </div>
        <div style={{ display: "flex", gap: "var(--goa-space-xl)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--goa-color-status-success, #006f4c)" }}></span><span style={{ font: "var(--goa-typography-body-s)" }}><strong>1,204 auto-cleared</strong> — advance recovered in full against the claim</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--goa-color-status-emergency, #da291c)" }}></span><span style={{ font: "var(--goa-typography-body-s)" }}><strong>18 flagged</strong> — no claim, drift, exit or pending adjustment</span></div>
        </div>
      </SectionCard>

      {/* predictive drift */}
      <SectionCard title="Predicted over-advance" desc="Providers whose claims are trending below their advance — recalibrate before a mismatch happens" actions={<GoabButton type="tertiary" size="compact" trailingIcon="arrow-forward">View all 9</GoabButton>}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {atRisk.map((r, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr auto 1fr 1.4fr auto", gap: "var(--goa-space-l)", alignItems: "center", padding: "var(--goa-space-m) 0", borderBottom: i < atRisk.length - 1 ? "1px solid var(--goa-color-greyscale-100)" : "none" }}>
              <div><div style={{ font: "var(--goa-typography-body-m)", fontWeight: 600 }}>{r.op}</div><div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>{r.note}</div></div>
              <Sparkbars series={r.trend} danger />
              <div><div style={{ font: "var(--goa-typography-body-xs)", color: "var(--goa-color-text-secondary)" }}>Advance → projected</div><div style={{ display: "flex", alignItems: "center", gap: 6 }}><Money v={r.advance} size={14} color="var(--goa-color-text-secondary)" /><ion-icon name="arrow-forward" style={{ fontSize: 13, color: "var(--goa-color-status-emergency, #da291c)" }}></ion-icon><Money v={r.projected} size={14} weight={700} color="var(--goa-color-status-emergency, #da291c)" /></div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, font: "var(--goa-typography-body-s)", color: "var(--goa-color-interactive-default)", fontWeight: 600 }}><ion-icon name="bulb-outline"></ion-icon>{r.rec}</div>
              <GoabButton type="secondary" size="compact">Apply</GoabButton>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* foundational-model note */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--goa-space-l)" }}>
        <div style={{ background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", padding: "var(--goa-space-l)", display: "flex", gap: "var(--goa-space-m)" }}>
          <ion-icon name="cube-outline" style={{ fontSize: 26, color: "var(--goa-color-brand-default, #0081a2)", flexShrink: 0 }}></ion-icon>
          <div><div style={{ font: "var(--goa-typography-body-m)", fontWeight: 700, marginBottom: 4 }}>Advance as a reusable recovery module</div><div style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Calculate → recover → reconcile is one pluggable primitive in FinOps. Any funding type that issues advances reuses it — new vehicles plug in without rework.</div></div>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--goa-color-greyscale-200)", borderRadius: "var(--goa-border-radius-xl, 12px)", padding: "var(--goa-space-l)", display: "flex", gap: "var(--goa-space-m)" }}>
          <ion-icon name="people-outline" style={{ fontSize: 26, color: "var(--goa-color-brand-default, #0081a2)", flexShrink: 0 }}></ion-icon>
          <div><div style={{ font: "var(--goa-typography-body-m)", fontWeight: 700, marginBottom: 4 }}>Payee as a variable</div><div style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>Advances flow to operators today. The same model extends to paying families or educators directly — the recipient becomes a parameter, not a rebuild.</div></div>
        </div>
      </div>
    </div>
  );
}
window.ScreenAdvanceIntelligence = ScreenAdvanceIntelligence;
