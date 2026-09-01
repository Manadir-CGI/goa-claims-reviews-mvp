/*
 * Compiles the design project's JSX modules into plain scripts.
 *
 * The modules are global-scope scripts, not ES modules: each one declares its
 * components and ends with `window.X = X`. So this is a JSX transform only —
 * no bundling and no module resolution — and the output is loaded with ordinary
 * <script> tags in dependency order. React is a global, which is why the classic
 * runtime (React.createElement) is used rather than the automatic one.
 *
 * Output goes to js/ beside the design-system bundles, so every path in
 * index.html stays root-relative and the deepest `_ds/...` path does not grow
 * (it is already 262 characters on Windows, past MAX_PATH).
 */
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';

const ENTRIES = [
  'LazyFrame.jsx',
  'AdvanceIntelligence.jsx',
  'QAPrototypeScreen.jsx',
  'ClaimsShell.jsx',
];

await mkdir('js', { recursive: true });

const result = await build({
  entryPoints: ENTRIES,
  outdir: 'js',
  bundle: false,
  format: 'iife',
  target: 'es2020',
  loader: { '.jsx': 'jsx' },
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  logLevel: 'info',
  minify: false,
  sourcemap: false,
});

if (result.errors.length) process.exit(1);
console.log(`compiled ${ENTRIES.length} modules -> js/`);
