'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

export function Sekmeler({ sekmeler }: { sekmeler: { href: string; etiket: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Bölümler" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-line">
        {sekmeler.map((s) => {
          const aktif = pathname === s.href;
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={aktif ? 'page' : undefined}
                className={cn(
                  '-mb-px block border-b-2 px-3 py-2.5 text-sm',
                  aktif ? 'border-ink font-medium text-ink' : 'border-transparent text-ink-2 hover:text-ink'
                )}
              >
                {s.etiket}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
