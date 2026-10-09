'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Uyari } from '@/components/ui/Uyari';
import { Alan, inputSinifi, selectSinifi } from '@/components/ui';

export function KayitFormu() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Doğrulama
    if (!fullName.trim()) {
      setErrorMessage('Ad Soyad alanı boş olamaz.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Şifreler birbiriyle uyuşmamaktadır.');
      return;
    }

    setIsLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasValidSupabase = supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your-project');

    if (hasValidSupabase) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName.trim(),
              ...(department && { department }),
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setErrorMessage('Bu e-posta adresi zaten kayıtlıdır.');
          } else {
            setErrorMessage('Kayıt yapılamadı. Biraz sonra tekrar deneyin.');
          }
          setIsLoading(false);
          return;
        }

        setSuccessMessage(
          'Kayıt alındı. E-postanıza gelen bağlantıyla adresinizi doğrulayın. Adresiniz davet listesindeyse hesabınız doğrulamadan sonra açılır; değilse bir yöneticinin onayı gerekir.'
        );
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDepartment('');
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Registration error:', err);
        setErrorMessage('Kayıt yapılamadı. Biraz sonra tekrar deneyin.');
        setIsLoading(false);
        return;
      }
    }

    setErrorMessage('Supabase yapılandırması eksik.');
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {errorMessage && <Uyari tone="tehlike">{errorMessage}</Uyari>}
      {successMessage && <Uyari tone="basari">{successMessage}</Uyari>}

      <form onSubmit={handleRegister} className="space-y-5">
        <Alan etiket="Ad Soyad" htmlFor="fullName">
          <input
            id="fullName"
            type="text"
            required
            placeholder="Örn: Ahmet Yılmaz"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputSinifi}
          />
        </Alan>

        <Alan etiket="E-posta adresi" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            placeholder="ad.soyad@ankara.edu.tr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputSinifi}
          />
        </Alan>

        <Alan etiket="Şifre (en az 8 karakter)" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputSinifi}
          />
        </Alan>

        <Alan etiket="Şifre Tekrarı" htmlFor="confirmPassword">
          <input
            id="confirmPassword"
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputSinifi}
          />
        </Alan>

        <Alan etiket="Bölüm (opsiyonel)" htmlFor="department">
          <select
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={selectSinifi}
          >
            <option value="">-- Seçiniz --</option>
            <option value="Fizik">Fizik</option>
            <option value="Fizik Mühendisliği">Fizik Mühendisliği</option>
          </select>
        </Alan>

        <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
          {isLoading ? 'Kaydediliyor...' : 'Kaydı Tamamla'}
        </Button>
      </form>

      <div className="text-sm text-ink-2">
        Zaten hesabınız var mı?{' '}
        <Link href="/giris" className="text-link hover:underline font-medium">
          Giriş yapın
        </Link>
      </div>
    </div>
  );
}
