'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateOwnProfile } from '@/lib/data/profiles';
import type { Profile, ProfileSelfUpdate } from '@/types/database';
import { Alan, Panel, Button, Uyari, inputSinifi, textareaSinifi, selectSinifi } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

interface ProfilFormuProps {
  profil: Profile;
}

export default function ProfilFormu({ profil }: ProfilFormuProps) {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [ad, setAd] = useState(profil.full_name);
  const [unvan, setUnvan] = useState(profil.academic_title ?? '');
  const [bolum, setBolum] = useState(profil.department ?? '');
  const [konular, setKonular] = useState(profil.research_topics.join(', '));
  const [scholar, setScholar] = useState(profil.scholar_url ?? '');
  const [orcid, setOrcid] = useState(profil.orcid ?? '');

  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setBasarili(false);
    setYukleniyor(true);

    // Validations
    if (!ad.trim() || ad.trim().length < 2 || ad.trim().length > 120) {
      setHata('Ad soyad 2 ile 120 karakter arasında olmalıdır.');
      setYukleniyor(false);
      return;
    }

    if (orcid && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid)) {
      setHata('ORCID biçimi geçersiz. Örnek: 0000-0002-1825-0097');
      setYukleniyor(false);
      return;
    }

    if (scholar && !/^https?:\/\//.test(scholar)) {
      setHata('Google Scholar URL https:// veya http:// ile başlamalıdır.');
      setYukleniyor(false);
      return;
    }

    const konularArray = konular
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const patch: ProfileSelfUpdate = {
      full_name: ad.trim(),
      academic_title: unvan.trim() || null,
      department: bolum.trim() || null,
      research_topics: konularArray,
      scholar_url: scholar.trim() || null,
      orcid: orcid.trim() || null,
    };

    try {
      const sb = createClient();
      const sonuc = await updateOwnProfile(sb, profil.id, patch);

      if (sonuc.error) {
        setHata(sonuc.error);
      } else {
        setBasarili(true);
        await refreshProfile();
        router.refresh();
        setTimeout(() => setBasarili(false), 3000);
      }
    } catch (e) {
      setHata(e instanceof Error ? e.message : 'Beklenmeyen bir hata oluştu.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="space-y-4">
      {hata && <Uyari tone="tehlike">{hata}</Uyari>}
      {basarili && <Uyari tone="basari">Kaydedildi.</Uyari>}

      <Panel baslik="Bilgilerim">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alan
            etiket="Ad soyad *"
            htmlFor="ad"
            hata={
              ad.trim() && (ad.trim().length < 2 || ad.trim().length > 120)
                ? 'Ad soyad 2 ile 120 karakter arasında olmalıdır.'
                : undefined
            }
          >
            <input
              id="ad"
              type="text"
              required
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              className={inputSinifi}
            />
          </Alan>

          <Alan etiket="Unvan" htmlFor="unvan" yardim="Örn. Prof. Dr., Arş. Gör.">
            <input
              id="unvan"
              type="text"
              value={unvan}
              onChange={(e) => setUnvan(e.target.value)}
              className={inputSinifi}
            />
          </Alan>

          <Alan etiket="Bölüm" htmlFor="bolum">
            <select value={bolum} onChange={(e) => setBolum(e.target.value)} className={selectSinifi}>
              <option value="">Seçiniz</option>
              <option value="Fizik">Fizik</option>
              <option value="Fizik Mühendisliği">Fizik Mühendisliği</option>
            </select>
          </Alan>

          <Alan
            etiket="Araştırma konuları"
            htmlFor="konular"
            yardim="Virgülle ayırın."
          >
            <textarea
              id="konular"
              value={konular}
              onChange={(e) => setKonular(e.target.value)}
              className={textareaSinifi}
            />
          </Alan>

          <Alan
            etiket="Google Scholar"
            htmlFor="scholar"
            hata={
              scholar && !/^https?:\/\//.test(scholar)
                ? 'URL https:// veya http:// ile başlamalıdır.'
                : undefined
            }
          >
            <input
              id="scholar"
              type="url"
              value={scholar}
              onChange={(e) => setScholar(e.target.value)}
              className={inputSinifi}
            />
          </Alan>

          <Alan
            etiket="ORCID"
            htmlFor="orcid"
            hata={
              orcid && !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(orcid)
                ? 'ORCID biçimi: 0000-0000-0000-0000'
                : undefined
            }
          >
            <input
              id="orcid"
              type="text"
              value={orcid}
              onChange={(e) => setOrcid(e.target.value)}
              placeholder="0000-0000-0000-0000"
              className={inputSinifi}
            />
          </Alan>

          <div className="flex justify-start pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={yukleniyor}
            >
              Kaydet
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
