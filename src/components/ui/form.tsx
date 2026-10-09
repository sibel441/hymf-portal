import React from 'react';
import { cn } from '@/lib/cn';

export const inputSinifi =
  'block w-full rounded-md border border-control bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus-visible:border-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link/30 disabled:bg-sunken disabled:text-ink-3';

export const textareaSinifi = cn(inputSinifi, 'min-h-24 leading-6');

export const selectSinifi = cn(inputSinifi, 'pr-8');

/** Etiket + alan + yardım/hata metni. `htmlFor`, içerideki alanın id'si olmalı. */
export function Alan({
  etiket,
  htmlFor,
  yardim,
  hata,
  className,
  children,
}: {
  etiket: React.ReactNode;
  htmlFor: string;
  yardim?: React.ReactNode;
  hata?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {etiket}
      </label>
      {children}
      {hata ? (
        <p className="text-sm text-danger" role="alert">
          {hata}
        </p>
      ) : (
        yardim && <p className="text-sm text-ink-3">{yardim}</p>
      )}
    </div>
  );
}
