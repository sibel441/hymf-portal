import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMevcutProfil } from '@/lib/auth/dal';
import { listMembers } from '@/lib/data/profiles';
import { getDanismanPanosu } from '@/lib/data/workspaces';
import { isHoca, isMember } from '@/lib/yetki';
import { KADRO_ETIKETI } from '@/lib/etiketler';
import { gecenGun } from '@/lib/zaman';
import { buttonClass } from '@/components/ui';
import type { Kadro, PanoSatiri, Profile } from '@/types/database';

const kaynaklar = [
  { href: '/kilavuzlar', baslik: 'TRUBA ve VASP kılavuzları', aciklama: 'Kümeye bağlanma, iş gönderme ve VASP girdi dosyaları.' },
  { href: '/formlar', baslik: 'Enstitü formları', aciklama: 'Tez önerisi, izleme ve savunma süreçleri için resmî formlar.' },
  { href: '/kaynaklar', baslik: 'Kaynaklar', aciklama: 'Kitaplar, makaleler, veritabanları ve hesaplama betikleri.' },
  { href: '/dersler', baslik: 'Dersler', aciklama: 'Lisansüstü derslerin haftalık notları ve slaytları.' },
  { href: '/toplantilar', baslik: 'Toplantılar', aciklama: 'Grup toplantısı notları ve seminer sunumları.' },
  { href: '/duyurular', baslik: 'Duyurular', aciklama: 'Grubun ortak duyuru akışı.' },
];

const KADRO_SIRASI: Kadro[] = ['hoca', 'doktora', 'yuksek_lisans', 'lisans', 'gelistirici'];

function panoOzeti(satirlar: PanoSatiri[]) {
  const gecikmeli = satirlar.filter((s) => s.gecikmis > 0).length;
  const sessiz = satirlar.filter((s) => {
    const gun = gecenGun(s.son_guncelleme);
    return gun === null || gun > 7;
  }).length;
  return { toplam: satirlar.length, gecikmeli, sessiz };
}

export default async function HomePage() {
  const ben = await getMevcutProfil();
  const uye = isMember(ben);

  let uyeler: Profile[] = [];
  let pano: ReturnType<typeof panoOzeti> | null = null;
  if (uye && ben) {
    const sb = await createClient();
    const [uyeSonucu, panoSonucu] = await Promise.all([
      listMembers(sb),
      isHoca(ben) ? getDanismanPanosu(sb, ben.id) : Promise.resolve(null),
    ]);
    uyeler = uyeSonucu.data ?? [];
    if (panoSonucu?.data && panoSonucu.data.length > 0) pano = panoOzeti(panoSonucu.data);
  }

  const kadroGruplari = KADRO_SIRASI.map((k) => ({ kadro: k, kisiler: uyeler.filter((u) => u.kadro === k) })).filter(
    (g) => g.kisiler.length > 0
  );

  return (
    <div className="space-y-14">
      <section className="max-w-3xl pt-4">
        <p className="text-base text-ink-2">Ankara Üniversitesi</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ink sm:text-5xl">Hesaplamalı Yoğun Madde Fiziği Grubu</h1>
        <p className="mt-5 max-w-prose text-lg leading-8 text-ink-2">
          Yoğunluk fonksiyoneli teorisi, moleküler dinamik ve elektronik yapı hesapları üzerine çalışan grubun iç
          portalı. Tez planları, kılavuzlar ve ortak kaynaklar burada.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {uye && ben ? (
            <>
              <Link href="/calisma-alani" className={buttonClass({ variant: 'primary' })}>
                {isHoca(ben) ? 'Öğrencilerim' : 'Çalışma alanım'}
              </Link>
              <Link href="/kilavuzlar" className={buttonClass({ variant: 'secondary' })}>
                TRUBA ve VASP kılavuzları
              </Link>
            </>
          ) : ben ? (
            <Link href="/onay-bekleniyor" className={buttonClass({ variant: 'primary' })}>
              Hesap durumunu gör
            </Link>
          ) : (
            <Link href="/giris" className={buttonClass({ variant: 'primary' })}>
              Giriş yap
            </Link>
          )}
        </div>
        {!ben && (
          <p className="mt-4 text-sm text-ink-3">
            Portal grup üyelerine açıktır. Hesaplar grup yöneticileri tarafından açılır.
          </p>
        )}
      </section>

      {pano && (
        <section aria-labelledby="ana-ogrencilerim" className="border-t border-line pt-8">
          <h2 id="ana-ogrencilerim" className="font-serif text-2xl text-ink">
            Öğrencileriniz
          </h2>
          <dl className="mt-5 grid max-w-2xl grid-cols-3 gap-6">
            <div>
              <dt className="text-sm text-ink-2">Öğrenci</dt>
              <dd className="mt-1 font-serif text-4xl tabular-nums text-ink">{pano.toplam}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">Gecikmiş maddesi olan</dt>
              <dd className={`mt-1 font-serif text-4xl tabular-nums ${pano.gecikmeli > 0 ? 'text-warn' : 'text-ink'}`}>
                {pano.gecikmeli}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-2">Bir haftadır yazmayan</dt>
              <dd className={`mt-1 font-serif text-4xl tabular-nums ${pano.sessiz > 0 ? 'text-warn' : 'text-ink'}`}>
                {pano.sessiz}
              </dd>
            </div>
          </dl>
          <Link href="/calisma-alani" className="mt-6 inline-block text-sm text-link underline">
            Öğrencilerin plan durumuna git
          </Link>
        </section>
      )}

      {uye && (
        <section aria-labelledby="ana-kaynaklar" className="border-t border-line pt-8">
          <h2 id="ana-kaynaklar" className="font-serif text-2xl text-ink">
            Grup kaynakları
          </h2>
          <ul className="mt-5 grid gap-x-10 sm:grid-cols-2">
            {kaynaklar.map((k) => (
              <li key={k.href} className="border-t border-line">
                <Link href={k.href} className="group block py-4">
                  <span className="text-base font-medium text-ink group-hover:underline">{k.baslik}</span>
                  <span className="mt-1 block text-sm text-ink-2">{k.aciklama}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {kadroGruplari.length > 0 && (
        <section aria-labelledby="ana-uyeler" className="border-t border-line pt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="ana-uyeler" className="font-serif text-2xl text-ink">
              Grup
            </h2>
            <Link href="/uyeler" className="text-sm text-link underline">
              Tüm üyeler
            </Link>
          </div>
          <dl className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {kadroGruplari.map((g) => (
              <div key={g.kadro}>
                <dt className="text-sm text-ink-2">
                  {KADRO_ETIKETI[g.kadro]} <span className="tabular-nums text-ink-3">({g.kisiler.length})</span>
                </dt>
                <dd className="mt-2 text-base leading-7 text-ink">
                  {g.kisiler.map((k) => [k.academic_title, k.full_name].filter(Boolean).join(' ')).join(', ')}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
