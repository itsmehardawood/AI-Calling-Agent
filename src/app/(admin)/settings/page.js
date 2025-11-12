/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import AdminLayout from '@/app/components/admin/AdminLayout';
import CustomToast from '@/app/components/CustomToast';
import { Settings, Target, ChevronDown, ChevronRight, Building, Save, Plus, Trash2, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  saveBusinessProfile, 
  getBusinessProfile,
  saveConsentPolicy, 
  saveCallScheduling, 
  saveRecordingRetention,
  getCallScheduling,
  getRecordingRetention,
  getConsentPolicy,
  updateCallSchedulingRegion,
  updateConsentPolicy,
  deleteCallSchedulingRegion
} from '@/app/lib/settingsApi';
import countryCodes from '@/app/lib/countries';

export default function SettingsCompliancePage() {
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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
  const [isEditingScheduling, setIsEditingScheduling] = useState(false);
  const [deletingRegionId, setDeletingRegionId] = useState(null);
  const [expandedRegions, setExpandedRegions] = useState({}); // Track which regions are expanded

  // Recording Retention State
  const [retentionPeriod, setRetentionPeriod] = useState('30');
  const [customDays, setCustomDays] = useState('');
  const [nextPurgeDate, setNextPurgeDate] = useState('');
  const [isSavingRetention, setIsSavingRetention] = useState(false);
  const [isLoadingRetention, setIsLoadingRetention] = useState(false);
  const [isEditingRetention, setIsEditingRetention] = useState(false);

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
        fetchBusinessProfile(),
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
  const fetchBusinessProfile = async () => {
    setIsLoadingBusiness(true);
    try {
      const response = await getBusinessProfile();
      console.log('Business profile response:', response);
      
      if (response) {
        setBusinessInfo({
          businessName: response.businessName || '',
          agentTone: response.agentTone || 'professional'
        });
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
      // Don't show error toast if profile doesn't exist yet
      setBusinessInfo({
        businessName: '',
        agentTone: 'professional'
      });
    } finally {
      setIsLoadingBusiness(false);
    }
  };

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

  // Helper function to convert time string to ISO timestamp
  const timeToTimestamp = (timeString) => {
    const today = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);
    return today.toISOString();
  };

  // Helper function to convert ISO timestamp to time string
  const timestampToTime = (timestamp) => {
    if (!timestamp) return '09:00';
    try {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      return '09:00';
    }
  };

  // Toggle region expansion
  const toggleRegion = (regionId) => {
    setExpandedRegions(prev => ({
      ...prev,
      [regionId]: !prev[regionId]
    }));
  };

  // Call Scheduling Functions
  const fetchCallScheduling = async () => {
    setIsLoadingScheduling(true);
    try {
      const response = await getCallScheduling();
      console.log('Call scheduling response:', response);
      console.log('Response regions:', response?.regions);
      console.log('Response regions length:', response?.regions?.length);
      
      if (response && response.regions && Array.isArray(response.regions)) {
        console.log('Processing regions...');
        // Ensure timestamps are in ISO format
        const regionsWithTimeStrings = response.regions.map(region => {
          console.log('Processing region:', region);
          return {
            ...region,
            id: region.id || Date.now().toString(),
            startTime: region.startTime || timeToTimestamp('09:00'),
            endTime: region.endTime || timeToTimestamp('17:00'),
            retrySettings: {
              attempts: region.retrySettings?.attempts || 1,
              intervals: region.retrySettings?.intervals || [2]
            },
            recordingRetentionDays: region.recordingRetentionDays || 1
          };
        });
        console.log('Processed regions:', regionsWithTimeStrings);
        setRegions(regionsWithTimeStrings);
        // Set instantCallEnabled from response if available, otherwise default to true
        setInstantCallEnabled(response.instantCallEnabled ?? true);
      } else {
        // No regions found, initialize empty
        console.log('No regions found in response');
        setRegions([]);
        setInstantCallEnabled(true);
      }
    } catch (error) {
      console.error('Error fetching call scheduling:', error);
      // Don't show error toast, just set empty state
      setRegions([]);
      setInstantCallEnabled(true);
    } finally {
      setIsLoadingScheduling(false);
    }
  };

  const handleAddRegion = () => {
    const newRegion = {
      id: Date.now().toString(),
      name: '',
      startTime: timeToTimestamp('09:00'), // Store as ISO timestamp
      endTime: timeToTimestamp('17:00'), // Store as ISO timestamp
      enabled: true,
      retrySettings: {
        attempts: 1,
        intervals: [2] // Only minutes as digits
      },
      recordingRetentionDays: parseInt(retentionPeriod) || 1
    };
    setRegions([...regions, newRegion]);
  };

  const handleUpdateRegion = (id, field, value) => {
    setRegions(regions.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleRemoveRegion = async (id) => {
    const region = regions.find(r => r.id === id);
    
    // Check if this is an existing region (has MongoDB ID format) or a new one (timestamp ID)
    const isExistingRegion = region && region.id && region.id.length === 24; // MongoDB ObjectId is 24 chars
    
    if (isExistingRegion) {
      // Show confirmation dialog for existing regions
      if (!window.confirm(`Are you sure you want to delete the region "${region.name}"? This action cannot be undone.`)) {
        return;
      }
      
      setDeletingRegionId(id);
      try {
        await deleteCallSchedulingRegion(id);
        setToast({ show: true, message: 'Region deleted successfully!', type: 'success' });
        // Remove from state after successful deletion
        setRegions(regions.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting region:', error);
        setToast({ show: true, message: `Error deleting region: ${error.message}`, type: 'error' });
      } finally {
        setDeletingRegionId(null);
      }
    } else {
      // For new regions (not yet saved), just remove from state
      setRegions(regions.filter(r => r.id !== id));
    }
  };

  const handleSaveCallScheduling = async () => {
    if (regions.length === 0) {
      setToast({ show: true, message: 'Please add at least one region', type: 'error' });
      return;
    }

    // Validate all regions have required fields
    for (const region of regions) {
      if (!region.name || region.name === '') {
        setToast({ show: true, message: 'Please select a country for all regions', type: 'error' });
        return;
      }
    }

    setIsSavingScheduling(true);
    try {
      // Separate existing regions (MongoDB IDs) from new regions (timestamp IDs)
      const existingRegions = regions.filter(r => r.id && r.id.length === 24);
      const newRegions = regions.filter(r => !r.id || r.id.length !== 24);

      console.log('Existing regions to update:', existingRegions.length);
      console.log('New regions to create:', newRegions.length);

      // Update existing regions using PUT API
      const updatePromises = existingRegions.map(region => {
        const regionData = {
          name: region.name,
          startTime: region.startTime,
          endTime: region.endTime,
          enabled: region.enabled,
          retrySettings: {
            attempts: region.retrySettings?.attempts || 1,
            intervals: region.retrySettings?.intervals || [2]
          },
          recordingRetentionDays: region.recordingRetentionDays || 1
        };
        return updateCallSchedulingRegion(region.id, regionData);
      });

      // Create new regions using POST API (only if there are new regions)
      let createPromise = null;
      if (newRegions.length > 0) {
        const schedulingData = {
          regions: newRegions.map(r => ({
            name: r.name,
            startTime: r.startTime,
            endTime: r.endTime,
            enabled: r.enabled,
            retrySettings: {
              attempts: r.retrySettings?.attempts || 1,
              intervals: r.retrySettings?.intervals || [2]
            },
            recordingRetentionDays: r.recordingRetentionDays || 1
          })),
          instantCallEnabled: instantCallEnabled
        };
        console.log('Creating new regions with data:', JSON.stringify(schedulingData, null, 2));
        createPromise = saveCallScheduling(schedulingData);
      }

      // Wait for all API calls to complete
      const promises = [...updatePromises];
      if (createPromise) {
        promises.push(createPromise);
      }

      await Promise.all(promises);

      setToast({ show: true, message: 'Call scheduling saved successfully!', type: 'success' });
      setIsEditingScheduling(false); // Exit edit mode after successful save
      
      // Refresh data to get updated information from server
      await fetchCallScheduling();
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
      console.log('Recording retention response:', response);
      
      if (response) {
        // If customDays > 0, it's a custom period
        if (response.customDays && response.customDays > 0) {
          setRetentionPeriod('custom');
          setCustomDays(response.customDays.toString());
        } else {
          // Use the period value (7, 30, or 90)
          setRetentionPeriod(response.period?.toString() || '30');
          setCustomDays('');
        }
        setNextPurgeDate(response.nextPurgeDate || '');
      }
    } catch (error) {
      console.error('Error fetching recording retention:', error);
      // Set defaults if fetch fails
      setRetentionPeriod('30');
      setCustomDays('');
      setNextPurgeDate('');
    } finally {
      setIsLoadingRetention(false);
    }
  };

  const handleSaveRecordingRetention = async () => {
    // Validate custom days if custom is selected
    if (retentionPeriod === 'custom') {
      const days = parseInt(customDays);
      
      if (!customDays || days <= 0) {
        setToast({ show: true, message: 'Please enter a valid number of days', type: 'error' });
        return;
      }
      
      if (days > 365) {
        setToast({ show: true, message: 'Maximum retention period is 365 days', type: 'error' });
        return;
      }
    }

    setIsSavingRetention(true);
    try {
      const retentionData = {
        period: retentionPeriod === 'custom' ? 0 : parseInt(retentionPeriod),
        customDays: retentionPeriod === 'custom' ? parseInt(customDays) : 0
      };
      
      console.log('Saving retention data:', retentionData);
      await saveRecordingRetention(retentionData);
      setToast({ show: true, message: 'Recording retention settings saved successfully!', type: 'success' });
      setIsEditingRetention(false);
      
      // Refresh data to get updated nextPurgeDate
      await fetchRecordingRetention();
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
                // Reset to original values from server
                fetchBusinessProfile();
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
          {businessInfo.businessName || businessInfo.agentTone ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Business Name</p>
                    <p className="text-base font-semibold text-gray-900">
                      {businessInfo.businessName || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Agent Tone</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
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
              <Building size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 mb-4">No business information configured yet.</p>
              <button
                onClick={() => setIsEditingBusiness(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm mx-auto"
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
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-medium text-gray-900">Regional Settings</h3>
                    {!isEditingScheduling && regions.length > 0 && (
                      <button
                        onClick={() => setIsEditingScheduling(true)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                    )}
                  </div>

                  {isLoadingScheduling ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-3">Loading call scheduling...</p>
                    </div>
                  ) : isEditingScheduling ? (
                    /* Edit Mode */
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Times are stored as ISO 8601 timestamps (e.g., 2025-11-12T10:30:00.000000Z).
                        </p>
                      </div>

                      {regions.map((region) => (
                        <div key={region.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country Name <span className="text-red-500">*</span>
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
                              disabled={deletingRegionId === region.id}
                              className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={deletingRegionId === region.id ? "Deleting..." : "Remove region"}
                            >
                              {deletingRegionId === region.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="time"
                                value={timestampToTime(region.startTime)}
                                onChange={(e) => handleUpdateRegion(region.id, 'startTime', timeToTimestamp(e.target.value))}
                                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                onChange={(e) => handleUpdateRegion(region.id, 'endTime', timeToTimestamp(e.target.value))}
                                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1 truncate" title={region.endTime}>
                                {region.endTime}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Retry Attempts
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={region.retrySettings?.attempts || 1}
                                onChange={(e) => handleUpdateRegion(region.id, 'retrySettings', {
                                  ...region.retrySettings,
                                  attempts: parseInt(e.target.value) || 1
                                })}
                                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                onChange={(e) => handleUpdateRegion(region.id, 'retrySettings', {
                                  ...region.retrySettings,
                                  intervals: [parseInt(e.target.value) || 2]
                                })}
                                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                onChange={(e) => handleUpdateRegion(region.id, 'recordingRetentionDays', parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between bg-white rounded-md p-3 border border-gray-200">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`enabled-${region.id}`}
                                checked={region.enabled}
                                onChange={(e) => handleUpdateRegion(region.id, 'enabled', e.target.checked)}
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

                      <div className="pt-2">
                        <button
                          onClick={handleAddRegion}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors border border-blue-200"
                        >
                          <Plus size={18} />
                          Add Country Region
                        </button>
                      </div>

                      <div className="border-t border-gray-200 pt-6 mt-4">
                        <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 mb-1">Instant Call</h3>
                              <p className="text-sm text-gray-600">
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
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          onClick={() => {
                            setIsEditingScheduling(false);
                            fetchCallScheduling(); // Reset to original values
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                          Cancel
                        </button>
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
                  ) : (
                    /* View Mode */
                    <>
                      {regions.length > 0 ? (
                        <>
                          {regions.map((region, index) => {
                            const isExpanded = expandedRegions[region.id];
                            return (
                              <div key={region.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                {/* Region Header - Always Visible */}
                                <div 
                                  onClick={() => toggleRegion(region.id)}
                                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                      {isExpanded ? (
                                        <ChevronDown size={20} className="text-gray-600" />
                                      ) : (
                                        <ChevronRight size={20} className="text-gray-600" />
                                      )}
                                      <h4 className="text-lg font-semibold text-gray-900">{region.name}</h4>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      region.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {region.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {timestampToTime(region.startTime)} - {timestampToTime(region.endTime)}
                                  </div>
                                </div>
                                
                                {/* Region Details - Collapsible */}
                                {isExpanded && (
                                  <div className="px-4 pb-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
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

                          <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">Instant Call</h3>
                                <p className="text-sm text-gray-600">
                                  {instantCallEnabled ? 'Enabled' : 'Disabled'} - Immediately call leads created during business hours
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                instantCallEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {instantCallEnabled ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 mb-4">No call scheduling regions configured yet.</p>
                          <button
                            onClick={() => setIsEditingScheduling(true)}
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
                  ) : !isEditingRetention && (retentionPeriod || nextPurgeDate) ? (
                    <>
                      {/* View Mode */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Retention Period</p>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                            onClick={() => setIsEditingRetention(true)}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
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
                              onChange={(e) => {
                                const value = e.target.value;
                                // Allow empty string for clearing
                                if (value === '') {
                                  setCustomDays('');
                                  return;
                                }
                                // Convert to number and limit to 365
                                const numValue = parseInt(value);
                                if (numValue > 365) {
                                  setCustomDays('365');
                                  setToast({ show: true, message: 'Maximum retention period is 365 days', type: 'error' });
                                } else if (numValue < 1) {
                                  setCustomDays('1');
                                } else {
                                  setCustomDays(value);
                                }
                              }}
                              placeholder="Enter days (max 365)"
                              className="w-48 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximum: 365 days</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Next Auto-Purge Date</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {nextPurgeDate ? new Date(nextPurgeDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Not set'}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        {isEditingRetention && (
                          <button
                            onClick={() => {
                              setIsEditingRetention(false);
                              fetchRecordingRetention(); // Reset to saved values
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                          >
                            Cancel
                          </button>
                        )}
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

      
        </div>
      </div>
    </AdminLayout>
  );
}