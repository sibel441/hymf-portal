import { redirect } from 'next/navigation';
import { ErisimEngellendi, Uyari, SayfaBasligi } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/auth/dal';
import { getCalismaAlaniVerisi } from '@/lib/data/workspaces';
import { CalismaAlani } from '@/components/calisma/CalismaAlani';
import { TopluEkle } from '@/components/calisma/TopluEkle';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CalismaAlaniDetailPage(props: PageProps<'/calisma-alani/[ogrenciId]'>) {
  const { ogrenciId } = await props.params;

  // UUID biçimini kontrol et
  if (!UUID_REGEX.test(ogrenciId)) {
    return <ErisimEngellendi />;
  }

  const ben = await requireMember();

  // Kendi çalışma alanına erişmeye çalışırsa yönlendir
  if (ogrenciId === ben.id) {
    redirect('/calisma-alani');
  }

  const sb = await createClient();

  // Çalışma alanı verilerini getir (RLS tarafından kontrol edilir, yetkisi yoksa null döner)
  const sonuc = await getCalismaAlaniVerisi(sb, ogrenciId);

  if (sonuc.error) {
    return (
      <div className="space-y-8">
        <SayfaBasligi baslik="Çalışma alanı" />
        <Uyari tone="tehlike">{sonuc.error}</Uyari>
      </div>
    );
  }

  const veri = sonuc.data;

  // Veri yoksa (RLS tarafından görme izni verilmediyse) veya danışman değilse erişimi engelle
  if (!veri) {
    return <ErisimEngellendi />;
  }

  // Danışman olup olmadığını kontrol et
  const isDanisman = veri.advisors.some((a) => a.id === ben.id);
  if (!isDanisman) {
    return <ErisimEngellendi />;
  }

  return (
    <CalismaAlani
      veri={veri}
      izleyici={{
        viewerId: ben.id,
        studentId: ogrenciId,
        isStudent: false,
        isAdvisor: true,
      }}
      planAraclari={<TopluEkle workspaceId={veri.workspace.id} />}
    />
  );
}
