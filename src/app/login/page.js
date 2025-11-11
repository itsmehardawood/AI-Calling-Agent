// 'use client';
// import React, { useState } from 'react';
// import { Eye, EyeOff, User, Lock, Mail, Headset, ArrowLeft} from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { loginUser } from '../lib/loginHandler';
// import Image from 'next/image';
// import Link from 'next/link';

// export default function LoginUI() {
//   const router = useRouter();

//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);


// //   const handleLogin = async (e) => {
// //   e.preventDefault();
// //   setError('');
// //   setLoading(true);

// //   const result = await loginUser({ username: email, password });
// //   console.log('✅ Login result:', result);

// //   if (result.success) {
// //     const savedToken = localStorage.getItem('access_token');
// //     // persist role if provided in response
// //     if (result.role) {
// //       localStorage.setItem('role', result.role);
// //     }

// //     // In your login page, after successful login
// //     // if (typeof window !== 'undefined') {
// //     //   localStorage.setItem('userFullName', result.user.full_name); // Adjust based on your API response
// //     // }

// //     // Redirect by role: admin => /admin/dashboard, else => /user/dashboard
// //     const role = (result.role || localStorage.getItem('role') || '').toLowerCase();
// //     if (role === 'admin') {
// //       router.push('/dashboard');
// //     } else {
// //       router.push('/HomePage');
// //     }
// //   } else {
// //     console.error('❌ Error during login:', result.error);
// //     setError(result.error); // shows readable message now
// //   }

// //   setLoading(false);
// // };

// // In your login page handleLogin function
// const handleLogin = async (e) => {
//   e.preventDefault();
//   setError('');
//   setLoading(true);

//   const result = await loginUser({ username: email, password });
//   console.log('✅ Login result:', result);

//   if (result.success) {
//     const savedToken = localStorage.getItem('access_token');
    
//     if (result.role) {
//       localStorage.setItem('role', result.role);
//     }

//     // ✅ Get the name that was stored during signup
//     if (typeof window !== 'undefined') {
//       // Try to get the name that was stored during signup
//       const storedName = localStorage.getItem('userFullName');
      
//       if (!storedName) {
//         // If not found, use email as fallback
//         const emailName = email.split('@')[0];
//         const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
//         localStorage.setItem('userFullName', formattedName);
//         console.log('✅ Using email-based name:', formattedName);
//       } else {
//         console.log('✅ Using stored name:', storedName);
//       }
//     }

//     // Redirect by role
//     const role = (result.role || localStorage.getItem('role') || '').toLowerCase();
//     if (role === 'admin') {
//       router.push('/overview');
//     } else {
//       router.push('/HomePage');
//     }
//   } else {
//     console.error('❌ Error during login:', result.error);
//     setError(result.error);
//   }

//   setLoading(false);
// };
// //bg-[#5831db]
//   return (
//     <div className="min-h-screen  bg-gradient-to-r from-slate-900 to-blue-900 flex items-center justify-center p-4">  
//       {/* Diagonal White Background */} 
//         <div className="absolute inset-0">
//           <div className="w-full h-full bg-blue-600/35 clip-diagonal absolute bottom-0 z-0"></div>
//         </div>
//       {/* Background decorative elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-20 left-10 w-32 h-32 border-2 border-white/20 rounded-full"></div>
//         <div className="absolute top-40 right-20 w-24 h-24 border-2 border-white/15 rounded-full"></div>
//         <div className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-white/10 rounded-full"></div>
//         <div className="absolute bottom-40 right-10 w-20 h-20 border-2 border-white/25 rounded-full"></div>
//       </div>
      
//       {/* Back Button */}
//         <Link
//           href="/"
//           className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors group z-20"
//         >
//           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
//           <span className="text-sm font-medium">Back to Home</span>
//         </Link>
        
//       <div className="absolute z-10 flex flex-col md:flex-row items-center gap-50">
        
