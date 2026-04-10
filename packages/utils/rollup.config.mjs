/* eslint-disable import-x/no-extraneous-dependencies */
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
    // keep node_modules external
    external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.includes('src'),
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
    // keep node_modules external
    external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.includes('src'),
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  {
    input: 'src/timer.js',
    output: {
      file: 'dist/timer.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  {
    input: 'src/truncate-if.js',
    output: {
      file: 'dist/truncate-if.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];
