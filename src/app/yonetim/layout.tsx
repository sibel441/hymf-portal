import React from 'react';
import { getMevcutProfil } from '@/lib/auth/dal';
import { isSuperadmin } from '@/lib/yetki';
import { SayfaBasligi, Sekmeler } from '@/components/ui';

const sekmeler = [
  { href: '/yonetim', etiket: 'Üyeler' },
  { href: '/yonetim/davetler', etiket: 'Davet listesi' },
  { href: '/yonetim/yetkiler', etiket: 'Yetkiler' },
  { href: '/yonetim/gecmis', etiket: 'İşlem geçmişi' },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const ben = await getMevcutProfil();
  const superadmin = isSuperadmin(ben);

  // Yetkiler sekmesini superadmin değilse gizle
  const gorunenSekmeler = superadmin ? sekmeler : sekmeler.filter((s) => s.href !== '/yonetim/yetkiler');

  return (
    <div className="space-y-6">
      <SayfaBasligi baslik="Yönetim" />
      <Sekmeler sekmeler={gorunenSekmeler} />
      {children}
    </div>
  );
}
