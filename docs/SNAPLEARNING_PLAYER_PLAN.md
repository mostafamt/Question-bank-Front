# SnapLearning Object Player — Development Plan

## Overview

Extend the existing `/show/:id` route so that when an interactive object has
`baseType: "SnapLearning Object"`, a dedicated split-panel player is rendered
instead of the plain iframe currently shown by `Show.jsx`.

---

## Data Shape

The API call `GET /interactive-objects/:id` returns an object like:

```json
{
  "_id": "69ac2569c479e200045a1c13",
  "baseType": "SnapLearning Object",
  "parameters": {
    "title": "Chapter 3 – Cell Biology",
    "slides": [
      {
        "objectId": "abc123",
        "text": "<p>Introduction to the cell...</p>"
      },
      {
        "objectId": "def456",
        "text": "<p>The nucleus is the control center...</p>"
      }
    ]
  }
}
```

Key fields:
- `baseType` — determines which player to render
- `parameters.title` — displayed as the player heading
- `parameters.slides[]` — ordered array of slides
  - `slides[n].objectId` — ID of an interactive object to embed via iframe
  - `slides[n].text` — rich-text HTML to display in the Quill viewer

---

## Architecture

### 1. Update `Show.jsx` (router entry point)

**File:** `src/components/Show/Show.jsx`

- Fetch the full object from `GET /interactive-objects/:id`
- Branch on `baseType`:
  - `"SnapLearning Object"` → render `<SnapLearningPlayer />`
  - anything else → keep existing plain-iframe behaviour (render `<ShowIFrame />`)

```jsx
// pseudocode
const res = await axios.get(`/interactive-objects/${id}`);
const obj = res.data;

if (obj.baseType === "SnapLearning Object") {
  return <SnapLearningPlayer data={obj} />;
}
// fallback
return <ShowIFrame url={obj.url} title={obj.title} />;
```

---

### 2. Create `SnapLearningPlayer` component

**File:** `src/components/Show/SnapLearningPlayer/SnapLearningPlayer.jsx`

#### Responsibilities
- Accept the full object as a prop (`data`)
- Manage current slide index in local state (`currentSlide`, default `0`)
- Render the two-panel layout

#### Layout (vertical split — flex row)

```
┌─────────────────────────────────────────────────────────┐
│  Title: parameters.title            slide X / N         │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   iframe             │   ReactQuill (read-only)         │
│   (50% width)        │   (50% width)                    │
│                      │                                  │
│   src = /show/       │   value = slides[current].text   │
│   slides[current]    │                                  │
│   .objectId          │                                  │
│                      │                                  │
├──────────────────────┴──────────────────────────────────┤
│          [← Prev]   slide dots / counter   [Next →]     │
└─────────────────────────────────────────────────────────┘
```

#### iframe `src`

Each slide's iframe should load the nested object through the same `/show/:id`
route so it is rendered by the existing player pipeline:

```
/show/<slides[currentSlide].objectId>
```

#### Quill (read-only mode)

Use `ReactQuill` with `readOnly={true}` and `theme="snow"` (toolbar hidden via
CSS or `modules={{ toolbar: false }}`). Pass `slides[currentSlide].text` as the
`value`.

#### Navigation

- **Previous / Next** buttons update `currentSlide` state
- Disable `Prev` on slide 0, disable `Next` on last slide
- Show a slide counter: `Slide {currentSlide + 1} of {total}`

---

### 3. Create stylesheet

**File:** `src/components/Show/SnapLearningPlayer/snapLearningPlayer.module.scss`

```scss
.player {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.body {
  display: flex;
  flex: 1;
  gap: 1rem;
  overflow: hidden;
}

.iframePanel {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}

.textPanel {
  flex: 1;
  overflow-y: auto;

  // Hide Quill toolbar when read-only
  .ql-toolbar {
    display: none;
  }

  .ql-container {
    height: 100%;
    font-size: 1rem;
    border-radius: 4px;
  }
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
}
```

---

## File Structure After Implementation

```
src/components/Show/
├── Show.jsx                          ← modified (branching logic)
├── show.module.scss
├── ShowIFrame/
│   ├── ShowIFrame.jsx
│   └── showIFrame.module.scss
└── SnapLearningPlayer/               ← new
    ├── SnapLearningPlayer.jsx
    └── snapLearningPlayer.module.scss
```

No route changes needed — `/show/:id` already exists.

---

## Implementation Steps

1. **Read & understand** `Show.jsx`, `ShowIFrame.jsx`, and `SmartInteractive.jsx`
   (already done — reuse Quill + iframe patterns from those files).

2. **Modify `Show.jsx`**
   - After the API call, store the full response object (not just `url`)
   - Add the `baseType` branch

3. **Create `SnapLearningPlayer.jsx`**
   - Props: `data` (full API response)
   - State: `currentSlide` (number, starts at 0)
   - Derive `slides = data.parameters.slides`
   - Render header, split body, footer navigation

4. **Create `snapLearningPlayer.module.scss`**
   - Follow the SCSS module pattern used throughout the project

5. **Verify** at `http://localhost:3000/show/69ac2569c479e200045a1c13`
   - Confirm the split layout loads
   - Navigate between slides; iframe and Quill text update together
   - Confirm non-SnapLearning objects still render the plain iframe

---

## Dependencies

All already installed in this project:

| Package | Usage |
|---|---|
| `react-quill` | Read-only text panel |
| `react-router-dom` | `useParams`, existing route |
| `axios` (project instance) | API fetch in `Show.jsx` |
| `react-toastify` | Error notifications |
| `@mui/material` | Button, Typography for nav controls |

No new packages required.

---

## Edge Cases to Handle

| Case | Handling |
|---|---|
| `slides` array is empty | Show "No slides available" message |
| `slides[n].text` is null/empty | Pass empty string to Quill |
| `slides[n].objectId` is missing | Hide iframe or show placeholder |
| API error | Toast error, render nothing (existing pattern) |
| Single slide | Hide navigation buttons |
