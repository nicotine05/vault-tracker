export function getPhaseBadgeClass(phaseName: string): string {
  if (phaseName === "Rebuild") {
    return "bg-green-100 text-green-700";
  }

  if (phaseName === "Build") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-purple-100 text-purple-700";
}
