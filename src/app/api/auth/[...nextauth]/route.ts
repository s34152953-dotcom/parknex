import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import bcrypt from "bcryptjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://astute-pony-718.convex.cloud";
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
        if (!credentials?.email) return null;
        const inputId = credentials.email.toLowerCase().trim();
        const inputPassword = (credentials.password || "").trim();

        // Primary Operator Credentials: accepts all common admin/operator demo inputs
        const validAdminUsers = [
          "parknexadmin.com",
          "admin@parknexadmin.com",
          "operator@parknexadmin.com",
          "admin@parknex.io",
          "admin@parknex.com",
          "admin",
          "operator",
          "quantum",
          "demo",
        ];

        const validAdminPasswords = [
          "admin123",
          "admin",
          "password",
          "operator",
          "quantum",
          "123456",
          "",
        ];

        const isDefaultAdmin =
          validAdminUsers.includes(inputId) ||
          validAdminPasswords.includes(inputPassword) ||
          inputId.includes("admin") ||
          inputId.includes("operator");

        if (isDefaultAdmin) {
          return {
            id: "operator-parknex-admin",
            name: "ParkNex Administrator",
            email: "admin@parknex.com",
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

        // Fallback for hackathon demo: accept any login
        return {
          id: "operator-parknex-admin",
          name: "ParkNex Operator",
          email: inputId,
          role: "operator",
        };
      },
    }),
    // Customers can sign in directly or with 1-click demo pass
    CredentialsProvider({
      id: "customer-credentials",
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim() || "attendee@quantumexpo.com";
        const name = credentials?.name?.trim() || "Expo Attendee";
        return {
          id: "customer-" + Date.now(),
          name,
          email,
          role: "customer",
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
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fc87b9c9f28a34b22c7104b2a64c489c",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
