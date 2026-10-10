'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireMemberAction } from '@/lib/auth/dal';

export type ActionSonucu = { ok: true } | { ok: false; error: string };

export interface ToplantiGirdisi {
  title: string;
  /** İstemci datetime-local değerini ISO'ya çevirip gönderir. */
  meeting_date: string;
  notes: string;
  presentation_url: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_REGEX = /^https?:\/\//i;
const BASLIK_MAX = 200;
const NOT_MAX = 5000;
const URL_MAX = 2000;

export async function toplantiEkle(input: ToplantiGirdisi): Promise<ActionSonucu> {
  try {
    const ben = await requireMemberAction();

    const title = typeof input.title === 'string' ? input.title.trim() : '';
    if (!title) return { ok: false, error: 'Toplantı başlığı zorunludur.' };
    if (title.length > BASLIK_MAX) return { ok: false, error: `Başlık ${BASLIK_MAX} karakteri aşamaz.` };

    if (typeof input.meeting_date !== 'string' || Number.isNaN(Date.parse(input.meeting_date))) {
      return { ok: false, error: 'Geçerli bir tarih ve saat girin.' };
    }

    const notes = typeof input.notes === 'string' ? input.notes.trim() : '';
    if (notes.length > NOT_MAX) return { ok: false, error: `Notlar ${NOT_MAX} karakteri aşamaz.` };

    const presentationUrl = typeof input.presentation_url === 'string' ? input.presentation_url.trim() : '';
    if (presentationUrl) {
      if (presentationUrl.length > URL_MAX) return { ok: false, error: 'Bağlantı çok uzun.' };
      if (!URL_REGEX.test(presentationUrl)) {
        return { ok: false, error: 'Sunum bağlantısı http:// veya https:// ile başlamalıdır.' };
      }
    }

    const sb = await createClient();
    const { error } = await sb.from('meetings').insert({
      title,
      meeting_date: new Date(input.meeting_date).toISOString(),
      notes: notes || null,
      presentation_url: presentationUrl || null,
      creator_id: ben.id,
    });

    if (error) return { ok: false, error: 'Kaydedilemedi: ' + error.message };

    revalidatePath('/toplantilar');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Beklenmeyen bir hata oluştu.' };
  }
}

export async function toplantiSil(id: string): Promise<ActionSonucu> {
  try {
    await requireMemberAction();

    if (typeof id !== 'string' || !UUID_REGEX.test(id)) return { ok: false, error: 'Geçersiz kayıt.' };

    const sb = await createClient();
    const { data, error } = await sb.from('meetings').delete().eq('id', id).select('id');

    if (error) return { ok: false, error: 'Silinemedi: ' + error.message };
    if ((data ?? []).length === 0) return { ok: false, error: 'Bu kaydı silme yetkiniz yok.' };

    revalidatePath('/toplantilar');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Beklenmeyen bir hata oluştu.' };
  }
}
