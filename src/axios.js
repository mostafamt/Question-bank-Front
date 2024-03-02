import axios from "axios";

const BACKEND_URL = "https://questions-api-osxg.onrender.com/api";

const instance = axios.create({
  baseURL: process.env.REACT_APP_REMOTE_URL || BACKEND_URL,
});
export default instance;
