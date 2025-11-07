/**
 * Alerts Page
 *
 * Configure notification rules for spending alerts.
 */

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function AlertsPage() {
  const alerts = [
    {
      id: "1",
      name: "Large Transaction",
      type: "Amount threshold",
      condition: "Transaction > $500",
      active: true,
      channel: "Email",
    },
    {
      id: "2",
      name: "Budget Warning",
      type: "Budget threshold",
      condition: "Dining category > 80% of budget",
      active: true,
      channel: "Email",
    },
    {
      id: "3",
      name: "Subscription Renewal",
      type: "Recurring charge",
      condition: "New subscription detected",
      active: false,
      channel: "Email",
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
            <p className="text-muted-foreground">Configure spending notifications and alerts</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Alert
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Alerts</CardTitle>
            <CardDescription>Manage notification rules for your finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.name}</h4>
                      <Badge variant={alert.active ? "default" : "outline"}>
                        {alert.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{alert.condition}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.type} • {alert.channel}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
