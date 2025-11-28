/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/app/components/superadmin/SuperAdminLayout';
import { getApiUrl } from '@/config/api';
import { MapPin, RefreshCw, Phone } from 'lucide-react';
import RegionOverview from '@/app/components/superadmin/numbers-regions/RegionOverview';
import NumbersTable from '@/app/components/superadmin/numbers-regions/NumbersTable';
import RegionalStats from '@/app/components/superadmin/numbers-regions/RegionalStats';

export default function NumbersRegionsPage() {
  const [regionsData, setRegionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchRegionalData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make API call to get regional numbers data
        const apiUrl = getApiUrl('/super_admin/numbers-regions');
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch regional data');
        }

        const data = await response.json();
        setRegionsData(data.regions || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching regional data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRegionalData();
  }, []);

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-5">
        {/* Header */}
        <div className="px-3 sm:px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Numbers & Regions
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                View tenant phone numbers and call volumes by region (Read-only)
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-3 sm:px-5">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
              <RefreshCw size={18} className="text-blue-600 animate-spin flex-shrink-0" />
              <p className="text-sm sm:text-base text-blue-800">Loading regional data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-3 sm:px-5">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base text-red-800 font-medium">
                Error loading data: {error}
              </p>
            </div>
          </div>
        )}

        {/* Region Overview Stats */}
        <div className="px-3 sm:px-5">
          <RegionOverview data={regionsData} loading={loading} />
        </div>

        {/* Regional Statistics Charts */}
        <div className="px-3 sm:px-5">
          <RegionalStats data={regionsData} loading={loading} />
        </div>

        {/* Phone Numbers Table */}
        <div className="px-3 sm:px-5">
          <NumbersTable data={regionsData} loading={loading} />
        </div>
      </div>
    </SuperAdminLayout>
  );
}
