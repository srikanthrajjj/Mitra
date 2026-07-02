/**
 * Netlify build: builds the current code as a static SPA served at the root.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distPath = path.join(root, 'dist');

function run(cmd, options = {}) {
  execSync(cmd, {
    stdio: 'inherit',
    cwd: root,
    shell: true,
    ...options,
  });
}

console.log('Cleaning dist/…');
fs.rmSync(distPath, { recursive: true, force: true });
fs.mkdirSync(distPath, { recursive: true });

console.log('Building app → /');
run(`npx vite build --base / --outDir "${distPath}" --emptyOutDir true`);

const redirectsSrc = path.join(root, 'public', '_redirects');
if (fs.existsSync(redirectsSrc)) {
  fs.copyFileSync(redirectsSrc, path.join(distPath, '_redirects'));
}

console.log('Done. dist/ = current build (/).');
