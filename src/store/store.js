import { create } from "zustand";

const useStore = create((set) => ({
  language: localStorage.getItem("language") || "en",
  setLanguage: (lang) => {
    localStorage.setItem("language", lang);
    set({ language: lang });
  },
  data: {},
  modal: {
    name: "",
    size: "xl",
    opened: false,
    props: {},
  },
  setFormState: (data) =>
    set((prevState) => ({ data: { ...prevState.data, ...data } })),

  openModal: (name, props = {}) =>
    set((prev) => ({
      modal: {
        ...prev.modal,
        name,
        opened: true,
        props,
      },
    })),

  closeModal: () =>
    set((prev) => ({
      modal: {
        ...prev.modal,
        name: "",
        opened: false,
        props: {},
      },
    })),
}));

export { useStore };
