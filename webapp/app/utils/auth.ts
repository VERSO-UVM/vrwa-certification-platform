import { createAuthClient } from "better-auth/react";
import type { auth } from "@backend/auth/server";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { getBackendUrl } from "./env";

export const authClient = createAuthClient({
  baseURL: getBackendUrl(),
  plugins: [inferAdditionalFields<typeof auth>()],
}) as ReturnType<typeof createAuthClient>;

export const { signIn, signUp, useSession, signOut, getSession } = authClient;
