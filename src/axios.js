import axios from "axios";

const BACKEND_URL = "http://localhost:5000";

const instance = axios.create({
  baseURL: process.env.REACT_APP_REMOTE_URL || BACKEND_URL,
});
export default instance;
