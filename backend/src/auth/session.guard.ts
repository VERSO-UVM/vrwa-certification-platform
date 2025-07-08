import { AuthGuard } from '@nestjs/passport';
import { SESSION_STRATEGY_NAME } from './session.strategy';

export class SessionGuard extends AuthGuard(SESSION_STRATEGY_NAME) {}
