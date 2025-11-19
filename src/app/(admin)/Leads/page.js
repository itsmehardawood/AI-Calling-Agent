/* eslint-disable react-hooks/exhaustive-deps */
// app/admin/leads/page.jsx
"use client";
import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import AdminLayout from "@/app/components/admin/AdminLayout";
import CustomToast from "@/app/components/CustomToast";
import StatsCards from "@/app/components/admin/leads/StatsCards";
import SearchBar from "@/app/components/admin/leads/SearchBar";
import LeadCard from "@/app/components/admin/leads/LeadCard";
import LeadTable from "@/app/components/admin/leads/LeadTable";
import Pagination from "@/app/components/admin/leads/Pagination";
import EmptyState from "@/app/components/admin/leads/EmptyState";
import { getLeads, addPromptToLead } from "../../lib/leadsApi";
import { getProducts } from "../../lib/productApi";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const LEADS_PER_PAGE = 10;

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchLeads(currentPage);
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const response = await getProducts(userId);
      setProducts(response.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Error fetching products: " + error.message, 'error');
    }
  };

  const fetchLeads = async (page = 1) => {
    setLoading(true);
    try {
      // Get user_id from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      // console.log('Fetching leads for userId:', userId, 'page:', page);
      const response = await getLeads(userId, page, LEADS_PER_PAGE);
      // console.log('Fetched leads response:', response);

      if (response.status === 'success') {
        setLeads(response.leads || []);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
      showToast("Error fetching leads: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Transform lead data for display
  const transformLead = (lead) => {
    const rawData = lead.raw_data || {};
    return {
      id: lead._id,
      email: rawData.email || 'N/A',
      phone_number: rawData.phone || 'N/A',
      company_name: rawData.company || null,
      created_at: rawData.createdOn || rawData.created_on || new Date().toISOString(),
      product_name: rawData.product_name || null,
      product_id: rawData.product_id || null,
    };
  };

  const filteredLeads = leads
    .map(transformLead)
    .filter(lead => {
      const searchLower = searchTerm.toLowerCase();
      return (
        lead.email.toLowerCase().includes(searchLower) ||
        lead.phone_number.toLowerCase().includes(searchLower) ||
        (lead.company_name && lead.company_name.toLowerCase().includes(searchLower))
      );
    });

  const handleProductChange = async (leadId, productId) => {
    if (!productId) return;
    
    try {
      await addPromptToLead(productId, leadId);
      showToast("Product assigned to lead successfully!", 'success');
      await fetchLeads(currentPage);
    } catch (error) {
      showToast("Error assigning product: " + error.message, 'error');
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= (pagination?.total_pages || 1)) {
      setCurrentPage(page);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-5">
        {/* Page Header */}
        <div className="px-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="text-blue-600" size={18} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Leads Management
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Track and manage your sales leads
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards pagination={pagination} leads={leads} />

        {/* Search Bar */}
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Loading State */}
        {loading ? (
          <div className="px-3 sm:px-5">
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-500">Loading leads...</p>
            </div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="px-3 sm:px-5">
            <EmptyState searchTerm={searchTerm} />
          </div>
        ) : (
          <>
            {/* Mobile View - Cards */}
            <div className="block lg:hidden px-3 sm:px-5">
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    products={products}
                    onProductChange={handleProductChange}
                  />
                ))}
              </div>
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block px-5">
              <LeadTable
                leads={filteredLeads}
                products={products}
                onProductChange={handleProductChange}
              />
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
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
    </AdminLayout>
  );
}
