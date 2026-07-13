'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getStoredUser } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      router.replace(user?.role === 'ADMIN' ? '/admin' : '/send');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
