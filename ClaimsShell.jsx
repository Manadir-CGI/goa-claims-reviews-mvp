/* Claims workspace shell — re-imported fresh from the design system's
   GoA Workspace template (templates/workspace/WorkspaceShell.jsx), which is
   modelled on GovAlta/goa-workspace-playground. Caller supplies navCurrent,
   menuVariant, page title/subtitle, user and optional header actions; the
   GoabWorkspaceLayout + GoabWorkSideMenu composition is the template's,
   unchanged. Icon names verified against ionicons-offline.js. */

const NS = () => window.GovernmentOfAlbertaDesignSystem_eddb08 || {};
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


function ClaimsShell({ navCurrent = "#review", menuVariant, watchMenu, pageTitle = "Claims review", pageSubtitle = "", userName = "Robin Vance", userEmail = "dana.okafor@gov.ab.ca", reviewBadge = 12, watchBadge = 5, actions, children }) {
  const {
    GoabWorkspaceLayout, GoabWorkSideMenu, GoabWorkSideMenuItem, GoabWorkSideMenuSubItem,
  } = NS();

  const [current, setCurrent] = React.useState(navCurrent);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrollState, setScrollState] = React.useState("at-top");

  // Bundle loads async — poll until the namespace is populated (template pattern).
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    if (NS().GoabWorkspaceLayout) return undefined;
    return whenReady(() => !!NS().GoabWorkspaceLayout, force);
  }, []);
  React.useEffect(() => { setCurrent(navCurrent); }, [navCurrent]);

  if (!GoabWorkspaceLayout) {
    return <p style={{ padding: 24, fontFamily: "sans-serif" }}>Workspace layout loads after the bundle compiles.</p>;
  }

  const headerCollapsed = scrollState === "middle" || scrollState === "at-bottom";
  const nav = (path) => { if (path && path !== "/" && path !== "#logout") setCurrent(path); };
  const mark = (label, url, item) => Object.assign({ label, url, current: url === current, onNavigate: nav }, item);

  // Icons below all exist in ionicons-offline.js (verified).
  const sub = (label, url) => <GoabWorkSideMenuSubItem key={url} label={label} url={url} onNavigate={nav} current={url === current} />;
  const primaryContent = menuVariant === "figma" ? [
    /* Program-area sections (Certification · Licensing · Affordability Grants · Space Creation ·
       Wage Top-Up · Subsidy) removed at the user's request — this prototype is Claims-only, so the
       other program areas were noise in the rail. */
    <GoabWorkSideMenuItem key="claims" {...mark("Claims", "#claims", { icon: "documents-outline", badge: reviewBadge, current: current.indexOf("#claims") === 0 })}>
      {menuOpen ? [
        sub("Claims reviews", "#claims/reviews"),
        sub("Claims summary", "#claims/summary"),
        sub("Child participation", "#claims/child"),
        sub("Educator participation", "#claims/educators"),
        sub("Error report", "#claims/errors"),
        sub("Claims adjustments", "#claims/adjustments"),
      ] : null}
    </GoabWorkSideMenuItem>,
  ] : menuVariant === "review" ? [
    <GoabWorkSideMenuItem key="qa" {...mark("QA queue", "#qa", { icon: "checkmark-done-outline", badge: reviewBadge })} />,
    <GoabWorkSideMenuItem key="sub" {...mark("Subsidy queue", "#subsidy", { icon: "wallet-outline", badge: 38 })} />,
    <GoabWorkSideMenuItem key="fdh" {...mark("FDH queue", "#fdh", { icon: "people-outline", badge: 12 })} />,
    <GoabWorkSideMenuItem key="icc" {...mark("ICC queue", "#icc", { icon: "ribbon-outline", badge: 9 })} />,
    <GoabWorkSideMenuItem key="rel" {...mark("Release", "#release", { icon: "paper-plane" })} />,
  ] : [
    <GoabWorkSideMenuItem key="review" {...mark("Claims review", "#review", { icon: "checkmark-done-outline", badge: reviewBadge })} />,
    <GoabWorkSideMenuItem key="adv" {...mark("Claim advances", "#advances", { icon: "arrow-up-circle-outline" })} />,
    <GoabWorkSideMenuItem key="pay" {...mark("Payments", "#payments", { icon: "card-outline" })} />,
  ];
  const secondaryContent = menuVariant === "figma" ? (watchMenu ? [
    <GoabWorkSideMenuItem key="watch" {...mark("Watchlist", "#watchlist", { icon: "bookmark-outline", badge: watchBadge, type: "important" })} />,
    <GoabWorkSideMenuItem key="rechk" {...mark("Re-checks due", "#recheck", { icon: "time-outline", badge: 4, type: "important" })} />,
  ] : []) : menuVariant === "review" ? [
    <GoabWorkSideMenuItem key="watch" {...mark("Watchlist", "#watchlist", { icon: "bookmark-outline", badge: watchBadge, type: "important" })} />,
    <GoabWorkSideMenuItem key="rechk" {...mark("Re-checks due", "#recheck", { icon: "time-outline", badge: 4, type: "important" })} />,
  ] : [
    <GoabWorkSideMenuItem key="watch" {...mark("Watchlist", "#watchlist", { icon: "bookmark-outline", badge: watchBadge, type: "important" })} />,
  ];
  const accountContent = [
    <GoabWorkSideMenuItem key="out" {...mark("Log out", "#logout", { icon: "log-out-outline" })} />,
  ];

  const sideMenu = (
    <GoabWorkSideMenu
      heading="Early Childhood Development System"
      url="/"
      open={menuOpen}
      userName={userName}
      userSecondaryText={userEmail}
      primaryContent={primaryContent}
      secondaryContent={secondaryContent}
      accountContent={accountContent}
      onNavigate={nav}
      onToggle={() => setMenuOpen((o) => !o)}
    />
  );

  const pageHeader = (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-m)", flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ font: headerCollapsed ? "var(--goa-typography-heading-s)" : "var(--goa-typography-heading-l)", margin: 0, transition: "font-size .15s ease-out" }}>{pageTitle}</h1>
        {headerCollapsed || !pageSubtitle ? null : <p style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", margin: "var(--goa-space-3xs) 0 0" }}>{pageSubtitle}</p>}
      </div>
      <span style={{ flex: 1, minWidth: "var(--goa-space-m)" }}></span>
      {/* cc-1 (user 2026-08-25) — the header's action section. Always rendered, even with no
         `actions` prop, because QAQueueScreen portals the Pattern analyzer button into it. */}
      <div data-wl-actions style={{ display: "flex", alignItems: "center", gap: "var(--goa-space-s)", flexWrap: "wrap" }}>{actions}</div>
    </div>
  );

  return (
    <div style={{ height: "100%" }}>
      <GoabWorkspaceLayout
        sideMenu={sideMenu}
        pageHeader={pageHeader}
        onScrollStateChange={(d) => setScrollState((d && d.state) || "at-top")}
        style={{ height: "100%" }}
      >
        <div style={{ padding: "0 var(--goa-space-xl) var(--goa-space-xl)" }}>
          {children}
        </div>
      </GoabWorkspaceLayout>
    </div>
  );
}

