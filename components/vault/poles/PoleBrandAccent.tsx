"use client";

import { getBrandColor } from "@/lib/poleCatalog";

type PoleBrandAccentProps = {
  brandId: string;
  className?: string;
};

export default function PoleBrandAccent({
  brandId,
  className = "",
}: PoleBrandAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: getBrandColor(brandId) }}
    />
  );
}

export function PoleBrandStripe({
  brandId,
  className = "",
}: PoleBrandAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl ${className}`}
      style={{ backgroundColor: getBrandColor(brandId) }}
    />
  );
}
