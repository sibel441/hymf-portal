'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { RoleBadge } from '@/components/RoleBadge';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, profile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Şifremi unuttum modalı
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasValidSupabase =
      supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your-project');

    if (hasValidSupabase) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        router.push('/');
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Giriş hatası';
        setErrorMessage(msg);
      }
    }

    // Demo/Mock girişi kontrol et
    const matchedProfile = INITIAL_PROFILES.find(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );

    if (matchedProfile) {
      loginAs(matchedProfile.id);
      router.push('/');
    } else {
      setErrorMessage(
        'Girilen e-posta demo listesinde bulunamadı. Lütfen aşağıdaki hazır test hesaplarından birine tıklayın veya kayıt olun.'
      );
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/profil`,
      });
    } catch {
      // sessizce geç
    }

    setResetSent(true);
  };

  return (
    <div className="max-w-md mx-auto my-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-red-900/60 border border-red-700/60 flex items-center justify-center font-serif text-xl font-bold text-slate-100 mx-auto">
          Ψ
        </div>
        <h1 className="text-2xl font-bold font-serif text-white">
          HYMF Portalına Giriş
        </h1>
        <p className="text-xs text-slate-400">
          Ankara Üniversitesi Hesaplamalı Yoğun Madde Fiziği Araştırma Portalı
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              E-posta Adresi
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="ad.soyad@ankara.edu.tr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-300 font-semibold">Şifre</label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[11px] text-red-400 hover:underline cursor-pointer"
              >
                Şifremi Unuttum?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="text-red-400 font-semibold hover:underline">
            Yeni Araştırmacı Kaydı
          </Link>
        </div>
      </div>

      {/* Hızlı Demo Hesap Girişleri */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          ⚡ Hızlı Test Hesabı Seçimi (RBAC İncelemesi İçin)
        </span>
        <div className="space-y-2">
          {INITIAL_PROFILES.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                loginAs(p.id);
                router.push('/');
              }}
              className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-between text-left cursor-pointer"
            >
              <div>
                <div className="text-slate-200 font-semibold">{p.full_name}</div>
                <div className="text-[10px] text-slate-400">{p.email}</div>
              </div>
              <RoleBadge role={p.role} />
            </button>
          ))}
        </div>
      </div>

      {/* ŞİFREMİ UNUTTUM MODALI */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-red-400" />
                Şifre Sıfırlama
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                E-posta adresinize güvenli şifre sıfırlama bağlantısı gönderilecektir.
              </p>
            </div>

            {resetSent ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!</span>
                </div>
                <button
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg"
                >
                  Kapat
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ad.soyad@ankara.edu.tr"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition"
                  >
                    Sıfırlama Linki Gönder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
