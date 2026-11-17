import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next/image") || 
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const isPublic = publicRoutes.includes(pathname);
  const isApiRoute = pathname.startsWith("/api");

  if (!isAuthenticated) {
    if (isPublic) {
      return NextResponse.next();
    }

    if (isApiRoute) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isAuthenticated && (isPublic || pathname === "/")) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  if (isApiRoute) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(token.id));
    requestHeaders.set("x-user-email", String(token.email));
    requestHeaders.set("x-username", String(token.username || ""));
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/user/check-unique-username|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
