import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: Array<{ keys: string[]; description: string }> = [
  { keys: ['R'], description: 'Atualizar dados agora' },
  { keys: ['1'], description: 'Período: Hoje' },
  { keys: ['2'], description: 'Período: Últimos 7 dias' },
  { keys: ['3'], description: 'Período: Últimos 30 dias' },
  { keys: ['4'], description: 'Período: Mês atual' },
  { keys: ['?'], description: 'Mostrar / ocultar esta ajuda' },
  { keys: ['Esc'], description: 'Fechar esta ajuda' },
];

export function ShortcutsOverlay({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Atalhos de teclado"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="card-escala max-w-md w-[92%] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 p-1 rounded text-gold/60 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <X size={18} />
        </button>
        <span className="section-tag">Atalhos de teclado</span>
        <h2 className="font-display text-2xl text-white mt-1 mb-5">
          Navegação rápida
        </h2>
        <dl className="space-y-2.5">
          {SHORTCUTS.map((s) => (
            <div key={s.keys.join('+')} className="flex items-center justify-between gap-4">
              <dt className="text-sm text-gray-300">{s.description}</dt>
              <dd className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-0.5 text-xs font-mono uppercase tracking-wider rounded border border-gold/30 bg-black/60 text-gold"
                  >
                    {k}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 pt-4 border-t border-gold/10 text-[10px] uppercase tracking-[0.2em] text-gold/40">
          Performance não é sorte. É método.
        </p>
      </div>
    </div>
  );
}
