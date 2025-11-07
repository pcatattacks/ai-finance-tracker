/**
 * Transactions API Route
 *
 * GET /api/transactions - Fetch user's transactions
 * POST /api/transactions - Create new transaction
 *
 * WHY: API routes handle server-side logic and database operations.
 * They're protected by Clerk authentication via middleware.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/transactions
 * Fetch transactions for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      // Create user if doesn't exist (first time login)
      const { emailAddresses } = await auth();
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: emailAddresses?.[0]?.emailAddress || "",
        },
      });
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      include: {
        category: true,
        subcategory: true,
      },
      orderBy: {
        date: "desc",
      },
      take: 100, // Limit to 100 most recent
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/transactions
 * Create a new transaction (usually from file upload)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, amount, merchant, description, categoryId } = body;

    // Validate input
    if (!date || !amount || !merchant) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate transaction hash for deduplication
    const hash = await generateHash(date, amount, merchant, description);

    // Check for duplicate
    const existing = await prisma.transaction.findUnique({
      where: { hash },
    });

    if (existing) {
      return NextResponse.json({ error: "Duplicate transaction" }, { status: 409 });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        date: new Date(date),
        amount,
        merchantRaw: merchant,
        merchantNormalized: merchant,
        description: description || merchant,
        categoryId,
        hash,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Generate hash for transaction deduplication
 */
async function generateHash(
  date: string,
  amount: number,
  merchant: string,
  description: string
): Promise<string> {
  const data = `${date}-${amount}-${merchant}-${description}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
