"use client";

import { useEffect, useState } from "react";
import {
  getSyncConflict,
  resolveSyncConflict,
  subscribeSyncConflict,
  type SyncConflictInfo,
} from "@/lib/sync/syncClient";

export default function SyncConflictBanner() {
  const [conflict, setConflict] = useState<SyncConflictInfo | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    setConflict(getSyncConflict());
    return subscribeSyncConflict(() => {
      setConflict(getSyncConflict());
    });
  }, []);

  if (!conflict) {
    return null;
  }

  async function handleResolve(action: "keep-local" | "use-remote") {
    setResolving(true);
    try {
      await resolveSyncConflict(action);
    } finally {
      setResolving(false);
    }
  }

  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
      <p className="font-semibold">Sync conflict</p>
      <p className="mt-1">
        Another device saved newer data
        {conflict.remoteUpdatedAt
          ? ` (${new Date(conflict.remoteUpdatedAt).toLocaleString()})`
          : ""}
        . Choose which copy to keep.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={resolving}
          onClick={() => void handleResolve("keep-local")}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          Keep this device
        </button>
        <button
          type="button"
          disabled={resolving}
          onClick={() => void handleResolve("use-remote")}
          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 disabled:opacity-60"
        >
          Use server copy
        </button>
      </div>
    </div>
  );
}
