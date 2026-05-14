import { company } from '@/theme';

interface FooterProps {
  onOpenShortcuts?: () => void;
}

export function Footer({ onOpenShortcuts }: FooterProps) {
  return (
    <footer className="border-t border-gold/10 bg-navy mt-12">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <div className="text-gray-500">{company.domain}</div>
          <div className="font-display italic text-gold text-sm">{company.tagline}</div>
          <div className="text-gray-500 uppercase tracking-widest">{company.cities}</div>
        </div>
        <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-500">
          <span>{company.name} · CNPJ {company.cnpj}</span>
          {onOpenShortcuts && (
            <>
              <span className="text-gold/20">·</span>
              <button
                type="button"
                onClick={onOpenShortcuts}
                aria-label="Mostrar atalhos de teclado"
                className="inline-flex items-center gap-1 text-gold/50 hover:text-gold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded px-1"
              >
                Atalhos
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-gold/30 text-gold">
                  ?
                </kbd>
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
