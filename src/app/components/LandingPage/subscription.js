 'use client';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionPlans() {
  const router = useRouter();

  const plans = [
    {
      id: 'Standard',
      name: 'Standard',
      price: '$99',
      period: '/month',
      description: 'Perfect for small businesses',
      features: [
        'Up to 1,000 calls/month',
        'Basic analytics dashboard',
        'Email support',
        'Single language support',
        'Standard call routing',
      ],
      cta: 'Get Started',
      highlighted: false,
      callLimit: '1000',
    },
    {
      id: 'Premium',
      name: 'Premium',
      price: '$299',
      period: '/month',
      description: 'For growing Businesses',
      features: [
        'Up to 10,000 calls/month',
        'Advanced analytics & reports',
        'Priority email & chat support',
        'Multi-language support',
        'Intelligent call routing',
      
      ],
      cta: 'Get Started',
      highlighted: true,
      callLimit: '10000',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large-scale Businesses',
      features: [
        'Unlimited calls/month',
        '24/7 dedicated support',
        '50+ languages supported',
        'Advanced AI customization',
        'Full API access',
        'Custom integrations',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      highlighted: false,
      callLimit: 'custom',
    },
  ];

  const handlePlanSelect = (planId) => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      // User is logged in - redirect based on role
      if (role.toLowerCase() === 'user') {
        // Redirect to user subscriptions page
        router.push('/subscriptions');
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
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 sm:py-4 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                    plan.highlighted
                      ? 'bg-white text-cyan-600 hover:bg-gray-100'
                      : 'bg-cyan-500 text-white hover:bg-cyan-600'
                  }`}
                >
                  {plan.cta}
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
            All plans include 07-day free trial.
          </p>
          {/* <button className="text-cyan-500 font-semibold hover:text-cyan-600 transition-colors">
            Compare all features →
          </button> */}
        </div>
      </div>
    </section>
  );
}