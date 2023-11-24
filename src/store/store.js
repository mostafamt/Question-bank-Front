import { create } from "zustand";

const useStore = create((set) => ({
  data: {},
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
  setFormState: (data) => set(() => ({ data })),
}));

export { useStore };
