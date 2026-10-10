'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import type { PlanDurum, PlanItem } from '@/types/database';
import { PLAN_DURUMLARI } from '@/types/database';
import type { IzleyiciBaglami } from '@/lib/yetki';
import { maddeEkleyebilir, planIzinleri, siralayabilir } from '@/lib/yetki';
import { DURUM_ETIKETI, kisaAd } from '@/lib/etiketler';
import { gecikmisMi, grupla } from '@/lib/calisma/hesap';
import { bugunISO, sonTarihMetni, tarih } from '@/lib/zaman';
import { deletePlanItem, reorderPlanItems, updatePlanStatus } from '@/lib/data/plan';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';
import { BosDurum, Button, DurumRozeti, Panel, Uyari } from '@/components/ui';
import { PlanMaddesiFormu } from './PlanMaddesiFormu';

// Durum seçici, rozetle aynı renkleri taşır; böylece okurken rozet, tıklayınca seçim kutusu.
const durumRengi: Record<PlanDurum, string> = {
  planlandi: 'bg-sunken text-ink-2',
  devam_ediyor: 'bg-info-soft text-info',
  takildi: 'bg-warn-soft text-warn',
  incelemede: 'bg-review-soft text-review',
  tamamlandi: 'bg-ok-soft text-ok',
  iptal: 'bg-transparent text-ink-3',
};

const TUM_IZINLER = { durumDegistir: true, trubaDuzenle: true, duzenle: true, sil: true };

