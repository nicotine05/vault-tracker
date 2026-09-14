"use client";

import Link from "next/link";
import AccountSettings from "@/components/AccountSettings";
import ThemePicker from "@/components/settings/ThemePicker";
import Card from "@/components/Card";

export default function SettingsPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      <AccountSettings />

      <div className="mt-4">
        <Link href="/settings/injuries" className="block">
          <Card className="cursor-pointer transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🩹</span>
                  <p className="text-lg font-bold text-foreground">
                    Injury Management
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Pause or modify your training program.
                </p>
              </div>
              <span className="shrink-0 text-xl text-muted">→</span>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-4">
        <ThemePicker />
      </div>
    </main>
  );
}
