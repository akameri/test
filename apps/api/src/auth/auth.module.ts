import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AppAuthGuard } from './app-auth.guard';

const oidcEnabled = (process.env.AUTH_MODE ?? 'demo') === 'oidc';

@Module({
  imports: [PassportModule],
  // Die JWT-Strategie wird nur im OIDC-Modus registriert – im Demo-Modus
  // würde sie mangels KEYCLOAK_ISSUER beim Start fehlschlagen.
  providers: oidcEnabled ? [JwtStrategy, AppAuthGuard] : [AppAuthGuard],
  exports: [AppAuthGuard],
})
export class AuthModule {}
