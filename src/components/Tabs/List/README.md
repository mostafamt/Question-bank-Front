# List Component

## Overview
This component renders a list of items for a specific tab. It handles interactions like adding, editing, deleting, play, and moving items.

## Props
- `tab`: The current tab configuration object.
- `chapterId`: The ID of the current chapter.
- `reader`: Boolean indicating if the component is in reader mode (read-only).
- ... other props.

## Key Functions

### handleDelete
The `handleDelete` function manages the deletion of items. 

**Behavior:**
- **Standard Tabs:** Removes the item from the state (`objects`) by filtering it out.
- **Glossary Tab (`GLOSSARY_KEYWORDS`):** Does **not** remove the item from the state. Instead, it marks the item's `status` as `'deleted'`. This allows the backend or UI to handle "soft deletes" or display them differently (e.g., strikethrough) before saving.
    - **Note:** Items with `status: 'deleted'` are filtered out from the rendered list in the `List` component to prevent them from appearing in the UI.

## Usage
```jsx
<List tab={currentTab} chapterId={id} ... />
```
