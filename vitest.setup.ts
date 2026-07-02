/**
 * Vitest global setup file.
 *
 * Registers `afterEach(cleanup)` explicitly because `globals: false` (vitest default)
 * prevents @testing-library/react from auto-detecting `globalThis.afterEach` and
 * registering cleanup automatically.
 *
 * Issue: #279
 */
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react/pure';

afterEach(cleanup);
