'use client';

import React, { useMemo, useState } from 'react';
import type { Profile, ProfileSummary } from '@/types/database';
import { kisaAd } from '@/lib/etiketler';
import { Alan, BasHarfAvatar, BosDurum, YetkiRozeti, inputSinifi } from '@/components/ui';

interface UyeListesiProps {
  uyeler: Profile[];
  danismanlar: Record<string, ProfileSummary[]>;
}

export default function UyeListesi({ uyeler, danismanlar }: UyeListesiProps) {
  const [arama, setArama] = useState('');

  const filtrelenmisUyeler = useMemo(() => {
    if (!arama.trim()) return uyeler;

    const q = arama.toLowerCase();
    return uyeler.filter((u) => {
      const adEslesti = u.full_name.toLowerCase().includes(q);
      const unvanEslesti = u.academic_title?.toLowerCase().includes(q) ?? false;
      const konularEslesti = u.research_topics.some((t) => t.toLowerCase().includes(q));
      return adEslesti || unvanEslesti || konularEslesti;
    });
  }, [uyeler, arama]);

  const gruplarbas: Record<string, Profile[]> = useMemo(() => {
    const g: Record<string, Profile[]> = {
      hoca: [],
      doktora: [],
      yuksek_lisans: [],
      lisans: [],
      gelistirici: [],
    };

    filtrelenmisUyeler.forEach((u) => {
      if (u.kadro && u.kadro in g) {
        g[u.kadro].push(u);
      }
    });

    return g;
  }, [filtrelenmisUyeler]);

  return (
    <div className="space-y-8">
      <Alan etiket="Ara" htmlFor="ara-alani">
        <input
          id="ara-alani"
          type="text"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ad, unvan veya araştırma konusu"
          className={inputSinifi}
        />
      </Alan>

      {filtrelenmisUyeler.length === 0 ? (
        <BosDurum baslik="Aramanızla eşleşen üye yok." />
      ) : (
        <div className="space-y-10">
          {/* Öğretim üyeleri */}
          {gruplarbas.hoca.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl text-ink mb-4">Öğretim üyeleri</h2>
              <ul className="grid gap-x-8 sm:grid-cols-2 divide-y divide-line border-t border-line">
                {gruplarbas.hoca.map((uye) => (
                  <MemberRow key={uye.id} uye={uye} danismanlar={danismanlar} />
                ))}
              </ul>
            </section>
          )}

          {/* Doktora */}
          {gruplarbas.doktora.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl text-ink mb-4">Doktora</h2>
              <ul className="grid gap-x-8 sm:grid-cols-2 divide-y divide-line border-t border-line">
                {gruplarbas.doktora.map((uye) => (
                  <MemberRow key={uye.id} uye={uye} danismanlar={danismanlar} />
                ))}
              </ul>
            </section>
          )}

          {/* Yüksek lisans */}
          {gruplarbas.yuksek_lisans.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl text-ink mb-4">Yüksek lisans</h2>
              <ul className="grid gap-x-8 sm:grid-cols-2 divide-y divide-line border-t border-line">
                {gruplarbas.yuksek_lisans.map((uye) => (
                  <MemberRow key={uye.id} uye={uye} danismanlar={danismanlar} />
                ))}
              </ul>
            </section>
          )}

          {/* Lisans */}
          {gruplarbas.lisans.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl text-ink mb-4">Lisans</h2>
              <ul className="grid gap-x-8 sm:grid-cols-2 divide-y divide-line border-t border-line">
                {gruplarbas.lisans.map((uye) => (
                  <MemberRow key={uye.id} uye={uye} danismanlar={danismanlar} />
                ))}
              </ul>
            </section>
          )}

          {/* Geliştirici */}
          {gruplarbas.gelistirici.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl text-ink mb-4">Geliştirici</h2>
              <ul className="grid gap-x-8 sm:grid-cols-2 divide-y divide-line border-t border-line">
                {gruplarbas.gelistirici.map((uye) => (
                  <MemberRow key={uye.id} uye={uye} danismanlar={danismanlar} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function MemberRow({
  uye,
  danismanlar,
}: {
  uye: Profile;
  danismanlar: Record<string, ProfileSummary[]>;
}) {
  const uyeDanismanlar = danismanlar[uye.id] || [];
  const orcidGecerli = uye.orcid && /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(uye.orcid);

  return (
    <li className="border-line py-4">
      <div className="flex gap-3">
        <BasHarfAvatar ad={uye.full_name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            {uye.academic_title && (
              <span className="text-sm text-ink-2">{uye.academic_title}</span>
            )}
            <p className="font-medium text-ink">{uye.full_name}</p>
            <YetkiRozeti yetki={uye.yetki} />
          </div>

          {uye.department && (
            <p className="text-sm text-ink-3 mt-1">{uye.department}</p>
          )}

          {uyeDanismanlar.length > 0 && (
            <p className="text-sm text-ink-2 mt-1">
              Danışman: {uyeDanismanlar.map((d) => kisaAd(d.full_name)).join(', ')}
            </p>
          )}

          {uye.research_topics.length > 0 && (
            <p className="text-sm text-ink-2 mt-1">
              {uye.research_topics.join(', ')}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-2">
            <a href={`mailto:${uye.email}`} className="text-sm text-link hover:underline">
              {uye.email}
            </a>

            {uye.scholar_url && /^https?:\/\//.test(uye.scholar_url) && (
              <a
                href={uye.scholar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-link hover:underline"
              >
                Google Scholar
              </a>
            )}

            {orcidGecerli && (
              <a
                href={`https://orcid.org/${uye.orcid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-link hover:underline"
              >
                ORCID
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
