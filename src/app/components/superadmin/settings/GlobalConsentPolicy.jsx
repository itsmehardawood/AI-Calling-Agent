import { Save, Edit, Shield, AlertCircle } from 'lucide-react';

export default function GlobalConsentPolicy({
  consentPolicy,
  isEditing,
  isSaving,
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
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-purple-600" size={20} />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Global Consent Policy</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Default consent script for all tenants
          </p>
        </div>

        {/* Right Content */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Consent Script
              </label>
              <p className="text-xs text-gray-500">
                This script will be used as the default for all new tenants
              </p>
            </div>
            {!isEditing && (
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:py-1 bg-purple-50 text-purple-600 hover:text-purple-700 text-sm font-medium rounded-md w-full sm:w-auto"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            /* Edit Mode */
            <>
              <textarea
                value={consentPolicy.script}
                onChange={(e) => onChange('script', e.target.value)}
                rows={6}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-xs sm:text-sm"
                placeholder="Enter the default consent script that will be played to callers..."
              />

              {/* Policy Options */}
              <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPolicy.enabled}
                    onChange={(e) => onChange('enabled', e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">Enable Global Consent Policy</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      When enabled, this consent script will be available to all tenants
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentPolicy.enforced}
                    onChange={(e) => onChange('enforced', e.target.checked)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">Enforce Policy</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      When enforced, tenants cannot modify this script (they can only use this exact version)
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> If enforcement is enabled, all existing tenant consent scripts will be overridden with this global policy.
                </p>
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
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Policy'}
                </button>
              </div>
            </>
          ) : (
            /* View Mode */
            <>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap text-xs sm:text-sm break-words">
                  {consentPolicy.script || "No global consent script configured."}
                </p>
              </div>

              {/* Policy Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${consentPolicy.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700">
                    {consentPolicy.enabled ? 'Policy Enabled' : 'Policy Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${consentPolicy.enforced ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-700">
                    {consentPolicy.enforced ? 'Enforcement Active' : 'Tenants Can Customize'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                This script will be played at the beginning of each call to inform recipients about recording and AI assistance.
                {consentPolicy.enforced 
                  ? ' Tenants are required to use this exact script.'
                  : ' Tenants can customize this script in their settings.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
