import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import db from '../../database';
import { SESSION_COOKIE_NAME } from 'src/constants';
import { eq } from 'drizzle-orm';
import type { Session, User } from 'src/database/schema';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const authCookie = req.cookies[SESSION_COOKIE_NAME];
  let user: User | null = null,
    session: Session | null = null;

  /***
  Authentication works by checking if there are session details attached to this request. If so, it makes sure those details are valid, 
  and attaches those details to the request for later use. This does not block requests that aren't authenticated though - another middleware checks 
  the `user` and `session` context properties, rejecting requests where they are null.
   */
  if (typeof authCookie === 'string') {
    const [result] = await db.client
      .select({
        // Adjust user table here to tweak returned data
        user: db.schema.user,
        session: db.schema.session,
      })
      .from(db.schema.session)
      .innerJoin(
        db.schema.user,
        eq(db.schema.session.userId, db.schema.user.id),
      )
      .where(eq(db.schema.session.id, authCookie));

    if (result) {
      user = result.user;
      session = result.session;

      // If the session is expired, delete session, clear cookie, and reset the user/session variables to null.
      const sessionExpired = Date.now() >= session.expiresAt.getTime();
      if (sessionExpired) {
        await db.client
          .delete(db.schema.session)
          .where(eq(db.schema.session.id, session.id));
        user = null;
        session = null;
        res.clearCookie(SESSION_COOKIE_NAME);
      }
    }
  }

  return { req, res, db, user, session };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
