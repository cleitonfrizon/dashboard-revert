import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-40 left-1/2 -translate-x-1/2 px-2.5 py-1.5 text-[11px] leading-tight font-normal normal-case tracking-normal text-gray-100 bg-surface-3 border border-gold/20 rounded shadow-lg pointer-events-none whitespace-nowrap',
            side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
