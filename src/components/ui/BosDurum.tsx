import React from 'react';
import { cn } from '@/lib/cn';

export function BosDurum({
  baslik,
  aciklama,
  eylem,
  className,
}: {
  baslik: React.ReactNode;
  aciklama?: React.ReactNode;
  eylem?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-dashed border-line-strong px-5 py-8 sm:px-6', className)}>
      <p className="text-base font-medium text-ink">{baslik}</p>
      {aciklama && <p className="mt-1 max-w-prose text-sm text-ink-2">{aciklama}</p>}
      {eylem && <div className="mt-4">{eylem}</div>}
    </div>
  );
}
