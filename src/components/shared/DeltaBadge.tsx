import { cn } from '@/lib/utils';
import { formatDelta } from '@/lib/formatters';

export interface DeltaBadgeProps {
  value: number;
  positiveIsBad?: boolean;
  label?: string;
}

export function DeltaBadge({ value, positiveIsBad = false, label }: DeltaBadgeProps) {
  const isUp = value > 0;
  const isGood = positiveIsBad ? !isUp : isUp;
  const color = value === 0
    ? 'text-gray-300 border-gray-300/30'
    : isGood
      ? 'text-success border-success/40'
      : 'text-danger border-danger/40';
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', color)}>
      {formatDelta(value)}
      {label && <span className="ml-1 text-[10px] uppercase tracking-wider opacity-70">{label}</span>}
    </span>
  );
}
