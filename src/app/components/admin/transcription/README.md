# Transcription History Components

This directory contains the modular, responsive components for the Transcription History page.

## Components

### 1. ChatListSidebar.jsx
Displays the list of all chat conversations with search functionality.

**Features:**
- Search conversations by name, phone number, or call ID
- Visual indicators for selected conversation
- Loading and error states
- Empty state handling

**Props:**
- `chatHistories` - Array of chat history objects
- `selectedChat` - Currently selected chat object
- `loading` - Boolean for loading state
- `error` - Error message string
- `searchTerm` - Current search term
- `onSearchChange` - Function to handle search input changes
- `onChatSelect` - Function called when a chat is selected
- `formatDate` - Function to format date strings

### 2. ConversationDisplay.jsx
Shows the full conversation thread for a selected chat.

**Features:**
- Message bubbles for user and AI assistant
- Scrollable message history
- Empty state when no chat is selected
- Loading state while fetching conversation
- Mobile-responsive back button
- Message timestamps

**Props:**
- `selectedChat` - Currently selected chat object
- `conversation` - Array of message objects
- `conversationLoading` - Boolean for loading state
- `onClose` - Function to close/deselect conversation
- `formatDate` - Function to format date strings
- `isMobile` - Boolean indicating mobile view

## Responsive Design

### Mobile (< 1024px):
- **Toggle View**: Shows either chat list OR conversation (not both)
- **Back Button**: Arrow button in conversation header to return to list
- **Full Screen**: Each view takes full screen width
- **Touch Optimized**: Larger touch targets, active states
- **Smaller Text**: Reduced font sizes for better fit
- **Compact Spacing**: Reduced padding and gaps

### Desktop (≥ 1024px):
- **Split View**: Chat list (1/3) + Conversation (2/3) side-by-side
- **Close Button**: X button to deselect conversation
- **Larger Content**: More spacious layout
- **Better Readability**: Larger fonts and spacing

## Key Responsive Features:

1. **Conditional Rendering**: 
   - Mobile: `{isMobile && showConversation ? 'hidden' : 'block'}`
   - Desktop: Both components always visible

2. **Dynamic Heights**:
   - Mobile: `h-[calc(100vh-140px)]`
   - Desktop: `h-[calc(100vh-160px)]`

3. **Responsive Typography**:
   - Headers: `text-2xl sm:text-3xl lg:text-4xl`
   - Body: `text-xs sm:text-sm`
   - Descriptions: `text-sm sm:text-base`

4. **Flexible Layouts**:
   - Avatar sizes: `w-8 h-8 sm:w-10 sm:h-10`
   - Padding: `p-3 sm:p-4 lg:p-6`
   - Gaps: `gap-2 sm:gap-3 lg:gap-4`

5. **Message Bubbles**:
   - Max width: `max-w-[85%] sm:max-w-[75%]`
   - Border radius: `rounded-xl sm:rounded-2xl`
   - Text wrapping: `break-words` for long text

## Mobile Experience

### Chat List View:
```
┌─────────────────────┐
│  Search Box         │
├─────────────────────┤
│  ○ User 1     →    │
│  ○ User 2     →    │
│  ○ User 3     →    │
└─────────────────────┘
```

### Conversation View (Mobile):
```
┌─────────────────────┐
│ ← Name    Phone     │
├─────────────────────┤
│  [AI] Message       │
│       Message [User]│
│  [AI] Message       │
└─────────────────────┘
```

## Desktop Experience

```
┌───────────┬─────────────────────────────┐
│ Chat List │  Conversation Header        │
│           ├─────────────────────────────┤
│ Search    │  [AI] Message               │
│           │       Message [User]        │
│ ○ User 1  │  [AI] Message               │
│ ○ User 2  │       Message [User]        │
│ ○ User 3  │                             │
│           │                             │
└───────────┴─────────────────────────────┘
```

## Usage Example

```jsx
import ChatListSidebar from '@/app/components/admin/transcription/ChatListSidebar';
import ConversationDisplay from '@/app/components/admin/transcription/ConversationDisplay';

// In mobile view
<ChatListSidebar
  chatHistories={chats}
  selectedChat={selected}
  loading={false}
  error={null}
  searchTerm={search}
  onSearchChange={setSearch}
  onChatSelect={handleSelect}
  formatDate={formatDate}
/>

// Desktop or when conversation shown
<ConversationDisplay
  selectedChat={selected}
  conversation={messages}
  conversationLoading={false}
  onClose={handleClose}
  formatDate={formatDate}
  isMobile={isMobile}
/>
```

## State Management

The main page handles:
- `isMobile` - Detected from window width (< 1024px)
- `showConversation` - Controls mobile view switching
- Window resize listener for responsive detection

## Animations

- **Fade-in**: Messages animate in smoothly
- **Hover States**: Interactive elements respond to hover
- **Active States**: Touch feedback on mobile
- **Smooth Transitions**: Color and layout changes

## Accessibility

- **ARIA Labels**: Buttons have descriptive labels
- **Keyboard Navigation**: All interactive elements accessible
- **Focus States**: Clear visual focus indicators
- **Screen Reader Friendly**: Semantic HTML structure
- **Touch Targets**: Minimum 44x44px on mobile

## Styling

Components use Tailwind CSS with:
- Gradient backgrounds for visual appeal
- Consistent blue color scheme
- Shadow and border combinations
- Smooth transitions and animations
- Professional typography hierarchy
