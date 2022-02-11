import serve from 'rollup-plugin-serve';
import typescript from 'rollup-plugin-typescript';
import livereload from 'rollup-plugin-livereload';
import cjs from '@rollup/plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import polyfill from 'rollup-plugin-polyfill-node';
import fs from 'fs';

const BUILD_OUTPUT_FOLDER = './dev';
const DEV_INPUT_FOLDER = './browser';

export default [
  {
    input: `${DEV_INPUT_FOLDER}/src/index.ts`,
    output: [
      {
        file: `${BUILD_OUTPUT_FOLDER}/index-iife.js`,
        format: 'iife',
        name: 'ManualTest'
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
      typescript(),
      serve({
        contentBase: [BUILD_OUTPUT_FOLDER, DEV_INPUT_FOLDER],
        host: '0.0.0.0',
        port: 9999,
        open: true,
        https: {
          cert: fs.readFileSync(`${DEV_INPUT_FOLDER}/https-cert/cert.pem`),
          key: fs.readFileSync(`${DEV_INPUT_FOLDER}/https-cert/key.pem`)
        }
      }),
      livereload({
        watch: [DEV_INPUT_FOLDER]

      })
    ]
  }
];
