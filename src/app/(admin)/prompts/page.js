/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit, Trash2, Check, ArrowLeft } from "lucide-react";
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


function PromptsManagementPageInner() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProductForDashboard, setSelectedProductForDashboard] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [formData, setFormData] = useState({
    businessId: "",
    name: "",
    description: "",
    category: "",
    price: 0,
    objectives: [""],
    status: "active",
    prompt: "",
    promptType: "sales",
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
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        objectives: formData.objectives.filter(obj => obj.trim() !== ""),
        status: formData.status,
        prompt: formData.prompt,
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
      category: product.category,
      price: product.price,
      objectives: product.objectives || [""],
      status: product.status,
      prompt: product.prompt,
      promptType: product.promptType || "sales",
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
      category: "",
      price: 0,
      objectives: [""],
      status: "active",
      prompt: "",
      promptType: "sales",
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
          
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {selectionMode ? "Select Product" : "Product Management"}
                </h1>
                <p className="text-gray-600 mt-1">
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-2">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-green-900 font-medium">Selected: {selectedProductForDashboard.name}</p>
                  <p className="text-green-700 text-sm">Click "Use Selected Product" to continue</p>
                </div>
              </div>
              <button
                onClick={handleReturnToDashboard}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
              >
                <Check size={18} />
                Use Selected Product
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="rounded-lg shadow-sm border border-gray-200">
            <div className="bg-slate-700 flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-100">
                  {selectionMode ? "Available Products" : "All Products"}
                </h2>
                <p className="text-sm text-gray-100 mt-1">
                  {products.length} Product{products.length !== 1 ? 's' : ''} total
                </p>
              </div>
              
              {!selectionMode && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Create New Product
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4 font-medium">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Plus size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectionMode ? "No products available" : "No products yet"}
                </h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  {selectionMode 
                    ? "There are no products available to select. Please create a product first."
                    : "Get started by creating your first product with AI-generated prompts."
                  }
                </p>
                {!selectionMode && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Plus size={18} />
                    Create Your First Product
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {selectionMode && (
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                          Select
                        </th>
                      )}
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[18%]">
                        Product Name
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">
                        Category
                      </th>
                      {/* <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[8%]">
                        Price
                      </th> */}
                      {/* <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[11%]">
                        Objectives
                      </th> */}
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[8%]">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[16%]">
                        Prompt
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[8%]">
                        Created
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[8%]">
                        Updated
                      </th>
                      {!selectionMode && (
                        <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-[13%]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products.map((product) => {
                      const isSelected = selectionMode && selectedProductForDashboard?.id === product.id;
                      return (
                        <tr 
                          key={product.id}
                          onClick={() => selectionMode ? handlePromptSelection(product) : null}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-green-50 border-l-4 border-l-green-500"
                              : selectionMode
                              ? "hover:bg-blue-50 cursor-pointer"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {selectionMode && (
                            <td className="py-4 px-4">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? "bg-green-500 border-green-500" 
                                  : "border-gray-300"
                              }`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                            </td>
                          )}
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900 truncate" title={product.name}>
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 truncate" title={product.description}>
                              {product.description || 'No description'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-full" title={product.category}>
                              {product.category}
                            </span>
                          </td>
                     
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {product.prompt ? (
                              <div 
                                className="text-xs text-gray-600 line-clamp-2 leading-relaxed cursor-help" 
                                title={product.prompt}
                              >
                                {product.prompt}
                              </div>
                            ) : (
                              <span className="text-xs text-red-400 italic">No prompt generated</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              {product.created_at ? (() => {
                                try {
                                  const date = new Date(product.created_at);
                                  return date.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  });
                                } catch (e) {
                                  console.error('Error parsing created_at:', product.created_at, e);
                                  return 'Invalid Date';
                                }
                              })() : 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              {product.updated_at ? (() => {
                                try {
                                  const date = new Date(product.updated_at);
                                  return date.toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  });
                                } catch (e) {
                                  console.error('Error parsing updated_at:', product.updated_at, e);
                                  return 'Invalid Date';
                                }
                              })() : 'N/A'}
                            </span>
                          </td>
                          {!selectionMode && (
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                {/* Toggle Status Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStatus(product.id, product.status);
                                  }}
                                  className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors flex-shrink-0 ${
                                    product.status === 'active' 
                                      ? 'bg-green-500 hover:bg-green-600' 
                                      : 'bg-gray-300 hover:bg-gray-400'
                                  }`}
                                  title={product.status === 'active' ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                                >
                                  <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                                      product.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                                
                                {/* Edit Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(product);
                                  }}
                                  className="text-blue-600 hover:bg-blue-50 rounded-lg p-2.5 transition-colors flex-shrink-0"
                                  title="Edit Product"
                                >
                                  <Edit size={17} />
                                </button>
                                
                                {/* Delete Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(product.id);
                                  }}
                                  className="text-red-600 hover:bg-red-50 rounded-lg p-2.5 transition-colors flex-shrink-0"
                                  title="Delete Product"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-medium text-gray-900">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">1</button>
                  <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selection Instructions */}
          {selectionMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-blue-900 font-medium mb-2">How to select a product:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Click on any row in the table to select it</li>
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