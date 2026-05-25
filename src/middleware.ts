import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Matcher matches all pages except public static assets, sw.js, and API routes
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico|public|sw.js|logo.png).*)"],
};
