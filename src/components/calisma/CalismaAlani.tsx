'use client';

// Çalışma alanı ekranı. İmza docs/PLAN.md §6'daki sözleşmedir.
import React from 'react';
import Link from 'next/link';
import type { CalismaAlaniVerisi } from '@/types/database';
import type { IzleyiciBaglami } from '@/lib/yetki';
import { SayfaBasligi, buttonClass } from '@/components/ui';
import { KADRO_ETIKETI } from '@/lib/etiketler';
import { TezBilgisi } from './TezBilgisi';
import { PlanListesi } from './PlanListesi';
import { IlerlemeKutusu } from './IlerlemeKutusu';
import { Defter } from './Defter';
import { Dosyalar } from './Dosyalar';
import { IslemGecmisi } from './IslemGecmisi';

export interface CalismaAlaniProps {
  veri: CalismaAlaniVerisi;
  izleyici: IzleyiciBaglami;
  /** Danışman görünümünde plan bölümüne eklenen araçlar (ör. toplu ekleme). */
  planAraclari?: React.ReactNode;
}

export function CalismaAlani({ veri, izleyici, planAraclari }: CalismaAlaniProps) {
  const baslik = izleyici.isStudent ? 'Çalışma alanım' : veri.student.full_name;
  const aciklama = izleyici.isStudent
    ? 'Bu alanı yalnız siz ve danışmanınız görür.'
    : veri.student.kadro
      ? KADRO_ETIKETI[veri.student.kadro]
      : undefined;

  return (
    <div className="space-y-8">
      <SayfaBasligi
        baslik={baslik}
        aciklama={aciklama}
        eylemler={
          izleyici.isAdvisor ? (
            <Link href="/calisma-alani" className={buttonClass({ variant: 'ghost', size: 'sm' })}>
              Öğrencilerim
            </Link>
          ) : undefined
        }
      />

      <TezBilgisi
        workspace={veri.workspace}
        advisors={veri.advisors}
        izleyici={izleyici}
      />

      <div className="space-y-8 lg:grid lg:grid-cols-5 lg:gap-8 lg:space-y-0">
        <div className="lg:col-span-3">
          <PlanListesi
            veri={veri.planItems}
            workspaceId={veri.workspace.id}
            izleyici={izleyici}
            planAraclari={planAraclari}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <IlerlemeKutusu
            workspaceId={veri.workspace.id}
            planItems={veri.planItems}
            izleyici={izleyici}
          />

          <Defter updates={veri.updates} planItems={veri.planItems} izleyici={izleyici} />
        </div>
      </div>

      <Dosyalar
        workspaceId={veri.workspace.id}
        files={veri.files}
        planItems={veri.planItems}
        izleyici={izleyici}
      />

      <IslemGecmisi logs={veri.logs} />
    </div>
  );
}
