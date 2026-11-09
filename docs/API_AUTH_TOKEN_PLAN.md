# Plan: Attach the Auth Token to Every API Request

## Goal

Every request the frontend sends to **our** backends must carry the logged-in user's token
(`Authorization: Bearer <token>`), so the backends can reject anonymous calls. When the token
is missing, expired or rejected, the user must be sent back to `/login` cleanly. The token must
**never** be sent to third-party services.

> The frontend can only *send* the token. The APIs are secured only when the backends
> **verify** it and return `401` without it. See [Backend dependencies](#backend-dependencies).

---

## Current state (what already exists)

| Piece | Where | Status |
|---|---|---|
| Login call `POST /login` → `{ token, user }` | `src/api/authapi.js`, `src/pages/Login/Login.jsx` | Done |
| Session stored in Zustand + localStorage (`STORAGE_KEYS.AUTH`) | `src/store/store.js` (`auth`, `setAuth`, `logout`) | Done |
| Request interceptor adds `Authorization: Bearer` | `src/axios.js` (`attachToken` on `instance` and `NewInstance`) | Done |
| Route guard + JWT `exp` check | `src/components/RequireAuth/RequireAuth.jsx`, `src/App.js` | Done |
| Logout clears React Query cache | `src/components/Navbar/Navbar.jsx` | Done |
| PDF-to-images uses plain axios, so no token is sent | `src/api/bookapi.js` (`convertPdfToImages`) | Done |

## Gaps to close

1. **No `401` handling on our instances.** The response interceptor in `src/axios.js` is
   registered on the *global* `axios`, not on `instance`/`NewInstance`. A token that expires
   mid-session (or is revoked) produces failed requests but no logout or redirect.
   `RequireAuth` only checks `exp` when a route renders.
2. **The global interceptor swallows errors.** It shows a toast and returns `undefined`, so
   callers using plain `axios` (Cloudinary, PDF-to-images) get `undefined` instead of a
   rejected promise.
3. **The token could leak to other hosts.** `attachToken` adds the header to any URL, even an
   absolute URL to another origin passed to `instance`, for example
   `src/components/FillBlank/QuestionForm/QuestionForm.jsx:87` (hard-coded
   `http://localhost:4000/api/...`).
4. **Calls that bypass the instances:**
   - `src/components/TrueFalse/TrueFalse.jsx:167` uses `fetch("http://localhost:5000/true-false")`
     and sends no token.
   - Commented-out `fetch` calls in `src/components/MultipleChoice/MultipleChoice.jsx` should
     be removed or moved to the instance.
5. **Iframes cannot send headers.** Interactive objects are shown in `<iframe>`s (`Show.jsx`,
   `PlayObjectModal*`, `IframeDisplayModal`, `IframeContentDisplay`, `ExercisePlayerModal`,
   `SnapLearningPlayer`). If their `src` points at a protected backend route, it will fail once
   the backend enforces auth.
6. **Stale token after `401`.** The React Query cache and any open modal keep data from the
   rejected session.

---

## Implementation steps

### Phase 1: Harden `src/axios.js` (core)

1. **Attach the token only to our own APIs.** Resolve the request URL against its `baseURL` and
   add the header only when the origin equals the instance's `baseURL` origin:

   ```js
   const isOwnApi = (config) => {
     const base = new URL(config.baseURL, window.location.origin);
     const target = new URL(config.url, base);
     return target.origin === base.origin;
   };

   const attachToken = (config) => {
     const token = useStore.getState().auth?.token;
     if (token && isOwnApi(config)) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   };
   ```

2. **Add a `401` response interceptor to both instances:**

   ```js
   const handleAuthError = (error) => {
     if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
       useStore.getState().logout();
       onUnauthorized?.(); // set from App: clear the query cache and go to /login
     }
     return Promise.reject(error);
   };
   instance.interceptors.response.use((r) => r, handleAuthError);
   NewInstance.interceptors.response.use((r) => r, handleAuthError);
   ```

   - `POST /login` passes `skipAuthRedirect: true`, so wrong credentials show the login error
     instead of looping.
   - Guard against several parallel `401`s: toast and redirect **once**, using a module-level
     flag that is reset after a successful login.
   - Treat `403` as "not allowed", not "logged out". Show a toast and do not log out.

3. **Fix the global interceptor** so it re-throws (`return Promise.reject(error)`) after the
   toast, and decide whether it should exist at all (it currently only affects plain-axios
   callers).

4. **Redirect without a hook.** `src/axios.js` is not a component, so register a callback from
   `App.js`:

   ```js
   // App.js
   setUnauthorizedHandler(() => {
     queryClient.clear();
     useStore.getState().closeModal();
     navigate("/login", { replace: true, state: { from: location } });
   });
   ```

   Alternatively, since `logout()` sets `auth` to `null`, `RequireAuth` already redirects on the
   next render. The callback is still needed to clear the cache and close modals.

### Phase 2: Route every backend call through the instances

| File | Change |
|---|---|
| `src/components/FillBlank/QuestionForm/QuestionForm.jsx:87` | Use a relative path (`/createObject/...`) on `instance` |
| `src/components/TrueFalse/TrueFalse.jsx:167` | Replace `fetch` with `instance.post(...)`, or remove it if the endpoint is dead |
| `src/components/MultipleChoice/MultipleChoice.jsx:130,149` | Delete the commented-out `fetch` code |
| `src/utils/server.js` | Delete the commented-out axios import if unused |

Add an ESLint rule so new code can't bypass the instances:

```json
"no-restricted-imports": ["error", { "paths": [{
  "name": "axios",
  "message": "Import the configured instance from src/axios.js. Use plain axios only for third-party hosts."
}]}]
```

Allow it with an `eslint-disable-next-line` comment and a reason only in `src/axios.js`,
`src/api/bookapi.js` (PDF service) and `src/services/cloudinary.js`.

**Allowed plain-axios / no-token callers (third-party):**
- Cloudinary uploads: `src/services/cloudinary.js`
- PDF-to-images service: `src/api/bookapi.js` (`PDF_TO_IMAGES_URL`)
- Firebase template downloads: `ExcelFile.jsx`, `Bulk.jsx` (plain links)

### Phase 3: Iframes and media

Decide with the backend team, for each iframe `src` and media URL that points at our API:

- **Option A (recommended):** keep "render/play" endpoints public, and protect only data and
  mutation endpoints.
- **Option B:** the backend issues a short-lived signed URL (`?token=` or `?sig=`) for the iframe
  `src`. Never put the main JWT in a URL, because URLs are logged and kept in history.

List every iframe `src` origin and mark each one A or B before the backend enables enforcement.

### Phase 4: Session UX polish

- Make the login page redirect back to `location.state.from` after login (check that
  `Login.jsx` already does this).
- Optional: run the JWT `exp` check on a timer (or on `visibilitychange`) and log out
  proactively shortly before expiry, with a toast like "Your session expired, please log in
  again."
- Optional (needs backend): use a refresh token, retry the request once after refreshing, and
  queue concurrent requests while the refresh runs.

### Phase 5: Tests

Add `src/axios.test.js` (Jest + `axios-mock-adapter`, or a stubbed adapter):

- [ ] Sends `Authorization` when logged in, on both `instance` and `NewInstance`
- [ ] Sends no header when logged out
- [ ] Sends no header for an absolute URL to another origin
- [ ] `401` calls `logout()` and the unauthorized handler exactly once for parallel requests
- [ ] `401` on `/login` (`skipAuthRedirect`) does **not** log out
- [ ] `403` does not log out
- [ ] Errors are re-thrown to the caller (not swallowed)

Manual QA:

- [ ] Log in, then check in DevTools → Network that every request to both API hosts has the header
- [ ] Cloudinary / PDF-to-images requests have **no** `Authorization` header
- [ ] Edit the stored token to garbage and trigger a request: you land on `/login`, the cache is cleared, and after logging in you return to the original page
- [ ] Iframes and object players still load

---

## Backend dependencies

Coordinate these with the backend team before the rollout:

1. Both APIs (`REACT_APP_REMOTE_URL` and `REACT_APP_NEW_REMOTE_URL`) verify the **same** JWT
   (shared secret or public key), or the new API gets its own login. **Open question.**
2. Return `401` for a missing, invalid or expired token, and `403` for a valid token without
   permission.
3. CORS allows the `Authorization` header (`Access-Control-Allow-Headers: Authorization, Content-Type`).
4. The list of public endpoints: `/login`, plus any iframe/player endpoints chosen in Phase 3.
5. Token lifetime (`exp`) and whether a refresh endpoint will exist.

## Rollout

1. Ship Phases 1–2 to the frontend first. Sending the header is harmless while the backend
   still ignores it.
2. The backend enables verification in **log-only** mode and reports any unauthenticated calls
   that still arrive.
3. Fix the stragglers found in step 2, then complete Phase 3.
4. The backend switches to **enforce** mode.

## Security notes

- The token is in `localStorage`, so any XSS can read it. Keep `dangerouslySetInnerHTML` and
  Quill HTML sanitized. Long term, consider an `httpOnly` cookie session; this needs backend
  changes and CSRF protection.
- Never log the token, never put it in URLs, and never send it to third-party hosts (enforced
  by `isOwnApi`).

## Files touched (summary)

- `src/axios.js`: origin check, `401` interceptor, error re-throw, unauthorized handler
- `src/App.js`: register the unauthorized handler
- `src/api/authapi.js`: add `skipAuthRedirect` to the login call
- `src/components/FillBlank/QuestionForm/QuestionForm.jsx`, `src/components/TrueFalse/TrueFalse.jsx`, `src/components/MultipleChoice/MultipleChoice.jsx`: route calls through the instances
- `.eslintrc` / `package.json` `eslintConfig`: `no-restricted-imports` rule
- `src/axios.test.js`: new tests
