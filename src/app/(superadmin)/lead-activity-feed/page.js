/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Activity, RefreshCw } from "lucide-react";
import SuperAdminLayout from "@/app/components/superadmin/SuperAdminLayout";
import CustomToast from "@/app/components/CustomToast";
import ActivityStatsCards from "@/app/components/superadmin/lead-activity-feed/ActivityStatsCards";
import ActivityFilters from "@/app/components/superadmin/lead-activity-feed/ActivityFilters";
import ActivityTable from "@/app/components/superadmin/lead-activity-feed/ActivityTable";
import ActivityCard from "@/app/components/superadmin/lead-activity-feed/ActivityCard";
import Pagination from "@/app/components/admin/leads/Pagination";
import EmptyState from "@/app/components/superadmin/lead-activity-feed/EmptyState";

// Mock data generator
const generateMockActivities = () => {
  const tenants = [
    "Acme Corp", "Tech Solutions Inc", "Global Services Ltd", 
    "Innovation Hub", "Digital Dynamics", "Smart Systems Co",
    "Future Tech LLC", "NextGen Solutions", "Alpha Industries",
    "Beta Enterprises"
  ];
  
  const statuses = ["qualified", "not_qualified", "in_progress", "callback_requested"];
  const products = ["Product A", "Product B", "Product C", "Enterprise Suite", "Starter Pack"];
  
  const activities = [];
  const now = Date.now();
  
  for (let i = 0; i < 150; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    
    const timestamp = new Date(now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
    
    activities.push({
      id: `activity-${i + 1}`,
      tenant_id: `tenant-${Math.floor(Math.random() * 10) + 1}`,
      tenant_name: tenants[Math.floor(Math.random() * tenants.length)],
      lead_email: `lead${i + 1}@example.com`,
      lead_phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      company_name: Math.random() > 0.3 ? `Company ${Math.floor(Math.random() * 100)}` : null,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      product_name: products[Math.floor(Math.random() * products.length)],
      call_duration: Math.floor(Math.random() * 600) + 30, // 30-630 seconds
      created_at: timestamp.toISOString(),
      notes: Math.random() > 0.5 ? "Customer showed interest in enterprise plan" : null,
    });
  }
  
  return activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export default function LeadActivityFeedPage() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filters
  const [filters, setFilters] = useState({
    searchTerm: "",
    tenant: "",
    status: "",
    dateRange: "all", // all, today, week, month
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filters, currentPage]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/superadmin/lead-activity-feed');
      // const data = await response.json();
      
      // Using mock data for now
      setTimeout(() => {
        const mockData = generateMockActivities();
        setActivities(mockData);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching activities:", error);
      showToast("Error fetching activities: " + error.message, 'error');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.lead_email.toLowerCase().includes(searchLower) ||
        activity.lead_phone.includes(searchLower) ||
        activity.tenant_name.toLowerCase().includes(searchLower) ||
        (activity.company_name && activity.company_name.toLowerCase().includes(searchLower))
      );
    }

    // Tenant filter
    if (filters.tenant) {
      filtered = filtered.filter(activity => activity.tenant_name === filters.tenant);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(activity => activity.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(activity => {
        const activityDate = new Date(activity.created_at);
        
        switch (filters.dateRange) {
          case "today":
            return activityDate >= startOfToday;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return activityDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return activityDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredActivities(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleRefresh = () => {
    fetchActivities();
    showToast("Activity feed refreshed", 'success');
  };

  // Get unique tenants for filter dropdown
  const uniqueTenants = [...new Set(activities.map(a => a.tenant_name))].sort();

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const pagination = {
    page: currentPage,
    total_pages: totalPages,
    total_leads: filteredActivities.length,
    per_page: ITEMS_PER_PAGE,
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-5">
        {/* Page Header */}
        <div className="px-3 sm:px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="text-purple-600" size={18} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Lead Activity Feed
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  Monitor call activities across all tenants (Read-only)
                </p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <ActivityStatsCards activities={filteredActivities} allActivities={activities} />

        {/* Filters */}
        <ActivityFilters 
          filters={filters}
          onFilterChange={handleFilterChange}
          tenants={uniqueTenants}
        />

        {/* Loading State */}
        {loading ? (
          <div className="px-3 sm:px-5">
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-500">Loading activities...</p>
            </div>
          </div>
        ) : paginatedActivities.length === 0 ? (
          <div className="px-3 sm:px-5">
            <EmptyState hasFilters={Object.values(filters).some(v => v && v !== 'all')} />
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="block lg:hidden px-3 sm:px-5">
              <div className="space-y-3">
                {paginatedActivities.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block px-5">
              <ActivityTable activities={paginatedActivities} />
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <CustomToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </SuperAdminLayout>
  );
}
