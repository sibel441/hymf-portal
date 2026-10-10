'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { hatirlamaTercihiniYaz } from '@/lib/supabase/hatirla';
import { DEMO_MODU } from '@/lib/demo';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Uyari } from '@/components/ui/Uyari';
import { Alan, inputSinifi } from '@/components/ui';

interface GirisFormuProps {
  next: string;
  hataParam: string | null;
}

export function GirisFormu({ next, hataParam }: GirisFormuProps) {
  const router = useRouter();
  const { loginAs } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [beniHatirla, setBeniHatirla] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(hataParam);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasValidSupabase = supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your-project');

    if (hasValidSupabase) {
      try {
        hatirlamaTercihiniYaz(beniHatirla);
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          if (error.message === 'Invalid login credentials') {
            setErrorMessage('E-posta veya şifre hatalı.');
          } else if (error.message === 'Email not confirmed') {
            setErrorMessage('E-posta adresiniz henüz doğrulanmadı. Gelen kutunuzdaki bağlantıyı açın.');
          } else {
            setErrorMessage('Giriş yapılamadı. Biraz sonra tekrar deneyin.');
          }
          setIsLoading(false);
          return;
        }

        router.replace(next);
        router.refresh();
        return;
      } catch (err) {
        console.error('Login error:', err);
        setErrorMessage('Giriş yapılamadı. Biraz sonra tekrar deneyin.');
        setIsLoading(false);
        return;
      }
    }

    // Demo modu: mock e-posta eşleşmesi
    if (DEMO_MODU) {
      const matched = INITIAL_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        loginAs(matched.id);
        router.replace(next);
        router.refresh();
        setIsLoading(false);
        return;
      }
    }

    setErrorMessage('E-posta veya şifre hatalı.');
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasValidSupabase = supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your-project');

    if (hasValidSupabase) {
      try {
        const supabase = createClient();
        await supabase.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: `${window.location.origin}/auth/callback?next=/sifre-yenile`,
        });
      } catch (err) {
        console.warn('Reset password error:', err);
      }
    }

    setResetSent(true);
  };

  return (
    <div className="space-y-6">
      {errorMessage && <Uyari tone="tehlike">{errorMessage}</Uyari>}

      <form onSubmit={handleLogin} className="space-y-5">
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="text-sm font-medium text-ink">
              Şifre
            </label>
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="text-sm text-link hover:underline"
            >
              Şifremi unuttum
            </button>
          </div>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputSinifi}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={beniHatirla}
            onChange={(e) => setBeniHatirla(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-primary"
          />
          Beni hatırla
        </label>

        <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
          {isLoading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </Button>
      </form>

      <div className="text-sm text-ink-2">
        Hesabınız yok mu? Hesapları grup yöneticileri açar; onlara yazın.
      </div>

      {DEMO_MODU && (
        <div className="mt-8 pt-6 border-t border-line space-y-3">
          <p className="text-sm font-medium text-ink-2">Örnek hesaplar (demo)</p>
          <div className="grid grid-cols-1 gap-2">
            {INITIAL_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  loginAs(p.id);
                  router.replace(next);
                  router.refresh();
                }}
                className="p-3 rounded-md bg-sunken hover:bg-sunken/80 text-left text-sm transition border border-line"
              >
                <div className="font-medium text-ink">{p.full_name}</div>
                <div className="text-ink-3">{p.email}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="sifre-sifirlama-baslik" className="w-full max-w-sm space-y-5 rounded-lg border border-line bg-surface p-6 shadow-lg">
            <div className="border-b border-line pb-4">
              <h2 id="sifre-sifirlama-baslik" className="text-lg font-semibold text-ink">Şifre sıfırlama</h2>
              <p className="text-sm text-ink-3 mt-1">Adresinize şifre sıfırlama bağlantısı gönderilir.</p>
            </div>

            {resetSent ? (
              <div className="space-y-4">
                <Uyari tone="bilgi">E-posta adresinize sıfırlama bağlantısı gönderildi. Gelen kutuunuzu kontrol edin.</Uyari>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsForgotOpen(false);
                    setResetSent(false);
                  }}
                  className="w-full"
                >
                  Kapat
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Alan etiket="E-posta adresiniz" htmlFor="reset-email">
                  <input
                    id="reset-email"
                    type="email"
                    required
                    placeholder="ad.soyad@ankara.edu.tr"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={inputSinifi}
                  />
                </Alan>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1"
                  >
                    Vazgeç
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Bağlantı Gönder
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
