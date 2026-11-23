"use client";

import { useState } from "react";
import Card from "@/components/Card";
import HubLinkCard from "@/components/navigation/HubLinkCard";
import VaultNewSessionPanel from "@/components/vault/VaultNewSessionPanel";
import VaultStepReferencePanel from "@/components/vault/VaultStepReferencePanel";
import { useAuth } from "@/components/AuthProvider";
import { useVaultLogState } from "@/lib/hooks/useVaultLogState";

export default function VaultLogsPage() {
  const { isCoachReadOnly } = useAuth();
  const {
    sessions,
    stepRefs,
    setStepRefs,
    runPRs,
    prHistory,
    keys,
    setKeys,
    jumps,
    jumpForm,
    setJumpForm,
    competitionMode,
    setCompetitionMode,
    addJump,
    removeJump,
    clearSession,
    canClearSession,
    saveSession,
    saveHeightPRs,
    updateRunPRField,
    poles,
    recentPoleIds,
  } = useVaultLogState();

  const [editingRefs, setEditingRefs] = useState(false);
  const [showPRMenu, setShowPRMenu] = useState(false);

  const sessionsDescription =
    sessions.length === 0
      ? "No sessions logged yet."
      : `Review past practice and competition logs by week · ${sessions.length} saved`;

  return (
    <main className="mx-auto max-w-5xl p-4 pb-20">
      <h1 className="mb-4 text-3xl font-bold">Vault Logs</h1>

      <div className="grid items-start gap-4 md:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card>
            <VaultStepReferencePanel
              readOnly={isCoachReadOnly}
              editingRefs={editingRefs}
              onToggleEditing={() => setEditingRefs((current) => !current)}
              showPRMenu={showPRMenu}
              onTogglePRMenu={() => setShowPRMenu((current) => !current)}
              stepRefs={stepRefs}
              onStepRefsChange={setStepRefs}
              runPRs={runPRs}
              onRunPRChange={updateRunPRField}
              onSaveHeightPRs={saveHeightPRs}
              latestPRDate={prHistory[0]?.date}
            />
          </Card>

          <HubLinkCard
            href="/vault/logs/sessions"
            icon="📋"
            title="Vault Sessions"
            description={sessionsDescription}
          />
        </div>

        <Card
          className={
            competitionMode
              ? "border-amber-400/70 from-amber-500/15 via-amber-500/5 to-surface"
              : ""
          }
        >
          <VaultNewSessionPanel
            readOnly={isCoachReadOnly}
            competitionMode={competitionMode}
            onCompetitionModeChange={setCompetitionMode}
            keys={keys}
            onKeysChange={setKeys}
            jumpForm={jumpForm}
            onJumpFormChange={setJumpForm}
            jumps={jumps}
            stepRefs={stepRefs}
            poles={poles}
            recentPoleIds={recentPoleIds}
            onAddJump={addJump}
            onRemoveJump={removeJump}
            onClearSession={clearSession}
            canClearSession={canClearSession}
            onSaveSession={saveSession}
          />
        </Card>
      </div>
    </main>
  );
}
