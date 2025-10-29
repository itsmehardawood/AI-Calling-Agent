"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function UserAccessGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Allow direct call -> conversation navigation without auth blocking
    const isConversation = pathname?.toLowerCase().includes("/conversation");
    const hasCallId = !!searchParams?.get("call_id");
    if (isConversation && hasCallId) {
      if (mounted) setChecking(false);
      return () => {
        mounted = false;
      };
    }

    // Role-based gating: only check localStorage AFTER login has stored it.
    // If missing, don't block or redirect; render children.
    const storedRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    if (storedRole && storedRole.toLowerCase() === "admin") {
      router.replace("/dashboard");
      return () => {
        mounted = false;
      };
    }

    if (mounted) setChecking(false);
    return () => {
      mounted = false;
    };
  }, [router, pathname, searchParams]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Checking user access…</div>
      </div>
    );
  }

  return <>{children}</>;
}
