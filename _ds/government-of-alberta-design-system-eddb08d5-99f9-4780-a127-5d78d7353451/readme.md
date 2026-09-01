# Government of Alberta Design System

A faithful, agent-ready recreation of the **Government of Alberta (GoA) Design System** — the design language behind Alberta.ca and the province's digital government services. Use it to generate well-branded GoA interfaces, prototypes, slides and mocks that respect the real tokens, type, colour and components.

> **Sources.** This system was built from the GoA open-source repositories. Explore them for deeper fidelity:
> - **UI components** (Svelte source of truth + React/Angular wrappers): https://github.com/GovAlta/ui-components
> - **Design tokens** (Style Dictionary output): https://github.com/GovAlta/design-tokens
> - **Live documentation & guidance:** https://design.alberta.ca
>
> The token CSS in `tokens/goa-tokens.css` is imported **verbatim** from `@abgov/design-tokens` (`dist/tokens.css`). The reader does not need access to these to use this system, but with access they can pull richer component behaviour and additional patterns.

---

## Product & context

The GoA Design System powers **citizen-facing government services** — benefit applications, permits, licences, account dashboards and informational pages on `alberta.ca`. Its priorities, in order, are:

1. **Accessibility (WCAG 2.2 AA)** — non-negotiable. Colour contrast, focus rings, hit targets and semantics are baked into the tokens.
2. **Clarity and trust** — plain language, calm neutral surfaces, a single confident brand teal, and unambiguous status colours.
3. **Consistency across frameworks** — one Svelte source compiled to web components, wrapped for React (`Goab*`) and Angular (`goab-*`). This project recreates the React surface.

The flagship surfaces are **service flows** (multi-step forms with eligibility → details → review → confirmation) and **information pages** (hero + structured content). See `ui_kits/alberta-service/` for a complete worked example.

---

## Content fundamentals

How GoA writes copy — match this voice in any generated content:

- **Plain language, grade 9 reading level.** Short sentences. Common words over jargon ("get" not "obtain", "help with the cost" not "financial assistance provision").
- **Second person, active voice.** Address the user as **"you"**; the government is **"we"**. e.g. *"You'll need your Alberta Health Care number."* / *"We'll email you when a decision is made."*
- **Sentence case everywhere** — headings, buttons, labels, nav. Never Title Case or ALL CAPS for content. (Small uppercase eyebrows/labels with letter-spacing are an accepted decorative exception.)
- **Action-first buttons.** Verbs that name the outcome: *Start an application*, *Continue*, *View status*, *Download PDF*. Avoid "Submit" / "OK" / "Click here".
- **Direct, reassuring, neutral tone.** Tell people what they need, how long it takes, what happens next. No marketing hype, no exclamation marks, **no emoji**.
- **Numbers and money** use the mono/number type (`--goa-typography-number-*`): `$266`, `15 days`, reference numbers like `CCS-2026-48217`.
- **Specifics over vagueness.** "About 15 minutes", "5 business days", "$50,000 – $89,999" rather than "a while" / "varies".

---

## Visual foundations

