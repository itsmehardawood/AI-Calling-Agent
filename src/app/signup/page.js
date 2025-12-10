"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Headset } from "lucide-react";
import { apiFetch } from "../lib/api.js";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.full_name) newErrors.full_name = "Full Name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await apiFetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        // console.log("errorData:", errorData);
        throw new Error(errorData.message || "User Already exist with this email");
      }

      const responseData = await res.json();

      // Store the user's name and subscription status in localStorage before redirecting
      if (typeof window !== 'undefined') {
        localStorage.setItem('userFullName', formData.full_name);
        
        // Store subscription status from signup response (default to false for new users)
        const isSubscribed = responseData.isSubscribed || false;
        localStorage.setItem('isSubscribed', isSubscribed.toString());
      }

      // Redirect to login page after successful signup
      router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-slate-900 to-blue-900 flex flex-col md:flex-row items-center justify-center p-4 overflow-hidden">
        {/* Diagonal White Background */}
        <div className="absolute inset-0">
          <div className="w-full h-full bg-blue-600/25 clip-diagonal absolute bottom-0 z-0"></div>
        </div>

        {/* Decorative Background Elements */}
        <div className="hidden md:block absolute -right-20 -top-20 w-64 h-64 bg-blue-700 rounded-full opacity-10 animate-pulse z-10"></div>
        <div className="hidden md:block absolute -left-20 -bottom-20 w-80 h-80 bg-slate-700 rounded-full opacity-10 z-10"></div>
        <div className="hidden md:block absolute top-1/2 right-1/4 w-48 h-48 bg-blue-600 rounded-full opacity-10 animate-pulse delay-1000 z-10"></div>
        {/* <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-[length:60px_60px] opacity-5 z-0"></div> */}

        {/* Left Section (Text) - visible only on md and above */}
        <div className="hidden md:flex flex-col justify-center items-start w-1/2 px-10 z-20">
          <h1 className="text-white text-3xl lg:text-4xl font-bold leading-tight">
            AI Calling Agent
            <span className="block text-blue-400 mt-2">
              24/7 Customer Support
            </span>
          </h1>
        </div>

      {/* Form Section */}
      <div className="relative w-full md:w-1/3 max-w-[480] z-20 mt-10 md:mt-0">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex items-center justify-center mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl mb-4 shadow-md">
              <Headset className="w-5 h-5 text-white" />
            </div></div>
            
            <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
              Create your account
            </h1>
          

          <form onSubmit={handleSubmit} className="space-y-3">

            <div className="space-y-2">
              <label htmlFor="text" className="text-sm font-medium text-slate-700 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.full_name ? "border-red-400" : "border-slate-200"
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.email ? "border-red-400" : "border-slate-200"
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-11 pr-12 py-3 bg-slate-50 border ${
                    errors.password ? "border-red-400" : "border-slate-200"
                  } rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-slate-900 to-blue-900 hover:from-slate-800 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing up...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Already have an account? {" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
