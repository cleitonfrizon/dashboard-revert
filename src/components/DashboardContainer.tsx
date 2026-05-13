import { useState } from 'react';
import { Header } from './shared/Header';
import { Footer } from './shared/Footer';
import { PeriodFilter } from './PeriodFilter';
import { BlocoA_Hero } from './BlocoA_Hero';
import { BlocoB_Funil } from './BlocoB_Funil';
import { BlocoC_Campanhas } from './BlocoC_Campanhas';
import { BlocoD_Velocidade } from './BlocoD_Velocidade';
import { BlocoE_Mix } from './BlocoE_Mix';
import { BlocoF_Saturacao } from './BlocoF_Saturacao';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { PeriodPreset } from '@/lib/types';

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  hoje: 'Hoje',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  mes_atual: 'Mês atual',
};

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
            <h1 className="font-display text-3xl md:text-4xl text-white mt-1">
              Dashboard Revert · {PERIOD_LABELS[period]}
            </h1>
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

        <div className="space-y-6">
          <div className="animate-fade-in-up">
            <BlocoA_Hero data={data?.hero ?? null} loading={loading} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in-up stagger-1">
            <BlocoB_Funil data={data?.funil ?? null} loading={loading} />
            <BlocoE_Mix data={data?.mix_produto ?? null} loading={loading} />
          </div>

          <div className="grid grid-cols-1 gap-5 animate-fade-in-up stagger-2">
            <BlocoC_Campanhas data={data?.campanhas ?? null} loading={loading} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in-up stagger-3">
            <BlocoD_Velocidade data={data?.velocidade ?? null} loading={loading} />
            <BlocoF_Saturacao data={data?.saturacao ?? null} loading={loading} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
