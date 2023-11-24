import { v4 as uuidv4 } from "uuid";

export const generateOption = () => {
  return { id: uuidv4(), title: "", correct: false };
};
