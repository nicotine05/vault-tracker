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
      className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ${className}`}
    >
      {title && (
        <h2 className="text-xl font-bold mb-3">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}