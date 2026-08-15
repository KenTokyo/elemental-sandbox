import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // 6067 is this project's registered root port (see PROJECTS.md). `strictPort`
  // is deliberate: silently sliding to 6068 would put the sandbox on a port
  // that belongs to some other project. 6038 and 6066 were both claimed by
  // other projects while this one was being built — check PROJECTS.md, not the
  // last handover note, before changing this.
  server: {
    host: '127.0.0.1',
    port: 6067,
    strictPort: true,
    open: false
  },
  preview: {
    host: '127.0.0.1',
    port: 6067,
    strictPort: true
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 2000
  },
  // Large binary assets (FBX / HDR) live in /public and are served untouched.
  assetsInclude: ['**/*.fbx', '**/*.hdr']
});
