import axiosClient from "../../../libs/axios";

export const getUserInfo = (id) => {
  return axiosClient.get(`/user/info/${id}`);
};

export const uploadAvatar = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post(`/user/upload/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
