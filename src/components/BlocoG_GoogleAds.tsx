import type { GoogleAdsBlock } from '@/lib/types';
import { Card } from './shared/Card';
import { EmptyState } from './shared/EmptyState';
import { formatBRL, formatInt, formatPct } from '@/lib/formatters';
import { Search } from 'lucide-react';

interface Props {
  data: GoogleAdsBlock | null | undefined;
  loading: boolean;
  sourceStatus?: 'ok' | 'stale' | 'error' | 'not_configured';
}

export function BlocoG_GoogleAds({ data, loading, sourceStatus }: Props) {
  if (loading && !data) {
    return (
      <Card tag="Google Ads">
        <div className="h-40 w-full animate-pulse bg-navyLight/40 rounded" />
      </Card>
    );
  }

  if (sourceStatus === 'not_configured' || !data) {
    return (
      <Card tag="Google Ads">
        <EmptyState
          icon={<Search size={32} />}
          title="Aguardando configuração"
          description="Conta Google Ads ainda não conectada. Story 2.1 detalha o setup: developer token, OAuth do MCC e customer_id da Revert."
        />
      </Card>
    );
  }

  if (data.campanhas.length === 0) {
    return (
      <Card tag="Google Ads">
        <EmptyState
          icon={<Search size={32} />}
          title="Sem campanhas ativas"
          description={`Customer ${data.customer_id} conectado, mas nenhuma campanha retornou dados nos últimos 30 dias.`}
        />
      </Card>
    );
  }

  return (
    <Card tag="Google Ads">
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Verba 30d</div>
          <div className="font-display text-2xl text-gold">{formatBRL(data.totals.spend_30d)}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Conversões 30d</div>
          <div className="font-display text-2xl text-gold">{formatInt(data.totals.conversions_30d)}</div>
        </div>
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-500">
              <th className="text-left px-2 py-2">Campanha</th>
              <th className="text-right px-2 py-2">Spend</th>
              <th className="text-right px-2 py-2">CTR</th>
              <th className="text-right px-2 py-2">Conv.</th>
              <th className="text-right px-2 py-2">CPL real</th>
            </tr>
          </thead>
          <tbody>
            {data.campanhas.slice(0, 8).map((c) => (
              <tr key={c.id} className="border-t border-gold/10 hover:bg-gold/5">
                <td className="px-2 py-2 truncate max-w-[14rem]" title={c.name}>{c.name}</td>
                <td className="px-2 py-2 text-right">{formatBRL(c.spend)}</td>
                <td className="px-2 py-2 text-right">{formatPct(c.ctr * 100)}</td>
                <td className="px-2 py-2 text-right">{formatInt(c.conversions)}</td>
                <td className="px-2 py-2 text-right">{c.leads_reonic > 0 ? formatBRL(c.cpl_real) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
