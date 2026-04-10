import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { glob } from 'glob';
import dts from 'rollup-plugin-dts';

const plugins = [resolve(), commonjs()];

const input = glob.sync('src/**/*.js');

export default [
  {
    input,
    output: {
      dir: 'dist/esm',
      format: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
    },
    plugins,
  },
  {
    input,
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
      exports: 'named',
    },
    plugins,
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
