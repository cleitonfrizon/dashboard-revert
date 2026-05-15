import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from './shared/Header';
import { Footer } from './shared/Footer';
import { ShortcutsOverlay } from './shared/ShortcutsOverlay';
import { PeriodFilter } from './PeriodFilter';
import { BlocoA_Hero } from './BlocoA_Hero';
import { BlocoB_Funil } from './BlocoB_Funil';
import { BlocoC_Campanhas } from './BlocoC_Campanhas';
import { BlocoD_Velocidade } from './BlocoD_Velocidade';
import { BlocoE_Mix } from './BlocoE_Mix';
import { BlocoF_Saturacao } from './BlocoF_Saturacao';
import { BlocoG_GoogleAds } from './BlocoG_GoogleAds';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { googleAdsSampleFixture } from '@/lib/fixtures/googleAdsSample';
import { addBreadcrumb } from '@/lib/sentry';
import type { PeriodPreset } from '@/lib/types';

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  hoje: 'Hoje',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  mes_atual: 'Mês atual',
};

const PERIOD_STORAGE_KEY = 'dashboard:period';
const VALID_PERIODS: PeriodPreset[] = ['hoje', '7d', '30d', 'mes_atual'];

function readStoredPeriod(): PeriodPreset {
  try {
    const stored = window.localStorage.getItem(PERIOD_STORAGE_KEY);
    if (stored && (VALID_PERIODS as string[]).includes(stored)) {
      return stored as PeriodPreset;
    }
  } catch {
    // localStorage indisponível (modo privado, quota, etc.) — fallback silencioso
  }
  return '30d';
}

export function DashboardContainer() {
  const { data, loading, error, refresh } = useDashboardData();
  const [period, setPeriodRaw] = useState<PeriodPreset>(readStoredPeriod);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isChangingPeriod, setIsChangingPeriod] = useState(false);

  const setPeriod = useCallback((next: PeriodPreset | ((p: PeriodPreset) => PeriodPreset)) => {
    setPeriodRaw((current) => {
      const resolved = typeof next === 'function' ? next(current) : next;
      if (resolved !== current) {
        setIsChangingPeriod(true);
        window.setTimeout(() => setIsChangingPeriod(false), 280);
      }
      return resolved;
    });
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PERIOD_STORAGE_KEY, period);
    } catch {
      // ver readStoredPeriod
    }
    addBreadcrumb({ category: 'ui.period', message: 'period_changed', data: { period } });
  }, [period]);

  const handleRefresh = useCallback(
    (source: 'manual' | 'shortcut' | 'header' = 'manual') => {
      addBreadcrumb({ category: 'ui.action', message: 'refresh', data: { source } });
      refresh();
    },
    [refresh]
  );

  useKeyboardShortcuts({
    onRefresh: useCallback(() => handleRefresh('shortcut'), [handleRefresh]),
    onPeriodHoje: useCallback(() => setPeriod('hoje'), []),
    onPeriod7d: useCallback(() => setPeriod('7d'), []),
    onPeriod30d: useCallback(() => setPeriod('30d'), []),
    onPeriodMes: useCallback(() => setPeriod('mes_atual'), []),
    onToggleHelp: useCallback(() => {
      setHelpOpen((v) => {
        addBreadcrumb({ category: 'ui.shortcut', message: v ? 'help_closed' : 'help_opened' });
        return !v;
      });
    }, []),
    onCloseHelp: useCallback(() => setHelpOpen(false), []),
  });

  const isGooglePreview = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('preview') === 'google';
  }, []);

  const googleAdsBlock = isGooglePreview
    ? googleAdsSampleFixture
    : data?.google_ads ?? null;

  const googleAdsStatus = isGooglePreview
    ? 'ok'
    : data?.meta.sources_status.google_ads ?? 'not_configured';

  const slice = data?.by_period?.[period] ?? null;
  const heroData = slice?.hero ?? data?.hero ?? null;
  const funilData = slice?.funil ?? data?.funil ?? null;
  const campanhasData = slice?.campanhas ?? data?.campanhas ?? null;
  const velocidadeData = slice?.velocidade ?? data?.velocidade ?? null;
  const sparkline = slice?.sparkline_7d ?? null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header
        generatedAt={data?.meta.generated_at}
        sourcesStatus={data?.meta.sources_status ?? null}
        onRefresh={() => handleRefresh('header')}
        loading={loading}
      />
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
            <BlocoA_Hero data={isChangingPeriod ? null : heroData} loading={loading || isChangingPeriod} periodLabel={PERIOD_LABELS[period]} sparkline={isChangingPeriod ? null : sparkline} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in-up stagger-1">
            <BlocoB_Funil data={isChangingPeriod ? null : funilData} loading={loading || isChangingPeriod} periodLabel={PERIOD_LABELS[period]} />
            <BlocoE_Mix data={data?.mix_produto ?? null} loading={loading} />
          </div>

          <div className="grid grid-cols-1 gap-5 animate-fade-in-up stagger-2">
            <BlocoC_Campanhas data={isChangingPeriod ? null : campanhasData} loading={loading || isChangingPeriod} periodLabel={PERIOD_LABELS[period]} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-fade-in-up stagger-3">
            <BlocoD_Velocidade data={isChangingPeriod ? null : velocidadeData} loading={loading || isChangingPeriod} periodLabel={PERIOD_LABELS[period]} />
            <BlocoF_Saturacao data={data?.saturacao ?? null} loading={loading} />
          </div>

          <div className="grid grid-cols-1 gap-5 animate-fade-in-up stagger-4">
            {isGooglePreview && (
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold/60 border border-gold/20 bg-gold/5 px-3 py-1.5 rounded">
                Preview com dados sintéticos · remova ?preview=google da URL pra ver o estado real
              </div>
            )}
            <BlocoG_GoogleAds
              data={googleAdsBlock}
              loading={loading && !isGooglePreview}
              sourceStatus={googleAdsStatus}
            />
          </div>
        </div>
      </main>
      <Footer onOpenShortcuts={() => setHelpOpen(true)} />
      <ShortcutsOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
