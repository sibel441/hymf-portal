import type { SupabaseClient } from '@supabase/supabase-js';
import type { CalismaAlaniVerisi, PanoSatiri, ProfileSummary, StudentWorkspace, WorkspaceInfoUpdate, WorkspaceLog, PlanItem, ProgressUpdate, WorkspaceFile } from '@/types/database';
import { ok, hata } from './_sonuc';
import type { Sonuc } from './_sonuc';
import { panoSayilari } from '@/lib/calisma/hesap';

export async function getCalismaAlaniVerisi(
  sb: SupabaseClient,
  studentId: string,
): Promise<Sonuc<CalismaAlaniVerisi | null>> {
  try {
    // Öğrencinin çalışma alanını bul
    const { data: workspace, error: wsError } = await sb
      .from('student_workspaces')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (wsError) return hata(wsError);
    if (!workspace) return ok(null);

    // Paralel sorgular
    const [studentRes, advisorsRes, planRes, updatesRes, filesRes, logsRes] = await Promise.all([
      sb
        .from('profiles')
        .select('id, full_name, academic_title, kadro')
        .eq('id', studentId)
        .maybeSingle(),
      sb
        .from('advisor_assignments')
        .select('advisor:profiles!advisor_assignments_advisor_id_fkey(id, full_name, academic_title, kadro)')
        .eq('student_id', studentId)
        .order('is_primary', { ascending: false }),
      sb
        .from('plan_items')
        .select('*, creator:profiles!plan_items_created_by_fkey(id, full_name, academic_title, kadro)')
        .eq('workspace_id', workspace.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
      sb
        .from('progress_updates')
        .select('*, author:profiles!progress_updates_author_id_fkey(id, full_name, academic_title, kadro)')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false }),
      sb
        .from('workspace_files')
        .select('*, uploader:profiles!workspace_files_uploaded_by_fkey(id, full_name, academic_title, kadro)')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false }),
      sb
        .from('workspace_logs')
        .select('*, actor:profiles!workspace_logs_actor_id_fkey(id, full_name, academic_title, kadro)')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (studentRes.error) return hata(studentRes.error);
    if (advisorsRes.error) return hata(advisorsRes.error);
    if (planRes.error) return hata(planRes.error);
    if (updatesRes.error) return hata(updatesRes.error);
    if (filesRes.error) return hata(filesRes.error);
    if (logsRes.error) return hata(logsRes.error);

    const advisorsData = advisorsRes.data ?? [];
    const result: CalismaAlaniVerisi = {
      workspace: workspace as StudentWorkspace,
      student: studentRes.data as ProfileSummary,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      advisors: (advisorsData as any[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => row.advisor as ProfileSummary)
        .filter(Boolean),
      planItems: (planRes.data ?? []) as PlanItem[],
      updates: (updatesRes.data ?? []) as ProgressUpdate[],
      files: (filesRes.data ?? []) as WorkspaceFile[],
      logs: (logsRes.data ?? []) as WorkspaceLog[],
    };

    return ok(result);
  } catch (e) {
    return hata(e);
  }
}

export async function updateWorkspaceInfo(
  sb: SupabaseClient,
  workspaceId: string,
  patch: WorkspaceInfoUpdate,
): Promise<Sonuc<StudentWorkspace>> {
  try {
    const updateData: Record<string, unknown> = {};
    const allowedKeys: (keyof WorkspaceInfoUpdate)[] = ['thesis_title', 'summary', 'drive_url'];

    allowedKeys.forEach((key) => {
      if (key in patch) {
        updateData[key] = patch[key];
      }
    });

    const { data, error } = await sb
      .from('student_workspaces')
      .update(updateData)
      .eq('id', workspaceId)
      .select('*')
      .single();

    if (error) return hata(error);
    return ok(data as StudentWorkspace);
  } catch (e) {
    return hata(e);
  }
}

export async function getDanismanPanosu(
  sb: SupabaseClient,
  advisorId: string,
): Promise<Sonuc<PanoSatiri[]>> {
  try {
    // Danışmanın öğrencilerini bul
    const { data: assignments, error: assignError } = await sb
      .from('advisor_assignments')
      .select('student_id')
      .eq('advisor_id', advisorId);

    if (assignError) return hata(assignError);

    const studentIds = (assignments ?? []).map((a: { student_id: string }) => a.student_id);
    if (studentIds.length === 0) {
      return ok([]);
    }

    // Öğrenci profilleri
    const { data: students, error: studentsError } = await sb
      .from('profiles')
      .select('id, full_name, academic_title, kadro')
      .in('id', studentIds);

    if (studentsError) return hata(studentsError);

    // Tüm danışman atamaları (her öğrenci için)
    const { data: allAdvisors, error: allAdvisorsError } = await sb
      .from('advisor_assignments')
      .select('student_id, advisor:profiles!advisor_assignments_advisor_id_fkey(id, full_name, academic_title, kadro)')
      .in('student_id', studentIds)
      .order('is_primary', { ascending: false });

    if (allAdvisorsError) return hata(allAdvisorsError);

    // Çalışma alanları
    const { data: workspaces, error: wsError } = await sb
      .from('student_workspaces')
      .select('id, student_id, last_student_activity_at')
      .in('student_id', studentIds);

    if (wsError) return hata(wsError);

    const workspaceMap = new Map<string, { id: string; student_id: string; last_student_activity_at: string | null }>();
    (workspaces ?? []).forEach((ws: { id: string; student_id: string; last_student_activity_at: string | null }) => {
      workspaceMap.set(ws.student_id, ws);
    });

    // Plan maddeleri
    const workspaceIds = (workspaces ?? []).map((ws: { id: string }) => ws.id);
    let planItems: PlanItem[] = [];
    if (workspaceIds.length > 0) {
      const { data: plans, error: plansError } = await sb
        .from('plan_items')
        .select('workspace_id, status, due_date')
        .in('workspace_id', workspaceIds);

      if (plansError) return hata(plansError);
      planItems = (plans ?? []) as PlanItem[];
    }

    // Danışmanlar mapı
    const advisorMap = new Map<string, ProfileSummary[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (allAdvisors ?? []).forEach((row: any) => {
      const sid = row.student_id as string;
      if (!advisorMap.has(sid)) {
        advisorMap.set(sid, []);
      }
      if (row.advisor) {
        advisorMap.get(sid)!.push(row.advisor as ProfileSummary);
      }
    });

    // Pano satırları
    const rows: PanoSatiri[] = [];
    (students ?? []).forEach((student: ProfileSummary) => {
      const ws = workspaceMap.get(student.id);
      const studentPlans = planItems.filter((p) => p.workspace_id === ws?.id);
      const stats = panoSayilari(studentPlans);

      rows.push({
        student,
        workspace_id: ws?.id ?? null,
        advisors: advisorMap.get(student.id) ?? [],
        acik: stats.acik,
        gecikmis: stats.gecikmis,
        tamamlanan: stats.tamamlanan,
        toplam: stats.toplam,
        ilerleme: stats.ilerleme,
        son_guncelleme: ws?.last_student_activity_at ?? null,
      });
    });

    // Ada göre (tr locale) sırala
    rows.sort((a, b) =>
      a.student.full_name.localeCompare(b.student.full_name, 'tr-TR'),
    );

    return ok(rows);
  } catch (e) {
    return hata(e);
  }
}
