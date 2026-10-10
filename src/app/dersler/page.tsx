import { requireMember } from '@/lib/auth/dal';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, isHoca } from '@/lib/yetki';
import { Uyari } from '@/components/ui';
import { DerslerIstemci } from './DerslerIstemci';

export default async function Page() {
  const ben = await requireMember();
  const sb = await createClient();

  const [dersSonuc, hocaSonuc] = await Promise.all([
    sb
      .from('courses')
      .select('*, instructor:profiles(id, full_name, academic_title, kadro, yetki), materials:course_materials(*)')
      .order('code'),
    sb
      .from('profiles')
      .select('id, full_name, academic_title')
      .eq('kadro', 'hoca')
      .eq('is_approved', true)
      .eq('is_active', true)
      .order('full_name'),
  ]);

  if (dersSonuc.error || hocaSonuc.error) {
    return <Uyari tone="tehlike">Dersler yüklenemedi. Sayfayı yenileyin.</Uyari>;
  }

  const yonetebilir = isHoca(ben) || isAdmin(ben);

  return (
    <DerslerIstemci
      kayitlar={dersSonuc.data ?? []}
      hocalar={hocaSonuc.data ?? []}
      benId={ben.id}
      yonetebilir={yonetebilir}
    />
  );
}
