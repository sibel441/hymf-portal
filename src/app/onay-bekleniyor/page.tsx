import { redirect } from 'next/navigation';
import { getMevcutProfil } from '@/lib/auth/dal';
import { CikisButonu } from './CikisButonu';

export default async function OnayBekleniyor() {
  const profil = await getMevcutProfil();

  if (!profil) {
    redirect('/giris');
  }

  if (profil.is_approved && profil.is_active) {
    redirect('/');
  }

  const isPassive = !profil.is_active;

  return (
    <div className="mx-auto max-w-prose py-4 sm:py-10">
      <h1 className="font-serif text-2xl text-ink sm:text-4xl">
        {isPassive ? 'Hesabınız pasif' : 'Hesabınız onay bekliyor'}
      </h1>
      <p className="mt-3 text-base text-ink-2">
        {isPassive
          ? 'Erişim için grup yöneticisiyle görüşün.'
          : 'Bir yönetici hesabınızı onayladığında portalın tamamını kullanabilirsiniz. Onaylandıktan sonra bu sayfayı yenileyin.'}
      </p>
      <p className="mt-6 text-sm text-ink-3">Oturum: {profil.email}</p>
      <div className="mt-6 max-w-40">
        <CikisButonu />
      </div>
    </div>
  );
}
