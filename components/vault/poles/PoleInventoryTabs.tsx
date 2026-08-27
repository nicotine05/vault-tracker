"use client";

import {
  segmentedIdleClassName,
  segmentedSelectedClassName,
} from "@/lib/ui/componentStyles";

export type PoleInventoryTab = "inventory" | "progression" | "bags";

type PoleInventoryTabsProps = {
  activeTab: PoleInventoryTab;
  onChange: (tab: PoleInventoryTab) => void;
};

const TABS: Array<{ id: PoleInventoryTab; label: string }> = [
  { id: "inventory", label: "Inventory" },
  { id: "progression", label: "Progression" },
  { id: "bags", label: "Pole Bags" },
];

export default function PoleInventoryTabs({
  activeTab,
  onChange,
}: PoleInventoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Pole inventory views"
      className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-surface-muted p-1"
    >
      {TABS.map((tab) => {
        const selected = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
              selected ? segmentedSelectedClassName : segmentedIdleClassName
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
