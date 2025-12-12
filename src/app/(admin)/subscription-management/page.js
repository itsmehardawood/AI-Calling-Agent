'use client';

import { useState, useEffect } from 'react';
import { Check, CreditCard, Clock, Calendar } from 'lucide-react';
import { getPlans, subscribeToPlan, getUserSubscriptionById } from '../../lib/subscriptionApi';
import AdminLayout from '@/app/components/admin/AdminLayout';
import CustomToast from '@/app/components/CustomToast';

export default function AdminSubscriptions() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [userId, setUserId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    // Get user_id from localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchCurrentSubscription(storedUserId);
    }
    
    // Fetch available plans
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const result = await getPlans();
      if (result.success && result.data) {
        // Mark the second plan as highlighted (Premium)
        const formattedPlans = result.data.map((plan, index) => ({
          ...plan,
          highlighted: index === 1, // Highlight the second plan
        }));
        setPlans(formattedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchCurrentSubscription = async (uid) => {
    try {
      const result = await getUserSubscriptionById(uid);
      if (result.success && result.data) {
        setCurrentSubscription(result.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!userId) {
      showToast('Please login to subscribe', 'error');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.plan_id);

    try {
      const result = await subscribeToPlan(userId, plan.plan_id);

      if (result.success) {
        localStorage.setItem('isSubscribed', 'true');
        showToast(`Successfully subscribed to ${plan.plan_name} plan!`, 'success');
        
        // Refresh subscription data
        await fetchCurrentSubscription(userId);
      } else {
        showToast(`Failed to subscribe: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      showToast('An error occurred while subscribing', 'error');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
  <AdminLayout>
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 lg:p-4">
    
    {/* Toast Notification */}
    {toast && (
      <CustomToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}
    
    {/* Toast Notification */}
    {toast && (
      <CustomToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}
    
    {/* Header */}
    <div className="mb-5 px-2 ">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Subscription Plans</h1>
      <p className="text-gray-600 mt-1 text-sm">
        Choose the perfect plan for your business needs
      </p>
    </div>

    {/* Current Subscription Card */}
    {currentSubscription ? (
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-md p-4 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4" />
              <h2 className="text-base font-semibold">Current Subscription</h2>
            </div>

            <p className="text-xl font-bold mb-3">
              {currentSubscription.plan_name} Plan
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-blue-100 text-xs">Call Minutes</p>
                <p className="text-lg font-semibold">
                  {currentSubscription.call_minutes?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Duration</p>
                <p className="text-lg font-semibold">
                  {currentSubscription.duration_days} days
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-blue-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">
                  Started: {formatDate(currentSubscription.subscribed_on)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  Expires: {formatDate(currentSubscription.expires_on)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/20 px-3 py-1 rounded-md">
            <span className="text-xs font-semibold">Active</span>
          </div>
        </div>
      </div>
    ) : (
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl shadow-md p-4 mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-lg">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">No Active Subscription</h2>
            <p className="text-gray-200 text-sm mt-1">
              Choose a plan below to get started with AI Calling Agent
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Plans */}
    {plansLoading ? (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {plans.map((plan) => (
          <div
            key={plan.plan_id}
            className={`relative rounded-xl transition-all duration-300 hover:shadow-xl ${
              plan.highlighted
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl"
                : "bg-white text-gray-900 border border-gray-200 shadow-md"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-cyan-300 text-cyan-900 px-3 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </span>
              </div>
            )}

            <div className="p-4 sm:p-5">
              <h3 className="text-xl sm:text-2xl font-bold mb-1">{plan.plan_name}</h3>
              <p
                className={`text-xs mb-4 ${
                  plan.highlighted ? "text-cyan-100" : "text-gray-600"
                }`}
              >
                {plan.call_minutes.toLocaleString()} minutes for {plan.duration_days} days
              </p>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold">
                    ${plan.price}
                  </span>
                  <span
                    className={`text-xs ${
                      plan.highlighted ? "text-cyan-100" : "text-gray-600"
                    }`}
                  >
                    / {plan.duration_days} days
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading && selectedPlan === plan.plan_id}
                className={`w-full py-2 sm:py-3 rounded-md font-semibold transition-all duration-300 mb-6 ${
                  plan.highlighted
                    ? "bg-white text-cyan-600 hover:bg-gray-100"
                    : "bg-cyan-500 text-white hover:bg-cyan-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading && selectedPlan === plan.plan_id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Processing...
                  </span>
                ) : currentSubscription?.plan_id === plan.plan_id ? (
                  "Current Plan"
                ) : (
                  "Subscribe Now"
                )}
              </button>

              <div className="space-y-3">
                {plan.features && plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? "text-cyan-200" : "text-cyan-500"
                      }`}
                    />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="mt-12 text-center">
      <p className="text-gray-600 text-sm">All plans include 7-day free trial. Cancel anytime.</p>
    </div>
  </div>
</AdminLayout>

  );
}
