import Link from "next/link";
import Card from "@/components/Card";

type HubLinkCardProps = {
  href: string;
  title: string;
  description: string;
  icon?: string;
  badge?: string;
};

export default function HubLinkCard({
  href,
  title,
  description,
  icon,
  badge,
}: HubLinkCardProps) {
  return (
    <Link href={href} className="block">
      <Card className="cursor-pointer transition hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {icon && <span className="text-xl">{icon}</span>}
              <p className="text-lg font-bold text-foreground">{title}</p>
              {badge && (
                <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">{description}</p>
          </div>
          <span className="shrink-0 text-xl text-muted">→</span>
        </div>
      </Card>
    </Link>
  );
}
