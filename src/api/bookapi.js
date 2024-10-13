import { default as axios } from "../axios";
import { chapters, pages } from "./test-data";

export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTypes = async () => {
  const res = await axios.get("/interactive-object-types");
  return res.data;
};

export const getBooks = async () => {
  const res = await axios.get("/books");
  return res.data;
};

export const getChapters = async (id) => {
  const res = await axios.get(`/chapters?bookId=${id}`);
  return res.data;
};

export const getTestChapters = async (id) => {
  await wait(1000);
  return chapters;
};

export const getChapterPages = async (id) => {
  const res = await axios.get(`/pages?chapterId=${id}`);
  return res.data;
};

export const submitBlock = async () => {};

export const getChapterTOC = async () => {};

export const getBlocksByChapter = async () => {};

export const getObject = async (id) => {
  const url = `/interactive-objects/${id}`;
  const res = await axios.get(url);
  return res.data;
};
