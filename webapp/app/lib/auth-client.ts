import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import type { auth } from "@backend/auth/server";

export const authClient = createAuthClient<typeof auth>({
  baseURL: import.meta.env.VITE_BACKEND || "http://localhost:3000",
  plugins: [
    adminClient(),
    organizationClient(),
  ],
});

export const { signIn, signUp, useSession, signOut } = authClient;
