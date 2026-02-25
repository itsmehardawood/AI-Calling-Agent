/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import AdminLayout from '@/app/components/admin/AdminLayout';
import AdminSubscriptionGate from '@/app/components/AdminSubscriptionGate';
import CustomToast from '@/app/components/CustomToast';
import BusinessProfile from '@/app/components/admin/settings/BusinessProfile';
import CallScheduling from '@/app/components/admin/settings/CallScheduling';
import RecordingRetention from '@/app/components/admin/settings/RecordingRetention';
import ConsentPolicy from '@/app/components/admin/settings/ConsentPolicy';
import VoiceCloning from '@/app/components/admin/settings/VoiceCloning';
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
  deleteCallSchedulingRegion,
  cloneVoice,
  getClonedVoice,
  deleteClonedVoice
} from '@/app/lib/settingsApi';

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

  // Voice Cloning State
  const [currentVoice, setCurrentVoice] = useState(null);
  const [isSavingVoice, setIsSavingVoice] = useState(false);
  const [isLoadingVoice, setIsLoadingVoice] = useState(false);
  const [isEditingVoice, setIsEditingVoice] = useState(false);
  const [isDeletingVoice, setIsDeletingVoice] = useState(false);

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
        fetchConsentPolicy(),
        fetchClonedVoice()
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
      // console.log('Business profile response:', response);
      
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

  // Call Scheduling Functions
  const fetchCallScheduling = async () => {
    setIsLoadingScheduling(true);
    try {
      const response = await getCallScheduling();
          const userId = localStorage.getItem('user_id'); // For debugging purpose to see in
  
      
      if (response && response.regions && Array.isArray(response.regions)) {
        // console.log('Processing regions...');
        // Ensure timestamps are in ISO format
        const regionsWithTimeStrings = response.regions.map(region => {
          // console.log('Processing region:', region);
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
        // console.log('Processed regions:', regionsWithTimeStrings);
        setRegions(regionsWithTimeStrings);
        // Set instantCallEnabled from response if available, otherwise default to true
        setInstantCallEnabled(response.instantCallEnabled ?? true);
      } else {
        // No regions found, initialize empty
        // console.log('No regions found in response');
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

      // console.log('Existing regions to update:', existingRegions.length);
      // console.log('New regions to create:', newRegions.length);

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
        // console.log('Creating new regions with data:', JSON.stringify(schedulingData, null, 2));
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
      // console.log('Recording retention response:', response);
      
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
      
      // console.log('Saving retention data:', retentionData);
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
      // console.log('POST failed, trying PUT...');
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

  // Voice Cloning Functions
  const fetchClonedVoice = async () => {
    setIsLoadingVoice(true);
    try {
      const response = await getClonedVoice();
      console.log('Fetched voice response:', response);
      if (response) {
        // Response is already in the correct format from getClonedVoice
        setCurrentVoice(response);
        console.log('Set current voice:', response);
      } else {
        setCurrentVoice(null);
        console.log('No voice data, set to null');
      }
    } catch (error) {
      console.error('Error fetching cloned voice:', error);
      setCurrentVoice(null);
    } finally {
      setIsLoadingVoice(false);
    }
  };

  const handleSaveVoiceCloning = async (audioFile, voiceName) => {
    setIsSavingVoice(true);
    try {
      const response = await cloneVoice(audioFile, voiceName);
      setToast({ show: true, message: 'Voice cloned successfully!', type: 'success' });
      setIsEditingVoice(false);
      
      // Update current voice with the response
      setCurrentVoice({
        voiceId: response.voice_id,
        voiceName: voiceName,
        createdAt: new Date().toISOString()
      });
      
      // Refresh voice data
      await fetchClonedVoice();
    } catch (error) {
      console.error('Error cloning voice:', error);
      setToast({ show: true, message: `Error cloning voice: ${error.message}`, type: 'error' });
      throw error;
    } finally {
      setIsSavingVoice(false);
    }
  };

  const handleDeleteVoice = async () => {
    setIsDeletingVoice(true);
    try {
      await deleteClonedVoice();
      setToast({ show: true, message: 'Custom voice deleted successfully!', type: 'success' });
      setCurrentVoice(null);
      
      // Refresh voice data to confirm deletion
      await fetchClonedVoice();
    } catch (error) {
      console.error('Error deleting voice:', error);
      setToast({ show: true, message: `Error deleting voice: ${error.message}`, type: 'error' });
    } finally {
      setIsDeletingVoice(false);
    }
  };

  // Save All Settings Handler
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
      <AdminSubscriptionGate>
      {toast.show && (
        <CustomToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Settings & Compliance</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Settings Container */}
          <div className="space-y-4 sm:space-y-6">

            {/* Section 1: Business Information */}
            <BusinessProfile
              businessInfo={businessInfo}
              isLoadingBusiness={isLoadingBusiness}
              isEditingBusiness={isEditingBusiness}
              isSavingBusiness={isSavingBusiness}
              onEdit={() => setIsEditingBusiness(true)}
              onChange={handleBusinessInfoChange}
              onSave={handleSaveBusinessInfo}
              onCancel={() => {
                setIsEditingBusiness(false);
                fetchBusinessProfile();
              }}
            />

            {/* Section 2: Call Scheduling */}
            <CallScheduling
              regions={regions}
              instantCallEnabled={instantCallEnabled}
              isLoadingScheduling={isLoadingScheduling}
              isEditingScheduling={isEditingScheduling}
              isSavingScheduling={isSavingScheduling}
              deletingRegionId={deletingRegionId}
              onEdit={() => setIsEditingScheduling(true)}
              onAddRegion={handleAddRegion}
              onUpdateRegion={handleUpdateRegion}
              onRemoveRegion={handleRemoveRegion}
              onToggleInstantCall={() => setInstantCallEnabled(!instantCallEnabled)}
              onSave={handleSaveCallScheduling}
              onCancel={() => {
                setIsEditingScheduling(false);
                fetchCallScheduling();
              }}
              timestampToTime={timestampToTime}
            />

            {/* Section 3: Recording Retention */}
            <RecordingRetention
              retentionPeriod={retentionPeriod}
              customDays={customDays}
              nextPurgeDate={nextPurgeDate}
              isLoadingRetention={isLoadingRetention}
              isEditingRetention={isEditingRetention}
              isSavingRetention={isSavingRetention}
              onEdit={() => setIsEditingRetention(true)}
              onRetentionChange={setRetentionPeriod}
              onCustomDaysChange={setCustomDays}
              onSave={handleSaveRecordingRetention}
              onCancel={() => {
                setIsEditingRetention(false);
                fetchRecordingRetention();
              }}
              setToast={setToast}
            />

            {/* Section 4: Consent Policy */}
            <ConsentPolicy
              consentScript={consentScript}
              isLoadingConsent={isLoadingConsent}
              isEditingConsent={isEditingConsent}
              isSavingConsent={isSavingConsent}
              onEdit={() => setIsEditingConsent(true)}
              onChange={setConsentScript}
              onSave={handleSaveConsentPolicy}
              onCancel={() => {
                setIsEditingConsent(false);
                fetchConsentPolicy();
              }}
            />

            {/* Section 5: Voice Cloning */}
            <VoiceCloning
              currentVoice={currentVoice}
              isLoadingVoice={isLoadingVoice}
              isEditingVoice={isEditingVoice}
              isSavingVoice={isSavingVoice}
              isDeletingVoice={isDeletingVoice}
              onEdit={() => setIsEditingVoice(true)}
              onSave={handleSaveVoiceCloning}
              onDelete={handleDeleteVoice}
              onCancel={() => {
                setIsEditingVoice(false);
                fetchClonedVoice();
              }}
            />

          </div>

      
        </div>
      </div>
      </AdminSubscriptionGate>
    </AdminLayout>
  );
}