import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { nextCookies } from "better-auth/next-js";
import { client } from "@/lib/server/mongodb";
import { passwordProblem } from "@/lib/shared/validation";

const db = client.db(process.env.DB_NAME || "shopdesk");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  account: {
    // Someone who first registered with a password can later use "Continue with Google" with the
    // same email. Google confirms the person owns that address, so the two logins join into one account.
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      prompt: "select_account",
    },
  },
  user: {
    additionalFields: {
      // input: false means sign up can never choose its own role. Admins set it in the dashboard.
      role: { type: "string", required: false, defaultValue: "customer", input: false },
    },
  },
  hooks: {
    // The form checks the password too, but the rule has to hold for direct requests as well
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      const problem = passwordProblem(String(ctx.body?.password ?? ""));
      if (problem) throw new APIError("BAD_REQUEST", { message: problem });
    }),
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
