import { toast } from "react-toastify";
import { NewInstance as axios } from "../axios";
import { default as axios2 } from "../axios";
import { v4 as uuidv4 } from "uuid";

import newTypes from "./NewTypes.json";
import { useStore } from "../store/store";

const wait = (ms) => {
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

export const getAllTypes = async () => {
  try {
    const res = await axios2.get("io-types");
    return res.data;
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

export const getCategories = async () => {
  try {
    const res = await axios2.get("io-types");
    const data = res.data.filter((type) => type.typeCategory === "B");
    return data;
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

export const getTypes = async (category) => {
  try {
    const res = await axios2.get("io-types");
    const data = res.data.filter((type) => type.category === category);
    return data;
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

export const getObject = async (id) => {
  try {
    const res = await axios2.get(`/interactive-objects/${id}`);
    const data = res.data;
    return data;
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

export const fakeSaveObject = async (data) => {
  wait(2000);
  return uuidv4();
};

export const saveObject = async (data) => {
  try {
    const res = await axios.post("/dataset-objects", data);
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

export const saveBlocks = async (blocks) => {
  const res = await axios.post("/save-blocks", {
    blocks,
  });
};

export const getQuestionTypes = async () => {
  await wait(1000);
  return newTypes;
  // const res = await axios.get("interactive-object-types");
  // return res;
};
