import { requireMember } from '@/lib/auth/dal';
import { isAdmin, isSuperadmin } from '@/lib/yetki';
import { createClient } from '@/lib/supabase/server';
import { ErisimEngellendi, Uyari } from '@/components/ui';
import { listAllowlist, listPendingAdvisors, listAllProfiles } from '@/lib/data/admin';
import { DavetYonetimi } from '@/components/yonetim/DavetYonetimi';

export default async function Page() {
  const ben = await requireMember();

  if (!isAdmin(ben)) {
    return (
      <ErisimEngellendi
        baslik="Bu sayfa yöneticilere açık"
        aciklama="Yönetim paneline yalnız yöneticiler girebilir."
        donusHref="/"
        donusEtiketi="Ana sayfaya dön"
      />
    );
  }

  const sb = await createClient();

  const allowlistResult = await listAllowlist(sb);
  const pendingAdvisorsResult = await listPendingAdvisors(sb);
  const profilesResult = await listAllProfiles(sb);

  if (allowlistResult.error || pendingAdvisorsResult.error || profilesResult.error) {
    return <Uyari tone="tehlike">Davet listesi yüklenemedi. Sayfayı yenileyin.</Uyari>;
  }

  const hokaProfiles = (profilesResult.data || []).filter((p) => p.kadro === 'hoca' && p.is_approved && p.is_active);
  const allowlistHokas = (allowlistResult.data || []).filter((a) => a.kadro === 'hoca');

  return (
    <DavetYonetimi
      allowlist={allowlistResult.data || []}
      pendingAdvisors={pendingAdvisorsResult.data || []}
      hokaProfiles={hokaProfiles}
      allowlistHokas={allowlistHokas}
      superadminDegilse={!isSuperadmin(ben)}
    />
  );
}
