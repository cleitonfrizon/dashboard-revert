import { TrendingDown, TrendingUp, Zap, Users, Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import type { HeroBlock } from '@/lib/types';
import { formatBRL, formatDelta, formatDuration, formatInt } from '@/lib/formatters';
import { Skeleton } from './shared/Skeleton';
import { cn } from '@/lib/utils';

interface BlocoAProps {
  data: HeroBlock | null;
  loading: boolean;
  periodLabel?: string;
}

interface HeroCardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: 'good' | 'bad' | 'neutral';
  icon: ReactNode;
}

function HeroCard({ label, value, delta, deltaTone = 'neutral', icon }: HeroCardProps) {
  const deltaColor =
    deltaTone === 'good' ? 'text-success' : deltaTone === 'bad' ? 'text-danger' : 'text-gray-300';
  return (
    <div className="card-escala flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="section-tag">{label}</span>
        <span className="text-gold/60">{icon}</span>
      </div>
      <div className="stat-number text-4xl md:text-5xl leading-none mt-1">{value}</div>
      {delta && (
        <div className={cn('text-xs font-medium uppercase tracking-wider', deltaColor)}>{delta}</div>
      )}
    </div>
  );
}

export function BlocoA_Hero({ data, loading, periodLabel }: BlocoAProps) {
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

  return (
    <section>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="section-tag">Hero · {periodLabel ?? 'Hoje'}</span>
        <span className="text-xs text-gray-500">Snapshot operacional · São Paulo</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <HeroCard
          label="Verba"
          value={formatBRL(data.spend_today)}
          delta={`${formatDelta(spendDelta)} vs período anterior`}
          deltaTone={spendDelta < 0 ? 'good' : spendDelta > 20 ? 'bad' : 'neutral'}
          icon={<Zap size={18} />}
        />
        <HeroCard
          label="CPL"
          value={formatBRL(data.cpl_today)}
          delta={`Período anterior ${formatBRL(data.cpl_7d_avg)}`}
          deltaTone={cplStatusColor}
          icon={data.cpl_status === 'good' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
        />
        <HeroCard
          label="Leads"
          value={formatInt(data.leads_today)}
          delta={`Anterior ${formatInt(data.leads_yesterday)} · ${formatDelta(leadsDelta)}`}
          deltaTone={leadsDelta >= 0 ? 'good' : 'bad'}
          icon={<Users size={18} />}
        />
        <HeroCard
          label="Resposta média"
          value={formatDuration(data.avg_response_time_today_sec)}
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
        />
      </div>
    </section>
  );
}

