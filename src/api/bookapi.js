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

export const getChapterPages = async (id) => {};

export const getTestChapterPages = async () => {
  await wait(1000);
  console.log("pages here= ", pages);
  return pages;
};

export const submitBlock = async () => {
  const data = {
    blocks: [
      {
        pageId: "66684e63e4163f0056e5fc29",
        coordinates: {
          x: 12.5,
          y: 12.5,
          width: 10,
          height: 20,
        },
        contentType: "Paragraph",
        contentValue:
          "In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before the final copy is available.",
      },
    ],
  };
  const res = await axios.post("/save-blocks", data);
  return res.data;
};

export const getChapterTOC = async () => {};

export const getBlocksByChapter = async () => {};
