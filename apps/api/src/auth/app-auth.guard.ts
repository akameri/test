import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DEMO_USER } from './auth-user';

/**
 * Globaler Guard:
 *  - AUTH_MODE=demo → jede Anfrage läuft als Demo-Admin (lokale Entwicklung/Demo)
 *  - AUTH_MODE=oidc → Bearer-Token wird gegen Keycloak validiert
 */
@Injectable()
export class AppAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if ((process.env.AUTH_MODE ?? 'demo') !== 'oidc') {
      const req = context.switchToHttp().getRequest();
      req.user = DEMO_USER;
      return true;
    }
    return super.canActivate(context);
  }
}
