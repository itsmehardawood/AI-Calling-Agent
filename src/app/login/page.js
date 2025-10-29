'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Headset, ArrowLeft} from 'lucide-react';
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


//   const handleLogin = async (e) => {
//   e.preventDefault();
//   setError('');
//   setLoading(true);

//   const result = await loginUser({ username: email, password });
//   console.log('✅ Login result:', result);

//   if (result.success) {
//     const savedToken = localStorage.getItem('access_token');
//     // persist role if provided in response
//     if (result.role) {
//       localStorage.setItem('role', result.role);
//     }

//     // In your login page, after successful login
//     // if (typeof window !== 'undefined') {
//     //   localStorage.setItem('userFullName', result.user.full_name); // Adjust based on your API response
//     // }

//     // Redirect by role: admin => /admin/dashboard, else => /user/dashboard
//     const role = (result.role || localStorage.getItem('role') || '').toLowerCase();
//     if (role === 'admin') {
//       router.push('/dashboard');
//     } else {
//       router.push('/HomePage');
//     }
//   } else {
//     console.error('❌ Error during login:', result.error);
//     setError(result.error); // shows readable message now
//   }

//   setLoading(false);
// };

// In your login page handleLogin function
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const result = await loginUser({ username: email, password });
  console.log('✅ Login result:', result);

  if (result.success) {
    const savedToken = localStorage.getItem('access_token');
    
    if (result.role) {
      localStorage.setItem('role', result.role);
    }

    // ✅ Get the name that was stored during signup
    if (typeof window !== 'undefined') {
      // Try to get the name that was stored during signup
      const storedName = localStorage.getItem('userFullName');
      
      if (!storedName) {
        // If not found, use email as fallback
        const emailName = email.split('@')[0];
        const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        localStorage.setItem('userFullName', formattedName);
        console.log('✅ Using email-based name:', formattedName);
      } else {
        console.log('✅ Using stored name:', storedName);
      }
    }

    // Redirect by role
    const role = (result.role || localStorage.getItem('role') || '').toLowerCase();
    if (role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/HomePage');
    }
  } else {
    console.error('❌ Error during login:', result.error);
    setError(result.error);
  }

  setLoading(false);
};
//bg-[#5831db]
  return (
    <div className="min-h-screen  bg-gradient-to-r from-slate-900 to-blue-900 flex items-center justify-center p-4">  
      {/* Diagonal White Background */} 
        <div className="absolute inset-0">
          <div className="w-full h-full bg-blue-600/35 clip-diagonal absolute bottom-0 z-0"></div>
        </div>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white/15 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-white/10 rounded-full"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 border-2 border-white/25 rounded-full"></div>
      </div>
      
      {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors group z-20"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
      <div className="absolute z-10 flex flex-col md:flex-row items-center gap-50">
        
        {/* Left Side - Image */}
        <div className="hidden md:flex flex-col px-10">
          <div className="relative w-[480px] h-[480px]">
            <Image
              src="/images/Photoroom.png"   // put your uploaded image in /public folder
              alt="Customer Support Call-agent"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

          {/* Right Login Form */}
          <div className="bg-white backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">  
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full">
                <Headset className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
              Welcome to Calling Agent<span className="text-blue-800"> Sign in</span>
            </h2>

            <form onSubmit={handleLogin}
               className="space-y-4 max-w-120 min-h-73 ">
              <div>
                <label htmlFor="text" className="text-sm font-medium text-slate-700 block mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-12 pr-4 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
              <label htmlFor="text" className="text-sm font-medium text-slate-700 block mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-12 pr-12 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />

                  {/* {error && <p className="text-red-500 text-sm text-center">{error}</p>} */}

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    onClick={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-500 hover:text-blue-300 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled = {loading}
                className="w-full bg-blue-600 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

              <div className="text-center">
                <p className="text-gray-800 text-sm">
                  Dont have an account?{' '}
                  <a href="/signup" className="text-blue-500 font-semibold hover:text-blue-500 transition-colors">
                    Sign Up
                  </a>
                </p>
              </div>
            </form>

            {/* <div className="mt-6 pt-6 border-t border-slate-700 text-center text-xs text-gray-400">
              <a href="#" className="hover:text-gray-300 transition-colors mr-4">Terms of Service</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            </div> */}
          </div>
        </div>
      </div>
  );
}