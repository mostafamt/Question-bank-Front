import { create } from "zustand";

const useStore = create((set) => ({
  data: {
    modal: {
      name: "",
      size: "xl",
      opened: false,
      props: {},
    },
  },
  setFormState: (data) =>
    set((prevState) => ({ data: { ...prevState.data, ...data } })),

  openModal: (name, props = {}) =>
    set((prevState) => ({
      data: {
        ...prevState.data,
        modal: {
          ...prevState.data.modal,
          name: name,
          opened: true,
          props: props,
        },
      },
    })),
  closeModal: () =>
    set((prevState) => ({
      ...prevState.data,
      modal: { ...prevState.data.modal, name: "", opened: false, props: {} },
    })),
}));

export { useStore };
