'use client';

import { useState, useEffect } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSubscription, getUserSubscription } from '../../lib/subscriptionApi';

export default function UserSubscriptionPage() {
  const router = useRouter();
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
      router.push('/login');
      return;
    }

    if (plan.id === 'enterprise') {
      // For enterprise, redirect to contact sales or show contact form
      alert('Please contact our sales team for enterprise pricing');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      // Create subscription
      const subscriptionData = {
        user_id: userId,
        plan_id: plan.id,
        minutes_allocated: plan.minutes,
        is_active: true,
      };

      const result = await createSubscription(subscriptionData);

      if (result.success) {
        // Update localStorage
        localStorage.setItem('isSubscribed', 'true');
        
        // Show success message
        alert(`Successfully subscribed to ${plan.name} plan!`);
        
        // Redirect to dashboard/home
        router.push('/HomePage');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-12 md:mb-16 max-w-7xl mx-auto">
        <div className="inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          Subscription Plans
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Choose Your <span className="text-cyan-500">Perfect Plan</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Unlock full access to AI Calling Agent. Select a plan and start making calls today!
        </p>

        {/* Current subscription banner */}
        {currentSubscription && currentSubscription.is_active && (
          <div className="mt-6 inline-block bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-lg">
            <p className="font-semibold">
              Current Plan: {currentSubscription.plan_id} | 
              Minutes: {currentSubscription.minutes_allocated}
            </p>
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl transition-all duration-300 hover:shadow-2xl ${
                plan.highlighted
                  ? 'md:scale-105 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cyan-300 text-cyan-900 px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="p-6 sm:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-cyan-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-cyan-100' : 'text-gray-600'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading && selectedPlan === plan.id}
                  className={`w-full py-3 sm:py-4 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                    plan.highlighted
                      ? 'bg-white text-cyan-600 hover:bg-gray-100'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading && selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                      Processing...
                    </span>
                  ) : plan.id === 'enterprise' ? (
                    'Contact Sales'
                  ) : currentSubscription?.plan_id === plan.id ? (
                    'Current Plan'
                  ) : (
                    'Subscribe Now'
                  )}
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? 'text-cyan-200' : 'text-cyan-500'
                        }`}
                      />
                      <span className="text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
