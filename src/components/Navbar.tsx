'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { DEMO_MODU } from '@/lib/demo';
import { isMember } from '@/lib/yetki';
import { KADRO_ETIKETI } from '@/lib/etiketler';
import { cn } from '@/lib/cn';
import { BasHarfAvatar, YetkiRozeti, buttonClass } from '@/components/ui';

const genelBaglantilar = [
  { href: '/kilavuzlar', etiket: 'Kılavuzlar' },
  { href: '/formlar', etiket: 'Formlar' },
  { href: '/duyurular', etiket: 'Duyurular' },
  { href: '/kaynaklar', etiket: 'Kaynaklar' },
  { href: '/dersler', etiket: 'Dersler' },
  { href: '/toplantilar', etiket: 'Toplantılar' },
  { href: '/uyeler', etiket: 'Üyeler' },
];

function aktifMi(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

/** Dışarı tıklanınca veya Escape'e basılınca kapanan açılır menü durumu. */
function useAcilir() {
  const [acik, setAcik] = useState(false);
  const kap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!acik) return;
    const disTik = (e: MouseEvent) => {
      if (kap.current && !kap.current.contains(e.target as Node)) setAcik(false);
    };
    const tus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAcik(false);
    };
    document.addEventListener('mousedown', disTik);
    document.addEventListener('keydown', tus);
    return () => {
      document.removeEventListener('mousedown', disTik);
      document.removeEventListener('keydown', tus);
    };
  }, [acik]);
  return { acik, setAcik, kap };
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoading, isAdmin, isHoca, loginAs, logout } = useAuth();
  const [mobilAcik, setMobilAcik] = useState(false);
  const { acik: kullaniciAcik, setAcik: setKullaniciAcik, kap: kullaniciKap } = useAcilir();
  const { acik: demoAcik, setAcik: setDemoAcik, kap: demoKap } = useAcilir();

  // Sayfa değişince menüler kapanır (render sırasında, önceki yolla karşılaştırarak).
  const [oncekiYol, setOncekiYol] = useState(pathname);
  if (pathname !== oncekiYol) {
    setOncekiYol(pathname);
    setMobilAcik(false);
    setKullaniciAcik(false);
  }

  const uye = isMember(profile);
  const ozelBaglantilar = uye
    ? [
        { href: '/calisma-alani', etiket: isHoca ? 'Öğrencilerim' : 'Çalışma alanım' },
        ...(isAdmin ? [{ href: '/yonetim', etiket: 'Yönetim' }] : []),
      ]
    : [];
  // Girişsiz ziyaretçi yalnız ana sayfayı görür; içerik sayfalarının bağlantıları üyelere gösterilir.
  const uyeBaglantilari = uye ? genelBaglantilar : [];

  async function cikis() {
    setKullaniciAcik(false);
    await logout();
    router.replace('/');
  }

  const baglantiSinifi = (href: string) =>
    cn(
      '-mb-px flex h-14 items-center border-b-2 px-2.5 text-sm transition-colors',
      aktifMi(pathname, href) ? 'border-ink font-medium text-ink' : 'border-transparent text-ink-2 hover:text-ink'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      {DEMO_MODU && (
        <div className="border-b border-line bg-warn-soft text-sm text-warn">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 sm:px-6">
            <span>Demo modu açık: bu oturumdaki kişiler ve veriler örnektir.</span>
            <div className="relative" ref={demoKap}>
              <button
                type="button"
                onClick={() => setDemoAcik(!demoAcik)}
                aria-expanded={demoAcik}
                className="underline underline-offset-2"
              >
                Örnek kişi seç
              </button>
              {demoAcik && (
                <ul className="absolute right-0 z-50 mt-2 w-64 rounded-md border border-line bg-surface p-1 text-ink shadow-lg">
                  {INITIAL_PROFILES.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          loginAs(p.id);
                          setDemoAcik(false);
                        }}
                        className={cn(
                          'flex w-full flex-col items-start rounded px-3 py-2 text-left hover:bg-sunken',
                          profile?.id === p.id && 'bg-sunken'
                        )}
                      >
                        <span className="text-sm">{p.full_name}</span>
                        <span className="text-sm text-ink-3">{p.kadro ? KADRO_ETIKETI[p.kadro] : ''}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-baseline gap-2 text-ink">
          <span className="font-serif text-2xl leading-none" aria-hidden="true">
            Ψ
          </span>
          <span className="font-serif text-lg leading-none">HYMF Portal</span>
        </Link>

        <nav aria-label="Ana menü" className="hidden min-w-0 flex-1 items-center lg:flex">
          {uyeBaglantilari.map((b) => (
            <Link key={b.href} href={b.href} className={baglantiSinifi(b.href)} aria-current={aktifMi(pathname, b.href) ? 'page' : undefined}>
              {b.etiket}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <div className="hidden items-center lg:flex">
            {ozelBaglantilar.map((b) => (
              <Link key={b.href} href={b.href} className={baglantiSinifi(b.href)} aria-current={aktifMi(pathname, b.href) ? 'page' : undefined}>
                {b.etiket}
              </Link>
            ))}
          </div>

          {isLoading ? (
            <span className="size-9" aria-hidden="true" />
          ) : profile ? (
            <div className="relative ml-2" ref={kullaniciKap}>
              <button
                type="button"
                onClick={() => setKullaniciAcik(!kullaniciAcik)}
                aria-expanded={kullaniciAcik}
                aria-haspopup="menu"
                aria-label="Hesap menüsü"
                className="rounded-full"
              >
                <BasHarfAvatar ad={profile.full_name} size="md" />
              </button>
              {kullaniciAcik && (
                <div role="menu" className="absolute right-0 z-50 mt-2 w-64 rounded-md border border-line bg-surface p-1 shadow-lg">
                  <div className="space-y-1 px-3 py-2">
                    <p className="text-sm font-medium text-ink">{profile.full_name}</p>
                    <p className="truncate text-sm text-ink-3">{profile.email}</p>
                    <YetkiRozeti yetki={profile.yetki} />
                  </div>
                  <div className="my-1 border-t border-line" />
                  <Link role="menuitem" href="/profil" className="block rounded px-3 py-2 text-sm text-ink-2 hover:bg-sunken hover:text-ink">
                    Profilim
                  </Link>
                  <button role="menuitem" type="button" onClick={cikis} className="block w-full rounded px-3 py-2 text-left text-sm text-ink-2 hover:bg-sunken hover:text-ink">
                    Çıkış yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link href="/giris" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                Giriş yap
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobilAcik(!mobilAcik)}
            aria-expanded={mobilAcik}
            aria-controls="mobil-menu"
            aria-label={mobilAcik ? 'Menüyü kapat' : 'Menüyü aç'}
            className="ml-1 rounded-md p-2 text-ink-2 hover:bg-sunken hover:text-ink lg:hidden"
          >
            {mobilAcik ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobilAcik && (
        <nav id="mobil-menu" aria-label="Ana menü" className="border-t border-line lg:hidden">
          <ul className="mx-auto max-w-6xl px-2 py-2">
            {[...ozelBaglantilar, ...uyeBaglantilari].map((b) => (
              <li key={b.href}>
                <Link
                  href={b.href}
                  aria-current={aktifMi(pathname, b.href) ? 'page' : undefined}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-base',
                    aktifMi(pathname, b.href) ? 'bg-sunken font-medium text-ink' : 'text-ink-2 hover:bg-sunken hover:text-ink'
                  )}
                >
                  {b.etiket}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
