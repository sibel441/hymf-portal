import React from 'react';
import type { PlanDurum } from '@/types/database';
import { DURUM_ETIKETI } from '@/lib/etiketler';
import { Rozet, type RozetTonu } from './Rozet';

const ton: Record<Exclude<PlanDurum, 'iptal'>, RozetTonu> = {
  planlandi: 'notr',
  devam_ediyor: 'bilgi',
  takildi: 'uyari',
  incelemede: 'inceleme',
  tamamlandi: 'basari',
};

export function DurumRozeti({ durum, className }: { durum: PlanDurum; className?: string }) {
  if (durum === 'iptal') {
    return <span className={`text-xs font-medium text-ink-3 line-through ${className ?? ''}`}>{DURUM_ETIKETI.iptal}</span>;
  }
  return (
    <Rozet tone={ton[durum]} className={className}>
      {DURUM_ETIKETI[durum]}
    </Rozet>
  );
}
