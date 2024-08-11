import axios from "axios";
import { toast } from "react-toastify";

const BACKEND_URL = "http://localhost:4000/api";

const instance = axios.create({
  baseURL: process.env.REACT_APP_REMOTE_URL || BACKEND_URL,
});

const NewInstance = axios.create({
  baseURL: process.env.REACT_APP_NEW_REMOTE_URL || BACKEND_URL,
});

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
