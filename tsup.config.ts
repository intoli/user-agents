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
  entryPoints: ['src/index.cjs'],
  esbuildPlugins: [externalJsonPlugin()],
  format: ['cjs', 'esm'],
  minify: true,
  outDir: 'dist',
  sourcemap: true,
});
