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
    <div className="min-h-screen flex items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-line rounded-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="font-serif text-2xl mb-2">
              {isPassive ? 'Hesabınız pasif' : 'Hesabınız onay bekliyor'}
            </h1>
          </div>

          <div className="space-y-4 text-center">
            {isPassive ? (
              <>
                <p className="text-ink-2">Erişim için grup yöneticisiyle görüşün.</p>
              </>
            ) : (
              <>
                <p className="text-ink-2">
                  Bir yönetici hesabınızı onayladığında portalın tamamını kullanabilirsiniz. Onaylandıktan sonra bu sayfayı yenileyin.
                </p>
              </>
            )}
            <p className="text-sm text-ink-3 border-t border-line pt-4">
              {profil.email}
            </p>
          </div>

          <CikisButonu />
        </div>
      </div>
    </div>
  );
}
