import { redirect } from 'next/navigation';
import { getOturumKullanicisi } from '@/lib/auth/dal';
import { SifreYenileFormu } from './SifreYenileFormu';

export default async function SifreYenilePage() {
  const kullanici = await getOturumKullanicisi();

  if (!kullanici) {
    redirect('/giris');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl mb-2">Şifrenizi Yenileyin</h1>
          <p className="text-ink-3 text-sm">Yeni bir şifre belirleyin</p>
        </div>
        <SifreYenileFormu />
      </div>
    </div>
  );
}
