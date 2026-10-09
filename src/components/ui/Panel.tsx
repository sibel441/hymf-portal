import React from 'react';
import { cn } from '@/lib/cn';

export function Panel({
  baslik,
  aciklama,
  eylemler,
  baslikSeviyesi = 'h2',
  className,
  govdeSinifi,
  id,
  children,
}: {
  baslik?: React.ReactNode;
  aciklama?: React.ReactNode;
  eylemler?: React.ReactNode;
  baslikSeviyesi?: 'h2' | 'h3';
  className?: string;
  /** Gövde dolgusunu değiştirmek için, ör. tablo için "p-0". */
  govdeSinifi?: string;
  id?: string;
  children: React.ReactNode;
}) {
  const Baslik = baslikSeviyesi;
  const baslikVar = baslik || eylemler;
  return (
    <section id={id} className={cn('rounded-lg border border-line bg-surface', className)}>
      {baslikVar && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            {baslik && <Baslik className="text-lg font-semibold text-ink">{baslik}</Baslik>}
            {aciklama && <p className="mt-1 text-sm text-ink-3">{aciklama}</p>}
          </div>
          {eylemler && <div className="flex flex-wrap items-center gap-2">{eylemler}</div>}
        </header>
      )}
      <div className={cn('p-5 sm:p-6', baslikVar && 'pt-4 sm:pt-4', govdeSinifi)}>{children}</div>
    </section>
  );
}
