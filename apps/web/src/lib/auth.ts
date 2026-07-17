import type { AuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

/**
 * Authentifizierung über Keycloak (OIDC) – MFA/SSO übernimmt der Identity
 * Provider. Ohne KEYCLOAK_ISSUER läuft die App im Demo-Modus ohne Login.
 */
export const authOptions: AuthOptions = {
  providers: process.env.KEYCLOAK_ISSUER
    ? [
        KeycloakProvider({
          clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'nis2-web',
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
          issuer: process.env.KEYCLOAK_ISSUER,
        }),
      ]
    : [],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account }) {
      // Access-Token merken, um es an die NestJS-API weiterzureichen
      if (account?.access_token) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
};
