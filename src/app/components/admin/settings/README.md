# Settings Components

This directory contains the modular, responsive components for the Settings & Compliance page.

## Components

### 1. BusinessProfile.jsx
Manages business information including:
- Business name
- Agent tone settings

**Props:**
- `businessInfo` - Object containing businessName and agentTone
- `isLoadingBusiness` - Loading state
- `isEditingBusiness` - Edit mode state
- `isSavingBusiness` - Saving state
- `onEdit` - Function to enter edit mode
- `onChange` - Function to handle field changes
- `onSave` - Function to save changes
- `onCancel` - Function to cancel editing

### 2. CallScheduling.jsx
Manages regional call scheduling settings including:
- Multiple country regions
- Business hours per region
- Retry settings
- Recording retention per region
- Instant call toggle

**Props:**
- `regions` - Array of region objects
- `instantCallEnabled` - Boolean for instant call feature
- `isLoadingScheduling` - Loading state
- `isEditingScheduling` - Edit mode state
- `isSavingScheduling` - Saving state
- `deletingRegionId` - ID of region being deleted
- `onEdit` - Function to enter edit mode
- `onAddRegion` - Function to add new region
- `onUpdateRegion` - Function to update region field
- `onRemoveRegion` - Function to remove region
- `onToggleInstantCall` - Function to toggle instant call
- `onSave` - Function to save changes
- `onCancel` - Function to cancel editing
- `timestampToTime` - Helper function to convert timestamps

### 3. RecordingRetention.jsx
Manages recording retention settings including:
- Predefined retention periods (7, 30, 90 days)
- Custom retention period (1-365 days)
- Next auto-purge date display

**Props:**
- `retentionPeriod` - Selected retention period
- `customDays` - Custom days value
- `nextPurgeDate` - Next purge date
- `isLoadingRetention` - Loading state
- `isEditingRetention` - Edit mode state
- `isSavingRetention` - Saving state
- `onEdit` - Function to enter edit mode
- `onRetentionChange` - Function to change retention period
- `onCustomDaysChange` - Function to change custom days
- `onSave` - Function to save changes
- `onCancel` - Function to cancel editing
- `setToast` - Function to show toast messages

### 4. ConsentPolicy.jsx
Manages consent policy script including:
- Consent script text area
- View/Edit modes

**Props:**
- `consentScript` - Consent script text
- `isLoadingConsent` - Loading state
- `isEditingConsent` - Edit mode state
- `isSavingConsent` - Saving state
- `onEdit` - Function to enter edit mode
- `onChange` - Function to handle script changes
- `onSave` - Function to save changes
- `onCancel` - Function to cancel editing

## Responsive Design

All components are fully responsive with the following breakpoints:

- **Mobile** (< 640px): Single column layout, full-width buttons
- **Tablet** (640px - 1024px): Two-column grids where appropriate
- **Desktop** (1024px+): Three-column grids, side-by-side layouts
- **Large Desktop** (1280px+): Four-column grid with sidebar

### Key Responsive Features:

1. **Flexible Grid Layouts**: Use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
2. **Responsive Typography**: `text-sm sm:text-base lg:text-lg`
3. **Adaptive Buttons**: Full-width on mobile, auto-width on desktop
4. **Collapsible Sections**: Regions collapse/expand on mobile for better UX
5. **Responsive Padding**: `p-3 sm:p-4 lg:p-6`
6. **Flexible Containers**: `flex-col sm:flex-row` for direction changes

## Usage Example

```jsx
import BusinessProfile from '@/app/components/admin/settings/BusinessProfile';

<BusinessProfile
  businessInfo={{ businessName: 'My Company', agentTone: 'professional' }}
  isLoadingBusiness={false}
  isEditingBusiness={false}
  isSavingBusiness={false}
  onEdit={() => setIsEditingBusiness(true)}
  onChange={(field, value) => handleChange(field, value)}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

## Styling

Components use Tailwind CSS utility classes with:
- Consistent color scheme (blue primary, gray neutral)
- Hover and focus states for accessibility
- Smooth transitions for better UX
- Consistent spacing and border radius

## Accessibility

- Proper label associations
- Focus indicators on interactive elements
- Loading states with spinners
- Disabled states for buttons during operations
- Screen reader friendly text
