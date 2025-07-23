// import { hash, verify } from '@node-rs/argon2';
import { addDays } from 'date-fns';
import * as argon2 from 'argon2';
import type { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { zxcvbn, zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import type { registerSchema } from './schemas';
import { eq } from 'drizzle-orm';
import { Roles } from 'src/database/schema';
import * as db from 'src/database';

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
};
zxcvbnOptions.setOptions(options);

export async function comparePasswordHashes(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function registerExistingUser(
  details: z.infer<typeof registerSchema>,
) {
  const [user] = await db.client
    .select()
    .from(db.schema.user)
    .where(eq(db.schema.user.email, details.email.trim()));

  if (!user) {
    // FIXME: Setup logging
    // this.logger.warn(
    //   `Register User: could not find user ${details.email} who isn't registered`,
    // );
    return null;
  }

  const [regUser] = await db.client
    .update(db.schema.user)
    .set({
      firstName: details.firstName,
      lastName: details.lastName,
      passwordHash: await hashPassword(details.password),
      role: Roles.Trainee,
      hasRegistered: true,
    })
    .where(eq(db.schema.user.email, user.email))
    .returning();

  // FIXME: Setup logging
  // this.logger.log(`Register User: successfully registered ${details.email}`);

  return regUser;
}

export async function issueSessionToken(userId: string) {
  // TODO: Figure out UTC and timezone stuff
  const expiry = addDays(new Date(), 14);

  const [session] = await db.client
    .insert(db.schema.session)
    .values({ userId, expiresAt: expiry })
    .returning();

  return session;
}

export async function validateSessionToken(token: string) {
  // const sessionWithUser = await db.client.query.session.findFirst({
  //   where: (session, { eq, and, lt }) =>
  //     and(eq(session.id, token), lt(session.expiresAt, new Date())),
  // });
  const [sessionWithUser] = await db.client
    .select({
      // Adjust user table here to tweak returned data
      user: db.schema.user,
      session: db.schema.session,
    })
    .from(db.schema.session)
    .innerJoin(db.schema.user, eq(db.schema.session.userId, db.schema.user.id))
    .where(eq(db.schema.session.id, token));

  if (!sessionWithUser) {
    return null;
  }

  // If session is expired, clear it from the database
  if (Date.now() >= sessionWithUser.session.expiresAt.getTime()) {
    await invalidateSessionToken(sessionWithUser.session.id);
    return null;
  }

  return sessionWithUser;
}

export async function invalidateSessionToken(token: string) {
  await db.client
    .delete(db.schema.session)
    .where(eq(db.schema.session.id, token));
}

export async function getOrganization(orgId: string) {
  const [org] = await db.client
    .select({
      orgDetails: db.schema.organization,
      memberCount: db.client.$count(
        db.schema.user,
        eq(db.schema.user.orgId, db.schema.organization.id),
      ),
    })
    .from(db.schema.organization)
    .where(eq(db.schema.organization.id, orgId));
  return org || null;
}

export async function validateLoginRequest(email: string, password: string) {
  const user = await db.client.query.user.findFirst({
    where: (users, { eq, and }) =>
      and(eq(users.email, email), eq(users.hasRegistered, true)),
  });

  if (!user || !user.passwordHash) {
    // FIXME: Setup logging
    // this.logger.warn(
    //   `Login User: could not find user ${email} or user has null password`,
    // );
    return null;
  }

  // FIXME: Setup logging
  // this.logger.log(`Login User: user ${email} comparing passwords`);

  // FIXME: This damn thing never returns, even when I use a different argon2 implementation. Both impls are bindings to the rust version; is that one bad?
  if (await comparePasswordHashes(user.passwordHash, password)) {
    return user;
  }

  // FIXME: Setup logging
  // this.logger.warn(`Login User: user ${email} entered incorrect password`);
  return null;
}
