import HubLinkCard from "@/components/navigation/HubLinkCard";

export default function VaultHubPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Vault</h1>
      </div>

      <div className="space-y-3">
        <HubLinkCard href="/vault/logs" icon="🏆" title="Vault Logs" />

        <HubLinkCard
          href="/vault/video-analysis"
          icon="🎬"
          title="Video Analysis"
        />

        <HubLinkCard href="/vault/poles" icon="🎯" title="Pole Inventory" />

        <HubLinkCard
          href="/vault/meets"
          icon="📅"
          title="Meet Schedule"
          description="Plan meets and see them on your training calendar"
        />
      </div>
    </main>
  );
}
