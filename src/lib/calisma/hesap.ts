// Saf plan hesapları ve yardımcı fonksiyonlar.

import type { PlanItem, PanoSatiri } from '@/types/database';
import { bugunISO } from '@/lib/zaman';

/** Madde açık mı: planlandi, devam_ediyor, takildi, incelemede */
export function acikMi(item: Pick<PlanItem, 'status'>): boolean {
  return ['planlandi', 'devam_ediyor', 'takildi', 'incelemede'].includes(item.status);
}

/** Madde gecikmişse: açık VE due_date dolu VE due_date < bugün */
export function gecikmisMi(item: Pick<PlanItem, 'status' | 'due_date'>, bugun = bugunISO()): boolean {
  if (!acikMi(item)) return false;
  if (!item.due_date) return false;
  return item.due_date < bugun;
}

/** Maddeleri grupla: gecikmişler (açık olup due_date geçen), açıklar (diğer açıklar),
 * tamamlananlar, iptal edilenler. Her grup giriş sırasını korur.
 */
export function grupla(
  items: PlanItem[],
  bugun = bugunISO(),
): {
  gecikmis: PlanItem[];
  acik: PlanItem[];
  tamamlanan: PlanItem[];
  iptal: PlanItem[];
} {
  const gecikmis: PlanItem[] = [];
  const acik: PlanItem[] = [];
  const tamamlanan: PlanItem[] = [];
  const iptal: PlanItem[] = [];

  items.forEach((item) => {
    if (item.status === 'tamamlandi') {
      tamamlanan.push(item);
    } else if (item.status === 'iptal') {
      iptal.push(item);
    } else if (gecikmisMi(item, bugun)) {
      gecikmis.push(item);
    } else {
      acik.push(item);
    }
  });

  return { gecikmis, acik, tamamlanan, iptal };
}

/** İlerleme yüzdesi: tamamlandi / (toplam - iptal) * 100.
 * Payda 0 ise null.
 */
export function ilerlemeYuzdesi(items: Pick<PlanItem, 'status'>[]): number | null {
  const tamamlandi = items.filter((i) => i.status === 'tamamlandi').length;
  const iptal = items.filter((i) => i.status === 'iptal').length;
  const toplam = items.length - iptal;

  if (toplam === 0) return null;
  return Math.round((tamamlandi / toplam) * 100);
}

/** Pano satırı istatistikleri: açık, gecikmiş, tamamlanan, toplam, ilerleme */
export function panoSayilari(
  items: PlanItem[],
  bugun = bugunISO(),
): Pick<PanoSatiri, 'acik' | 'gecikmis' | 'tamamlanan' | 'toplam' | 'ilerleme'> {
  const g = grupla(items, bugun);
  const tamamlanan = g.tamamlanan.length;
  const gecikmis = g.gecikmis.length;
  const acik = gecikmis + g.acik.length;
  const toplam = items.length - g.iptal.length;
  const ilerleme = ilerlemeYuzdesi(items);

  return {
    acik,
    gecikmis,
    tamamlanan,
    toplam,
    ilerleme,
  };
}

/** Dosya adını güvenli hale getir: Türkçe harfleri sadeleştir, [a-z0-9._-], ≤80 karakter */
export function guvenliDosyaAdi(ad: string): string {
  if (!ad) return 'dosya';

  // Uzantıyı ayır
  const lastDot = ad.lastIndexOf('.');
  let isim = ad;
  let uzanti = '';
  if (lastDot > 0) {
    isim = ad.substring(0, lastDot);
    uzanti = ad.substring(lastDot);
  }

  // Türkçe harfleri sadeleştir
  isim = isim
    .replace(/ç/gi, 'c')
    .replace(/ğ/gi, 'g')
    .replace(/ı/gi, 'i')
    .replace(/İ/gi, 'I')
    .replace(/ö/gi, 'o')
    .replace(/ş/gi, 's')
    .replace(/ü/gi, 'u')
    .replace(/Ü/gi, 'U');

  // Geçersiz karakterleri '-' ile değiştir
  isim = isim.replace(/[^a-zA-Z0-9._-]/g, '-');

  // Tekrarlı '-' tek hale getir
  isim = isim.replace(/-+/g, '-');

  // Baş/son '-' kaldır
  isim = isim.replace(/^-+|-+$/g, '');

  if (!isim) return 'dosya';

  // Uzantı da aynı kurala uyar (ör. ".pdf"); bozuksa atılır.
  uzanti = uzanti.toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 10);
  if (!/^\.[a-z0-9]+$/.test(uzanti)) uzanti = '';

  // Toplam en fazla 80 karakter.
  isim = isim.substring(0, 80 - uzanti.length);

  return isim + uzanti;
}
