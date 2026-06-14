import { describe, expect, it } from 'vitest';
import { isNavItemActive } from '@/lib/navigation/is-nav-active';

describe('isNavItemActive', () => {
  it('matches home only on exact path', () => {
    expect(isNavItemActive('/', '/')).toBe(true);
    expect(isNavItemActive('/services', '/')).toBe(false);
  });

  it('matches subroutes for section links', () => {
    expect(isNavItemActive('/process/development', '/process')).toBe(true);
    expect(isNavItemActive('/process', '/process')).toBe(true);
    expect(isNavItemActive('/philosophy', '/process')).toBe(false);
  });
});
