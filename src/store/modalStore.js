import { create } from "zustand";

const useModalStore = create((set) => ({
  name: null,
  props: {},
  openModal: (name, props = {}) => set({ name, props }),
  closeModal: () => set({ name: null, props: {} }),
}));

export { useModalStore };
