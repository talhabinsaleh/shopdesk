import dotenv from "dotenv";

// Reads server/.env, or the .env next to the root package.json, whichever exists.
// On Vercel the values come from the project settings instead.
dotenv.config({ path: [".env", "../.env"], quiet: true });

export const PORT = Number(process.env.PORT) || 5000;
// The website's address. Logins, cookies and Google sign-in all go through it.
export const SITE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
