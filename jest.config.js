/** @type {import('jest').Config} */
const config = {
  bail: 1,
  clearMocks: true,
  collectCoverageFrom: [
    '!**/node_modules/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.d.ts',
    '.js'
  ],
  coverageReporters: [
    'html',
    'text'
  ],
  errorOnDeprecated: true,
  setupFilesAfterEnv: [
    './tests/jest.setup.js'
  ],
  roots: [
    './src/',
    './tests/'
  ],
  testEnvironment: 'node',
  preset: 'ts-jest'
}

module.exports = config
