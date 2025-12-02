# Settings & Compliance - Super Admin Panel

## Overview
A comprehensive Settings & Compliance tab for the super admin panel that allows super administrators to configure system-wide defaults, global consent policies, and compliance rules that apply across all tenants.

## Features Implemented

### 1. **Global Consent Policy**
- **Default Consent Script**: Configure a global consent script that serves as the default for all new tenants
- **Policy Enablement**: Toggle to enable/disable the global consent policy
- **Policy Enforcement**: Option to enforce the policy (tenants cannot modify) or allow customization
- **Visual Status Indicators**: Shows whether policy is enabled and enforced

**Key Functionality:**
- Set a system-wide consent disclosure script
- Choose whether tenants can customize their own scripts
- Enforce mandatory consent scripts across all tenants for compliance

### 2. **System Defaults**
- **Default Agent Tone**: Set the default AI agent tone (Professional, Friendly, Casual, Formal)
- **Call Scheduling Defaults**:
  - Enable/disable call scheduling by default for new tenants
  - Set default start time (e.g., 09:00)
  - Set default end time (e.g., 17:00)
- **Recording Retention Defaults**:
  - Default retention period (in days)
  - Minimum retention days allowed
  - Maximum retention days allowed

**Key Functionality:**
- Configure default settings applied to all new tenant accounts
- Set boundaries for tenant customization
- Control retention limits for compliance

### 3. **Compliance Rules**
- **Recording Mandatory**: Require all calls to be recorded (cannot be disabled by tenants)
- **Consent Disclosure Required**: Mandate consent script at the start of every call
- **Data Retention Enforced**: Automatically delete recordings after retention period
- **Allow Tenant Customization**: Control whether tenants can override system settings

**Key Functionality:**
- System-wide compliance enforcement
- Legal compliance with recording consent laws
- GDPR/CCPA data protection compliance
- Flexible vs. strict compliance modes

## File Structure

```
src/app/
├── (superadmin)/
│   └── settings/
│       └── page.js                              # Main settings page
│
└── components/
    └── superadmin/
        ├── SuperAdminSidebar.jsx                # Updated with settings navigation
        └── settings/
            ├── GlobalConsentPolicy.jsx          # Global consent policy component
            ├── SystemDefaults.jsx               # System defaults component
            ├── ComplianceRules.jsx              # Compliance rules component
            └── README.md                        # This file
```

## Component Details

### GlobalConsentPolicy
- **Edit/View Modes**: Toggle between viewing and editing the consent script
- **Script Editor**: Large textarea for entering consent disclosure text
- **Policy Controls**: 
  - Enable/disable checkbox
  - Enforce policy checkbox
- **Warning Messages**: Alerts about enforcement impact
- **Status Display**: Visual indicators for enabled/enforced state

### SystemDefaults
- **Agent Tone Selector**: Dropdown for default agent personality
- **Call Scheduling**: 
  - Enable toggle
  - Time pickers for start/end times
- **Retention Settings**:
  - Default, minimum, and maximum retention periods
  - Input validation within allowed ranges
- **Information Display**: Clear view of all default settings

### ComplianceRules
- **Four Main Rules**:
  1. Recording Mandatory
  2. Consent Disclosure Required
  3. Data Retention Enforced
  4. Allow Tenant Customization
- **Toggle Switches**: Easy enable/disable for each rule
- **Detailed Descriptions**: Explains impact of each rule
- **Policy Summary**: Shows current compliance mode

## Mock Data Implementation

Currently using mock API functions that simulate:
- Fetching global settings (500ms delay)
- Saving consent policy (800ms delay)
- Saving system defaults (800ms delay)
- Saving compliance rules (800ms delay)

## Default Values

```javascript
consentPolicy: {
  script: "This call may be recorded for quality and training purposes...",
  enabled: true,
  enforced: true
}

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
}

complianceRules: {
  recordingMandatory: true,
  consentRequired: true,
  dataRetentionEnforced: true,
  allowTenantOverride: true
}
```

## Navigation

Access the Settings & Compliance page from:
- Super Admin sidebar navigation
- Direct URL: `/settings`

## How Tenants Are Affected

### New Tenants
- Automatically receive all system defaults upon account creation
- Consent policy is pre-populated with global script
- Restrictions apply based on compliance rules

### Existing Tenants
- **System Defaults**: Not affected by changes (only new tenants)
- **Consent Policy**: 
  - If enforced: All tenants must use global script
  - If not enforced: Tenants can customize in their admin panel
- **Compliance Rules**: Applied immediately to all tenants

### Tenant Customization Rights

When `allowTenantOverride` is:
- **Enabled**: Tenants can customize within compliance boundaries
- **Disabled**: Tenants must use system defaults exactly as configured

## Integration Points for Real API

Replace the mock API functions in the page with actual API calls:

### Get Global Settings
```javascript
const fetchAllSettings = async () => {
  const response = await fetch('/api/superadmin/settings', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    }
  });
  const data = await response.json();
  // Set state from data
};
```

### Save Individual Sections
```javascript
// Consent Policy
await fetch('/api/superadmin/settings/consent-policy', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(consentPolicy)
});

// System Defaults
await fetch('/api/superadmin/settings/defaults', {
  method: 'PUT',
  body: JSON.stringify(systemDefaults)
});

// Compliance Rules
await fetch('/api/superadmin/settings/compliance', {
  method: 'PUT',
  body: JSON.stringify(complianceRules)
});
```

## Expected API Endpoints

### GET `/api/superadmin/settings`
Returns all settings in the format shown in Default Values section above.

### PUT `/api/superadmin/settings/consent-policy`
**Request Body:**
```json
{
  "script": "Consent script text...",
  "enabled": true,
  "enforced": false
}
```

### PUT `/api/superadmin/settings/defaults`
**Request Body:**
```json
{
  "defaultAgentTone": "professional",
  "defaultCallScheduling": {
    "enabled": true,
    "defaultStartTime": "09:00",
    "defaultEndTime": "17:00"
  },
  "defaultRetentionDays": 30,
  "maxRetentionDays": 365,
  "minRetentionDays": 1
}
```

### PUT `/api/superadmin/settings/compliance`
**Request Body:**
```json
{
  "recordingMandatory": true,
  "consentRequired": true,
  "dataRetentionEnforced": true,
  "allowTenantOverride": true
}
```

## UI/UX Features

- **Responsive Design**: Mobile and desktop optimized
- **Edit/View Modes**: Separate modes for viewing and editing
- **Loading States**: Spinners and disabled states during saves
- **Toast Notifications**: Success/error messages
- **Warning Banners**: Important information about policy impacts
- **Status Indicators**: Visual dots showing enabled/disabled states
- **Validation**: Input validation for retention day ranges

## Compliance Modes

Based on rule combinations:

- **Strict Compliance**: All rules enabled - Maximum protection
- **Flexible Mode**: `allowTenantOverride` enabled - Tenants have rights
- **Moderate Compliance**: Some restrictions apply

## Testing

The page is running with mock data. Test by:

1. Navigate to super admin panel
2. Click "Settings & Compliance" in sidebar
3. Test editing each section
4. Toggle various compliance rules
5. Verify responsive behavior on mobile/desktop
6. Check toast notifications for saves

## Future Enhancements

- Audit log for settings changes
- Rollback capability for settings
- Tenant impact preview before saving
- Bulk tenant policy updates
- Custom compliance presets
- Export/import settings configuration
- Multi-region compliance profiles
