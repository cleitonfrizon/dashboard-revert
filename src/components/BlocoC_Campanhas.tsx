import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, X, Download } from 'lucide-react';
import { rowsToCsv, downloadCsv } from '@/lib/csv';
import type { AdChannel, CampanhaRow } from '@/lib/types';
import { formatBRL, formatInt, formatPct } from '@/lib/formatters';
import { Card } from './shared/Card';
import { TableSkeleton } from './shared/TableSkeleton';
import { EmptyState } from './shared/EmptyState';
import { Tooltip } from './shared/Tooltip';
import { addBreadcrumb } from '@/lib/sentry';
import { cn } from '@/lib/utils';

interface Props {
  data: CampanhaRow[] | null;
  loading: boolean;
  periodLabel?: string;
}

type SortKey = keyof Pick<
  CampanhaRow,
  'name' | 'impressions' | 'ctr' | 'conversas_meta' | 'leads_reonic' | 'cpl_real' | 'mql' | 'cac' | 'ticket_medio_realizado' | 'spend'
>;

type SortDir = 'asc' | 'desc';
type ChannelFilter = 'all' | AdChannel;

const COLS: Array<{ key: SortKey; label: string; align?: 'right'; format?: (v: number | string) => string; tooltip?: string }> = [
  { key: 'name', label: 'Campanha' },
  { key: 'impressions', label: 'Impressões', align: 'right', format: (v) => formatInt(Number(v)), tooltip: 'Soma de impressões da Meta Ads no período' },
  { key: 'ctr', label: 'CTR', align: 'right', format: (v) => formatPct(Number(v), 2), tooltip: 'Click-through rate = cliques ÷ impressões' },
  { key: 'conversas_meta', label: 'Convers. Plat.', align: 'right', format: (v) => formatInt(Number(v)), tooltip: 'Conversões reportadas pela plataforma Meta (lead_grouped + messaging)' },
  { key: 'leads_reonic', label: 'Leads Reonic', align: 'right', format: (v) => formatInt(Number(v)), tooltip: 'Contacts do Reonic com utmCampaign que bate com o nome da campanha' },
  { key: 'cpl_real', label: 'CPL real', align: 'right', format: (v) => formatBRL(Number(v)), tooltip: 'Spend ÷ Leads Reonic (fonte de verdade do funil)' },
  { key: 'mql', label: 'MQL', align: 'right', format: (v) => formatInt(Number(v)), tooltip: 'Marketing Qualified Leads = contacts que viraram offer (proposta gerada)' },
  { key: 'cac', label: 'CAC', align: 'right', format: (v) => formatBRL(Number(v)), tooltip: 'Custo de aquisição = Spend ÷ vendas fechadas (state=Won)' },
  { key: 'ticket_medio_realizado', label: 'Ticket médio', align: 'right', format: (v) => formatBRL(Number(v)), tooltip: 'Média de totalPlannedPrice das offers fechadas no período' },
  { key: 'spend', label: 'Spend', align: 'right', format: (v) => formatBRL(Number(v)), tooltip: 'Verba investida nessa campanha no período' },
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

type StatusFilter = 'all' | 'ACTIVE' | 'PAUSED';

export function BlocoC_Campanhas({ data, loading, periodLabel }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('spend');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const channels = useMemo(() => {
    if (!data) return new Set<AdChannel>();
    return new Set(data.map((r) => r.channel ?? 'meta'));
  }, [data]);

  const statuses = useMemo(() => {
    if (!data) return new Set<string>();
    return new Set(data.map((r) => String(r.status || '').toUpperCase()));
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    const byChannel = channelFilter === 'all' ? data : data.filter((r) => (r.channel ?? 'meta') === channelFilter);
    const byStatus = statusFilter === 'all' ? byChannel : byChannel.filter((r) => String(r.status || '').toUpperCase() === statusFilter);
    const q = searchQuery.trim().toLowerCase();
    const filtered = q ? byStatus.filter((r) => r.name.toLowerCase().includes(q)) : byStatus;
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
  }, [data, sortKey, sortDir, channelFilter, statusFilter, searchQuery]);

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
  const knownStatuses = useMemo(() => {
    const s = new Set<StatusFilter>();
    if (statuses.has('ACTIVE')) s.add('ACTIVE');
    if (statuses.has('PAUSED')) s.add('PAUSED');
    return s;
  }, [statuses]);
  const showStatusFilter = knownStatuses.size > 1;

  return (
    <Card tag={`Performance por Campanha · ${periodLabel ?? 'Últimos 7 dias'}`} className="xl:col-span-3">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar campanha…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar campanha por nome"
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-surface-1 border border-gold/15 rounded text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpar busca"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold"
            >
              <X size={12} />
            </button>
          )}
        </div>
        {searchQuery && (
          <span className="text-[11px] text-gray-500 tabular-nums">
            {rows.length} {rows.length === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            const exportCols = [
              { key: 'channel', label: 'Canal' },
              ...COLS.map((c) => ({ key: c.key, label: c.label })),
            ];
            const exportRows = rows.map((r) => ({
              channel: r.channel ?? 'meta',
              ...COLS.reduce((acc, c) => {
                const v = r[c.key];
                acc[c.key] = typeof v === 'number' ? v.toFixed(2).replace('.', ',') : v;
                return acc;
              }, {} as Record<string, unknown>),
            }));
            const csv = rowsToCsv(exportRows, exportCols);
            const periodSlug = (periodLabel ?? '30d').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const today = new Date().toISOString().slice(0, 10);
            downloadCsv(`campanhas-revert-${periodSlug}-${today}.csv`, csv);
          }}
          aria-label="Exportar campanhas como CSV"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] uppercase tracking-wider rounded border border-gold/25 text-gray-300 hover:border-gold/50 hover:text-gold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ml-auto no-print"
          title="Exportar campanhas atuais como CSV"
        >
          <Download size={12} aria-hidden="true" />
          CSV
        </button>
      </div>
      {(showFilter || showStatusFilter) && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3">
          {showFilter && (
            <div role="group" aria-label="Filtrar por canal" className="flex items-center gap-2">
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
                    onClick={() => {
                      setChannelFilter(opt);
                      addBreadcrumb({ category: 'ui.filter', message: 'channel_filter', data: { value: opt } });
                    }}
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
          {showStatusFilter && (
            <div role="group" aria-label="Filtrar por status" className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500">Status:</span>
              {(['all', 'ACTIVE', 'PAUSED'] as StatusFilter[]).map((opt) => {
                if (opt !== 'all' && !knownStatuses.has(opt)) return null;
                const active = statusFilter === opt;
                const label = opt === 'all' ? 'Todos' : opt === 'ACTIVE' ? 'Ativas' : 'Pausadas';
                const isPaused = opt === 'PAUSED';
                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setStatusFilter(opt);
                      addBreadcrumb({ category: 'ui.filter', message: 'status_filter', data: { value: opt } });
                    }}
                    className={cn(
                      'px-3 py-1 text-xs uppercase tracking-wider rounded border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60',
                      active
                        ? isPaused
                          ? 'border-warning/60 text-warning bg-warning/10'
                          : 'border-gold/60 text-gold bg-gold/10'
                        : 'border-gold/15 text-gray-400 hover:border-gold/30 hover:text-gold'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="md:hidden space-y-2.5">
        {rows.map((r) => (
          <div key={`mobile-${r.id}`} className="border border-gold/10 rounded-md p-3 bg-surface-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="text-sm text-gray-100 truncate flex-1" title={r.name}>{r.name}</div>
              <ChannelPill channel={r.channel ?? 'meta'} />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs tabular-nums">
              <div className="flex justify-between"><span className="text-gray-500">Spend</span><span className="text-gold font-medium">{formatBRL(r.spend)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Leads</span><span className="text-gray-200">{formatInt(r.leads_reonic)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">CTR</span><span className="text-gray-200">{formatPct(r.ctr * 100, 2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">CPL real</span><span className="text-gray-200">{formatBRL(r.cpl_real)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">MQL</span><span className="text-gray-200">{formatInt(r.mql)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">CAC</span><span className="text-gray-200">{formatBRL(r.cac)}</span></div>
            </div>
          </div>
        ))}
        {totals && (
          <div className="border border-gold/30 rounded-md p-3 bg-navyLight text-gold">
            <div className="text-xs uppercase tracking-wider font-semibold mb-2">Total</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs tabular-nums">
              <div className="flex justify-between"><span className="opacity-70">Spend</span><span className="font-semibold">{formatBRL(totals.spend)}</span></div>
              <div className="flex justify-between"><span className="opacity-70">Leads</span><span>{formatInt(totals.leads_reonic)}</span></div>
              <div className="flex justify-between"><span className="opacity-70">Impressões</span><span>{formatInt(totals.impressions)}</span></div>
              <div className="flex justify-between"><span className="opacity-70">MQL</span><span>{formatInt(totals.mql)}</span></div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-auto -mx-2 max-h-[520px] relative">
        <table className="min-w-full text-sm border-separate border-spacing-0" aria-label="Performance por campanha">
          <thead className="sticky top-0 z-20">
            <tr className="bg-navy text-gold">
              <th scope="col" className="sticky left-0 z-30 bg-navy px-3 py-2 text-xs uppercase tracking-wider font-medium text-left whitespace-nowrap shadow-[1px_0_0_0_rgba(200,168,78,0.15)]">Canal</th>
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
                      'bg-navy px-3 py-2 text-xs uppercase tracking-wider font-medium whitespace-nowrap',
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
                      {c.tooltip ? (
                        <Tooltip content={c.tooltip} side="bottom">
                          <span className="cursor-help underline decoration-dotted decoration-gold/30 underline-offset-2">{c.label}</span>
                        </Tooltip>
                      ) : (
                        c.label
                      )}
                      <Icon size={12} className={active ? 'opacity-100' : 'opacity-40'} aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const rowBg = idx % 2 === 0 ? 'bg-surface-1' : 'bg-surface-2';
              return (
                <tr key={r.id} className={cn(rowBg, 'hover:bg-surface-3 transition-colors')}>
                  <td className={cn('sticky left-0 z-10 px-3 py-2 whitespace-nowrap shadow-[1px_0_0_0_rgba(200,168,78,0.08)]', rowBg)}>
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
              );
            })}
            {totals && (
              <tr className="border-t border-gold/20 bg-navyLight text-gold">
                <td className="sticky left-0 z-10 bg-navyLight px-3 py-2 shadow-[1px_0_0_0_rgba(200,168,78,0.15)]"></td>
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
