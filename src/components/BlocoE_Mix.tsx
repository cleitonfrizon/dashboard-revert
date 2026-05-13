import type { MixProdutoRow } from '@/lib/types';
import { Card } from './shared/Card';
import { EmptyState } from './shared/EmptyState';
import { Package } from 'lucide-react';

interface Props {
  data: MixProdutoRow[] | null;
  loading: boolean;
}

export function BlocoE_Mix({ data, loading }: Props) {
  // Story 1.8 — DONE-PARTIAL: a Reonic não expõe o campo `produto` no /contacts
  // nem nas /offers. Bloqueado até Robson alinhar Q-4 (ver data-schema.md).
  if (loading && !data) {
    return (
      <Card tag="Mix de Produto">
        <div className="h-32 w-full animate-pulse bg-navyLight/40 rounded" />
      </Card>
    );
  }
  return (
    <Card tag="Mix de Produto">
      <EmptyState
        icon={<Package size={32} />}
        title="Em validação com a Revert"
        description="A configuração de produto no Reonic ainda não está padronizada. Aguardando alinhamento do Robson sobre Q-4 (campo `produto`) antes de habilitar este bloco."
      />
    </Card>
  );
}
