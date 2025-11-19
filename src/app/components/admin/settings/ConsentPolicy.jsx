import { Save, Plus, Edit } from 'lucide-react';

export default function ConsentPolicy({
  consentScript,
  isLoadingConsent,
  isEditingConsent,
  isSavingConsent,
  onEdit,
  onChange,
  onSave,
  onCancel
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col lg:grid lg:grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-8 p-4 sm:p-6">
        {/* Left Sidebar */}
        <div className="xl:col-span-1 border-b lg:border-b-0 pb-4 lg:pb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Consent Policy</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Configure consent disclosure script</p>
        </div>

        {/* Right Content */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <label className="block text-sm font-medium text-gray-700">
              Assistant Reveal Script
            </label>
            {!isEditingConsent && consentScript && (
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:py-1 bg-blue-50 text-blue-600 hover:text-blue-700 text-sm font-medium rounded-md w-full sm:w-auto"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>

          {isLoadingConsent ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading consent policy...</p>
            </div>
          ) : isEditingConsent ? (
            /* Edit Mode */
            <>
              <textarea
                value={consentScript}
                onChange={(e) => onChange(e.target.value)}
                rows={5}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-xs sm:text-sm"
                placeholder="Enter the consent script that will be played to callers..."
              />
              <p className="text-xs text-gray-500">
                This script will be played at the beginning of each call to inform recipients about recording and AI assistance
              </p>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button
                  onClick={onCancel}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={isSavingConsent}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                >
                  <Save size={16} />
                  {isSavingConsent ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            /* View Mode */
            <>
              <div className="bg-gray-200 rounded-lg p-3 sm:p-4 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap text-xs sm:text-sm break-words">
                  {consentScript || "No consent script configured. Click Edit to add one."}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                This script will be played at the beginning of each call to inform recipients about recording and AI assistance
              </p>

              {!consentScript && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={onEdit}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Plus size={16} />
                    Add Consent Script
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
