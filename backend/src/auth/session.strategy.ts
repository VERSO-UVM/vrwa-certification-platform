import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-custom';

import { AuthService } from './auth.service';
import { SessionUser } from 'src/database/schema';
import { type FastifyRequest } from 'fastify';

export const SESSION_STRATEGY_NAME = 'auth-session';

// This is what attaches user to the Request object, allowing `req.user`
@Injectable()
export class SessionStrategy extends PassportStrategy(
  Strategy,
  SESSION_STRATEGY_NAME,
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: FastifyRequest): Promise<SessionUser | null> {
    const sessionToken = req.cookies[this.authService.SessionCookieName];
    if (!sessionToken) {
      throw new UnauthorizedException({ message: 'Login required' });
    }

    const sessionUser =
      await this.authService.validateSessionToken(sessionToken);
    if (!sessionUser) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid Session',
      });
    }

    return sessionUser;
  }
}
