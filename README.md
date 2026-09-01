# Claims reviews — HQ QA work queue

Government of Alberta claims review screen for HQ QA reviewers, built on
Government of Alberta Design System 2.0.

**Live: <https://manadir-cgi.github.io/goa-claims-reviews-mvp/>**

## Run it

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

Design viewport is **1560×950**.

## How it builds

`npm run build` runs `build.mjs`, which JSX-transforms the modules in `src/`
into `js/`. They are global-scope scripts rather than ES modules — each ends
with `window.X = X` — so it is a transform only, with no bundling, and
`index.html` loads the output with script tags in dependency order.

`app.js` mounts `Frame14` (the workspace shell wrapping the screen) into `#root`
with `ReactDOM.createRoot`.

## Layout

```
index.html            markup, stylesheet and script order
app.js                mount + screen props
app.css               full-viewport reset
build.mjs             JSX -> js/
src/                  screen modules
  ClaimsShell.jsx       workspace shell, Frame14 / Frame16
  QAPrototypeScreen.jsx the screen
  AdvanceIntelligence.jsx, LazyFrame.jsx
_ds/government-of-…/  GoA Design System 2.0 bundle + tokens
cr/, cr-extra/        component bundles + tokens
vendor/               React 18.3.1 UMD, tooltip, ionicons, illustrations, logo
js/                   build output (git-ignored)
```

`_ds/`, `cr/`, `cr-extra/` and `src/` are vendored verbatim so they can be
updated with a straight copy. `_ds/` sits at the repository root rather than
under `vendor/` because of the path length limit below.

## Screen props

`app.js` sets these on mount:

| Prop | Value |
| --- | --- |
| `role` | `hq-qa` |
| `grouping` | `flat` |
| `evidenceMode` | `expand` |
| `evidenceLayout` | `focus` |
| `statusStyle` | `exception` |
| `showKpis` | `false` |
| `showReviewFeatures` | `false` |

`role` also drives the signed-in identity shown in the shell. Other supported
roles are `subsidy-eo`, `fdh-eo`, `funding-eo`, `finance-officer` and `lead`;
`ClaimsShell.jsx` and `QAPrototypeScreen.jsx` hold the rest of the options.

## Updating the screen

Replace the vendored directories from a fresh export, then rebuild:

```bash
cp -r <export>/{ClaimsShell,QAPrototypeScreen,AdvanceIntelligence,LazyFrame}.jsx src/ && cp -r <export>/_ds <export>/cr <export>/cr-extra . && npm run build
```

Keep `src/` byte-identical to the export so the next update stays a copy rather
than a merge.

## Deployment

`.github/workflows/deploy.yml` installs, builds, and publishes the repository
root to GitHub Pages on every push to `main`. `.nojekyll` is required: Jekyll
would otherwise strip `_ds/` for its leading underscore.

## Notes

Acumin (Typekit) and Roboto Mono (Google Fonts) are fetched at runtime by
`tokens/fonts.css`, so the page needs internet for its typefaces. React is
vendored and the JSX is precompiled, so nothing else is fetched.

**Windows:** `_ds/government-of-alberta-design-system-eddb08d5-…/tokens/goa-tokens.css`
is 262 characters from a deep checkout, past the 260-character `MAX_PATH` limit.
Git is configured with `core.longpaths true`; clone somewhere short such as
`C:\src\`, or tools will report those token files as missing.

Sample data in the screen is fictitious.
