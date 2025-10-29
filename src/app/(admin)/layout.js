"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const AUTH_ME_URL = BASE_URL + "/api/auth/me";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Prefer client-side stored role for faster checks
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    if (storedRole) {
      if (storedRole.toLowerCase() !== 'admin') {
        router.replace('/start-call');
      } else {
        if (mounted) setChecking(false);
      }
      return () => { mounted = false; };
    }

    // Fallback: fetch /api/auth/me to determine role and persist it
    (async () => {
      try {
        const res = await fetch(AUTH_ME_URL, { credentials: 'include' });
        if (!mounted) return;
        if (res.status !== 200) {
          router.replace('/');
          return;
        }
        const user = await res.json();
        const role = (user?.role || '').toLowerCase();
        // Persist role for future fast checks
        if (role) localStorage.setItem('role', role);
        if (role !== 'admin') {
          router.replace('/HomePage');
          return;
        }
      } catch (e) {
        router.replace('/');
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => { mounted = false; };
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Checking admin access…</div>
      </div>
    );
  }

  return <>{children}</>;
}
