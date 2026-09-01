/* Mounts the Claims reviews screen. */
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
