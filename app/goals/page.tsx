/**
 * Goals Page
 *
 * Create and track financial goals (budgets, savings, debt payoff).
 */

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function GoalsPage() {
  const goals = [
    {
      id: "1",
      title: "Emergency Fund",
      type: "Savings",
      target: 10000,
      current: 6700,
      period: "One-time",
      status: "active",
    },
    {
      id: "2",
      title: "Dining Budget",
      type: "Budget",
      target: 500,
      current: 342,
      period: "Monthly",
      status: "active",
    },
    {
      id: "3",
      title: "Credit Card Payoff",
      type: "Debt",
      target: 5000,
      current: 2100,
      period: "6 months",
      status: "active",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">Track your financial goals and progress</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{goal.type}</Badge>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4">{goal.title}</CardTitle>
                <CardDescription>{goal.period}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">{formatCurrency(goal.current)}</span>
                      <span className="text-muted-foreground">
                        of {formatCurrency(goal.target)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((goal.current / goal.target) * 100)}% complete
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
