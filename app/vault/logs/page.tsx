"use client";

import { useState } from "react";
import Card from "@/components/Card";
import VaultNewSessionPanel from "@/components/vault/VaultNewSessionPanel";
import VaultSessionList from "@/components/vault/VaultSessionList";
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
    addJump,
    removeJump,
    saveSession,
    deleteSession,
    saveHeightPRs,
    updateRunPRField,
  } = useVaultLogState();

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(
    null
  );
  const [weekFilter, setWeekFilter] = useState("all");
  const [editingRefs, setEditingRefs] = useState(false);
  const [showPRMenu, setShowPRMenu] = useState(false);

  return (
    <main className="max-w-5xl mx-auto p-4 pb-20">
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

          <VaultSessionList
            sessions={sessions}
            stepRefs={stepRefs}
            weekFilter={weekFilter}
            onWeekFilterChange={setWeekFilter}
            expandedSessionId={expandedSessionId}
            onToggleExpanded={setExpandedSessionId}
            onDeleteSession={deleteSession}
            readOnly={isCoachReadOnly}
          />
        </div>

        <Card>
          <VaultNewSessionPanel
            readOnly={isCoachReadOnly}
            keys={keys}
            onKeysChange={setKeys}
            jumpForm={jumpForm}
            onJumpFormChange={setJumpForm}
            jumps={jumps}
            stepRefs={stepRefs}
            onAddJump={addJump}
            onRemoveJump={removeJump}
            onSaveSession={saveSession}
          />
        </Card>
      </div>
    </main>
  );
}
