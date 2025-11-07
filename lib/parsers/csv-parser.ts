/**
 * CSV Parser
 *
 * Parses CSV files from banks and extracts transaction data.
 *
 * WHY: Different banks use different CSV formats. This parser attempts to
 * auto-detect column mappings and normalize the data into our schema.
 *
 * Key features:
 * - Auto-detect delimiter (comma, semicolon, tab)
 * - Flexible column mapping (handles different header names)
 * - Date parsing with multiple format support
 * - Amount normalization (handles different currency formats)
 */

import Papa from "papaparse";

export interface ParsedTransaction {
  date: Date;
  merchant: string;
  description: string;
  amount: number;
  rawData: Record<string, any>;
}

export interface CSVParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  errors: string[];
}

// Common column name variations for auto-detection
const COLUMN_MAPPINGS = {
  date: ["date", "transaction date", "posted date", "trans date", "posting date"],
  merchant: ["merchant", "description", "payee", "name", "vendor"],
  description: ["description", "memo", "details", "notes"],
  amount: ["amount", "value", "transaction amount", "debit", "credit"],
};

/**
 * Parse a CSV file and extract transactions
 *
 * @param fileContent - CSV file content as string
 * @returns Parsed transactions or errors
 */
export function parseCSV(fileContent: string): CSVParseResult {
  const errors: string[] = [];
  const transactions: ParsedTransaction[] = [];

  try {
    // Parse CSV with Papa Parse
    const result = Papa.parse(fileContent, {
      header: true, // First row is headers
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        errors.push(`Row ${error.row}: ${error.message}`);
      });
    }

    // Auto-detect column mappings
    const headers = result.meta.fields || [];
    const columnMap = detectColumnMappings(headers);

    if (!columnMap.date || !columnMap.amount) {
      errors.push(
        "Could not detect required columns. Please ensure CSV has date and amount columns."
      );
      return { success: false, transactions: [], errors };
    }

    // Parse each row
    result.data.forEach((row: any, index: number) => {
      try {
        const transaction = parseRow(row, columnMap);
        if (transaction) {
          transactions.push(transaction);
        }
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Parse error"}`);
      }
    });

    return {
      success: errors.length === 0,
      transactions,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      transactions: [],
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

/**
 * Detect which columns map to our required fields
 */
function detectColumnMappings(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {};

  for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
    const match = headers.find((header) =>
      variations.some((v) => header.toLowerCase().includes(v))
    );
    if (match) {
      map[field] = match;
    }
  }

  return map;
}

/**
 * Parse a single row into a transaction
 */
function parseRow(row: any, columnMap: Record<string, string>): ParsedTransaction | null {
  const dateStr = row[columnMap.date];
  const amountStr = row[columnMap.amount];
  const merchant = row[columnMap.merchant] || "Unknown";
  const description = row[columnMap.description] || merchant;

  if (!dateStr || !amountStr) {
    return null; // Skip rows with missing data
  }

  // Parse date (try multiple formats)
  const date = parseDate(dateStr);
  if (!date) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  // Parse amount (remove currency symbols, commas, etc.)
  const amount = parseAmount(amountStr);
  if (isNaN(amount)) {
    throw new Error(`Invalid amount: ${amountStr}`);
  }

  return {
    date,
    merchant: merchant.trim(),
    description: description.trim(),
    amount,
    rawData: row,
  };
}

/**
 * Parse date string with multiple format support
 */
function parseDate(dateStr: string): Date | null {
  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try common US formats: MM/DD/YYYY, MM-DD-YYYY
  const usFormats = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
  ];

  for (const format of usFormats) {
    const match = dateStr.match(format);
    if (match) {
      const [, p1, p2, p3] = match;
      // Try both MM/DD/YYYY and YYYY/MM/DD
      const date1 = new Date(`${p1}/${p2}/${p3}`);
      if (!isNaN(date1.getTime())) return date1;

      const date2 = new Date(`${p3}/${p1}/${p2}`);
      if (!isNaN(date2.getTime())) return date2;
    }
  }

  return null;
}

/**
 * Parse amount string (handles currency symbols, commas, negatives)
 */
function parseAmount(amountStr: string): number {
  // Remove currency symbols, commas, spaces
  let cleaned = amountStr.replace(/[$£€,\s]/g, "");

  // Handle parentheses as negative (common in accounting)
  if (cleaned.startsWith("(") && cleaned.endsWith(")")) {
    cleaned = "-" + cleaned.slice(1, -1);
  }

  return parseFloat(cleaned);
}
