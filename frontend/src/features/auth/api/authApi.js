import axios from "../../../libs/axios"; // hoặc đúng đường dẫn tới axiosClient

export const login = (data) => axios.post("/auth/login", data);
export const register = (data) => axios.post("/auth/register", data);
