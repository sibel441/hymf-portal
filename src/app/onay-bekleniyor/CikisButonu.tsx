'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function CikisButonu() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/giris');
  };

  return (
    <Button variant="secondary" onClick={handleLogout} className="w-full">
      Çıkış Yap
    </Button>
  );
}
