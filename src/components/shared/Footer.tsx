import { company } from '@/theme';

export function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-navy mt-12">
      <div className="container mx-auto px-4 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <div className="text-gray-500">{company.domain}</div>
          <div className="font-display italic text-gold text-sm">{company.tagline}</div>
          <div className="text-gray-500 uppercase tracking-widest">{company.cities}</div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-3">
          {company.name} · CNPJ {company.cnpj}
        </div>
      </div>
    </footer>
  );
}
