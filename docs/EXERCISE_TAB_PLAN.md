# Exercise Tab Implementation Plan (Read-Only)

## Overview
Add "Exercise" tab - left side in author mode, right side under "Check Yourself" in reader mode.
**Read-only**: Display exercises list, play questions. No create/edit.

## API Endpoint
- **GET** `/api/chapters/:chapterId/exercises` - Fetch exercises list

## Files to Modify

### 1. `src/components/Studio/constants/tabs.constants.js`
Add `EXERCISE` to `LEFT_TAB_NAMES` and `RIGHT_TAB_NAMES`

### 2. `src/components/Studio/columns/index.js`
- Add Exercise tab to `buildLeftColumns` (author mode)
- Add Exercise tab to `buildReaderRightColumns` (reader mode, after Check Yourself)

### 3. `src/services/api.js`
Add:
```js
export const getExercises = (chapterId) => instance.get(`/chapters/${chapterId}/exercises`);
```

### 4. Create `src/components/Studio/components/ExerciseTab/ExerciseTab.jsx`
Simple read-only component:
- List exercises with expand/collapse
- Each exercise shows its questions
- Click question to play in iframe modal

## Implementation Steps

1. Add constants
2. Add API function
3. Create ExerciseTab component
4. Wire up in column builders

## Data Structure
```json
[{
  "name": "My Exercise",
  "questions": [
    { "_id": "...", "name": "...", "url": "...", "type": "Fill The Blanks" }
  ]
}]
```
