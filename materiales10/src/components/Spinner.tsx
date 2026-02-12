"use client";

export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  }[size];

  return (
    <div className="flex justify-center py-8">
      <div className={`animate-spin rounded-full border-dark-50 border-t-brand-400 ${sizeClass}`} />
    </div>
  );
}
