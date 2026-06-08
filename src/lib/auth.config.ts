import type { User } from "@/types/auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ROUTES, PUBLIC_ROUTES, AUTH_ROUTES } from "@/constants/routes";
import { canAccessAdmin } from "@/constants/roles";

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        try {
          const res = await fetch(`${apiUrl}/v1/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.access_token) {
            throw new Error(data.message || "Login gagal.");
          }

          // Return user object — will be stored in JWT
          return {
            id: String(data.user.id),
            name: data.user.name,
            email: data.user.email,
            // Custom fields stored in JWT via callbacks
            accessToken: data.access_token,
            userData: data.user,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Koneksi ke server gagal.");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  pages: {
    signIn: ROUTES.LOGIN,
  },

  callbacks: {
    // Store custom data in JWT
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in
        const userData = (user as Record<string, unknown>).userData as User;
        token.accessToken = (user as Record<string, unknown>).accessToken as string;
        token.user = userData;
        token.accessTokenExpires = Date.now() + 7 * 60 * 60 * 1000; // 7 hours
      }

      // Check if token is about to expire
      if (typeof token.accessTokenExpires === "number" && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Token expired — try refresh
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/v1/auth/me`, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
            Accept: "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          token.user = data.user;
          token.accessTokenExpires = Date.now() + 7 * 60 * 60 * 1000;
          return token;
        }
      } catch {
        // Refresh failed
      }

      return { ...token, error: "RefreshTokenError" as const };
    },

    // Expose custom data to client session
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as typeof session.user;
      }
      session.accessToken = token.accessToken as string;
      if (token.error) {
        session.error = token.error as "RefreshTokenError";
      }
      return session;
    },

    // Route protection via authorized callback (used by proxy.ts)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Allow public routes
      if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return true;
      }

      // Auth routes — redirect to appropriate page if already logged in
      if (AUTH_ROUTES.includes(pathname)) {
        if (isLoggedIn) {
          const userRoles = (auth?.user as unknown as Record<string, unknown>)?.roles as string[] | undefined;
          if (userRoles && canAccessAdmin(userRoles)) {
            return Response.redirect(new URL(ROUTES.ADMIN, nextUrl));
          }
          return Response.redirect(new URL(ROUTES.CHECKOUT, nextUrl));
        }
        return true;
      }

      // Protected routes — require authentication
      if (!isLoggedIn) {
        return false; // NextAuth redirects to signIn page
      }

      // Role-based route protection for admin dashboard
      if (pathname.startsWith("/admin")) {
        const userRoles = (auth?.user as unknown as User)?.roles;
        if (!userRoles || !canAccessAdmin(userRoles)) {
          return Response.redirect(new URL(ROUTES.UNAUTHORIZED, nextUrl));
        }
      }

      return true;
    },
  },

  trustHost: true,
} satisfies NextAuthConfig;
