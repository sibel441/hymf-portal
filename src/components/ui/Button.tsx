import React from 'react';
import { cn } from '@/lib/cn';

type Varyant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Boyut = 'sm' | 'md';

const temel =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';

const varyantlar: Record<Varyant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary/90',
  secondary: 'border border-line-strong bg-surface text-ink hover:bg-sunken',
  ghost: 'text-ink-2 hover:bg-sunken hover:text-ink',
  danger: 'bg-danger text-on-primary hover:bg-danger/90',
};

const boyutlar: Record<Boyut, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
};

export interface ButtonStili {
  variant?: Varyant;
  size?: Boyut;
  className?: string;
}

/** Buton görünümlü bağlantılar için sınıf. */
export function buttonClass({ variant = 'secondary', size = 'md', className }: ButtonStili = {}) {
  return cn(temel, varyantlar[variant], boyutlar[size], className);
}

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonStili;

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, className })} {...props} />;
}
