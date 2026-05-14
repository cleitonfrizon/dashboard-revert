import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  hint?: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, hint, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {icon && <div className="text-gold/60 mb-3">{icon}</div>}
      <h3 className="font-display text-lg text-gold">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>}
      {hint && (
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gold/40 max-w-sm">
          {hint}
        </p>
      )}
    </div>
  );
}
