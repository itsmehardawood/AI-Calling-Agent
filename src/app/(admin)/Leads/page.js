/* eslint-disable react-hooks/exhaustive-deps */
// app/admin/leads/page.jsx
"use client";
import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  Calendar,
  Target,
  TrendingUp,
  ChevronDown,
  Package
} from "lucide-react";
import AdminLayout from "@/app/components/admin/AdminLayout";
import CustomToast from "@/app/components/CustomToast";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { getLeads, deleteLead, addPromptToLead } from "../../lib/leadsApi";
import { getProducts } from "../../lib/productApi";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
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
      name: rawData.name || 'N/A',
      email: rawData.email || 'N/A',
      phone: rawData.phone || 'N/A',
      company: rawData.company || 'N/A',
      createdAt: rawData.createdOn || rawData.created_on || 'N/A',
      productName: rawData.product_name || null,
      productId: rawData.product_id || null,
    };
  };

  const filteredLeads = leads.filter(lead => {
    const transformed = transformLead(lead);
    return (
      transformed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transformed.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transformed.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transformed.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddLead = (leadData) => {
    // TODO: Implement add lead API call
    showToast("Add lead functionality coming soon", 'info');
    setShowAddModal(false);
  };

  const handleEditLead = (leadData) => {
    // TODO: Implement edit lead API call
    showToast("Edit lead functionality coming soon", 'info');
    setEditingLead(null);
  };

  const handleDeleteLead = (leadId) => {
    setConfirmDialog({
      title: "Delete Lead",
      message: "Are you sure you want to delete this lead? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteLead(leadId);
          showToast("Lead deleted successfully!", 'success');
          await fetchLeads();
        } catch (error) {
          showToast("Error deleting lead: " + error.message, 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const handleAssignProduct = async (productId, leadId) => {
    try {
      await addPromptToLead(productId, leadId);
      showToast("Product assigned to lead successfully!", 'success');
      setOpenDropdownId(null);
    } catch (error) {
      showToast("Error assigning product: " + error.message, 'error');
    }
  };

  const toggleDropdown = (leadId) => {
    setOpenDropdownId(openDropdownId === leadId ? null : leadId);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!pagination || pagination.total_pages <= 1) return null;

    const pages = [];
    const totalPages = pagination.total_pages;
    const current = pagination.page;

    // Show first page
    pages.push(1);

    // Show pages around current page
    let startPage = Math.max(2, current - 1);
    let endPage = Math.min(totalPages - 1, current + 1);

    // Add ellipsis before if needed
    if (startPage > 2) {
      pages.push('...');
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis after if needed
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Show last page (if not already shown)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // Remove duplicates
    const uniquePages = pages.filter((page, index, self) => 
      self.indexOf(page) === index
    );

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-700">
            Showing page <span className="font-medium">{current}</span> of{' '}
            <span className="font-medium">{totalPages}</span>
            {' '}({pagination.total_leads} total leads)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {uniquePages.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  current === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )
          ))}

          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pt-5 px-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Target className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your sales leads</p>
          </div>
        </div>
       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-5">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{pagination?.total_leads || leads.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="text-blue-600" size={16} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Page</p>
              <p className="text-2xl font-bold text-blue-600">
                {pagination?.page || 1} / {pagination?.total_pages || 1}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={16} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Showing</p>
              <p className="text-2xl font-bold text-purple-600">
                {leads.length} Leads
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search leads by name, email, company, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button> */}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <Target size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No leads found</p>
              {/* <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Add Your First Lead
              </button> */}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assign Product
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead, index) => {
                  const transformed = transformLead(lead);
                  const isLastRow = index === filteredLeads.length - 1;
                  const isSecondLastRow = index === filteredLeads.length - 2;
                  return (
                    <tr key={lead._id} className="hover:bg-gray-50">
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transformed.name}</div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Mail size={12} />
                          {transformed.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Phone size={12} />
                          {transformed.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <Building size={12} />
                          {transformed.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transformed.createdAt !== 'N/A' 
                          ? new Date(transformed.createdAt).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transformed.productName ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              <Package size={12} />
                              {transformed.productName}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No product assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 relative">
                          <div className="relative">
                            <button
                              onClick={() => toggleDropdown(lead._id)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                              title="Assign Product"
                            >
                              <Package size={16} />
                              Assign
                              <ChevronDown size={14} />
                            </button>
                            
                            {openDropdownId === lead._id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setOpenDropdownId(null)}
                                />
                                <div className={`absolute right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-60 overflow-y-auto ${
                                  isLastRow || isSecondLastRow ? 'bottom-full mb-2' : 'mt-2'
                                }`}>
                                  {products.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                      No products available
                                    </div>
                                  ) : (
                                    <div className="py-1">
                                      {products.map((product) => (
                                        <button
                                          key={product.id}
                                          onClick={() => handleAssignProduct(product.id, lead._id)}
                                          className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-start gap-2"
                                        >
                                          <Package size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                              {product.name}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                              {product.category}
                                            </div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Add/Edit Lead Modal */}
      {(showAddModal || editingLead) && (
        <LeadModal
          lead={editingLead}
          onSave={editingLead ? handleEditLead : handleAddLead}
          onClose={() => {
            setShowAddModal(false);
            setEditingLead(null);
          }}
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

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
    </AdminLayout>
  );
}

// Lead Modal Component
function LeadModal({ lead, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || "",
    company: lead?.company || "",
    source: lead?.source || "Website",
    interest: lead?.interest || "",
    status: lead?.status || "new",
    score: lead?.score || 70
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {lead ? 'Edit Lead' : 'Add New Lead'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest/Need *
              </label>
              <input
                type="text"
                name="interest"
                value={formData.interest}
                onChange={handleChange}
                required
                placeholder="e.g., Product Demo, Pricing"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Score (0-100)
              </label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

        
        </form>
      </div>
    </div>
  );
}
