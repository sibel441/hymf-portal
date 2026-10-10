import { requireMember } from '@/lib/auth/dal';
import { isAdmin } from '@/lib/yetki';
import { createClient } from '@/lib/supabase/server';
import { ErisimEngellendi, Uyari } from '@/components/ui';
import { listUyelikLogs } from '@/lib/data/admin';
import { IslemGecmisiListesi } from '@/components/yonetim/IslemGecmisiListesi';

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
  const logsResult = await listUyelikLogs(sb, 200);

  if (logsResult.error) {
    return <Uyari tone="tehlike">{logsResult.error}</Uyari>;
  }

  return <IslemGecmisiListesi logs={logsResult.data || []} />;
}