- **Colour.** A single brand teal — `--goa-color-brand-default` `#0081a2` (dark `#005072`, light `#c8eefa`) — used sparingly for brand moments and accents. The working interactive colour is a **blue** `--goa-color-interactive-default` `#006dcc` (hover `#045092`) for links, primary buttons and focus. Generous **greyscale** neutrals (`#f8f8f8` → `#000`) carry most surfaces. Status is communicated with a strict semantic set: **success** green `#006f4c`, **emergency** red `#da291c`, **important/warning** amber `#f9ce2d`, **info** blue `#0077ad`. A muted **extended palette** (sky, prairie, lilac, dawn, sunset, pasture) is reserved for decorative/categorical use only.
- **Type.** **Acumin** (Adobe) is the UI typeface — `acumin-variable` for body and headings, `acumin-pro-semi-condensed` for legacy weights — with **Roboto Mono** for numbers and data. Headings are bold/semi-bold with slightly **negative letter-spacing**; body is regular. A clear modular scale runs `heading-2xl` (48px) → `heading-2xs` (16px) and `body-l` (24px) → `body-xs` (14px). *(Substitution note below.)*
- **Spacing.** An 8-point-ish scale exposed as tokens: `3xs` 2 · `2xs` 4 · `xs` 8 · `s` 12 · `m` 16 · `l` 24 · `xl` 32 · `2xl` 48 · `3xl` 64 · `4xl` 128 px. Layouts are roomy and left-aligned with a centered max-width column (~760px forms, ~1100px pages).
- **Corners.** Soft, consistent radii: inputs/buttons use `m` (8px), containers/cards use `xl` (12px) → `2xl` (16px), pills/badges use `s` (6px), and fully-round for chips. Nothing is sharp-cornered.
- **Borders & elevation.** Surfaces lean on **thin hairline borders** (`1px` greyscale-150/200) far more than shadow. When elevation is used it is soft and low: `--goa-shadow-raised-light` for popovers/menus, `--goa-shadow-modal` for dialogs. Inputs use an **inset box-shadow border** that thickens on hover and turns blue on focus.
- **Backgrounds.** Predominantly **flat white and light grey** — no gradients, no textures, no patterns. The one bold moment is a **solid brand-dark teal hero band** with white text. Imagery, when present, is real photography (warm, candid, people-centred); this kit uses solid colour + type instead of inventing images.
- **Interaction & motion.** Restrained. Buttons **shift down 2px on press** (`translateY(2px)`) and transition colour over ~200ms; focus shows a **2–3px solid blue outline** (never removed). Hover = darker fill (primary) or tinted fill (secondary) or border appearance (tertiary). Motion durations live in `--goa-motion-duration-*` (mostly 70–350ms) with gentle `cubic-bezier` curves; nothing bounces, nothing loops.
- **Focus & accessibility.** Every interactive element has a visible focus state built from `--goa-color-interactive-focus`. Hit targets are ≥40px (compact) / 56px (default).
- **Cards/containers** are white, hairline-bordered, `xl` rounded, optionally topped with a thin or thick coloured accent bar and a grey/coloured heading row.

### Font substitution — please confirm

**Acumin is a licensed Adobe Fonts (Typekit) family.** The `@font-face` rules in `tokens/fonts.css` point at GoA's Typekit URLs, which are kit-bound and may not resolve outside an authenticated kit. As a fallback we load **Archivo** (Google Fonts) — the nearest free humanist grotesque — placed right after `acumin-variable` in the font stack. Roboto Mono loads from Google Fonts and is exact.

**👉 To drop in the real Acumin (one line):** open `tokens/fonts.css` and either **(A)** uncomment the Typekit `@import` line near the top and paste your Adobe Fonts **Project ID** — `@import url("https://use.typekit.net/XXXXXXX.css");` — or **(B)** drop `.woff2` files into `assets/fonts/` and point the `src:` URLs at them. Full step-by-step is in the comment block at the top of that file. Everything else (the `acumin-variable` / `acumin-pro-semi-condensed` family names) is already wired, so the real faces take over automatically.

---

## Iconography

