import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile, ProfileSelfUpdate, ProfileSummary } from '@/types/database';
import { ok, hata } from './_sonuc';
import type { Sonuc } from './_sonuc';

export async function getProfile(sb: SupabaseClient, id: string): Promise<Sonuc<Profile | null>> {
  try {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return hata(error);
    return ok(data as Profile | null);
  } catch (e) {
    return hata(e);
  }
}

export async function listMembers(sb: SupabaseClient): Promise<Sonuc<Profile[]>> {
  try {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) return hata(error);
    return ok((data ?? []) as Profile[]);
  } catch (e) {
    return hata(e);
  }
}

export async function updateOwnProfile(
  sb: SupabaseClient,
  id: string,
  patch: ProfileSelfUpdate,
): Promise<Sonuc<Profile>> {
  try {
    // Yalnız ProfileSelfUpdate alanlarını gönder
    const updateData: Record<string, unknown> = {};
    const allowedKeys: (keyof ProfileSelfUpdate)[] = [
      'full_name',
      'academic_title',
      'department',
      'research_topics',
      'scholar_url',
      'orcid',
    ];

    allowedKeys.forEach((key) => {
      if (key in patch) {
        updateData[key] = patch[key];
      }
    });

    const { data, error } = await sb
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) return hata(error);
    return ok(data as Profile);
  } catch (e) {
    return hata(e);
  }
}

export async function listAdvisorsByStudent(
  sb: SupabaseClient,
): Promise<Sonuc<Record<string, ProfileSummary[]>>> {
  try {
    const { data, error } = await sb
      .from('advisor_assignments')
      .select(
        'student_id, advisor:profiles!advisor_assignments_advisor_id_fkey(id, full_name, academic_title, kadro)',
      )
      .order('is_primary', { ascending: false });

    if (error) return hata(error);

    const result: Record<string, ProfileSummary[]> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data ?? []).forEach((row: any) => {
      const studentId = row.student_id as string;
      if (!result[studentId]) {
        result[studentId] = [];
      }
      if (row.advisor) {
        result[studentId].push(row.advisor as ProfileSummary);
      }
    });

    return ok(result);
  } catch (e) {
    return hata(e);
  }
}
