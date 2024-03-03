// import axios from "axios";

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const convertPdfToImages = async () => {
  await wait(4000);
  return ["/assets/fill_test.jpeg", "/assets/fill_two.jpeg"];
};

export { convertPdfToImages };
