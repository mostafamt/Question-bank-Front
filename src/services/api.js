import axios from "../axios";
import { types } from "./data";

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTypes = async () => {
  await wait(1000);
  return types;
};

export const getQuestionTypes = async () => {
  await wait(1000);
  return types;
  // const res = await axios.get("interactive-object-types");
  // return res;
};
