import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn('RESEND_API_KEY is not set. Emails will not be sent.');
}

// Create Resend client only if API key is available
// Using a placeholder key for build time to prevent initialization errors
export const resend = new Resend(apiKey || 're_placeholder_key');

export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || 'Craefto <hello@craefto.com>';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@craefto.com';

// Helper to check if emails are enabled
export const isEmailEnabled = () => Boolean(process.env.RESEND_API_KEY);
