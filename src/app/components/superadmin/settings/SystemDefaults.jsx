import { Save, Edit, Settings as SettingsIcon } from 'lucide-react';

export default function SystemDefaults({
  systemDefaults,
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
            <SettingsIcon className="text-purple-600" size={20} />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">System Defaults</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Default settings for new tenants
          </p>
        </div>

        {/* Right Content */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-sm sm:text-md font-medium text-gray-900">Default Configuration</h3>
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
              <div className="space-y-6">
                {/* Agent Tone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Agent Tone
                  </label>
                  <select
                    value={systemDefaults.defaultAgentTone}
                    onChange={(e) => onChange('defaultAgentTone', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Default tone for AI agent conversations</p>
                </div>

                {/* Call Scheduling Defaults */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Call Scheduling Defaults</h4>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemDefaults.defaultCallScheduling.enabled}
                        onChange={(e) => onChange('defaultCallScheduling.enabled', e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">Enable call scheduling by default</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-7">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default Start Time
                        </label>
                        <input
                          type="time"
                          value={systemDefaults.defaultCallScheduling.defaultStartTime}
                          onChange={(e) => onChange('defaultCallScheduling.defaultStartTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Default End Time
                        </label>
                        <input
                          type="time"
                          value={systemDefaults.defaultCallScheduling.defaultEndTime}
                          onChange={(e) => onChange('defaultCallScheduling.defaultEndTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recording Retention Defaults */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Recording Retention Defaults</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Retention (Days)
                      </label>
                      <input
                        type="number"
                        min={systemDefaults.minRetentionDays}
                        max={systemDefaults.maxRetentionDays}
                        value={systemDefaults.defaultRetentionDays}
                        onChange={(e) => onChange('defaultRetentionDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={systemDefaults.minRetentionDays}
                        onChange={(e) => onChange('minRetentionDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum (Days)
                      </label>
                      <input
                        type="number"
                        min={systemDefaults.minRetentionDays}
                        value={systemDefaults.maxRetentionDays}
                        onChange={(e) => onChange('maxRetentionDays', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Tenants can set retention within the minimum and maximum range
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
                  {isSaving ? 'Saving...' : 'Save Defaults'}
                </button>
              </div>
            </>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Default Agent Tone</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{systemDefaults.defaultAgentTone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Call Scheduling</p>
                    <p className="text-sm font-medium text-gray-900">
                      {systemDefaults.defaultCallScheduling.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Default Call Hours</p>
                    <p className="text-sm font-medium text-gray-900">
                      {systemDefaults.defaultCallScheduling.defaultStartTime} - {systemDefaults.defaultCallScheduling.defaultEndTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Default Retention</p>
                    <p className="text-sm font-medium text-gray-900">{systemDefaults.defaultRetentionDays} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Retention Range</p>
                    <p className="text-sm font-medium text-gray-900">
                      {systemDefaults.minRetentionDays} - {systemDefaults.maxRetentionDays} days
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                These settings will be applied to all new tenant accounts upon creation. Existing tenants are not affected by changes to these defaults.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
