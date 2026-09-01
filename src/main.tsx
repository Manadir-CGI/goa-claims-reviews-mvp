import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// GoA Design System 2.0: register the web components, load the v2 tokens, and
// apply the foundation stylesheet that maps typography tokens onto native
// elements (h1-h6, p, a, lists). Order matters: tokens -> foundation -> app.
import '@abgov/web-components';
import '@abgov/design-tokens/dist/tokens.css';
import '@abgov/web-components/index.css';

import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
