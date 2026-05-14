import { AlertTriangle, Check } from 'lucide-react';
import type { VelocidadeBlock } from '@/lib/types';
import { formatDuration, formatInt } from '@/lib/formatters';
import { Card } from './shared/Card';
import { Skeleton } from './shared/Skeleton';
import { EmptyState } from './shared/EmptyState';
import { cn } from '@/lib/utils';

interface Props {
  data: VelocidadeBlock | null;
  loading: boolean;
}

const BUCKETS: Array<{ key: keyof VelocidadeBlock['distribuicao']; label: string; tone: 'good' | 'warning' | 'bad' }> = [
  { key: 'ate_1min', label: '≤ 1min', tone: 'good' },
  { key: 'um_a_dez_min', label: '1–10 min', tone: 'good' },
  { key: 'dez_a_sessenta_min', label: '10–60 min', tone: 'warning' },
  { key: 'uma_a_24h', label: '1–24 h', tone: 'warning' },
  { key: 'mais_de_24h', label: '> 24 h', tone: 'bad' },
];

const TONE_BG = {
  good: 'bg-success',
  warning: 'bg-warning',
  bad: 'bg-danger',
};

export function BlocoD_Velocidade({ data, loading }: Props) {
  if (loading && !data) {
    return (
      <Card tag="Velocidade Comercial" className="xl:col-span-2">
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }
  if (!data) return null;

  const total = BUCKETS.reduce((s, b) => s + data.distribuicao[b.key], 0);
  const hasData = total > 0;

  return (
    <Card tag="Velocidade Comercial" className="xl:col-span-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-display text-xl text-white mb-4">Distribuição do tempo de resposta</h2>
          {!hasData ? (
            <EmptyState
              title="Nenhum lead com tempo de resposta registrado"
              description="Aguardando contatos atendidos pela equipe comercial."
            />
          ) : (
            <div className="space-y-3">
              {BUCKETS.map((b) => {
                const count = data.distribuicao[b.key];
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={b.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{b.label}</span>
                      <span className="text-gold font-medium tabular-nums">
                        {formatInt(count)} <span className="text-gray-500">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-navyLight overflow-hidden">
                      <div className={cn('h-full rounded-full', TONE_BG[b.tone])} style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-gold/10">
            <div className="text-center">
              <span className="section-tag block">Hoje</span>
              <div className="font-display text-2xl text-gold mt-1">{formatDuration(data.avg_response_today_sec)}</div>
            </div>
            <div className="text-center">
              <span className="section-tag block">7d</span>
              <div className="font-display text-2xl text-gold mt-1">{formatDuration(data.avg_response_7d_sec)}</div>
            </div>
            <div className="text-center">
              <span className="section-tag block">30d</span>
              <div className="font-display text-2xl text-gold mt-1">{formatDuration(data.avg_response_30d_sec)}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            {data.hall_da_vergonha.length === 0 ? (
              <Check size={18} className="text-success" />
            ) : (
              <AlertTriangle size={18} className="text-danger" />
            )}
            <h2 className="font-display text-xl text-white">Hall da Vergonha</h2>
          </div>
          {data.hall_da_vergonha.length === 0 ? (
            <EmptyState
              icon={<Check size={32} className="text-success" />}
              title="Hall vazio · 100% atendidos"
              description="Toda a fila do período foi contatada em menos de 24h. Resposta dentro do padrão."
              hint="Mantenha. É o estado-alvo."
            />
          ) : (
            <ul className="divide-y divide-gold/10">
              {data.hall_da_vergonha.map((lead) => (
                <li key={lead.lead_id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-100 truncate">{lead.nome}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {lead.telefone_mascarado} · <span className="text-gold/80">{lead.origem}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-danger font-semibold tabular-nums">{lead.hours_waiting}h</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">aguardando</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
