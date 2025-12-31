'use client';
import { useState } from 'react';
import { Upload, FileText, Trash2, Plus, X } from 'lucide-react';

export default function DocumentManager({
  documents,
  onUpload,
  onDelete,
  isEditMode,
  uploading
}) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('pdf');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate document name from file name
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setDocumentName(nameWithoutExt);
      
      // Auto-detect document type from extension
      const extension = file.name.split('.').pop().toLowerCase();
      if (['pdf', 'docx', 'txt'].includes(extension)) {
        setDocumentType(extension);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName.trim()) {
      return;
    }

    await onUpload(selectedFile, documentName, documentType);
    
    // Reset form
    setSelectedFile(null);
    setDocumentName('');
    setDocumentType('pdf');
    setShowUploadForm(false);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setDocumentName('');
    setDocumentType('pdf');
    setShowUploadForm(false);
  };

  const getFileIcon = (type) => {
    return <FileText className="text-red-600" size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className="text-md font-semibold text-gray-900">Documents</h3>
      </div>

      {/* Documents List */}
      {documents && documents.length > 0 && (
        <div className="space-y-2 mb-4">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(doc.document_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.document_name}</p>
                  <p className="text-xs text-gray-600">
                    {doc.document_type?.toUpperCase()} • {formatFileSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {isEditMode && (
                <button
                  onClick={() => onDelete(doc.document_name)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  title="Delete document"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Section - Only show in edit mode */}
      {isEditMode && (
        <>
          {!showUploadForm ? (
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
            >
              <Plus size={20} />
              Upload Document
            </button>
          ) : (
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-700">Upload New Document</span>
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:bg-gray-200 p-1 rounded transition-colors"
                  title="Cancel upload"
                >
                  <X size={18} />
                </button>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                  >
                    <Upload size={20} className="text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to select a file (PDF, DOCX, TXT)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Document Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
                />
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="txt">TXT</option>
                </select>
              </div>

              {/* Upload Button */}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentName.trim() || uploading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!isEditMode && (!documents || documents.length === 0) && (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">No documents uploaded</p>
        </div>
      )}
    </div>
  );
}
