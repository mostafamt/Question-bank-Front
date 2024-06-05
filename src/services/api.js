import { types } from "./data";

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getTypes = async () => {
  await wait(1000);
  return types;
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
