import type { ReactNode } from 'react';

export type StatusBadgeVariant = 'success' | 'accent' | 'neutral' | 'destructive';

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  success: 'bg-emerald-500 text-white',
  accent: 'bg-accent text-accent-foreground',
  neutral: 'bg-zinc-900/80 text-white',
  destructive: 'bg-red-500 text-white',
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
