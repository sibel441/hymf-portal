'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireMemberAction } from '@/lib/auth/dal';
import type { Profile } from '@/types/database';
import { isAdmin, isHoca } from '@/lib/yetki';

export type ActionSonucu = { ok: true } | { ok: false; error: string };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HTTP_REGEX = /^https?:\/\//i;
const VARSAYILAN_DONEM = '2026-2027 Güz';

function uuidMi(deger: unknown): deger is string {
  return typeof deger === 'string' && UUID_REGEX.test(deger);
}

function metin(deger: unknown): string {
  return typeof deger === 'string' ? deger.trim() : '';
}

function gecerliHttpUrl(deger: string): boolean {
  if (!HTTP_REGEX.test(deger)) return false;
  try {
    new URL(deger);
    return true;
  } catch {
    return false;
  }
}

/** Ders ekleme/silme ve materyal ekleme yalnız hoca veya yönetici. */
function dersYetkisi(ben: Profile): boolean {
  return isHoca(ben) || isAdmin(ben);
}

function hataMesaji(e: unknown): string {
  return e instanceof Error ? e.message : 'Beklenmeyen bir hata oluştu.';
}

export async function dersEkle(input: {
  code: string;
  name: string;
  instructor_id: string;
  semester: string;
  syllabus?: string;
}): Promise<ActionSonucu> {
  try {
    const ben = await requireMemberAction();
    if (!dersYetkisi(ben)) return { ok: false, error: 'Ders eklemek için yetkiniz yok.' };

    const code = metin(input.code);
    if (!code || code.length > 20) return { ok: false, error: 'Ders kodu 1-20 karakter olmalıdır.' };

    const name = metin(input.name);
    if (name.length < 2 || name.length > 200) {
      return { ok: false, error: 'Ders adı 2-200 karakter arası olmalıdır.' };
    }

    if (!uuidMi(input.instructor_id)) return { ok: false, error: 'Geçersiz öğretim üyesi seçimi.' };

    const semester = metin(input.semester) || VARSAYILAN_DONEM;
    if (semester.length > 40) return { ok: false, error: 'Dönem 40 karakteri geçemez.' };

    const syllabus = metin(input.syllabus) || null;
    if (syllabus && syllabus.length > 5000) return { ok: false, error: 'Syllabus 5000 karakteri geçemez.' };

    const sb = await createClient();
    const { error } = await sb.from('courses').insert({
      code,
      name,
      instructor_id: input.instructor_id,
      semester,
      syllabus,
    });

    if (error) return { ok: false, error: 'Kaydedilemedi: ' + error.message };

    revalidatePath('/dersler');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: hataMesaji(e) };
  }
}

export async function dersSil(id: string): Promise<ActionSonucu> {
  try {
    const ben = await requireMemberAction();
    if (!dersYetkisi(ben)) return { ok: false, error: 'Ders silmek için yetkiniz yok.' };
    if (!uuidMi(id)) return { ok: false, error: 'Geçersiz ders ID.' };

    const sb = await createClient();
    const { data, error } = await sb.from('courses').delete().eq('id', id).select('id');

    if (error) return { ok: false, error: 'Silinemedi: ' + error.message };
    if ((data ?? []).length === 0) return { ok: false, error: 'Ders bulunamadı ya da silme yetkiniz yok.' };

    revalidatePath('/dersler');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: hataMesaji(e) };
  }
}

export async function materyalEkle(input: {
  course_id: string;
  week_number: number;
  title: string;
  description?: string;
  file_url: string;
}): Promise<ActionSonucu> {
  try {
    const ben = await requireMemberAction();
    if (!dersYetkisi(ben)) return { ok: false, error: 'Materyal eklemek için yetkiniz yok.' };

    if (!uuidMi(input.course_id)) return { ok: false, error: 'Geçersiz ders ID.' };

    const week = input.week_number;
    if (!Number.isInteger(week) || week < 1 || week > 20) {
      return { ok: false, error: 'Hafta numarası 1-20 arasında bir tam sayı olmalıdır.' };
    }

    const title = metin(input.title);
    if (!title || title.length > 200) return { ok: false, error: 'Başlık 1-200 karakter olmalıdır.' };

    const description = metin(input.description) || null;
    if (description && description.length > 5000) {
      return { ok: false, error: 'Açıklama 5000 karakteri geçemez.' };
    }

    const fileUrl = metin(input.file_url);
    if (!fileUrl || fileUrl.length > 2000 || !gecerliHttpUrl(fileUrl)) {
      return { ok: false, error: 'Dosya bağlantısı http:// veya https:// ile başlayan geçerli bir adres olmalıdır.' };
    }

    const sb = await createClient();
    const { error } = await sb.from('course_materials').insert({
      course_id: input.course_id,
      week_number: week,
      title,
      description,
      file_url: fileUrl,
      uploader_id: ben.id,
    });

    if (error) return { ok: false, error: 'Kaydedilemedi: ' + error.message };

    revalidatePath('/dersler');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: hataMesaji(e) };
  }
}

export async function materyalSil(id: string): Promise<ActionSonucu> {
  try {
    const ben = await requireMemberAction();
    if (!uuidMi(id)) return { ok: false, error: 'Geçersiz materyal ID.' };

    const sb = await createClient();
    const { data: mevcut, error: okumaHatasi } = await sb
      .from('course_materials')
      .select('uploader_id')
      .eq('id', id)
      .maybeSingle();

    if (okumaHatasi) return { ok: false, error: 'Materyal okunamadı: ' + okumaHatasi.message };
    if (!mevcut) return { ok: false, error: 'Materyal bulunamadı.' };

    // Yükleyen kendi materyalini, hoca/yönetici ise herhangi birini silebilir.
    if (mevcut.uploader_id !== ben.id && !dersYetkisi(ben)) {
      return { ok: false, error: 'Bu materyali silme yetkiniz yok.' };
    }

    const { data, error } = await sb.from('course_materials').delete().eq('id', id).select('id');

    if (error) return { ok: false, error: 'Silinemedi: ' + error.message };
    if ((data ?? []).length === 0) return { ok: false, error: 'Bu materyali silme yetkiniz yok.' };

    revalidatePath('/dersler');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: hataMesaji(e) };
  }
}
