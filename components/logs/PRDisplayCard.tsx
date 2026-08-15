"use client";

import Card from "@/components/Card";

type PRDisplayCardProps = {
  label: string;
  value: string;
  date: string;
  colorClass: string;
  unit?: string;
};

export default function PRDisplayCard({
  label,
  value,
  date,
  colorClass,
  unit,
}: PRDisplayCardProps) {
  return (
    <Card>
      <div className="py-2 text-center">
        <p className="mb-2 text-3xl">🏆</p>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-5xl font-bold ${colorClass}`}>{value || "--"}</p>
        {unit && <p className="mt-1 text-sm text-gray-500">{unit}</p>}
        <p className="mt-2 text-xs text-gray-500">
          {date ? `Set ${date}` : "No PR recorded"}
        </p>
      </div>
    </Card>
  );
}
