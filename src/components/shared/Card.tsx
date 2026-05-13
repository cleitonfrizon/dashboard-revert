import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: ReactNode;
  className?: string;
  tag?: string;
}

export function Card({ children, className, tag }: CardProps) {
  return (
    <section className={cn('card-escala', className)}>
      {tag && <div className="section-tag mb-3">{tag}</div>}
      {children}
    </section>
  );
}
