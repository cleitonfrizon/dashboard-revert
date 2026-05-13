import { useState } from 'react';
import { Header } from './shared/Header';
import { Footer } from './shared/Footer';
import { Card } from './shared/Card';
import { PeriodFilter } from './PeriodFilter';
import { Skeleton } from './shared/Skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { PeriodPreset } from '@/lib/types';

const PLACEHOLDERS = [
  { tag: 'Hero do Dia', title: 'Bloco A' },
  { tag: 'Funil ao Vivo', title: 'Bloco B' },
  { tag: 'Performance por Campanha', title: 'Bloco C' },
  { tag: 'Velocidade Comercial', title: 'Bloco D' },
  { tag: 'Mix de Produto', title: 'Bloco E' },
  { tag: 'Saturação Criativa', title: 'Bloco F' },
];

export function DashboardContainer() {
  const { data, loading, error, refresh } = useDashboardData();
  const [period, setPeriod] = useState<PeriodPreset>('30d');

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header generatedAt={data?.meta.generated_at} onRefresh={refresh} loading={loading} />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="section-tag">Visão geral</span>
            <h1 className="font-display text-3xl md:text-4xl text-white mt-1">Dashboard Revert · {period === 'hoje' ? 'Hoje' : period === '7d' ? 'Últimos 7 dias' : period === '30d' ? 'Últimos 30 dias' : 'Mês atual'}</h1>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        {error && (
          <div className="card-escala border-danger/40 bg-danger/10 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="section-tag text-danger">Erro ao carregar</div>
                <p className="text-sm text-gray-200 mt-2">{error}</p>
              </div>
              <button
                onClick={refresh}
                className="px-3 py-1.5 text-xs uppercase tracking-wider border border-danger/40 text-danger rounded-md hover:bg-danger/10"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {PLACEHOLDERS.map((p) => (
            <Card key={p.tag} tag={p.tag}>
              {loading && !data ? (
                <>
                  <Skeleton className="h-10 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </>
              ) : (
                <>
                  <div className="font-display text-2xl text-gold mb-2">{p.title}</div>
                  <p className="text-sm text-gray-500">Em construção — próxima story.</p>
                </>
              )}
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
