import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth, type SessionUser } from "../config/auth.js";
import { HttpError } from "../lib/validate.js";

// The logged-in user is kept on res.locals.user for the route that runs next
declare global {
  namespace Express {
    interface Locals {
      user: SessionUser;
    }
  }
}

// Reads the BetterAuth login cookie the browser sent with the request
export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) throw new HttpError(401, "Unauthorized: please log in first.");
  res.locals.user = session.user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireUser(req, res, () => {});
  if (res.locals.user.role !== "admin") throw new HttpError(403, "You do not have access to this.");
  next();
}
