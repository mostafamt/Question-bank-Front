import { toast } from "react-toastify";
import axios from "../axios";

function newAbortSignal(timeoutMs) {
  const abortController = new AbortController();
  setTimeout(() => abortController.abort(), timeoutMs || 0);

  return abortController.signal;
}

function getExtensionFromMimeType(mimeType) {
  const cleanType = mimeType.split(";")[0]; // remove the ";codecs=opus" part

  const mimeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "application/pdf": "pdf",
    "image/gif": "gif",
    "audio/webm": "webm", // 👈 your case
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    // add more if needed
  };

  return mimeMap[cleanType] || "bin"; // fallback
}

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  try {
    const res = await axios.post("/upload", data, {
      timeout: 10000,
      signal: newAbortSignal(10000),
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
  const data = new FormData();
  data.append("file", blob);
  const res = await axios.post("/upload", data);
  return res.data;
};

const baseUploadBase64 = async (base64Data) => {
  const extension = getExtensionFromMimeType(base64Data.type);
  const fileName = `my_uploaded_file.${extension}`;

  const file = new File([base64Data], fileName, { type: base64Data.type });
  const data = new FormData();
  data.append("file", file);
  const res = await axios.post("/upload", data);
  return res.data;
};

const uploadForStudio = async (base64Data) => {
  const base64Response = await fetch(base64Data);
  const blob = await base64Response.blob();
  const url = await baseUploadBase64(blob);
  return url;
};

export { upload, uploadBase64, uploadForStudio };
