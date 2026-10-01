'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  FileText,
  GraduationCap,
  Home,
  Lock,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { INITIAL_PROFILES } from '@/lib/mockData';

export function Navbar() {
  const pathname = usePathname();
  const { profile, role, loginAs, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa', icon: Home },
    { href: '/kilavuzlar', label: 'Kılavuzlar', icon: Wrench },
    { href: '/formlar', label: 'Formlar', icon: FileText },
    { href: '/uyeler', label: 'Üyeler', icon: Users },
    { href: '/duyurular', label: 'Duyurular', icon: Bell },
    { href: '/kaynaklar', label: 'Kaynaklar', icon: BookOpen },
    { href: '/dersler', label: 'Dersler', icon: GraduationCap },
    { href: '/toplantilar', label: 'Toplantılar', icon: Calendar },
  ];

  const initials = profile?.full_name
    .split(' ')
    .filter((n) => !n.endsWith('.'))
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <header className="sticky top-0 z-50 text-slate-100">
      {/* Üst Üniversite Şeridi */}
      <div className="bg-slate-950 border-b border-slate-800/70 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-semibold tracking-[0.14em] text-slate-300">ANKARA ÜNİVERSİTESİ</span>
            <span className="hidden sm:inline w-px h-3 bg-slate-700"></span>
            <span className="hidden sm:inline text-slate-500 truncate">
              Fen Fakültesi · Hesaplamalı Yoğun Madde Fiziği
            </span>
          </div>

          {/* Test/Rol Değiştirici */}
          <div className="relative shrink-0">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition cursor-pointer"
              title="Test için kullanıcı rolünü anında değiştirin"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>
                Demo rolü: <b className="text-slate-200 font-medium">{profile?.full_name?.split(' ').slice(-1)[0] ?? 'Misafir'}</b>
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl shadow-black/50 p-1.5 z-50 text-xs">
                <div className="px-2.5 py-2 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Rol tabanlı erişim testi
                </div>
                {INITIAL_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      loginAs(p.id);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 hover:bg-slate-800 transition ${
                      profile?.id === p.id ? 'bg-slate-800/80' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-slate-100 truncate">{p.full_name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{p.academic_title}</div>
                    </div>
                    <RoleBadge role={p.role} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ana Navbar */}
      <div className="bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-red-700 to-red-950 ring-1 ring-red-500/30 flex items-center justify-center font-serif text-xl text-white shadow-lg shadow-red-950/50">
                Ψ
              </div>
              <div className="leading-tight">
                <span className="block font-serif text-[19px] text-white tracking-tight">
                  HYMF <span className="italic text-slate-400">Portal</span>
                </span>
                <span className="block text-[10px] font-mono text-slate-500">hymf.ankara.edu.tr</span>
              </div>
            </Link>

            {/* Masaüstü Menü */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 py-2 text-[13px] rounded-md transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute left-3 right-3 -bottom-[13px] h-[2px] rounded-full bg-gradient-to-r from-red-500 to-amber-400"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sağ taraf */}
            <div className="hidden xl:flex items-center gap-2 shrink-0">
              <Link
                href="/calisma-alani"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] border transition ${
                  pathname === '/calisma-alani'
                    ? 'bg-amber-500/15 text-amber-200 border-amber-500/40'
                    : 'text-amber-300/90 border-amber-500/25 hover:bg-amber-500/10'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Çalışma Alanı
              </Link>

              {profile ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-slate-800/80 transition cursor-pointer"
                    aria-label="Kullanıcı menüsü"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 ring-1 ring-slate-600 flex items-center justify-center text-[11px] font-semibold text-white">
                      {initials}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl shadow-black/50 p-1.5 z-50 text-[13px]">
                      <div className="px-3 py-2.5 mb-1 border-b border-slate-800">
                        <div className="font-medium text-slate-100">{profile.full_name}</div>
                        <div className="text-[11px] text-slate-500">{profile.email}</div>
                        <div className="mt-2">
                          <RoleBadge role={role} />
                        </div>
                      </div>
                      <Link
                        href="/profil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        Akademik Profilim
                      </Link>
                      <Link
                        href="/calisma-alani"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        Kişisel Çalışma Alanım
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-300 hover:bg-red-950/40 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/giris"
                    className="px-3 py-1.5 text-[13px] text-slate-300 hover:text-white rounded-lg transition"
                  >
                    Giriş
                  </Link>
                  <Link
                    href="/kayit"
                    className="px-3.5 py-1.5 text-[13px] font-medium text-white bg-red-700 hover:bg-red-600 rounded-lg transition shadow-md shadow-red-950/40"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>

            {/* Mobil Menü Butonu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobil Menü İçeriği */}
        {mobileMenuOpen && (
          <div className="xl:hidden px-4 pt-2 pb-4 border-t border-slate-800/70 grid grid-cols-2 gap-1">
            {[...navLinks, { href: '/calisma-alani', label: 'Çalışma Alanı', icon: Lock }, { href: '/profil', label: 'Profilim', icon: User }].map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.href === '/calisma-alani' ? 'text-amber-400' : 'text-slate-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
