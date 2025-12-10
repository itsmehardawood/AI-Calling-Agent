// app/user/dashboard/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Phone, 
  Users, 
  FileText, 
  BarChart3,
  Clock,
  CheckCircle,
  Sparkles,
  Bot,
  MessageCircle,
  Target,
  Play,
  Calendar,
  TrendingUp,
  Award,
  History,
  LucideLogOut
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    conversionRate: "0%",
    todayCalls: 0,
    averageDuration: "0m",
    weeklyGoal: 25,
    weeklyProgress: 0
  });
  const [recentCalls, setRecentCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user name from localStorage
    const loadUserData = async () => {
      setIsLoading(true);
      
      // Get user name from localStorage
      if (typeof window !== 'undefined') {
        const storedName = localStorage.getItem('userFullName');
        if (storedName) {
          setUserName(storedName);
        } else {
          // Fallback to a default or get from API if available
          setUserName("Agent");
        }
      }
      
      setTimeout(() => {
        setUserStats({
          totalCalls: 89,
          successfulCalls: 67,
          conversionRate: "75%",
          todayCalls: 5,
          averageDuration: "3m 45s",
          weeklyGoal: 25,
          weeklyProgress: 18
        });
        
        setRecentCalls([
          { id: 1, customer: "John Smith", status: "completed", duration: "4m 12s", time: "2 hours ago", outcome: "Interested" },
          { id: 2, customer: "Sarah Johnson", status: "completed", duration: "3m 45s", time: "3 hours ago", outcome: "Scheduled" },
          { id: 3, customer: "Mike Chen", status: "missed", duration: "0m", time: "4 hours ago", outcome: "No Answer" },
          { id: 4, customer: "Emily Davis", status: "completed", duration: "5m 23s", time: "5 hours ago", outcome: "Follow-up" }
        ]);
        
        setIsLoading(false);
      }, 1000);
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    // Clear localStorage and redirect to login
   localStorage.removeItem('access_token');
  localStorage.removeItem('role');
  localStorage.removeItem('userFullName');
  localStorage.removeItem('user_id');
  localStorage.removeItem('isSubscribed');
  router.push('/login');
  };

  // ... rest of your component code remains the same

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calling Agent</h1>
                <p className="text-gray-500 text-sm">User Panel</p>
              </div>
            </div>
            
            {/* User Info with Logout Button */}
            <div className="flex flex-row items-end gap-3">
              <span className="text-sm text-gray-600 font-semibold">Welcome, {userName}!</span>
              <button
                onClick={() => {
                  // Clear localStorage and redirect to login
                  handleLogout()
                }}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-100 rounded-md border border-red-200 transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Banner Image Section with Overlay Text */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          {/* Background Image - Replace the src with your image path */}
          <div 
            className="w-full h-64 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/banner.png')" // Replace with your image path
            }}
          >
            {/* Dark Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white p-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                  <Bot className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
                Welcome back, {userName}!
              </h1>
              <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto drop-shadow-md">
                Ready to create amazing conversations with your AI calling assistant?
              </p>
              {/* <div className="flex items-center justify-center gap-6 mt-4 text-sm text-white text-opacity-90">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="drop-shadow-sm">AI Assistant Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-300" />
                  <span className="drop-shadow-sm">Ready to Call</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today&apos;s Calls</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.todayCalls}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.averageDuration}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Calls</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.totalCalls}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-gray-600 text-sm">Your calling partner is ready</p>
            </div>
          </div>

          {/* Call to Action - Full Width */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-800 rounded-lg p-6 text-white text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-1 ml-2">Ready to make calls?</h3>
                <p className="text-blue-100 text-sm ml-2">
                  Start connecting with customers using AI-powered conversations
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/start-call')}
              className="w-full max-w-xs bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors text-lg mx-auto"
            >
              Start New Call
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}