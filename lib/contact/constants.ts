export const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL ?? 'hello@shape-d.com';

export const ADDITIONAL_CONTACT_EMAILS = [
  'kota.akashi@autodevjapan.com',
] as const;

/** Server-side recipients for contact form submissions */
export const CONTACT_RECIPIENTS: readonly string[] = Array.from(
  new Set([CONTACT_EMAIL, ...ADDITIONAL_CONTACT_EMAILS]),
);

/** Client-visible contact address for mailto links */
export const PUBLIC_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? CONTACT_EMAIL;
