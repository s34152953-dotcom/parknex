import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import bcrypt from "bcryptjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl && !convexUrl.includes("mock") ? new ConvexHttpClient(convexUrl) : null;
const isProd = process.env.NODE_ENV === "production" || process.env.NEXTAUTH_URL?.startsWith("https://");

export const authOptions: NextAuthOptions = {
  providers: [
    // Customers sign in with Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      checks: ["pkce"], // Prevents state cookie missing error on Vercel cross-site redirects
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    // Operators sign in with email + bcrypt password
    CredentialsProvider({
      id: "operator-credentials",
      name: "Operator Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!convex) throw new Error("Database configuration is missing.");

        const operator = await convex.query(api.operators.getOperatorByEmail, {
          email: credentials.email.toLowerCase().trim(),
        });

        if (!operator) throw new Error("Invalid email or password.");

        const isValid = await bcrypt.compare(credentials.password, operator.passwordHash);
        if (!isValid) throw new Error("Invalid email or password.");

        return {
          id: operator._id,
          name: operator.name,
          email: operator.email,
          role: operator.role || "operator",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create / update Convex user record for Google sign-ins
      if (account?.provider === "google" && user.email && convex) {
        try {
          await convex.mutation(api.users.upsertUser, {
            name: user.name || user.email,
            email: user.email.toLowerCase(),
          });
        } catch (e) {
          console.error("[NextAuth] Failed to upsert user:", e);
        }
      }
      return true;
    },
    jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || "customer";
        token.provider = account?.provider || "google";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || "customer";
        (session.user as any).provider = token.provider || "google";
      }
      return session;
    },
  },
  useSecureCookies: isProd,
  cookies: {
    sessionToken: {
      name: isProd ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
    callbackUrl: {
      name: isProd ? `__Secure-next-auth.callback-url` : `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
    csrfToken: {
      name: isProd ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
    pkceCodeVerifier: {
      name: isProd ? `__Secure-next-auth.pkce.code_verifier` : `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        maxAge: 900,
      },
    },
  },
  pages: {
    signIn: "/customer/login",
    error: "/customer/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
