import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Profile,
  AdminProfileUpdate,
  MemberAllowlistEntry,
  AllowlistInput,
  AdvisorAssignment,
  PendingAdvisorAssignment,
  Kadro,
  Yetki,
  UyelikLog,
} from '@/types/database';
import { ok, hata, basarisiz, BULUNAMADI_VEYA_YETKI_YOK } from './_sonuc';
import type { Sonuc } from './_sonuc';

export async function listAllProfiles(sb: SupabaseClient): Promise<Sonuc<Profile[]>> {
  try {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) return hata(error);
    return ok((data ?? []) as Profile[]);
  } catch (e) {
    return hata(e);
  }
}

export async function approveMember(
  sb: SupabaseClient,
  id: string,
  kadro: Kadro,
): Promise<Sonuc<Profile>> {
  try {
    const { data, error } = await sb
      .from('profiles')
      .update({ kadro, is_approved: true })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return hata(error);
    return ok(data as Profile);
  } catch (e) {
    return hata(e);
  }
}

export async function updateMember(
  sb: SupabaseClient,
  id: string,
  patch: AdminProfileUpdate,
): Promise<Sonuc<Profile>> {
  try {
    const updateData: Record<string, unknown> = {};
    const allowedKeys: (keyof AdminProfileUpdate)[] = [
      'full_name',
      'academic_title',
      'department',
      'kadro',
      'is_active',
      'is_approved',
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

export async function setYetki(
  sb: SupabaseClient,
  id: string,
  yetki: Yetki,
): Promise<Sonuc<Profile>> {
  try {
    const { data, error } = await sb
      .from('profiles')
      .update({ yetki })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return hata(error);
    return ok(data as Profile);
  } catch (e) {
    return hata(e);
  }
}

export async function listAdvisorAssignments(sb: SupabaseClient): Promise<Sonuc<AdvisorAssignment[]>> {
  try {
    const { data, error } = await sb
      .from('advisor_assignments')
      .select(
        '*, student:profiles!advisor_assignments_student_id_fkey(id, full_name, academic_title, kadro), advisor:profiles!advisor_assignments_advisor_id_fkey(id, full_name, academic_title, kadro)',
      );

    if (error) return hata(error);
    return ok((data ?? []) as AdvisorAssignment[]);
  } catch (e) {
    return hata(e);
  }
}

export async function addAdvisor(
  sb: SupabaseClient,
  studentId: string,
  advisorId: string,
  isPrimary: boolean,
): Promise<Sonuc<null>> {
  try {
    const { error } = await sb
      .from('advisor_assignments')
      .insert([
        {
          student_id: studentId,
          advisor_id: advisorId,
          is_primary: isPrimary,
        },
      ]);

    if (error) return hata(error);
    return ok(null);
  } catch (e) {
    return hata(e);
  }
}

export async function removeAdvisor(
  sb: SupabaseClient,
  studentId: string,
  advisorId: string,
): Promise<Sonuc<null>> {
  try {
    const { data, error } = await sb
      .from('advisor_assignments')
      .delete()
      .eq('student_id', studentId)
      .eq('advisor_id', advisorId)
      .select('student_id');

    if (error) return hata(error);
    if (!data || data.length === 0) return basarisiz(BULUNAMADI_VEYA_YETKI_YOK);
    return ok(null);
  } catch (e) {
    return hata(e);
  }
}

export async function setPrimaryAdvisor(
  sb: SupabaseClient,
  studentId: string,
  advisorId: string,
): Promise<Sonuc<null>> {
  try {
    // Önce tüm danışmanları false yap
    const { error: resetError } = await sb
      .from('advisor_assignments')
      .update({ is_primary: false })
      .eq('student_id', studentId);

    if (resetError) return hata(resetError);

    // Seçileni true yap
    const { data: secilen, error: setError } = await sb
      .from('advisor_assignments')
      .update({ is_primary: true })
      .eq('student_id', studentId)
      .eq('advisor_id', advisorId)
      .select('student_id');

    if (setError) return hata(setError);
    if (!secilen || secilen.length === 0) return basarisiz(BULUNAMADI_VEYA_YETKI_YOK);

    return ok(null);
  } catch (e) {
    return hata(e);
  }
}

export async function listAllowlist(sb: SupabaseClient): Promise<Sonuc<MemberAllowlistEntry[]>> {
  try {
    const { data, error } = await sb
      .from('member_allowlist')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) return hata(error);
    return ok((data ?? []) as MemberAllowlistEntry[]);
  } catch (e) {
    return hata(e);
  }
}

export async function upsertAllowlist(
  sb: SupabaseClient,
  entry: AllowlistInput,
): Promise<Sonuc<MemberAllowlistEntry>> {
  try {
    const normalized = {
      email: entry.email.trim().toLowerCase(),
      full_name: entry.full_name,
      kadro: entry.kadro,
      yetki: entry.yetki,
    };

    const { data, error } = await sb
      .from('member_allowlist')
      .upsert([normalized], { onConflict: 'email' })
      .select('*')
      .single();

    if (error) return hata(error);
    return ok(data as MemberAllowlistEntry);
  } catch (e) {
    return hata(e);
  }
}

export async function deleteAllowlist(sb: SupabaseClient, email: string): Promise<Sonuc<null>> {
  try {
    const { data, error } = await sb
      .from('member_allowlist')
      .delete()
      .eq('email', email.trim().toLowerCase())
      .select('email');

    if (error) return hata(error);
    if (!data || data.length === 0) return basarisiz(BULUNAMADI_VEYA_YETKI_YOK);
    return ok(null);
  } catch (e) {
    return hata(e);
  }
}

export async function listPendingAdvisors(
  sb: SupabaseClient,
): Promise<Sonuc<PendingAdvisorAssignment[]>> {
  try {
    const { data, error } = await sb
      .from('pending_advisor_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return hata(error);
    return ok((data ?? []) as PendingAdvisorAssignment[]);
  } catch (e) {
    return hata(e);
  }
}

export async function addPendingAdvisor(
  sb: SupabaseClient,
  studentEmail: string,
  advisorEmail: string,
  isPrimary: boolean,
): Promise<Sonuc<null>> {
  try {
    const normalized = {
      student_email: studentEmail.trim().toLowerCase(),
      advisor_email: advisorEmail.trim().toLowerCase(),
      is_primary: isPrimary,
    };

    const { error } = await sb
      .from('pending_advisor_assignments')
      .insert([normalized]);

    if (error) return hata(error);
    return ok(null);
  } catch (e) {
    return hata(e);
  }
}

export async function removePendingAdvisor(
  sb: SupabaseClient,
  studentEmail: string,
  advisorEmail: string,
): Promise<Sonuc<null>> {
  try {
    const { data, error } = await sb
      .from('pending_advisor_assignments')
      .delete()
      .eq('student_email', studentEmail.trim().toLowerCase())
      .eq('advisor_email', advisorEmail.trim().toLowerCase())
      .select('student_email');

    if (error) return hata(error);
    if (!data || data.length === 0) return basarisiz(BULUNAMADI_VEYA_YETKI_YOK);
    return ok(null);
  } catch (e) {
    return hata(e);
  }
}

export async function listUyelikLogs(
  sb: SupabaseClient,
  limit = 100,
): Promise<Sonuc<UyelikLog[]>> {
  try {
    const { data, error } = await sb
      .from('uyelik_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return hata(error);
    return ok((data ?? []) as UyelikLog[]);
  } catch (e) {
    return hata(e);
  }
}
