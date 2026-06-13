/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  // Automatically restore mocks between tests
  restoreMocks: true,
  // Force exit after all tests complete — prevents Jest hanging on open handles
  forceExit: true,
};
