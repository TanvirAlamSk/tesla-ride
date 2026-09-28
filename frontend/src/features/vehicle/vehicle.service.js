import { api } from "../../services/api.js";

export const getMyVehicle = async () => {
  return api("/vehicles/my");
};