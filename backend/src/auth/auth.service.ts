import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  DrizzleAsyncProvider,
  type DrizzleProviderReturn,
} from 'src/database/drizzle.provider';
import { hash, verify } from '@node-rs/argon2';
import { addDays } from 'date-fns';

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
      return null;
    }

    if (await AuthService.comparePasswordHashes(user.passwordHash, password))
      return user;

    return null;
  }

  async issueSessionToken(userId: string) {
    // TODO: Figure out UTC and timezone stuff
    const expiry = addDays(new Date(), 14);

    const [session] = await this.db.client
      .insert(this.db.schema.session)
      .values({ userId, expiresAt: expiry })
      .returning();

    return session;
  }

  // Utility methods
  private static async comparePasswordHashes(hash: string, password: string) {
    return await verify(hash, password);
  }

  private static async hashPassword(password: string) {
    return await hash(password);
  }
}