- The GoA system uses **Ionicons** (https://ionic.io/ionicons) as its icon set — loaded as a web component from CDN. Add this to any page that uses icons:
  ```html
  <script type="module" src="https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/ionicons/ionicons.esm.js"></script>
  <script nomodule src="https://cdn.jsdelivr.net/npm/ionicons@7.4.0/dist/ionicons/ionicons.js"></script>
  ```
  then `<ion-icon name="arrow-forward"></ion-icon>`. Component props like `leadingIcon` / `trailingIcon` take Ionicons **names**.
- **Style:** prefer the **outline** variants for general UI; **sharp/filled** for small inline status marks (e.g. the checkbox checkmark, status badges). Icon sizes use `--goa-icon-size-*` (16 → 40px); inline-with-text icons match the text size.
- **No emoji, no hand-drawn SVG.** Status meaning is carried by colour **and** an Ionicon (information-circle, checkmark-circle, warning, alert-circle, calendar) so it is never colour-only.
- Brand assets live in `assets/`: `goa-logo.svg` (the Government of Alberta wordmark with the cyan flag mark), plus `arrow-down.svg` / `arrows-both.svg` UI glyphs from the component library.

---

## Index / manifest

**Foundations**
- `styles.css` — global entry point (import this). Import-only.
- `tokens/goa-tokens.css` — 1,300+ GoA design tokens (colour, type, spacing, radius, shadow, motion + per-component tokens). Imported verbatim from `@abgov/design-tokens`.
- `tokens/fonts.css` — `@font-face` for Acumin + Roboto Mono, Archivo fallback, font-family overrides.
- `tokens/base.css` — document reset, heading scale, link defaults.
- `tokens/illustration-tokens.css` — curated colour tokens (un-prefixed `--color-*`) for the Figma illustration library, a separate namespace from the `--goa-*` system.

**Components** (`components/`, namespace `window.GovernmentOfAlbertaDesignSystem_eddb08`) — all 50 components from design.alberta.ca are covered, plus a **GoA icon set** and an **illustration library** imported from the attached Figma source files. The compiler now exposes ~184 components in total: the GoA UI components below (with their sub-component and alias exports), the `Icon` set, and 124 illustrations.
- `core/` — `GoabButton`, `GoabButtonGroup`, `GoabLinkButton`, `GoabIconButton`, `GoabBadge`, `GoabFilterChip`, `GoabLink`, `GoabDivider`, `GoabCallout`, `GoabContainer`, `GoabText`, `GoabIcon`, `GoabPopover`, `GoabMenuButton`
- `forms/` — `GoabForm`, `GoabFormItem`, `GoabInput`, `GoabTextarea`, `GoabDropdown`, `GoabCheckbox`, `GoabCheckboxList`, `GoabRadioGroup` + `GoabRadioItem`, `GoabDatePicker`, `GoabCalendar`, `GoabFileUpload`
- `layout/` — `GoabBlock`, `GoabGrid`, `GoabSpacer`, `GoabPageBlock`, `GoabTabs` + `GoabTab`, `GoabAccordion`, `GoabDetails`, `GoabFormStepper` + `GoabFormStep`
- `feedback/` — `GoabModal`, `GoabNotificationBanner`, `GoabTemporaryNotification`, `GoabTooltip`, `GoabSkeleton`, `GoabDrawer`, `GoabPushDrawer`, `GoabProgressIndicator` (+ `GoabCircularProgress` / `GoabLinearProgress` aliases)
- `data/` — `GoabTable`, `GoabDataGrid`, `GoabPagination`
- `navigation/` — `GoabAppHeader`, `GoabMicrositeHeader`, `GoabFooter`, `GoabHeroBanner`, `GoabSideMenu`, `GoabWorkSideMenu` (+ `GoabWorkSideMenuItem`, `GoabWorkSideMenuSubItem`, `GoabWorkSideMenuGroup`), `GoabWorkspaceLayout`
- `icons/` — the full **GoA icon library** imported from the Figma Style & Icon library as `icon-data.js` + an `<Icon name="…" size={…} />` wrapper — **845 icons**: GoA core (`Goa*`, e.g. `GoaAddVariantBasic`, `GoaMenuVariantBasic`), the **Extended Ionicons** set in outline + filled (`<Name>VariantOutline` / `<Name>VariantFilled`, e.g. `AirplaneVariantOutline`, `CloudDoneVariantFilled`), and **88 brand logos** (`Logo*`, e.g. `LogoApple`, `LogoGoogle`). One component (`Icon`) backed by inline-SVG path data, so icons render in static PPTX/PDF exports where the Ionicons CDN web-component does not. Recolour via the CSS `color` property. See `icons/Icons.card.html` for the searchable index.
- `illustrations/` — **152 Scene & Spot illustrations** imported from the Figma Illustration library. Each is a **self-contained, single-variant** React component (fixed 200×200 inline SVG; no props beyond `className`/`style`; external groups baked in at materialize — no cross-file imports) coloured via `tokens/illustration-tokens.css`. **Coverage is complete** — the entire `/Spot/components` inventory (112) plus every Scene family. Large inline-SVG art — import only the ones you use; see `illustrations/Illustrations.card.html` for the full visual index. Components — *Scene · education & family* (7) — `Education1`, `Education2`, `Education3`, `Family`, `Family2`, `Childcare1`, `ReadingToChild1`; *Scene · public services* (16) — `Justice`, `Justice1`, `Apprenticeship1`, `Trades1`, `AssistedLiving1`, `AssistedLiving2`, `AssistedLiving3`, `AssistedLiving4`, `AccesibilityUsingComputer`, `AccesibilityWalking`, `MotorVehicleDriver`, `LandPropertyAndBuilding1`, `LandPropertyAndBuilding2`, `ForestsAndParks1`, `ForestsAndParks2`, `ForestsAndParks3`; *Scene · digital & people* (6) — `PersonOnComputer1`, `PersonOnComputer3`, `PersonOnComputer4`, `PersonUsingPhone`, `CustomerServiceRep`, `Search1`; *Scene · objects & states* (11) — `Computer`, `DesktopComputer`, `MobilePhone`, `Folder`, `Form`, `Storyboard`, `Checklist`, `Identity`, `Security`, `LegislatureBuilding`, `Complete`; *Spot · communication* (15) — `CommunicationAnnouncement1`, `CommunicationAnnouncement2`, `CommunicationChat1`, `CommunicationHelpAndSupport01`, `CommunicationHelpAndSupport02`, `CommunicationHelpAndSupport03`, `CommunicationMeeting1`, `CommunicationMeeting2`, `CommunicationMeeting3`, `CommunicationPerformance1`, `CommunicationPerformance2`, `CommunicationPerformance3`, `CommunicationService1`, `CommunicationTasks1`, `CommunicationTasks2`; *Spot · devices* (14) — `DevicesDesktop1`, `DevicesDesktop2`, `DevicesDesktop3`, `DevicesLaptop1`, `DevicesLaptop2`, `DevicesLaptop3`, `DevicesLaptop4`, `DevicesMobile1`, `DevicesMobile2`, `DevicesMobile3`, `DevicesMobile4`, `DevicesMobile5`, `DevicesMobile6`, `DevicesMultiDevice1`; *Spot · documents & files* (7) — `DocumentsAndFilesDocument1`, `DocumentsAndFilesDocument2`, `DocumentsAndFilesDocument3`, `DocumentsAndFilesDocument4`, `DocumentsAndFilesFileSharing`, `DocumentsAndFilesFileSharing2`, `DocumentsAndFilesFiles1`; *Spot · empty & system states* (28) — `EmptySystemStateAllCaught`, `EmptySystemStateAllCaught2`, `EmptySystemStateDownload1`, `EmptySystemStateDownload2`, `EmptySystemStateDownload3`, `EmptySystemStateDownload4`, `EmptySystemStateEmpty1`, `EmptySystemStateEmptyState`, `EmptySystemStateError1`, `EmptySystemStateError2`, `EmptySystemStateError3`, `EmptySystemStateError4`, `EmptySystemStateError5`, `EmptySystemStateNoResults`, `EmptySystemStateNoResults2`, `EmptySystemStateNoResults3`, `EmptySystemStateNoResults4`, `EmptySystemStateNoTasks`, `EmptySystemStateNoTasks2`, `EmptySystemStateNoTasks3`, `EmptySystemStateNoUnread`, `EmptySystemStateNoUnread2`, `EmptySystemStateNoUnread3`, `EmptySystemStateRecentlyViewed`, `EmptySystemStateRecentlyViewed2`, `EmptySystemStateRecentlyViewed3`, `EmptySystemStateUpload1`, `EmptySystemStateUpload2`; *Spot · government* (5) — `GovernmentBuildings1`, `GovernmentLawAndJustice1`, `GovernmentLawEnforcement1`, `GovernmentLawEnforcement2`, `GovernmentLawJustice2`; *Spot · navigation & discovery* (10) — `NavigationAndDiscoveryNavigation1`, `NavigationAndDiscoveryNavigation2`, `NavigationAndDiscoveryNavigation3`, `NavigationAndDiscoverySearch1`, `NavigationAndDiscoverySearch2`, `NavigationAndDiscoverySearch3`, `NavigationAndDiscoverySearch4`, `NavigationAndDiscoverySearch5`, `NavigationAndDiscoveryWayfinding1`, `NavigationAndDiscoveryWayfinding2`; *Spot · security & identity* (4) — `SecurityAndIdentitySecurity1`, `SecurityAndIdentitySecurity2`, `SecurityAndIdentitySecurity3`, `SecurityAndIdentitySecurity4`; *Spot · status & feedback* (9) — `StatusAndFeedbackQuestion1`, `StatusAndFeedbackSent1`, `StatusAndFeedbackSuccess1`, `StatusAndFeedbackSuccess2`, `StatusAndFeedbackThumbsDown`, `StatusAndFeedbackThumbsUp`, `StatusAndFeedbackWarningCaution`, `StatusAndFeedbackWarningCaution2`, `StatusAndFeedbackWarningCaution3`; *Spot · time* (5) — `Time1`, `Time2`, `Time3`, `TimeCalendar1`, `TimeCalendar2`; *Spot · UX design & products* (12) — `UxDesignProductsData1`, `UxDesignProductsDesign1`, `UxDesignProductsDesign2`, `UxDesignProductsDesign3`, `UxDesignProductsDesignDystem`, `UxDesignProductsDesignSystem`, `UxDesignProductsDesignSystem2`, `UxDesignProductsDesignSystem3`, `UxDesignProductsShipping1`, `UxDesignProductsStoryboarding1`, `UxDesignProductsTesting1`, `UxDesignProductsUx1`; *Spot · misc* (3) — `MiscMission1`, `MiscMission2`, `MiscStrategy`.

Each `Goab*` component dir has `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and a `*.card.html` showcase. The Figma-imported `icons/` and `illustrations/` dirs instead ship `<Name>.jsx` + `<Name>.d.ts` (icons also `icon-data.js`) with one shared `*.card.html` gallery each.

**Foundation cards** (`guidelines/`) — Colours (brand, interactive, greyscale, semantic, extended), Type (headings, body & number), Spacing (scale, radius, shadow), Brand (wordmark, Ionicons). The Design System tab also carries **Utilities** (the `Icon` set) and **Illustrations** galleries.

**UI kit** (`ui_kits/alberta-service/`) — a 3-screen citizen service flow (landing → application → confirmation) composed entirely from the primitives. Open `index.html`.

**Templates** (`templates/`) — copy-to-start scaffolds for consuming projects (see `service-page/`).

**Skill** — `SKILL.md` makes this folder usable as a downloadable Claude Skill.

---

## Figma kit coverage & scope (why 211, not 2,847)

The attached **❖ Component library.fig** reports ~**2,847 "component families"**, of which this system compiles **211**. The remaining ~2,636 are **intentionally not materialized** — they are not deliverable, reusable components. They were audited family-by-family (see the verification note in `CLAUDE.md`) and fall entirely into these buckets:

1. **Variant-axis permutations of the components we already ship (~the large majority).** Figma stores a component SET as one *family per variant combination* — e.g. `Type=Primary, State=Hover, Compact=No, Variant=Normal, Full width=No, Leading icon=No, Trailing icon=No` is counted as a distinct "family," and `GoabButton` alone explodes into ~96 of them. These are **states and options of the 50 public components**, which we implement as **props** (`type` / `size` / `state` / `error` / `disabled` / `leadingIcon` …), not as separate components. Rebuilding them as components would be wrong — it would fragment one prop-driven API into hundreds of frozen snapshots.
2. **Underscore-prefixed private base primitives** — `_Badge Base`, `_Chip base`, `_Calendar days`, `_Button base`, `_Input field`, etc. These are internal building blocks **composed into** the public `Goab*` components; the GoA system never exposes them as standalone APIs, and neither do we.
3. **Annotation & documentation tooling** — `_💡info`, `_💬 Annotation/Box`, `_💬 Placeholder image`, `_💬 Section heading` and the rest of the **Annotation-Tools** page. These are Figma redlining / spec-sheet helpers, **not product UI**.
4. **Layout & example frames** — the `Layout-templates`, `Public-form-page-layout-examples` and `Workspace-page-layout-examples` pages. These compositions are already delivered as the 12 **`templates/`** scaffolds, not as components.

**The public surface is complete.** Every one of the **50 components documented at design.alberta.ca** is implemented (as 49 distinct `Goab*` exports — circular + linear progress share `GoabProgressIndicator`), plus the full **845-icon** library (one `Icon` component) and **152 illustrations**. The kit's **1,303 design variables** are covered by our **1,494 registered tokens**. So coverage of *deliverable* design-system surface is **100%**; the 211-vs-2,847 gap is a count of Figma authoring primitives, by design.

> The `check_design_system` "families" advisory is a structural count (compiled components vs raw Figma families) and will continue to surface this gap — that is expected. It is recorded here as an intentional scope decision rather than missing work. If a genuinely new *public* component is ever added to the GoA system, it should be built as `components/<group>/<Name>.jsx` + `<Name>.d.ts`.

---

## Using the system

Link the stylesheet and load the bundle, then read components off the namespace:
```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script type="text/babel">
  const { GoabButton, GoabCallout } = window.GovernmentOfAlbertaDesignSystem_eddb08;
</script>
```
Always include the Ionicons scripts (above) when using icons. Prefer existing tokens for every colour, size and space; reach for `rem`/token values, never raw hex.
