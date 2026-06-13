import { describe, expect, it } from 'vitest';
import {
  ADDITIONAL_CONTACT_EMAILS,
  CONTACT_EMAIL,
  CONTACT_RECIPIENTS,
  PUBLIC_CONTACT_EMAIL,
} from '@/lib/contact/constants';

describe('contact constants', () => {
  it('includes primary and additional recipients without duplicates', () => {
    expect(CONTACT_RECIPIENTS).toEqual([
      CONTACT_EMAIL,
      ...ADDITIONAL_CONTACT_EMAILS,
    ]);
    expect(CONTACT_RECIPIENTS).toContain('kota.akashi@autodevjapan.com');
  });

  it('uses CONTACT_EMAIL as default public address', () => {
    expect(PUBLIC_CONTACT_EMAIL).toBe(CONTACT_EMAIL);
  });
});
