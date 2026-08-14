export function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getString(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;

  const raw = localStorage.getItem(key);
  return raw ?? fallback;
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  if (typeof value === "string") {
    localStorage.setItem(key, value);
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}
