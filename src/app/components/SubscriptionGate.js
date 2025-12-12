'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Lock, CreditCard } from 'lucide-react';

export default function SubscriptionGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check subscription status from localStorage
    const subscriptionStatus = localStorage.getItem('isSubscribed');
    const subscribed = subscriptionStatus === 'true';
    setIsSubscribed(subscribed);
    setIsLoading(false);

    // If not subscribed and not on subscription page, redirect
    if (!subscribed && !pathname.includes('/subscriptions')) {
      // Allow access to subscription page only
      const isSubscriptionPage = pathname === '/subscriptions';
      if (!isSubscriptionPage) {
        router.push('/subscriptions');
      }
    }
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If on subscription page, always render
  if (pathname.includes('/subscriptions')) {
    return <>{children}</>;
  }

  // If not subscribed, show locked screen
  if (!isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Subscription Required
            </h2>
            <p className="text-gray-600">
              Please subscribe to a plan to access all features
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                What you will get:
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Full access to AI calling features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Minutes-based calling system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Advanced analytics & reports</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => router.push('/subscriptions')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            View Subscription Plans
          </button>
        </div>
      </div>
    );
  }

  // If subscribed, render children
  return <>{children}</>;
}
