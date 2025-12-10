'use client';

import { useState, useEffect } from 'react';
import { Check, CreditCard, Clock, Calendar } from 'lucide-react';
import { createSubscription, getUserSubscription } from '../../lib/subscriptionApi';
import AdminLayout from '@/app/components/admin/AdminLayout';

export default function AdminSubscriptions() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [userId, setUserId] = useState(null);

  const plans = [
    {
      id: 'Standard',
      name: 'Standard',
      price: '$99',
      period: '/month',
      description: 'Perfect for small businesses',
      minutes: 1000,
      features: [
        'Up to 1,000 minutes/month',
        'Basic analytics dashboard',
        'Email support',
        'Single language support',
        'Standard call routing',
      ],
      highlighted: false,
    },
    {
      id: 'Premium',
      name: 'Premium',
      price: '$299',
      period: '/month',
      description: 'For growing Businesses',
      minutes: 10000,
      features: [
        'Up to 10,000 minutes/month',
        'Advanced analytics & reports',
        'Priority email & chat support',
        'Multi-language support',
        'Intelligent call routing',
      ],
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large-scale Businesses',
      minutes: 999999,
      features: [
        'Unlimited minutes/month',
        '24/7 dedicated support',
        '50+ languages supported',
        'Advanced AI customization',
        'Full API access',
        'Custom integrations',
        'SLA guarantee',
      ],
      highlighted: false,
    },
  ];

  useEffect(() => {
    // Get user_id from localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchCurrentSubscription(storedUserId);
    }
  }, []);

  const fetchCurrentSubscription = async (uid) => {
    try {
      const result = await getUserSubscription(uid);
      if (result.success && result.data) {
        setCurrentSubscription(result.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!userId) {
      alert('Please login to subscribe');
      return;
    }

    if (plan.id === 'enterprise') {
      alert('Please contact our sales team for enterprise pricing');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const subscriptionData = {
        user_id: userId,
        plan_id: plan.id,
        minutes_allocated: plan.minutes,
        is_active: true,
      };

      const result = await createSubscription(subscriptionData);

      if (result.success) {
        localStorage.setItem('isSubscribed', 'true');
        alert(`Successfully subscribed to ${plan.name} plan!`);
        
        // Refresh subscription data
        await fetchCurrentSubscription(userId);
      } else {
        alert(`Failed to subscribe: ${result.error}`);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('An error occurred while subscribing');
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
    
    {/* Header */}
    <div className="mb-5 px-2 ">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Subscription Plans</h1>
      <p className="text-gray-600 mt-1 text-sm">
        Choose the perfect plan for your business needs
      </p>
    </div>

    {/* Current Subscription Card */}
    {currentSubscription && currentSubscription.is_active ? (
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-md p-4 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-4 w-4" />
              <h2 className="text-base font-semibold">Current Subscription</h2>
            </div>

            <p className="text-xl font-bold mb-3">
              {currentSubscription.plan_id} Plan
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-blue-100 text-xs">Minutes Allocated</p>
                <p className="text-lg font-semibold">
                  {currentSubscription.minutes_allocated?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Minutes Used</p>
                <p className="text-lg font-semibold">
                  {currentSubscription.minutes_used?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-xs">Remaining</p>
                <p className="text-lg font-semibold">
                  {(
                    (currentSubscription.minutes_allocated || 0) -
                    (currentSubscription.minutes_used || 0)
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-blue-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="text-xs">
                  Started: {formatDate(currentSubscription.start_date)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  Renews: {formatDate(currentSubscription.end_date)}
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {plans.map((plan) => (
        <div
          key={plan.id}
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
            <h3 className="text-xl sm:text-2xl font-bold mb-1">{plan.name}</h3>
            <p
              className={`text-xs mb-4 ${
                plan.highlighted ? "text-cyan-100" : "text-gray-600"
              }`}
            >
              {plan.description}
            </p>

            <div className="mb-5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-bold">
                  {plan.price}
                </span>
                <span
                  className={`text-xs ${
                    plan.highlighted ? "text-cyan-100" : "text-gray-600"
                  }`}
                >
                  {plan.period}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading && selectedPlan === plan.id}
              className={`w-full py-2 sm:py-3 rounded-md font-semibold transition-all duration-300 mb-6 ${
                plan.highlighted
                  ? "bg-white text-cyan-600 hover:bg-gray-100"
                  : "bg-cyan-500 text-white hover:bg-cyan-600"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading && selectedPlan === plan.id ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Processing...
                </span>
              ) : plan.id === "enterprise" ? (
                "Contact Sales"
              ) : currentSubscription?.plan_id === plan.id ? (
                "Current Plan"
              ) : (
                "Subscribe Now"
              )}
            </button>

            <div className="space-y-3">
              {plan.features.map((feature, i) => (
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

    <div className="mt-12 text-center">
      <p className="text-gray-600 text-sm">All plans include 7-day free trial. Cancel anytime.</p>
    </div>
  </div>
</AdminLayout>

  );
}
