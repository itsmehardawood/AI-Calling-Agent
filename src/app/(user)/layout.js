import React, { Suspense } from "react";
import UserAccessGate from "../components/UserAccessGate";
// import UserAccessGate from "../../components/UserAccessGate";

export default function UserLayout({ children }) {
  // This is a server component. The client-only logic that uses
  // next/navigation hooks (useRouter, usePathname, useSearchParams)
  // lives in `UserAccessGate` which is wrapped in Suspense here so
  // Next knows where client rendering will be used and avoids the
  // CSR bailout warning.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div>Checking user access…</div>
        </div>
      }
    >
      <UserAccessGate>{children}</UserAccessGate>
    </Suspense>
  );
}
