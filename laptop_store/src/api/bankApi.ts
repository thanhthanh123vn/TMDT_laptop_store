import axiosClient from "./axiosClient";

export const bankApi = {
  getBanks: () => axiosClient.get("/banks"),
};
