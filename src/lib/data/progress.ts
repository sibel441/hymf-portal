import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProgressUpdate, ProgressUpdateInput } from '@/types/database';
import { ok, hata, basarisiz, BULUNAMADI_VEYA_YETKI_YOK } from './_sonuc';
import type { Sonuc } from './_sonuc';

export async function listProgressUpdates(
  sb: SupabaseClient,
  workspaceId: string,
): Promise<Sonuc<ProgressUpdate[]>> {
  try {
    const { data, error } = await sb
      .from('progress_updates')
      .select('*, author:profiles!progress_updates_author_id_fkey(id, full_name, academic_title, kadro)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) return hata(error);
    return ok((data ?? []) as ProgressUpdate[]);
  } catch (e) {
    return hata(e);
  }
}

export async function addProgressUpdate(
  sb: SupabaseClient,
  input: ProgressUpdateInput,
): Promise<Sonuc<ProgressUpdate>> {
  try {
    // tur ve author_id göndermez, trigger belirler
    const insertData = {
      workspace_id: input.workspace_id,
      plan_item_id: input.plan_item_id ?? null,
      body: input.body,
    };

    const { data, error } = await sb
      .from('progress_updates')
      .insert([insertData])
      .select('*, author:profiles!progress_updates_author_id_fkey(id, full_name, academic_title, kadro)')
      .single();

    if (error) return hata(error);
    return ok(data as ProgressUpdate);
  } catch (e) {
    return hata(e);
  }
}

export async function updateProgressUpdate(
  sb: SupabaseClient,
  id: string,
  body: string,
): Promise<Sonuc<ProgressUpdate>> {
  try {
    const { data, error } = await sb
      .from('progress_updates')
      .update({ body })
      .eq('id', id)
      .select('*, author:profiles!progress_updates_author_id_fkey(id, full_name, academic_title, kadro)')
      .single();

    if (error) return hata(error);
    return ok(data as ProgressUpdate);
  } catch (e) {
    return hata(e);
  }
}

export async function deleteProgressUpdate(
  sb: SupabaseClient,
  id: string,
): Promise<Sonuc<null>> {
  try {
    const { data, error } = await sb
      .from('progress_updates')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) return hata(error);
    if (!data || data.length === 0) return basarisiz(BULUNAMADI_VEYA_YETKI_YOK);
    return ok(null);
  } catch (e) {
    return hata(e);
  }
}
