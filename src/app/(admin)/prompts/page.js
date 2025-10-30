/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit, Trash2, Power, Sparkles, Save, ArrowLeft, Check, MoreVertical, Filter, Eye, X } from "lucide-react";
import {
  generatePrompt,
  createPrompt,
  getPrompts,
  updatePrompt,
  deletePrompt,
  activatePrompt,
} from "../../lib/promptApi";
import AdminLayout from "@/app/components/admin/AdminLayout";


function PromptsManagementPageInner() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPromptForDashboard, setSelectedPromptForDashboard] = useState(null);
  const [expandedProductIndex, setExpandedProductIndex] = useState(0); // Track which product is expanded

  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [formData, setFormData] = useState({
    tone: "professional",
    business: "",
    prompt_type: "sales",
    products: [{ name: "", category: "", description: "", price: "", features: [""] }],
    generated_prompt: "",
  });


  // Fetch prompts on component mount and check for selection mode
  useEffect(() => {
    fetchPrompts();
    if (!searchParams) return;
    // Check if we're in selection mode
    const mode = searchParams.get('mode');
    if (mode === 'select') {
      setSelectionMode(true);
    }
    // Check if there's a currently selected prompt from localStorage (client only)
    if (typeof window !== 'undefined') {
      const currentPromptId = localStorage.getItem('selectedPromptId');
      if (currentPromptId && mode === 'select') {
        // Will be set when prompts are loaded
      }
    }
  }, [searchParams]);

  // Set selected prompt when prompts are loaded in selection mode
  useEffect(() => {
    if (selectionMode && prompts.length > 0 && typeof window !== 'undefined') {
      const currentPromptId = localStorage.getItem('selectedPromptId');
      if (currentPromptId) {
        const prompt = prompts.find(p => p.id === currentPromptId);
        if (prompt) {
          setSelectedPromptForDashboard(prompt);
        }
      }
    }
  }, [prompts, selectionMode]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await getPrompts({ is_active: true });
      setPrompts(response.prompts || []);
    } catch (error) {
      console.error("Error fetching prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleFeatureChange = (productIndex, featureIndex, value) => {
    const newProducts = [...formData.products];
    newProducts[productIndex].features[featureIndex] = value;
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const addProduct = () => {
    const newIndex = formData.products.length;
    setFormData((prev) => ({
      ...prev,
      products: [...prev.products, { name: "", category: "", description: "", price: "", features: [""] }],
    }));
    setExpandedProductIndex(newIndex); // Expand the newly added product
  };

  const removeProduct = (index) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
    // Adjust expanded index if needed
    if (expandedProductIndex >= index && expandedProductIndex > 0) {
      setExpandedProductIndex(expandedProductIndex - 1);
    }
  };

  const addFeature = (productIndex) => {
    const newProducts = [...formData.products];
    newProducts[productIndex].features.push("");
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const removeFeature = (productIndex, featureIndex) => {
    const newProducts = [...formData.products];
    newProducts[productIndex].features = newProducts[productIndex].features.filter((_, i) => i !== featureIndex);
    setFormData((prev) => ({ ...prev, products: newProducts }));
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await generatePrompt({
        tone: formData.tone,
        business: formData.business,
        products: formData.products,
        prompt_type: formData.prompt_type,
      });
      setGeneratedText(response.generated_prompt);
      setFormData((prev) => ({ ...prev, generated_prompt: response.generated_prompt }));
    } catch (error) {
      alert("Error generating prompt: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, formData);
      } else {
        await createPrompt(formData);
      }
      await fetchPrompts();
      resetForm();
    } catch (error) {
      alert("Error saving prompt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      tone: prompt.tone,
      business: prompt.business_name,
      prompt_type: prompt.prompt_type,
      products: prompt.products,
      generated_prompt: prompt.generated_prompt,
    });
    setGeneratedText(prompt.generated_prompt);
    setShowCreateForm(true);
  };

  const handleDelete = async (promptId) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      try {
        await deletePrompt(promptId);
        await fetchPrompts();
      } catch (error) {
        alert("Error deleting prompt: " + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tone: "professional",
      business: "",
      prompt_type: "sales",
      products: [{ name: "", category: "", description: "", price: "", features: [""] }],
      generated_prompt: "",
    });
    setGeneratedText("");
    setEditingPrompt(null);
    setShowCreateForm(false);
    setExpandedProductIndex(0); // Reset to first product
  };

  const handlePromptSelection = (prompt) => {
    setSelectedPromptForDashboard(prompt);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPromptId', prompt.id);
      localStorage.setItem('callAgentPrompt', prompt.generated_prompt);
    }
  };

  const handleReturnToDashboard = () => {
    router.push('/admin/dashboard');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const getTypeColor = (type) => {
    const colors = {
      sales: 'bg-green-100 text-green-800',
      support: 'bg-blue-100 text-blue-800',
    };
    return colors[type] || colors.sales;
  };

  const getToneColor = (tone) => {
    const colors = {
      professional: 'bg-blue-100 text-blue-800',
      friendly: 'bg-yellow-100 text-yellow-800',
      casual: 'bg-pink-100 text-pink-800',
      formal: 'bg-indigo-100 text-indigo-800',
    };
    return colors[tone] || colors.professional;
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectionMode ? "Select Business" : "Business Management"}
                </h1>
                <p className="text-gray-600 mt-1">
                  {selectionMode 
                    ? "Choose a prompt for your call agent"
                    : "Create and manage AI prompts for your calling agents"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Selection Banner */}
          {selectionMode && selectedPromptForDashboard && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-2">
                  <Check size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-green-900 font-medium">Selected: {selectedPromptForDashboard.business_name}</p>
                  <p className="text-green-700 text-sm">Click "Use Selected Prompt" to continue</p>
                </div>
              </div>
              <button
                onClick={handleReturnToDashboard}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
              >
                <Check size={18} />
                Use Selected Prompt
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="rounded-lg shadow-sm border border-gray-200">
            <div className="bg-slate-700 flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-100">
                  {selectionMode ? "Available Businesses" : "All Businesses"}
                </h2>
                <p className="text-sm text-gray-100 mt-1">
                  {prompts.length} Business{prompts.length !== 1 ? 's' : ''} total
                </p>
              </div>
              
              {!selectionMode && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Create New Business
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading prompts...</p>
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {selectionMode ? "No prompts available to select." : "No prompts found. Create your first prompt!"}
                </p>
                {!selectionMode && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Create Your First Prompt
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {selectionMode && (
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                          Select
                        </th>
                      )}
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Business Name
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tone
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Generated Prompt
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      {!selectionMode && (
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {prompts.map((prompt) => {
                      const isSelected = selectionMode && selectedPromptForDashboard?.id === prompt.id;
                      return (
                        <tr 
                          key={prompt.id}
                          onClick={() => selectionMode ? handlePromptSelection(prompt) : null}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-green-50 border-l-4 border-l-green-500"
                              : selectionMode
                              ? "hover:bg-blue-50 cursor-pointer"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {selectionMode && (
                            <td className="py-4 px-6">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected 
                                  ? "bg-green-500 border-green-500" 
                                  : "border-gray-300"
                              }`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                            </td>
                          )}
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">{prompt.business_name}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(prompt.prompt_type)}`}>
                              {prompt.prompt_type}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getToneColor(prompt.tone)}`}>
                              {prompt.tone}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-700">{prompt.products?.length || 0}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {prompt.generated_prompt.substring(0, 60)}...
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {new Date(prompt.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          {!selectionMode && (
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(prompt)}
                                  className="text-blue-600 hover:text-blue-800 p-1 transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(prompt.id)}
                                  className="text-red-600 hover:text-red-800 p-1 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
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
            {prompts.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-600 px-6 py-4">
                <div className="text-sm text-gray-600">
                  Showing {prompts.length} results
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
                  <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
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
                  <h3 className="text-blue-900 font-medium mb-2">How to select a prompt:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Click on any row in the table to select it</li>
                    <li>• The selected prompt will be highlighted in green</li>
                    <li>• Click "Use Selected Prompt" button to return to the dashboard</li>
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
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-fadeIn">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingPrompt ? "Edit Business" : "Create New Business"}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {editingPrompt ? "Update your business information" : "Add a new business to your collection"}
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
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Business Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="business"
                          value={formData.business}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Enter business name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Tone <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="tone"
                          value={formData.tone}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="casual">Casual</option>
                          <option value="formal">Formal</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Prompt Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="prompt_type"
                        value={formData.prompt_type}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value="sales">Sales</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                        Products
                        <span className="text-sm font-normal text-gray-600">
                          ({formData.products.length})
                        </span>
                      </h3>
                      <button
                        type="button"
                        onClick={addProduct}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Product
                      </button>
                    </div>

                    {formData.products.map((product, productIndex) => {
                      const isExpanded = expandedProductIndex === productIndex;
                      
                      return (
                        <div key={productIndex} className="border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          {/* Product Header - Always Visible */}
                          <div 
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedProductIndex(isExpanded ? -1 : productIndex)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                  {productIndex + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {product.name || `Product ${productIndex + 1}`}
                                  </h4>
                                  {product.category && (
                                    <span className="text-xs text-gray-500">
                                      {product.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {product.name && product.category && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                  {product.price || 'No price'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              {formData.products.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeProduct(productIndex);
                                  }}
                                  className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Product Details - Collapsible */}
                          {isExpanded && (
                            <div className="p-4 pt-0 space-y-4 bg-gray-50 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                    Product Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Premium Widget"
                                    value={product.name}
                                    onChange={(e) => handleProductChange(productIndex, "name", e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                    Category <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., Electronics"
                                    value={product.category}
                                    onChange={(e) => handleProductChange(productIndex, "category", e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                    Price <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g., $99.99"
                                    value={product.price}
                                    onChange={(e) => handleProductChange(productIndex, "price", e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1.5 text-gray-700">
                                    Description <span className="text-red-500">*</span>
                                  </label>
                                  <textarea
                                    placeholder="Brief description of the product"
                                    value={product.description}
                                    onChange={(e) => handleProductChange(productIndex, "description", e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                                    rows="2"
                                    required
                                  />
                                </div>
                              </div>

                              {/* Features */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                  <label className="text-sm font-medium text-gray-700">Features</label>
                                  <button
                                    type="button"
                                    onClick={() => addFeature(productIndex)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm hover:shadow flex items-center gap-1"
                                  >
                                    <Plus size={14} />
                                    Add Feature
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {product.features.map((feature, featureIndex) => (
                                    <div key={featureIndex} className="flex gap-2">
                                      <div className="flex items-center justify-center w-6 h-9 text-gray-400 text-xs font-medium">
                                        {featureIndex + 1}.
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Enter feature"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(productIndex, featureIndex, e.target.value)}
                                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        required
                                      />
                                      {product.features.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeFeature(productIndex, featureIndex)}
                                          className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Generation */}
                  <div>
                    <div className="flex gap-4 mb-4">
                      <button
                        type="button"
                        onClick={handleGeneratePrompt}
                        disabled={isGenerating || !formData.business}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                      >
                        <Sparkles size={16} />
                        {isGenerating ? "Generating..." : "Generate AI Prompt"}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Generated Prompt</label>
                      <textarea
                        name="generated_prompt"
                        value={formData.generated_prompt}
                        onChange={handleInputChange}
                        placeholder="Generated prompt will appear here, or you can write your own..."
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 h-40 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <Save size={16} />
                      {loading ? "Saving..." : editingPrompt ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
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