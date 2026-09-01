/*
 * JSX -> js/.
 *
 * The screen modules are global-scope scripts, not ES modules: each declares its
 * components and ends with `window.X = X`. So this is a transform only, with no
 * bundling, and index.html loads the output with script tags in dependency
 * order. React is a global, hence the classic JSX runtime.
 */
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';

const ENTRIES = [
  'src/LazyFrame.jsx',
  'src/AdvanceIntelligence.jsx',
  'src/QAPrototypeScreen.jsx',
  'src/ClaimsShell.jsx',
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
});

if (result.errors.length) process.exit(1);
