'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Phone, PhoneOff, CheckCircle, XCircle, Clock, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getProducts } from '../../lib/productApi';
import { saveQAPairs, saveKnowledgeSources, getKnowledgeBase, deleteKnowledgeBase } from '../../lib/knowledgeBaseApi';
import CustomToast from '@/app/components/CustomToast';
import ConfirmDialog from '@/app/components/ConfirmDialog';
// import CallsTable from '@/app/components/admin/inbound-calls/CallsTable';

export default function InboundCallsPage() {
  // State for products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loadingKB, setLoadingKB] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  // State for knowledge base data per product
  const [productKnowledgeBase, setProductKnowledgeBase] = useState({});
  // Track which products have loaded their data
  const [loadedProducts, setLoadedProducts] = useState(new Set());
  // Track view/edit mode per product (productId -> 'view' | 'edit')
  const [productViewMode, setProductViewMode] = useState({});
  // Track which products have existing data
  const [productsWithData, setProductsWithData] = useState(new Set());
  
  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }
      
      const response = await getProducts(userId);
      const productsArray = response.products || [];
      setProducts(productsArray);
      
      // Initialize knowledge base state for each product
      const initialKB = {};
      productsArray.forEach(product => {
        initialKB[product.id] = {
          urls: [''],
          questionsAnswers: [{ question: '', answer: '' }]
        };
      });
      setProductKnowledgeBase(initialKB);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const toggleViewMode = (productId) => {
    setProductViewMode(prev => ({
      ...prev,
      [productId]: prev[productId] === 'view' ? 'edit' : 'view'
    }));
  };

  const handleDelete = async (productId, productName) => {
    setConfirmDialog({
      title: "Delete Knowledge Base",
      message: `Are you sure you want to delete all knowledge base data for "${productName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
          if (!userId) {
            throw new Error('User ID not found.');
          }

          await deleteKnowledgeBase(userId, productId);
          
          // Reset the product's knowledge base to empty state
          setProductKnowledgeBase(prev => ({
            ...prev,
            [productId]: {
              urls: [''],
              questionsAnswers: [{ question: '', answer: '' }]
            }
          }));
          
          // Remove from loaded and data tracking
          setLoadedProducts(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          
          setProductsWithData(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
          
          // Switch to edit mode
          setProductViewMode(prev => ({ ...prev, [productId]: 'edit' }));
          
          showToast('Knowledge base deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting knowledge base:', error);
          showToast(error.message || 'Failed to delete knowledge base', 'error');
        } finally {
          setConfirmDialog(null);
        }
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const toggleProduct = async (productId) => {
    // If clicking the same product, just collapse it
    if (expandedProductId === productId) {
      setExpandedProductId(null);
      return;
    }

    setExpandedProductId(productId);

    // If we haven't loaded this product's data yet, fetch it
    if (!loadedProducts.has(productId)) {
      setLoadingKB(true);
      try {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
        if (!userId) {
          throw new Error('User ID not found.');
        }

        const knowledgeBaseData = await getKnowledgeBase(userId, productId);
        
        if (knowledgeBaseData && (knowledgeBaseData.sources?.length > 0 || knowledgeBaseData.qa_pairs?.length > 0)) {
          // Populate with existing data
          setProductKnowledgeBase(prev => ({
            ...prev,
            [productId]: {
              urls: knowledgeBaseData.sources?.length > 0 
                ? knowledgeBaseData.sources.map(s => s.url) 
                : [''],
              questionsAnswers: knowledgeBaseData.qa_pairs?.length > 0 
                ? knowledgeBaseData.qa_pairs.map(qa => ({ question: qa.question, answer: qa.answer }))
                : [{ question: '', answer: '' }]
            }
          }));
          // Set to view mode since data exists
          setProductViewMode(prev => ({ ...prev, [productId]: 'view' }));
          setProductsWithData(prev => new Set([...prev, productId]));
        } else {
          // Set to edit mode since no data exists
          setProductViewMode(prev => ({ ...prev, [productId]: 'edit' }));
        }
        
        // Mark this product as loaded
        setLoadedProducts(prev => new Set([...prev, productId]));
      } catch (error) {
        console.error('Error fetching knowledge base:', error);
        // Keep the default empty state if fetch fails
      } finally {
        setLoadingKB(false);
      }
    }
  };

  // URL Management per product
  const addUrl = (productId) => {
    setProductKnowledgeBase(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        urls: [...prev[productId].urls, '']
      }
    }));
  };

  const removeUrl = (productId, index) => {
    setProductKnowledgeBase(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        urls: prev[productId].urls.filter((_, i) => i !== index)
      }
    }));
  };

  const updateUrl = (productId, index, value) => {
    setProductKnowledgeBase(prev => {
      const newUrls = [...prev[productId].urls];
      newUrls[index] = value;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          urls: newUrls
        }
      };
    });
  };

  // Q&A Management per product
  const addQA = (productId) => {
    setProductKnowledgeBase(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        questionsAnswers: [...prev[productId].questionsAnswers, { question: '', answer: '' }]
      }
    }));
  };

  const removeQA = (productId, index) => {
    setProductKnowledgeBase(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        questionsAnswers: prev[productId].questionsAnswers.filter((_, i) => i !== index)
      }
    }));
  };

  const updateQuestion = (productId, index, value) => {
    setProductKnowledgeBase(prev => {
      const newQA = [...prev[productId].questionsAnswers];
      newQA[index].question = value;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          questionsAnswers: newQA
        }
      };
    });
  };

  const updateAnswer = (productId, index, value) => {
    setProductKnowledgeBase(prev => {
      const newQA = [...prev[productId].questionsAnswers];
      newQA[index].answer = value;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          questionsAnswers: newQA
        }
      };
    });
  };

  // Submit handler for a specific product
  const handleSubmit = async (productId) => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const kb = productKnowledgeBase[productId];
      
      // Filter valid URLs and Q&A pairs
      const validUrls = kb.urls.filter(url => url.trim() !== '');
      const validQAPairs = kb.questionsAnswers.filter(
        qa => qa.question.trim() !== '' && qa.answer.trim() !== ''
      );

      const promises = [];

      // Save URLs if any
      if (validUrls.length > 0) {
        promises.push(
          saveKnowledgeSources(userId, productId, validUrls)
        );
      }

      // Save Q&A pairs if any
      if (validQAPairs.length > 0) {
        promises.push(
          saveQAPairs(userId, productId, validQAPairs)
        );
      }

      if (promises.length === 0) {
        showToast('Please add at least one URL or Q&A pair before saving.', 'error');
        return;
      }

      // Execute both API calls in parallel
      await Promise.all(promises);
      
      // Mark product as not loaded so it will fetch fresh data next time
      setLoadedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      
      showToast('Knowledge base saved successfully!', 'success');
    } catch (error) {
      console.error('Error submitting knowledge base:', error);
      showToast(error.message || 'Failed to save knowledge base', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Inbound Calls - Knowledge Base</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Configure knowledge base for your products
            </p>
          </div>

          {/* Products List with Knowledge Base Configuration */}
          <div className="mb-6 space-y-4">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4 font-medium">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">No products found. Please create a product first.</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Product Header - Clickable */}
                  <button
                    onClick={() => toggleProduct(product.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-150 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-600 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            Language: <span className="font-medium">{product.agent_language || 'English'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedProductId === product.id ? 
                      <ChevronUp className="text-gray-600" /> : 
                      <ChevronDown className="text-gray-600" />
                    }
                  </button>

                  {/* Expandable Content - URLs and Q&As */}
                  {expandedProductId === product.id && productKnowledgeBase[product.id] && (
                    <div className="px-6 py-4 border-t text-gray-600 border-gray-200 space-y-6">
                      {loadingKB ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-500 mt-3 text-sm">Loading knowledge base...</p>
                        </div>
                      ) : productViewMode[product.id] === 'view' ? (
                        <>
                          {/* View Mode */}
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Knowledge Base Details</h3>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleViewMode(product.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.name)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* View URLs */}
                          {productKnowledgeBase[product.id].urls.some(url => url.trim() !== '') && (
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <h4 className="text-md font-semibold text-gray-900">Website URLs</h4>
                              </div>
                              <ul className="space-y-2">
                                {productKnowledgeBase[product.id].urls.filter(url => url.trim() !== '').map((url, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                      {url}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* View Q&As */}
                          {productKnowledgeBase[product.id].questionsAnswers.some(qa => qa.question.trim() !== '' || qa.answer.trim() !== '') && (
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h4 className="text-md font-semibold text-gray-900">Questions & Answers</h4>
                              </div>
                              <div className="space-y-4">
                                {productKnowledgeBase[product.id].questionsAnswers
                                  .filter(qa => qa.question.trim() !== '' || qa.answer.trim() !== '')
                                  .map((qa, index) => (
                                    <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                                      <div className="mb-2">
                                        <span className="text-xs font-semibold text-purple-600 uppercase">Question</span>
                                        <p className="text-gray-900 mt-1">{qa.question}</p>
                                      </div>
                                      <div>
                                        <span className="text-xs font-semibold text-purple-600 uppercase">Answer</span>
                                        <p className="text-gray-700 mt-1">{qa.answer}</p>
                                      </div>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          )}

                          {/* Show message if no data */}
                          {!productKnowledgeBase[product.id].urls.some(url => url.trim() !== '') && 
                           !productKnowledgeBase[product.id].questionsAnswers.some(qa => qa.question.trim() !== '' || qa.answer.trim() !== '') && (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">No knowledge base data available. Click Edit to add data.</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Edit Mode Header */}
                          {productsWithData.has(product.id) && (
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">Edit Knowledge Base</h3>
                              <button
                                onClick={() => toggleViewMode(product.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Mode
                              </button>
                            </div>
                          )}

                          {/* URLs Section */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              <h3 className="text-md font-semibold text-gray-900">Website URLs</h3>
                            </div>
                        <div className="space-y-3">
                          {productKnowledgeBase[product.id].urls.map((url, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="url"
                                value={url}
                                onChange={(e) => updateUrl(product.id, index, e.target.value)}
                                placeholder="https://example.com"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              />
                              {productKnowledgeBase[product.id].urls.length > 1 && (
                                <button
                                  onClick={() => removeUrl(product.id, index)}
                                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove URL"
                                >
                                  <Trash2 size={20} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addUrl(product.id)}
                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                          >
                            <Plus size={20} />
                            Add Another URL
                          </button>
                        </div>
                      </div>

                      {/* Q&A Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="text-md font-semibold text-gray-900">Questions & Answers</h3>
                        </div>
                        <div className="space-y-4">
                          {productKnowledgeBase[product.id].questionsAnswers.map((qa, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                              <div className="flex items-start justify-between">
                                <span className="text-sm font-medium text-gray-700">Q&A Pair #{index + 1}</span>
                                {productKnowledgeBase[product.id].questionsAnswers.length > 1 && (
                                  <button
                                    onClick={() => removeQA(product.id, index)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                    title="Remove Q&A"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                <input
                                  type="text"
                                  value={qa.question}
                                  onChange={(e) => updateQuestion(product.id, index, e.target.value)}
                                  placeholder="Enter question..."
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                                <textarea
                                  value={qa.answer}
                                  onChange={(e) => updateAnswer(product.id, index, e.target.value)}
                                  placeholder="Enter answer..."
                                  rows={3}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white resize-none"
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => addQA(product.id)}
                            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium"
                          >
                            <Plus size={20} />
                            Add Another Q&A
                          </button>
                        </div>
                      </div>

                          {/* Submit Button for this product */}
                          <div className="flex justify-end pt-4">
                            <button
                              onClick={() => handleSubmit(product.id)}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                            >
                              Save Knowledge Base for {product.name}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Calls Table Component - Commented out for now */}
          {/* <CallsTable /> */}
        </div>
      </div>

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
    </AdminLayout>
  );
}
