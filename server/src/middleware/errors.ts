import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { HttpError } from "../lib/validate.js";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Not found." });
}

// Every route error ends here as { message }, which the website shows to the user.
// Express 5 passes errors thrown in async routes here on its own.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ message: err.message });
  if (err instanceof MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 5 MB." : "Please choose an image file.";
    return res.status(400).json({ message });
  }
  if (err instanceof SyntaxError && "body" in err) return res.status(400).json({ message: "The request was not valid JSON." });
  if (typeof err === "object" && err && (err as { code?: number }).code === 11000) {
    return res.status(409).json({ message: "That value is already in use." });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
}
