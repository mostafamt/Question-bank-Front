import { NewInstance as axios } from "../axios";
import { default as axios2 } from "../axios";

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getOldTypes = async () => {
  const res = await axios2.get("interactive-object-types");
  return res;
};

export const getTypes = async () => {
  const res = await axios.get("interactive-object-types");
  return res;
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

// export const getInitialProduct = async () => {
//   await wait(1000);
//   return products.find((product) => product.id === INITIAL_PRODUCT);
// };

// export const getInitialProducts = async () => {
//   await wait(1000);
//   const result = [];
//   while (result.length < 6) {
//     const randomIndex = Math.floor(Math.random(0, 1) * products.length);
//     const found =
//       result.some((product) => product.id === randomIndex) ||
//       randomIndex === INITIAL_PRODUCT;
//     if (!found) {
//       result.push(products[randomIndex]);
//     }
//   }
//   return result;
// };
