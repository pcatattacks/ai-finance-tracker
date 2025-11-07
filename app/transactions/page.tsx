/**
 * Transactions Page
 *
 * Displays all transactions with:
 * - Filtering by date, category, amount
 * - Inline category editing
 * - Bulk actions
 * - Search functionality
 *
 * WHY: Users need to review and correct categorization to improve
 * AI accuracy through the feedback loop (PRD requirement).
 */

"use client";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TransactionsPage() {
  // TODO: Replace with real data from API
  const transactions = [
    {
      id: "1",
      date: new Date("2024-11-05"),
      merchant: "Whole Foods Market",
      description: "Grocery shopping",
      amount: -87.45,
      category: "Groceries",
      confidence: 0.95,
    },
    {
      id: "2",
      date: new Date("2024-11-04"),
      merchant: "Shell Gas Station",
      description: "Fuel purchase",
      amount: -45.0,
      category: "Transport",
      confidence: 0.88,
    },
    {
      id: "3",
      date: new Date("2024-11-03"),
      merchant: "Netflix",
      description: "Subscription renewal",
      amount: -15.99,
      category: "Subscriptions",
      confidence: 0.99,
    },
    {
      id: "4",
      date: new Date("2024-11-02"),
      merchant: "Salary Deposit",
      description: "Monthly paycheck",
      amount: 4500.0,
      category: "Income",
      confidence: 1.0,
    },
    {
      id: "5",
      date: new Date("2024-11-01"),
      merchant: "Amazon",
      description: "Online purchase",
      amount: -156.78,
      category: "Shopping",
      confidence: 0.75,
    },
  ];

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9)
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          High
        </Badge>
      );
    if (confidence >= 0.7)
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Medium
        </Badge>
      );
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        Low
      </Badge>
    );
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              View and manage all your financial transactions
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters and search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-9" />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm font-medium text-muted-foreground">
                    <th className="pb-3 text-left">Date</th>
                    <th className="pb-3 text-left">Merchant</th>
                    <th className="pb-3 text-left">Description</th>
                    <th className="pb-3 text-left">Category</th>
                    <th className="pb-3 text-left">Confidence</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 text-sm">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-4 font-medium">{transaction.merchant}</td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {transaction.description}
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">{transaction.category}</Badge>
                      </td>
                      <td className="py-4">
                        {getConfidenceBadge(transaction.confidence)}
                      </td>
                      <td
                        className={`py-4 text-right font-semibold ${
                          transaction.amount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
