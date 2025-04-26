import { toast } from "react-toastify";
import axios from "../axios";
import { NewInstance as axios2 } from "../axios";

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
  const extension = getExtensionFromMimeType(base64Data.type);
  const fileName = `my_uploaded_file.${extension}`;

  const file = new File([base64Data], fileName, { type: base64Data.type });
  const data = new FormData();
  data.append("file", file);
  const res = await axios.post("/upload", data);
  return res.data;
};

export { upload, uploadBase64 };
