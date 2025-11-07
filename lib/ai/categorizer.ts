/**
 * AI Transaction Categorizer
 *
 * Uses Claude or OpenAI to automatically categorize transactions.
 *
 * WHY: Manual categorization is tedious. AI can accurately categorize
 * transactions based on merchant name, description, and amount.
 *
 * Features:
 * - Uses few-shot learning with examples
 * - Returns confidence score (0-1)
 * - Provides explanation for categorization
 * - Low temperature for consistent results
 */

// Category taxonomy from PRD
export const CATEGORIES = [
  { name: "Housing", subcategories: ["Rent", "Mortgage", "Utilities", "Maintenance"] },
  { name: "Groceries", subcategories: [] },
  { name: "Dining", subcategories: ["Restaurants", "Fast Food", "Coffee Shops"] },
  { name: "Transport", subcategories: ["Gas", "Public Transit", "Parking", "Ride Share"] },
  { name: "Shopping", subcategories: ["Clothing", "Electronics", "Home Goods"] },
  { name: "Health", subcategories: ["Medical", "Pharmacy", "Fitness"] },
  { name: "Subscriptions", subcategories: ["Streaming", "Software", "Memberships"] },
  { name: "Entertainment", subcategories: ["Movies", "Events", "Hobbies"] },
  { name: "Travel", subcategories: ["Flights", "Hotels", "Vacation"] },
  { name: "Income", subcategories: ["Salary", "Freelance", "Investment"] },
  { name: "Transfers", subcategories: [] },
];

export interface CategorizationResult {
  category: string;
  subcategory?: string;
  confidence: number;
  explanation: string;
}

/**
 * Categorize a transaction using AI
 *
 * @param merchant - Merchant name
 * @param description - Transaction description
 * @param amount - Transaction amount
 * @returns Category, confidence, and explanation
 */
export async function categorizeTransaction(
  merchant: string,
  description: string,
  amount: number
): Promise<CategorizationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback to rule-based categorization if no API key
    return ruleBased Categorization(merchant, description, amount);
  }

  // Build the prompt with few-shot examples
  const prompt = buildCategorizationPrompt(merchant, description, amount);

  try {
    // Use Anthropic Claude if available, otherwise OpenAI
    if (process.env.ANTHROPIC_API_KEY) {
      return await categorizeWithClaude(prompt);
    } else {
      return await categorizeWithOpenAI(prompt);
    }
  } catch (error) {
    console.error("AI categorization failed:", error);
    return ruleBasedCategorization(merchant, description, amount);
  }
}

/**
 * Build categorization prompt with few-shot examples
 */
function buildCategorizationPrompt(
  merchant: string,
  description: string,
  amount: number
): string {
  const categoryList = CATEGORIES.map((c) => c.name).join(", ");

  return `You are a financial transaction categorizer. Categorize the following transaction into one of these categories: ${categoryList}.

Available categories and subcategories:
${CATEGORIES.map((c) => `- ${c.name}${c.subcategories.length > 0 ? ` (${c.subcategories.join(", ")})` : ""}`).join("\n")}

Examples:
Merchant: "Whole Foods", Description: "Grocery shopping", Amount: -87.50
Category: Groceries, Confidence: 0.95, Explanation: Clear grocery store purchase

Merchant: "Netflix", Description: "Monthly subscription", Amount: -15.99
Category: Subscriptions, Subcategory: Streaming, Confidence: 0.99, Explanation: Recurring streaming service charge

Merchant: "Shell", Description: "Fuel", Amount: -45.00
Category: Transport, Subcategory: Gas, Confidence: 0.92, Explanation: Gas station fuel purchase

Now categorize this transaction:
Merchant: "${merchant}"
Description: "${description}"
Amount: ${amount}

Respond in JSON format:
{
  "category": "category name",
  "subcategory": "subcategory name or null",
  "confidence": 0.0-1.0,
  "explanation": "brief explanation"
}`;
}

/**
 * Categorize using Anthropic Claude
 */
async function categorizeWithClaude(prompt: string): Promise<CategorizationResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 256,
      temperature: 0.2, // Low temperature for consistent results
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.content[0].text;
  return parseCategorizationResponse(text);
}

/**
 * Categorize using OpenAI
 */
async function categorizeWithOpenAI(prompt: string): Promise<CategorizationResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  return parseCategorizationResponse(text);
}

/**
 * Parse AI response into structured result
 */
function parseCategorizationResponse(text: string): CategorizationResult {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      category: result.category,
      subcategory: result.subcategory || undefined,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      explanation: result.explanation || "AI categorization",
    };
  } catch (error) {
    // Fallback if parsing fails
    return {
      category: "Uncategorized",
      confidence: 0,
      explanation: "Failed to parse AI response",
    };
  }
}

/**
 * Rule-based categorization fallback
 *
 * WHY: When AI is unavailable, we use simple keyword matching.
 * This is less accurate but better than nothing.
 */
function ruleBasedCategorization(
  merchant: string,
  description: string,
  amount: number
): CategorizationResult {
  const text = `${merchant} ${description}`.toLowerCase();

  // Simple keyword matching
  if (
    text.includes("grocery") ||
    text.includes("market") ||
    text.includes("whole foods") ||
    text.includes("trader joe")
  ) {
    return {
      category: "Groceries",
      confidence: 0.7,
      explanation: "Keyword match: grocery store",
    };
  }

  if (
    text.includes("restaurant") ||
    text.includes("cafe") ||
    text.includes("coffee") ||
    text.includes("food")
  ) {
    return {
      category: "Dining",
      confidence: 0.6,
      explanation: "Keyword match: dining establishment",
    };
  }

  if (text.includes("gas") || text.includes("fuel") || text.includes("shell") || text.includes("chevron")) {
    return {
      category: "Transport",
      subcategory: "Gas",
      confidence: 0.7,
      explanation: "Keyword match: gas station",
    };
  }

  if (
    text.includes("netflix") ||
    text.includes("spotify") ||
    text.includes("subscription") ||
    text.includes("hulu")
  ) {
    return {
      category: "Subscriptions",
      confidence: 0.8,
      explanation: "Keyword match: subscription service",
    };
  }

  if (amount > 0) {
    return {
      category: "Income",
      confidence: 0.5,
      explanation: "Positive amount suggests income",
    };
  }

  return {
    category: "Uncategorized",
    confidence: 0,
    explanation: "No matching rules found",
  };
}
