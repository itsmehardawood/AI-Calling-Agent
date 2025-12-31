 'use client';
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPlans } from '../../lib/subscriptionApi';

export default function SubscriptionPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
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

  const handlePlanSelect = (planId) => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      // User is logged in - redirect based on role
      if (role.toLowerCase() === 'user') {
        // Redirect to user subscriptions page
        router.push('/subscription-management');
      } else if (role.toLowerCase() === 'admin') {
        // Redirect to admin dashboard
        router.push('/overview');
      } else {
        // Fallback
        router.push('/subscriptions');
      }
    } else {
      // User not logged in - redirect to signup
      router.push('/signup');
    }
  };

 return (
  <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12 md:mb-16">
        <div className="inline-block bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          Subscription Plans
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Simple, Transparent <span className="text-cyan-500">Pricing</span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Choose the perfect plan for your business. Scale up or down anytime with no hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.plan_id}
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
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                {plan.plan_name}
              </h3>

              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-cyan-100' : 'text-gray-600'}`}>
                {plan.call_minutes?.toLocaleString()} minutes for {plan.duration_days} days
              </p>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-bold">
                    ${plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-cyan-100' : 'text-gray-600'}`}>
                    / {plan.duration_days} days
                  </span>
                 
                </div>
              </div>

              <button
                onClick={() => handlePlanSelect(plan.plan_id)}
                className={`w-full py-3 sm:py-4 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                  plan.highlighted
                    ? 'bg-white text-cyan-600 hover:bg-gray-100'
                    : 'bg-cyan-500 text-white hover:bg-cyan-600'
                }`}
              >
                Get Started
              </button>

              <div className="space-y-4">
                {plan.features?.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
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
  </section>
);

}