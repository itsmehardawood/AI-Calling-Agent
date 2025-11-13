// components/admin/Sidebar.jsx
'use client';

import {Building2Icon, FileTextIcon, Home, MenuIcon, Settings, User2Icon, UserIcon, Users, X, BarChart3, BookDashed, BookDashedIcon, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/overview', icon: Home },
  // { name: 'Dashboard', href: '/dashboard', icon: BookDashedIcon },
//   { name: 'Businesses', href: '/businesses', icon: Building2Icon },
  { name: 'Products', href: '/prompts', icon: FileTextIcon },
  
  // { name: 'Agents', href: '/users', icon: UserIcon },
  { name: 'Leads', href: '/Leads', icon: Users },
  { name: 'Transcription History', href: '/TranscriptionHistory', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          className="p-2 text-gray-700 bg-white rounded-md shadow-lg"
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold text-gray-800">AI Agent Admin</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-6 py-3 text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-70 lg:flex-col">
        <div className="flex flex-col flex-grow bg-slate-800 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6">
            <h1 className="text-2xl font-bold text-white">AI Calling Agent</h1>
          </div>

          {/* Navigation */}    
          <nav className="mt-15 flex-1 flex flex-col text-lg ">
            <div className="px-4 space-y-2 mb-14">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-md font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-md'
                        : 'text-white hover:bg-blue-500 hover:bg-opacity-30 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-blue-700' : 'text-blue-100 group-hover:text-white'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User profile section */}
          <div className="flex-shrink-0 flex border-t border-blue-400 p-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full mr-3">
                <User2Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs font-medium text-blue-100">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}