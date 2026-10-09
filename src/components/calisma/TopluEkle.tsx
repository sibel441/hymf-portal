'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createPlanItemsBulk } from '@/lib/data/plan';
import { Alan, Button, Uyari, inputSinifi, textareaSinifi, selectSinifi } from '@/components/ui';
import { ONCELIK_ETIKETI } from '@/lib/etiketler';

export interface TopluEkleProps {
  workspaceId: string;
}

export function TopluEkle({ workspaceId }: TopluEkleProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [satirlar, setSatirlar] = useState('');
  const [sonTarih, setSonTarih] = useState('');
  const [oncelik, setOncelik] = useState<1 | 2 | 3>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  // Satırları temizle ve say
  const temizledegSatirlar = satirlar
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 50);
  const satirSayisi = temizledegSatirlar.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (satirSayisi === 0) return;

    setIsLoading(true);
    setHata(null);

    try {
      const sb = createClient();
      const sonuc = await createPlanItemsBulk(sb, workspaceId, temizledegSatirlar, {
        due_date: sonTarih || null,
        priority: oncelik,
      });

      if (sonuc.error) {
        setHata(sonuc.error);
        setIsLoading(false);
        return;
      }

      // Başarılı: textarea temizle, kapat ve yenile
      setSatirlar('');
      setSonTarih('');
      setOncelik(2);
      setIsOpen(false);
      router.refresh();
    } catch (e) {
      setHata(e instanceof Error ? e.message : 'Beklenmeyen bir hata oluştu.');
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
        Toplu ekle
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-line bg-paper p-4 space-y-3">
      {hata && <Uyari tone="tehlike">{hata}</Uyari>}

      <Alan
        etiket="Maddeler"
        htmlFor="toplu-maddeler"
        yardim="Her satır bir madde olur. En fazla 50 satır."
      >
        <textarea
          id="toplu-maddeler"
          className={textareaSinifi}
          rows={8}
          value={satirlar}
          onChange={(e) => setSatirlar(e.target.value)}
          placeholder={'k-noktası yakınsama testi\nKesme enerjisi testi\nBant yapısı hesabı'}
          disabled={isLoading}
        />
      </Alan>

      <div className="sm:grid sm:grid-cols-2 sm:gap-4">
        <Alan etiket="Son tarih" htmlFor="toplu-tarih">
          <input
            id="toplu-tarih"
            type="date"
            className={inputSinifi}
            value={sonTarih}
            onChange={(e) => setSonTarih(e.target.value)}
            disabled={isLoading}
          />
        </Alan>

        <Alan etiket="Öncelik" htmlFor="toplu-oncelik">
          <select
            id="toplu-oncelik"
            className={selectSinifi}
            value={oncelik}
            onChange={(e) => setOncelik(parseInt(e.target.value) as 1 | 2 | 3)}
            disabled={isLoading}
          >
            <option value="1">{ONCELIK_ETIKETI[1]}</option>
            <option value="2">{ONCELIK_ETIKETI[2]}</option>
            <option value="3">{ONCELIK_ETIKETI[3]}</option>
          </select>
        </Alan>
      </div>

      <div className="text-sm text-ink-3 pt-2">
        {satirSayisi > 0 ? `${satirSayisi} madde eklenecek.` : 'Henüz madde yok.'}
      </div>

      <div className="flex gap-2 justify-start pt-2">
        <Button
          variant="primary"
          size="sm"
          type="submit"
          disabled={satirSayisi === 0 || isLoading}
        >
          Maddeleri ekle
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setIsOpen(false);
            setHata(null);
          }}
          disabled={isLoading}
        >
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
