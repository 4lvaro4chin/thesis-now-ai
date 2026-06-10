import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/search", "/searching", "/results"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some((route) => path.startsWith(route));

  // If not a protected route, allow access
  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authToken = request.cookies.get("sb-auth-token")?.value ||
                   request.cookies.get("sb-orcvyhctikeIfzgkrwga-auth-token")?.value;

  // If protected route and no auth token, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
};
