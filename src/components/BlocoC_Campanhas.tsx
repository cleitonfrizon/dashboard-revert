import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { CampanhaRow } from '@/lib/types';
import { formatBRL, formatInt, formatPct } from '@/lib/formatters';
import { Card } from './shared/Card';
import { Skeleton } from './shared/Skeleton';
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

const COLS: Array<{ key: SortKey; label: string; align?: 'right'; format?: (v: number | string) => string }> = [
  { key: 'name', label: 'Campanha' },
  { key: 'impressions', label: 'Impressões', align: 'right', format: (v) => formatInt(Number(v)) },
  { key: 'ctr', label: 'CTR', align: 'right', format: (v) => formatPct(Number(v), 2) },
  { key: 'conversas_meta', label: 'Convers. Meta', align: 'right', format: (v) => formatInt(Number(v)) },
  { key: 'leads_reonic', label: 'Leads Reonic', align: 'right', format: (v) => formatInt(Number(v)) },
  { key: 'cpl_real', label: 'CPL real', align: 'right', format: (v) => formatBRL(Number(v)) },
  { key: 'mql', label: 'MQL', align: 'right', format: (v) => formatInt(Number(v)) },
  { key: 'cac', label: 'CAC', align: 'right', format: (v) => formatBRL(Number(v)) },
  { key: 'ticket_medio_realizado', label: 'Ticket médio', align: 'right', format: (v) => formatBRL(Number(v)) },
  { key: 'spend', label: 'Spend', align: 'right', format: (v) => formatBRL(Number(v)) },
];

export function BlocoC_Campanhas({ data, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const rows = useMemo(() => {
    if (!data) return [];
    const copy = [...data];
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb), 'pt-BR');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [data, sortKey, sortDir]);

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
        <Skeleton className="h-48 w-full" />
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

  return (
    <Card tag="Performance por Campanha" className="xl:col-span-3">
      <div className="overflow-x-auto -mx-2">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-navy text-gold">
              {COLS.map((c) => {
                const active = sortKey === c.key;
                const Icon = !active ? ArrowUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className={cn(
                      'cursor-pointer select-none px-3 py-2 text-xs uppercase tracking-wider font-medium whitespace-nowrap',
                      c.align === 'right' ? 'text-right' : 'text-left',
                      active && 'text-goldLight'
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      <Icon size={12} className={active ? 'opacity-100' : 'opacity-40'} />
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className={cn(idx % 2 === 0 ? 'bg-bgCard' : 'bg-[#1A1A1A]')}>
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
