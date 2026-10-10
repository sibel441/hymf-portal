'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Uyari } from '@/components/ui/Uyari';
import { Alan, SifreInput } from '@/components/ui';

export function SifreYenileFormu() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

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
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          setErrorMessage('Şifre güncellenemedi. Biraz sonra tekrar deneyin.');
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Şifreniz güncellendi.');
        setPassword('');
        setConfirmPassword('');
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Password update error:', err);
        setErrorMessage('Şifre güncellenemedi. Biraz sonra tekrar deneyin.');
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
      {successMessage && (
        <div className="space-y-4">
          <Uyari tone="basari">{successMessage}</Uyari>
          <Link href="/" className="block text-sm font-medium text-link hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <Alan etiket="Yeni Şifre (en az 8 karakter)" htmlFor="password">
            <SifreInput
              id="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Alan>

          <Alan etiket="Şifre Tekrarı" htmlFor="confirmPassword">
            <SifreInput
              id="confirmPassword"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Alan>

          <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
            {isLoading ? 'Güncelleniyor...' : 'Şifreleri Güncelle'}
          </Button>
        </form>
      )}
    </div>
  );
}
