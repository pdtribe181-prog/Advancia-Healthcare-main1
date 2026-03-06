/**
 * Advancia Healthcare â€” single brand (this repo).
 * One landing, one support email. Localhost and advancia-healthcare.com both use healthcare branding.
 */
export const HEALTHCARE_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  'advancia-healthcare.com',
  'www.advancia-healthcare.com',
] as const;

const HEALTHCARE_PREVIEW_PATTERN = /advancia-healthcare.*\.vercel\.app$/i;

export function isHealthcareHost(hostname: string): boolean {
  if (HEALTHCARE_HOSTNAMES.includes(hostname as any)) return true;
  return HEALTHCARE_PREVIEW_PATTERN.test(hostname);
}

export function getSupportEmail(_hostname: string): string {
  return 'support@advancia-healthcare.com';
}

export const SIGNUP_ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'https://advancia-healthcare.com';
