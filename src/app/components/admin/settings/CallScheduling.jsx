import { ChevronDown, ChevronRight, Save, Plus, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import countryCodes from '@/app/lib/countries';

export default function CallScheduling({
  regions,
  instantCallEnabled,
  isLoadingScheduling,
  isEditingScheduling,
  isSavingScheduling,
  deletingRegionId,
  onEdit,
  onAddRegion,
  onUpdateRegion,
  onRemoveRegion,
  onToggleInstantCall,
  onSave,
  onCancel,
  timestampToTime
}) {
  const [expandedRegions, setExpandedRegions] = useState({});

  const toggleRegion = (regionId) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionId]: !prev[regionId]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col lg:grid lg:grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-8 p-4 sm:p-6">
        {/* Left Sidebar */}
        <div className="xl:col-span-1 border-b lg:border-b-0 pb-4 lg:pb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Call Scheduling</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Configure regional call settings</p>
        </div>

        {/* Right Content */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-sm sm:text-md font-medium text-gray-900">Regional Settings</h3>
            {!isEditingScheduling && regions.length > 0 && (
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:py-1 bg-blue-50 text-blue-600 hover:text-blue-700 text-sm font-medium rounded-md w-full sm:w-auto"
              >
                <Edit size={16} />
                Edit
              </button>
            )}
          </div>

          {isLoadingScheduling ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading call scheduling...</p>
            </div>
          ) : isEditingScheduling ? (
            /* Edit Mode */
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Note:</strong> Times are stored as ISO 8601 timestamps (e.g., 2025-11-12T10:30:00.000000Z).
                </p>
              </div>

              <div className="space-y-4">
                {regions.map((region) => (
                  <div key={region.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative text-gray-600">
                          <select
                            value={region.name}
                            onChange={(e) => onUpdateRegion(region.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm sm:text-base"
                          >
                            <option value="">Select a country</option>
                            {countryCodes.map((country) => (
                              <option key={country.country} value={country.country}>
                                {country.flag} {country.country}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveRegion(region.id)}
                        disabled={deletingRegionId === region.id}
                        className="sm:ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors sm:mt-6 disabled:opacity-50 disabled:cursor-not-allowed self-start"
                        title={deletingRegionId === region.id ? "Deleting..." : "Remove region"}
                      >
                        {deletingRegionId === region.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={timestampToTime(region.startTime)}
                          onChange={(e) => {
                            const timeToTimestamp = (timeString) => {
                              const today = new Date();
                              const [hours, minutes] = timeString.split(':').map(Number);
                              today.setHours(hours, minutes, 0, 0);
                              return today.toISOString();
                            };
                            onUpdateRegion(region.id, 'startTime', timeToTimestamp(e.target.value));
                          }}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1 truncate" title={region.startTime}>
                          {region.startTime}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={timestampToTime(region.endTime)}
                          onChange={(e) => {
                            const timeToTimestamp = (timeString) => {
                              const today = new Date();
                              const [hours, minutes] = timeString.split(':').map(Number);
                              today.setHours(hours, minutes, 0, 0);
                              return today.toISOString();
                            };
                            onUpdateRegion(region.id, 'endTime', timeToTimestamp(e.target.value));
                          }}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-500 mt-1 truncate" title={region.endTime}>
                          {region.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Retry Attempts
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={region.retrySettings?.attempts || 1}
                          onChange={(e) => onUpdateRegion(region.id, 'retrySettings', {
                            ...region.retrySettings,
                            attempts: parseInt(e.target.value) || 1
                          })}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Retry Interval (mins)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={region.retrySettings?.intervals?.[0] || 2}
                          onChange={(e) => onUpdateRegion(region.id, 'retrySettings', {
                            ...region.retrySettings,
                            intervals: [parseInt(e.target.value) || 2]
                          })}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Retention (days)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={region.recordingRetentionDays || 1}
                          onChange={(e) => onUpdateRegion(region.id, 'recordingRetentionDays', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-md p-3 border border-gray-200 gap-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`enabled-${region.id}`}
                          checked={region.enabled}
                          onChange={(e) => onUpdateRegion(region.id, 'enabled', e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`enabled-${region.id}`} className="ml-2 text-sm font-medium text-gray-700">
                          Region enabled
                        </label>
                      </div>
                      <div className="text-xs text-gray-500">
                        {region.retrySettings?.attempts || 1} attempts, {region.retrySettings?.intervals?.[0] || 2} min interval
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={onAddRegion}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors border border-blue-200"
                >
                  <Plus size={18} />
                  Add Country Region
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-4">
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Instant Call</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Immediately call leads created during business hours. Off-hours leads are queued to next window.
                      </p>
                    </div>
                    <button
                      onClick={onToggleInstantCall}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                        instantCallEnabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          instantCallEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
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
                  disabled={isSavingScheduling || regions.length === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                >
                  <Save size={16} />
                  {isSavingScheduling ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            /* View Mode */
            <>
              {regions.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {regions.map((region) => {
                      const isExpanded = expandedRegions[region.id];
                      return (
                        <div key={region.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          {/* Region Header - Always Visible */}
                          <div 
                            onClick={() => toggleRegion(region.id)}
                            className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                {isExpanded ? (
                                  <ChevronDown size={20} className="text-gray-600 flex-shrink-0" />
                                ) : (
                                  <ChevronRight size={20} className="text-gray-600 flex-shrink-0" />
                                )}
                                <h4 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{region.name}</h4>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                region.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {region.enabled ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 ml-2 flex-shrink-0">
                              {timestampToTime(region.startTime)} - {timestampToTime(region.endTime)}
                            </div>
                          </div>
                          
                          {/* Region Details - Collapsible */}
                          {isExpanded && (
                            <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Business Hours</p>
                                  <p className="text-sm text-gray-900">
                                    {timestampToTime(region.startTime)} - {timestampToTime(region.endTime)}
                                  </p>
                                </div>
                                
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Retry Settings</p>
                                  <p className="text-sm text-gray-900">
                                    {region.retrySettings?.attempts || 1} attempts, {region.retrySettings?.intervals?.[0] || 2} min interval
                                  </p>
                                </div>
                                
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Recording Retention</p>
                                  <p className="text-sm text-gray-900">{region.recordingRetentionDays || 1} days</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Instant Call</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {instantCallEnabled ? 'Enabled' : 'Disabled'} - Immediately call leads created during business hours
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 ${
                        instantCallEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {instantCallEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-4">No call scheduling regions configured yet.</p>
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm mx-auto"
                  >
                    <Plus size={16} />
                    Add Region
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
