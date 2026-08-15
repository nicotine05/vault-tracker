type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  title,
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-gradient-to-br from-surface via-surface-muted to-surface-accent p-5 rounded-2xl shadow-sm border border-border-accent ${className}`}
    >
      {title && (
        <h2 className="text-xl font-bold mb-3 text-foreground">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}