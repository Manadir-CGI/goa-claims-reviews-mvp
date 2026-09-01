/*
 * Mounts the Claims reviews screen as a standalone application.
 *
 * Frame14 is the composition the design document mounts: ClaimsShell (the GoA
 * workspace layout and side menu) wrapping QAPrototypeScreen. The props below
 * are the design's own defaults, taken from the document's `data-props` block
 * and the fallbacks in its renderVals(); role "hq-qa" resolves to this reviewer
 * identity in the document's IDENT table.
 */
(function () {
  var PROPS = {
    role: 'hq-qa',
    grouping: 'flat',
    evidenceMode: 'expand',
    evidenceLayout: 'focus',
    statusStyle: 'exception',
    showKpis: false,
    showReviewFeatures: false,
    roleName: 'Avery Solano',
    roleEmail: 'avery.solano@gov.ab.ca',
    roleSubtitle: '',
  };

  var mount = document.getElementById('root');

  if (!window.React || !window.ReactDOM) {
    mount.innerHTML = '<p id="app-loading">React did not load.</p>';
    return;
  }
  if (!window.Frame14) {
    mount.innerHTML = '<p id="app-loading">Screen modules did not load — run <code>npm run build</code>.</p>';
    return;
  }

  ReactDOM.createRoot(mount).render(React.createElement(window.Frame14, PROPS));
})();