export function PlanListesi({
  veri,
  workspaceId,
  izleyici,
  planAraclari,
}: {
  veri: PlanItem[];
  workspaceId: string;
  izleyici: IzleyiciBaglami;
  planAraclari?: React.ReactNode;
}) {
  const router = useRouter();
  const [ekleniyor, setEkleniyor] = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState<string | null>(null);
  const [mesgulId, setMesgulId] = useState<string | null>(null);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  const bugun = bugunISO();
  const gruplar = grupla(veri, bugun);
  const ekleyebilir = maddeEkleyebilir(izleyici);
  const siralanabilir = siralayabilir(izleyici);

  async function islem(id: string, is: () => Promise<{ error: string | null }>) {
    setHataMesaji(null);
    setMesgulId(id);
    const sonuc = await is();
    setMesgulId(null);
    if (sonuc.error) {
      setHataMesaji(sonuc.error);
      return;
    }
    router.refresh();
  }

  function durumDegistir(item: PlanItem, durum: PlanDurum) {
    void islem(item.id, () => updatePlanStatus(createClient(), item.id, durum));
  }

  function sil(item: PlanItem) {
    if (!window.confirm(`“${item.title}” maddesi silinsin mi?`)) return;
    void islem(item.id, () => deletePlanItem(createClient(), item.id));
  }

  // Sıra grubun içinde değişir; yeni sıra tüm planın sırası olarak kaydedilir.
  function tasi(grup: PlanItem[], index: number, yon: -1 | 1) {
    const hedef = index + yon;
    if (hedef < 0 || hedef >= grup.length) return;
    const yeniGrup = [...grup];
    [yeniGrup[index], yeniGrup[hedef]] = [yeniGrup[hedef], yeniGrup[index]];
    const yeniSira = [gruplar.gecikmis, gruplar.acik, gruplar.tamamlanan, gruplar.iptal]
      .map((g) => (g === grup ? yeniGrup : g))
      .flat()
      .map((m) => m.id);
    void islem(grup[index].id, () => reorderPlanItems(createClient(), yeniSira));
  }

  function satir(item: PlanItem, grup: PlanItem[], index: number, siraDegisebilir: boolean) {
    const izinler = planIzinleri(izleyici, item);

    if (duzenlenenId === item.id) {
      return (
        <li key={item.id} className="py-4">
          <PlanMaddesiFormu
            mod="duzenle"
            workspaceId={workspaceId}
            madde={item}
            izinler={izinler}
            onBitti={() => setDuzenlenenId(null)}
          />
        </li>
      );
    }

    const gecikti = gecikmisMi(item, bugun);
    const mesgul = mesgulId === item.id;
    const iptal = item.status === 'iptal';

    return (
      <li key={item.id} className={cn('flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-4', mesgul && 'opacity-60')}>
        <div className="shrink-0 sm:w-32">
          {izinler.durumDegistir ? (
            <select
              value={item.status}
              onChange={(e) => durumDegistir(item, e.target.value as PlanDurum)}
              disabled={mesgul}
              aria-label={`“${item.title}” durumu`}
              className={cn(
                'cursor-pointer rounded border-0 py-0.5 pl-1.5 pr-6 text-xs font-medium focus-visible:ring-2 focus-visible:ring-link',
                durumRengi[item.status]
              )}
            >
              {PLAN_DURUMLARI.map((d) => (
                <option key={d} value={d}>
                  {DURUM_ETIKETI[d]}
                </option>
              ))}
            </select>
          ) : (
            <DurumRozeti durum={item.status} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn('text-base font-medium', iptal ? 'text-ink-3 line-through' : 'text-ink')}>{item.title}</p>
          {item.description && (
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-ink-2">{item.description}</p>
          )}
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-3">
            {item.due_date && item.status !== 'tamamlandi' && !iptal && (
              <span className={cn(gecikti && 'font-medium text-warn')} title={tarih(item.due_date)}>
                {sonTarihMetni(item.due_date, bugun)}
              </span>
            )}
            {item.status === 'tamamlandi' && item.completed_at && (
              <span suppressHydrationWarning>{tarih(item.completed_at)} tamamlandı</span>
            )}
            {item.priority === 1 && <span className="text-ink-2">Öncelikli</span>}
            {item.creator && item.created_by !== izleyici.studentId && (
              <span>{kisaAd(item.creator.full_name)} ekledi</span>
            )}
            {item.truba_ref && <span className="break-all font-mono text-ink-2">{item.truba_ref}</span>}
          </p>
        </div>

        {(izinler.duzenle || izinler.trubaDuzenle || izinler.sil || siraDegisebilir) && (
          <div className="flex shrink-0 items-center gap-0.5 sm:-mr-2">
            {(izinler.duzenle || izinler.trubaDuzenle) && (
              <Button variant="ghost" size="sm" onClick={() => setDuzenlenenId(item.id)} aria-label={`“${item.title}” maddesini düzenle`}>
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
            )}
            {izinler.sil && (
              <Button variant="ghost" size="sm" onClick={() => sil(item)} disabled={mesgul} aria-label={`“${item.title}” maddesini sil`}>
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            )}
            {siraDegisebilir && (
              <>
                <Button variant="ghost" size="sm" onClick={() => tasi(grup, index, -1)} disabled={mesgul || index === 0} aria-label="Yukarı taşı">
                  <ChevronUp className="size-4" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => tasi(grup, index, 1)} disabled={mesgul || index === grup.length - 1} aria-label="Aşağı taşı">
                  <ChevronDown className="size-4" aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        )}
      </li>
    );
  }

  function liste(grup: PlanItem[], siraDegisebilir: boolean) {
    return <ul className="divide-y divide-line">{grup.map((item, i) => satir(item, grup, i, siraDegisebilir))}</ul>;
  }

  return (
    <Panel
      baslik="Plan"
      eylemler={
        ekleyebilir && !ekleniyor ? (
          <Button variant="primary" size="sm" onClick={() => setEkleniyor(true)}>
            Madde ekle
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {hataMesaji && <Uyari tone="tehlike">{hataMesaji}</Uyari>}

        {ekleniyor && (
          <PlanMaddesiFormu mod="ekle" workspaceId={workspaceId} izinler={TUM_IZINLER} onBitti={() => setEkleniyor(false)} />
        )}

        {veri.length === 0 && !ekleniyor && (
          <BosDurum
            baslik="Henüz plan maddesi yok"
            aciklama={
              izleyici.isStudent
                ? 'Danışmanınız madde ekleyince burada görünür. Kendi maddenizi de ekleyebilirsiniz.'
                : 'İlk maddeyi ekleyin ya da birkaç maddeyi toplu ekleyin.'
            }
          />
        )}

        {gruplar.gecikmis.length > 0 && (
          <section aria-labelledby="plan-gecikmis">
            <h3 id="plan-gecikmis" className="text-sm font-medium text-warn">
              Gecikmiş ({gruplar.gecikmis.length})
            </h3>
            {liste(gruplar.gecikmis, siralanabilir)}
          </section>
        )}

        {gruplar.acik.length > 0 && (
          <section aria-labelledby="plan-acik">
            <h3 id="plan-acik" className="text-sm font-medium text-ink-2">
              Açık ({gruplar.acik.length})
            </h3>
            {liste(gruplar.acik, siralanabilir)}
          </section>
        )}

        {gruplar.tamamlanan.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-ink">
              Tamamlanan ({gruplar.tamamlanan.length})
            </summary>
            {liste(gruplar.tamamlanan, false)}
          </details>
        )}

        {gruplar.iptal.length > 0 && (
          <details>
            <summary className="cursor-pointer text-sm font-medium text-ink-2 hover:text-ink">
              İptal edilen ({gruplar.iptal.length})
            </summary>
            {liste(gruplar.iptal, false)}
          </details>
        )}

        {planAraclari && <div className="border-t border-line pt-4">{planAraclari}</div>}
      </div>
    </Panel>
  );
}
