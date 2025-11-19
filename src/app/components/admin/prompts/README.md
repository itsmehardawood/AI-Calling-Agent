# Product Management (Prompts) Components

This directory contains the modular, responsive components for the Product Management page.

## Components

### 1. ProductCard.jsx
Displays a product in card format (mobile-friendly).

**Features:**
- Compact card layout
- Selection mode support with checkmark indicator
- Status toggle switch
- Edit and delete actions
- Prompt preview with truncation
- Category and status badges
- Created/Updated date display

**Props:**
- `product` - Product object
- `selectionMode` - Boolean for selection mode
- `isSelected` - Boolean if product is selected
- `onSelect` - Function to select product
- `onEdit` - Function to edit product
- `onDelete` - Function to delete product
- `onToggleStatus` - Function to toggle active/inactive
- `getStatusColor` - Function to get status badge color
- `formatDate` - Function to format date strings

### 2. ProductTable.jsx
Displays products in table format (desktop view).

**Features:**
- Full table layout with columns
- Row selection in selection mode
- Inline status toggle
- Quick action buttons
- Hover states
- Truncated text with tooltips

**Props:**
- `products` - Array of product objects
- `selectionMode` - Boolean for selection mode
- `selectedProductForDashboard` - Selected product object
- `onSelect` - Function to select product
- `onEdit` - Function to edit product
- `onDelete` - Function to delete product
- `onToggleStatus` - Function to toggle status
- `getStatusColor` - Function for status colors
- `formatDate` - Function to format dates

### 3. EmptyState.jsx
Displays when no products exist.

**Features:**
- Centered empty state message
- Create product CTA button
- Different messages for selection mode
- Responsive sizing

**Props:**
- `selectionMode` - Boolean for selection mode
- `onCreateClick` - Function to open create modal

## Responsive Design

### Mobile (< 640px):
- **Grid View Only**: Cards displayed in single column
- **Full Width Cards**: Each card takes full width
- **Stacked Actions**: Edit/Delete buttons in row
- **Compact Padding**: Reduced spacing (p-3, p-4)
- **Smaller Text**: text-xs, text-sm
- **Touch Friendly**: Larger tap targets (44px min)

### Tablet (640px - 1024px):
- **2 Column Grid**: Cards in 2-column layout
- **Medium Spacing**: Moderate padding and gaps
- **Grid View Default**: Still using cards
- **Readable Text**: text-sm, text-base

### Desktop (≥ 1024px):
- **3 Column Grid**: Cards in 3-column layout
- **Table View Option**: Toggle between grid and table
- **Larger Spacing**: More generous padding (p-6)
- **Full Feature Set**: All actions visible
- **Hover States**: Enhanced interactions

## View Modes

### Grid View (Default on Mobile)
```
┌──────────┬──────────┬──────────┐
│ Product 1│ Product 2│ Product 3│
│   Card   │   Card   │   Card   │
├──────────┼──────────┼──────────┤
│ Product 4│ Product 5│ Product 6│
│   Card   │   Card   │   Card   │
└──────────┴──────────┴──────────┘
```

**Pros:**
- Mobile-friendly
- Visual overview
- Better for browsing
- Touch-optimized

### Table View (Desktop Only)
```
┌─────────────────────────────────────┐
│ Name │ Category │ Status │ Actions │
├─────────────────────────────────────┤
│ Prod1│ Sales    │ Active │ [●][✎][🗑]│
│ Prod2│ Market   │ Inactive│[○][✎][🗑]│
└─────────────────────────────────────┘
```

**Pros:**
- Data-dense
- Quick scanning
- Easy sorting
- Professional look

## Key Features

### 1. **Adaptive View Toggle**
- Automatically shows grid on mobile
- Hides toggle button on mobile (< 1024px)
- Desktop users can switch between views
- Preference maintained during session

### 2. **Selection Mode**
- Special mode for selecting products
- Visual feedback with green highlight
- Checkmark indicators
- Selection banner at top
- Instructions panel at bottom

### 3. **Status Toggle**
- Quick on/off switch for product status
- Visual feedback (green = active, gray = inactive)
- Inline editing without modal
- Works in both card and table views

### 4. **Responsive Actions**
```jsx
// Mobile: Stacked buttons
<button>Edit</button>
<button>Delete</button>

// Desktop: Icon buttons
<button><Edit /></button>
<button><Trash /></button>
```

### 5. **Smart Truncation**
- Product names truncate with ellipsis
- Descriptions limited to 2 lines
- Full text shown in tooltips (title attribute)
- Prevents layout breaking

## Responsive Utilities

### Typography
- Headers: `text-2xl sm:text-3xl lg:text-4xl`
- Body: `text-xs sm:text-sm`
- Descriptions: `text-sm sm:text-base`

### Spacing
- Padding: `p-3 sm:p-4 lg:p-6`
- Gaps: `gap-3 sm:gap-4 lg:gap-6`
- Margins: `mb-4 sm:mb-6`

### Layout
- Grid columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Flex direction: `flex-col sm:flex-row`
- Text alignment: `text-left sm:text-center`

## Usage Example

```jsx
import ProductCard from '@/app/components/admin/prompts/ProductCard';
import ProductTable from '@/app/components/admin/prompts/ProductTable';
import EmptyState from '@/app/components/admin/prompts/EmptyState';

// Grid View
{viewMode === 'grid' && (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {products.map(product => (
      <ProductCard
        key={product.id}
        product={product}
        onEdit={handleEdit}
        onDelete={handleDelete}
        // ... other props
      />
    ))}
  </div>
)}

// Table View (Desktop)
{viewMode === 'table' && !isMobile && (
  <ProductTable
    products={products}
    onEdit={handleEdit}
    onDelete={handleDelete}
    // ... other props
  />
)}

// Empty State
{products.length === 0 && (
  <EmptyState
    selectionMode={false}
    onCreateClick={() => setShowModal(true)}
  />
)}
```

## State Management

Main page manages:
- `viewMode` - 'grid' or 'table'
- `isMobile` - Window width < 1024px
- `selectionMode` - From URL params
- `selectedProduct` - For selection mode

## Mobile UX Enhancements

1. **Touch Targets**: All buttons ≥ 44x44px
2. **Active States**: Visual feedback on tap
3. **Simplified UI**: Less clutter on small screens
4. **One Column**: Vertical scrolling only
5. **Full Width Buttons**: Easy to tap
6. **Reduced Text**: Fits better on screen
7. **Compact Cards**: More content visible

## Desktop UX Enhancements

1. **View Toggle**: Grid/Table switching
2. **Hover States**: Rich interactions
3. **Tooltips**: Additional information
4. **Keyboard Navigation**: Tab through actions
5. **Dense Layout**: More data visible
6. **Icon Actions**: Space-efficient
7. **Sort/Filter**: Advanced features

## Performance Optimizations

- **Conditional Rendering**: Only show active view
- **Lazy Loading**: Components load as needed
- **Event Delegation**: Efficient event handling
- **Memoization**: Prevent unnecessary re-renders
- **Virtualization**: For large product lists (future)

## Accessibility

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard access
- **Focus Management**: Clear focus indicators
- **Color Contrast**: WCAG AA compliant
- **Touch Targets**: Large enough for accessibility
- **Semantic HTML**: Proper element usage

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 8+)
- Responsive breakpoints work in all supported browsers
