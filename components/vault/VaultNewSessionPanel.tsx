"use client";

import type { Jump, VaultStepReferences } from "@/lib/domain/types";
import { getGradeEmoji, getRunReference } from "@/lib/domain/vaultLog";

type JumpFormState = {
  run: string;
  grip: string;
  takeoff: string;
  grade: Jump["grade"];
  comment: string;
};

type VaultNewSessionPanelProps = {
  readOnly: boolean;
  keys: string[];
  onKeysChange: (keys: string[]) => void;
  jumpForm: JumpFormState;
  onJumpFormChange: (form: JumpFormState) => void;
  jumps: Jump[];
  stepRefs: VaultStepReferences;
  onAddJump: () => void;
  onRemoveJump: (jumpId: string) => void;
  onSaveSession: () => void;
};

export default function VaultNewSessionPanel({
  readOnly,
  keys,
  onKeysChange,
  jumpForm,
  onJumpFormChange,
  jumps,
  stepRefs,
  onAddJump,
  onRemoveJump,
  onSaveSession,
}: VaultNewSessionPanelProps) {
  return (
    <fieldset disabled={readOnly} className="m-0 min-w-0 space-y-4 border-0 p-0">
      <div className="space-y-4">
        <div className="rounded-xl border border-purple-200 bg-purple-100 p-3">
          <h2 className="text-lg font-bold text-purple-900">New Vault Session</h2>
        </div>

        <div className="space-y-3">
          <p className="font-medium">Daily Keys</p>

          {keys.map((key, index) => (
            <input
              key={index}
              value={key}
              onChange={(event) => {
                const updated = [...keys];
                updated[index] = event.target.value;
                onKeysChange(updated);
              }}
              placeholder="Key"
              className="w-full rounded-xl border p-3"
            />
          ))}

          {keys.length < 3 && (
            <button
              type="button"
              onClick={() => onKeysChange([...keys, ""])}
              className="w-full rounded-xl border p-2 text-sm"
            >
              + Add Key
            </button>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="mb-3 font-semibold">Add Jump</p>

          <div className="space-y-3">
            <input
              value={jumpForm.run}
              onChange={(event) =>
                onJumpFormChange({ ...jumpForm, run: event.target.value })
              }
              placeholder="Run"
              className="w-full rounded-xl border p-3"
            />

            <input
              value={jumpForm.grip}
              onChange={(event) =>
                onJumpFormChange({ ...jumpForm, grip: event.target.value })
              }
              placeholder="Grip"
              className="w-full rounded-xl border p-3"
            />

            <input
              value={jumpForm.takeoff}
              onChange={(event) =>
                onJumpFormChange({ ...jumpForm, takeoff: event.target.value })
              }
              placeholder="Takeoff"
              className="w-full rounded-xl border p-3"
            />

            <div className="grid grid-cols-3 gap-2">
              {(["green", "yellow", "red"] as const).map((grade) => {
                const selected = jumpForm.grade === grade;

                return (
                  <button
                    key={grade}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      onJumpFormChange({
                        ...jumpForm,
                        grade,
                      })
                    }
                    className={`rounded-xl border p-3 text-2xl transition ${
                      selected
                        ? "border-gray-900 bg-white ring-2 ring-gray-900"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {getGradeEmoji(grade)}
                  </button>
                );
              })}
            </div>

            <input
              value={jumpForm.comment}
              onChange={(event) =>
                onJumpFormChange({ ...jumpForm, comment: event.target.value })
              }
              placeholder="Comment"
              className="w-full rounded-xl border p-3"
            />

            <button
              type="button"
              onClick={onAddJump}
              className="w-full rounded-xl bg-gray-200 p-3 font-semibold"
            >
              + Add Jump
            </button>
          </div>
        </div>

        {jumps.length > 0 && (
          <div className="overflow-hidden rounded-xl border">
            <div className="bg-gray-100 p-3 font-semibold">
              Current Session ({jumps.length} jumps)
            </div>

            <div className="divide-y">
              {jumps.map((jump) => {
                const reference = getRunReference(jump.run, stepRefs);

                return (
                  <div key={jump.id} className="p-3">
                    <div className="flex justify-between">
                      <span>{getGradeEmoji(jump.grade)}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveJump(jump.id)}
                        className="text-sm text-red-500"
                      >
                        Delete
                      </button>
                    </div>

                    <p>Run: {jump.run}</p>
                    {reference && (
                      <p className="text-sm text-gray-500">Ref: {reference}</p>
                    )}
                    <p>Grip: {jump.grip}</p>
                    <p>Takeoff: {jump.takeoff}</p>
                    {jump.comment && <p className="text-gray-600">{jump.comment}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onSaveSession}
          disabled={jumps.length === 0}
          className="w-full rounded-xl bg-blue-500 p-3 font-semibold text-white disabled:bg-gray-300"
        >
          Save Vault Session
        </button>
      </div>
    </fieldset>
  );
}
