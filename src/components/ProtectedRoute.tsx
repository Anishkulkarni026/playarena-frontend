// src/components/ProtectedRoute.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { isLoggedIn, role, isLoading } = useAuth(); // 1. Get global isLoading
  const router = useRouter();

  // 2. We use useEffect to wait for auth to be ready
  useEffect(() => {
    // If auth is still loading, just wait. Don't do anything yet.
    if (isLoading) {
      return;
    }

    // Now we know auth is ready. Time to check.
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    // User is logged in, now check their role
    if (!allowedRoles.includes(role!)) { // The '!' is safe because role is set if isLoggedIn
      router.push('/'); // Redirect to home page
      return;
    }

    // If all checks pass, the component will just render children
  }, [isLoading, isLoggedIn, role, allowedRoles, router]);


  // 3. Show "Loading..." ONLY if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  // 4. If auth is loaded and checks passed, show the page.
  // If checks failed, useEffect redirected and this will be unmounted.
  if (isLoggedIn && role && allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  // 5. Fallback while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <p className="text-lg text-gray-700">Loading...</p>
    </div>
  );
}