import type { NextAuthConfig } from "next-auth";
import { hasRouteAccess } from "./lib/auth/rbac";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Determine if accessing protected app routes
      const isApiRoute = nextUrl.pathname.startsWith("/api");
      const isAuthRoute = nextUrl.pathname === "/login" || nextUrl.pathname === "/register" || nextUrl.pathname === "/onboarding";
      const isPublicRoute = nextUrl.pathname === "/";
      const isStaticOrAsset = nextUrl.pathname.startsWith("/_next") || nextUrl.pathname.includes(".") || nextUrl.pathname.startsWith("/public");

      if (isApiRoute || isStaticOrAsset || isPublicRoute) {
        return true;
      }

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Any other path is protected (like /dashboard, /subjects, /tutor, etc.)
      if (!isLoggedIn) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
          callbackUrl += nextUrl.search;
        }
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
      }

      // Enforce Role-Based Access Control (RBAC)
      const userRole = (auth.user as any).role || 'student';
      if (!hasRouteAccess(userRole, nextUrl.pathname)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.schoolType = (user as any).schoolType;
        token.grade = (user as any).grade;
        token.selectedPathway = (user as any).selectedPathway;
      }
      // Handle session updates (dynamic XP, level updates from client-side Zustand store sync)
      if (trigger === "update" && session) {
        token.role = session.role ?? token.role;
        token.schoolType = session.schoolType ?? token.schoolType;
        token.grade = session.grade ?? token.grade;
        token.selectedPathway = session.selectedPathway ?? token.selectedPathway;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).schoolType = token.schoolType;
        (session.user as any).grade = token.grade;
        (session.user as any).selectedPathway = token.selectedPathway;
      }
      return session;
    },
  },
  providers: [], // Configured in main auth.ts file
} satisfies NextAuthConfig;
