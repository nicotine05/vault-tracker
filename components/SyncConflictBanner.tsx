"use client";

import { useEffect, useState } from "react";
import {
  getSyncConflict,
  resolveSyncConflict,
  subscribeSyncConflict,
  type SyncConflictInfo,
} from "@/lib/sync/syncClient";
import {
  destructiveButtonClassName,
  destructiveOutlineButtonClassName,
  syncConflictBannerClassName,
} from "@/lib/ui/componentStyles";

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
    <div className={syncConflictBannerClassName}>
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
          className={destructiveButtonClassName}
        >
          Keep this device
        </button>
        <button
          type="button"
          disabled={resolving}
          onClick={() => void handleResolve("use-remote")}
          className={destructiveOutlineButtonClassName}
        >
          Use server copy
        </button>
      </div>
    </div>
  );
}
