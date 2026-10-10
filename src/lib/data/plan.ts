import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlanItem, PlanItemInput, PlanItemPatch, PlanDurum } from '@/types/database';
import { ok, hata, basarisiz, BULUNAMADI_VEYA_YETKI_YOK } from './_sonuc';
import type { Sonuc } from './_sonuc';

export async function listPlanItems(
  sb: SupabaseClient,
  workspaceId: string,
): Promise<Sonuc<PlanItem[]>> {
  try {
    const { data, error } = await sb
      .from('plan_items')
      .select('*, creator:profiles!plan_items_created_by_fkey(id, full_name, academic_title, kadro)')
      .eq('workspace_id', workspaceId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) return hata(error);
    return ok((data ?? []) as PlanItem[]);
  } catch (e) {
    return hata(e);
  }
}

export async function createPlanItem(
  sb: SupabaseClient,
  input: PlanItemInput,
): Promise<Sonuc<PlanItem>> {
  try {
    // created_by ve updated_by göndermez, trigger doldurur
    const insertData = {
      workspace_id: input.workspace_id,
      title: input.title,
      description: input.description ?? null,
      due_date: input.due_date ?? null,
      status: input.status ?? 'planlandi',
      priority: input.priority ?? 2,
      truba_ref: input.truba_ref ?? null,
    };

    const { data, error } = await sb
      .from('plan_items')
      .insert([insertData])
      .select('*, creator:profiles!plan_items_created_by_fkey(id, full_name, academic_title, kadro)')
      .single();

    if (error) return hata(error);
    return ok(data as PlanItem);
  } catch (e) {
    return hata(e);
  }
}

export async function createPlanItemsBulk(
  sb: SupabaseClient,
  workspaceId: string,
  titles: string[],
  ortak?: Pick<PlanItemInput, 'due_date' | 'priority'>,
): Promise<Sonuc<PlanItem[]>> {
  try {
    // Başlıkları trim'le, boşları at, maksimum 50
    const cleaned = titles
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 50);

    if (cleaned.length === 0) {
      return ok([]);
    }

    // Her satıra ortak alanları ekle
    const rows = cleaned.map((title) => ({
      workspace_id: workspaceId,
      title,
      description: null,
      due_date: ortak?.due_date ?? null,
      status: 'planlandi' as const,
      priority: ortak?.priority ?? 2,
      truba_ref: null,
    }));

    const { data, error } = await sb
      .from('plan_items')
      .insert(rows)
      .select('*, creator:profiles!plan_items_created_by_fkey(id, full_name, academic_title, kadro)');

    if (error) return hata(error);
    return ok((data ?? []) as PlanItem[]);
  } catch (e) {
    return hata(e);
  }
}

export async function updatePlanItem(
  sb: SupabaseClient,
  id: string,
  patch: PlanItemPatch,
): Promise<Sonuc<PlanItem>> {
  try {
    // Yalnız izin verilen alanları gönder, completed_at göndermez
    const updateData: Record<string, unknown> = {};
    const allowedKeys: (keyof Omit<PlanItemPatch, 'sort_order'>)[] = [
      'title',
      'description',
      'due_date',
      'status',
      'priority',
      'truba_ref',
    ];

    allowedKeys.forEach((key) => {
      if (key in patch) {
        updateData[key] = patch[key];
      }
    });

    // sort_order ayrıca işle
    if ('sort_order' in patch) {
      updateData.sort_order = patch.sort_order;
    }

    const { data, error } = await sb
      .from('plan_items')
      .update(updateData)
      .eq('id', id)
      .select('*, creator:profiles!plan_items_created_by_fkey(id, full_name, academic_title, kadro)')
      .single();

    if (error) return hata(error);
    return ok(data as PlanItem);
  } catch (e) {
    return hata(e);
  }
}

export async function updatePlanStatus(
  sb: SupabaseClient,
  id: string,
  status: PlanDurum,
): Promise<Sonuc<PlanItem>> {
  try {
    // Status'ü güncelle; completed_at trigger tarafından ayarlanır
    const { data, error } = await sb
      .from('plan_items')
      .update({ status })
      .eq('id', id)
      .select('*, creator:profiles!plan_items_created_by_fkey(id, full_name, academic_title, kadro)')
      .single();

    if (error) return hata(error);
    return ok(data as PlanItem);
  } catch (e) {
    return hata(e);
  }
}

export async function deletePlanItem(
  sb: SupabaseClient,
  id: string,
): Promise<Sonuc<null>> {
  try {
    const { data, error } = await sb
      .from('plan_items')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) return hata(error);
    // RLS silmeyi engellerse hata yerine 0 satır döner.
    if (!data || data.length === 0) return basarisiz(BULUNAMADI_VEYA_YETKI_YOK);
    return ok(null);
  } catch (e) {
    return hata(e);
  }
}

export async function reorderPlanItems(
  sb: SupabaseClient,
  orderedIds: string[],
): Promise<Sonuc<null>> {
  try {
    // Her id için sort_order = index + 1 olacak şekilde güncelle
    const updates = orderedIds.map((id, index) =>
      sb
        .from('plan_items')
        .update({ sort_order: index + 1 })
        .eq('id', id)
        .select('id'),
    );

    const results = await Promise.all(updates);

    // İlk hatayı döndür
    for (const result of results) {
      if (result.error) {
        return hata(result.error);
      }
      if (!result.data || result.data.length === 0) return basarisiz(BULUNAMADI_VEYA_YETKI_YOK);
    }

    return ok(null);
  } catch (e) {
    return hata(e);
  }
}
