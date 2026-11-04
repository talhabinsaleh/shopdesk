import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { client, DB_NAME } from "./db.js";
import { SITE_URL } from "./env.js";
import { passwordProblem } from "../lib/validate.js";

export const auth = betterAuth({
  // The browser reaches this server through the website's /api address, so the website is the base URL
  baseURL: SITE_URL,
  database: mongodbAdapter(client.db(DB_NAME), { client }),
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
});

export type SessionUser = typeof auth.$Infer.Session.user;
