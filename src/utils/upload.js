import axios from "../axios";
import { NewInstance as axios2 } from "../axios";

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  const res = await axios2.post("/upload", data);
  return res.data;
};

const uploadBase64 = async (base64Data) => {
  const base64Response = await fetch(base64Data);
  const blob = await base64Response.blob();
  const data = new FormData();
  data.append("file", blob);
  const res = await axios.post("/upload", data);
  return res.data;
};

export { upload, uploadBase64 };
