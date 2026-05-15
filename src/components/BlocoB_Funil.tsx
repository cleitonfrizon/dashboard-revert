import type { FunilBlock } from '@/lib/types';
import { formatInt, formatRate } from '@/lib/formatters';
import { Card } from './shared/Card';
import { Skeleton } from './shared/Skeleton';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

interface Props {
  data: FunilBlock | null;
  loading: boolean;
  periodLabel?: string;
}

interface Stage {
  key: keyof Pick<FunilBlock, 'leads' | 'triagem' | 'proposta' | 'negociacao' | 'fechado'>;
  label: string;
}

const STAGES: Stage[] = [
  { key: 'leads', label: 'Leads recebidos' },
  { key: 'triagem', label: 'Triagem realizada' },
  { key: 'proposta', label: 'Proposta enviada' },
  { key: 'negociacao', label: 'Em negociação' },
  { key: 'fechado', label: 'Fechado' },
];

type RateKey =
  | 'lead_to_triagem'
  | 'triagem_to_proposta'
  | 'proposta_to_negociacao'
  | 'negociacao_to_fechado';

const TRANSITIONS: Array<{ key: RateKey; label: string }> = [
  { key: 'lead_to_triagem', label: 'Lead → Triagem' },
  { key: 'triagem_to_proposta', label: 'Triagem → Proposta' },
  { key: 'proposta_to_negociacao', label: 'Proposta → Negociação' },
  { key: 'negociacao_to_fechado', label: 'Negociação → Fechado' },
];

const STAGE_TO_RATE: Record<string, RateKey> = {
  triagem: 'lead_to_triagem',
  proposta: 'triagem_to_proposta',
  negociacao: 'proposta_to_negociacao',
  fechado: 'negociacao_to_fechado',
};

function statusColor(rate: number, benchmark: number): 'good' | 'warning' | 'bad' {
  if (benchmark <= 0) return 'good';
  const ratio = rate / benchmark;
  if (ratio >= 0.9) return 'good';
  if (ratio >= 0.6) return 'warning';
  return 'bad';
}

export function BlocoB_Funil({ data, loading, periodLabel }: Props) {
  if (loading && !data) {
    return (
      <Card tag="Funil de Conversão">
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }
  if (!data) return null;

  const max = Math.max(1, ...STAGES.map((s) => data[s.key] as number));

  return (
    <Card tag="Funil de Conversão" className="xl:col-span-2">
      <h2 className="font-display text-xl text-white mb-4">{periodLabel ?? 'Últimos 30 dias'}</h2>
      <div>
        {STAGES.map((stage, idx) => {
          const value = data[stage.key] as number;
          const widthPct = Math.max(8, (value / max) * 100);
          const prevValue = idx === 0 ? value : (data[STAGES[idx - 1].key] as number);
          const innerConv = idx === 0 ? 1 : prevValue > 0 ? value / prevValue : 0;
          const drop = idx === 0 ? 0 : prevValue - value;
          const rateKey = STAGE_TO_RATE[stage.key];
          const benchmark = rateKey ? data.benchmarks[rateKey] : 0;
          const tone = idx === 0 ? 'neutral' : statusColor(innerConv, benchmark);
          return (
            <div key={stage.key}>
              {idx > 0 && (
                <div className="flex items-center gap-2 pl-1 my-1.5">
                  <ArrowDown size={12} className={cn(
                    tone === 'good' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-danger'
                  )} aria-hidden="true" />
                  <span className={cn(
                    'text-[11px] tabular-nums font-medium',
                    tone === 'good' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-danger'
                  )}>
                    {formatRate(innerConv, 0)}
                  </span>
                  {drop > 0 && (
                    <span className="text-[11px] text-gray-500 tabular-nums">−{formatInt(drop)} leads</span>
                  )}
                  {benchmark > 0 && (
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider ml-auto">
                      bench {formatRate(benchmark, 0)}
                    </span>
                  )}
                </div>
              )}
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-gray-200">{stage.label}</span>
                <span className="font-display text-2xl text-gold tabular-nums">{formatInt(value)}</span>
              </div>
              <div className="h-2 rounded-full bg-navyLight overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold/40 via-gold to-goldLight transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-5 border-t border-gold/10">
        <span className="section-tag block mb-3">Taxas vs benchmark</span>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {TRANSITIONS.map((t) => {
            const rate = data.conversion_rates[t.key];
            const benchmark = data.benchmarks[t.key];
            const tone = statusColor(rate, benchmark);
            const toneClass =
              tone === 'good'
                ? 'text-success'
                : tone === 'warning'
                  ? 'text-warning'
                  : 'text-danger';
            return (
              <div key={t.key} className="flex items-center justify-between gap-3">
                <span className="text-gray-400 truncate">{t.label}</span>
                <span className={cn('font-semibold tabular-nums', toneClass)}>
                  {formatRate(rate, 0)}
                  <span className="ml-1 text-gray-500 font-normal">/ {formatRate(benchmark, 0)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
