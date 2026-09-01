# Claims review mockups

The Claude Design project for the Government of Alberta **HQ QA work queue**.

**Live: <https://manadir-cgi.github.io/goa-claims-reviews-mvp/>**

## Documents

| Document | Screen |
| --- | --- |
| [`MVP V1.dc.html`](MVP%20V1.dc.html) | MVP V1 — HQ QA work queue (landing page) |
| [`ECDS Claims Review.dc.html`](ECDS%20Claims%20Review.dc.html) | ECDS Claims Review |
| [`Claims Advance Vision Mockups.dc.html`](Claims%20Advance%20Vision%20Mockups.dc.html) | Claims Advance vision mockups |
| [`Claims Review - Real Components.dc.html`](Claims%20Review%20-%20Real%20Components.dc.html) | Claims Review — real components |

## How it loads

`support.js` is the Claude Design canvas runtime: it interprets the `<x-dc>` and
`<helmet>` wrappers, and `<x-import>` mounts a component off the global scope.
`preload-modules.js` fetches and Babel-transpiles the JSX modules before the
frames mount.

```
MVP V1.dc.html
├─ support.js                     canvas runtime (bundles the mount gate)
├─ preload-modules.js             warms the JSX module cache
├─ ClaimsShell.jsx                mounted by the top-level <x-import>
├─ QAPrototypeScreen.jsx          the screen itself
├─ AdvanceIntelligence.jsx, LazyFrame.jsx
├─ _ds/government-of-alberta-…/   GoA Design System 2.0 bundle + tokens
├─ cr/, cr-extra/                 component bundles + Figma tokens
└─ goa-tooltip.js, goa-illustrations.js, ionicons-offline.js, goa-logo.svg
```

Three resources come from the network at runtime, so the page needs internet:
Babel standalone (unpkg), the Acumin webfont (Typekit), and Roboto Mono
(Google Fonts). `AcuminVariable.woff2` is referenced locally by
`tokens/fonts.css` but is not in the project, so Acumin resolves via Typekit.

## Running it locally

Any static server from the repository root:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000/>.

**Windows note:** `_ds/government-of-alberta-design-system-eddb08d5-…/tokens/goa-tokens.css`
is 262 characters from a deep checkout, past the 260-character `MAX_PATH` limit.
Git is configured with `core.longpaths true`; clone somewhere short (e.g.
`C:\src\`) or some tools will report those token files as missing.

## Deployment

`.github/workflows/deploy.yml` uploads the repository to GitHub Pages on every
push to `main` — no build. `.nojekyll` is present because Jekyll would otherwise
strip the `_ds/` directory for starting with an underscore.

## Not published here

The source project also contains internal working material that is deliberately
excluded from this public repository (see `.gitignore`): `uploads/` (discovery
documents, Financial Services & Claims Processing PDFs, an offboarding
document), `scraps/` (workshop board scans), `repo/`, and `figma-source/`. Add
them only to a private repository.

Sample data in the mockups is fictitious.
