import { auth } from "./server/auth/index.edge";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Define which routes need auth
const protectedRoutes = ["/library", "/dashboard", "/progress", "/reviews"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Skip static files, images, and the auth routes themselves
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};