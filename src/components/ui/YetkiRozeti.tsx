import React from 'react';
import type { Yetki } from '@/types/database';
import { YETKI_ETIKETI } from '@/lib/etiketler';
import { Rozet } from './Rozet';

/** Yalnız yönetici yetkilerini gösterir; sıradan üye için hiçbir şey çizmez. */
export function YetkiRozeti({ yetki, className }: { yetki: Yetki | null | undefined; className?: string }) {
  if (yetki !== 'admin' && yetki !== 'superadmin') return null;
  return (
    <Rozet tone="notr" className={className}>
      {YETKI_ETIKETI[yetki]}
    </Rozet>
  );
}
