/**
 * Prisma Client Instance
 *
 * This file provides a singleton Prisma client instance to prevent
 * multiple instances during development hot reloading.
 *
 * WHY: In development, Next.js hot reloading can create multiple Prisma clients,
 * which can exhaust database connections. This pattern ensures we reuse
 * the same client instance across hot reloads.
 */

import { PrismaClient } from "@prisma/client";

// Extend global type to include our prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a single Prisma client instance
// In production, create a new instance
// In development, reuse the existing instance if it exists
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// In development, store the instance globally to prevent multiple clients
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
