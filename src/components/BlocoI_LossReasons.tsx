import type { LossReasonsBlock } from '@/lib/types';
import { formatBRL, formatInt } from '@/lib/formatters';
import { Card } from './shared/Card';
import { Skeleton } from './shared/Skeleton';
import { EmptyState } from './shared/EmptyState';
import { TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  data: LossReasonsBlock | null | undefined;
  loading: boolean;
  periodLabel?: string;
}

export function BlocoI_LossReasons({ data, loading, periodLabel }: Props) {
  if (loading && !data) {
    return (
      <Card tag={`Razões de Perda · ${periodLabel ?? ''}`}>
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }
  if (!data || !data.items || data.items.length === 0) {
    return (
      <Card tag={`Razões de Perda · ${periodLabel ?? ''}`}>
        <EmptyState
          icon={<TrendingDown size={28} />}
          title={data && data.total_lost === 0 ? 'Nenhuma venda perdida' : 'Sem motivo registrado'}
          description={
            data && data.total_lost === 0
              ? 'Nenhuma offer com state=Lost no período. Isso é bom (ou indica que ninguém está fechando "perdido" no Reonic — verificar).'
              : 'Há ofertas perdidas mas o time não registrou closeLostReason. Padronizar esse campo desbloqueia análise causal.'
          }
          hint="Registrar lostReason em toda perda · informa decisão"
        />
      </Card>
    );
  }

  const max = Math.max(...data.items.map((r) => r.count), 1);

  return (
    <Card tag={`Razões de Perda · ${periodLabel ?? ''}`}>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-display text-xl text-white">{formatInt(data.total_lost)}</span>
        <span className="text-xs text-gray-500">{data.total_lost === 1 ? 'venda perdida' : 'vendas perdidas'} no período</span>
      </div>
      <ul className="space-y-2.5">
        {data.items.map((r, idx) => {
          const widthPct = (r.count / max) * 100;
          const isFirst = idx === 0;
          return (
            <li key={r.reason}>
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className={cn('text-sm truncate flex-1', isFirst ? 'text-gray-100 font-medium' : 'text-gray-300')} title={r.reason}>
                  {r.reason}
                </span>
                <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                  {formatInt(r.count)} <span className="text-gray-600">({(r.pct * 100).toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-navyLight overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isFirst ? 'bg-danger/70' : 'bg-warning/50'
                  )}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              {r.revenue_lost > 0 && (
                <div className="text-[10px] text-gray-600 mt-1 tabular-nums">
                  Receita perdida: {formatBRL(r.revenue_lost)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
