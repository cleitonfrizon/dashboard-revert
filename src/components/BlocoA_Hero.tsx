import { TrendingDown, TrendingUp, Zap, Users, Timer, Target, DollarSign, Award, Receipt } from 'lucide-react';
import type { ReactNode } from 'react';
import type { HeroBlock, SparklinePoint } from '@/lib/types';
import { formatBRL, formatDelta, formatDuration, formatInt } from '@/lib/formatters';
import { Skeleton } from './shared/Skeleton';
import { AnimatedNumber } from './shared/AnimatedNumber';
import { Tooltip } from './shared/Tooltip';
import { Sparkline } from './shared/Sparkline';
import { cn } from '@/lib/utils';

interface BlocoAProps {
  data: HeroBlock | null;
  loading: boolean;
  periodLabel?: string;
  sparkline?: SparklinePoint[] | null;
}

interface DetailItem {
  label: string;
  value: string;
}

interface HeroCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: 'good' | 'bad' | 'neutral';
  icon: ReactNode;
  tooltip?: string;
  sparkValues?: number[] | null;
  sparkAriaLabel?: string;
  alert?: 'danger' | 'warning' | null;
  details?: DetailItem[];
}

function HeroCard({ label, value, delta, deltaTone = 'neutral', icon, tooltip, sparkValues, sparkAriaLabel, alert, details }: HeroCardProps) {
  const deltaColor =
    deltaTone === 'good' ? 'text-success' : deltaTone === 'bad' ? 'text-danger' : 'text-gray-300';
  const alertClass = alert === 'danger' ? 'alert-danger' : alert === 'warning' ? 'alert-warning' : '';
  const hasDetails = details && details.length > 0;
  return (
    <div
      className={cn(
        'card-escala flex flex-col gap-3 transition-transform hover:-translate-y-0.5 group',
        alertClass
      )}
      tabIndex={hasDetails ? 0 : undefined}
      aria-label={hasDetails ? `${label}. Foque para detalhes.` : undefined}
    >
      <div className="flex items-center justify-between">
        {tooltip ? (
          <Tooltip content={tooltip} side="bottom">
            <span className="section-tag cursor-help underline decoration-dotted decoration-gold/30 underline-offset-2">{label}</span>
          </Tooltip>
        ) : (
          <span className="section-tag">{label}</span>
        )}
        <span className="text-gold/60">{icon}</span>
      </div>
      <div className="stat-number text-4xl md:text-5xl leading-none mt-1">{value}</div>
      <div className="flex items-end justify-between gap-2">
        {delta ? (
          <div className={cn('text-xs font-medium uppercase tracking-wider', deltaColor)}>{delta}</div>
        ) : (
          <span />
        )}
        {sparkValues && sparkValues.length > 1 && (
          <div className="text-gold ml-auto" aria-hidden={sparkAriaLabel ? undefined : true}>
            <Sparkline values={sparkValues} ariaLabel={sparkAriaLabel} />
          </div>
        )}
      </div>
      {hasDetails && (
        <dl
          className="border-t border-gold/10 pt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-400 max-h-0 opacity-0 overflow-hidden transition-[max-height,opacity,padding] duration-200 ease-out group-hover:max-h-40 group-hover:opacity-100 group-hover:pt-2 group-focus-within:max-h-40 group-focus-within:opacity-100 group-focus-within:pt-2 motion-reduce:transition-none motion-reduce:duration-0"
          aria-label={`Detalhes adicionais de ${label}`}
        >
          {details.map((d) => (
            <div key={d.label} className="flex justify-between gap-2 leading-tight">
              <dt className="text-gray-500 uppercase tracking-wider text-[10px]">{d.label}</dt>
              <dd className="text-gray-200 tabular-nums">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function summarizeSpark(values: number[] | null | undefined, formatter: (n: number) => string): DetailItem[] {
  if (!values || values.length < 2) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return [
    { label: 'Mín. 7d', value: formatter(min) },
    { label: 'Máx. 7d', value: formatter(max) },
    { label: 'Média 7d', value: formatter(avg) },
  ];
}

export function BlocoA_Hero({ data, loading, periodLabel, sparkline }: BlocoAProps) {
  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card-escala">
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-10 w-32 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }
  if (!data) return null;

  const spendDelta = data.spend_today_delta_pct;
  const leadsDelta = data.leads_yesterday > 0
    ? ((data.leads_today - data.leads_yesterday) / data.leads_yesterday) * 100
    : 0;

  const cplStatusColor =
    data.cpl_status === 'bad' ? 'bad' : data.cpl_status === 'warning' ? 'bad' : 'good';

  const spendValues = sparkline?.map((p) => p.spend) ?? null;
  const cplValues = sparkline?.map((p) => p.cpl) ?? null;
  const leadsValues = sparkline?.map((p) => p.leads) ?? null;

  const spendDetails = summarizeSpark(spendValues, formatBRL);
  const cplDetails = summarizeSpark(cplValues, formatBRL);
  const leadsDetails = summarizeSpark(leadsValues, (n) => formatInt(Math.round(n)));

  const cacDetails: { label: string; value: string }[] = [];
  if ((data.cac ?? 0) > 0 && data.vendas_count) {
    cacDetails.push({ label: 'Vendas', value: formatInt(data.vendas_count) });
    cacDetails.push({ label: 'Verba', value: formatBRL(data.spend_today) });
  }

  const roasDetails: { label: string; value: string }[] = [];
  if (data.vendas_revenue) {
    roasDetails.push({ label: 'Receita', value: formatBRL(data.vendas_revenue) });
    roasDetails.push({ label: 'Verba', value: formatBRL(data.spend_today) });
  }

  const vendasDetails: { label: string; value: string }[] = [];
  if ((data.vendas_count ?? 0) > 0) {
    vendasDetails.push({ label: 'Receita', value: formatBRL(data.vendas_revenue ?? 0) });
    if (data.ticket_medio_realizado) {
      vendasDetails.push({ label: 'Ticket', value: formatBRL(data.ticket_medio_realizado) });
    }
  }

  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="section-tag">Hero · {periodLabel ?? 'Hoje'}</span>
        <span className="text-xs text-gray-500">Snapshot operacional · São Paulo</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        <HeroCard
          label="Verba"
          value={<AnimatedNumber value={data.spend_today} format={formatBRL} />}
          delta={`${formatDelta(spendDelta)} vs anterior`}
          deltaTone={spendDelta < 0 ? 'good' : spendDelta > 20 ? 'bad' : 'neutral'}
          icon={<Zap size={18} />}
          tooltip="Soma de spend Meta no período. Hoje vem de date_preset=today; histórico de daily breakdown."
          sparkValues={spendValues}
          sparkAriaLabel="Tendência de verba 7 dias"
          details={spendDetails}
        />
        <HeroCard
          label="CPL"
          value={<AnimatedNumber value={data.cpl_today} format={formatBRL} />}
          delta={`Anterior ${formatBRL(data.cpl_7d_avg)}`}
          deltaTone={cplStatusColor}
          icon={data.cpl_status === 'good' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
          tooltip="Custo por lead = Verba ÷ Leads Reonic"
          sparkValues={cplValues}
          sparkAriaLabel="Tendência CPL 7 dias"
          alert={data.cpl_status === 'bad' ? 'danger' : data.cpl_status === 'warning' ? 'warning' : null}
          details={cplDetails}
        />
        <HeroCard
          label="CAC"
          value={<AnimatedNumber value={data.cac ?? 0} format={formatBRL} />}
          delta={data.vendas_count ? `${formatInt(data.vendas_count)} venda${data.vendas_count === 1 ? '' : 's'}` : 'Sem venda no período'}
          deltaTone={(data.cac ?? 0) === 0 ? 'neutral' : (data.cac ?? 0) > 1000 ? 'bad' : 'good'}
          icon={<Target size={18} />}
          tooltip="Custo de aquisição = Verba ÷ vendas fechadas (state=Won)"
          details={cacDetails}
        />
        <HeroCard
          label="ROAS"
          value={<AnimatedNumber value={data.roas ?? 0} format={(n) => `${n.toFixed(2).replace('.', ',')}x`} />}
          delta={data.vendas_revenue ? `${formatBRL(data.vendas_revenue)} receita` : 'Sem receita'}
          deltaTone={(data.roas ?? 0) === 0 ? 'neutral' : (data.roas ?? 0) >= 3 ? 'good' : (data.roas ?? 0) >= 1 ? 'neutral' : 'bad'}
          icon={<DollarSign size={18} />}
          tooltip="Return on Ad Spend = Receita das vendas ÷ Verba. Saudável: ≥ 3×"
          alert={(data.roas ?? 0) > 0 && (data.roas ?? 0) < 1 ? 'danger' : null}
          details={roasDetails}
        />
        <HeroCard
          label="Leads"
          value={<AnimatedNumber value={data.leads_today} format={formatInt} />}
          delta={`Anterior ${formatInt(data.leads_yesterday)} · ${formatDelta(leadsDelta)}`}
          deltaTone={leadsDelta >= 0 ? 'good' : 'bad'}
          icon={<Users size={18} />}
          tooltip="Contacts criados no Reonic no período"
          sparkValues={leadsValues}
          sparkAriaLabel="Tendência leads 7 dias"
          details={leadsDetails}
        />
        <HeroCard
          label="Vendas"
          value={<AnimatedNumber value={data.vendas_count ?? 0} format={formatInt} />}
          delta={data.vendas_revenue ? formatBRL(data.vendas_revenue) : '—'}
          deltaTone={(data.vendas_count ?? 0) > 0 ? 'good' : 'neutral'}
          icon={<Award size={18} />}
          tooltip="Offers com state=Won no período (data wonAt). Receita = soma totalPlannedPrice."
          details={vendasDetails}
        />
        <HeroCard
          label="Ticket médio"
          value={<AnimatedNumber value={data.ticket_medio_realizado ?? 0} format={formatBRL} />}
          delta={(data.ticket_medio_realizado ?? 0) > 0 ? 'por venda fechada' : 'Sem venda'}
          deltaTone="neutral"
          icon={<Receipt size={18} />}
          tooltip="Receita das vendas ÷ número de vendas no período"
        />
        <HeroCard
          label="Resposta média"
          value={<AnimatedNumber value={data.avg_response_time_today_sec} format={formatDuration} />}
          delta={data.avg_response_time_today_sec > 0 ? 'Lead → 1º contato' : 'Sem lead no período'}
          deltaTone={
            data.avg_response_time_today_sec === 0
              ? 'neutral'
              : data.avg_response_time_today_sec <= 60
                ? 'good'
                : data.avg_response_time_today_sec <= 300
                  ? 'neutral'
                  : 'bad'
          }
          icon={<Timer size={18} />}
          tooltip="Tempo entre criação do contact e primeira nota humana (ou proposta)"
        />
      </div>
    </section>
  );
}

