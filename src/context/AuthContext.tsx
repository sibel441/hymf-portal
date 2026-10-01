'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '@/types/database';
import { INITIAL_PROFILES } from '@/lib/mockData';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  loginAs: (profileId: string) => void;
  logout: () => void;
  updateProfile: (updated: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(INITIAL_PROFILES[0]); // Varsayılan: Grup Lideri Hoca
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  useEffect(() => {
    // Supabase bağlantısını kontrol et
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasValidConfig = supabaseUrl && !supabaseUrl.includes('placeholder') && !supabaseUrl.includes('your-project');

    if (hasValidConfig) {
      try {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setIsSupabaseConnected(true);
            // Profil verisini çek
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setProfile(data as Profile);
                }
              });
          }
        });
      } catch (err) {
        console.warn('Supabase session check error:', err);
      }
    }

    // Yerel depolamadan kayıtlı demo profili kontrol et
    const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('hymf_active_user') : null;
    if (savedUserId) {
      const found = INITIAL_PROFILES.find((p) => p.id === savedUserId);
      if (found) {
        setProfile(found);
      }
    }
    setIsLoading(false);
  }, []);

  const loginAs = (profileId: string) => {
    const found = INITIAL_PROFILES.find((p) => p.id === profileId);
    if (found) {
      setProfile(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hymf_active_user', found.id);
      }
    }
  };

  const logout = () => {
    setProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hymf_active_user');
    }
  };

  const updateProfile = (updated: Partial<Profile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
  };

  const role: UserRole = profile?.role || 'arastirmaci';

  return (
    <AuthContext.Provider
      value={{
        profile,
        role,
        isLoading,
        isSupabaseConnected,
        loginAs,
        logout,
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
