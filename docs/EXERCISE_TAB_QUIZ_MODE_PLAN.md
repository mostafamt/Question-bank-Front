# Exercise Tab Quiz Mode Plan

## Changes Required

### ExerciseTab.jsx
1. Show only exercise names as clickable list
2. On click → open modal with quiz-like interface

### New Modal: ExercisePlayerModal
- **Left panel**: Question names list (clickable)
- **Right panel**: iframe showing current question
- **Bottom**: Previous/Next buttons
- Track current question index

## Data Flow
```
ExerciseTab (list of exercises)
  → Click exercise
  → Open ExercisePlayerModal
    → Left: question names
    → Right: iframe with question.url
    → Prev/Next navigation
```

## Files to Modify
1. `ExerciseTab.jsx` - Simplify to just list exercise names
2. Create `ExercisePlayerModal.jsx` - Quiz-like player with navigation

## UI Layout (Modal)
```
┌─────────────────────────────────────┐
│ Exercise: [name]              [X]   │
├──────────┬──────────────────────────┤
│ Q1 name  │                          │
│ Q2 name* │   [iframe: question]     │
│ Q3 name  │                          │
│          │                          │
├──────────┴──────────────────────────┤
│      [Previous]     [Next]          │
└─────────────────────────────────────┘
```
