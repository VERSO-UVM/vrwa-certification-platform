import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { SessionUser } from 'src/database/schema';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const {
      user,
    }: {
      user: SessionUser;
    } = context.switchToHttp().getRequest();
    return { user };
  },
);
