import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Talks to BetterAuth on the API through this site's /api/auth address.
// role matches the extra field set up in server/src/config/auth.ts.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields({ user: { role: { type: "string", required: false, input: false } } })],
});

export const { signIn, signUp, signOut, useSession } = authClient;
