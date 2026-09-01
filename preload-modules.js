/* Module preloader — fetch + transpile the two heavy .jsx modules WITHOUT mounting them.
   An <x-import> is a MOUNT, not a loader: using one to warm the module cache rendered a complete,
   interactive hidden duplicate of the component, which also clobbered the module-level
   SHOW_DELTAS / EVIDENCE_LAYOUT / ROLE_STAGE state the visible frame sets on every render.

   Why preload at all: a nested <x-import> resolves to null while its module is still fetching
   (support.js resolveGlobal bails on the cache miss), which is what raised React #130 on a cold
   load — the 295 KB screen loses the race the small shells win. The nested mounts therefore carry
   no `from` and resolve off the global; this file is what puts the global there, through the
   accessor dc-mount-gate.js installs, which then re-renders the mounts already on screen.

   Loaded from <helmet>, so it starts before the frames mount. */
(function () {
  /* ClaimsShell.jsx added 2026-08-24: it is what the TOP-LEVEL <x-import> mounts, so it is the one
     module whose absence takes the whole page to React #130, and it was the only one not preloaded. */
  var FILES = ["./ClaimsShell.jsx", "./QAPrototypeScreen.jsx", "./AdvanceIntelligence.jsx", "./LazyFrame.jsx"];
  function run() {
    FILES.forEach(function (url) {
      /* Cache-bust: without it the browser served a stale copy of the screen module after every
         edit, so the preview rendered old code while the file on disk was new (caught 2026-08-24
         when a toolbar restyle did not appear). */
      fetch(url + (url.indexOf("?") < 0 ? "?v=" : "&v=") + Date.now())
        .then(function (r) { return r.text(); })
        .then(function (src) {
          var out = window.Babel.transform(src, { presets: ["react"], filename: url }).code;
          /* Function scope, NOT indirect eval. A top-level `function X(){}` evaluated in global
             scope performs CreateGlobalFunctionBinding, which redefines window.X as a plain data
             property and DESTROYS the accessor dc-mount-gate.js installed — the gate's setter then
             never fires and the mounted Gate returns null forever. Inside a Function body the
             declarations stay local and only the module's own `window.X = X;` tail reaches the
             global, which is exactly what the gate is waiting for. */
          (new Function(out))();
          /* Tell the mounts a global landed. Their fallback poll cannot be a timer (clamped off-tab),
             so this event is the fast path that makes a late module appear immediately. */
          window.dispatchEvent(new CustomEvent("dc-module-ready", { detail: { url: url } }));
        })
        .catch(function (e) { console.warn("[preload] " + url, e); });
    });
  }
  /* Unthrottled wait: a 25ms setTimeout poll is clamped when the preview is not the visible tab,
     which delayed the whole preload and lost the cold-load race it exists to win. */
  function whenBabel(tries) {
    if (window.Babel && window.Babel.transform) return run();
    if (tries > 4000) return console.warn("[preload] Babel never appeared");
    /* Budget the tight path (see rules/build.md): 120 macrotask ticks, then a sparse timer, so the
       wait cannot starve the very script load it is waiting for. */
    if (tries < 120) {
      var ch = new MessageChannel();
      ch.port1.onmessage = function () { whenBabel(tries + 1); };
      ch.port2.postMessage(0);
    } else {
      setTimeout(function () { whenBabel(tries + 1); }, 250);
    }
  }
  whenBabel(0);
})();
