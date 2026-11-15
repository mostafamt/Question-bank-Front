# Plan: "Author" Column in the Objects Table + Token on DrawnUI Submit

## Goal

1. **Table** (`src/components/Table/Table.jsx`): add an **Author** column showing who created each interactive object.
2. **DrawnUI submit** (`src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx`): make sure the logged-in user's token goes with both requests:
   - create → `POST /interactive-objects`
   - update → `PATCH /interactive-objects/:id`

The backend reads the token, works out the user, and saves them as the object's author. The table then shows that author.

```
┌ Objects ───────────────────────────────────────────────────────────────────────┐
│ ( ) Title      Category  Type   Domain  Sub Domain  Topic  IR  Author  Date ... │
│ (•) Q1 Intro   Question  MCQ    Math    Algebra     ...    ..  mostafa 15/11/26 │
│ ( ) Untitled 2 Question  T/F    Sci     Physics     ...    ..  —       14/11/26 │
└────────────────────────────────────────────────────────────────────────────────┘
                                                   ▲ new column ("—" when missing)
```

---

## Current state (what's already there)

| Piece | Where | Notes |
|---|---|---|
| Auth session `{ token, user }` | `src/store/store.js` → `auth` | Saved to localStorage after `POST /login`. `user = { _id, username, type, isActive }` |
| Token on requests | `src/axios.js` → `attachToken` | A request interceptor on **both** `instance` (default export) and `NewInstance` adds `Authorization: Bearer <token>` |
| DrawnUI save/edit | `DrawnUIForm.jsx` → `saveObject` / `editObject` | Uses `axios from "../../../axios"`, which is `instance`, so **the header is already sent** |
| Table rows | `Table.jsx` → `fetchQuestions` | Maps `data.docs[]` to row objects; the API's `author` field isn't read yet |

So part 2 is mostly about **checking and hardening** what already happens. The real work is on the backend (saving the author from the token) and in the table (showing it).

---

## Part 1 — Author column in `Table.jsx`

### 1.1 Column definition

Insert after `IR` and before `dateModified`:

```js
{
  field: "author",
  headerName: "Author",
  width: 150,
},
```

### 1.2 Row mapping (`fetchQuestions`)

Add to the object built in `data.docs.map(...)`:

```js
author: getAuthorName(item.author),
```

with a small helper that copes with either shape the backend might return:

```js
// author may be a populated user ({ username }) or a plain string
const getAuthorName = (author) =>
  (typeof author === "string" ? author : author?.username) || "—";
```

### 1.3 Server-side filter

The grid sends filters to the API through `columnNames`. Add:

```js
const columnNames = { ..., IR: "IR", author: "author" };
```

> Only works if the backend supports `?author=<value>` on `GET /interactive-objects`. If it doesn't, set `filterable: false` on the column for now.

### 1.4 Other tables (optional)

`src/components/ObjectsTable/ObjectsTable.jsx` and `src/components/EnhancedTable/EnhancedTable.jsx` also list objects. They're out of scope unless you want the column there too.

---

## Part 2 — Send the token on DrawnUI create & update

### 2.1 Header (already done, just check it)

`attachToken` in `src/axios.js` already adds the header to both calls. To confirm:

1. Log in, open `/add-question` → DrawnUI, then Save.
2. In DevTools → Network, check that `POST /interactive-objects` has `Authorization: Bearer …`.
3. Do the same for edit (`/edit-question/:type/:baseType/:id`) → `PATCH /interactive-objects/:id`.

### 2.2 Block submit when there's no valid session

Before the request in `onSubmit`, read the session and stop early when it's missing:

```js
const auth = useStore((s) => s.auth);
...
const onSubmit = async (formValues) => {
  if (!auth?.token) {
    toast.error("Your session has expired, please log in again.");
    return;
  }
  ...
};
```

(`RequireAuth` already guards the routes. This covers a token that expires while the form is open, or the form being used inside `DrawnUIModal`.)

### 2.3 Author in the body (only if the backend asks for it)

The preferred contract: **the backend derives the author from the token**, so the client can't fake it, and the body doesn't change.

If the backend instead expects the author in the body, add it to both payloads:

```js
// saveObject
const data = { ...existingFields, author: auth.user._id, parameters: { ...formValues } };

// editObject — usually NOT sent: an edit must not change the original author.
// If "last modified by" is wanted, use a separate field such as `updatedBy`.
```

### 2.4 Handle 401 / 403

The global `axios.interceptors.response` in `src/axios.js` is registered on the **default axios**, not on `instance`. So a 401 from `instance` reaches the `catch` in `saveObject` / `editObject`, which shows `error.message`. Optional improvement: on 401, call `useStore.getState().logout()` and redirect to `/login`.

---

## Backend contract needed (to confirm with the backend team)

| # | Question | Assumed answer |
|---|---|---|
| 1 | Does `POST /interactive-objects` read the Bearer token and save the author? | Yes, stored as `author` (user id) |
| 2 | What does `GET /interactive-objects` return for the author? | `author: { _id, username }` (populated) — the helper handles a string too |
| 3 | Does `PATCH` keep the original author? | Yes. Optionally sets `updatedBy` |
| 4 | Is `?author=` supported as a list filter? | Unknown → decides 1.3 |
| 5 | Old objects with no author? | `author` is missing → table shows `—` |

Note: `objectOwner` (`"me"` etc., set in AddObject/EditQuestion) is a **different** field from the logged-in author and stays unchanged.

---

## Files touched

| File | Change |
|---|---|
| `src/components/Table/Table.jsx` | New `author` column, row mapping, `getAuthorName` helper, `columnNames.author` |
| `src/components/DrawnUI/DrawnUIForm/DrawnUIForm.jsx` | Read `auth` from store, token guard in `onSubmit`, optional `author` in the create body |
| `src/axios.js` | (optional) 401 handling on `instance` / `NewInstance` |

---

## Test checklist

- [ ] Table shows the Author column between Instructional Role and Date Modified.
- [ ] Objects without an author show `—`, and nothing crashes.
- [ ] Filtering by Author either works server-side or is disabled.
- [ ] Create from DrawnUI → request has the `Authorization` header → new row shows the current user as Author.
- [ ] Edit from DrawnUI → request has the `Authorization` header → Author is unchanged.
- [ ] Create/edit from `DrawnUIModal` (Studio "Map to Form") behaves the same.
- [ ] With the token removed from localStorage, Save shows the session-expired toast and sends no request.
