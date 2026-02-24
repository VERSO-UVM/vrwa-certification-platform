import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import db from '~/database';
import { SESSION_COOKIE_NAME } from '~/constants';
import { eq } from 'drizzle-orm';
import type { Session, Account } from '~/database/schema';

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const authCookie = req.cookies[SESSION_COOKIE_NAME];
  let account: Account | null = null,
    session: Session | null = null;

  /***
  Authentication works by checking if there are session details attached to this request. If so, it makes sure those details are valid, 
  and attaches those details to the request for later use. This does not block requests that aren't authenticated though - another middleware checks 
  the `account` and `session` context properties, rejecting requests where they are null.
   */
  if (typeof authCookie === 'string') {
    const [result] = await db.client
      .select({
        // Adjust account table here to tweak returned data
        account: db.schema.account,
        session: db.schema.session,
      })
      .from(db.schema.session)
      .innerJoin(
        db.schema.account,
        eq(db.schema.session.accountId, db.schema.account.id),
      )
      .where(eq(db.schema.session.id, authCookie));

    if (result) {
      account = result.account;
      session = result.session;

      // If the session is expired, delete session, clear cookie, and reset the account/session variables to null.
      const sessionExpired = Date.now() >= session.expiresAt.getTime();
      if (sessionExpired) {
        await db.client
          .delete(db.schema.session)
          .where(eq(db.schema.session.id, session.id));
        account = null;
        session = null;
        res.clearCookie(SESSION_COOKIE_NAME);
      }
    }
  }

  return { req, res, db, account, session };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
