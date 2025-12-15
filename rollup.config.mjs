import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      nodeResolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      commonjs(),
      postcss({
        extract: 'DivvyloreChatWidget.css',
        minimize: true,
      }),
      typescript({ tsconfig: './tsconfig.lib.json' }),
    ],
  },
  {
    input: './dist/types/index.d.ts',
    output: [{ file: 'dist/DivvyloreChatWidget.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];
