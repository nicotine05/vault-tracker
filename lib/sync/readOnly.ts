/** Coach accounts monitor athlete data only — no writes to athlete sync data. */
let coachReadOnly = false;

export function setCoachReadOnly(enabled: boolean): void {
  coachReadOnly = enabled;
}

export function isCoachReadOnly(): boolean {
  return coachReadOnly;
}
