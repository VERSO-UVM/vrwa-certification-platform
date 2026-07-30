/// Client-side part of better-auth.

import { createAuthClient } from "better-auth/react";
import type { auth } from "@backend/auth/server";
export type { Session } from "@backend/auth/server";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { getBackendUrl } from "./env";

// We need to be careful how we define this to not break
// typescript inference
export const authClient = createAuthClient({
  baseURL: getBackendUrl(),
  plugins: [inferAdditionalFields<typeof auth>()],
}) as ReturnType<typeof createAuthClient>;

export const { signIn, signUp, useSession, signOut, getSession } = authClient;
