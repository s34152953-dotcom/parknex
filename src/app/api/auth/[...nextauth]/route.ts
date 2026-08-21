import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import bcrypt from "bcryptjs";

// Ensure URL exists, failing loudly in NextAuth if misconfigured
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl || convexUrl.includes("mock")) {
  console.error("FATAL NEXTAUTH: Missing or invalid NEXT_PUBLIC_CONVEX_URL");
}
const convex = convexUrl && !convexUrl.includes("mock") ? new ConvexHttpClient(convexUrl) : null;

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Operator Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        if (!convex) throw new Error("Database configuration is missing. Cannot verify credentials.");

        // Query the operator from Convex
        const operator = await convex.query(api.operators.getOperatorByEmail, { 
          email: credentials.email.toLowerCase() 
        });

        if (!operator) {
          throw new Error("Invalid email or password.");
        }

        // Verify hash
        const isValid = await bcrypt.compare(credentials.password, operator.passwordHash);
        
        if (!isValid) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: operator._id,
          name: operator.name,
          email: operator.email,
          role: operator.role
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
