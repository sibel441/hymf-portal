import React from 'react';
import { cn } from '@/lib/cn';
import { basHarfler } from '@/lib/etiketler';

const boyutlar = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
};

export function BasHarfAvatar({
  ad,
  size = 'md',
  className,
}: {
  ad: string;
  size?: keyof typeof boyutlar;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-sunken font-medium text-ink-2',
        boyutlar[size],
        className
      )}
    >
      {basHarfler(ad)}
    </span>
  );
}
