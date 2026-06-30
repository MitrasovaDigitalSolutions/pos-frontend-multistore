import type { User } from "@/types/auth";
import { type NextAuthConfig, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ROUTES, PUBLIC_ROUTES, AUTH_ROUTES } from "@/constants/routes";
import { canAccessAdmin } from "@/constants/roles";

class CustomAuthError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

export default {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

        try {
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
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
            throw new CustomAuthError(data.message || "Login gagal.");
          }

          return {
            id: String(data.user.uid),
            name: data.user.name,
            email: data.user.email,
            accessToken: data.access_token,
            userData: data.user,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }
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
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.cashDrawerSessionId !== undefined) {
          token.cashDrawerSessionId = session.cashDrawerSessionId;
        }
      }

      if (user) {
        const userData = (user as Record<string, unknown>).userData as User;
        token.accessToken = (user as Record<string, unknown>).accessToken as string;
        token.user = userData;
        token.accessTokenExpires = Date.now() + 7 * 60 * 60 * 1000; // 7 hours
      }

      if (typeof token.accessTokenExpires === "number" && Date.now() < token.accessTokenExpires) {
        return token;
      }

      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
        const res = await fetch(`${apiUrl}/api/v1/auth/me`, {
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

    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as typeof session.user;
      }
      session.accessToken = token.accessToken as string;
      session.cashDrawerSessionId = token.cashDrawerSessionId as string | null | undefined;
      if (token.error) {
        session.error = token.error as "RefreshTokenError";
      }
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const hasTokenError = !!(auth as Record<string, unknown> | null)?.error;
      const isLoggedIn = !!auth?.user && !hasTokenError;
      const { pathname } = nextUrl;

      if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return true;
      }

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

      if (!isLoggedIn) {
        return false;
      }
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
