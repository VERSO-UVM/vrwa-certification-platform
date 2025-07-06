import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  DrizzleAsyncProvider,
  type DrizzleProviderReturn,
} from 'src/database/drizzle.provider';
import { hash, verify } from '@node-rs/argon2';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: DrizzleProviderReturn,
  ) {}

  async validateLoginRequest(email: string, password: string) {
    const user = await this.db.client.query.user.findFirst({
      where: (users, { eq, and }) =>
        and(eq(users.email, email), eq(users.hasRegistered, true)),
    });

    if (!user || !user.passwordHash) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return AuthService.comparePasswordHashes(user.passwordHash, password);
  }

  private static async comparePasswordHashes(hash: string, password: string) {
    return await verify(hash, password);
  }

  private static async hashPassword(password: string) {
    return await hash(password);
  }
}
