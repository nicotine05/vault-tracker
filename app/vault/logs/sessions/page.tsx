"use client";

import Link from "next/link";
import { useState } from "react";
import VaultSessionList from "@/components/vault/VaultSessionList";
import { useAuth } from "@/components/AuthProvider";
import { VAULT_SESSION_RECENT_FILTER } from "@/lib/domain/vaultLog";
import { useVaultLogState } from "@/lib/hooks/useVaultLogState";
import { linkTextClassName } from "@/lib/ui/componentStyles";

export default function VaultSessionsPage() {
  const { isCoachReadOnly } = useAuth();
  const { sessions, stepRefs, poles, deleteSession } = useVaultLogState();

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );
  const [weekFilter, setWeekFilter] = useState(VAULT_SESSION_RECENT_FILTER);

  return (
    <main className="mx-auto max-w-5xl p-4 pb-20">
      <Link href="/vault/logs" className={linkTextClassName}>
        ← Vault Logs
      </Link>

      <div className="mt-4">
        <VaultSessionList
          sessions={sessions}
          stepRefs={stepRefs}
          poles={poles}
          weekFilter={weekFilter}
          onWeekFilterChange={setWeekFilter}
          expandedSessionId={expandedSessionId}
          onToggleExpanded={setExpandedSessionId}
          onDeleteSession={deleteSession}
          readOnly={isCoachReadOnly}
        />
      </div>
    </main>
  );
}
