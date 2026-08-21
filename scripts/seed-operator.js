#!/usr/bin/env node
/**
 * PARKNEX - Secure Operator Seed Script
 *
 * Run once to create the first admin operator account in Convex.
 * Usage:
 *   node scripts/seed-operator.js
 *
 * Environment variables required:
 *   NEXT_PUBLIC_CONVEX_URL  — your Convex deployment URL
 *   OPERATOR_EMAIL          — email for the new operator account
 *   OPERATOR_PASSWORD       — strong password (min 12 chars)
 *   OPERATOR_NAME           — display name
 */

const { ConvexHttpClient } = require("convex/browser");
const bcrypt = require("bcryptjs");

async function main() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl || convexUrl.includes("mock")) {
    console.error("ERROR: NEXT_PUBLIC_CONVEX_URL is missing or invalid.");
    process.exit(1);
  }

  const email = process.env.OPERATOR_EMAIL;
  const password = process.env.OPERATOR_PASSWORD;
  const name = process.env.OPERATOR_NAME || "Mall Operator";

  if (!email || !password) {
    console.error("ERROR: OPERATOR_EMAIL and OPERATOR_PASSWORD must be set.");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("ERROR: Password must be at least 12 characters.");
    process.exit(1);
  }

  const client = new ConvexHttpClient(convexUrl);

  console.log(`Creating operator: ${email}`);
  const passwordHash = await bcrypt.hash(password, 12);

  // Use the Convex HTTP API to call the mutation directly
  const result = await client.mutation("operators:createOperator", {
    email: email.toLowerCase(),
    passwordHash,
    name,
    role: "mall_admin",
  });

  console.log("Operator created successfully:", result);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
