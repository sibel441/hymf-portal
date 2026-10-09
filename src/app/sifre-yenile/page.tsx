import { redirect } from 'next/navigation';
import { getOturumKullanicisi } from '@/lib/auth/dal';
import { SifreYenileFormu } from './SifreYenileFormu';

export default async function SifreYenilePage() {
  const kullanici = await getOturumKullanicisi();

  if (!kullanici) {
    redirect('/giris');
  }

  return (
    <div className="mx-auto max-w-sm py-4 sm:py-10">
      <h1 className="font-serif text-2xl text-ink sm:text-4xl">Yeni şifre belirleyin</h1>
      <p className="mt-2 text-base text-ink-2">En az 8 karakter.</p>
      <div className="mt-8">
        <SifreYenileFormu />
      </div>
    </div>
  );
}
