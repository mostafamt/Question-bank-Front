import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const useStore = create((set) => ({
  data: {
    questionName: `question - ${uuidv4().slice(0, 4)}`,
    category: "Question",
    higherType: "Text MCQ",
    type: "Text MCQ",
  },
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
  setFormState: (data) => set(() => ({ data })),
}));

export { useStore };
