import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // ES2019 keeps the output parseable by older Safari and Hermes:
  // class fields, ?. and ?? are down-leveled
  target: 'es2019',
  // Peer and regular dependencies are external by default; listed for clarity
  external: ['react', '@atomic-reactor/event-handle'],
});
