/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield } from 'lucide-react';
import SuperAdminLayout from '@/app/components/superadmin/SuperAdminLayout';
import CustomToast from '@/app/components/CustomToast';
import GlobalConsentPolicy from '@/app/components/superadmin/settings/GlobalConsentPolicy';
import SystemDefaults from '@/app/components/superadmin/settings/SystemDefaults';
import ComplianceRules from '@/app/components/superadmin/settings/ComplianceRules';

// Mock API functions - Replace with actual API calls
const mockApi = {
  getGlobalSettings: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          consentPolicy: {
            script: "This call may be recorded for quality and training purposes. By continuing this call, you consent to being recorded. This conversation is being assisted by an AI system.",
            enabled: true,
            enforced: true // If true, all tenants must use this or their custom version
          },
          systemDefaults: {
            defaultAgentTone: 'professional',
            defaultCallScheduling: {
              enabled: true,
              defaultStartTime: '09:00',
              defaultEndTime: '17:00'
            },
            defaultRetentionDays: 30,
            maxRetentionDays: 365,
            minRetentionDays: 1
          },
          complianceRules: {
            recordingMandatory: true,
            consentRequired: true,
            dataRetentionEnforced: true,
            allowTenantOverride: true
          }
        });
      }, 500);
    });
  },

  saveGlobalConsentPolicy: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Saving global consent policy:', data);
        resolve({ status: 'success', message: 'Global consent policy updated' });
      }, 800);
    });
  },

  saveSystemDefaults: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Saving system defaults:', data);
        resolve({ status: 'success', message: 'System defaults updated' });
      }, 800);
    });
  },

  saveComplianceRules: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Saving compliance rules:', data);
        resolve({ status: 'success', message: 'Compliance rules updated' });
      }, 800);
    });
  }
};

export default function SuperAdminSettingsPage() {
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Global Consent Policy State
  const [consentPolicy, setConsentPolicy] = useState({
    script: '',
    enabled: true,
    enforced: false
  });
  const [isEditingConsent, setIsEditingConsent] = useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  // System Defaults State
  const [systemDefaults, setSystemDefaults] = useState({
    defaultAgentTone: 'professional',
    defaultCallScheduling: {
      enabled: true,
      defaultStartTime: '09:00',
      defaultEndTime: '17:00'
    },
    defaultRetentionDays: 30,
    maxRetentionDays: 365,
    minRetentionDays: 1
  });
  const [isEditingDefaults, setIsEditingDefaults] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);

  // Compliance Rules State
  const [complianceRules, setComplianceRules] = useState({
    recordingMandatory: true,
    consentRequired: true,
    dataRetentionEnforced: true,
    allowTenantOverride: true
  });
  const [isEditingCompliance, setIsEditingCompliance] = useState(false);
  const [isSavingCompliance, setIsSavingCompliance] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await mockApi.getGlobalSettings();
      
      setConsentPolicy(response.consentPolicy);
      setSystemDefaults(response.systemDefaults);
      setComplianceRules(response.complianceRules);
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Error loading settings: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Consent Policy Handlers
  const handleConsentChange = (field, value) => {
    setConsentPolicy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveConsent = async () => {
    if (!consentPolicy.script.trim()) {
      showToast('Consent script cannot be empty', 'error');
      return;
    }

    setIsSavingConsent(true);
    try {
      // TODO: Replace with actual API call
      await mockApi.saveGlobalConsentPolicy(consentPolicy);
      showToast('Global consent policy saved successfully!', 'success');
      setIsEditingConsent(false);
    } catch (error) {
      console.error('Error saving consent policy:', error);
      showToast('Error saving consent policy: ' + error.message, 'error');
    } finally {
      setIsSavingConsent(false);
    }
  };

  const handleCancelConsent = () => {
    setIsEditingConsent(false);
    fetchAllSettings(); // Reload to reset changes
  };

  // System Defaults Handlers
  const handleDefaultsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSystemDefaults(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSystemDefaults(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveDefaults = async () => {
    setIsSavingDefaults(true);
    try {
      // TODO: Replace with actual API call
      await mockApi.saveSystemDefaults(systemDefaults);
      showToast('System defaults saved successfully!', 'success');
      setIsEditingDefaults(false);
    } catch (error) {
      console.error('Error saving defaults:', error);
      showToast('Error saving defaults: ' + error.message, 'error');
    } finally {
      setIsSavingDefaults(false);
    }
  };

  const handleCancelDefaults = () => {
    setIsEditingDefaults(false);
    fetchAllSettings();
  };

  // Compliance Rules Handlers
  const handleComplianceChange = (field, value) => {
    setComplianceRules(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveCompliance = async () => {
    setIsSavingCompliance(true);
    try {
      // TODO: Replace with actual API call
      await mockApi.saveComplianceRules(complianceRules);
      showToast('Compliance rules saved successfully!', 'success');
      setIsEditingCompliance(false);
    } catch (error) {
      console.error('Error saving compliance rules:', error);
      showToast('Error saving compliance rules: ' + error.message, 'error');
    } finally {
      setIsSavingCompliance(false);
    }
  };

  const handleCancelCompliance = () => {
    setIsEditingCompliance(false);
    fetchAllSettings();
  };

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading settings...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-5">
        {/* Page Header */}
        <div className="px-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="text-purple-600" size={18} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Settings & Compliance
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Configure system-wide defaults and global compliance rules
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-3 sm:px-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-blue-900">System-Wide Configuration</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Settings configured here will apply as defaults for all new tenants. 
                  Existing tenants can override these settings from their individual admin panels if allowed by compliance rules.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Consent Policy */}
        <div className="px-3 sm:px-5">
          <GlobalConsentPolicy
            consentPolicy={consentPolicy}
            isEditing={isEditingConsent}
            isSaving={isSavingConsent}
            onEdit={() => setIsEditingConsent(true)}
            onChange={handleConsentChange}
            onSave={handleSaveConsent}
            onCancel={handleCancelConsent}
          />
        </div>

        {/* System Defaults */}
        <div className="px-3 sm:px-5">
          <SystemDefaults
            systemDefaults={systemDefaults}
            isEditing={isEditingDefaults}
            isSaving={isSavingDefaults}
            onEdit={() => setIsEditingDefaults(true)}
            onChange={handleDefaultsChange}
            onSave={handleSaveDefaults}
            onCancel={handleCancelDefaults}
          />
        </div>

        {/* Compliance Rules */}
        <div className="px-3 sm:px-5">
          <ComplianceRules
            complianceRules={complianceRules}
            isEditing={isEditingCompliance}
            isSaving={isSavingCompliance}
            onEdit={() => setIsEditingCompliance(true)}
            onChange={handleComplianceChange}
            onSave={handleSaveCompliance}
            onCancel={handleCancelCompliance}
          />
        </div>

        {/* Toast Notification */}
        {toast && (
          <CustomToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </SuperAdminLayout>
  );
}
