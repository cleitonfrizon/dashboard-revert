import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initSentry, SentryErrorBoundary } from './lib/sentry';
import './index.css';

initSentry();

function FallbackUI({ error, resetError }: { error: unknown; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-md text-center">
        <div className="font-display text-2xl text-gold mb-3">Algo quebrou.</div>
        <p className="text-sm text-white/70 mb-6">
          {(error instanceof Error ? error.message : 'Erro inesperado')}
        </p>
        <button
          onClick={resetError}
          className="px-5 py-2 rounded border border-gold/40 text-gold hover:bg-gold/10 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryErrorBoundary fallback={FallbackUI as never}>
      <App />
    </SentryErrorBoundary>
  </StrictMode>
);
