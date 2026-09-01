/* LazyFrame — defers mounting a heavy frame until it scrolls near the viewport.

   Two full ClaimsShell instances on one canvas (frame 14 QA review + frame 16 Advance
   Intelligence, each 1560×1080 with a side menu, tables and interactive SVG charts) block the
   main thread for tens of seconds at load. Frame 14 is the primary surface and mounts eagerly;
   frame 16 mounts when it comes within 400px of the viewport, or on demand via the button, so
   the board is interactive immediately and nothing is lost. */

const NS = () => window.GovernmentOfAlbertaDesignSystem_eddb08 || {};

function LazyFrame({ children, label, note }) {
  const { GoabButton, GoabSkeleton } = NS();
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (shown) return;
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    let quiet = null;
    const arm = () => { clearTimeout(quiet); quiet = setTimeout(fire, 220); };
    const fire = () => {
      window.removeEventListener("scroll", arm, true);
      const go = () => setShown(true);
      if (window.requestIdleCallback) window.requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 0);
    };
    /* Mounting a second full ClaimsShell (side menu, tables, interactive SVG charts) is a
       multi-hundred-millisecond frame. Firing it DURING a scroll gesture reads as a hitch, so wait
       for the gesture to settle (220ms of scroll quiet) and then mount on an idle callback. */
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      window.addEventListener("scroll", arm, true);
      arm();
    }, { rootMargin: "200px" });
    io.observe(node);
    return () => { io.disconnect(); clearTimeout(quiet); window.removeEventListener("scroll", arm, true); };
  }, [shown]);

  if (shown) return <React.Fragment>{children}</React.Fragment>;

  return (
    <div ref={ref} style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "var(--goa-color-greyscale-100)", padding: 40, boxSizing: "border-box" }}>
      <div style={{ width: "min(760px, 80%)", display: "flex", flexDirection: "column", gap: 10, opacity: 0.55 }}>
        {[0, 1, 2, 3].map((i) => (GoabSkeleton
          ? <GoabSkeleton key={i} variant="rect" width="100%" height={i === 0 ? "40px" : "26px"} />
          : <div key={i} style={{ height: i === 0 ? 40 : 26, borderRadius: 4, background: "var(--goa-color-greyscale-200)" }}></div>))}
      </div>
      <span style={{ font: "var(--goa-typography-heading-s)", fontWeight: 700, color: "var(--goa-color-text-default)" }}>{label || "Frame"}</span>
      <span style={{ font: "var(--goa-typography-body-s)", color: "var(--goa-color-text-secondary)", textAlign: "center", maxWidth: 520 }}>
        {note || "Loads as you scroll to it — kept out of the initial render so the board above stays responsive."}
      </span>
      {GoabButton ? <GoabButton type="secondary" size="compact" onClick={() => setShown(true)}>Load this frame now</GoabButton> : null}
    </div>
  );
}

window.LazyFrame = LazyFrame;
if (typeof module !== "undefined") module.exports = { LazyFrame };
