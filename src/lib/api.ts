import type { DashboardCache, DashboardResponse } from './types';

const API_URL = import.meta.env.VITE_DASHBOARD_API_URL;
const API_TOKEN = import.meta.env.VITE_DASHBOARD_API_TOKEN;

export class DashboardApiError extends Error {
  constructor(public code: string, message: string, public retryAfterSec?: number) {
    super(message);
    this.name = 'DashboardApiError';
  }
}

async function fetchWithBackoff(url: string, init: RequestInit, tries = 3): Promise<Response> {
  const delays = [1000, 3000, 9000];
  let lastErr: unknown;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok || res.status === 401 || res.status === 503) return res;
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
      if (attempt < tries - 1) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Request failed');
}

export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardCache> {
  if (!API_URL || !API_TOKEN) {
    throw new DashboardApiError(
      'CONFIG_MISSING',
      'VITE_DASHBOARD_API_URL ou VITE_DASHBOARD_API_TOKEN não configurados.'
    );
  }
  const res = await fetchWithBackoff(API_URL, {
    method: 'GET',
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    signal,
  });
  const json = (await res.json()) as DashboardResponse;
  if (!json.ok) {
    throw new DashboardApiError(json.error ?? 'UNKNOWN', json.error ?? 'Erro desconhecido', json.retry_after_sec);
  }
  if (!json.data) {
    throw new DashboardApiError('EMPTY_PAYLOAD', 'Resposta sem dados.');
  }
  return json.data;
}
