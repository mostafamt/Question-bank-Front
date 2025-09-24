import { toast } from "react-toastify";
import { NewInstance as axios } from "../axios";
import { default as axios2 } from "../axios";
import { v4 as uuidv4 } from "uuid";

import newTypes from "./NewTypes.json";
import { useStore } from "../store/store";

export const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const fetchObjects = async (page, limit) => {
  try {
    const res = await axios2.get(
      `/interactive-objects?page=${page}&limit=${limit}`
    );
    return res;
  } catch (error) {
    toast.error(error?.message);
    return null;
  }
};

export const getOldTypes = async () => {
  const res = await axios2.get("interactive-object-types");
  return res;
};

export const getTypes = async () => {
  try {
    const res = await axios2.get("interactive-object-types");
    return res.data;
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

export const getFilteredTypes = async () => {
  const res = await axios.get("interactive-object-types");
  return res;
};

export const saveBlocks = async (data) => {
  try {
    const res = await axios2.post("/save-blocks", data);
    return res.data;
  } catch (error) {
    console.log(error);
    toast.error(error?.message);
    return null;
  }
};

export const saveCompositeBlocks = async (data) => {
  try {
    const res = await axios2.post("/composite-objects", data);
    return res.data;
  } catch (error) {
    toast.error(error?.message);
    return null;
  }
};

export const saveObject = async (data) => {
  try {
    const res = await axios2.post("/interactive-objects", data);
    window.open(`/show/${res.data}`, "_blank");
    return res.data;
  } catch (error) {
    toast.error(error?.message);
    toast.error(error?.response?.data?.message);
    return null;
  }
};

export const getImages = async (domain, subDomain) => {
  // await wait(1000);
  // const data = [
  //   {
  //     _id: "666b5a691eadfc00441bcf41",
  //     blocks: [],
  //     url: "https://raw.githubusercontent.com/mostafamt/Wolf-Dashboard/main/public/assets/page_1%20(3)(1).png",
  //   },
  // ];
  // const urls = data?.map((item) => item.url);
  // return urls;
  const res = await axios.get("/upload-chapter", {
    params: {
      bookName: domain,
      chapterName: subDomain,
    },
  });
  const data = res?.data;
  const images = data?.map((item) => ({
    _id: item._id,
    url: item.url,
  }));
  return images;
};

export const getQuestionTypes = async () => {
  await wait(1000);
  return newTypes;
  // const res = await axios.get("interactive-object-types");
  // return res;
};

export const updateTabObjects = async (chapterId, tabName, bodyData) => {
  try {
    const res = await axios2.post(
      `/chapters/${chapterId}/${tabName}`,
      bodyData
    );
    const data = res.data;
    toast.success(data?.message);
    return data;
  } catch (error) {
    toast.error(error?.message);
    toast.error(error?.response?.data?.message);
    return null;
  }
};

export const getTabObjects = async (chapterId, tabName) => {
  try {
    const res = await axios2.get(`/chapters/${chapterId}/${tabName}`);
    const data = res.data;
    return data;
  } catch (error) {
    toast.error(error?.message);
    toast.error(error?.response?.data?.message);
    return null;
  }
};

export const getGlossaryAndKeywords = async () => {
  try {
    const res = await axios2.get("/glossary-and-keywords");
    const data = res.data;
    return data;
  } catch (error) {
    toast.error(error?.message);
    toast.error(error?.response?.data?.message);
    return null;
  }
};