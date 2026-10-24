import axios from "axios";
import { toast } from "react-toastify";
import { useStore } from "./store/store";

const BACKEND_URL = "http://localhost:4000/api";

const instance = axios.create({
  baseURL: process.env.REACT_APP_REMOTE_URL || BACKEND_URL,
});

// some comment to trigger build
const NewInstance = axios.create({
  baseURL: process.env.REACT_APP_REMOTE_URL || BACKEND_URL,
});

// Send the logged-in user's token on every API request.
const attachToken = (config) => {
  const token = useStore.getState().auth?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
instance.interceptors.request.use(attachToken);
NewInstance.interceptors.request.use(attachToken);

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    toast.error("Some Error has happend, please try again in another time!!");
  }
);

export { NewInstance };
export default instance;
