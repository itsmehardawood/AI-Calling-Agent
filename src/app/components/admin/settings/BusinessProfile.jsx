import { Building, Save, Edit } from 'lucide-react';

export default function BusinessProfile({
  businessInfo,
  isLoadingBusiness,
  isEditingBusiness,
  isSavingBusiness,
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
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Business Profile</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Set your account details</p>
        </div>

        {/* Right Content */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-sm sm:text-md font-medium text-gray-900">Business Details</h3>
            {!isEditingBusiness && (businessInfo.businessName || businessInfo.agentTone) && (
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:py-1 bg-blue-50 text-blue-600 hover:text-blue-700 text-sm font-medium rounded-md w-full sm:w-auto"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>

          {isLoadingBusiness ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading business information...</p>
            </div>
          ) : isEditingBusiness ? (
            /* Edit Mode */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessInfo.businessName}
                    onChange={(e) => onChange('businessName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                    placeholder="Enter business name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Tone <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={businessInfo.agentTone}
                    onChange={(e) => onChange('agentTone', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                <button
                  onClick={onCancel}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={isSavingBusiness}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                >
                  <Save size={16} />
                  {isSavingBusiness ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            /* View Mode */
            <>
              {businessInfo.businessName || businessInfo.agentTone ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Business Name</p>
                        <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">
                          {businessInfo.businessName || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Agent Tone</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium capitalize ${
                          businessInfo.agentTone === 'professional' ? 'bg-blue-100 text-blue-800' :
                          businessInfo.agentTone === 'friendly' ? 'bg-green-100 text-green-800' :
                          businessInfo.agentTone === 'casual' ? 'bg-yellow-100 text-yellow-800' :
                          businessInfo.agentTone === 'formal' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {businessInfo.agentTone || "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Building size={40} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 mb-4">No business information configured yet.</p>
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm mx-auto"
                  >
                    <Building size={16} />
                    Add Business Information
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
