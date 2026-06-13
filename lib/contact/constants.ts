export const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL ?? 'hello@shape-d.com';

export const PUBLIC_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? CONTACT_EMAIL;

/** JSON body upper bound (~5KB message + field overhead) */
export const MAX_CONTACT_BODY_BYTES = 32_768;

export const RESEND_TIMEOUT_MS = 10_000;
