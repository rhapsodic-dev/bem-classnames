import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  format: 'esm',
  dts: true,
  sourcemap: false,
  clean: true,
  target: 'es2020',
  platform: 'neutral',
  deps: {
    neverBundle: [
      '@rhapsodic/bem-classnames',
      'vue',
    ],
  },
});
