// Builds a login or register link that remembers the page the visitor is on.
// Browser only: call it from a click handler. On the login and register pages
// it keeps the page already remembered, so a visitor never returns to a form.
export function authPath(base: "/login" | "/register" = "/login") {
  const { pathname, search } = window.location;
  const onAuthPage = pathname === "/login" || pathname === "/register";
  const target = onAuthPage ? new URLSearchParams(search).get("redirect") : pathname + search;
  return withRedirect(base, target);
}

export function withRedirect(base: string, target: string | null | undefined) {
  return target && target !== "/" ? `${base}?redirect=${encodeURIComponent(target)}` : base;
}

// A full page load, because the router may have saved "this page redirects to login" from before.
// Reusing that after login would send the visitor round in a loop.
export function goAfterLogin(target: string) {
  window.location.assign(target);
}
