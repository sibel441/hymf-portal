// Profil ve çalışma alanı izinleri. Yalnız arayüz kararları içindir; asıl koruma veritabanında
// (RLS ve trigger'lar, bkz. docs/PLAN.md §2). Kurallar oradakilerle birebir aynı tutulur.

import type { PlanItem, Profile, ProgressUpdate, UserRole, WorkspaceFile } from '@/types/database';

type YetkiProfili = Pick<Profile, 'is_approved' | 'is_active' | 'yetki' | 'kadro'> | null | undefined;

export function isMember(p: YetkiProfili): boolean {
  return !!p && p.is_approved && p.is_active;
}

export function isAdmin(p: YetkiProfili): boolean {
  return isMember(p) && (p!.yetki === 'admin' || p!.yetki === 'superadmin');
}

export function isSuperadmin(p: YetkiProfili): boolean {
  return isMember(p) && p!.yetki === 'superadmin';
}

export function isHoca(p: YetkiProfili): boolean {
  return isMember(p) && p!.kadro === 'hoca';
}

/** @deprecated Eski sayfalar için kadro/yetki → eski rol eşlemesi. */
export function eskiRol(p: YetkiProfili): UserRole {
  if (isHoca(p)) return 'hoca';
  if (isAdmin(p)) return 'yonetici';
  return 'arastirmaci';
}

/** Çalışma alanını görüntüleyen kişinin o alanla ilişkisi. */
export interface IzleyiciBaglami {
  viewerId: string;
  studentId: string;
  /** Alan, görüntüleyenin kendisine ait. */
  isStudent: boolean;
  /** Görüntüleyen, öğrencinin danışmanı (advisor_assignments). */
  isAdvisor: boolean;
}

export interface PlanIzinleri {
  /** status alanını değiştirebilir. */
  durumDegistir: boolean;
  /** truba_ref alanını değiştirebilir. */
  trubaDuzenle: boolean;
  /** Başlık, açıklama, son tarih, öncelik. */
  duzenle: boolean;
  sil: boolean;
}

export function planIzinleri(ctx: IzleyiciBaglami, item: Pick<PlanItem, 'created_by'>): PlanIzinleri {
  if (ctx.isAdvisor) return { durumDegistir: true, trubaDuzenle: true, duzenle: true, sil: true };
  if (ctx.isStudent) {
    const kendiMaddesi = item.created_by === ctx.viewerId;
    return { durumDegistir: true, trubaDuzenle: true, duzenle: kendiMaddesi, sil: kendiMaddesi };
  }
  return { durumDegistir: false, trubaDuzenle: false, duzenle: false, sil: false };
}

export function maddeEkleyebilir(ctx: IzleyiciBaglami): boolean {
  return ctx.isAdvisor || ctx.isStudent;
}

/** Sıralama ve toplu ekleme yalnız danışmanda. */
export function siralayabilir(ctx: IzleyiciBaglami): boolean {
  return ctx.isAdvisor;
}

export function topluEkleyebilir(ctx: IzleyiciBaglami): boolean {
  return ctx.isAdvisor;
}

export function notYazabilir(ctx: IzleyiciBaglami): boolean {
  return ctx.isAdvisor || ctx.isStudent;
}

export function notDuzenleyebilir(ctx: IzleyiciBaglami, not: Pick<ProgressUpdate, 'author_id'>): boolean {
  return not.author_id === ctx.viewerId;
}

export function tezBilgisiDuzenleyebilir(ctx: IzleyiciBaglami): boolean {
  return ctx.isAdvisor || ctx.isStudent;
}

export function dosyaYukleyebilir(ctx: IzleyiciBaglami): boolean {
  return ctx.isAdvisor || ctx.isStudent;
}

export function dosyaSilebilir(ctx: IzleyiciBaglami, dosya: Pick<WorkspaceFile, 'uploaded_by'>): boolean {
  return ctx.isAdvisor || (ctx.isStudent && dosya.uploaded_by === ctx.viewerId);
}
