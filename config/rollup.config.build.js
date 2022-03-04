import typescript from 'rollup-plugin-typescript';
import cjs from '@rollup/plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import polyfill from 'rollup-plugin-polyfill-node';

export default [
  {
    input: `browser/src/HashlinkVerifier.ts`,
    output: [
      {
        file: `hashlink/HashlinkVerifier.js`,
        format: 'cjs'
      }
    ],
    plugins: [
      cjs(),
      resolve({
        browser: true,
        preferBuiltins: true,
        extensions: ['.js', '.json']
      }),
      polyfill(),
      typescript()
    ]
  }
];
