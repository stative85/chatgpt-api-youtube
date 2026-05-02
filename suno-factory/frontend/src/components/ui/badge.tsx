import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Badge = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-200',
      className
    )}
    {...props}
  />
);
