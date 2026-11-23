import { Suspense } from "react";
import SingleVideoWorkspace from "@/components/vault/video/SingleVideoWorkspace";

export default function SingleVideoAnalysisPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md p-4 pb-20">
          <p className="text-sm text-muted">Opening video…</p>
        </main>
      }
    >
      <SingleVideoWorkspace />
    </Suspense>
  );
}
