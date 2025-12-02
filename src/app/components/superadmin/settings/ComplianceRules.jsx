import { Save, Edit, Shield, AlertTriangle } from 'lucide-react';

export default function ComplianceRules({
  complianceRules,
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
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Compliance Rules</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            System-wide compliance enforcement
          </p>
        </div>

        {/* Right Content */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-sm sm:text-md font-medium text-gray-900">Compliance Configuration</h3>
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
              <div className="space-y-4">
                {/* Recording Mandatory */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceRules.recordingMandatory}
                      onChange={(e) => onChange('recordingMandatory', e.target.checked)}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Recording Mandatory</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Require all calls to be recorded for compliance and quality assurance. 
                        When enabled, tenants cannot disable call recording.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Consent Required */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceRules.consentRequired}
                      onChange={(e) => onChange('consentRequired', e.target.checked)}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Consent Disclosure Required</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Require consent script to be played at the start of every call. 
                        Ensures legal compliance with recording consent laws.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Data Retention Enforced */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceRules.dataRetentionEnforced}
                      onChange={(e) => onChange('dataRetentionEnforced', e.target.checked)}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Enforce Data Retention Limits</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Automatically delete recordings after retention period expires. 
                        Helps comply with data protection regulations (GDPR, CCPA).
                      </p>
                    </div>
                  </label>
                </div>

                {/* Allow Tenant Override */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceRules.allowTenantOverride}
                      onChange={(e) => onChange('allowTenantOverride', e.target.checked)}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">Allow Tenant Customization</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Allow tenants to customize their own settings within compliance boundaries. 
                        When disabled, tenants must use system defaults exactly as configured.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-xs text-amber-900 font-medium">Important</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Changes to compliance rules will affect all tenants immediately. Restrictive rules may prevent tenants from modifying their settings.
                  </p>
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
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Rules'}
                </button>
              </div>
            </>
          ) : (
            /* View Mode */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Recording Mandatory */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-0.5 ${complianceRules.recordingMandatory ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Recording Mandatory</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {complianceRules.recordingMandatory ? 'Enabled - All calls must be recorded' : 'Disabled - Recording is optional'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Consent Required */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-0.5 ${complianceRules.consentRequired ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Consent Required</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {complianceRules.consentRequired ? 'Enabled - Consent script required' : 'Disabled - Consent is optional'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Retention Enforced */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-0.5 ${complianceRules.dataRetentionEnforced ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Data Retention Enforced</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {complianceRules.dataRetentionEnforced ? 'Enabled - Auto-deletion active' : 'Disabled - Manual deletion only'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Allow Tenant Override */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-0.5 ${complianceRules.allowTenantOverride ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Tenant Customization</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {complianceRules.allowTenantOverride ? 'Allowed - Tenants can customize' : 'Restricted - System defaults enforced'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-800">
                  <strong>Current Policy:</strong> {
                    complianceRules.recordingMandatory && complianceRules.consentRequired && complianceRules.dataRetentionEnforced
                      ? 'Strict compliance mode - All protections enabled'
                      : complianceRules.allowTenantOverride
                        ? 'Flexible mode - Tenants have customization rights'
                        : 'Moderate compliance - Some restrictions apply'
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
