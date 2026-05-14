import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;
const env = import.meta.env.MODE;

export function initSentry() {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: env,
    release: import.meta.env.VITE_RELEASE || '1.0.0-mvp',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: env === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) delete event.request.headers['Authorization'];
      return event;
    },
  });
}

export const captureException = (err: unknown, context?: Record<string, unknown>) => {
  if (!dsn) {
    console.error('[capture]', err, context);
    return;
  }
  Sentry.captureException(err, context ? { extra: context } : undefined);
};

export type BreadcrumbCategory =
  | 'ui.action'
  | 'ui.period'
  | 'ui.filter'
  | 'ui.shortcut'
  | 'data.fetch'
  | 'auth';

export interface BreadcrumbOptions {
  category: BreadcrumbCategory;
  message: string;
  data?: Record<string, unknown>;
  level?: 'info' | 'warning' | 'error';
}

export function addBreadcrumb({ category, message, data, level = 'info' }: BreadcrumbOptions) {
  if (!dsn) return; // no-op silencioso — não polui console
  Sentry.addBreadcrumb({ category, message, data, level });
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
