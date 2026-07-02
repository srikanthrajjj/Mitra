import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const base = process.env.VITE_BASE_PATH ?? '/';
  const outDir = process.env.VITE_OUT_DIR ?? 'dist';

  return {
    base,
    build: {
      outDir,
      emptyOutDir: process.env.VITE_EMPTY_OUTDIR !== 'false',
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              // Agent/tsc logs in repo root must not trigger full-page reload loops.
              ignored: [
                '**/*.txt',
                '**/dist/**',
                '**/.worktrees/**',
                '**/coverage/**',
              ],
            },
    },
  };
});
