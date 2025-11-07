/**
 * Categories Page
 *
 * Manage spending categories and auto-categorization rules.
 */

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function CategoriesPage() {
  const categories = [
    { name: "Groceries", count: 45, color: "bg-blue-500" },
    { name: "Dining", count: 32, color: "bg-purple-500" },
    { name: "Transport", count: 28, color: "bg-green-500" },
    { name: "Shopping", count: 21, color: "bg-yellow-500" },
    { name: "Subscriptions", count: 12, color: "bg-red-500" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Manage your spending categories and rules</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Categories</CardTitle>
            <CardDescription>Categories help organize and track your spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className={`h-12 w-12 rounded-lg ${category.color}`} />
                  <div className="flex-1">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.count} transactions
                    </p>
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
