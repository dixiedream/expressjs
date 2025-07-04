import neostandard from 'neostandard'

export default neostandard({
  ts: true,
  filesTs: ['./src/**/*.ts', './tests/**/*.ts'],
  ignores: ['./dist/**/*']
})
