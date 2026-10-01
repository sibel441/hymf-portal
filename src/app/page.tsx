'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Cpu,
  ExternalLink,
  FileText,
  GraduationCap,
  Lock,
  Send,
  Shield,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_ANNOUNCEMENTS, INITIAL_COURSES, INITIAL_PROFILES } from '@/lib/mockData';
import { RoleBadge } from '@/components/RoleBadge';

export default function HomePage() {
  const { profile, role } = useAuth();

  return (
    <div className="space-y-10">
      {/* 1. Karşılama ve Misyon Hero Bölümü */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-red-950/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Ankara Üniversitesi Fen Fakültesi / Enstitüsü
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-serif leading-tight">
            Hesaplamalı Yoğun Madde Fiziği (HYMF) Portalına Hoş Geldiniz
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Araştırma grubumuz; yoğunluk fonksiyoneli teorisi (DFT), moleküler dinamik (MD), 2D manyetik malzemeler, topolojik yalıtkanlar ve perovskit güneş hücrelerinin atomik ölçekli simülasyonları üzerine odaklanmaktadır.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/calisma-alani"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition shadow-md hover:shadow-red-900/30"
            >
              <Lock className="w-4 h-4 text-amber-300" />
              <span>Kişisel Çalışma Alanım (Gizli Panel)</span>
            </Link>
            <Link
              href="/kilavuzlar"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition border border-slate-700"
            >
              <Wrench className="w-4 h-4 text-slate-400" />
              <span>TRUBA & VASP Kılavuzları</span>
            </Link>
            <Link
              href="/duyurular"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium transition border border-slate-800"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Duyuru Panosu</span>
            </Link>
          </div>
        </div>

        {/* Kullanıcı Giriş Durumu Bilgilendirme Kartı */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Aktif Oturum:</span>
              <span className="text-slate-200 font-semibold">{profile?.full_name}</span>
            </div>
            <RoleBadge role={role} />
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Rol Tabanlı Erişim Kontrolü (RBAC) Aktif</span>
          </div>
        </div>
      </section>

      {/* 2. Hızlı Metrikler ve Özet */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-800 text-red-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{INITIAL_PROFILES.length}</div>
            <div className="text-xs text-slate-400">Grup Araştırmacısı</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-800 text-blue-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">2</div>
            <div className="text-xs text-slate-400">Aktif TRUBA Projesi</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-800 text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{INITIAL_COURSES.length}</div>
            <div className="text-xs text-slate-400">Lisansüstü Ders</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-800 text-amber-400">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">Telegram</div>
            <div className="text-xs text-slate-400">Anlık Bot Entegreli</div>
          </div>
        </div>
      </section>

      {/* 3. Ana Grid: Hızlı Kılavuzlar & Son Duyurular */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon (2 Birim): Hızlı Kılavuzlar ve Resmi Formlar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hızlı Kılavuzlar (Manuals) Kartı */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white font-serif">Hızlı Kılavuzlar (Manuals)</h2>
              </div>
              <Link href="/kilavuzlar" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <span>Tüm Kılavuzlar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/kilavuzlar#truba"
                className="p-4 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-white group-hover:text-amber-300">TRUBA Aktivasyonu</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  TÜBİTAK ULAKBİM hesap açılışı, SSH anahtar kurulumu ve kota tanımlama adımları.
                </p>
              </Link>

              <Link
                href="/kilavuzlar#cluster"
                className="p-4 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-white group-hover:text-amber-300">VASP / LAMMPS</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Barbun / Sarıyer kümelerinde VASP optimizasyon ve LAMMPS koşu scriptleri.
                </p>
              </Link>

              <Link
                href="/kilavuzlar#vpn"
                className="p-4 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-white group-hover:text-amber-300">Okul VPN Kurulumu</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Ankara Üniversitesi uzaktan kütüphane ve ScienceDirect/Web of Science erişimi.
                </p>
              </Link>
            </div>
          </div>

          {/* Resmi Formlar (Fen Bilimleri Enstitüsü) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-400" />
                <h2 className="text-base font-bold text-white font-serif">
                  Resmi Formlar (Fen Bilimleri Enstitüsü)
                </h2>
              </div>
              <Link href="/formlar" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <span>Tüm Formlar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fizik Anabilim Dalı */}
              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Fizik Anabilim Dalı</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">FBE-FIZ</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <Link href="/formlar#fizik-tez-onerisi" className="hover:text-slate-200">
                      Tez Konusu ve Önerisi Bildirim Formu
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <Link href="/formlar#fizik-tik" className="hover:text-slate-200">
                      Tez İzleme Komitesi (TİK) Rapor Formu
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <Link href="/formlar#fizik-savunma" className="hover:text-slate-200">
                      Tez Savunma Sınavı Jüri Öneri Formu
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Fizik Mühendisliği Anabilim Dalı */}
              <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Fizik Mühendisliği</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">FBE-FZM</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <Link href="/formlar#muhendislik-ders" className="hover:text-slate-200">
                      Lisansüstü Ders Ekleme/Çıkarma Formu
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <Link href="/formlar#muhendislik-yeterlik" className="hover:text-slate-200">
                      Doktora Yeterlik Sınavı Başvuru Belgesi
                    </Link>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <Link href="/formlar#muhendislik-teslim" className="hover:text-slate-200">
                      Mezuniyet & Tez Teslim Kontrol Çizelgesi
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon (1 Birim): Duyuru Panosu & Telegram Akışı */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                <h2 className="text-base font-bold text-white font-serif">Duyuru Panosu</h2>
              </div>
              <Link href="/duyurular" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium">
                <span>+ Duyuru Yap</span>
              </Link>
            </div>

            <div className="space-y-3">
              {INITIAL_ANNOUNCEMENTS.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    {ann.priority === 'acil' ? (
                      <span className="inline-flex items-center gap-1 text-red-400 font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        🚨 Acil (Telegram)
                      </span>
                    ) : ann.priority === 'toplanti' ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-bold uppercase">
                        <Calendar className="w-3 h-3" />
                        📅 Toplantı
                      </span>
                    ) : (
                      <span className="text-slate-400">📢 Bilgilendirme</span>
                    )}
                    <span className="text-slate-500 font-mono">
                      {new Date(ann.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-100 hover:text-red-300 transition leading-snug">
                    <Link href="/duyurular">{ann.title}</Link>
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Ekleyen: {ann.author?.full_name}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/duyurular"
              className="block w-full py-2 text-center text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition"
            >
              Tüm Duyuruları Gör & Gönder
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Üye Vitrini Önizlemesi (Fotoğraflı Grid) */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Grup Üyelerimiz (Vitrin)</h2>
            <p className="text-xs text-slate-400">
              Araştırma grubumuzun hocaları, doktora ve yüksek lisans araştırmacıları.
            </p>
          </div>
          <Link
            href="/uyeler"
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <span>Tüm Üye Profilleri</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {INITIAL_PROFILES.map((p) => (
            <Link
              key={p.id}
              href="/uyeler"
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 rounded-full border-2 border-slate-700 group-hover:border-red-500 transition overflow-hidden mb-3 bg-slate-800">
                <img
                  src={p.avatar_url || ''}
                  alt={p.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xs font-bold text-slate-100 group-hover:text-red-300 transition">
                {p.full_name}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {p.academic_title}
              </p>
              <div className="mt-2.5">
                <RoleBadge role={p.role} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
