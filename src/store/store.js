import { create } from "zustand";

const AUTH_STORAGE_KEY = "auth";

// localStorage can throw (blocked site data) or hold malformed JSON — treat
// either case as logged out.
const readAuth = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    return parsed && typeof parsed.token === "string" ? parsed : null;
  } catch {
    return null;
  }
};

const useStore = create((set) => ({
  // Logged-in session { token, user } from POST /login, or null when logged out.
  auth: readAuth(),
  setAuth: (auth) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {}
    set({ auth });
  },
  logout: () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    set({ auth: null });
  },
  data: {},
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
  setFormState: (data) => set(() => ({ data })),
}));

export { useStore };
