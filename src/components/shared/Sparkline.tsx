import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

export function Sparkline({ values, width = 88, height = 22, className, ariaLabel }: Props) {
  const { polyline, dot } = useMemo(() => {
    if (!values.length) return { polyline: '', dot: null as { x: number; y: number } | null };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const pad = 2;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const stepX = values.length > 1 ? w / (values.length - 1) : 0;
    const pts = values.map((v, i) => {
      const x = pad + i * stepX;
      const y = pad + h - ((v - min) / range) * h;
      return { x, y };
    });
    const last = pts[pts.length - 1];
    return {
      polyline: pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
      dot: last,
    };
  }, [values, width, height]);

  if (!values.length || values.every((v) => v === 0)) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
      className={cn('overflow-visible', className)}
    >
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.55}
      />
      {dot && (
        <circle
          cx={dot.x}
          cy={dot.y}
          r={1.8}
          fill="currentColor"
        />
      )}
    </svg>
  );
}
