import HubLinkCard from "@/components/navigation/HubLinkCard";

export default function VaultHubPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Vault</h1>
        <p className="mt-1 text-sm text-muted">
          Your pole vault performance hub — logs, review, and analysis.
        </p>
      </div>

      <div className="space-y-3">
        <HubLinkCard
          href="/vault/logs"
          icon="🏆"
          title="Vault Logs"
          description="Track vault sessions, height PRs, step references, grips, runs, and jump quality."
        />

        <HubLinkCard
          href="/vault/video-analysis"
          icon="🎬"
          title="Video Analysis"
          description="Frame-by-frame review, comparison, and telestration tools."
        />
      </div>
    </main>
  );
}
