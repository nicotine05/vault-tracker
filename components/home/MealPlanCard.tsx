import Card from "@/components/Card";
import type { MealPlanKey } from "@/lib/domain/types";
import { mealPlans } from "@/lib/mealPlans";

type MealPlanCardProps = {
  planKey: MealPlanKey;
};

export default function MealPlanCard({ planKey }: MealPlanCardProps) {
  const plan = mealPlans[planKey];

  return (
    <Card title="Current Meal Plan">
      <p className="mb-3 text-sm text-muted">Plan {planKey}</p>

      <div className="space-y-3">
        <div>
          <p className="font-medium">Breakfast</p>
          <p className="text-sm text-muted">{plan.breakfast}</p>
        </div>
        <div>
          <p className="font-medium">Lunch</p>
          <p className="text-sm text-muted">{plan.lunch}</p>
        </div>
        <div>
          <p className="font-medium">Dinner</p>
          <p className="text-sm text-muted">{plan.dinner}</p>
        </div>
        <div>
          <p className="font-medium">Snack</p>
          <p className="text-sm text-muted">{plan.snack}</p>
        </div>
      </div>
    </Card>
  );
}
