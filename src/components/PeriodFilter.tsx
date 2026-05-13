import { cn } from '@/lib/utils';
import type { PeriodPreset } from '@/lib/types';

const PRESETS: Array<{ value: PeriodPreset; label: string }> = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'mes_atual', label: 'Mês atual' },
];

export interface PeriodFilterProps {
  value: PeriodPreset;
  onChange: (v: PeriodPreset) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="section-tag">Período</span>
      <div className="inline-flex rounded-md border border-gold/20 overflow-hidden">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(p.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition',
              value === p.value
                ? 'bg-gold text-navy'
                : 'text-gray-300 hover:bg-gold/10 hover:text-gold'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
