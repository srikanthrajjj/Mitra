/**
 * Netlify dual deploy:
 *   /       — stable build (frozen at STABLE_COMMIT)
 *   /test/  — current development build (all new features)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const STABLE_COMMIT = 'e900c12';
const worktreePath = path.join(root, '.worktrees', 'stable');
const distPath = path.join(root, 'dist');
const testDistPath = path.join(distPath, 'test');

function run(cmd, options = {}) {
  execSync(cmd, {
    stdio: 'inherit',
    cwd: root,
    shell: true,
    ...options,
  });
}

function removeWorktree() {
  if (!fs.existsSync(worktreePath)) return;
  try {
    run(`git worktree remove "${worktreePath}" --force`);
  } catch {
    fs.rmSync(worktreePath, { recursive: true, force: true });
  }
}

console.log('Cleaning dist/…');
fs.rmSync(distPath, { recursive: true, force: true });
fs.mkdirSync(distPath, { recursive: true });

removeWorktree();
fs.mkdirSync(path.dirname(worktreePath), { recursive: true });

console.log(`Checking out stable build (${STABLE_COMMIT})…`);
run(`git worktree add "${worktreePath}" ${STABLE_COMMIT}`);
console.log('Building stable app → /');
run(`npx vite build --base / --outDir "${distPath}" --emptyOutDir false`, { cwd: worktreePath });

console.log('Building development app → /test/');
run(
  `npx vite build --base /test/ --outDir "${testDistPath}" --emptyOutDir true`,
);

const redirectsSrc = path.join(root, 'public', '_redirects');
if (fs.existsSync(redirectsSrc)) {
  fs.copyFileSync(redirectsSrc, path.join(distPath, '_redirects'));
}

removeWorktree();
console.log('Done. dist/ = stable (/), dist/test/ = development (/test/).');
