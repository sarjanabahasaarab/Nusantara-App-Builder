# Nusantara App Builder — Test Suites

This directory contains test suites and specifications for Nusantara App Builder.

- Unit and component tests are located in `src/tests/` (run with `npm test`).
- Test suites cover:
  - `androidXmlGenerator.test.ts`: XML layout generation and view mapping.
  - `buildEngine.test.ts`: Toolchain diagnostics, secret masking, argument arrays.
  - `releaseCenter.test.ts`: Keystore generation, APK/AAB signing checks.
  - `monetization.test.ts`: AdMob App ID validation, ad units, and policy diagnostics.
  - `pluginSystem.test.ts`: Plugin sandbox, permission checks, and component registry.
