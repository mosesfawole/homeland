import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(function proxy(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  // ── Not logged in trying to access protected routes ─────────────
  const protectedPrefixes = ["/agent", "/user", "/admin"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Wrong role accessing dashboard ──────────────────────────────
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/agent") && role !== "AGENT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/user") && role !== "USER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ── Already logged in trying to access login/register ───────────
  if (session && (pathname === "/login" || pathname === "/register")) {
    if (role === "ADMIN")
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (role === "AGENT")
      return NextResponse.redirect(new URL("/agent/dashboard", req.url));
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
