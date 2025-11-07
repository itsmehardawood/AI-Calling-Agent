/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit, Trash2, Power, Sparkles, Save, ArrowLeft, Check, MoreVertical, Filter, Eye, X } from "lucide-react";
import {
  generateProductPrompt,
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "../../lib/productApi";
import AdminLayout from "@/app/components/admin/AdminLayout";
import CustomToast from "@/app/components/CustomToast";
import ConfirmDialog from "@/app/components/ConfirmDialog";


function PromptsManagementPageInner() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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
      
      console.log('Fetching products for userId:', userId);
      const response = await getProducts(userId);
      console.log('Fetched products response:', response);
      
      // The API returns { businessId: "...", products: [...] }
      const productsArray = response.products || [];
      console.log('Products array:', productsArray);
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

  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData((prev) => ({ ...prev, objectives: newObjectives }));
  };

  const addObjective = () => {
    setFormData((prev) => ({
      ...prev,
      objectives: [...prev.objectives, ""],
    }));
  };

  const removeObjective = (index) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const handleGeneratePrompt = async () => {
    // Validate required fields
    if (!formData.name || !formData.category || !formData.description) {
      showToast("Please fill in product name, category, and description before generating prompt.", 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateProductPrompt({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        objective: formData.objectives.filter(obj => obj.trim() !== "").join(", "),
        promptType: formData.promptType,
      });
      
      setGeneratedPrompt(response.prompt);
      setFormData((prev) => ({ ...prev, prompt: response.prompt }));
      showToast("Prompt generated successfully!", 'success');
    } catch (error) {
      showToast("Error generating prompt: " + error.message, 'error');
    } finally {
      setIsGenerating(false);
    }
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
        console.log('Updating product with ID:', editingProduct.id);
        console.log('Product data:', productData);
        await updateProduct(editingProduct.id, productData);
        showToast("Product updated successfully!", 'success');
      } else {
        console.log('Creating new product');
        console.log('Product data:', productData);
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
    setGeneratedPrompt(product.prompt);
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
    setGeneratedPrompt("");
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
              {/* <button
                onClick={handleBackToDashboard}
                className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} />
              </button> */}
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
                          {/* <td className="py-4 px-4">
                            <span className="text-gray-900 font-semibold">${product.price}</span>
                          </td> */}
                          {/* <td className="py-4 px-4">
                            {product.objectives && product.objectives.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 w-fit">
                                  {product.objectives.length} objective{product.objectives.length !== 1 ? 's' : ''}
                                </span>
                              
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">No objectives</span>
                            )}
                          </td> */}
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
                              {product.created_at ? new Date(product.created_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'N/A'}
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
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fadeIn">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingProduct ? "Edit Product" : "Create New Product"}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {editingProduct ? "Update your product information" : "Add a new product to your collection"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  title="Close"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info Section */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                      Product Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="e.g., Electronics, Software"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Price <span className="text-blue-600">(optional)</span>
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div> */}


                      {/* <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Prompt Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="promptType"
                          value={formData.promptType}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        >
                          <option value="sales">Sales</option>
                          <option value="marketing">Marketing</option>
                        </select>
                      </div> */}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                        placeholder="Brief description of the product"
                        rows="3"
                        required
                      />
                    </div>
                  </div>

                  {/* Objectives Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                        Criteria 
                        <span className="text-sm font-normal text-gray-600">
                          ({formData.objectives.length})
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={addObjective}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Criteria
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.objectives.map((objective, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex items-center justify-center w-8 h-10 text-gray-400 text-sm font-medium">
                            {index + 1}.
                          </div>
                          <input
                            type="text"
                            placeholder="Enter objective"
                            value={objective}
                            onChange={(e) => handleObjectiveChange(index, e.target.value)}
                            className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                            required
                          />
                          {formData.objectives.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeObjective(index)}
                              className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Generation */}
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                      AI-Generated Script
                    </h3>
                    
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={handleGeneratePrompt}
                        disabled={isGenerating || !formData.name || !formData.category || !formData.description}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                      >
                        <Sparkles size={18} />
                        {isGenerating ? "Generating..." : "Generate AI Call Script"}
                      </button>
                      <p className="text-xs text-gray-600 mt-2">
                        Fill in product details above before generating the script
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Generated Script  <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="prompt"
                        value={formData.prompt}
                        onChange={handleInputChange}
                        placeholder="Generated prompt will appear here, or you can write your own..."
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 h-40 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                    >
                      <Save size={18} />
                      {loading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
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

export default function PromptsManagementPage() {
  return (
    <Suspense>
      <PromptsManagementPageInner />
    </Suspense>
  );
}