export function passwordProblem(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must have an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must have a lowercase letter.";
  return null;
}

export function safeRedirect(path: string | null | undefined, fallback = "/") {
  // Only same-site paths, so a crafted link cannot send someone to another website after login
  if (path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\")) return path;
  return fallback;
}
