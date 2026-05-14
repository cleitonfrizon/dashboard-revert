import type { MixProdutoRow } from '@/lib/types';
import { Card } from './shared/Card';
import { Skeleton } from './shared/Skeleton';
import { EmptyState } from './shared/EmptyState';
import { Package } from 'lucide-react';

interface Props {
  data: MixProdutoRow[] | null;
  loading: boolean;
}

export function BlocoE_Mix({ data, loading }: Props) {
  if (loading && !data) {
    return (
      <Card tag="Mix de Produto">
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }
  return (
    <Card tag="Mix de Produto">
      <EmptyState
        icon={<Package size={32} />}
        title="Em validação com a Revert"
        description="A Reonic ainda não expõe o campo `produto` em /contacts nem em /offers. Bloqueado até Robson padronizar o cadastro."
        hint="Desbloqueia com Q-4 · ver data-schema.md"
      />
    </Card>
  );
}
