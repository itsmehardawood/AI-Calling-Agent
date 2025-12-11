'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CreditCard, ArrowRight } from 'lucide-react';

/**
 * AdminSubscriptionGate - Protects admin routes based on subscription status
 * Only allows access if user has an active subscription (isSubscribed = true)
 * Redirects to subscription-management page if not subscribed
 */
export default function AdminSubscriptionGate({ children }) {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check subscription status from localStorage
    const subscriptionStatus = localStorage.getItem('isSubscribed');
    const subscriptionTier = localStorage.getItem('subscriptionTier');
    
    // Allow access if subscribed OR if on free tier
    const hasAccess = subscriptionStatus === 'true' || subscriptionTier === 'free';
    setIsSubscribed(hasAccess);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not subscribed, show locked screen with call to action (inside admin layout)
  if (!isSubscribed) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50 p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Subscription Required
            </h2>
            <p className="text-white/90 text-base sm:text-lg">
              Upgrade your account to unlock this feature
            </p>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                What you'll unlock with a subscription:
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Dashboard Access</h4>
                    <p className="text-xs sm:text-sm text-gray-600">View comprehensive business analytics and metrics</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Lead Management</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Track and manage all your customer leads</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">AI Prompts</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Create and manage custom AI calling prompts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Call Transcriptions</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Access full history of call transcriptions</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Advanced Settings</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Customize your account and preferences</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">User Management</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Manage team members and permissions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-700 text-center">
                <span className="font-semibold">💡 Free Trial Available!</span> Try any plan risk-free and unlock all features instantly.
              </p>
            </div>

            <button
              onClick={() => router.push('/subscription-management')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group text-sm sm:text-base"
            >
              <span>View Subscription Plans</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              Questions? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If subscribed, render the protected content
  return <>{children}</>;
}
