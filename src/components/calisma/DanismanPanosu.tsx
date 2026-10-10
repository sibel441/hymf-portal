'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { PanoSatiri } from '@/types/database';
import { KADRO_KISA } from '@/lib/etiketler';
import { kisaAd } from '@/lib/etiketler';
import { goreliZaman, gecenGun, tarihSaat } from '@/lib/zaman';
import { BosDurum } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface DanismanPanosuProps {
  satirlar: PanoSatiri[];
}

export function DanismanPanosu({ satirlar }: DanismanPanosuProps) {
  // Benzersiz kadrolar bul (yalnız öğrencilerin kadroları)
  const uniqueKadrolar = useMemo(() => {
    const kadros = new Set<string>();
    satirlar.forEach((row) => {
      if (row.student.kadro) {
        kadros.add(row.student.kadro);
      }
    });
    // Sıra: yuksek_lisans "YL", doktora "DR", lisans "Lisans", gelistirici "Geliştirici"
    const order = ['yuksek_lisans', 'doktora', 'lisans', 'gelistirici'];
    return Array.from(kadros).sort((a, b) => {
      const aIdx = order.indexOf(a);
      const bIdx = order.indexOf(b);
      return (aIdx === -1 ? Infinity : aIdx) - (bIdx === -1 ? Infinity : bIdx);
    });
  }, [satirlar]);

  // Filter state: varsayılan hepsi açık
  const [acikKadrolar, setAcikKadrolar] = useState<Set<string>>(new Set(uniqueKadrolar));

  // Filtrelenmiş satırlar
  const filteredRows = useMemo(() => {
    return satirlar.filter((row) => row.student.kadro && acikKadrolar.has(row.student.kadro));
  }, [satirlar, acikKadrolar]);

  // Özet istatistikleri
  const toplamOgrenci = filteredRows.length;
  const gecikmisSayisi = filteredRows.filter((row) => row.gecikmis > 0).length;

  // Toggle kadro filtresi
  const toggleKadro = (kadro: string) => {
    const yeni = new Set(acikKadrolar);
    if (yeni.has(kadro)) {
      yeni.delete(kadro);
    } else {
      yeni.add(kadro);
    }
    setAcikKadrolar(yeni);
  };

  // Boş sonuç durumu
  if (filteredRows.length === 0) {
    return (
      <div className="space-y-8">
        {uniqueKadrolar.length > 1 && (
          <div role="group" aria-label="Programa göre süz" className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-ink-2">Program</span>
            {uniqueKadrolar.map((kadro) => (
              <button
                key={kadro}
                aria-pressed={acikKadrolar.has(kadro)}
                onClick={() => toggleKadro(kadro)}
                className={cn(
                  'rounded-md h-8 px-3 text-sm font-medium transition-colors',
                  acikKadrolar.has(kadro)
                    ? 'bg-primary text-on-primary'
                    : 'border border-line-strong text-ink-2 hover:bg-sunken',
                )}
              >
                {KADRO_KISA[kadro as keyof typeof KADRO_KISA] || kadro}
              </button>
            ))}
          </div>
        )}
        <BosDurum baslik="Bu filtrede öğrenci yok." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtre düğmeleri (yalnız bir kadroya fazlası varsa göster) */}
      {uniqueKadrolar.length > 1 && (
        <div role="group" aria-label="Programa göre süz" className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-ink-2">Program</span>
          {uniqueKadrolar.map((kadro) => (
            <button
              key={kadro}
              aria-pressed={acikKadrolar.has(kadro)}
              onClick={() => toggleKadro(kadro)}
              className={cn(
                'rounded-md h-8 px-3 text-sm font-medium transition-colors',
                acikKadrolar.has(kadro)
                  ? 'bg-primary text-on-primary'
                  : 'border border-line-strong text-ink-2 hover:bg-sunken',
              )}
            >
              {KADRO_KISA[kadro as keyof typeof KADRO_KISA] || kadro}
            </button>
          ))}
        </div>
      )}

      {/* Özet satırı */}
      <div className="text-sm text-ink-2">
        {toplamOgrenci} öğrenci
        {gecikmisSayisi > 0 && (
          <>
            , <span className="text-warn font-medium">{gecikmisSayisi} öğrencide gecikmiş madde var</span>
          </>
        )}
      </div>

      {/* Masaüstü Tablo (md ve üstü) */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-sunken text-ink-2 font-medium">
            <tr>
              <th className="px-4 py-3 text-left">Öğrenci</th>
              <th className="px-4 py-3 text-left">Program</th>
              <th className="px-4 py-3 text-left">Danışman</th>
              <th className="px-4 py-3 text-right">Açık</th>
              <th className="px-4 py-3 text-right">Gecikmiş</th>
              <th className="px-4 py-3 text-left">İlerleme</th>
              <th className="px-4 py-3 text-left">Son güncelleme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredRows.map((row) => (
              <tr key={row.student.id} className="hover:bg-sunken/60">
                <td className="px-4 py-3 relative">
                  <Link
                    href={`/calisma-alani/${row.student.id}`}
                    className="font-medium text-ink hover:text-link"
                  >
                    {row.student.full_name}
                    <span className="absolute inset-0" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink">
                  {row.student.kadro ? KADRO_KISA[row.student.kadro as keyof typeof KADRO_KISA] : '-'}
                </td>
                <td className="px-4 py-3 text-ink">
                  {row.advisors.length > 0 ? row.advisors.map((a) => kisaAd(a.full_name)).join(', ') : '-'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-ink">{row.acik}</td>
                <td
                  className={cn(
                    'px-4 py-3 text-right tabular-nums',
                    row.gecikmis > 0 ? 'text-warn font-medium' : 'text-ink',
                  )}
                >
                  {row.gecikmis}
                </td>
                <td className="px-4 py-3 text-ink">
                  {row.ilerleme === null ? (
                    <span className="text-ink-3">Madde yok</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-sunken">
                        <div
                          className="h-1.5 rounded-full bg-ink-2"
                          style={{ width: `${row.ilerleme}%` }}
                          role="img"
                          aria-label={`%${row.ilerleme} ilerleme`}
                        />
                      </div>
                      <span className="tabular-nums">%{row.ilerleme}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.son_guncelleme === null ? (
                    <span className="text-ink-3">Henüz yok</span>
                  ) : (
                    <span
                      className={cn(
                        'text-sm',
                        gecenGun(row.son_guncelleme) !== null && gecenGun(row.son_guncelleme)! > 7
                          ? 'text-warn'
                          : 'text-ink-2',
                      )}
                      title={tarihSaat(row.son_guncelleme)}
                      suppressHydrationWarning
                    >
                      {goreliZaman(row.son_guncelleme)}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil Liste (md altında) */}
      <div className="md:hidden">
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {filteredRows.map((row) => (
            <li key={row.student.id}>
              <Link
                href={`/calisma-alani/${row.student.id}`}
                className="block px-4 py-3 hover:bg-sunken"
              >
                <div className="font-medium text-ink">{row.student.full_name}</div>
                <div className="text-sm text-ink-2 mt-1">
                  {row.student.kadro ? KADRO_KISA[row.student.kadro as keyof typeof KADRO_KISA] : '-'}
                </div>
                <div className="text-sm text-ink-2 mt-2">
                  <span className="tabular-nums">{row.acik} açık</span>
                  {', '}
                  <span className={cn('tabular-nums', row.gecikmis > 0 && 'text-warn font-medium')}>
                    {row.gecikmis} gecikmiş
                  </span>
                  {row.ilerleme !== null && (
                    <>
                      {', %'}
                      <span className="tabular-nums">{row.ilerleme}</span>
                    </>
                  )}
                </div>
                {row.son_guncelleme && (
                  <div
                    className={cn(
                      'text-sm mt-2',
                      gecenGun(row.son_guncelleme) !== null && gecenGun(row.son_guncelleme)! > 7
                        ? 'text-warn'
                        : 'text-ink-2',
                    )}
                    title={tarihSaat(row.son_guncelleme)}
                    suppressHydrationWarning
                  >
                    {goreliZaman(row.son_guncelleme)}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
