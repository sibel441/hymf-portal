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
    <div className="space-y-8 sm:space-y-10">
      {/* 1. Karşılama ve Misyon Hero Bölümü */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/40 px-6 py-12 sm:px-12 sm:py-16">
        <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-red-800/25 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 left-1/3 w-[24rem] h-[24rem] rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>
        {/* Kafes / Bravais örgüsü dekoru */}
        <svg
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-1/2 opacity-[0.18] pointer-events-none hidden md:block"
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="hex" width="40" height="34.64" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="2" fill="currentColor" />
              <circle cx="20" cy="17.32" r="2" fill="currentColor" />
              <circle cx="40" cy="0" r="2" fill="currentColor" />
              <circle cx="0" cy="34.64" r="2" fill="currentColor" />
              <circle cx="40" cy="34.64" r="2" fill="currentColor" />
              <path d="M0 0 L20 17.32 L40 0 M20 17.32 L0 34.64 M20 17.32 L40 34.64" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
            <radialGradient id="fade" cx="70%" cy="40%" r="60%">
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="m">
              <rect width="400" height="400" fill="url(#fade)" />
            </mask>
          </defs>
          <rect width="400" height="400" fill="url(#hex)" mask="url(#m)" className="text-slate-300" />
        </svg>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 text-[11px] font-medium text-slate-300 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Ankara Üniversitesi · Fen Fakültesi
          </div>
          <h1 className="mt-6 font-serif text-4xl sm:text-6xl leading-[1.05] text-white">
            Hesaplamalı Yoğun
            <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-red-200 to-amber-200">
              Madde Fiziği
            </span>{' '}
            Grubu
          </h1>
          <p className="mt-6 text-[15px] sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Yoğunluk fonksiyoneli teorisi (DFT), moleküler dinamik, 2D manyetik malzemeler, topolojik yalıtkanlar ve
            perovskit güneş hücrelerinin atomik ölçekli simülasyonları. Grubun kılavuzları, kaynakları ve ortak
            çalışma alanı tek yerde.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/calisma-alani"
              className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition shadow-lg shadow-red-950/50 ring-1 ring-red-500/40"
            >
              <Lock className="w-4 h-4 text-amber-200" />
              Çalışma Alanım
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/kilavuzlar"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm font-medium transition border border-slate-700/80"
            >
              <Wrench className="w-4 h-4 text-slate-400" />
              TRUBA & VASP Kılavuzları
            </Link>
            <Link
              href="/duyurular"
              className="inline-flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white text-sm font-medium transition"
            >
              <Bell className="w-4 h-4" />
              Duyurular
            </Link>
          </div>
        </div>

        {/* Kullanıcı Giriş Durumu */}
        <div className="relative z-10 mt-12 pt-6 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Oturum</span>
            <span className="text-slate-200 font-medium">{profile?.full_name ?? 'Misafir'}</span>
            <RoleBadge role={role} />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            RBAC aktif
          </div>
        </div>
      </section>

      {/* 2. Hızlı Metrikler */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-slate-800/80 bg-slate-800/80 overflow-hidden">
        {[
          { icon: Users, value: INITIAL_PROFILES.length, label: 'Araştırmacı', tint: 'text-red-300' },
          { icon: Cpu, value: 2, label: 'Aktif TRUBA projesi', tint: 'text-sky-300' },
          { icon: GraduationCap, value: INITIAL_COURSES.length, label: 'Lisansüstü ders', tint: 'text-emerald-300' },
          { icon: Send, value: 'Bot', label: 'Telegram bildirimleri', tint: 'text-amber-300' },
        ].map(({ icon: Icon, value, label, tint }) => (
          <div key={label} className="p-5 sm:p-6 bg-slate-950/90">
            <Icon className={`w-4 h-4 ${tint}`} />
            <div className="mt-3 font-serif text-3xl sm:text-4xl text-white">{value}</div>
            <div className="mt-1 text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </section>

      {/* 3. Ana Grid: Hızlı Kılavuzlar & Son Duyurular */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon (2 Birim): Hızlı Kılavuzlar ve Resmi Formlar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hızlı Kılavuzlar Kartı */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl text-white font-serif">Hızlı Kılavuzlar</h2>
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
                <h2 className="text-xl text-white font-serif">
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
                <h2 className="text-xl text-white font-serif">Duyuru Panosu</h2>
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
                        Acil
                      </span>
                    ) : ann.priority === 'toplanti' ? (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-bold uppercase">
                        <Calendar className="w-3 h-3" />
                        Toplantı
                      </span>
                    ) : (
                      <span className="text-slate-400">Bilgilendirme</span>
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
              className="block w-full py-2 text-center text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
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
            <h2 className="text-2xl text-white font-serif">Grup Üyeleri</h2>
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
