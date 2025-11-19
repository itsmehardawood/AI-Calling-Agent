import { Save, Edit } from 'lucide-react';

export default function RecordingRetention({
  retentionPeriod,
  customDays,
  nextPurgeDate,
  isLoadingRetention,
  isEditingRetention,
  isSavingRetention,
  onEdit,
  onRetentionChange,
  onCustomDaysChange,
  onSave,
  onCancel,
  setToast
}) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex flex-col lg:grid lg:grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-8 p-4 sm:p-6">
        {/* Left Sidebar */}
        <div className="xl:col-span-1 border-b lg:border-b-0 pb-4 lg:pb-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recording Retention</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Manage recording storage duration</p>
        </div>

        {/* Right Content */}
        <div className="xl:col-span-3 space-y-4 sm:space-y-6">
          {isLoadingRetention ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading recording retention...</p>
            </div>
          ) : !isEditingRetention && (retentionPeriod || nextPurgeDate) ? (
            <>
              {/* View Mode */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Retention Period</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        retentionPeriod === 'custom' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {retentionPeriod === 'custom' ? `${customDays} days (Custom)` : `${retentionPeriod} days`}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Next Auto-Purge Date</p>
                      <p className="text-sm text-gray-900">
                        {nextPurgeDate ? new Date(nextPurgeDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={onEdit}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 sm:py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Retention Period
                </label>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  {['7', '30', '90'].map((days) => (
                    <button
                      key={days}
                      onClick={() => onRetentionChange(days)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        retentionPeriod === days
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {days} days
                    </button>
                  ))}
                  <button
                    onClick={() => onRetentionChange('custom')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      retentionPeriod === 'custom'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {retentionPeriod === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={customDays}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          onCustomDaysChange('');
                          return;
                        }
                        const numValue = parseInt(value);
                        if (numValue > 365) {
                          onCustomDaysChange('365');
                          setToast({ show: true, message: 'Maximum retention period is 365 days', type: 'error' });
                        } else if (numValue < 1) {
                          onCustomDaysChange('1');
                        } else {
                          onCustomDaysChange(value);
                        }
                      }}
                      placeholder="Enter days (max 365)"
                      className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Maximum: 365 days</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Next Auto-Purge Date</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {nextPurgeDate ? new Date(nextPurgeDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                {isEditingRetention && (
                  <button
                    onClick={onCancel}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={onSave}
                  disabled={isSavingRetention}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                >
                  <Save size={16} />
                  {isSavingRetention ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
