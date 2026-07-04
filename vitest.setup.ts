/**
 * Vitest global setup file.
 *
 * Registers `afterEach(cleanup)` explicitly because `globals: false` (vitest default)
 * prevents @testing-library/react from auto-detecting `globalThis.afterEach` and
 * registering cleanup automatically.
 *
 * Issue: #279
 *
 * ## `IS_REACT_ACT_ENVIRONMENT` (#292)
 * With `globals: false`, @testing-library/react does not auto-register the
 * `beforeAll`/`afterAll` hooks that toggle React's `IS_REACT_ACT_ENVIRONMENT`
 * flag. RTL's `render` / `renderHook` / `userEvent` still wrap their own updates
 * in `act`, so existing tests are unaffected. Setting the flag globally here is a
 * safety net so a future raw `act(async () => { ... })` test does not emit React's
 * "not wrapped in act(...)" warning. Safe to leave on for the whole suite.
 *
 * ## Hook ordering (#291)
 * `afterEach(cleanup)` below relies on `vitest.config.ts` keeping the default
 * `sequence.hooks: "stack"`, which runs `afterEach` hooks inner→outer (per test).
 * If `sequence.hooks` is ever switched to `"parallel"`, this `cleanup` could run
 * concurrently with other `afterEach` hooks (e.g. `vi.unstubAllGlobals()`),
 * unmounting the DOM mid-teardown. Before that migration, verify cleanup timing
 * or pin cleanup to each describe's `afterEach` explicitly.
 */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react/pure';

// #292: opt into React's act environment for the whole suite (see doc-comment above).
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(cleanup);