//         {/* Left Side - Image */}
//         <div className="hidden md:flex flex-col px-10">
//           <div className="relative w-[480px] h-[480px]">
//             <Image
//               src="/images/Photoroom.png"   // put your uploaded image in /public folder
//               alt="Customer Support Call-agent"
//               fill
//               className="object-contain"
//               priority
//             />
//           </div>
//         </div>

//           {/* Right Login Form */}
//           <div className="bg-white backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">  
//             <div className="flex items-center justify-center mb-6">
//               <div className="bg-blue-600 p-4 rounded-full">
//                 <Headset className="w-6 h-6 text-white" />
//               </div>
//             </div>
            
//             <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
//               Welcome to Calling Agent<span className="text-blue-800"> Sign in</span>
//             </h2>

//             <form onSubmit={handleLogin}
//                className="space-y-4 max-w-120 min-h-73 ">
//               <div>
//                 <label htmlFor="text" className="text-sm font-medium text-slate-700 block mb-2">
//                   Email
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="email"
//                     placeholder="Enter your email"
//                     value={email}
//                     required
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-12 pr-4 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   />
//                 </div>
//               </div>

//               <div>
//               <label htmlFor="text" className="text-sm font-medium text-slate-700 block mb-2">
//                   Password
//                 </label>

//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={password}
//                     required
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full bg-slate-50 border border-slate-200 rounded-lg py-3 pl-12 pr-12 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   />

//                   {/* {error && <p className="text-red-500 text-sm text-center">{error}</p>} */}

//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
//               </div>

//               <div className="flex items-center justify-between">
//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     onClick={() => setRememberMe(!rememberMe)}
//                     className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
//                   />
//                   <span className="ml-2 text-sm text-gray-600">Remember me</span>
//                 </label>
//                 <a href="#" className="text-sm text-blue-500 hover:text-blue-300 transition-colors">
//                   Forgot Password?
//                 </a>
//               </div>

//               <button
//                 type="submit"
//                 disabled = {loading}
//                 className="w-full bg-blue-600 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg"
//               >
//                 {loading ? 'Logging in...' : 'Login'}
//               </button>
//                 {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

//               <div className="text-center">
//                 <p className="text-gray-800 text-sm">
//                   Dont have an account?{' '}
//                   <a href="/signup" className="text-blue-500 font-semibold hover:text-blue-500 transition-colors">
//                     Sign Up
//                   </a>
//                 </p>
//               </div>
//             </form>

//             {/* <div className="mt-6 pt-6 border-t border-slate-700 text-center text-xs text-gray-400">
//               <a href="#" className="hover:text-gray-300 transition-colors mr-4">Terms of Service</a>
//               <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
//             </div> */}
//           </div>
//         </div>
//       </div>
//   );
// }














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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser({ username: email, password });
    console.log(':white_check_mark: Login result:', result);

    if (result.success) {
      const savedToken = localStorage.getItem('access_token');
      
      if (result.role) {
        localStorage.setItem('role', result.role);
      }

      if (typeof window !== 'undefined') {
        const storedName = localStorage.getItem('userFullName');
        
        if (!storedName) {
          const emailName = email.split('@')[0];
          const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          localStorage.setItem('userFullName', formattedName);
          console.log(':white_check_mark: Using email-based name:', formattedName);
        } else {
          console.log(':white_check_mark: Using stored name:', storedName);
        }
      }

      const role = (result.role || localStorage.getItem('role') || '').toLowerCase();
      if (role === 'admin') {
        router.push('/overview');
      } else {
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
          <span className="text-2xl font-bold text-white">Calling-Agent</span>
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

          {/* Social Login Buttons */}
          {/* <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium text-gray-700">Continue with Google</span>
            </button>

            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="font-medium text-gray-700">Continue with Facebook</span>
            </button>
          </div> */}

          {/* Divider */}
          {/* <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or</span>
            </div>
          </div> */}

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
          </form>

          {/* Sign Up Link */}
          {/* <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account yet?{' '}
              <a href="/signup" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                Register for free
              </a>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}