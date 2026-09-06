import { default as axios } from "../axios";
import { chapters } from "./test-data";
import { toast } from "react-toastify";

export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTypes = async () => {
  const res = await axios.get("/interactive-object-types");
  return res.data;
};

export const getCompositeTypes = async () => {
  const res = await axios.get("/composite-object-types");
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

export const getChapterLanguages = async (chapterId) => {
  const res = await axios.get(`/chapters/${chapterId}/languages`);
  return res.data;
};

export const submitBlock = async () => {};

export const getChapterTOC = async (chapterId) => {
  const url = `/chapters/${chapterId}/toc`;
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    toast.error(error?.message);
    return []; // Return empty array instead of empty string
  }
};

export const getBlocksByChapter = async () => {};

export const importPages = async ({ pageIds, chapterId }) => {
  const res = await axios.post("/pages/import", { pageIds, chapterId });
  return res.data;
};

export const submitPages = async ({ pageIds, chapterId }) => {
  const res = await axios.post("/pages/submit", { pageIds, chapterId });
  return res.data;
};

export const addNewPage = async ({ chapterId }) => {
  const res = await axios.post("/pages/new", { blocks: [], chapterId });
  return res.data;
};

export const addNewPages = async ({ chapterId, pageUrls }) => {
  const res = await axios.post("/pages/new", { chapterId, pageUrls });
  return res.data;
};

export const convertPdfToImages = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axios.post("/pdf/to-images", formData);
  return res.data;
};

export const createChapter = async (payload) => {
  const { file, ...fields } = payload;

  if (!file) {
    const res = await axios.post("/chapters", fields);
    return res.data;
  }

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  formData.append("file", file);

  const res = await axios.post("/chapters", formData);
  return res.data;
};

export const copyChapter = async ({ bookId, chapterId }) => {
  const res = await axios.post("/chapters/copy", { bookId, chapterId });
  return res.data;
};

export const getObject = async (id) => {
  const url = `/interactive-objects/${id}`;
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    toast.error(error?.message);
    return "";
  }
};
