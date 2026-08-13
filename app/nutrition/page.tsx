"use client";

import {
  useEffect,
  useState,
} from "react";
import Card from "@/components/Card";
import { mealPlans } from "@/lib/mealPlans";

export default function NutritionPage() {
  const [currentWeek, setCurrentWeek] =
    useState(1);

  useEffect(() => {
    const savedWeek =
      localStorage.getItem(
        "currentWeek"
      );

    if (savedWeek) {
      setCurrentWeek(
        Number(savedWeek)
      );
    }
  }, []);

  const planKey =
    currentWeek % 3 === 1
      ? "A"
      : currentWeek % 3 === 2
      ? "B"
      : "C";

  const plan =
    mealPlans[
      planKey as keyof typeof mealPlans
    ];

  const nextWeek =
    Math.min(
      currentWeek + 1,
      12
    );

  const nextPlanKey =
    nextWeek % 3 === 1
      ? "A"
      : nextWeek % 3 === 2
      ? "B"
      : "C";

  const nextPlan =
    mealPlans[
      nextPlanKey as keyof typeof mealPlans
    ];

  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">
        Nutrition
      </h1>

      <Card>
        <p className="text-sm text-gray-500">
          Current Meal Plan
        </p>

        <p className="font-bold text-xl">
          Plan {planKey}
        </p>

        <p className="text-sm text-gray-500">
          Week {currentWeek}
        </p>
      </Card>

      <div className="mt-4 space-y-4">
        <Card>
          <p className="font-semibold">
            Breakfast
          </p>

          <p className="text-gray-600">
            {plan.breakfast}
          </p>
        </Card>

        <Card>
          <p className="font-semibold">
            Lunch
          </p>

          <p className="text-gray-600">
            {plan.lunch}
          </p>
        </Card>

        <Card>
          <p className="font-semibold">
            Dinner
          </p>

          <p className="text-gray-600">
            {plan.dinner}
          </p>
        </Card>

        <Card>
          <p className="font-semibold">
            Snack
          </p>

          <p className="text-gray-600">
            {plan.snack}
          </p>
        </Card>

        <Card>
          <p className="font-semibold mb-3">
            Grocery List
          </p>

          <div className="space-y-2">
            {plan.groceries.map(
              (item) => (
                <div
                  key={item}
                  className="border rounded-lg p-2"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </Card>

        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold">
              🛒 Next Week Grocery List
            </p>

            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Week {nextWeek}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-3">
            Shopping ahead for Plan{" "}
            {nextPlanKey}
          </p>

          <div className="space-y-2">
            {nextPlan.groceries.map(
              (item) => (
                <div
                  key={item}
                  className="border border-blue-200 bg-white rounded-lg p-2"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}