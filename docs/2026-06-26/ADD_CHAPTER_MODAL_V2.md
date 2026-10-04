# Add Chapter Modal V2 — Full Fields Plan

**Date:** 2026-06-26  
**Builds on:** `docs/2026-06-25/ADD_CHAPTER_PLAN.md`  
**Goal:** Extend `AddChapterModal` and `createChapter` to support the full request body for `POST /chapters`.

---

## Full Request Body

```json
{
  "title": "Test new chapter",
  "language": "en",
  "bookId": "12b149cf8881ef7ad905b037",
  "domainId": "2711ca97c3a47af8c82925e8cd233d0e",
  "domainName": "Biology",
  "subDomainId": "038052552f7b04e4b2523203d3c25489",
  "subDomainName": "Cells",
  "description": "Introduction to cells",
  "pdfUrl": "https://example.com/chapter.pdf",
  "cognitive": "understand",
  "topicName": "Animal Cell",
  "toc": [ { "title": "...", "depth": 0, "children": [...] } ],
  "depth": 2
}
```

---

## Key Findings from Codebase

| Field | Source |
|---|---|
| `domainId` / `domainName` | `src/config/data/domainList.json` — local JSON, no API call |
| `subDomainId` / `subDomainName` | `src/config/data/subDomainList.json` — keyed by `domainId`, local JSON |
| `cognitive` | Static enum — Bloom's taxonomy |
| `toc` | User-built tree — no existing API |
| `bookId` | Passed as prop from `AddBook.jsx` |

---

## UI Design — 3-Step MUI Stepper

The existing modal has 2 fields (title, language). Adding 9 more fields + a tree editor into a single scroll would be unwieldy. A **3-step MUI Stepper** inside the dialog keeps each screen focused.

```
[ Basic Info ] → [ Domain & Content ] → [ Table of Contents ]
                                                  ↓
                                              [ Save ]
```

### Step 1 — Basic Info

| Field | Component | Required | Notes |
|---|---|---|---|
| Title | TextField | Yes | existing |
| Description | TextField multiline | No | 3 rows |
| Language | MUI Select | No | en / ar — existing |
| Depth | TextField type=number | No | chapter depth level |
| Cognitive | MUI Select | No | Bloom's taxonomy enum |
| Topic Name | TextField | No | |
| PDF URL | TextField | No | validated as URL if provided |

