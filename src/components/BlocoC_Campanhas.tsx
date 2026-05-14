import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { AdChannel, CampanhaRow } from '@/lib/types';
import { formatBRL, formatInt, formatPct } from '@/lib/formatters';
import { Card } from './shared/Card';
import { TableSkeleton } from './shared/TableSkeleton';
import { EmptyState } from './shared/EmptyState';
import { cn } from '@/lib/utils';

interface Props {
  data: CampanhaRow[] | null;
  loading: boolean;
}

type SortKey = keyof Pick<
  CampanhaRow,
  'name' | 'impressions' | 'ctr' | 'conversas_meta' | 'leads_reonic' | 'cpl_real' | 'mql' | 'cac' | 'ticket_medio_realizado' | 'spend'
>;

type SortDir = 'asc' | 'desc';
type ChannelFilter = 'all' | AdChannel;

const COLS: Array<{ key: SortKey; label: string; align?: 'right'; format?: (v: number | string) => string }> = [
  { key: 'name', label: 'Campanha' },
  { key: 'impressions', label: 'Impressões', align: 'right', format: (v) => formatInt(Number(v)) },
  { key: 'ctr', label: 'CTR', align: 'right', format: (v) => formatPct(Number(v), 2) },
  { key: 'conversas_meta', label: 'Convers. Plat.', align: 'right', format: (v) => formatInt(Number(v)) },
  { key: 'leads_reonic', label: 'Leads Reonic', align: 'right', format: (v) => formatInt(Number(v)) },
  { key: 'cpl_real', label: 'CPL real', align: 'right', format: (v) => formatBRL(Number(v)) },
  { key: 'mql', label: 'MQL', align: 'right', format: (v) => formatInt(Number(v)) },
  { key: 'cac', label: 'CAC', align: 'right', format: (v) => formatBRL(Number(v)) },
  { key: 'ticket_medio_realizado', label: 'Ticket médio', align: 'right', format: (v) => formatBRL(Number(v)) },
  { key: 'spend', label: 'Spend', align: 'right', format: (v) => formatBRL(Number(v)) },
];

function ChannelPill({ channel }: { channel: AdChannel }) {
  if (channel === 'google') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border border-amber-400/40 text-amber-300 bg-amber-400/10">
        Google
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border border-sky-400/40 text-sky-300 bg-sky-400/10">
      Meta
    </span>
  );
}

export function BlocoC_Campanhas({ data, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');

  const channels = useMemo(() => {
    if (!data) return new Set<AdChannel>();
    return new Set(data.map((r) => r.channel ?? 'meta'));
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    const filtered = channelFilter === 'all' ? data : data.filter((r) => (r.channel ?? 'meta') === channelFilter);
    const copy = [...filtered];
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb), 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [data, sortKey, sortDir, channelFilter]);

  const totals = useMemo(() => {
    if (!rows.length) return null;
    return rows.reduce(
      (acc, r) => ({
        impressions: acc.impressions + r.impressions,
        leads_reonic: acc.leads_reonic + r.leads_reonic,
        conversas_meta: acc.conversas_meta + r.conversas_meta,
        spend: acc.spend + r.spend,
        mql: acc.mql + r.mql,
      }),
      { impressions: 0, leads_reonic: 0, conversas_meta: 0, spend: 0, mql: 0 }
    );
  }, [rows]);

  if (loading && !data) {
    return (
      <Card tag="Performance por Campanha" className="xl:col-span-3">
        <TableSkeleton rows={6} columns={8} />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card tag="Performance por Campanha" className="xl:col-span-3">
        <EmptyState title="Nenhuma campanha no período" description="Verifique se há campanhas ACTIVE/PAUSED na conta Meta." />
      </Card>
    );
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const showFilter = channels.size > 1;

  return (
    <Card tag="Performance por Campanha" className="xl:col-span-3">
      {showFilter && (
        <div role="group" aria-label="Filtrar por canal" className="flex items-center gap-2 mb-3">
          <span className="text-[11px] uppercase tracking-wider text-gray-500">Canal:</span>
          {(['all', 'meta', 'google'] as ChannelFilter[]).map((opt) => {
            if (opt !== 'all' && !channels.has(opt)) return null;
            const active = channelFilter === opt;
            const label = opt === 'all' ? 'Todos' : opt === 'meta' ? 'Meta' : 'Google';
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={active}
                onClick={() => setChannelFilter(opt)}
                className={cn(
                  'px-3 py-1 text-xs uppercase tracking-wider rounded border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
                  active
                    ? 'border-gold/60 text-gold bg-gold/10'
                    : 'border-gold/15 text-gray-400 hover:border-gold/30 hover:text-gold'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-sm" aria-label="Performance por campanha">
          <thead>
            <tr className="bg-navy text-gold">
              <th scope="col" className="px-3 py-2 text-xs uppercase tracking-wider font-medium text-left whitespace-nowrap">Canal</th>
              {COLS.map((c) => {
                const active = sortKey === c.key;
                const Icon = !active ? ArrowUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
                const ariaSort: 'ascending' | 'descending' | 'none' = active
                  ? (sortDir === 'asc' ? 'ascending' : 'descending')
                  : 'none';
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      'px-3 py-2 text-xs uppercase tracking-wider font-medium whitespace-nowrap',
                      c.align === 'right' ? 'text-right' : 'text-left',
                      active && 'text-goldLight'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      aria-label={`Ordenar por ${c.label}${active ? ` (atual: ${sortDir === 'asc' ? 'crescente' : 'decrescente'})` : ''}`}
                      className={cn(
                        'inline-flex items-center gap-1 select-none rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
                        c.align === 'right' && 'ml-auto'
                      )}
                    >
                      {c.label}
                      <Icon size={12} className={active ? 'opacity-100' : 'opacity-40'} aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className={cn(idx % 2 === 0 ? 'bg-bgCard' : 'bg-[#1A1A1A]')}>
                <td className="px-3 py-2 whitespace-nowrap">
                  <ChannelPill channel={r.channel ?? 'meta'} />
                </td>
                {COLS.map((c) => {
                  const raw = r[c.key];
                  const display = c.format ? c.format(raw as number) : String(raw);
                  return (
                    <td
                      key={c.key}
                      className={cn(
                        'px-3 py-2 whitespace-nowrap tabular-nums',
                        c.align === 'right' ? 'text-right' : 'text-left',
                        c.key === 'name' && 'max-w-[280px] truncate text-gray-200',
                        c.key === 'spend' && 'text-gold font-medium'
                      )}
                      title={c.key === 'name' ? String(raw) : undefined}
                    >
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
            {totals && (
              <tr className="border-t border-gold/20 bg-navyLight text-gold">
                <td className="px-3 py-2"></td>
                <td className="px-3 py-2 text-xs uppercase tracking-wider font-semibold">Total</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatInt(totals.impressions)}</td>
                <td className="px-3 py-2 text-right tabular-nums">—</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatInt(totals.conversas_meta)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatInt(totals.leads_reonic)}</td>
                <td className="px-3 py-2 text-right tabular-nums">—</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatInt(totals.mql)}</td>
                <td className="px-3 py-2 text-right tabular-nums">—</td>
                <td className="px-3 py-2 text-right tabular-nums">—</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatBRL(totals.spend)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
