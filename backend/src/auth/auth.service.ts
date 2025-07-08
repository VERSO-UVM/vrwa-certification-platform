import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DrizzleAsyncProvider,
  type DrizzleProviderReturn,
} from 'src/database/drizzle.provider';
import { hash, verify } from '@node-rs/argon2';
import { addDays } from 'date-fns';
import * as argon2 from 'argon2';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { zxcvbn, zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import { RegisterDto } from './auth.dto';
import { ConfigService } from '@nestjs/config';
import { SESSION_COOKIE_NAME as SESSION_COOKIE_BASENAME } from 'src/constants';
import { eq } from 'drizzle-orm';
import { Roles } from 'src/database/schema';

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
};
zxcvbnOptions.setOptions(options);

@Injectable()
export class AuthService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: DrizzleProviderReturn,
    private config: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async validateLoginRequest(email: string, password: string) {
    const user = await this.db.client.query.user.findFirst({
      where: (users, { eq, and }) =>
        and(eq(users.email, email), eq(users.hasRegistered, true)),
    });

    if (!user || !user.passwordHash) {
      this.logger.warn(
        `Login User: could not find user ${email} or user has null password`,
      );
      return null;
    }

    this.logger.log(`Login User: user ${email} comparing passwords`);

    // FIXME: This damn thing never returns, even when I use a different argon2 implementation. Both impls are bindings to the rust version; is that one bad?
    if (await AuthService.comparePasswordHashes(user.passwordHash, password)) {
      return user;
    }

    this.logger.warn(`Login User: user ${email} entered incorrect password`);
    return null;
  }

  async registerExistingUser(details: RegisterDto) {
    const [user] = await this.db.client
      .select()
      .from(this.db.schema.user)
      .where(eq(this.db.schema.user.email, details.email.trim()));

    if (!user) {
      this.logger.warn(
        `Register User: could not find user ${details.email} who isn't registered`,
      );
      return null;
    }

    const [regUser] = await this.db.client
      .update(this.db.schema.user)
      .set({
        firstName: details.firstName,
        lastName: details.lastName,
        passwordHash: await AuthService.hashPassword(details.password),
        role: Roles.Trainee,
        hasRegistered: true,
      })
      .where(eq(this.db.schema.user.email, user.email))
      .returning();

    this.logger.log(`Register User: successfully registered ${details.email}`);

    return regUser;
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

  async validateSessionToken(token: string) {
    // const sessionWithUser = await this.db.client.query.session.findFirst({
    //   where: (session, { eq, and, lt }) =>
    //     and(eq(session.id, token), lt(session.expiresAt, new Date())),
    // });
    const [sessionWithUser] = await this.db.client
      .select({
        // Adjust user table here to tweak returned data
        user: this.db.schema.user,
        session: this.db.schema.session,
      })
      .from(this.db.schema.session)
      .innerJoin(
        this.db.schema.user,
        eq(this.db.schema.session.userId, this.db.schema.user.id),
      )
      .where(eq(this.db.schema.session.id, token));

    if (!sessionWithUser) {
      return null;
    }

    // If session is expired, clear it from the database
    if (Date.now() >= sessionWithUser.session.expiresAt.getTime()) {
      await this.invalidateSessionToken(sessionWithUser.session.id);
      return null;
    }

    return sessionWithUser;
  }

  async invalidateSessionToken(token: string) {
    await this.db.client
      .delete(this.db.schema.session)
      .where(eq(this.db.schema.session.id, token));
  }

  async getOrganization(orgId: string) {
    const [org] = await this.db.client
      .select({
        orgDetails: this.db.schema.organization,
        memberCount: this.db.client.$count(
          this.db.schema.user,
          eq(this.db.schema.user.orgId, this.db.schema.organization.id),
        ),
      })
      .from(this.db.schema.organization)
      .where(eq(this.db.schema.organization.id, orgId));
    return org || null;
  }

  // Utility methods
  // static async checkPasswordRequirements(password: string) {
  // }

  get SessionCookieName() {
    const env = this.config.get('NODE_ENV') as string;
    if (env === 'production') {
      return `__Secure-${SESSION_COOKIE_BASENAME}`;
    }
    return SESSION_COOKIE_BASENAME;
  }

  private static comparePasswordHashes(hash: string, password: string) {
    return argon2.verify(hash, password);
  }

  private static hashPassword(password: string) {
    return argon2.hash(password);
  }
}