**Cognitive options (Bloom's taxonomy):**
`remember` · `understand` · `apply` · `analyze` · `evaluate` · `create`

---

### Step 2 — Domain & Content

| Field | Component | Required | Notes |
|---|---|---|---|
| Domain | MUI Select | No | populated from `domainList` JSON; selecting auto-fills `domainId` + `domainName` |
| Sub Domain | MUI Select | No | populated from `subDomainList[domainId]`; disabled until domain chosen; selecting auto-fills `subDomainId` + `subDomainName` |

No text inputs for IDs — they are derived from the selected option and sent invisibly in the payload.

---

### Step 3 — Table of Contents

The TOC is a recursive tree. We manage it as a **flat list with depth** and convert to nested on submit.

#### Flat editor UI

Each row:
```
[ ≡ ]  [ Title input ................................ ]  [ depth 0 ▼ ]  [ × ]
[ ≡ ]  [   Title input .............................. ]  [ depth 1 ▼ ]  [ × ]
[ ≡ ]  [   Title input .............................. ]  [ depth 1 ▼ ]  [ × ]
                                               [ + Add item ]
```

- Depth 0 = root section, depth 1 = child, depth 2 = grandchild
- Each row is indented visually: `paddingLeft: depth * 24px`
- Depth selector: MUI Select with options 0–3
- `×` removes the row
- `+ Add item` appends a new row at depth 0 (user can change depth)

#### Flat → Nested conversion (on submit)

```
flatToTree(items):
  stack = []
  root = []
  for each item:
    node = { title: item.title, depth: item.depth, children: [] }
    while stack.length && stack.last.depth >= item.depth:
      stack.pop()
    if stack is empty:
      root.push(node)
    else:
      stack.last.children.push(node)
    stack.push(node)
  return root
```

---

## Stepper Navigation Rules

- **Next** on Step 1: validate that `title` is not empty; all other Step 1 fields are optional
- **Next** on Step 2: no required fields — always allowed
- **Back**: always allowed, preserves entered values
- **Save** (Step 3): submits — calls `createChapter`, shows spinner, disables all inputs

---

## Files to Change

### 1. `src/api/bookapi.js`

Update `createChapter` signature to accept the full payload:

```js
export const createChapter = async ({
  bookId, title, language, description,
  domainId, domainName, subDomainId, subDomainName,
  pdfUrl, cognitive, topicName, toc, depth,
}) => {
  const res = await axios.post("/chapters", {
    bookId, title, language, description,
    domainId, domainName, subDomainId, subDomainName,
    pdfUrl, cognitive, topicName, toc, depth,
  });
  return res.data;
};
```

Omit fields that are empty/undefined so the backend doesn't receive empty strings for optional fields.

### 2. `src/components/Modal/AddChapterModal/AddChapterModal.jsx`

Full rewrite. Structure:

```
AddChapterModal
├── state: activeStep (0/1/2), formData {all fields}, tocItems [{title, depth}]
├── <Dialog maxWidth="md" fullWidth>
│   ├── <DialogTitle> Add Chapter + close button
│   ├── <Divider>
│   ├── <DialogContent>
│   │   ├── <Stepper activeStep={activeStep}>
│   │   │   ├── <Step> Basic Info
│   │   │   ├── <Step> Domain & Content
│   │   │   └── <Step> Table of Contents
│   │   └── {activeStep === 0 && <StepBasicInfo />}
│   │       {activeStep === 1 && <StepDomainContent />}
│   │       {activeStep === 2 && <StepToc />}
│   ├── <Divider>
│   └── <DialogActions>
│       ├── <Button> Cancel (always) / Back (steps 1-2)
│       └── <Button> Next (steps 0-1) / Save (step 2)
```

Sub-components (defined inside the same file or as separate files in `AddChapterModal/`):

| Component | Responsibility |
|---|---|
| `StepBasicInfo` | Title, description, language, depth, cognitive, topicName, pdfUrl |
| `StepDomainContent` | Domain select → sub-domain select (cascading) |
| `StepToc` | Flat TOC row list + add button |
| `TocRow` | Single editable TOC row (title input + depth select + remove button) |

### 3. No changes needed to `Modal.jsx` or `AddBook.jsx`

The modal is already registered and wired up from the previous plan.

---

## State Shape Inside the Modal

```js
const [activeStep, setActiveStep] = useState(0);

const [form, setForm] = useState({
  title: "",
  description: "",
  language: "en",
  depth: "",
  cognitive: "",
  topicName: "",
  pdfUrl: "",
  domainId: "",
  domainName: "",
  subDomainId: "",
  subDomainName: "",
});

const [tocItems, setTocItems] = useState([]);   // [{ title: "", depth: 0 }]
const [titleError, setTitleError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
```

`setForm` always does `prev => ({ ...prev, ...patch })` so individual field updates are simple.

---

## Submit Payload Construction

```js
const payload = {
  bookId,
  title: form.title.trim(),
  language: form.language,
  ...(form.description   && { description: form.description }),
  ...(form.domainId      && { domainId: form.domainId, domainName: form.domainName }),
  ...(form.subDomainId   && { subDomainId: form.subDomainId, subDomainName: form.subDomainName }),
  ...(form.pdfUrl        && { pdfUrl: form.pdfUrl }),
  ...(form.cognitive     && { cognitive: form.cognitive }),
  ...(form.topicName     && { topicName: form.topicName }),
  ...(form.depth !== ""  && { depth: Number(form.depth) }),
  ...(tocItems.length    && { toc: flatToTree(tocItems) }),
};
```

---

## What Is NOT in Scope

- Editing or reordering existing TOC items via drag-and-drop (plain add/remove only)
- Fetching domains from a remote API (local JSON is sufficient)
- Validation beyond Step 1 title requirement
- PDF upload (URL input only, no file picker)
