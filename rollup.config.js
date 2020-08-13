import fs from 'fs'
import path from 'path'
import typescript from '@wessberg/rollup-plugin-ts'
import json from '@rollup/plugin-json'
import alias from '@rollup/plugin-alias'
import { terser } from 'rollup-plugin-terser'
import cleanup from 'rollup-plugin-cleanup'
const { scope } = require('./scripts/setting')

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.')
}

const packagesDir = path.resolve(__dirname, 'packages')
const packageDir = path.resolve(packagesDir, process.env.TARGET)
const name = path.basename(packageDir)

const resolve = (p) => path.resolve(packageDir, p)

const pkg = require(resolve(`package.json`))

const peers = pkg.peerDependencies && Object.keys(pkg.peerDependencies)

console.log(peers)

const formats = {
  esm: {
    file: resolve(`dist/index.esm.js`),
    format: `es`
  },
  esmmin: {
    file: resolve(`dist/index.esm.min.js`),
    format: `es`,
    plugins: [terser()]
  },
  umd: {
    file: resolve(`dist/index.umd.js`),
    format: `umd`,
    plugins: [terser()]
  }
}

const aliasOptions = { resolve: ['.ts'], entries: {} }
fs.readdirSync(packagesDir).forEach((dir) => {
  if (fs.statSync(path.resolve(packagesDir, dir)).isDirectory()) {
    aliasOptions.entries[`@${scope}/${dir}`] = path.resolve(
      packagesDir,
      `${dir}/src`
    )
  }
})

/**
 * @type {import('rollup').RollupOptions}
 */
const CONFIG = [
  {
    input: resolve(`src/index.ts`),
    output: [],
    plugins: [
      cleanup({
        extensions: ['ts', 'tsx', 'js', 'jsx']
      }),
      typescript({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      json(),
      alias(aliasOptions)
    ],
    external: peers
  }
]

const defaultFormats = ['esm', 'esmmin', 'umd']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || defaultFormats

packageFormats.forEach((format) => {
  console.log(formats[format])
  CONFIG[0].output.push(
    Object.assign(formats[format], { name: `@${scope}/${name}`, extend: true })
  )
})

export default CONFIG
