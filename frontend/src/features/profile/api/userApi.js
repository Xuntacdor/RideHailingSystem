import axios from "axios";
const API_URL = "http://localhost:8080/api/user";

export const getUserInfo = (id) => axios.get(`${API_URL}/info/${id}`);
export const uploadAvatar = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(`${API_URL}/upload/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};