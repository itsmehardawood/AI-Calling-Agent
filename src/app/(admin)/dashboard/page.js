// app/admin/page.jsx
'use client';
import { useState, React } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/components/admin/AdminLayout';
import DashboardContent from '@/app/components/admin/HomeScreen';
import { BotIcon, Building, FileTextIcon, LucideLogOut } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const handleLogout = () => {
    // Clear localStorage and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('role');
    router.push('/login');
  };
  return (
    <AdminLayout>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate pl-4">
            Admin Dashboard
          </h2>
        </div>

        <button
              onClick={() => handleLogout()}
              className="inline-flex items-center gap-2 bg-red-700 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <LucideLogOut size={16} />
              Logout
            </button>
      </div>

      {/* Stats cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 px-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Businesses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">4</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <FileTextIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Businesses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">1</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <BotIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Agents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">4</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-8 px-4">
        <div className="bg-white shadow rounded-lg">
          <DashboardContent/>
        </div>
      </div>
    </AdminLayout>
  );
}









