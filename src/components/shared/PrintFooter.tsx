interface Props {
  periodLabel: string;
  generatedAt: string | null | undefined;
}

export function PrintFooter({ periodLabel, generatedAt }: Props) {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const cacheFmt = generatedAt ? fmt(new Date(generatedAt)) : '—';
  return (
    <div className="hidden print:block mt-8 pt-6 border-t border-gray-300 text-xs text-gray-700">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="uppercase tracking-wider text-[10px] text-gray-500 mb-0.5">Cliente</div>
          <div>Revert Energia Solar Toledo</div>
        </div>
        <div>
          <div className="uppercase tracking-wider text-[10px] text-gray-500 mb-0.5">Período</div>
          <div>{periodLabel}</div>
        </div>
        <div className="text-right">
          <div className="uppercase tracking-wider text-[10px] text-gray-500 mb-0.5">Gerado em / Dados de</div>
          <div>{fmt(now)}</div>
          <div className="text-gray-500">Cache: {cacheFmt}</div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-500 italic">
        Escala Negócios Digitais · CNPJ 48.215.104/0001-40 · escalanegociosdigitais.com.br · Performance não é sorte. É método.
      </div>
    </div>
  );
}
