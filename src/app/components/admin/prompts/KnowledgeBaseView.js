'use client';
import { Trash2 } from 'lucide-react';
import DocumentManager from '../shared/DocumentManager';

export default function KnowledgeBaseView({ knowledgeBase, onEdit, onDelete, hasData, documents }) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Knowledge Base Details</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* View URLs */}
      {knowledgeBase.urls.some(url => url.trim() !== '') && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h4 className="text-md font-semibold text-gray-900">Website URLs</h4>
          </div>
          <ul className="space-y-2">
            {knowledgeBase.urls.filter(url => url.trim() !== '').map((url, index) => (
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
      {knowledgeBase.questionsAnswers.some(qa => qa.question.trim() !== '' || qa.answer.trim() !== '') && (
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-md font-semibold text-gray-900">Questions & Answers</h4>
          </div>
          <div className="space-y-4">
            {knowledgeBase.questionsAnswers
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

      {/* Documents Section */}
      {documents && documents.length > 0 && (
        <div className="bg-orange-50 rounded-lg p-4">
          <DocumentManager
            documents={documents}
            isEditMode={false}
          />
        </div>
      )}

      {/* Show message if no data */}
      {!knowledgeBase.urls.some(url => url.trim() !== '') && 
       !knowledgeBase.questionsAnswers.some(qa => qa.question.trim() !== '' || qa.answer.trim() !== '') &&
       (!documents || documents.length === 0) && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No knowledge base data available. Click Edit to add data.</p>
        </div>
      )}
    </>
  );
}
