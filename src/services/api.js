import { toast } from "react-toastify";
import { NewInstance as axios } from "../axios";
import { default as axios2 } from "../axios";
import { default as plainAxios } from "axios";
import { v4 as uuidv4 } from "uuid";

import newTypes from "./NewTypes.json";
import { useStore } from "../store/store";

// TODO: remove PDF test type once a real pdf type exists in the backend
const PDF_TEST_TYPE = {
  _id: "pdf-test-type",
  typeName: "PdfTest",
  labels: [{ _Title_: "text" }, { "_Document_*": "pdf" }],
  abstractParameter: { _Title_: "text", _Document_: "pdf" },
};

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const fetchObjects = async (page, limit, searchValue, searchColumn, typeCategory) => {
  try {
    let url = searchValue
      ? `/interactive-objects?page=${page}&limit=${limit}&${searchColumn}=${searchValue}`
      : `/interactive-objects?page=${page}&limit=${limit}`;

    if (typeCategory) {
      url += `&questionOrExplanation=${typeCategory}`;
    }

    const res = await axios2.get(url);
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
    return [...res.data, PDF_TEST_TYPE]; // TODO: remove PDF test type
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

export const getCategories = async () => {
  try {
    const res = await axios2.get("io-types");
    const data = res.data
      .filter((type) => type.typeCategory === "B")
      // TODO: remove PDF test type
      .map((type) =>
        type.typeName === "Explanation object"
          ? {
              ...type,
              labels: [
                ...type.labels,
                { [PDF_TEST_TYPE.typeName]: PDF_TEST_TYPE.typeName },
              ],
            }
          : type
      );
    return data;
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

export const getTypes = async (category) => {
  try {
    const res = await axios2.get("io-types");
    const data = res.data.filter((type) => type.category === category);    return data;
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

// Converts a PDF or PowerPoint file to one image per page
export const fileToImages = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await plainAxios.post(
      "https://processing-api.onrender.com/api/to-images",
      formData
    );
    return res?.data?.pages ?? [];
  } catch (error) {
    toast.error("This service isn't available at the moment !");
    return [];
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
    const res = await axios.post("/interactive-objects", data);
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
