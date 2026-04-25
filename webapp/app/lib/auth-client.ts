import { createAuthClient } from "better-auth/react";
import type { auth } from "@backend/auth/server";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND || "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
}) as ReturnType<typeof createAuthClient>;

export const { signIn, signUp, useSession, signOut, getSession } = authClient;
