import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";

// Narrowing to `any` avoids TS2742 non-portable inferred type emission in this monorepo.
export const authClient: any = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND || "http://localhost:3000",
  plugins: [adminClient(), organizationClient()],
});

export const { signIn, signUp, useSession, signOut, getSession } =
  authClient as any;
