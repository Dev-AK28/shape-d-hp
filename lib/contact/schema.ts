import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(254),
  company: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(1, 'Message is required').max(5000),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
