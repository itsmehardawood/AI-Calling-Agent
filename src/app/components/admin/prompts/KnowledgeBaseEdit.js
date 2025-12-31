'use client';
import { Plus, Trash2 } from 'lucide-react';
import DocumentManager from '../shared/DocumentManager';

export default function KnowledgeBaseEdit({
  knowledgeBase,
  hasData,
  onToggleView,
  onSave,
  productName,
  addUrl,
  removeUrl,
  updateUrl,
  addQA,
  removeQA,
  updateQuestion,
  updateAnswer,
  // Document props
  documents,
  onUploadDocument,
  onDeleteDocument,
  uploadingDocument
}) {
  return (
    <>
      {/* Edit Mode Header */}
      {hasData && onToggleView && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Knowledge Base</h3>
          <button
            onClick={onToggleView}
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
          {knowledgeBase.urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {knowledgeBase.urls.length > 1 && (
                <button
                  onClick={() => removeUrl(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove URL"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addUrl}
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
          {knowledgeBase.questionsAnswers.map((qa, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-700">Q&A Pair #{index + 1}</span>
                {knowledgeBase.questionsAnswers.length > 1 && (
                  <button
                    onClick={() => removeQA(index)}
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
                  onChange={(e) => updateQuestion(index, e.target.value)}
                  placeholder="Enter question..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea
                  value={qa.answer}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  placeholder="Enter answer..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white resize-none"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addQA}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Add Another Q&A
          </button>
        </div>
      </div>

      {/* Documents Section */}
      <DocumentManager
        documents={documents}
        onUpload={onUploadDocument}
        onDelete={onDeleteDocument}
        isEditMode={true}
        uploading={uploadingDocument}
      />

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onSave}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          Save Knowledge Base for {productName}
        </button>
      </div>
    </>
  );
}
