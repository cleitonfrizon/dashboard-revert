import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDashboard, DashboardApiError } from '@/lib/api';
import { addBreadcrumb, captureException } from '@/lib/sentry';
import type { DashboardCache } from '@/lib/types';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export interface DashboardState {
  data: DashboardCache | null;
  loading: boolean;
  error: string | null;
  fetchedAt: Date | null;
  refresh: () => void;
}

export function useDashboardData(): DashboardState {
  const [data, setData] = useState<DashboardCache | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    const startedAt = performance.now();
    try {
      const cache = await fetchDashboard(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setData(cache);
      setFetchedAt(new Date());
      addBreadcrumb({
        category: 'data.fetch',
        message: 'dashboard_fetch_ok',
        data: {
          duration_ms: Math.round(performance.now() - startedAt),
          generated_at: cache.meta?.generated_at,
          sources: cache.meta?.sources_status,
        },
      });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      const isExpectedApiError =
        err instanceof DashboardApiError && (err.code === 'CACHE_REFRESHING' || err.code === 'INVALID_TOKEN');
      const code = err instanceof DashboardApiError ? err.code : 'unknown';
      addBreadcrumb({
        category: 'data.fetch',
        message: 'dashboard_fetch_error',
        level: isExpectedApiError ? 'warning' : 'error',
        data: { code, duration_ms: Math.round(performance.now() - startedAt) },
      });
      if (!isExpectedApiError) {
        captureException(err, { hook: 'useDashboardData' });
      }
      if (err instanceof DashboardApiError) {
        setError(`${err.code}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro desconhecido');
      }
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      window.clearInterval(id);
      abortRef.current?.abort();
    };
  }, [load]);

  return { data, loading, error, fetchedAt, refresh: load };
}
