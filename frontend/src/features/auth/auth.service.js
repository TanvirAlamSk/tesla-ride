import { api } from "../../services/api.js";

export const registerUser = async (userData) => {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (userData) => {
  return api("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};