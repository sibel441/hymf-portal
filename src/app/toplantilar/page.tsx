import { requireMember } from '@/lib/auth/dal';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, isHoca } from '@/lib/yetki';
import { Uyari } from '@/components/ui';
import { ToplantilarIstemci, type ToplantiKaydi } from './ToplantilarIstemci';

export default async function Page() {
  const ben = await requireMember();

  const sb = await createClient();
  const { data, error } = await sb
    .from('meetings')
    .select('*, creator:profiles(id, full_name, academic_title, kadro, yetki)')
    .order('meeting_date', { ascending: true });

  if (error) {
    return <Uyari tone="tehlike">Toplantılar yüklenemedi. Sayfayı yenileyin.</Uyari>;
  }

  const yonetebilir = isHoca(ben) || isAdmin(ben);

  return (
    <ToplantilarIstemci
      kayitlar={(data ?? []) as ToplantiKaydi[]}
      simdi={new Date().toISOString()}
      benId={ben.id}
      yonetebilir={yonetebilir}
    />
  );
}
