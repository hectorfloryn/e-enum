import * as esbuild from 'esbuild'

const formats = ['cjs', 'esm']

for (const format of formats) {
  const options = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    write: true,
    format,
    target: 'es2015',
    outfile: `dist/index.${format}.js`
  }
  await esbuild.build(options)
  await esbuild.build({ ...options, minify: true, outfile: `dist/index.${format}.min.js` })
}