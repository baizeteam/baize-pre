import path from 'node:path'
import { fileURLToPath } from 'node:url'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'
import typescript from 'rollup-plugin-typescript2'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
  {
    input: 'src/main.module.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: false,
      inlineDynamicImports: true,
    },
    plugins: [
      alias({
        entries: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
      }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: true }),
      copy({
        targets: [
          { src: 'README.md', dest: 'dist' },
          { src: '.gitignore', dest: 'dist' },
          { src: '.prettierrc', dest: 'dist' },
          { src: 'eslint.config.js', dest: 'dist' },
          { src: 'lint-staged.config.mjs', dest: 'dist' },
          { src: 'tsconfig.json', dest: 'dist' },
          { src: 'tsconfig.vue.json', dest: 'dist' },
          { src: 'tsconfig.react.json', dest: 'dist' },
        ],
      }),
    ],
    external: [
      'inquirer',
      'commander',
      'chalk',
      'readline-sync',
      'fs-extra',
      'simple-git',
      'source-map-support',
      'fs',
      'path',
      'url',
    ],
  },
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/cli.mjs',
      format: 'esm',
      sourcemap: false,
      inlineDynamicImports: true,
      banner: '#!/usr/bin/env node',
    },
    plugins: [
      alias({
        entries: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
      }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', useTsconfigDeclarationDir: true }),
    ],
    external: [
      'inquirer',
      'commander',
      'chalk',
      'readline-sync',
      'fs-extra',
      'simple-git',
      'source-map-support',
      'fs',
      'path',
      'url',
    ],
  },
]
