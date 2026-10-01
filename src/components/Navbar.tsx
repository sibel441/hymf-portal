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
    { href: '/formlar', label: 'Resmi Formlar', icon: FileText },
    { href: '/uyeler', label: 'Üye Vitrini', icon: Users },
    { href: '/duyurular', label: 'Duyurular', icon: Bell },
    { href: '/kaynaklar', label: 'Kaynak Havuzu', icon: BookOpen },
    { href: '/dersler', label: 'Dersler', icon: GraduationCap },
    { href: '/toplantilar', label: 'Toplantılar', icon: Calendar },
    {
      href: '/calisma-alani',
      label: 'Çalışma Alanı',
      icon: Lock,
      isSpecial: true,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Üst Üniversite Şeridi */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-wide text-slate-300">
              ANKARA ÜNİVERSİTESİ
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Fen Fakültesi / Enstitüsü • Hesaplamalı Yoğun Madde Fiziği (HYMF)
            </span>
          </div>

          {/* Test/Rol Değiştirici Hızlı Araç Çubuğu */}
          <div className="relative">
            <button
              onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer border border-slate-700"
              title="Test için kullanıcı rolünü anında değiştirin"
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Rolü Değiştir (Test): <b>{profile?.full_name?.split(' ')[0]}</b></span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {roleSwitcherOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-50 text-xs">
                <div className="px-2 py-1 text-slate-400 font-semibold border-b border-slate-800 mb-1">
                  Rol Tabanlı Erişim Testi (RBAC)
                </div>
                {INITIAL_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      loginAs(p.id);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left px-2 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition ${
                      profile?.id === p.id ? 'bg-slate-800 text-white font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-slate-200">{p.full_name}</div>
                      <div className="text-[10px] text-slate-400">{p.academic_title}</div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Grup Adı */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-900 via-slate-800 to-slate-900 border border-red-700/50 flex items-center justify-center font-serif text-lg font-bold text-slate-100 shadow-inner">
              Ψ
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-red-300 transition-colors">
                HYMF Portal
              </span>
              <span className="block text-[11px] font-mono text-slate-400 leading-none">
                hymf.ankara.edu.tr
              </span>
            </div>
          </Link>

          {/* Masaüstü Menü Linkleri */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    link.isSpecial
                      ? isActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-amber-300/90 hover:bg-amber-950/40 hover:text-amber-200 border border-amber-600/30'
                      : isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.isSpecial ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Kullanıcı Menüsü / Profil */}
          <div className="hidden lg:flex items-center gap-3">
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-white overflow-hidden">
                    {profile.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="leading-tight">
                    <div className="text-xs font-semibold text-slate-100">{profile.full_name}</div>
                    <div className="text-[10px] text-slate-400">{profile.academic_title}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <div className="font-semibold text-slate-200">{profile.full_name}</div>
                      <div className="text-[11px] text-slate-400">{profile.email}</div>
                      <div className="mt-1.5">
                        <RoleBadge role={role} />
                      </div>
                    </div>
                    <Link
                      href="/profil"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Akademik Profilim</span>
                    </Link>
                    <Link
                      href="/calisma-alani"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-amber-300 hover:bg-slate-800"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Kişisel Çalışma Alanım</span>
                    </Link>
                    <div className="border-t border-slate-800 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-slate-800 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/giris"
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-md transition"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-800 hover:bg-red-700 rounded-md transition shadow-sm"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobil Menü Butonu */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Menü İçeriği */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-slate-900 border-t border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
