'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { Phone, PhoneOff, CheckCircle, XCircle, Clock, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getProducts } from '../../lib/productApi';
import CustomToast from '@/app/components/CustomToast';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import KnowledgeBaseSection from '@/app/components/admin/prompts/KnowledgeBaseSection';
// import CallsTable from '@/app/components/admin/inbound-calls/CallsTable';

export default function InboundCallsPage() {
  // State for products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  
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

  const handleDeleteKnowledgeBase = (productId, productName, deleteCallback) => {
    setConfirmDialog({
      title: "Delete Knowledge Base",
      message: `Are you sure you want to delete all knowledge base data for "${productName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        await deleteCallback();
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const toggleProduct = (productId) => {
    setExpandedProductId(prev => prev === productId ? null : productId);
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
                <KnowledgeBaseSection
                  key={product.id}
                  product={product}
                  isExpanded={expandedProductId === product.id}
                  onToggle={() => toggleProduct(product.id)}
                  showToast={showToast}
                  onDelete={handleDeleteKnowledgeBase}
                />
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
