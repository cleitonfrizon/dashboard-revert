import type { FunilBlock } from '@/lib/types';
import { formatInt, formatRate } from '@/lib/formatters';
import { Card } from './shared/Card';
import { Skeleton } from './shared/Skeleton';
import { cn } from '@/lib/utils';

interface Props {
  data: FunilBlock | null;
  loading: boolean;
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

function statusColor(rate: number, benchmark: number): 'good' | 'warning' | 'bad' {
  if (benchmark <= 0) return 'good';
  const ratio = rate / benchmark;
  if (ratio >= 0.9) return 'good';
  if (ratio >= 0.6) return 'warning';
  return 'bad';
}

export function BlocoB_Funil({ data, loading }: Props) {
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
      <h2 className="font-display text-xl text-white mb-4">Últimos 30 dias</h2>
      <div className="space-y-4">
        {STAGES.map((stage, idx) => {
          const value = data[stage.key] as number;
          const widthPct = Math.max(8, (value / max) * 100);
          const prevValue = idx === 0 ? value : (data[STAGES[idx - 1].key] as number);
          const innerConv = idx === 0 ? 1 : prevValue > 0 ? value / prevValue : 0;
          return (
            <div key={stage.key}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-gray-200">{stage.label}</span>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-2xl text-gold">{formatInt(value)}</span>
                  {idx > 0 && (
                    <span className="text-xs text-gray-500">{formatRate(innerConv, 0)} do anterior</span>
                  )}
                </div>
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
