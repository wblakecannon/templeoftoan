// vitest resolves the "browser" package export condition under the jsdom
// test environment, which is the condition the real `server-only` package
// uses to throw (it's meant to catch an accidental client-bundle import,
// not a test run). Alias it to this no-op so server-only modules stay
// importable in tests.
export {};
