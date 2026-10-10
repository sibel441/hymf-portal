import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { requireMember } from '@/lib/auth/dal';
import { listMembers, listAdvisorsByStudent } from '@/lib/data/profiles';
import { SayfaBasligi, Uyari } from '@/components/ui';
import UyeListesi from './UyeListesi';

export default async function UyelerPage() {
  await requireMember();
  const sb = await createClient();

  const [uyelerSonuc, danismanlarSonuc] = await Promise.all([
    listMembers(sb),
    listAdvisorsByStudent(sb),
  ]);

  if (uyelerSonuc.error) {
    return <Uyari tone="tehlike">{uyelerSonuc.error}</Uyari>;
  }

  return (
    <div className="space-y-8">
      <SayfaBasligi
        baslik="Üyeler"
        aciklama="Hesaplamalı Yoğun Madde Fiziği grubunun portal üyeleri."
      />
      <UyeListesi uyeler={uyelerSonuc.data ?? []} danismanlar={danismanlarSonuc.data ?? {}} />
    </div>
  );
}
