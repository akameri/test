import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from './auth-user';

/**
 * Validiert Bearer-Token gegen Keycloak (JWKS). Kein eigenes Passwort-Handling –
 * MFA/SSO übernimmt der Identity Provider.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const issuer = process.env.KEYCLOAK_ISSUER!;
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer,
      audience: process.env.KEYCLOAK_AUDIENCE || undefined,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${issuer}/protocol/openid-connect/certs`,
      }),
    });
  }

  validate(payload: Record<string, any>): AuthUser {
    return {
      id: payload.sub,
      name: payload.name ?? payload.preferred_username ?? payload.sub,
      email: payload.email ?? '',
      roles: payload.realm_access?.roles ?? [],
    };
  }
}
