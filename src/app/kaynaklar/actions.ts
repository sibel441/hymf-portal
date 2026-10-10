'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireMemberAction } from '@/lib/auth/dal';
import type { ResourceCategory } from '@/types/database';

export type ActionSonucu = { ok: true } | { ok: false; error: string };

export interface KaynakGirdisi {
  title: string;
  description: string;
  category: ResourceCategory;
  language: string;
  codeSnippet: string;
  externalUrl: string;
  /** Virgülle ayrılmış ham girdi; ayrıştırma sunucuda yapılır. */
  etiketler: string;
}

const KATEGORILER: readonly ResourceCategory[] = ['kitap_makale', 'faydali_link', 'kod_script'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HTTP_REGEX = /^https?:\/\//i;

const MAX_BASLIK = 200;
const MAX_ACIKLAMA = 5000;
const MAX_KOD = 20000;
const MAX_DIL = 30;
const MAX_ETIKET_SAYISI = 10;
const MAX_ETIKET_UZUNLUK = 40;

function metin(deger: unknown): string {
  return typeof deger === 'string' ? deger.trim() : '';
}

export async function kaynakEkle(input: KaynakGirdisi): Promise<ActionSonucu> {
  try {
    const ben = await requireMemberAction();

    const kategori = input.category;
    if (!KATEGORILER.includes(kategori)) {
      return { ok: false, error: 'Geçersiz kategori.' };
    }

    const title = metin(input.title);
    if (!title) return { ok: false, error: 'Başlık zorunludur.' };
    if (title.length > MAX_BASLIK) {
      return { ok: false, error: `Başlık en fazla ${MAX_BASLIK} karakter olabilir.` };
    }

    const description = metin(input.description);
    if (description.length > MAX_ACIKLAMA) {
      return { ok: false, error: `Açıklama en fazla ${MAX_ACIKLAMA} karakter olabilir.` };
    }

    const language = metin(input.language) || 'bash';
    if (language.length > MAX_DIL) {
      return { ok: false, error: `Dil adı en fazla ${MAX_DIL} karakter olabilir.` };
    }

    // Kategoriyle ilgisiz alanlar kaydedilmez (örn. kod girilip kategori değiştirilirse).
    const codeSnippet = kategori === 'kod_script' ? metin(input.codeSnippet) : '';
    if (codeSnippet.length > MAX_KOD) {
      return { ok: false, error: `Kod en fazla ${MAX_KOD} karakter olabilir.` };
    }
    if (kategori === 'kod_script' && !codeSnippet) {
      return { ok: false, error: 'Kod / script içeriği zorunludur.' };
    }

    const externalUrl = kategori === 'faydali_link' ? metin(input.externalUrl) : '';
    if (externalUrl && !HTTP_REGEX.test(externalUrl)) {
      return { ok: false, error: 'Bağlantı http:// veya https:// ile başlamalıdır.' };
    }
    if (kategori === 'faydali_link' && !externalUrl) {
      return { ok: false, error: 'Web bağlantısı zorunludur.' };
    }

    const etiketler = metin(input.etiketler)
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (etiketler.length > MAX_ETIKET_SAYISI) {
      return { ok: false, error: `En fazla ${MAX_ETIKET_SAYISI} etiket eklenebilir.` };
    }
    if (etiketler.some((t) => t.length > MAX_ETIKET_UZUNLUK)) {
      return { ok: false, error: `Her etiket en fazla ${MAX_ETIKET_UZUNLUK} karakter olabilir.` };
    }

    const sb = await createClient();
    const { error } = await sb.from('resources').insert({
      title,
      description: description || null,
      category: kategori,
      language,
      code_snippet: codeSnippet || null,
      external_url: externalUrl || null,
      file_url: null,
      tags: etiketler,
      uploader_id: ben.id,
    });

    if (error) return { ok: false, error: 'Kaydedilemedi: ' + error.message };

    revalidatePath('/kaynaklar');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Beklenmeyen bir hata oluştu.' };
  }
}

export async function kaynakSil(id: string): Promise<ActionSonucu> {
  try {
    await requireMemberAction();

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      return { ok: false, error: 'Geçersiz kaynak ID.' };
    }

    const sb = await createClient();
    const { data, error } = await sb.from('resources').delete().eq('id', id).select('id');

    if (error) return { ok: false, error: 'Silinemedi: ' + error.message };
    // Yetkiyi veritabanı (RLS) uygular; istemcideki gizleme yalnız kolaylık içindir.
    if ((data ?? []).length === 0) return { ok: false, error: 'Bu kaydı silme yetkiniz yok.' };

    revalidatePath('/kaynaklar');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Beklenmeyen bir hata oluştu.' };
  }
}
