import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/shared/api/auth/auth.config";

const PUBLIC_PATHS = ["/login", "/terms", "/privacy"];

const { auth } = NextAuth(authConfig);

const authProxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublic = PUBLIC_PATHS.some(
    (p) => nextUrl.pathname === p || nextUrl.pathname.startsWith(`${p}/`),
  );

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isLoggedIn && nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export default function proxy(req: NextRequest, ctx: unknown) {
  // @ts-expect-error — forward to Auth.js middleware
  return authProxy(req, ctx);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icons|favicon.ico|manifest.webmanifest|sw.js).*)",
  ],
};
