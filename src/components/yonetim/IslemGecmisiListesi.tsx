'use client';

import React from 'react';
import { Panel, BosDurum } from '@/components/ui';
import type { UyelikLog } from '@/types/database';
import { uyelikLogMetni } from '@/lib/etiketler';
import { goreliZaman, tarihSaat } from '@/lib/zaman';

interface IslemGecmisiListesiProps {
  logs: UyelikLog[];
}

export function IslemGecmisiListesi({ logs }: IslemGecmisiListesiProps) {
  if (logs.length === 0) {
    return (
      <BosDurum
        baslik="Henüz işlem yok"
        aciklama="Üyelik, yetki, kadro, danışman ve davet değişiklikleri burada görünür."
      />
    );
  }

  return (
    <Panel baslik="İşlem geçmişi">
      <ul className="divide-y divide-line">
        {logs.map((log) => (
          <li key={log.id} className="py-3 first:pt-0 last:pb-0 text-sm">
            <div className="text-ink">{uyelikLogMetni(log)}</div>
            <div className="text-ink-3 mt-1" title={tarihSaat(log.created_at)} suppressHydrationWarning>
              {log.details?.yapan_ad || 'Sistem'}, {goreliZaman(log.created_at)}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
