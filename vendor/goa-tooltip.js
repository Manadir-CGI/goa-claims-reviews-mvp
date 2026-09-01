/* goa-tooltip — imported from scratch from the ACTUAL GoA source component.
 *
 * Source: GovAlta/ui-components @ main (tree c78602b8cbd8, read 2026-08-12)
 *         libs/web-components/src/components/tooltip/Tooltip.svelte
 * This file is a line-faithful React port of that Svelte source's manual-positioning branch:
 * fixed-position bubble sized nowrap-until-needed (applyTooltipWidth), position flip when space
 * runs out (getAdjustedPosition), viewport-aware halign resolution (resolveTopBottomAlign), 10px
 * callout arrow, 300ms show / 500ms hide delays, :focus-visible-gated keyboard reveal, and the
 * --target-width arrow anchoring — all upstream names kept so the two can be diffed side by side.
 * One documented addition upstream does not need: coordSpace(), which compensates when a
 * transformed ancestor (the mockup frame's translateZ(0)) becomes the containing block for
 * position:fixed.
 *
 * Loaded AFTER _ds_bundle.js; it replaces the bundle's GoabTooltip — the bundle copy (and the
 * design system's own GoabTooltip.jsx it was compiled from) is a loose recreation that positions
 * the bubble absolutely INSIDE the trigger, which any overflow/scroll ancestor clips — that was
 * the "distorted" tooltip. User instruction 2026-08-12: "import goa component from scratch".
 */
