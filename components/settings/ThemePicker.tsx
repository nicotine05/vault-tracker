"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { themeOptions } from "@/lib/ui/themes";

export default function ThemePicker() {
  const { user, refreshSession } = useAuth();
  const { theme, setTheme, saveTheme, hasUnsavedChanges } = useTheme();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const error = await saveTheme();
    if (error) {
      setMessage(error);
    } else {
      if (user) {
        await refreshSession();
      }
      setMessage(user ? "Theme saved to your account." : "Theme saved.");
    }

    setSaving(false);
  }

  return (
    <Card title="Color Theme">
      <div className="space-y-3">
        {themeOptions.map((option) => {
          const selected = theme === option.id;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setTheme(option.id);
                setMessage(null);
              }}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-accent bg-accent-soft ring-2 ring-accent"
                  : "border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-foreground">{option.name}</p>

                <div className="flex shrink-0 gap-1.5">
                  {option.swatches.map((color) => (
                    <span
                      key={color}
                      className="h-6 w-6 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={!hasUnsavedChanges || saving}
        className="mt-4 w-full rounded-xl bg-accent p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save theme"}
      </button>

      {message && (
        <p className="mt-2 text-center text-xs text-muted">{message}</p>
      )}
    </Card>
  );
}
