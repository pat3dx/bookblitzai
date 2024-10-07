'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

const ClientRedirect = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn && window.location.pathname === '/') {
      router.push('/ebook-generator');
    }
  }, [isSignedIn, router]);

  return null;
};

export default ClientRedirect;