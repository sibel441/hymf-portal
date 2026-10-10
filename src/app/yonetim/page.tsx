import { requireMember } from '@/lib/auth/dal';
import { isAdmin, isSuperadmin } from '@/lib/yetki';
import { createClient } from '@/lib/supabase/server';
import { ErisimEngellendi, Uyari } from '@/components/ui';
import { listAllProfiles, listAdvisorAssignments } from '@/lib/data/admin';
import { UyeleriYonet } from '@/components/yonetim/UyeleriYonet';

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

  const profilesResult = await listAllProfiles(sb);
  const advisorsResult = await listAdvisorAssignments(sb);

  const hata = profilesResult.error ?? advisorsResult.error;
  if (hata) {
    return <Uyari tone="tehlike">{hata}</Uyari>;
  }

  return (
    <UyeleriYonet
      profiles={profilesResult.data || []}
      advisorAssignments={advisorsResult.data || []}
      hocaKadrosuKisitli={!isSuperadmin(ben)}
    />
  );
}
