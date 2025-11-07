/**
 * Insights Page
 *
 * View all AI-generated insights and recommendations.
 */

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertCircle } from "lucide-react";

export default function InsightsPage() {
  const insights = [
    {
      id: "1",
      type: "Trend",
      title: "Dining costs increasing",
      description:
        "Your dining expenses have increased by 23% compared to last month. Consider setting a budget.",
      severity: "warning",
      date: new Date("2024-11-06"),
    },
    {
      id: "2",
      type: "Subscription",
      title: "Recurring charge detected",
      description: "New monthly subscription to Streaming Service ($9.99/month)",
      severity: "info",
      date: new Date("2024-11-05"),
    },
    {
      id: "3",
      type: "Savings",
      title: "Save on duplicate subscriptions",
      description:
        "You have 2 similar streaming subscriptions. Canceling one could save $120/year.",
      severity: "success",
      date: new Date("2024-11-04"),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">AI-powered recommendations for your finances</p>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-lg p-3 ${insight.severity === "warning" ? "bg-yellow-100 text-yellow-700" : insight.severity === "success" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{insight.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {insight.date.toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                    <p className="text-muted-foreground mb-4">{insight.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm">Take Action</Button>
                      <Button size="sm" variant="ghost">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
