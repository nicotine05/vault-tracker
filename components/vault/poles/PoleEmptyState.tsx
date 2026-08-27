import { primaryButtonClassName } from "@/lib/ui/componentStyles";

type PoleEmptyStateProps = {
  onAddFirstPole: () => void;
  readOnly: boolean;
};

export default function PoleEmptyState({
  onAddFirstPole,
  readOnly,
}: PoleEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border-accent bg-surface-muted/60 px-6 py-10 text-center">
      <p className="text-lg font-bold text-foreground">No Poles Added Yet</p>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
        Add your poles to track inventory, progression, and pole bags.
      </p>
      {!readOnly && (
        <button
          type="button"
          onClick={onAddFirstPole}
          className={`${primaryButtonClassName} mx-auto mt-5 max-w-xs`}
        >
          Add First Pole
        </button>
      )}
    </div>
  );
}
