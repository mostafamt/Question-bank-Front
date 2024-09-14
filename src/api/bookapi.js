import axios from "../axios";
import { chapters } from "./test-data";

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
  const res = await fetch("http://localhost:8000/chapters");
  const data = await res.json();
  return data;
  console.log("data= ", data);
  return res.json();
};

export const getChapterPages = async (id) => {
  const res = await axios.get(`/pages?chapterId=${id}`);
  return res.data;
};

export const submitBlock = async () => {};

export const getChapterTOC = async () => {};

export const getBlocksByChapter = async () => {};
