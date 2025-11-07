/**
 * Database Seed Script
 *
 * Seeds the database with:
 * - Default categories (from PRD taxonomy)
 * - Sample demo user (optional)
 * - Sample transactions, insights, goals, alerts (for demo user)
 *
 * WHY: Seed data helps with development and demos.
 * Users need default categories immediately upon signup.
 *
 * Run with: npm run db:seed
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Seed default categories (global, userId = null)
  console.log("Seeding default categories...");

  const categories = [
    {
      name: "Housing",
      icon: "home",
      color: "#3B82F6",
      subcategories: ["Rent", "Mortgage", "Utilities", "Maintenance"],
    },
    { name: "Groceries", icon: "shopping-cart", color: "#10B981" },
    {
      name: "Dining",
      icon: "utensils",
      color: "#F59E0B",
      subcategories: ["Restaurants", "Fast Food", "Coffee Shops"],
    },
    {
      name: "Transport",
      icon: "car",
      color: "#8B5CF6",
      subcategories: ["Gas", "Public Transit", "Parking", "Ride Share"],
    },
    {
      name: "Shopping",
      icon: "shopping-bag",
      color: "#EC4899",
      subcategories: ["Clothing", "Electronics", "Home Goods"],
    },
    {
      name: "Health",
      icon: "heart",
      color: "#EF4444",
      subcategories: ["Medical", "Pharmacy", "Fitness"],
    },
    {
      name: "Subscriptions",
      icon: "repeat",
      color: "#6366F1",
      subcategories: ["Streaming", "Software", "Memberships"],
    },
    {
      name: "Entertainment",
      icon: "film",
      color: "#F97316",
      subcategories: ["Movies", "Events", "Hobbies"],
    },
    {
      name: "Travel",
      icon: "plane",
      color: "#06B6D4",
      subcategories: ["Flights", "Hotels", "Vacation"],
    },
    {
      name: "Income",
      icon: "dollar-sign",
      color: "#22C55E",
      subcategories: ["Salary", "Freelance", "Investment"],
    },
    { name: "Transfers", icon: "arrow-right-left", color: "#64748B" },
    { name: "Uncategorized", icon: "help-circle", color: "#94A3B8" },
  ];

  for (const category of categories) {
    const parent = await prisma.category.upsert({
      where: {
        userId_name_parentId: {
          userId: null,
          name: category.name,
          parentId: null,
        },
      },
      update: {},
      create: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        userId: null, // Global category
      },
    });

    // Create subcategories if any
    if (category.subcategories) {
      for (const subName of category.subcategories) {
        await prisma.category.upsert({
          where: {
            userId_name_parentId: {
              userId: null,
              name: subName,
              parentId: parent.id,
            },
          },
          update: {},
          create: {
            name: subName,
            parentId: parent.id,
            userId: null,
          },
        });
      }
    }
  }

  console.log("✓ Default categories seeded");

  // 2. Optional: Create demo user with sample data
  // Uncomment to create demo data:
  /*
  console.log("Creating demo user...");

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@financeguru.com" },
    update: {},
    create: {
      clerkId: "demo_user_clerk_id",
      email: "demo@financeguru.com",
      name: "Demo User",
      onboardingState: "completed",
      preferences: {
        currency: "USD",
        country: "US",
      },
    },
  });

  console.log("Creating sample transactions...");

  // Get category IDs
  const groceriesCategory = await prisma.category.findFirst({
    where: { name: "Groceries", userId: null },
  });

  const diningCategory = await prisma.category.findFirst({
    where: { name: "Dining", userId: null },
  });

  const transportCategory = await prisma.category.findFirst({
    where: { name: "Transport", userId: null },
  });

  const incomeCategory = await prisma.category.findFirst({
    where: { name: "Income", userId: null },
  });

  // Sample transactions
  const sampleTransactions = [
    {
      date: new Date("2024-11-06"),
      merchant: "Whole Foods Market",
      description: "Weekly grocery shopping",
      amount: -127.45,
      category: groceriesCategory?.id,
      confidence: 0.95,
    },
    {
      date: new Date("2024-11-05"),
      merchant: "Starbucks",
      description: "Morning coffee",
      amount: -5.75,
      category: diningCategory?.id,
      confidence: 0.92,
    },
    {
      date: new Date("2024-11-04"),
      merchant: "Shell Gas Station",
      description: "Fuel",
      amount: -45.0,
      category: transportCategory?.id,
      confidence: 0.88,
    },
    {
      date: new Date("2024-11-01"),
      merchant: "Acme Corp",
      description: "Salary deposit",
      amount: 4500.0,
      category: incomeCategory?.id,
      confidence: 1.0,
    },
  ];

  for (const tx of sampleTransactions) {
    const hash = `${tx.date.toISOString()}-${tx.amount}-${tx.merchant}`;
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        date: tx.date,
        merchantRaw: tx.merchant,
        merchantNormalized: tx.merchant,
        description: tx.description,
        amount: tx.amount,
        categoryId: tx.category,
        confidence: tx.confidence,
        hash,
      },
    });
  }

  console.log("✓ Demo data created");
  */

  console.log("Database seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
