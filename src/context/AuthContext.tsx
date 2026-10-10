'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, UserRole } from '@/types/database';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { createClient } from '@/lib/supabase/client';
import { DEMO_MODU } from '@/lib/demo';
import { isAdmin as checkIsAdmin, isSuperadmin as checkIsSuperadmin, isHoca as checkIsHoca, eskiRol } from '@/lib/yetki';

interface AuthContextType {
  profile: Profile | null;
  isLoading: boolean;
  isDemo: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  isHoca: boolean;
  /** @deprecated kadro ve yetki kullanın. Eski sayfalar için: hoca → 'hoca', admin/superadmin → 'yonetici', diğer → 'arastirmaci' */
  role: UserRole;
  loginAs: (profileId: string) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** @deprecated yalnız yerel state günceller; kalıcı kayıt için updateOwnProfile */
  updateProfile: (updated: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ANAHTARI = 'hymf_active_user';

function supabaseYapilandirildi(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('placeholder') && !url.includes('your-project');
}

function demoProfili(): Profile | null {
  try {
    const id = localStorage.getItem(DEMO_ANAHTARI);
    return INITIAL_PROFILES.find((p) => p.id === id) ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      setProfile((data as Profile | null) ?? null);
    } catch (err) {
      console.warn('Profil yüklenemedi:', err);
    }
  }, []);

  useEffect(() => {
    let kapandi = false;
    const supabase = supabaseYapilandirildi() ? createClient() : null;

    if (!DEMO_MODU) {
      try {
        localStorage.removeItem(DEMO_ANAHTARI);
      } catch {
        // depolama kapalı olabilir
      }
    }

    const baslat = async () => {
      if (supabase) {
        try {
          const { data } = await supabase.auth.getUser();
          if (kapandi) return;
          if (data?.user) {
            await loadProfile(data.user.id);
            if (!kapandi) setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Oturum okunamadı:', err);
        }
      }
      if (kapandi) return;
      if (DEMO_MODU) setProfile(demoProfili());
      setIsLoading(false);
    };
    void baslat();

    // Abonelik oturum olsun olmasın kurulur; girişten sonra gelen SIGNED_IN de yakalanır.
    // Callback içinde Supabase çağrısı await edilmez (auth-js kilitlenme uyarısı).
    const abonelik = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(DEMO_MODU ? demoProfili() : null);
        return;
      }
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && session?.user) {
        const id = session.user.id;
        setTimeout(() => {
          void loadProfile(id);
        }, 0);
      }
    });

    return () => {
      kapandi = true;
      abonelik?.data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const loginAs = (profileId: string) => {
    if (!DEMO_MODU) return;
    const found = INITIAL_PROFILES.find((p) => p.id === profileId);
    if (found) {
      setProfile(found);
      try {
        localStorage.setItem(DEMO_ANAHTARI, found.id);
      } catch {
        // depolama kapalı olabilir
      }
    }
  };

  const logout = async () => {
    if (supabaseYapilandirildi()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }

    // Demo kaydını sil
    try {
      localStorage.removeItem(DEMO_ANAHTARI);
    } catch {
      // depolama kapalı olabilir
    }

    setProfile(null);
    router.refresh();
  };

  const refreshProfile = async () => {
    if (!profile) return;
    await loadProfile(profile.id);
  };

  const updateProfile = (updated: Partial<Profile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
  };

  const role = eskiRol(profile);
  const isAdmin = checkIsAdmin(profile);
  const isSuperadmin = checkIsSuperadmin(profile);
  const isHoca = checkIsHoca(profile);

  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoading,
        isDemo: DEMO_MODU,
        isAdmin,
        isSuperadmin,
        isHoca,
        role,
        loginAs,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