/* Frame wrappers — one mount per frame, composed in JS.
   A nested <x-import> resolves to null until its OWN module is in the runtime cache (support.js
   resolveGlobal bails on the miss), and with `from` removed it never gets a cache entry at all.
   Either way the 295 KB QAPrototypeScreen module lost the race and raised React #130. So the
   frames no longer nest mounts: they mount ONE component from this module (small, cached first)
   which composes the shell around the heavy screen in JS.

   Waiting for the heavy module is React state, not a window accessor. An earlier attempt gated
   the globals with Object.defineProperty; it fought the runtime's own resolution and never swapped
   the real component in. preload-modules.js does a plain `window.X = X`, this polls for it, and
   the mount re-renders itself — no property descriptors involved. */
/* Pickup must NOT be timer-based. The preview iframe clamps setInterval/setTimeout hard when it is
   not the visible tab (measured 2026-08-24: ten 30ms sleeps blew a 10s budget), so a 50ms poll for a
   late-arriving global is starved — the mount keeps rendering undefined and the page sits in React
   #130 forever even after every module has loaded. Three paths, in order of cost: the event
   preload-modules.js fires on every assignment, a BUDGETED MessageChannel loop for the same-turn
   fast path, then a sparse 250ms timer. The loop must stay budgeted — unbounded it runs ~29,000
   ticks/second and starves the module fetch it is waiting for (measured 2026-08-24). */
function useGlobal(name) {
  const [C, setC] = React.useState(() => window[name] || null);
  React.useEffect(() => {
    if (C) return undefined;
    let live = true;
    const take = () => {
      if (!live) return false;
      const g = window[name];
      if (g) { live = false; setC(() => g); return true; }
      return false;
    };
    if (take()) return undefined;
    const onReady = () => { take(); };
    window.addEventListener('dc-module-ready', onReady);
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
  }, [C, name]);
  return C;
}
function Frame14(props) {
  const Screen = useGlobal("QAPrototypeScreen");
  return (
    <ClaimsShell navCurrent="#claims/reviews" menuVariant="figma" reviewBadge="107"
      pageTitle="Claims reviews" pageSubtitle={props.roleSubtitle}
      userName={props.roleName} userEmail={props.roleEmail}>
      {Screen ? (
        <Screen deltas="false" role={props.role} grouping={props.grouping}
          paPlacement={props.paPlacement} evidenceMode={props.evidenceMode}
          evidenceLayout={props.evidenceLayout} statusStyle={props.statusStyle} showKpis={props.showKpis} showReviewFeatures={props.showReviewFeatures}
          rowEvidence={props.rowEvidence} detailCharts={props.detailCharts} kpiStyle={props.kpiStyle} signer={props.roleName} />
      ) : null}
    </ClaimsShell>
  );
}
function Frame16() {
  const Lazy = useGlobal("LazyFrame");
  const Adv = useGlobal("AdvanceIntelligence");
  const inner = (
    <ClaimsShell navCurrent="#claims/summary" menuVariant="figma" reviewBadge="107"
      pageTitle="Advance intelligence"
      pageSubtitle="Predictive · June 2026 · advance-vs-actual reconciliation"
      userName="Carla Legare" userEmail="carla.legare@gov.ab.ca">
      {Adv ? <Adv /> : null}
    </ClaimsShell>
  );
  return Lazy
    ? <Lazy label="Advance Intelligence" note="Predictive portfolio view — loads as you scroll to it, so the QA queue above stays responsive.">{inner}</Lazy>
    : inner;
}

window.ClaimsShell = ClaimsShell;
window.Frame14 = Frame14;
window.Frame16 = Frame16;
