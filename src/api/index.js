import axios from "../axios";

export const getBooks = async () => {
  const res = await axios.get("/books");
  return res.data;
};

export const getChapters = async (id) => {
  const res = await axios.get(`/chapters?bookId=${id}`);
  return res.data;
};

export const getPages = async (id) => {
  const res = await axios.get(`/pages?chapterId=${id}`);
  return res.data;
};
