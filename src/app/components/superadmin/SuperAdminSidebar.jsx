'use client';

import { 
  Globe, 
  Building2, 
  Users, 
  Settings, 
  MenuIcon, 
  User2Icon, 
  X, 
  LogOut,
  BarChart3,
  Shield,
  MapPin,
  FileText,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Global Overview', href: '/global-overview', icon: Globe },
  { name: 'Products & Prompts', href: '/products-prompts', icon: FileText },
  { name: 'Numbers & Regions', href: '/numbers-regions', icon: MapPin },
 

  { name: 'Lead Activity Feed', href: '/lead-activity-feed', icon: Activity },
   { name: 'Analytics', href: '/analytics', icon: BarChart3 },

  { name: 'Settings & Compliance', href: '/system-settings', icon: Settings },
//   { name: 'Tenant Management', href: '/tenants', icon: Building2 },
//   { name: 'User Management', href: '/user-management', icon: Users },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    // Clear localStorage and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile menu button with logout - Fixed position */}
      {!sidebarOpen && (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
          <div className="flex items-center justify-between p-3">
            <button
              type="button"
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            
            <h1 className="text-base font-bold text-white truncate">SuperAdmin Panel</h1>
            
            <button
              type="button"
              className="p-2 text-white hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-colors"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          
          {/* Sidebar */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">AI Calling Agent</h1>
                <p className="text-xs text-blue-200 mt-0.5">SuperAdmin Dashboard</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="space-y-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 sm:px-4 py-2.5 text-sm sm:text-base font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-blue-700 shadow-lg'
                          : 'text-white hover:bg-blue-600/20 hover:text-white'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-700' : 'text-blue-200'
                      }`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* User profile section - Mobile */}
            <div className="border-t border-slate-700 bg-slate-800/50">
              <div className="flex items-center p-4 sm:p-5">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mr-3 shadow-md flex-shrink-0">
                  <User2Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Super Admin</p>
                  <p className="text-xs text-blue-200 truncate">System Administrator</p>
                </div>
              </div>
              
              {/* Logout Button - Mobile */}
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-800 to-slate-900 pt-5 pb-4 overflow-y-auto shadow-xl">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <div className="w-full">
              <h1 className="text-xl xl:text-2xl font-bold text-white">AI Calling Agent</h1>
              <p className="text-xs text-blue-200 mt-1">SuperAdmin Dashboard</p>
            </div>
          </div>

          {/* Navigation */}    
          <nav className="flex-1 flex flex-col">
            <div className="px-4 space-y-1.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm xl:text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-lg transform scale-[1.02]'
                        : 'text-white hover:bg-blue-600/20 hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                        isActive ? 'text-blue-700' : 'text-blue-200 group-hover:text-white group-hover:scale-110'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User profile section */}
          <div className="flex-shrink-0 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-center p-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mr-3 shadow-md flex-shrink-0">
                <User2Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Super Admin</p>
                <p className="text-xs text-blue-200 truncate">System Administrator</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <div className="px-4 pb-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all duration-200 group"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
