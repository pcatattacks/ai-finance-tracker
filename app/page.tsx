/**
 * Dashboard Page (Home)
 *
 * Main dashboard showing:
 * - Financial summary cards
 * - Spending charts (cashflow, category breakdown, merchants)
 * - Recent insights
 *
 * WHY: This is the "I Win" moment - users see their financial overview
 * within 30 seconds of uploading data (PRD requirement).
 */

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  // TODO: Replace with real data from API
  const summaryCards = [
    {
      title: "Total Spending",
      value: "$3,456.78",
      change: "+12.3%",
      trend: "up" as const,
      description: "vs last month",
    },
    {
      title: "This Month",
      value: "$1,234.56",
      change: "-5.2%",
      trend: "down" as const,
      description: "vs last month",
    },
    {
      title: "Transactions",
      value: "156",
      change: "+23",
      trend: "up" as const,
      description: "this month",
    },
    {
      title: "Categories",
      value: "12",
      change: "Active",
      trend: "neutral" as const,
      description: "tracking",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview and recent insights
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {card.trend === "up" && <TrendingUp className="h-3 w-3 text-green-600" />}
                  {card.trend === "down" && <TrendingDown className="h-3 w-3 text-red-600" />}
                  <span className={card.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {card.change}
                  </span>
                  <span>{card.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
              <CardDescription>Your monthly spending trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chart placeholder - Cashflow line chart will go here
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* TODO: Replace with real category data */}
                {[
                  { name: "Dining", amount: "$456.78", percent: 37 },
                  { name: "Groceries", amount: "$234.56", percent: 19 },
                  { name: "Transport", amount: "$178.90", percent: 14 },
                  { name: "Shopping", amount: "$123.45", percent: 10 },
                ].map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">{category.amount}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${category.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent insights */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
            <CardDescription>AI-generated recommendations for your finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* TODO: Replace with real insights from API */}
              {[
                {
                  type: "Savings Opportunity",
                  title: "Reduce dining expenses",
                  description:
                    "You've spent 15% more on dining this month. Consider meal planning to save up to $150.",
                  severity: "info" as const,
                },
                {
                  type: "Subscription Detected",
                  title: "New recurring charge found",
                  description:
                    "We detected a new $9.99 monthly subscription to Streaming Service XYZ.",
                  severity: "warning" as const,
                },
                {
                  type: "Goal Progress",
                  title: "You're on track!",
                  description:
                    "Your Emergency Fund goal is 67% complete. Keep up the great work!",
                  severity: "success" as const,
                },
              ].map((insight, i) => (
                <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                  <AlertCircle className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{insight.type}</Badge>
                      <h4 className="font-semibold">{insight.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