(function () {
  function install() {
    var NS = window.GovernmentOfAlbertaDesignSystem_eddb08;
    if (!NS || !window.React) return false;
    var React = window.React;

    const CSS = `
    /* Faithful port of GovAlta/ui-components Tooltip.svelte (goa-tooltip, manual-positioning branch,
       read from upstream main@c78602b8 2026-08-12). The previous recreation absolutely-positioned the
       bubble INSIDE the trigger, so any overflow ancestor (e.g. a scrolling workspace card) clipped it;
       upstream renders the bubble position:fixed with JS-computed coordinates, a 10px callout arrow,
       nowrap-until-needed sizing and 300ms/500ms show/hide delays. */
    .goab-tooltip { position: relative; display: inline-flex; justify-content: center; align-items: center; }
    .goab-tooltip:focus-visible { outline: var(--goa-tooltip-border-focus); outline-offset: -4px; border-radius: 8px; }
    .goab-tooltip__target { margin: var(--goa-tooltip-gap); height: auto; display: flex; cursor: pointer; }
    .goab-tooltip__bubble {
      pointer-events: none;
      font: var(--goa-tooltip-text-size);
      background-color: var(--goa-tooltip-color-bg);
      color: var(--goa-tooltip-color-text);
      border-radius: var(--goa-tooltip-border-radius);
      position: fixed; z-index: 9999; top: auto; bottom: auto; left: auto; right: auto;
      opacity: 0;
      transition: opacity var(--goa-motion-duration-medium-2) var(--goa-motion-curve-productive);
      padding: var(--goa-tooltip-padding);
      text-align: left;
      white-space: nowrap;
      display: flex; flex-direction: column;
      overflow: visible; border-width: 0;
    }
    .goab-tooltip__bubble--show { opacity: 1; }
    .goab-tooltip__bubble--top::before, .goab-tooltip__bubble--bottom::before,
    .goab-tooltip__bubble--left::before, .goab-tooltip__bubble--right::before {
      content: ""; position: absolute; border-style: solid;
    }
    .goab-tooltip__bubble--bottom::before { top: -9px; left: 50%; transform: translateX(-50%); border-width: 0 10px 10px 10px; border-color: transparent transparent var(--goa-tooltip-color-bg) transparent; }
    .goab-tooltip__bubble--top::before { bottom: -9px; left: 50%; transform: translateX(-50%); border-width: 10px 10px 0 10px; border-color: var(--goa-tooltip-color-bg) transparent transparent transparent; }
    .goab-tooltip__bubble--left::before { top: 50%; right: -9px; transform: translateY(-50%); border-width: 10px 0 10px 10px; border-color: transparent transparent transparent var(--goa-tooltip-color-bg); }
    .goab-tooltip__bubble--right::before { top: 50%; left: -9px; transform: translateY(-50%); border-width: 10px 10px 10px 0; border-color: transparent var(--goa-tooltip-color-bg) transparent transparent; }
    .goab-tooltip__bubble--bottom.goab-tooltip__bubble--align-left::before,
    .goab-tooltip__bubble--top.goab-tooltip__bubble--align-left::before { left: calc(100% - (var(--target-width) + var(--goa-space-m))); }
    .goab-tooltip__bubble--bottom.goab-tooltip__bubble--align-right::before,
    .goab-tooltip__bubble--top.goab-tooltip__bubble--align-right::before { left: calc(var(--target-width) + var(--goa-space-m)); }
    `;
    let injected = false;
    function useStyles() {
      if (typeof document === "undefined" || injected) return;
      injected = true;
      const el = document.createElement("style");
      el.setAttribute("data-goab", "tooltip");
      el.textContent = CSS;
      document.head.appendChild(el);
    }
    const space = v => v == null ? undefined : v === "none" ? "0" : `var(--goa-space-${v})`;
    function GoabTooltip({
      content,
      position = "top",
      hAlign = "center",
      maxWidth,
      mt,
      mr,
      mb,
      ml,
      testId,
      children
    }) {
      useStyles();
      const GAP = 12, OFFSET = 16; // upstream _manualGap / _manualOffset
      /* Upstream positions against the real viewport. Here a transformed ancestor (e.g. a frame with
         translateZ(0), or a host pan/zoom wrapper) becomes the containing block for position:fixed, so
         viewport coordinates would land offset and clip at its edges. Resolve the actual coordinate
         space: the nearest ancestor that establishes a fixed containing block, else the window. */
      const coordSpace = (el) => {
        for (let n = el && el.parentElement; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.transform !== "none" || cs.perspective !== "none" || cs.filter !== "none" ||
              /transform|perspective|filter/.test(cs.willChange) || /paint|layout|strict|content/.test(cs.contain)) {
            const r = n.getBoundingClientRect();
            return { left: r.left, top: r.top, width: r.width, height: r.height };
          }
        }
        return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      };
      const rootRef = React.useRef(null);
      const targetRef = React.useRef(null);
      const tipRef = React.useRef(null);
      const timers = React.useRef({});
      const rafRef = React.useRef(null);
      const idRef = React.useRef("gt-" + Math.random().toString(36).slice(2));
      const [visible, setVisible] = React.useState(false);
      const [pos, _setPos] = React.useState(position);
      const [align, _setAlign] = React.useState(hAlign);
      const posRef = React.useRef(position);
      const alignRef = React.useRef(hAlign);
      const setPos = (p) => { posRef.current = p; _setPos(p); };
      const setAlign = (a) => { alignRef.current = a; _setAlign(a); };
    
      // upstream resolveTopBottomAlign: flip the requested alignment when it would leave the viewport
      const resolveAlign = (req, gr, tr, sp) => {
        const vLeft = sp.left, vRight = sp.left + sp.width;
        const proj = (al) => al === "left" ? gr.right - tr.width + OFFSET : al === "right" ? gr.left - OFFSET : gr.left + (gr.width - tr.width) / 2;
        const overflows = (l) => l < vLeft || l + tr.width > vRight;
        const amount = (l) => Math.max(0, vLeft - l) + Math.max(0, l + tr.width - vRight);
        const rl = proj(req);
        if (!overflows(rl)) return req;
        if (req === "right" || req === "left") {
          const opp = req === "right" ? "left" : "right";
          const ol = proj(opp);
          if (!overflows(ol) || amount(ol) < amount(rl)) return opp;
          return req;
        }
        return amount(proj("left")) <= amount(proj("right")) ? "left" : "right";
      };
    
      // upstream reconcileTooltipLayout + applyTooltipWidth + getAdjustedPosition
      const reconcile = () => {
        const tip = tipRef.current, target = targetRef.current;
        if (!tip || !target) return;
        tip.style.width = "";
        tip.style.whiteSpace = "";
        let tr = tip.getBoundingClientRect();
        const gr = target.getBoundingClientRect();
        const sp = coordSpace(tip);
        const spaceTop = gr.top - sp.top, spaceBottom = sp.top + sp.height - gr.bottom;
        const spaceLeft = gr.left - sp.left, spaceRight = sp.left + sp.width - gr.right;
        const hasPx = maxWidth && String(maxWidth).endsWith("px");
        const calcMax = hasPx ? parseFloat(maxWidth) : 400;
        const newWidth = Math.min(sp.width * 0.8, calcMax, tr.width, Math.max(spaceLeft, spaceRight) - 10);
        const shouldWrap = hasPx || newWidth > gr.width || newWidth > spaceLeft || newWidth > spaceRight;
        tip.style.width = Math.ceil(Math.max(newWidth - 32, 1)) + "px";
        tip.style.whiteSpace = shouldWrap ? "normal" : "nowrap";
        tr = tip.getBoundingClientRect();
        let p = position;
        if (p === "bottom" && tr.height > spaceBottom) p = "top";
        else if (p === "top" && tr.height > spaceTop) p = "bottom";
        if (p === "right" && tr.width > spaceRight) p = "left";
        else if (p === "left" && tr.width > spaceLeft) p = "right";
        setPos(p);
        setAlign(p === "top" || p === "bottom" ? resolveAlign(hAlign, gr, tr, sp) : "center");
      };
    
      // upstream updateManualPopoverCoordinates, run per frame while shown (tracks scroll/layout)
      const placeLoop = () => {
        const tip = tipRef.current, target = targetRef.current;
        if (tip && target) {
          const gr = target.getBoundingClientRect(), tr = tip.getBoundingClientRect();
          const sp = coordSpace(tip);
          const p = posRef.current, a = alignRef.current;
          let top, left;
          if (p === "top") { top = gr.top - tr.height - GAP; left = gr.left + (gr.width - tr.width) / 2; }
          else if (p === "bottom") { top = gr.bottom + GAP; left = gr.left + (gr.width - tr.width) / 2; }
          else if (p === "left") { top = gr.top + (gr.height - tr.height) / 2; left = gr.left - tr.width - GAP; }
          else { top = gr.top + (gr.height - tr.height) / 2; left = gr.right + GAP; }
          if (p === "top" || p === "bottom") {
            if (a === "left") left = gr.right - tr.width + OFFSET;
            else if (a === "right") left = gr.left - OFFSET;
          }
          tip.style.top = (top - sp.top) + "px";
          tip.style.left = (left - sp.left) + "px";
        }
        rafRef.current = requestAnimationFrame(placeLoop);
      };
    
      const show = () => {
        clearTimeout(timers.current.hide);
        clearTimeout(timers.current.show);
        timers.current.show = setTimeout(() => {
          const root = rootRef.current, target = targetRef.current;
          if (root && target) root.style.setProperty("--target-width", target.getBoundingClientRect().width / 2 + "px");
          setVisible(true);
        }, 300);
      };
      const hide = () => {
        clearTimeout(timers.current.show);
        timers.current.hide = setTimeout(() => {
          setVisible(false);
          setPos(position);
          setAlign(hAlign);
        }, 500);
      };
    
      React.useEffect(() => {
        if (!visible) return;
        const raf = requestAnimationFrame(() => { reconcile(); placeLoop(); });
        window.addEventListener("resize", reconcile);
        return () => {
          cancelAnimationFrame(raf);
          if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
          window.removeEventListener("resize", reconcile);
        };
      }, [visible]);
      React.useEffect(() => () => { clearTimeout(timers.current.show); clearTimeout(timers.current.hide); }, []);
    
      const rootStyle = {};
      if (mt != null) rootStyle.marginTop = space(mt);
      if (mr != null) rootStyle.marginRight = space(mr);
      if (mb != null) rootStyle.marginBottom = space(mb);
      if (ml != null) rootStyle.marginLeft = space(ml);
      return /*#__PURE__*/React.createElement("span", {
        className: "goab-tooltip",
        tabIndex: 0,
        ref: rootRef,
        style: Object.keys(rootStyle).length ? rootStyle : undefined,
        "data-testid": testId,
        "aria-describedby": idRef.current,
        onMouseEnter: () => { clearTimeout(timers.current.hide); show(); },
        onMouseLeave: hide,
        // upstream handleFocus: keyboard-driven focus only, so JS state matches :focus-visible
        onFocus: (e) => { const t = e.currentTarget; if (!(t.matches && t.matches(":focus-visible"))) return; clearTimeout(timers.current.hide); show(); },
        onBlur: hide
      }, /*#__PURE__*/React.createElement("span", {
        className: "goab-tooltip__target",
        ref: targetRef,
        "aria-describedby": idRef.current
      }, children), /*#__PURE__*/React.createElement("span", {
        id: idRef.current,
        className: `goab-tooltip__bubble goab-tooltip__bubble--${pos}${align !== "center" ? " goab-tooltip__bubble--align-" + align : ""}${visible ? " goab-tooltip__bubble--show" : ""}`,
        role: "tooltip",
        "aria-hidden": !visible,
        ref: tipRef
      }, content));
    }
    
    /* The bundle's own (reverted, loose) tooltip CSS may already be injected under the same
       data-goab tag; its .goab-tooltip__bubble rules (absolute positioning, translateX(-50%),
       width:max-content, instant :hover opacity, the ::after arrow) would bleed into this port's
       identically-named classes. Drop it — after this install the bundle component never renders
       again, so nothing re-injects it. */
    document.querySelectorAll('style[data-goab="tooltip"]').forEach(function (el) { el.remove(); });
    injected = false;
    NS.GoabTooltip = GoabTooltip;
    return true;
  }
  (function wait(tries) {
    if (install()) return;
    if (tries > 4000) return console.warn('[goa-tooltip] design-system namespace never appeared');
    /* Not a timer: clamped off-tab, which left the tooltip component uninstalled on a hidden
       preview even though the namespace had arrived (2026-08-24). */
    if (tries < 120) {
      var ch = new MessageChannel();
      ch.port1.onmessage = function () { wait(tries + 1); };
      ch.port2.postMessage(0);
    } else {
      setTimeout(function () { wait(tries + 1); }, 250);
    }
  })(0);
})();
