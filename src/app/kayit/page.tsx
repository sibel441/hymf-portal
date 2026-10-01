'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Lock, Mail, User, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';

export default function RegisterPage() {
  const router = useRouter();
  const { loginAs } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Fizik Anabilim Dalı');
  const [academicTitle, setAcademicTitle] = useState('Yüksek Lisans Öğrencisi');
  const [researchTopics, setResearchTopics] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Girilen şifreler birbiriyle uyuşmuyor.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasValidSupabase =
      supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your-project');

    if (hasValidSupabase) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              department,
              academic_title: academicTitle,
              role: 'arastirmaci',
            },
          },
        });

        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Kayıt başarılı! E-posta onay bağlantınız gönderilmiştir.');
        setIsLoading(false);
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Kayıt hatası';
        setErrorMessage(msg);
      }
    }

    // Demo Modu
    const newDemoId = `user-new-${Date.now()}`;
    setSuccessMessage('Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
    setTimeout(() => {
      loginAs(newDemoId);
      router.push('/');
    }, 1500);
    setIsLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto my-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-red-900/60 border border-red-700/60 flex items-center justify-center font-serif text-xl font-bold text-slate-100 mx-auto">
          Ψ
        </div>
        <h1 className="text-2xl font-bold font-serif text-white">
          Yeni Araştırmacı Kaydı
        </h1>
        <p className="text-xs text-slate-400">
          Ankara Üniversitesi Hesaplamalı Yoğun Madde Fiziği Araştırma Grubu
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Ad Soyad *
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Ahmet Yılmaz"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              E-posta Adresi (Kurumsal veya Şahsi) *
            </label>
            <input
              type="email"
              required
              placeholder="ad.soyad@ankara.edu.tr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Şifre *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Şifre Tekrarı *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Anabilim Dalı *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600 cursor-pointer"
              >
                <option value="Fizik Anabilim Dalı">Fizik Anabilim Dalı</option>
                <option value="Fizik Mühendisliği Anabilim Dalı">Fizik Mühendisliği</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Akademik Unvan *
              </label>
              <select
                value={academicTitle}
                onChange={(e) => setAcademicTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600 cursor-pointer"
              >
                <option value="Yüksek Lisans Öğrencisi">Yüksek Lisans Öğrencisi</option>
                <option value="Doktora Öğrencisi">Doktora Öğrencisi</option>
                <option value="Doktora Sonrası Araştırmacı">Doktora Sonrası Araştırmacı</option>
                <option value="Öğretim Üyesi">Öğretim Üyesi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Çalışma Konuları (Virgülle ayırın)
            </label>
            <input
              type="text"
              placeholder="Örn: 2D Malzemeler, DFT, VASP, Fononlar"
              value={researchTopics}
              onChange={(e) => setResearchTopics(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-red-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydı Tamamla'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="text-red-400 font-semibold hover:underline">
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  );
}
