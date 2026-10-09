import 'server-only';

import { requireMember } from '@/lib/auth/dal';
import { SayfaBasligi } from '@/components/ui';
import { KADRO_ETIKETI, YETKI_ETIKETI } from '@/lib/etiketler';
import ProfilFormu from './ProfilFormu';

export default async function ProfilPage() {
  const ben = await requireMember();

  return (
    <div className="space-y-8">
      <SayfaBasligi
        baslik="Profilim"
        aciklama="Üyeler sayfasında görünen bilgileriniz."
      />

      {/* Özet bilgiler */}
      <dl className="grid gap-4 sm:grid-cols-2 rounded-lg border border-line bg-surface p-5 text-sm sm:p-6">
        <div>
          <dt className="font-medium text-ink-2">E-posta</dt>
          <dd className="mt-1 text-ink">{ben.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-2">Kadro</dt>
          <dd className="mt-1 text-ink">
            {ben.kadro ? KADRO_ETIKETI[ben.kadro] : 'Belirlenmedi'}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink-2">Yetki</dt>
          <dd className="mt-1 text-ink">{YETKI_ETIKETI[ben.yetki]}</dd>
        </div>
      </dl>

      <p className="text-sm text-ink-3">
        Kadro ve yetki değişiklikleri için grup yöneticisine yazın.
      </p>

      <ProfilFormu profil={ben} />
    </div>
  );
}
