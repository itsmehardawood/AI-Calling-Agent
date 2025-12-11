/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/app/components/superadmin/SuperAdminLayout';
import { getApiUrl } from '@/config/api';
import { FileText, RefreshCw, Shield } from 'lucide-react';
import ProductsPromptsTable from '@/app/components/superadmin/products-prompts/ProductsPromptsTable';

export default function ProductsPromptsPage() {
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch data from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiUrl('/super_admin/superadmin/products');
      // console.log('Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProductsData(data.products || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProductsData([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle approve product
  const handleApprove = async (productId) => {
    try {
      const apiUrl = getApiUrl(`/super_admin/products/${productId}/approve`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve product');
      }

      showToast('Product approved successfully', 'success');
      await fetchProducts();
    } catch (err) {
      console.error('Error approving product:', err);
      showToast('Error approving product: ' + err.message, 'error');
    }
  };

  // Handle reject product
  const handleReject = async (productId) => {
    try {
      const apiUrl = getApiUrl(`/super_admin/products/${productId}/reject`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject product');
      }

      showToast('Product rejected', 'success');
      await fetchProducts();
    } catch (err) {
      console.error('Error rejecting product:', err);
      showToast('Error rejecting product: ' + err.message, 'error');
    }
  };

  // Handle toggle lock
  const handleToggleLock = async (productId, shouldLock) => {
    try {
      const apiUrl = getApiUrl(`/super_admin/products/${productId}/lock`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Is_locked: shouldLock }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lock status');
      }

      showToast(`Product ${shouldLock ? 'locked' : 'unlocked'} successfully`, 'success');
      await fetchProducts();
    } catch (err) {
      console.error('Error updating lock status:', err);
      showToast('Error updating lock status: ' + err.message, 'error');
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-5">
        {/* Header */}
        <div className="px-3 sm:px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Products & Prompts
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Review and approve prompts for compliance
              </p>
            </div>
            <button 
              onClick={fetchProducts}
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
              <p className="text-sm sm:text-base text-blue-800">Loading products...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-3 sm:px-5">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base text-red-800 font-medium">
                Error loading products: {error}
              </p>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-fadeIn">
            <div className={`${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
              <FileText size={18} />
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="px-3 sm:px-5">
          <ProductsPromptsTable 
            data={productsData} 
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
            onToggleLock={handleToggleLock}
          />
        </div>
      </div>
    </SuperAdminLayout>
  );
}
