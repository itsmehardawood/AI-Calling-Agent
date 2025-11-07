/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import AdminLayout from '@/app/components/admin/AdminLayout';
import CustomToast from '@/app/components/CustomToast';
import { Settings, Target, ChevronDown, ChevronRight, Building, Save, Plus, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  saveBusinessProfile, 
  saveConsentPolicy, 
  saveCallScheduling, 
  saveRecordingRetention,
  getCallScheduling,
  getRecordingRetention,
  getConsentPolicy,
  updateCallSchedulingRegion,
  updateConsentPolicy
} from '@/app/lib/settingsApi';
import countryCodes from '@/app/lib/countries';

export default function SettingsCompliancePage() {
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Business Info State
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    agentTone: 'professional'
  });
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Call Scheduling State
  const [regions, setRegions] = useState([]);
  const [instantCallEnabled, setInstantCallEnabled] = useState(true);
  const [isSavingScheduling, setIsSavingScheduling] = useState(false);
  const [isLoadingScheduling, setIsLoadingScheduling] = useState(false);

  // Recording Retention State
  const [retentionPeriod, setRetentionPeriod] = useState('30');
  const [customDays, setCustomDays] = useState('');
  const [nextPurgeDate, setNextPurgeDate] = useState('');
  const [isSavingRetention, setIsSavingRetention] = useState(false);
  const [isLoadingRetention, setIsLoadingRetention] = useState(false);

  // Consent Policy State
  const [consentScript, setConsentScript] = useState('');
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [isLoadingConsent, setIsLoadingConsent] = useState(false);
  const [isEditingConsent, setIsEditingConsent] = useState(false); // Add this line

  // Loading state for entire page
  const [isLoading, setIsLoading] = useState(true);

  // Load all settings on component mount
  useEffect(() => {
    fetchAllSettings();
  }, []);

  // Fetch all settings
  const fetchAllSettings = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchCallScheduling(),
        fetchRecordingRetention(),
        fetchConsentPolicy()
      ]);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Business Info Functions
  const handleBusinessInfoChange = (field, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveBusinessInfo = async () => {
  if (!businessInfo.businessName.trim()) {
    setToast({ show: true, message: 'Please enter a business name', type: 'error' });
    return;
  }

  setIsSavingBusiness(true);
  try {
    const response = await saveBusinessProfile(businessInfo);
    setToast({ show: true, message: 'Business information saved successfully!', type: 'success' });
    setIsEditingBusiness(false); // Exit edit mode after successful save
    return response;
  } catch (error) {
    console.error('Error saving business info:', error);
    setToast({ show: true, message: `Error saving business information: ${error.message}`, type: 'error' });
    throw error;
  } finally {
    setIsSavingBusiness(false);
  }
};

  // Call Scheduling Functions
  const fetchCallScheduling = async () => {
    setIsLoadingScheduling(true);
    try {
      const response = await getCallScheduling();
      if (response && response.regions) {
        setRegions(response.regions || []);
        setInstantCallEnabled(response.instantCallEnabled ?? true);
      }
    } catch (error) {
      console.error('Error fetching call scheduling:', error);
    } finally {
      setIsLoadingScheduling(false);
    }
  };

  const handleAddRegion = () => {
    const newRegion = {
      id: Date.now().toString(),
      name: 'Enter region name',
      startTime: '09:00',
      endTime: '17:00',
      enabled: true,
      retrySettings: {
        attempts: 3,
        intervals: [5, 30]
      },
      recordingRetentionDays: parseInt(retentionPeriod) || 30
    };
    setRegions([...regions, newRegion]);
  };

  const handleUpdateRegion = (id, field, value) => {
    setRegions(regions.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleRemoveRegion = (id) => {
    setRegions(regions.filter(r => r.id !== id));
  };

  const handleSaveCallScheduling = async () => {
    if (regions.length === 0) {
      setToast({ show: true, message: 'Please add at least one region', type: 'error' });
      return;
    }

    setIsSavingScheduling(true);
    try {
      const schedulingData = {
        regions: regions,
        instantCallEnabled: instantCallEnabled
      };
      await saveCallScheduling(schedulingData);
      setToast({ show: true, message: 'Call scheduling saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving call scheduling:', error);
      setToast({ show: true, message: `Error saving call scheduling: ${error.message}`, type: 'error' });
      throw error;
    } finally {
      setIsSavingScheduling(false);
    }
  };

  // Recording Retention Functions
  const fetchRecordingRetention = async () => {
    setIsLoadingRetention(true);
    try {
      const response = await getRecordingRetention();
      if (response) {
        setRetentionPeriod(response.period?.toString() || '30');
        setCustomDays(response.customDays?.toString() || '');
        setNextPurgeDate(response.nextPurgeDate || '');
      }
    } catch (error) {
      console.error('Error fetching recording retention:', error);
    } finally {
      setIsLoadingRetention(false);
    }
  };

  const handleSaveRecordingRetention = async () => {
    setIsSavingRetention(true);
    try {
      const retentionData = {
        period: parseInt(retentionPeriod),
        customDays: customDays ? parseInt(customDays) : 0
      };
      await saveRecordingRetention(retentionData);
      setToast({ show: true, message: 'Recording retention settings saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving recording retention:', error);
      setToast({ show: true, message: `Error saving recording retention: ${error.message}`, type: 'error' });
      throw error;
    } finally {
      setIsSavingRetention(false);
    }
  };

  // Consent Policy Functions
  const fetchConsentPolicy = async () => {
    setIsLoadingConsent(true);
    try {
      const response = await getConsentPolicy();
      if (response) {
        setConsentScript(response.script || '');
      }
    } catch (error) {
      console.error('Error fetching consent policy:', error);
    } finally {
      setIsLoadingConsent(false);
    }
  };

 const handleSaveConsentPolicy = async () => {
  if (!consentScript.trim()) {
    setToast({ show: true, message: 'Please enter a consent script', type: 'error' });
    return;
  }

  setIsSavingConsent(true);
  try {
    // Try POST first, if it fails try PUT
    try {
      await saveConsentPolicy(consentScript);
    } catch (postError) {
      console.log('POST failed, trying PUT...');
      await updateConsentPolicy(consentScript);
    }
    setToast({ show: true, message: 'Consent policy saved successfully!', type: 'success' });
    setIsEditingConsent(false); // Exit edit mode after successful save
  } catch (error) {
    console.error('Error saving consent policy:', error);
    setToast({ show: true, message: `Error saving consent policy: ${error.message}`, type: 'error' });
    throw error;
  } finally {
    setIsSavingConsent(false);
  }
};

  // Save All Handler
  const handleSaveAll = async () => {
    try {
      if (businessInfo.businessName.trim()) {
        await handleSaveBusinessInfo();
      }
      if (regions.length > 0) {
        await handleSaveCallScheduling();
      }
      await handleSaveRecordingRetention();
      if (consentScript.trim()) {
        await handleSaveConsentPolicy();
      }
      setToast({ show: true, message: 'All settings saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleManualPurge = () => {
    setShowConfirmDialog(true);
  };

  const confirmManualPurge = () => {
    setShowConfirmDialog(false);
    setToast({ show: true, message: 'Recordings purged successfully!', type: 'success' });
  };

  const getToneColor = (tone) => {
    const colors = {
      professional: 'bg-blue-100 text-blue-800',
      friendly: 'bg-yellow-100 text-yellow-800',
      casual: 'bg-pink-100 text-pink-800',
      formal: 'bg-indigo-100 text-indigo-800',
    };
    return colors[tone] || colors.professional;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 py-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {toast.show && (
        <CustomToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Manual Purge</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to manually delete all recordings that exceed the retention period?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmManualPurge}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Settings & Compliance</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Settings Container */}
          <div className="space-y-6">

            {/* Section 1: Business Information */}
<div className="bg-white rounded-lg shadow">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6">
    {/* Left Sidebar */}
    <div className="lg:col-span-1">
      <h2 className="text-lg font-semibold text-gray-900">Business Profile</h2>
      <p className="text-sm text-gray-500 mt-2">Set your account details</p>
    </div>

    {/* Right Content */}
    <div className="lg:col-span-3 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium text-gray-900">Business Details</h3>
        {!isEditingBusiness && (businessInfo.businessName || businessInfo.agentTone) && (
          <button
            onClick={() => setIsEditingBusiness(true)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Edit size={16} />
            Edit
          </button>
        )}
      </div>

      {isLoadingBusiness ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-3">Loading business information...</p>
        </div>
      ) : isEditingBusiness ? (
        /* Edit Mode */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={businessInfo.businessName}
                onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                onChange={(e) => handleBusinessInfoChange('agentTone', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsEditingBusiness(false);
                // Reset to original values
                // fetchBusinessProfile();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBusinessInfo}
              disabled={isSavingBusiness}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
            >
              <Save size={16} />
              {isSavingBusiness ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      ) : (
        /* View Mode */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-700">
                  {businessInfo.businessName || "Not set"}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Tone
              </label>
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                <span className={`px-2 py-1 rounded-full text-md  text-gray-600 font-medium (businessInfo.agentTone)`}>
                  {businessInfo.agentTone || "Not set"}
                </span>
              </div>
            </div>
          </div>

          {!(businessInfo.businessName || businessInfo.agentTone) && (
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsEditingBusiness(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Plus size={16} />
                Add Business Information
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </div>
</div>

            {/* Section 2: Call Scheduling */}
            <div className="bg-white rounded-lg shadow">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6">
                {/* Left Sidebar */}
                <div className="lg:col-span-1">
                  <h2 className="text-lg font-semibold text-gray-900">Call Scheduling</h2>
                  <p className="text-sm text-gray-500 mt-2">Configure regional call settings</p>
                </div>

                {/* Right Content */}
                <div className="lg:col-span-3 space-y-6">
                  {isLoadingScheduling ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-3">Loading call scheduling...</p>
                    </div>
                  ) : (
                    <>
                      {regions.map((region) => (
  <div key={region.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country Name
        </label>
        <div className="relative text-gray-600">
          <select
            value={region.name}
            onChange={(e) => handleUpdateRegion(region.id, 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
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
        onClick={() => handleRemoveRegion(region.id)}
        className="ml-2 text-red-600 hover:text-red-700 text-sm mt-6"
      >
        Remove
      </button>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Time
        </label>
        <input
          type="time"
          value={region.startTime}
          onChange={(e) => handleUpdateRegion(region.id, 'startTime', e.target.value)}
          className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Time
        </label>
        <input
          type="time"
          value={region.endTime}
          onChange={(e) => handleUpdateRegion(region.id, 'endTime', e.target.value)}
          className="w-full px-3 py-2 border  text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`enabled-${region.id}`}
          checked={region.enabled}
          onChange={(e) => handleUpdateRegion(region.id, 'enabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`enabled-${region.id}`} className="ml-2 text-sm text-gray-700">
          Region enabled
        </label>
      </div>
      <div className="text-xs text-gray-500">
        Retry: {region.retrySettings?.attempts || 3} attempts
      </div>
    </div>
  </div>
))}

                      <button
                        onClick={handleAddRegion}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        <Plus size={18} />
                        Add Country
                      </button>

                      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">Instant Call</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Immediately call leads created during business hours. Off-hours leads are queued to next window.
                            </p>
                          </div>
                          <button
                            onClick={() => setInstantCallEnabled(!instantCallEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4 ${
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

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSaveCallScheduling}
                          disabled={isSavingScheduling || regions.length === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                        >
                          <Save size={16} />
                          {isSavingScheduling ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Recording Retention */}
            <div className="bg-white rounded-lg shadow">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6">
                {/* Left Sidebar */}
                <div className="lg:col-span-1">
                  <h2 className="text-lg font-semibold text-gray-900">Recording Retention</h2>
                  <p className="text-sm text-gray-500 mt-2">Manage recording storage duration</p>
                </div>

                {/* Right Content */}
                <div className="lg:col-span-3 space-y-6">
                  {isLoadingRetention ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-3">Loading recording retention...</p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Retention Period
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {['7', '30', '90'].map((days) => (
                            <button
                              key={days}
                              onClick={() => setRetentionPeriod(days)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                retentionPeriod === days
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {days} days
                            </button>
                          ))}
                          <button
                            onClick={() => setRetentionPeriod('custom')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                              onChange={(e) => setCustomDays(e.target.value)}
                              placeholder="Enter days"
                              className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-200 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Next Auto-Purge Date</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {nextPurgeDate ? new Date(nextPurgeDate).toLocaleDateString() : 'Not set'}
                            </p>
                            
                          </div>
                          <button
                            onClick={handleManualPurge}
                            className="px-4 py-2 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:text-red-700 transition-colors flex-shrink-0 ml-4"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleSaveRecordingRetention}
                          disabled={isSavingRetention}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
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

            {/* Section 4: Consent Policy */}
<div className="bg-white rounded-lg shadow">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6">
    {/* Left Sidebar */}
    <div className="lg:col-span-1">
      <h2 className="text-lg font-semibold text-gray-900">Consent Policy</h2>
      <p className="text-sm text-gray-500 mt-2">Configure consent disclosure script</p>
    </div>

    {/* Right Content */}
    <div className="lg:col-span-3 space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Assistant Reveal Script
        </label>
        {!isEditingConsent && consentScript && (
          <button
            onClick={() => setIsEditingConsent(true)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Edit size={16} />
            Edit
          </button>
        )}
      </div>

      {isLoadingConsent ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-3">Loading consent policy...</p>
        </div>
      ) : isEditingConsent ? (
        /* Edit Mode */
        <>
          <textarea
            value={consentScript}
            onChange={(e) => setConsentScript(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            placeholder="Enter the consent script that will be played to callers..."
          />
          <p className="text-xs text-gray-500">
            This script will be played at the beginning of each call to inform recipients about recording and AI assistance
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsEditingConsent(false);
                // Reset to original value if needed
                fetchConsentPolicy();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConsentPolicy}
              disabled={isSavingConsent}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
            >
              <Save size={16} />
              {isSavingConsent ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      ) : (
        /* View Mode */
        <>
          <div className="bg-gray-200 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap text-sm">
              {consentScript || "No consent script configured. Click Edit to add one."}
            </p>
          </div>
          <p className="text-xs text-gray-500">
            This script will be played at the beginning of each call to inform recipients about recording and AI assistance
          </p>

          {!consentScript && (
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setIsEditingConsent(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
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

          </div>

          {/* Footer */}
          {/* <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save All Changes
            </button>
          </div> */}
        </div>
      </div>
    </AdminLayout>
  );
}