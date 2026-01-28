// components/admin/leads/ImportCSVButton.jsx
"use client";
import { useState, useRef } from "react";
import { Upload, FileUp, X, AlertCircle } from "lucide-react";
import { uploadLeadsCSV } from "../../../lib/leadsApi";

export default function ImportCSVButton({ showToast, onImportSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    // Validate file type
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      showToast("Please select a valid CSV file", 'error');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast("File size must be less than 10MB", 'error');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Please select a file to upload", 'error');
      return;
    }

    try {
      setLoading(true);

      // Get user_id from localStorage
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        showToast("User ID not found. Please login again.", 'error');
        return;
      }

      // Upload the file
      const result = await uploadLeadsCSV(selectedFile, userId);

      if (result.status === 'success') {
        showToast(
          `Successfully imported leads`,
          'success'
        );
        setIsOpen(false);
        setSelectedFile(null);
        
        // Trigger refresh of leads list
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        showToast(result.message || "Error importing leads", 'error');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      showToast("Error uploading file: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      {/* Import Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      >
        <Upload size={18} />
        <span className="hidden sm:inline">Import CSV</span>
        <span className="sm:hidden">Import</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex text-gray-800 items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Upload className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Import Leads</h3>
                  <p className="text-sm text-gray-500">Upload CSV file</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : selectedFile
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={loading}
                />

                {!selectedFile ? (
                  <div className="text-center">
                    <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                      >
                        Click to upload
                      </button>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      CSV file (max 10MB)
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <FileUp className="h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      disabled={loading}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      Choose different file
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-amber-800 font-medium">Required CSV Format</p>
                    <div className="text-xs text-amber-700 space-y-1">
                      <p className="font-medium">The CSV file must contain these exact columns:</p>
                      <div className="bg-white/50 rounded px-2 py-1.5 font-mono text-xs">
                        email, company, created_on, phone, user_id, product_id
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 mt-2">
                        <li>Header row must match these column names exactly</li>
                        <li>Any other format will be considered invalid</li>
                        <li>Maximum file size: 10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={loading || !selectedFile}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Upload CSV</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
