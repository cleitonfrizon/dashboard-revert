import { useEffect, useState } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';
import { useAuth } from '@/hooks/useAuth';
import { SourceStatusPills } from './SourceStatusPills';
import type { CacheMeta } from '@/lib/types';

export interface HeaderProps {
  generatedAt: string | null | undefined;
  sourcesStatus?: CacheMeta['sources_status'] | null;
  onRefresh: () => void;
  loading?: boolean;
}

export function Header({ generatedAt, sourcesStatus, onRefresh, loading }: HeaderProps) {
  const { logout } = useAuth();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <header className="border-b border-gold/10 bg-black sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 lg:px-8 py-4">
        <div className="flex items-center gap-4 min-w-0">
          <img
            src="/escala-logo.png"
            alt="Escala"
            className="h-[56px] w-auto"
            style={{ filter: 'drop-shadow(0 0 40px rgba(200,168,78,0.2)) drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="hidden md:block min-w-0">
            <div className="section-tag">Revert Energia Solar</div>
            <div className="font-display text-lg text-white truncate">Dashboard de Performance</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SourceStatusPills sourcesStatus={sourcesStatus} />
          <div className="hidden md:flex flex-col items-end text-xs text-gray-500 leading-tight">
            <span className="uppercase tracking-wider">Atualizado</span>
            <span className="text-gold">{formatRelativeTime(generatedAt)}</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 border border-gold/30 rounded-md hover:bg-gold/10 disabled:opacity-50 transition"
            aria-label="Atualizar agora"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-gold' : 'text-gold'} />
          </button>
          <button
            type="button"
            onClick={logout}
            className="p-2 border border-gold/30 rounded-md hover:bg-gold/10 transition"
            aria-label="Sair"
          >
            <LogOut size={16} className="text-gold" />
          </button>
        </div>
      </div>
    </header>
  );
}
