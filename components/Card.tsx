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
      className={`bg-gradient-to-br from-white via-slate-50 to-violet-50 p-5 rounded-2xl shadow-sm border border-violet-100 ${className}`}
    >
      {title && (
        <h2 className="text-xl font-bold mb-3 text-slate-800">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}