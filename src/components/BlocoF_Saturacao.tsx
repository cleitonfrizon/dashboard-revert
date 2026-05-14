import type { SaturacaoRow } from '@/lib/types';
import { formatBRL, formatPct } from '@/lib/formatters';
import { Card } from './shared/Card';
import { TableSkeleton } from './shared/TableSkeleton';
import { EmptyState } from './shared/EmptyState';
import { cn } from '@/lib/utils';

interface Props {
  data: SaturacaoRow[] | null;
  loading: boolean;
}

const RECOMMENDATION_TONE = {
  ok: { bg: 'bg-success/15', text: 'text-success', border: 'border-success/40', label: 'OK' },
  monitor: { bg: 'bg-warning/15', text: 'text-warning', border: 'border-warning/40', label: 'Monitorar' },
  trocar: { bg: 'bg-danger/15', text: 'text-danger', border: 'border-danger/40', label: 'Trocar criativo' },
} as const;

export function BlocoF_Saturacao({ data, loading }: Props) {
  if (loading && !data) {
    return (
      <Card tag="Saturação Criativa" className="xl:col-span-3">
        <TableSkeleton rows={5} columns={6} />
      </Card>
    );
  }
  if (!data || data.length === 0) {
    return (
      <Card tag="Saturação Criativa" className="xl:col-span-3">
        <EmptyState
          title="Coletando dados"
          description="Sem anúncios ativos retornando impressões nos últimos 7 dias. Tendências CTR/CPL e recomendação de troca aparecem quando há histórico suficiente."
          hint="Mínimo 7 dias de execução · ADR-022"
        />
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => {
    const order = { trocar: 0, monitor: 1, ok: 2 } as const;
    const ra = order[a.recommendation];
    const rb = order[b.recommendation];
    if (ra !== rb) return ra - rb;
    return b.spend_total - a.spend_total;
  });

  return (
    <Card tag="Saturação Criativa" className="xl:col-span-3">
      <h2 className="font-display text-xl text-white mb-4">Criativos ativos · últimos 7 dias</h2>
      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-navy text-gold">
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Anúncio</th>
              <th className="px-3 py-2 text-left text-xs uppercase tracking-wider">Campanha</th>
              <th className="px-3 py-2 text-right text-xs uppercase tracking-wider">Frequência</th>
              <th className="px-3 py-2 text-right text-xs uppercase tracking-wider">CTR 7d</th>
              <th className="px-3 py-2 text-right text-xs uppercase tracking-wider">Spend</th>
              <th className="px-3 py-2 text-center text-xs uppercase tracking-wider">Recomendação</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const tone = RECOMMENDATION_TONE[row.recommendation];
              return (
                <tr key={row.ad_id || idx} className={cn(idx % 2 === 0 ? 'bg-bgCard' : 'bg-[#1A1A1A]')}>
                  <td className="px-3 py-2 max-w-[280px] truncate text-gray-200" title={row.ad_name}>
                    {row.ad_name || '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-400 max-w-[200px] truncate" title={row.campaign_name}>
                    {row.campaign_name || '—'}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.frequency.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPct(row.ctr_7d, 2)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gold font-medium">{formatBRL(row.spend_total)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', tone.bg, tone.text, tone.border)}>
                      {tone.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
