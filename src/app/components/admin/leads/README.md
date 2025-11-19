# Leads Management - Responsive Implementation

## Overview
The Leads Management page has been refactored to be fully responsive across mobile, tablet, and desktop devices. The page displays sales leads with the ability to search, filter, assign products, and paginate through results.

## Component Structure

### Main Page
- **Location**: `src/app/(admin)/Leads/page.js`
- **Purpose**: Main container for leads management with API integration
- **Features**:
  - Fetches leads from API with pagination
  - Fetches available products for assignment
  - Search functionality across email, phone, and company
  - Product assignment to leads
  - Responsive view switching (cards for mobile, table for desktop)

### Responsive Components

#### 1. StatsCards.jsx
- **Location**: `src/app/components/admin/leads/StatsCards.jsx`
- **Purpose**: Display lead statistics in a responsive grid
- **Features**:
  - Total Leads count
  - Current pagination page
  - Number of leads showing
  - Icons: Target, Users, TrendingUp
- **Responsive Behavior**:
  - Mobile (< 640px): Single column stack
  - Tablet (640-1024px): 2 columns
  - Desktop (≥ 1024px): 3 columns

#### 2. SearchBar.jsx
- **Location**: `src/app/components/admin/leads/SearchBar.jsx`
- **Purpose**: Search input for filtering leads
- **Features**:
  - Search icon
  - Placeholder text
  - Real-time search
- **Responsive Behavior**:
  - Full width on all devices
  - Adjustable padding and text size
  - Focus states optimized for touch

#### 3. LeadCard.jsx
- **Location**: `src/app/components/admin/leads/LeadCard.jsx`
- **Purpose**: Mobile-friendly card view for individual leads
- **Features**:
  - Email with icon
  - Phone number with icon
  - Company name (if available)
  - Created date
  - Product assignment dropdown
  - Current product badge
- **Responsive Behavior**:
  - Visible only on mobile/tablet (< 1024px)
  - Vertical layout for easy scrolling
  - Icons with colored backgrounds
  - Touch-optimized buttons

#### 4. LeadTable.jsx
- **Location**: `src/app/components/admin/leads/LeadTable.jsx`
- **Purpose**: Desktop table view for leads
- **Features**:
  - Sortable columns
  - Email, Phone, Company, Created Date
  - Product name badge
  - Product assignment dropdown
- **Responsive Behavior**:
  - Visible only on desktop (≥ 1024px)
  - Horizontal scrolling if needed
  - Hover states for rows
  - Optimized column widths

#### 5. Pagination.jsx
- **Location**: `src/app/components/admin/leads/Pagination.jsx`
- **Purpose**: Navigate through pages of leads
- **Features**:
  - Previous/Next buttons
  - Current page indicator
  - Page count display
  - Loading state handling
- **Responsive Behavior**:
  - Mobile: Icon-only navigation
  - Desktop: Full text labels
  - Stacks on small screens

#### 6. EmptyState.jsx
- **Location**: `src/app/components/admin/leads/EmptyState.jsx`
- **Purpose**: Display when no leads are found
- **Features**:
  - Users icon
  - Contextual message (search vs no data)
  - Clean, centered layout
- **Responsive Behavior**:
  - Adjustable icon size
  - Responsive text sizing
  - Proper spacing on all devices

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layouts
- Card view for leads
- Compact stats cards
- Icon-only pagination buttons
- Smaller text sizes (text-xs, text-sm)
- Reduced padding (p-3)

### Tablet (640px - 1024px)
- 2-column layouts where applicable
- Card view still used
- Medium text sizes (text-sm, text-base)
- Standard padding (p-4)
- Full labels on buttons

### Desktop (≥ 1024px)
- 3-column layouts for stats
- Table view for leads
- Full data display
- Larger text sizes (text-base, text-lg)
- Generous padding (p-5, p-6)
- Hover effects

## Key Features

### Search Functionality
- Real-time filtering across:
  - Email addresses
  - Phone numbers
  - Company names
- Case-insensitive matching
- Instant results

### Product Assignment
- Dropdown list of available products
- Assign products to individual leads
- Visual feedback on assignment
- Current product display

### Pagination
- Configurable page size (default: 10)
- Navigate between pages
- Display total leads count
- Preserve search filters across pages

### API Integration
- `getLeads(userId, page, limit)`: Fetch paginated leads
- `getProducts(userId)`: Fetch available products
- `addPromptToLead(productId, leadId)`: Assign product to lead
- Error handling with toast notifications

## Data Transformation

The page transforms raw lead data from the API:
```javascript
{
  id: lead._id,
  email: rawData.email,
  phone_number: rawData.phone,
  company_name: rawData.company,
  created_at: rawData.createdOn || rawData.created_on,
  product_name: rawData.product_name,
  product_id: rawData.product_id
}
```

## Styling Approach

### Tailwind Classes Used
- **Spacing**: `gap-3`, `gap-4`, `p-3`, `p-4`, `px-3`, `px-5`
- **Grid**: `grid-cols-1`, `sm:grid-cols-2`, `lg:grid-cols-3`
- **Text**: `text-xs`, `sm:text-sm`, `lg:text-base`, `text-2xl`
- **Display**: `block lg:hidden`, `hidden lg:block`
- **Colors**: `bg-blue-50`, `text-blue-600`, `border-gray-200`
- **Rounding**: `rounded-lg`, `rounded-xl`
- **Shadows**: `hover:shadow-md`

### Color Scheme
- **Blue**: Primary actions, main stats (Target, Users)
- **Purple**: Secondary stats (Showing count)
- **Green**: Phone numbers
- **Orange**: Dates
- **Indigo**: Product assignment
- **Gray**: Neutral backgrounds and text

## Usage Example

```javascript
import LeadsPage from '@/app/(admin)/Leads/page';

// The page is a client component that handles all state internally
<LeadsPage />
```

## Dependencies
- `lucide-react`: Icons (Target, Users, Mail, Phone, etc.)
- `@/app/lib/leadsApi`: API functions for leads
- `@/app/lib/productApi`: API functions for products
- `@/app/components/CustomToast`: Toast notifications
- `@/app/components/admin/AdminLayout`: Admin layout wrapper

## State Management
- `leads`: Array of lead objects
- `products`: Array of product objects
- `loading`: Loading state for API calls
- `searchTerm`: Current search filter
- `pagination`: Pagination metadata
- `currentPage`: Current page number
- `toast`: Toast notification state

## Best Practices Implemented
1. ✅ Component separation for better maintainability
2. ✅ Responsive design with mobile-first approach
3. ✅ Error handling with user-friendly messages
4. ✅ Loading states for better UX
5. ✅ Accessible form controls
6. ✅ Consistent spacing and typography
7. ✅ Icon usage for visual clarity
8. ✅ Empty states for data scenarios

## Future Enhancements
- Bulk product assignment
- Export leads to CSV
- Advanced filtering (by date, product, etc.)
- Lead sorting options
- Lead details modal
- Inline editing

---

**Last Updated**: 2024
**Responsive Breakpoints**: Mobile (<640px), Tablet (640-1024px), Desktop (≥1024px)
