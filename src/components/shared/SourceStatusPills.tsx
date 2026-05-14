import type { CacheMeta } from '@/lib/types';
import { formatRelativeTime } from '@/lib/formatters';
import { cn } from '@/lib/utils';

type AnyStatus = 'ok' | 'stale' | 'error' | 'not_configured';

const TONE: Record<AnyStatus, { dot: string; ring: string; label: string }> = {
  ok: { dot: 'bg-success', ring: 'ring-success/30', label: 'OK' },
  stale: { dot: 'bg-warning', ring: 'ring-warning/30', label: 'desatualizada' },
  error: { dot: 'bg-danger', ring: 'ring-danger/30', label: 'erro' },
  not_configured: { dot: 'bg-gray-500', ring: 'ring-gray-500/30', label: 'não conectada' },
};

interface SourceDef {
  key: 'meta_ads' | 'reonic' | 'google_ads';
  label: string;
  lastFetchKey: keyof CacheMeta['sources_status'];
}

const SOURCES: SourceDef[] = [
  { key: 'meta_ads', label: 'Meta', lastFetchKey: 'last_meta_fetch' },
  { key: 'reonic', label: 'Reonic', lastFetchKey: 'last_reonic_fetch' },
  { key: 'google_ads', label: 'Google', lastFetchKey: 'last_google_fetch' },
];

interface Props {
  sourcesStatus: CacheMeta['sources_status'] | null | undefined;
}

export function SourceStatusPills({ sourcesStatus }: Props) {
  if (!sourcesStatus) return null;

  return (
    <div
      role="group"
      aria-label="Saúde das fontes de dados"
      className="hidden lg:flex items-center gap-3 px-3 py-1.5 border border-gold/10 rounded-md bg-black/40"
    >
      {SOURCES.map((s) => {
        const raw = sourcesStatus[s.key];
        const status: AnyStatus = (raw && (['ok', 'stale', 'error', 'not_configured'] as AnyStatus[]).includes(raw as AnyStatus))
          ? (raw as AnyStatus)
          : 'not_configured';
        const tone = TONE[status];
        const lastFetch = sourcesStatus[s.lastFetchKey] as string | null | undefined;
        const relative = lastFetch ? formatRelativeTime(lastFetch) : null;
        const title =
          status === 'not_configured'
            ? `${s.label}: ${tone.label}`
            : relative
              ? `${s.label}: ${tone.label} · última coleta ${relative}`
              : `${s.label}: ${tone.label}`;
        return (
          <div
            key={s.key}
            title={title}
            aria-label={title}
            className="flex items-center gap-1.5"
          >
            <span
              className={cn('inline-block h-2 w-2 rounded-full ring-2', tone.dot, tone.ring)}
            />
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
