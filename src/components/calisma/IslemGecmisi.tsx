'use client';

import React from 'react';
import type { WorkspaceLog } from '@/types/database';
import { workspaceLogMetni, kisaAd } from '@/lib/etiketler';
import { goreliZaman, tarihSaat } from '@/lib/zaman';

export function IslemGecmisi({ logs }: { logs: WorkspaceLog[] }) {
  if (logs.length === 0) {
    return (
      <details className="rounded-lg border border-line bg-surface">
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-ink-2">
          İşlem geçmişi
        </summary>
        <div className="border-t border-line px-5 py-3 text-sm text-ink-3">
          Henüz işlem yok.
        </div>
      </details>
    );
  }

  return (
    <details className="rounded-lg border border-line bg-surface">
      <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-ink-2">
        İşlem geçmişi
      </summary>
      <ul className="divide-y divide-line px-5">
        {logs.map((log) => (
          <li key={log.id} className="flex items-start justify-between gap-4 py-2 text-sm">
            <div className="flex-1 min-w-0">
              <span className="text-ink">
                {log.actor ? kisaAd(log.actor.full_name) : 'Silinmiş üye'}
              </span>{' '}
              <span className="text-ink-2">{workspaceLogMetni(log)}</span>
            </div>
            <span
              className="flex-shrink-0 text-ink-3"
              title={tarihSaat(log.created_at)}
              suppressHydrationWarning
            >
              {goreliZaman(log.created_at)}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
