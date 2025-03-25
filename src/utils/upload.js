import { toast } from "react-toastify";
import axios from "../axios";
import { NewInstance as axios2 } from "../axios";

function newAbortSignal(timeoutMs) {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);

  return abortController.signal;
}

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  console.log("file= ", file);
  try {
    const res = await axios.post("/upload", data, {
      timeout: 20000,
      signal: newAbortSignal(20000),
    });
    return res.data;
  } catch (error) {
    console.log("error= ", error);
    toast.error(error?.message);
  }
};

const uploadBase64 = async (base64Data) => {
  const base64Response = await fetch(base64Data);
  const blob = await base64Response.blob();
  const formData = new FormData();
  formData.append("file", new File([blob], "image.jpeg"));
  formData.append("ref", "image.jpeg");
  formData.append("purpose", "image");
  const res = await axios.post("/upload", formData);
  return res.data;
};

export { upload, uploadBase64 };
