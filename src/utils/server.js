// import axios from "axios";

const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const convertPdfToImages = async () => {
  await wait(4000);
  return ["/assets/fill.jpg", "/assets/page2.jpg"];
};

export { convertPdfToImages };
