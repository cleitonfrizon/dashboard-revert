import { Skeleton } from './Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 px-3 py-2 bg-navy/40 rounded-sm">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={`r-${r}`}
          className="flex gap-3 px-3 py-3 border-b border-gold/5"
          style={{ opacity: 1 - r * 0.12 }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={`c-${r}-${c}`} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
