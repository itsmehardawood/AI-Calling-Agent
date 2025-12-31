'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { 
  saveQAPairs, 
  saveKnowledgeSources, 
  getKnowledgeBase, 
  deleteKnowledgeBase,
  uploadDocument,
  getDocuments,
  deleteDocument
} from '@/app/lib/knowledgeBaseApi';
import KnowledgeBaseView from './KnowledgeBaseView';
import KnowledgeBaseEdit from './KnowledgeBaseEdit';

export default function KnowledgeBaseSection({ 
  product, 
  isExpanded, 
  onToggle, 
  showToast,
  onDelete 
}) {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('edit');
  const [hasData, setHasData] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState({
    urls: [''],
    questionsAnswers: [{ question: '', answer: '' }]
  });
  const [documents, setDocuments] = useState([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    if (isExpanded && !loading) {
      fetchKnowledgeBase();
    }
  }, [isExpanded]);

  const fetchKnowledgeBase = async () => {
    setLoading(true);
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found.');
      }

      // Fetch knowledge base data
      const knowledgeBaseData = await getKnowledgeBase(userId, product.id);
      
      // Fetch documents
      const documentsData = await getDocuments(userId, product.id);
      setDocuments(documentsData);
      
      if (knowledgeBaseData && (knowledgeBaseData.sources?.length > 0 || knowledgeBaseData.qa_pairs?.length > 0)) {
        setKnowledgeBase({
          urls: knowledgeBaseData.sources?.length > 0 
            ? knowledgeBaseData.sources.map(s => s.url) 
            : [''],
          questionsAnswers: knowledgeBaseData.qa_pairs?.length > 0 
            ? knowledgeBaseData.qa_pairs.map(qa => ({ question: qa.question, answer: qa.answer }))
            : [{ question: '', answer: '' }]
        });
        setViewMode('view');
        setHasData(true);
      } else if (documentsData.length > 0) {
        // If only documents exist, also set to view mode
        setViewMode('view');
        setHasData(true);
      } else {
        setViewMode('edit');
        setHasData(false);
      }
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
      setViewMode('edit');
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found.');
      }

      const validUrls = knowledgeBase.urls.filter(url => url.trim() !== '');
      const validQAPairs = knowledgeBase.questionsAnswers.filter(
        qa => qa.question.trim() !== '' && qa.answer.trim() !== ''
      );

      const promises = [];

      if (validUrls.length > 0) {
        promises.push(saveKnowledgeSources(userId, product.id, validUrls));
      }

      if (validQAPairs.length > 0) {
        promises.push(saveQAPairs(userId, product.id, validQAPairs));
      }

      if (promises.length === 0) {
        showToast('Please add at least one URL or Q&A pair before saving.', 'error');
        return;
      }

      await Promise.all(promises);
      await fetchKnowledgeBase(); // Refresh data
      showToast('Knowledge base saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving knowledge base:', error);
      showToast(error.message || 'Failed to save knowledge base', 'error');
    }
  };

  const handleDeleteKnowledgeBase = async () => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found.');
      }

      await deleteKnowledgeBase(userId, product.id);
      
      setKnowledgeBase({
        urls: [''],
        questionsAnswers: [{ question: '', answer: '' }]
      });
      setDocuments([]);
      setViewMode('edit');
      setHasData(false);
      
      showToast('Knowledge base deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting knowledge base:', error);
      showToast(error.message || 'Failed to delete knowledge base', 'error');
    }
  };

  const handleUploadDocument = async (file, documentName, documentType) => {
    setUploadingDocument(true);
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found.');
      }

      await uploadDocument(userId, product.id, file, documentName, documentType);
      
      // Refresh documents list
      const documentsData = await getDocuments(userId, product.id);
      setDocuments(documentsData);
      
      showToast('Document uploaded successfully!', 'success');
    } catch (error) {
      console.error('Error uploading document:', error);
      showToast(error.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (documentName) => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
      if (!userId) {
        throw new Error('User ID not found.');
      }

      await deleteDocument(userId, product.id, documentName);
      
      // Refresh documents list
      const documentsData = await getDocuments(userId, product.id);
      setDocuments(documentsData);
      
      showToast('Document deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting document:', error);
      showToast(error.message || 'Failed to delete document', 'error');
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'view' ? 'edit' : 'view');
  };

  // URL Management
  const addUrl = () => {
    setKnowledgeBase(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }));
  };

  const removeUrl = (index) => {
    setKnowledgeBase(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }));
  };

  const updateUrl = (index, value) => {
    setKnowledgeBase(prev => {
      const newUrls = [...prev.urls];
      newUrls[index] = value;
      return { ...prev, urls: newUrls };
    });
  };

  // Q&A Management
  const addQA = () => {
    setKnowledgeBase(prev => ({
      ...prev,
      questionsAnswers: [...prev.questionsAnswers, { question: '', answer: '' }]
    }));
  };

  const removeQA = (index) => {
    setKnowledgeBase(prev => ({
      ...prev,
      questionsAnswers: prev.questionsAnswers.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index, value) => {
    setKnowledgeBase(prev => {
      const newQA = [...prev.questionsAnswers];
      newQA[index].question = value;
      return { ...prev, questionsAnswers: newQA };
    });
  };

  const updateAnswer = (index, value) => {
    setKnowledgeBase(prev => {
      const newQA = [...prev.questionsAnswers];
      newQA[index].answer = value;
      return { ...prev, questionsAnswers: newQA };
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      {/* Product Header */}
      <button
        onClick={onToggle}
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
        {isExpanded ? 
          <ChevronUp className="text-gray-600" /> : 
          <ChevronDown className="text-gray-600" />
        }
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 py-4 border-t text-gray-600 border-gray-200 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading knowledge base...</p>
            </div>
          ) : viewMode === 'view' ? (
            <KnowledgeBaseView
              knowledgeBase={knowledgeBase}
              onEdit={toggleViewMode}
              onDelete={() => onDelete(product.id, product.name, handleDeleteKnowledgeBase)}
              hasData={hasData}
              documents={documents}
            />
          ) : (
            <KnowledgeBaseEdit
              knowledgeBase={knowledgeBase}
              hasData={hasData}
              onToggleView={hasData ? toggleViewMode : null}
              onSave={handleSave}
              productName={product.name}
              // URL handlers
              addUrl={addUrl}
              removeUrl={removeUrl}
              updateUrl={updateUrl}
              // Q&A handlers
              addQA={addQA}
              removeQA={removeQA}
              updateQuestion={updateQuestion}
              updateAnswer={updateAnswer}
              // Document handlers
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              uploadingDocument={uploadingDocument}
            />
          )}
        </div>
      )}
    </div>
  );
}
