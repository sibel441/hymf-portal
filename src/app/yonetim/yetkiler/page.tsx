import { requireMember } from '@/lib/auth/dal';
import { isSuperadmin } from '@/lib/yetki';
import { createClient } from '@/lib/supabase/server';
import { ErisimEngellendi, Uyari } from '@/components/ui';
import { listAllProfiles } from '@/lib/data/admin';
import { YetkilerYonetimi } from '@/components/yonetim/YetkilerYonetimi';

export default async function Page() {
  const ben = await requireMember();

  if (!isSuperadmin(ben)) {
    return (
      <ErisimEngellendi
        baslik="Bu sayfa sistem yöneticilerine açık"
        aciklama="Yetkilendirme paneline yalnız sistem yöneticileri girebilir."
        donusHref="/"
        donusEtiketi="Ana sayfaya dön"
      />
    );
  }

  const sb = await createClient();
  const profilesResult = await listAllProfiles(sb);

  if (profilesResult.error) {
    return <Uyari tone="tehlike">{profilesResult.error}</Uyari>;
  }

  const profiles = profilesResult.data || [];
  const superadminCount = profiles.filter((p) => p.yetki === 'superadmin' && p.is_approved && p.is_active).length;

  return (
    <YetkilerYonetimi
      profiles={profiles}
      superadminCount={superadminCount}
    />
  );
}
