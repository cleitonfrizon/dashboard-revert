import type { GoogleAdsBlock } from '@/lib/types';
import { Card } from './shared/Card';
import { EmptyState } from './shared/EmptyState';
import { TableSkeleton } from './shared/TableSkeleton';
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
        <TableSkeleton rows={5} columns={5} />
      </Card>
    );
  }

  if (sourceStatus === 'not_configured' || !data) {
    return (
      <Card tag="Google Ads">
        <EmptyState
          icon={<Search size={32} />}
          title="Aguardando configuração"
          description="Conta Google Ads ainda não conectada. Quando ligar, este bloco mostra spend 30d, conversões 30d e top 8 campanhas com CPL real (match Reonic via UTM)."
          hint="Setup em ~5min · docs/guides/google-ads-oauth-setup.md"
        />
      </Card>
    );
  }

  if (sourceStatus === 'error') {
    return (
      <Card tag="Google Ads">
        <EmptyState
          icon={<Search size={32} />}
          title="Falha ao consultar a API"
          description="O n8n não conseguiu autenticar na Google Ads na última execução. Próximo cron (30min) tenta de novo. Se persistir, refazer OAuth flow."
          hint={`customer ${data?.customer_id || '—'}`}
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
          hint="Verificar status ENABLED/PAUSED na conta"
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
      <div className="overflow-auto -mx-2 max-h-[400px] relative">
        <table className="w-full text-sm" aria-label="Top campanhas Google Ads">
          <thead className="sticky top-0 z-20 bg-bgCard">
            <tr className="text-xs uppercase tracking-wider text-gray-500">
              <th scope="col" className="bg-bgCard text-left px-2 py-2">Campanha</th>
              <th scope="col" className="bg-bgCard text-right px-2 py-2">Spend</th>
              <th scope="col" className="bg-bgCard text-right px-2 py-2">CTR</th>
              <th scope="col" className="bg-bgCard text-right px-2 py-2">Conv.</th>
              <th scope="col" className="bg-bgCard text-right px-2 py-2">CPL real</th>
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
