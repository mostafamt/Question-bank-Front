import axios from "axios";

const BACKEND_URL = "http://localhost:4000/api";

const instance = axios.create({
  baseURL: process.env.REACT_APP_REMOTE_URL || BACKEND_URL,
});

const NewInstance = axios.create({
  baseURL: process.env.REACT_APP_NEW_REMOTE_URL || BACKEND_URL,
});

export { NewInstance };
export default instance;
