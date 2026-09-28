import { api } from "../../services/api.js";

export const getMyPool = async () => {
  return api("/pools/my");
};

export const updatePoolStatus = async (poolId, status) => {
  return api(`/pools/${poolId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};