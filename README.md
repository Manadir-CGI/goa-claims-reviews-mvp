# HQ QA work queue — Claims reviews (MVP V1)

An implementation of the **MVP V1** Claims reviews screen for the Government of
Alberta HQ QA work queue, built on the **Government of Alberta Design System
v2** (`@abgov/react-components` 7.x + `@abgov/web-components` 2.x).

The screen is a worker tool: HQ QA reviewers scan childcare claims that have been
pulled for review, work through the QA queue, mark claims reviewed, and release
them back into the payment chain.

**Live prototype: <https://manadir-cgi.github.io/goa-claims-reviews-mvp/>**

![Claims overview](docs/mvp-v1-claims-overview.png)

## Running it

```bash
npm install
```

```bash
npm run dev
```

The app is served at `http://localhost:5173` (or the port Vite reports). Design
at a **1920 × 1170** viewport — that is the size the source artboard was drawn
at.

```bash
npm run build
```

## Deploying

`.github/workflows/deploy.yml` builds the app and publishes `dist/` to GitHub
Pages on every push to `main`, and can also be run on demand from the Actions
tab. Pages is configured with **GitHub Actions** as its source (not a branch), so
no `gh-pages` branch is involved.

`base: './'` in `vite.config.ts` keeps asset URLs relative, which is what lets the
build work from the `/goa-claims-reviews-mvp/` project path.

## What's implemented

**Four working sets**, as segmented tabs:

| Tab | Contents | Selectable |
| --- | --- | --- |
| Claims overview | Every claim in the review chain, with its current review stage | No — read-only roll-up |
| QA queue | Claims awaiting HQ QA, with the flag that pulled them in | Yes |
| Hold | Claims held at a review stage | Yes |
| Watchlist | Claims a reviewer is tracking | Yes |

**Bulk review flow** on the selectable tabs:

1. Select rows → the selection bar appears with `Add to watchlist`,
   `Place on hold`, `Mark reviewed`, and `Clear`.
2. `Mark reviewed` → each selected row gets a green reviewed marker, the control
   becomes a `Reviewed` state indicator, and a primary
   `Release N reviewed` action appears.
3. `Release N reviewed` → clears the marks and the selection.

**Table behaviour**: sortable Received / Program name / Program ID / Amount
columns, free-text search across program name, address, program ID and payment
reference, negative adjustments rendered as bracketed credits, and semantic
badges for review stage and flags.

## Structure

```
src/
  App.tsx                        composition root
  main.tsx                       DS bootstrap: tokens -> foundation -> app
  shell/ClaimsShell.tsx          GoabWorkspaceLayout + collapsed GoabWorkSideMenu
  claims-reviews/
    ClaimsReviews.tsx            the screen
    ClaimsReviews.css            layout-only styles, all values from GoA tokens
    data.ts                      sample fixture
docs/                            design reference exports (see below)
```

Every control on the screen is a real design-system component —
`GoabWorkspaceLayout`, `GoabWorkSideMenu`, `GoabTabs` (`variant="segmented"`),
`GoabTable` / `GoabTableSortHeader`, `GoabBadge`, `GoabButton`,
`GoabButtonGroup`, `GoabCheckbox`, `GoabContainer`, `GoabInput`, `GoabLink`,
`GoabMenuButton`, `GoabIcon`, `GoabTooltip`, `GoabText`, `GoabSpacer`. The
stylesheet carries layout only; type, colour and spacing come from GoA tokens.

## Sample data

All data in `src/claims-reviews/data.ts` is **deliberately fictitious**. The
program names, addresses, program IDs, payment references and amounts are
invented for the prototype and do not correspond to any real childcare program,
claim or payment.

`QA_QUEUE_TOTAL` is fixed at 68 to match the design's tab badge. The fixture
populates the first page of that queue rather than all 68 rows, so the badge
reads from that constant while the table renders the fixture.

## Fidelity against the design export

The build was measured against the artboard rather than eyeballed. The export is
3120x1900 at 2x, i.e. a **1560x950** artboard, which the design system's own 72px
work-side-menu rail confirms (the artboard's card starts at 74px).

Verified equal, or within a few pixels, on all four states:

| Measure | Artboard | Build |
| --- | --- | --- |
| Content gutter inside the card | 32px | 32px |
| Page title | 32px / 40px bold | 32px / 40px bold |
| Controls row (tabs + toolbar) | y 80, 40px tall | y 81, 40px tall |
| Search field | 221 x 40 | 221 x 40 |
| Filter button | ~101px wide, neutral border, #333 text | 101px, neutral border, #333 text |
| Table header band | 60px | 64px |
| **Table row pitch** | **63px** | **63px** |
| Rows visible at 950px tall | 11 | 11 |
| Selection bar | y 139 rel. card, 58px tall | y 137, 64px tall |

The design's type scale turned out to be the GoA scale one step below the library
defaults — `body-s` (16/24) in the table and `body-xs` (14/20) for the service
address — so most of this is token selection, not overriding. Density and the
neutral toolbar buttons are driven through the design system's own custom
properties (`--goa-button-padding`, `--goa-button-secondary-border`,
`--goa-text-input-height`, `--goa-container-padding-compact`,
`--goa-tabs-margin-bottom`, `--goa-table-padding-heading`) rather than by
reaching into shadow DOM.

### Remaining differences

- **Segmented tab strip is 40px tall, the artboard draws 32px.** The library
  floors each tab at `min-height: 30px` and adds 3px padding plus a 1px border;
  there is no custom property for either, so closing the last 8px would mean
  overriding shadow-DOM internals.
- **Table cell padding is 12px against the artboard's ~14px.** At 14px the
  widest tab (QA queue, 11 columns, every label on one line) needs 1440px of
  min-content and overflows the 100%-width table, clipping the Actions column.
- **Header band is 64px against 60px** — `th` carries a 56px `min-height` floor.
- **Heading typeface.** The design system specifies `acumin-pro-semi-condensed`,
  a licensed font that is not bundled, so headings fall back down its stack.
  Glyph widths therefore differ slightly from the export.
- **`Reviewed` state control.** The design shows a filled dark-green pill where
  `Mark reviewed` was. No GoA button variant is green, so this is a
  `GoabBadge type="success"` — a real component with that exact appearance, and
  semantically a state rather than an action.

## Design reference

`docs/` holds the four artboard exports this build was implemented against:
claims overview, QA queue, selection, and reviewed.

## Licence

[MIT](LICENSE)
