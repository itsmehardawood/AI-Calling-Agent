import React, { useEffect } from 'react';

const PromptSideMenu = ({ isOpen, onClose, prompt }) => {
  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!prompt) return null;

  return (
    <>
      {/* Backdrop with fade-in animation */}
      <div
        className={`fixed inset-0 bg-white/30 bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Side Menu with slide-in animation */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Prompt Preview</h2>
            <p className="text-gray-600 text-sm mt-1">Complete conversation guide</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content with proper padding for footer */}
        <div className="h-[calc(100vh-160px)] overflow-y-auto pb-20">
          <div className="p-6 space-y-8">
            {/* Background Info - Main Prompt */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-gray-900 text-lg">Prompt</h3>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {prompt.backgroundInfo || (
                    <span className="text-gray-400 italic">No background information provided</span>
                  )}
                </p>
              </div>
            </div>

            {/* Product Information */}
            {prompt.productInfo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900 text-lg">Product Information</h3>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {prompt.productInfo}
                  </p>
                </div>
              </div>
            )}

            {/* Target Audience */}
            {prompt.targetAudience && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900 text-lg">Target Audience</h3>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {prompt.targetAudience}
                  </p>
                </div>
              </div>
            )}

            {/* Objection Handling */}
            {prompt.objectionHandling && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900 text-lg">Objection Handling</h3>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {prompt.objectionHandling}
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!prompt.greetingMessage && !prompt.backgroundInfo && !prompt.productInfo && !prompt.targetAudience && !prompt.objectionHandling && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Prompt Content</h3>
                <p className="text-gray-500">The selected prompt doesn&apos;t contain any structured content.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            Close Preview
          </button>
        </div>
      </div>
    </>
  );
};

export default PromptSideMenu;