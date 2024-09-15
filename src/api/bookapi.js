import axios from "../axios";
import { chapters, pages } from "./test-data";

export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  if (process.env.NODE_ENV === "development") {
    const data = [
      { url: "/assets/Biology for Cambridge Internationa/page-01.png" },
      { url: "/assets/Biology for Cambridge Internationa/page-02.png" },
      { url: "/assets/Biology for Cambridge Internationa/page-03.png" },
      { url: "/assets/Biology for Cambridge Internationa/page-04.png" },
      { url: "/assets/Biology for Cambridge Internationa/page-05.png" },
    ];

    return data;
  }

  return res.data;
};

export const submitBlock = async () => {};

export const getChapterTOC = async () => {};

export const getBlocksByChapter = async () => {};
