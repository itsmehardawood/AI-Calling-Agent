/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Check, Grid3x3, List } from "lucide-react";
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "../../lib/productApi";
import AdminLayout from "@/app/components/admin/AdminLayout";
import CustomToast from "@/app/components/CustomToast";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import ProductModal from "@/app/components/admin/ProductModal";
import ProductCard from "@/app/components/admin/prompts/ProductCard";
import ProductTable from "@/app/components/admin/prompts/ProductTable";
import EmptyState from "@/app/components/admin/prompts/EmptyState";


function PromptsManagementPageInner() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProductForDashboard, setSelectedProductForDashboard] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'grid' or 'table'
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [formData, setFormData] = useState({
    businessId: "",
    name: "",
    description: "",
    category: "Marketing", // Static value - not editable by users
    price: 0,
    objectives: [""],
    status: "active",
    prompt: "",
    promptType: "sales",
    agent_language: "English", // Default language
  });


  // Fetch products on component mount and check for selection mode
  useEffect(() => {
    fetchProducts();
    if (!searchParams) return;
    // Check if we're in selection mode
    const mode = searchParams.get('mode');
    if (mode === 'select') {
      setSelectionMode(true);
    }
    // Check if there's a currently selected product from localStorage (client only)
    if (typeof window !== 'undefined') {
      const currentProductId = localStorage.getItem('selectedProductId');
      if (currentProductId && mode === 'select') {
        // Will be set when products are loaded
      }
    }

    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-set grid view on mobile
      if (window.innerWidth < 1024) {
        setViewMode('grid');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [searchParams]);

  // Set selected product when products are loaded in selection mode
  useEffect(() => {
    if (selectionMode && products.length > 0 && typeof window !== 'undefined') {
      const currentProductId = localStorage.getItem('selectedProductId');
      if (currentProductId) {
        const product = products.find(p => p.id === currentProductId);
        if (product) {
          setSelectedProductForDashboard(product);
        }
      }
    }
  }, [products, selectionMode]);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Get user_id from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }
      
      const response = await getProducts(userId);
   
      
      // The API returns { businessId: "...", products: [...] }
      const productsArray = response.products || [];
     
  
      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Error fetching products: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user_id from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const productData = {
        businessId: userId, // Using user_id as businessId
        name: formData.name,
        description: formData.description,
        category: "Marketing", // Static value - users cannot change this
        price: parseFloat(formData.price) || 0,
        objectives: formData.objectives.filter(obj => obj.trim() !== ""),
        status: formData.status,
        prompt: formData.prompt,
        agent_language: formData.agent_language,
      };

      if (editingProduct) {
     
        await updateProduct(editingProduct.id, productData);
        showToast("Product updated successfully!", 'success');
      } else {
        await createProduct(productData);
        showToast("Product created successfully!", 'success');
      }
      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("Error saving product: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      businessId: product.businessId,
      name: product.name,
      description: product.description,
      category: "Marketing", // Static value - always set to Marketing regardless of stored value
      price: product.price,
      objectives: product.objectives || [""],
      status: product.status,
      prompt: product.prompt,
      promptType: product.promptType || "sales",
      agent_language: product.agent_language || "English",
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (productId) => {
    setConfirmDialog({
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteProduct(productId);
          showToast("Product deleted successfully!", 'success');
          await fetchProducts();
        } catch (error) {
          showToast("Error deleting product: " + error.message, 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateProductStatus(productId, newStatus);
      showToast(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
      await fetchProducts();
    } catch (error) {
      showToast("Error updating product status: " + error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      businessId: "",
      name: "",
      description: "",
      category: "Marketing", // Static value - not editable by users
      price: 0,
      objectives: [""],
      status: "active",
      prompt: "",
      promptType: "sales",
      agent_language: "English",
    });
    setEditingProduct(null);
    setShowCreateForm(false);
  };

  const handlePromptSelection = (product) => {
    setSelectedProductForDashboard(product);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedProductId', product.id);
      localStorage.setItem('callAgentPrompt', product.prompt);
    }
  };

  const handleReturnToDashboard = () => {
    router.push('/admin/dashboard');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      console.error('Error parsing date:', dateString, e);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.active;
  };

  const getTypeColor = (type) => {
    const colors = {
      sales: 'bg-blue-100 text-blue-800',
      marketing: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || colors.sales;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                  {selectionMode ? "Select Product" : "Product Management"}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {selectionMode 
                    ? "Choose a product for your call agent"
                    : "Create and manage products with AI-generated prompts"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Selection Banner */}
          {selectionMode && selectedProductForDashboard && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-green-900 font-medium text-sm sm:text-base">Selected: {selectedProductForDashboard.name}</p>
                    <p className="text-green-700 text-xs sm:text-sm">Click "Use Selected Product" to continue</p>
                  </div>
                </div>
                <button
                  onClick={handleReturnToDashboard}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors text-sm sm:text-base"
                >
                  <Check size={18} />
                  Use Selected Product
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="rounded-lg shadow-sm border border-gray-200">
            <div className="bg-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-100">
                  {selectionMode ? "Available Products" : "All Products"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-100 mt-1">
                  {products.length} Product{products.length !== 1 ? 's' : ''} total
                </p>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* View Toggle - Hidden on mobile */}
                {!selectionMode && !isMobile && (
                  <div className="flex items-center gap-1 bg-slate-600 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                      title="Grid View"
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                      title="Table View"
                    >
                      <List size={18} />
                    </button>
                  </div>
                )}
                
                {!selectionMode && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Create New Product</span>
                    <span className="sm:hidden">Create</span>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 sm:py-16 bg-white">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4 font-medium text-sm sm:text-base">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                selectionMode={selectionMode}
                onCreateClick={() => setShowCreateForm(true)}
              />
            ) : (
              <>
                {/* Grid View - Default on mobile */}
                {(viewMode === 'grid' || isMobile) && (
                  <div className="p-3 sm:p-4 lg:p-6 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          selectionMode={selectionMode}
                          isSelected={selectionMode && selectedProductForDashboard?.id === product.id}
                          onSelect={handlePromptSelection}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleStatus={handleToggleStatus}
                          getStatusColor={getStatusColor}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Table View - Only on desktop */}
                {viewMode === 'table' && !isMobile && (
                  <ProductTable
                    products={products}
                    selectionMode={selectionMode}
                    selectedProductForDashboard={selectedProductForDashboard}
                    onSelect={handlePromptSelection}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    getStatusColor={getStatusColor}
                    formatDate={formatDate}
                  />
                )}
              </>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 gap-3">
                <div className="text-xs sm:text-sm text-gray-600">
                  Showing <span className="font-medium text-gray-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium">1</button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selection Instructions */}
          {selectionMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-blue-900 font-medium mb-2 text-sm sm:text-base">How to select a product:</h3>
                  <ul className="text-blue-800 text-xs sm:text-sm space-y-1">
                    <li>• Click on any {isMobile ? 'card' : 'row in the table'} to select it</li>
                    <li>• The selected product will be highlighted in green</li>
                    <li>• Click "Use Selected Product" button to return to the dashboard</li>
                    <li>• Your selection will be saved for the call setup</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Form Modal */}
        <ProductModal
          isOpen={showCreateForm}
          onClose={resetForm}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          loading={loading}
          editingProduct={editingProduct}
          showToast={showToast}
        />

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

export default function PromptsManagementPage() {
  return (
    <Suspense>
      <PromptsManagementPageInner />
    </Suspense>
  );
}