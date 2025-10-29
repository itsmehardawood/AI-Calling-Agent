/* eslint-disable react/no-unescaped-entities */
'use client';
import { useState, useEffect } from 'react';
import { Check, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

// Plan data - you might want to move this to a separate data file
const plansData = {
  Standard: {
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
    callLimit: '1000',
  },
  Premium: {
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
    callLimit: '10000',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For large-scale Businesses',
    features: [
      'Unlimited calls/month',
      'Real-time analytics dashboard',
      '24/7 dedicated support',
      '50+ languages supported',
      'Advanced AI customization',
      'Full API access',
      'Custom integrations',
      'SLA guarantee',
    ],
    callLimit: 'custom',
  },
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.planId;
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    expectedCalls: '',
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (planId && plansData[planId]) {
      const plan = plansData[planId];
      setSelectedPlan(plan);
      
      // Set default expected calls based on plan
      if (plan.id !== 'enterprise') {
        setFormData(prev => ({
          ...prev,
          expectedCalls: plan.callLimit
        }));
      }
    } else {
      // Redirect to pricing if invalid plan
      router.push('/pricing');
    }
  }, [planId, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    }
    return value;
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simulate Stripe payment processing
      console.log('Processing payment with Stripe:', {
        plan: selectedPlan.id,
        ...formData,
        payment: {
          ...paymentData,
          cardNumber: '•••• •••• •••• ' + paymentData.cardNumber.slice(-4)
        },
        timestamp: new Date().toISOString(),
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitting(false);
      setSubmitted(true);
    } catch (error) {
      console.error('Payment failed:', error);
      setSubmitting(false);
    }
  };

  const handleBackToPricing = () => {
    router.push('/');
  };

  // Success Page
  if (submitted && selectedPlan) {
    return (
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50 min-h-screen flex items-center">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <Check className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Subscription Successful!
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Thank you for subscribing to our <span className="font-semibold text-cyan-600">{selectedPlan.name}</span> plan. 
              A confirmation email has been sent to <span className="font-semibold">{formData.email}</span>.
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-gray-900 mb-4">What's Next?</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Check your email for setup instructions</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Access your dashboard within 24 hours</span>
                </li>
                <li className="flex gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Start your 07-day free trial immediately</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleBackToPricing}
              className="bg-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
            >
              Back to Pricing
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!selectedPlan) {
    return (
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </section>
    );
  }

  // Checkout Page
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={handleBackToPricing}
          className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Plans
        </button>

        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-gray-600">
            You selected the <span className="font-semibold text-cyan-600">{selectedPlan.name}</span> plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3 space-y-8">
            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Information</h2>
              
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your Company"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  >
                    <option value="">Select your industry</option>
                    <option value="retail">Retail</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="technology">Technology</option>
                    <option value="education">Education</option>
                    <option value="hospitality">Hospitality</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Expected Calls - Only for Enterprise */}
                {selectedPlan.id === 'enterprise' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Expected Monthly Calls
                    </label>
                    <select
                      name="expectedCalls"
                      value={formData.expectedCalls}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                    >
                      <option value="">Select expected volume</option>
                      <option value="100-500">100 - 500</option>
                      <option value="500-1000">500 - 1,000</option>
                      <option value="1000-5000">1,000 - 5,000</option>
                      <option value="5000-10000">5,000 - 10,000</option>
                      <option value="10000+">10,000+</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-8">
                <CreditCard className="w-6 h-6 text-cyan-600" />
                <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
              </div>
              
              <div className="space-y-6">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      setPaymentData(prev => ({ ...prev, cardNumber: formatted }));
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  />
                </div>

                {/* Name on Card */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Name on Card <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nameOnCard"
                    value={paymentData.nameOnCard}
                    onChange={handlePaymentChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={(e) => {
                        const formatted = formatExpiryDate(e.target.value);
                        setPaymentData(prev => ({ ...prev, expiryDate: formatted }));
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      CVV <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handlePaymentChange}
                      placeholder="123"
                      maxLength={4}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.fullName || !formData.email || !formData.company || !formData.phone || !formData.industry || !paymentData.cardNumber || !paymentData.nameOnCard || !paymentData.expiryDate || !paymentData.cvv}
              className="w-full bg-cyan-500 text-white py-4 rounded-lg font-semibold hover:bg-cyan-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Subscribe to ${selectedPlan.name} Plan`
              )}
            </button>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 top-8 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Plan</p>
                <p className="text-2xl font-bold text-gray-900">{selectedPlan.name}</p>
                <p className="text-sm text-gray-600 mt-2">{selectedPlan.description}</p>
                {selectedPlan.id !== 'enterprise' && (
                  <p className="text-sm text-cyan-600 font-semibold mt-2">
                    Call Limit: {selectedPlan.callLimit} calls/month
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {selectedPlan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-1" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
                {selectedPlan.features.length > 4 && (
                  <p className="text-sm text-cyan-600 font-semibold">
                    +{selectedPlan.features.length - 4} more features
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Price</span>
                  <span className="font-bold text-gray-900">{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Free Trial</span>
                  <span className="font-bold text-green-600">07 Days</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total First Month</span>
                  <span className="font-bold text-cyan-600 text-lg">Free</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Charges start after 07-day trial. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}