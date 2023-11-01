import { Plugin } from 'esbuild';
import { defineConfig } from 'tsup';

// Tell esbuild not to bundle the JSON file so that we reuse it between CommonJS and ESM builds.
const externalJsonPlugin = (): Plugin => ({
  name: 'external-json',
  setup(build) {
    build.onResolve({ filter: /user-agents\.json$/ }, (args) => {
      return {
        path: args.path,
        external: true,
      };
    });
  },
});

export default defineConfig({
  cjsInterop: true,
  dts: true,
  entryPoints: ['src/index.ts'],
  esbuildPlugins: [externalJsonPlugin()],
  format: ['cjs', 'esm'],
  minify: true,
  outDir: 'dist',
  // CJS interop is broken without splitting, see:
  //   * https://github.com/egoist/tsup/issues/992#issuecomment-1763540165
  splitting: true,
  sourcemap: true,
  target: 'node8',
});
