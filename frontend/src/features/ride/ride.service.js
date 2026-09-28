import { api } from "../../services/api.js";

export const createRideRequest = async (rideData) => {
  return api("/ride-requests", {
    method: "POST",
    body: JSON.stringify(rideData),
  });
};

export const getMyRideRequests = async () => {
  return api("/ride-requests/my");
};

export const cancelRideRequest = async (rideId) => {
  return api(`/ride-requests/${rideId}/cancel`, {
    method: "POST",
  });
};