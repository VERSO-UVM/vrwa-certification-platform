import { createAuthClient } from "better-auth/react";
import { AuthHandler } from "../../../backend/src/auth/server";

import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: import.meta.env.VITE_BACKEND || "http://localhost:3000",
  plugins: [
    adminClient(),
    organizationClient(),
    inferAdditionalFields<AuthHandler>(),
  ],
});
