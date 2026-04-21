export function getApiBaseUrl(): string {
  // Use IPv4 literal: `localhost` often resolves to ::1 first while Sails listens on IPv4 only.
  return process.env.E2E_API_BASE_URL ?? 'http://127.0.0.1:1337';
}

export function getDemoCredentials(): { emailOrUsername: string; password: string } {
  return {
    emailOrUsername: process.env.E2E_DEMO_USER ?? 'demo',
    password: process.env.E2E_DEMO_PASSWORD ?? 'demo',
  };
}
