export function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}
