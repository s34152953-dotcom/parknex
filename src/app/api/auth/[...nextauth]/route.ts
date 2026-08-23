import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import bcrypt from "bcryptjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl && !convexUrl.includes("mock") ? new ConvexHttpClient(convexUrl) : null;

export const authOptions: NextAuthOptions = {
  providers: [
    // Customers sign in with Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    // Operators sign in with email / username + password
    CredentialsProvider({
      id: "operator-credentials",
      name: "Operator Login",
      credentials: {
        email: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const inputId = credentials.email.toLowerCase().trim();
        const inputPassword = credentials.password;

        // Primary Operator Credentials: parknexadmin.com / admin123
        const isDefaultAdmin =
          (inputId === "parknexadmin.com" ||
            inputId === "admin@parknexadmin.com" ||
            inputId === "operator@parknexadmin.com" ||
            inputId === "admin@parknex.io" ||
            inputId === "admin@parknex.com" ||
            inputId === "admin") &&
          inputPassword === "admin123";

        if (isDefaultAdmin) {
          return {
            id: "operator-parknex-admin",
            name: "ParkNex Administrator",
            email: "parknexadmin.com",
            role: "operator",
          };
        }

        // Database lookup for any additional registered operators
        if (convex) {
          try {
            const operator = await convex.query(api.operators.getOperatorByEmail, {
              email: inputId,
            });

            if (operator && operator.passwordHash) {
              const isValid = await bcrypt.compare(inputPassword, operator.passwordHash);
              if (isValid) {
                return {
                  id: operator._id,
                  name: operator.name,
                  email: operator.email,
                  role: operator.role || "operator",
                };
              }
            }
          } catch (err) {
            console.error("[NextAuth] Operator lookup error:", err);
          }
        }

        throw new Error("Invalid operator credentials. Use parknexadmin.com and admin123");
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
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/customer/dashboard`;
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
