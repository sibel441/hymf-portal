'use client';

import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
} from 'lucide-react';
import {
  SayfaBasligi,
  Panel,
  Button,
  Uyari,
} from '@/components/ui';

export default function FormsPage() {
  const [selectedDept, setSelectedDept] = useState<'fizik' | 'fizik_muh'>('fizik');

  const fizikFormlari = [
    {
      id: 'fiz-1',
      code: 'FIZ-FRM-01',
      title: 'Yüksek Lisans / Doktora Tez Konusu ve Önerisi Formu',
      description: 'Ders dönemini tamamlayan öğrencilerin tez konusunu ve çalışma planını Enstitüye resmi olarak bildirme belgesi.',
      format: 'DOCX / PDF',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
    {
      id: 'fiz-2',
      code: 'FIZ-FRM-02',
      title: 'Doktora Tez İzleme Komitesi (TİK) Rapor Formu',
      description: 'Doktora öğrencilerinin 6 ayda bir (Ocak-Haziran / Temmuz-Aralık) komiteye sunduğu araştırma ilerleme raporu.',
      format: 'DOCX / PDF',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
    {
      id: 'fiz-3',
      code: 'FIZ-FRM-03',
      title: 'Tez Savunma Sınavı Jüri Öneri ve Başvuru Formu',
      description: 'Tezini tamamlayan adayın danışmanı tarafından önerilen 3 asıl / 2 yedek veya 5 asıl / 2 yedek jüri listesi.',
      format: 'DOCX / PDF',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
    {
      id: 'fiz-4',
      code: 'FIZ-FRM-04',
      title: 'Tez Savunma Sınavı Tutanak ve Değerlendirme Belgesi',
      description: 'Savunma sınavı sonrasında jüri üyeleri tarafından imzalanan resmi sonuç belgesi.',
      format: 'PDF',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
    {
      id: 'fiz-5',
      code: 'FIZ-FRM-05',
      title: 'Mezuniyet ve Ciltli Tez Teslim Kontrol Listesi',
      description: 'Enstitüye tez teslimi öncesinde biçimsel inceleme, intihal (Turnitin) raporu ve imza onay listesi.',
      format: 'PDF',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
  ];

  const muhendislikFormlari = [
    {
      id: 'fzm-1',
      code: 'FZM-FRM-01',
      title: 'Fizik Mühendisliği Lisansüstü Danışman Tercih Formu',
      description: 'Enstitüye yeni kayıt yaptıran Y.Lisans ve Doktora öğrencilerinin 1. yarıyıl sonuna kadar danışman atama belgesi.',
      format: 'DOCX / PDF',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
    {
      id: 'fzm-2',
      code: 'FZM-FRM-02',
      title: 'Doktora Yeterlik Sınavı Başvuru ve Sonuç Tutanağı',
      description: 'Kredilerini tamamlayan adayın yazılı ve sözlü yeterlik sınavı jüri değerlendirme raporu.',
      format: 'DOCX / PDF',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
    {
      id: 'fzm-3',
      code: 'FZM-FRM-03',
      title: 'Lisansüstü Seminer Dersi Değerlendirme Çizelgesi',
      description: 'Bölüm içi seminer sunumu sonrasında ders sorumlusu ve dinleyici hocalarca doldurulan not fişi.',
      format: 'PDF',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
    {
      id: 'fzm-4',
      code: 'FZM-FRM-04',
      title: 'Tez Başlığı ve Kapsam Değişikliği Talep Dilekçesi',
      description: 'Devam eden tez sürecinde yöntem veya malzeme sistemi değişikliği gerektiğinde Enstitü Yönetim Kurulu onayı için form.',
      format: 'DOCX',
      url: 'https://fenbilimleri.ankara.edu.tr',
    },
  ];

  return (
    <div className="space-y-8">
      <SayfaBasligi
        baslik="Resmi formlar ve belgeler"
        aciklama="Ankara Üniversitesi Fen Bilimleri Enstitüsü Fizik ve Fizik Mühendisliği Anabilim Dallarının lisansüstü resmi formları, tez süreçleri ve teslim yönergeleri."
      />

      {/* Anabilim Dalı Seçim Butonları */}
      <div className="flex gap-3">
        <Button
          variant={selectedDept === 'fizik' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedDept('fizik')}
          className="justify-start"
        >
          <span>Fizik anabilim dalı</span>
          <span className="ml-auto px-2 py-0.5 rounded text-xs font-mono bg-sunken text-ink-3">
            {fizikFormlari.length} belge
          </span>
        </Button>

        <Button
          variant={selectedDept === 'fizik_muh' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedDept('fizik_muh')}
          className="justify-start"
        >
          <span>Fizik mühendisliği anabilim dalı</span>
          <span className="ml-auto px-2 py-0.5 rounded text-xs font-mono bg-sunken text-ink-3">
            {muhendislikFormlari.length} belge
          </span>
        </Button>
      </div>

      {/* Form Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(selectedDept === 'fizik' ? fizikFormlari : muhendislikFormlari).map((item) => (
          <Panel
            key={item.id}
            className="flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono px-2 py-0.5 rounded bg-sunken text-ink font-semibold">
                  {item.code}
                </span>
                <span className="text-ink-3 font-mono">{item.format}</span>
              </div>
              <h3 className="text-base font-semibold text-ink leading-snug">
                {item.title}
              </h3>
              <p className="text-sm text-ink-2 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-between">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:opacity-80 transition"
              >
                <Download className="w-4 h-4" />
                <span>Formu indir</span>
                <ExternalLink className="w-3.5 h-3.5 text-ink-3" />
              </a>
            </div>
          </Panel>
        ))}
      </div>

      {/* Önemli Hatırlatma Notu */}
      <Uyari tone="uyari">
        <strong>Enstitü teslim standartları.</strong> Tez savunma sınavı ve tez izleme raporları teslim edilirken danışman hocanın ıslak veya e-imzası zorunludur. Turnitin intihal raporu tek kaynak benzerliği %5&apos;i, toplam benzerlik %20&apos;yi aşmamalıdır.
      </Uyari>
    </div>
  );
}
