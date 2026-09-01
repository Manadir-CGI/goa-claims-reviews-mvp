# Claims reviews — HQ QA work queue

The Government of Alberta HQ QA work queue screen, running as a **standalone
application**. Open it and you get the working screen at full viewport: no
canvas, no artboard frame, no mockup chrome.

**Live: <https://manadir-cgi.github.io/goa-claims-reviews-mvp/>**

It is built from the Claude Design project's own source — the same
`ClaimsShell.jsx` / `QAPrototypeScreen.jsx` components and the same Government
of Alberta Design System 2.0 bundle the design uses. Nothing was reimplemented
or re-measured, so the screen is faithful by construction.

## How it works

The design document (`MVP V1.dc.html`) is a Claude Design *canvas*: `support.js`
interprets `<x-dc>` / `<helmet>`, and an `<x-import>` mounts `Frame14` inside a
1560×900 mock browser window on a grey board.

This app drops the canvas layer and mounts the same component directly:

| | Canvas document | This app |
| --- | --- | --- |
| Runtime | `support.js` + `<x-dc>` | none |
| JSX | Babel in the browser | precompiled by `build.mjs` |
| Mount | `<x-import>` into a 1560×900 frame | `ReactDOM.createRoot` at full viewport |
| Chrome | board, frame bar, "MVP V1 —" heading | none |
| React | unpkg at runtime | vendored in `vendor/` |

`Frame14` is the design's own composition — `ClaimsShell` (GoA workspace layout
and side menu) wrapping `QAPrototypeScreen`. `app.js` passes the design's own
default props, taken from the document's `data-props` block and the fallbacks in
its `renderVals()`:

```js
role: 'hq-qa', grouping: 'flat', evidenceMode: 'expand',
evidenceLayout: 'focus', statusStyle: 'exception',
showKpis: false, showReviewFeatures: false
```

Role `hq-qa` resolves to the reviewer identity in the document's `IDENT` table
(Avery Solano, HQ QA reviewer).

## Running it

```bash
npm install
```

```bash
npm run build
```

Then serve the repository root with any static server:

```bash
python -m http.server 8000
```

`npm run build` runs `build.mjs`, which JSX-transforms the four screen modules
into `js/`. The modules are global-scope scripts rather than ES modules — each
ends with `window.X = X` — so it is a transform only, with no bundling, and
`index.html` loads the output with ordinary script tags in dependency order.

Design viewport is **1560×950**.

## Layout

```
index.html            the application
app.js                mounts Frame14 with the design's default props
app.css               full-viewport reset
build.mjs             JSX -> js/
src/                  screen source, from the design project, unmodified
  ClaimsShell.jsx       GoA workspace shell + Frame14 / Frame16
  QAPrototypeScreen.jsx the screen
  AdvanceIntelligence.jsx, LazyFrame.jsx
_ds/government-of-…/  GoA Design System 2.0 bundle + tokens
cr/, cr-extra/        component bundles + Figma tokens
vendor/               React 18.3.1 UMD, tooltip, ionicons, illustrations, logo
js/                   build output (git-ignored)
```

`_ds/`, `cr/` and `cr-extra/` are vendored byte-for-byte from the design project
so they can be re-synced with a straight copy. `_ds/` stays at the repository
root rather than under `vendor/` because its path is already at the Windows
length limit (see below).

The Claude Design canvas documents (`*.dc.html`) and their runtime were removed
once the app replaced them. To read one again:

```bash
git show 933c351:"MVP V1.dc.html" > "MVP V1.dc.html"
```

Acumin (Typekit) and Roboto Mono (Google Fonts) are fetched at runtime by the
design system's `tokens/fonts.css`, so the page needs internet for its
typefaces. React is vendored, and the JSX is precompiled, so nothing else is.

**Windows note:** `_ds/government-of-alberta-design-system-eddb08d5-…/tokens/goa-tokens.css`
is 262 characters from a deep checkout, past the 260-character `MAX_PATH` limit.
Git is configured with `core.longpaths true`; clone somewhere short (e.g.
`C:\src\`) or tools will report those token files as missing.

## Deployment

`.github/workflows/deploy.yml` installs, runs the build, and publishes the
repository root to GitHub Pages on every push to `main`. `.nojekyll` is present
because Jekyll would otherwise strip `_ds/` for its leading underscore.

## Not published here

The source project also contains internal working material deliberately excluded
from this public repository (see `.gitignore`): `uploads/` (discovery documents,
Financial Services & Claims Processing PDFs, an offboarding document), `scraps/`
(workshop board scans), `repo/`, and `figma-source/`.

Sample data in the screen is fictitious.
