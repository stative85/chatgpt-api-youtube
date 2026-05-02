import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
}

export const Button = ({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition',
        variant === 'outline'
          ? 'border border-slate-600 text-slate-100 hover:bg-slate-800'
          : 'bg-indigo-500 text-white hover:bg-indigo-400',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm',
        className
      )}
      {...props}
    />
  );
};
