"use client";

import AccountSettings from "@/components/AccountSettings";
import ThemePicker from "@/components/settings/ThemePicker";

export default function SettingsPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>

      <ThemePicker />

      <div className="mt-4">
        <AccountSettings />
      </div>
    </main>
  );
}
