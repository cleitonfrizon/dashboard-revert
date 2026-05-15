import { TrendingUp, Clock, CheckCircle, Sparkles } from 'lucide-react';
import type { PipelineBlock } from '@/lib/types';
import { formatBRL, formatInt } from '@/lib/formatters';
import { Card } from './shared/Card';
import { Skeleton } from './shared/Skeleton';
import { Tooltip } from './shared/Tooltip';
import { AnimatedNumber } from './shared/AnimatedNumber';
import { cn } from '@/lib/utils';

interface Props {
  data: PipelineBlock | null | undefined;
  loading: boolean;
  periodLabel?: string;
}

interface StatProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon: React.ReactNode;
  tooltip?: string;
  tone?: 'good' | 'neutral' | 'bad';
}

function Stat({ label, value, sub, icon, tooltip, tone = 'neutral' }: StatProps) {
  const toneClass = tone === 'good' ? 'text-success' : tone === 'bad' ? 'text-danger' : 'text-gold';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-gold/60">{icon}</span>
        {tooltip ? (
          <Tooltip content={tooltip} side="bottom">
            <span className="text-[11px] uppercase tracking-wider text-gray-500 cursor-help underline decoration-dotted decoration-gold/30 underline-offset-2">{label}</span>
          </Tooltip>
        ) : (
          <span className="text-[11px] uppercase tracking-wider text-gray-500">{label}</span>
        )}
      </div>
      <div className={cn('font-display text-2xl md:text-3xl leading-none tabular-nums', toneClass)}>{value}</div>
      {sub && <div className="text-[11px] text-gray-500">{sub}</div>}
    </div>
  );
}

export function BlocoH_Pipeline({ data, loading, periodLabel }: Props) {
  if (loading && !data) {
    return (
      <Card tag={`Pipeline & Forecast · ${periodLabel ?? ''}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </Card>
    );
  }
  if (!data) return null;

  return (
    <Card tag={`Pipeline & Forecast · ${periodLabel ?? ''}`}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Pipeline aberto"
          value={<AnimatedNumber value={data.open_revenue} format={formatBRL} />}
          sub={`${formatInt(data.open_count)} ${data.open_count === 1 ? 'oferta' : 'ofertas'} state=Open`}
          icon={<TrendingUp size={14} />}
          tooltip="Soma de totalPlannedPrice das offers Open criadas no período"
        />
        <Stat
          label="Forecast"
          value={<AnimatedNumber value={data.forecast_revenue} format={formatBRL} />}
          sub={`${formatInt(data.forecast_count)} em "Forecast" ou "Aguardando PA"`}
          icon={<Sparkles size={14} />}
          tooltip="Receita esperada — offers Open com status Forecast Semanal ou Aguardando PA"
          tone={data.forecast_revenue > 0 ? 'good' : 'neutral'}
        />
        <Stat
          label="Win rate"
          value={<AnimatedNumber value={data.win_rate * 100} format={(n) => `${n.toFixed(0)}%`} />}
          sub={`${formatInt(data.won_count)} won · ${formatInt(data.lost_count)} lost`}
          icon={<CheckCircle size={14} />}
          tooltip="Wins ÷ (Wins + Lost) no período. Saudável solar B2C: ≥ 25%"
          tone={data.win_rate >= 0.25 ? 'good' : data.win_rate >= 0.1 ? 'neutral' : 'bad'}
        />
        <Stat
          label="Ciclo médio"
          value={data.avg_cycle_days > 0 ? (
            <AnimatedNumber value={data.avg_cycle_days} format={(n) => `${n.toFixed(1)} d`} />
          ) : '—'}
          sub={data.won_count > 0 ? `lead → won (${formatInt(data.won_count)} ${data.won_count === 1 ? 'venda' : 'vendas'})` : 'Sem vendas pra calcular'}
          icon={<Clock size={14} />}
          tooltip="Dias médios entre criação do lead e wonAt das vendas fechadas no período"
        />
      </div>
      {data.win_rate > 0 && data.win_rate < 0.1 && (
        <div className="mt-4 pt-3 border-t border-danger/20 text-[11px] text-danger flex items-start gap-2">
          <span>⚠</span>
          <span>Win rate abaixo de 10% sinaliza atrito sério: revisar qualificação ou processo de proposta.</span>
        </div>
      )}
      {data.forecast_revenue > data.open_revenue && data.forecast_revenue > 0 && (
        <div className="mt-4 pt-3 border-t border-gold/10 text-[11px] text-gray-500 flex items-start gap-2">
          <Sparkles size={11} className="text-gold mt-0.5" />
          <span>Forecast maior que pipeline aberto — concentre energia em fechar os que estão em "Aguardando PA".</span>
        </div>
      )}
    </Card>
  );
}
