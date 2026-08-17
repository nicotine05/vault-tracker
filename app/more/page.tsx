import HubLinkCard from "@/components/navigation/HubLinkCard";

export default function MoreHubPage() {
  return (
    <main className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">More</h1>
        <p className="mt-1 text-sm text-muted">
          Nutrition, settings, and additional tools.
        </p>
      </div>

      <div className="space-y-3">
        <HubLinkCard
          href="/nutrition"
          icon="🍽️"
          title="Nutrition"
          description="Weekly meal plans aligned with your training phase."
        />

        <HubLinkCard
          href="/settings"
          icon="⚙️"
          title="Settings"
          description="Account, theme, and app preferences."
        />

        <div className="pt-2">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Training PR Logs
          </p>

          <div className="space-y-3">
            <HubLinkCard
              href="/logs/sprint"
              icon="🏃"
              title="Sprint Log"
              description="Store 10m, 20m, and 30m sprint PRs."
            />

            <HubLinkCard
              href="/logs/strength"
              icon="💪"
              title="Strength Log"
              description="Track bench, squat, and pullup PRs."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
