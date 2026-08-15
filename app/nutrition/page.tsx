"use client";

import Card from "@/components/Card";
import { mealPlans } from "@/lib/mealPlans";
import { getMealPlanKeyForWeek } from "@/lib/domain/programWeek";
import { useProgramState } from "@/lib/hooks/useProgramState";

export default function NutritionPage() {
  const { currentWeek } = useProgramState();

  const planKey = getMealPlanKeyForWeek(currentWeek);
  const plan = mealPlans[planKey];

  const nextWeek = Math.min(currentWeek + 1, 12);
  const nextPlanKey = getMealPlanKeyForWeek(nextWeek);
  const nextPlan = mealPlans[nextPlanKey];

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <Card>
        <p className="text-sm text-muted">Current Meal Plan</p>

        <p className="font-bold text-xl text-foreground">Plan {planKey}</p>

        <p className="text-sm text-muted">Week {currentWeek}</p>
      </Card>

      <div className="mt-4 space-y-4">
        <Card>
          <p className="font-semibold text-foreground">Breakfast</p>
          <p className="text-muted">{plan.breakfast}</p>
        </Card>

        <Card>
          <p className="font-semibold text-foreground">Lunch</p>
          <p className="text-muted">{plan.lunch}</p>
        </Card>

        <Card>
          <p className="font-semibold text-foreground">Dinner</p>
          <p className="text-muted">{plan.dinner}</p>
        </Card>

        <Card>
          <p className="font-semibold text-foreground">Snack</p>
          <p className="text-muted">{plan.snack}</p>
        </Card>

        <Card>
          <p className="font-semibold mb-3">Grocery List</p>

          <div className="space-y-2">
            {plan.groceries.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-border bg-surface-muted p-2 text-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-2 border-dashed border-border-accent bg-surface-accent">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-foreground">🛒 Next Week Grocery List</p>

            <span className="rounded-full bg-accent-soft px-2 py-1 text-xs font-semibold text-accent-text">
              Week {nextWeek}
            </span>
          </div>

          <p className="mb-3 text-sm text-muted">
            Shopping ahead for Plan {nextPlanKey}
          </p>

          <div className="space-y-2">
            {nextPlan.groceries.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-border bg-surface p-2 text-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
