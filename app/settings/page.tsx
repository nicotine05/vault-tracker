"use client";

import AccountSettings from "@/components/AccountSettings";
import HubLinkCard from "@/components/navigation/HubLinkCard";
import ThemePicker from "@/components/settings/ThemePicker";

export default function SettingsPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      <ThemePicker />

      <div className="mt-4">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Training
        </p>
        <HubLinkCard
          href="/settings/injuries"
          icon="🩹"
          title="Injury Management"
          description="Modify training while recovering from injury."
        />
      </div>

      <div className="mt-4">
        <AccountSettings />
      </div>
    </main>
  );
}
