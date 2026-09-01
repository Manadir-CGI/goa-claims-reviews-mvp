/* Operator-facing CCLP chrome — reused by all external (childcare operator)
   screens. Reproduces the real Payment Summary reference: a beta microsite
   strip, the Alberta wordmark app header with the service name + signed-in
   user, and a light left navigation with the Claims group expanded.
   Mounted via <x-import>; screen body passed as children. */

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

const OP_NAV = [
  { label: "My Account", icon: "person-outline" },
  { label: "Affordability Grants", icon: "wallet-outline" },
  { label: "Licensing", icon: "ribbon-outline" },
  { label: "Space Creation", icon: "add-circle-outline", chevron: true },
  { label: "Wage Top-Up & PD", icon: "trending-up-outline", badge: "New" },
  {
    label: "Claims", icon: "documents-outline", group: true,
    children: [
      { label: "Dashboard", key: "dashboard" },
      { label: "Claim advances", key: "advances" },
      { label: "Payment statements", key: "statements" },
      { label: "Claims history", key: "history" },
    ],
  },
  { label: "Staff Management", icon: "people-outline" },
];

function NavRow({ item, current }) {
  const active = item.group && item.children && item.children.some((c) => c.key === current);
  return (
    <div>
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--goa-space-s)",
        height: 48, padding: "0 var(--goa-space-l)", cursor: "pointer",
        font: "var(--goa-typography-body-m)", color: "var(--goa-color-text-default)",
        background: active ? "var(--goa-color-interactive-background, #e8f2fb)" : "transparent",
        fontWeight: active ? 600 : 400,
      }}>
        <ion-icon name={item.icon} style={{ fontSize: 20, color: "var(--goa-color-text-secondary)", flexShrink: 0 }}></ion-icon>
        <span style={{ flex: 1, whiteSpace: "nowrap" }}>{item.label}</span>
        {item.badge ? (
          <span style={{ font: "var(--goa-typography-body-xs)", fontWeight: 600, color: "#fff", background: "var(--goa-color-status-success, #006f4c)", borderRadius: "var(--goa-border-radius-s, 6px)", padding: "1px 8px" }}>{item.badge}</span>
        ) : null}
        {item.chevron ? <ion-icon name="chevron-forward-outline" style={{ fontSize: 16, color: "var(--goa-color-text-secondary)" }}></ion-icon> : null}
        {item.group ? <ion-icon name={active ? "chevron-down-outline" : "chevron-forward-outline"} style={{ fontSize: 16, color: "var(--goa-color-text-secondary)" }}></ion-icon> : null}
      </div>
      {item.group && active ? (
        <div>
          {item.children.map((c) => {
            const on = c.key === current;
            return (
              <div key={c.key} style={{
                display: "flex", alignItems: "center", height: 44,
                padding: "0 var(--goa-space-l) 0 52px", cursor: "pointer",
                font: "var(--goa-typography-body-m)",
                color: on ? "var(--goa-color-interactive-default)" : "var(--goa-color-text-default)",
                fontWeight: on ? 600 : 400,
                borderLeft: on ? "3px solid var(--goa-color-interactive-default)" : "3px solid transparent",
                background: on ? "var(--goa-color-greyscale-50)" : "transparent",
              }}>{c.label}</div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function OperatorChrome({ current = "dashboard", operator = "Little Learners Daycare", operatorId = "800001237", children }) {
  const { GoabMicrositeHeader } = NS();
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    if (NS().GoabMicrositeHeader) return undefined;
    return whenReady(() => !!NS().GoabMicrositeHeader, force);
  }, []);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", background: "var(--goa-color-greyscale-white)", fontFamily: "var(--goa-font-family-sans)" }}>
      {/* Beta microsite strip */}
      <div style={{ background: "var(--goa-color-greyscale-100)", borderBottom: "1px solid var(--goa-color-greyscale-200)", padding: "6px var(--goa-space-xl)", display: "flex", alignItems: "center", gap: "var(--goa-space-s)", flexShrink: 0 }}>
        <span style={{ background: "var(--goa-color-brand-default, #0081a2)", color: "#fff", font: "var(--goa-typography-body-xs)", fontWeight: 700, letterSpacing: ".04em", padding: "2px 8px", borderRadius: "var(--goa-border-radius-s, 6px)" }}>BETA</span>
        <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)" }}>This is a new Alberta Government service — <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--goa-color-interactive-default)" }}>help us improve it</a>.</span>
      </div>
      {/* App header — Alberta wordmark + service name + user */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-l)", padding: "var(--goa-space-m) var(--goa-space-xl)", borderBottom: "1px solid var(--goa-color-greyscale-200)", flexShrink: 0 }}>
        <img src="goa-logo.svg" alt="Government of Alberta" style={{ height: 32 }} />
        <span style={{ font: "var(--goa-typography-heading-xs)", fontWeight: 700, color: "var(--goa-color-text-default)" }}>Child Care Licensing Portal</span>
        <span style={{ flex: 1 }}></span>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-2xs)", color: "var(--goa-color-text-default)", font: "var(--goa-typography-body-m)" }}>
          <ion-icon name="person-circle-outline" style={{ fontSize: 26, color: "var(--goa-color-text-secondary)" }}></ion-icon>
          <span>Sarah Tale</span>
          <ion-icon name="chevron-down-outline" style={{ fontSize: 16 }}></ion-icon>
        </div>
      </div>
      {/* Body: left nav + content */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <nav style={{ width: 280, flexShrink: 0, borderRight: "1px solid var(--goa-color-greyscale-200)", background: "var(--goa-color-greyscale-white)", padding: "var(--goa-space-m) 0" }}>
          {OP_NAV.map((it, i) => <NavRow key={i} item={it} current={current} />)}
        </nav>
        <main style={{ flex: 1, minWidth: 0, background: "var(--goa-color-greyscale-white)" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "var(--goa-space-xl) var(--goa-space-2xl) var(--goa-space-2xl)" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

window.OperatorChrome = OperatorChrome;
