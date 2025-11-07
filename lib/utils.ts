/**
 * Utility Functions
 *
 * Common utility functions used throughout the application.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names and merges Tailwind CSS classes intelligently
 *
 * WHY: This prevents Tailwind class conflicts (e.g., "p-4 p-2" becomes "p-2")
 * Used extensively with shadcn/ui components for conditional styling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amounts with proper locale and symbol
 *
 * @param amount - The numeric amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format date to human-readable string
 *
 * @param date - Date to format
 * @param includeTime - Whether to include time (default: false)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, includeTime: boolean = false): string {
  const d = typeof date === "string" ? new Date(date) : date;

  if (includeTime) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Generate a unique hash for transaction deduplication
 *
 * WHY: We need to prevent duplicate transactions from being imported.
 * Hash is based on date, amount, merchant, and description.
 *
 * @param transaction - Transaction details
 * @returns SHA-256 hash string
 */
export async function generateTransactionHash(
  date: Date,
  amount: number,
  merchant: string,
  description: string
): Promise<string> {
  const data = `${date.toISOString()}-${amount}-${merchant}-${description}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with "..." if needed
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Calculate percentage change between two values
 *
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change (e.g., 0.15 for 15% increase)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
}
