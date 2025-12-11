
'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Headset } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { loginUser } from '../lib/loginHandler';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginUI() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load remembered email on component mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      const wasRemembered = localStorage.getItem('rememberMe') === 'true';
      
      if (rememberedEmail && wasRemembered) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser({ username: email, password });
    // console.log(':white_check_mark: Login result:', result);

    if (result.success) {
      // Handle Remember Me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }

      // Store user_id and role in localStorage
      if (result.user_id) {
        localStorage.setItem('user_id', result.user_id);
      }
      
      if (result.role) {
        localStorage.setItem('role', result.role);
      }

        if (result.isSubscribed) {
        localStorage.setItem('isSubscribed', result.isSubscribed);

      }

      // Store subscription status
      if (typeof result.isSubscribed !== 'undefined') {
        localStorage.setItem('isSubscribed', result.isSubscribed.toString());
      }

      if (typeof window !== 'undefined') {
        const storedName = localStorage.getItem('userFullName');
        
        if (!storedName) {
          const emailName = email.split('@')[0];
          const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          localStorage.setItem('userFullName', formattedName);
        } else {
        }
      }

      // Redirect based on role
      const role = (result.role || localStorage.getItem('role') || '').toLowerCase();
      if (role === 'admin') {
        // SuperAdmin - redirect to global overview
        router.push('/global-overview');
      } else if (role === 'user') {
        // Business user - redirect to overview dashboard
        router.push('/overview');
      } else {
        // Fallback for any other role
        router.push('/HomePage');
      }
    } else {
      console.error(':x: Error during login:', result.error);
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 flex">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
        <div className="absolute inset-0 bg-blue-600/20"></div>
        
        {/* Back Button  & Logo */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-3 text-white hover:opacity-90 transition-opacity group z-20"
        >
          <div className="bg-white p-2.5 rounded-xl">
            <Headset className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-white">Neurovise Calling-Agent</span>
        </Link>
        
        <div className="relative z-10 text-center mt-15">
          <h1 className="text-3xl font-bold text-white mb-4">
            Empower your business with AI
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Discover intelligent calling agent solutions.
          </p>
          
          <div className="relative w-[480px] h-[480px] mx-auto">
            <Image
              src="/images/gradient-npl-illustration_52683-80462-Photoroom.png"
              alt="AI Calling Agent"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white/20 rounded-full"></div>
        <div className="absolute bottom-32 left-32 w-24 h-24 border-2 border-white/15 rounded-full"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 border-2 border-white/10 rounded-full"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 flex items-center justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Log in to your account
            </h2>
          </div>


          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                E-mail address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Type your password here"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                forgot password?
              </a>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            {/* Sign Up Text */}
<div className="text-center mt-2">
  <p className="text-sm text-gray-700">
    Don’t have an account?{" "}
    <Link
      href="/signup"
      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
    >
      Sign up
    </Link>
  </p>
</div>

          </form>

      
        </div>
      </div>
    </div>
  );
}