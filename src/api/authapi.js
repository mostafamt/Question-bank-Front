import { default as axios } from "../axios";

/**
 * @returns {Promise<{ token: string, user: { _id: string, username: string, type: string, isActive: boolean } }>}
 */
export const login = async ({ username, password }) => {
  const res = await axios.post("/login", { username, password });
  return res.data;
};
