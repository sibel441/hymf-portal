'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  HelpCircle,
  Link as LinkIcon,
} from 'lucide-react';

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
      {/* Başlık ve Enstitü Bilgilendirmesi */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
          <FileText className="w-4 h-4" />
          <span>ANKARA ÜNİVERSİTESİ FEN BİLİMLERİ ENSTİTÜSÜ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
          Resmi Formlar ve Belgeler
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl">
          Karmaşayı önlemek amacıyla Enstitümüzün <strong>Fizik</strong> ve <strong>Fizik Mühendisliği</strong> Anabilim Dallarına ait lisansüstü resmi formları, tez süreçleri ve teslim yönergeleri kategorize edilmiştir.
        </p>
      </div>

      {/* Anabilim Dalı Seçim Butonları */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedDept('fizik')}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            selectedDept === 'fizik'
              ? 'bg-red-800 text-white shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <span>Fizik Anabilim Dalı</span>
          <span className="px-2 py-0.5 rounded bg-slate-950/60 text-[10px] text-slate-300 font-mono">
            {fizikFormlari.length} Belge
          </span>
        </button>

        <button
          onClick={() => setSelectedDept('fizik_muh')}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            selectedDept === 'fizik_muh'
              ? 'bg-red-800 text-white shadow-md'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <span>Fizik Mühendisliği Anabilim Dalı</span>
          <span className="px-2 py-0.5 rounded bg-slate-950/60 text-[10px] text-slate-300 font-mono">
            {muhendislikFormlari.length} Belge
          </span>
        </button>
      </div>

      {/* Form Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(selectedDept === 'fizik' ? fizikFormlari : muhendislikFormlari).map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  {item.code}
                </span>
                <span className="text-slate-400 font-mono">{item.format}</span>
              </div>
              <h3 className="text-sm font-bold text-white font-serif leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Formu İndir / Enstitü Sayfası</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Önemli Hatırlatma Notu */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-200">Enstitü Teslim Standartları:</strong> Tez savunma sınavı ve tez izleme raporları teslim edilirken danışman hocanın ıslak veya e-imzası zorunludur. Turnitin intihal raporu tek kaynak benzerliği %5'i, toplam benzerlik %20'yi aşmamalıdır.
        </div>
      </div>
    </div>
  );
}
