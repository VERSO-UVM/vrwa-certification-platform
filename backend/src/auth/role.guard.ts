import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './role.decorator';
import { SessionUser, UserRole } from 'src/database/schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const {
      user,
    }: {
      user: SessionUser;
    } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.user.role.includes(role));
  }
}
