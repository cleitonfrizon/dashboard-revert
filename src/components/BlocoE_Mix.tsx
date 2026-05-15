import type { MixSolarBlock } from '@/lib/types';
import { formatInt } from '@/lib/formatters';
import { Card } from './shared/Card';
import { Skeleton } from './shared/Skeleton';
import { EmptyState } from './shared/EmptyState';
import { Tooltip } from './shared/Tooltip';
import { Sun, Battery, Flame, Plug } from 'lucide-react';

interface Props {
  data: MixSolarBlock | null | undefined;
  loading: boolean;
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  detail?: string;
  tooltip?: string;
}

function ProductRow({ icon, label, count, total, detail, tooltip }: RowProps) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="flex items-center gap-2 text-sm text-gray-200">
          <span className="text-gold/70">{icon}</span>
          {tooltip ? (
            <Tooltip content={tooltip} side="bottom">
              <span className="cursor-help underline decoration-dotted decoration-gold/30 underline-offset-2">{label}</span>
            </Tooltip>
          ) : (
            label
          )}
        </span>
        <span className="font-display text-xl text-gold tabular-nums">{formatInt(count)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-navyLight overflow-hidden mb-1">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold/40 via-gold to-goldLight transition-all duration-500"
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      {detail && <div className="text-[10px] text-gray-500">{detail}</div>}
    </div>
  );
}

export function BlocoE_Mix({ data, loading }: Props) {
  if (loading && !data) {
    return (
      <Card tag="Mix de Produto · 30d">
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }
  if (!data || data.total_won_30d === 0) {
    return (
      <Card tag="Mix de Produto · 30d">
        <EmptyState
          icon={<Sun size={32} />}
          title="Sem vendas nos últimos 30 dias"
          description="Quando offers fecharem (state=Won), o mix por produto (solar/armazenamento/bomba de calor/wallbox) aparece aqui automaticamente."
          hint="Source: solarPackage / sesPackage / heatpumpPackage / wallboxPackage do Reonic"
        />
      </Card>
    );
  }

  const totalProductsClassified = data.solar.count + data.armazenamento.count + data.bomba_calor.count + data.wallbox.count;
  if (data.total_won_30d > 0 && totalProductsClassified === 0) {
    return (
      <Card tag="Mix de Produto · 30d">
        <EmptyState
          icon={<Sun size={32} />}
          title={`${formatInt(data.total_won_30d)} ${data.total_won_30d === 1 ? 'venda fechada' : 'vendas fechadas'} sem classificação técnica`}
          description="As offers no Reonic não têm solarPackage / sesPackage / heatpumpPackage / wallboxPackage preenchidos. Se a equipe registrar esses campos no painel da Revert, o mix por produto aparece aqui automaticamente."
          hint="Q-pendente · padronizar preenchimento dos packages no Reonic"
        />
      </Card>
    );
  }

  return (
    <Card tag="Mix de Produto · 30d">
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-display text-2xl text-white tabular-nums">{formatInt(data.total_won_30d)}</span>
        <span className="text-xs text-gray-500">{data.total_won_30d === 1 ? 'venda fechada' : 'vendas fechadas'} no período</span>
      </div>
      <div className="space-y-3">
        <ProductRow
          icon={<Sun size={14} />}
          label="Energia solar"
          count={data.solar.count}
          total={data.total_won_30d}
          detail={
            data.solar.count > 0
              ? `${data.solar.avg_kwp.toFixed(2)} kWp médio · ${formatInt(data.solar.total_kwp * 1)} kWp total · ${formatInt(data.solar.total_modules)} módulos`
              : 'Sem solar fechado'
          }
          tooltip="Vendas com solarPackage.totalSizeWp > 0 ou módulos > 0"
        />
        <ProductRow
          icon={<Battery size={14} />}
          label="Armazenamento"
          count={data.armazenamento.count}
          total={data.total_won_30d}
          detail={data.armazenamento.count > 0 ? 'Sistemas com baterias / SES' : 'Sem storage fechado'}
          tooltip="Vendas com sesPackage.storageSize > 0 ou componentes preenchidos"
        />
        <ProductRow
          icon={<Flame size={14} />}
          label="Bomba de calor"
          count={data.bomba_calor.count}
          total={data.total_won_30d}
          detail={data.bomba_calor.count > 0 ? 'Heat pump (aquecimento)' : 'Sem bomba fechada'}
          tooltip="Vendas com heatpumpPackage.components preenchidos"
        />
        <ProductRow
          icon={<Plug size={14} />}
          label="Wallbox"
          count={data.wallbox.count}
          total={data.total_won_30d}
          detail={data.wallbox.count > 0 ? 'Carregadores EV' : 'Sem wallbox fechado'}
          tooltip="Vendas com wallboxPackage.components preenchidos"
        />
      </div>
      {data.solar.count > 0 && data.total_won_30d > 0 && (
        <div className="mt-4 pt-3 border-t border-gold/10 text-[10px] text-gold/60 uppercase tracking-[0.15em]">
          {((data.solar.count / data.total_won_30d) * 100).toFixed(0)}% das vendas incluem solar
        </div>
      )}
    </Card>
  );
}
