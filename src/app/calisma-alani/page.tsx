import Link from 'next/link';
import { SayfaBasligi, BosDurum, Uyari, buttonClass } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/auth/dal';
import { isHoca, isAdmin } from '@/lib/yetki';
import { getDanismanPanosu, getCalismaAlaniVerisi } from '@/lib/data/workspaces';
import { CalismaAlani } from '@/components/calisma/CalismaAlani';
import { DanismanPanosu } from '@/components/calisma/DanismanPanosu';

export default async function CalismaAlaniPage() {
  const ben = await requireMember();
  const sb = await createClient();

  if (isHoca(ben)) {
    // Danışman görünümü: panoyu göster
    const sonuc = await getDanismanPanosu(sb, ben.id);

    if (sonuc.error) {
      return (
        <div className="space-y-8">
          <SayfaBasligi baslik="Öğrencilerim" />
          <Uyari tone="tehlike">{sonuc.error}</Uyari>
        </div>
      );
    }

    const satirlar = sonuc.data ?? [];

    if (satirlar.length === 0) {
      return (
        <div className="space-y-8">
          <SayfaBasligi baslik="Çalışma alanı" />
          <BosDurum
            baslik="Henüz danışmanı olduğunuz öğrenci yok."
            aciklama="Öğrenci ataması yönetim panelinden yapılır."
            eylem={
              isAdmin(ben) ? (
                <Link href="/yonetim" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                  Yönetim paneline git
                </Link>
              ) : undefined
            }
          />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <SayfaBasligi baslik="Öğrencilerim" aciklama="Danışmanı olduğunuz öğrencilerin plan durumu." />
        <DanismanPanosu satirlar={satirlar} />
      </div>
    );
  }

  // Öğrenci görünümü: kendi çalışma alanını göster
  const sonuc = await getCalismaAlaniVerisi(sb, ben.id);

  if (sonuc.error) {
    return (
      <div className="space-y-8">
        <SayfaBasligi baslik="Çalışma alanı" />
        <Uyari tone="tehlike">{sonuc.error}</Uyari>
      </div>
    );
  }

  const veri = sonuc.data;

  if (!veri) {
    return (
      <div className="space-y-8">
        <SayfaBasligi baslik="Çalışma alanı" />
        <BosDurum
          baslik="Çalışma alanınız henüz açılmadı."
          aciklama="Danışmanınız atandığında çalışma alanınız açılır. Sorun olursa grup yöneticisine yazın."
        />
      </div>
    );
  }

  return (
    <CalismaAlani
      veri={veri}
      izleyici={{
        viewerId: ben.id,
        studentId: ben.id,
        isStudent: true,
        isAdvisor: false,
      }}
    />
  );
}
