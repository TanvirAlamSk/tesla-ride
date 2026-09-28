import { RideRequest } from "./ride-request.model.js";
import { matchRideRequest } from "../pool/pool.service.js";
import { AppError } from "../../utils/AppError.js";
import { Pool } from "../pool/pool.model.js";
import { PoolMember } from "../pool/pool-member.model.js";
import { RideStatusHistory } from "./ride-status-history.model.js";

export const createRideRequest = async ({
  passengerId,
  pickupArea,
  destinationArea,
  requestedSeats,
}) => {
  const existingRide = await RideRequest.findOne({
    passengerId,
    status: {
      $in: ["WAITING", "MATCHED", "IN_PROGRESS"],
    },
  });

  if (existingRide) {
    throw new Error("You already have an active ride request");
  }

  const rideRequest = await RideRequest.create({
    passengerId,
    pickupArea,
    destinationArea,
    requestedSeats,
    status: "WAITING",
  });

  try {
    await matchRideRequest(rideRequest);
  } catch (error) {
    if (
      error.message !== "Not enough seats available" &&
      error.message !== "No available vehicle found"
    ) {
      throw error;
    }
  }

  return rideRequest;
};

export const getMyRideRequests = async (passengerId) => {
  return RideRequest.find({
    passengerId,
  }).sort({ createdAt: -1 });
};

export const getRideRequestById = async ({ rideId, passengerId }) => {
  const ride = await RideRequest.findOne({
    _id: rideId,
    passengerId,
  });

  if (!ride) {
    throw new Error("Ride request not found");
  }

  return ride;
};

export const cancelRideRequest = async ({ rideId, passengerId }) => {
  const ride = await RideRequest.findOne({
    _id: rideId,
    passengerId,
  });

  if (!ride) {
    throw new AppError("Ride request not found", 404);
  }

  if (ride.status !== "WAITING" && ride.status !== "MATCHED") {
    throw new AppError("Ride cannot be cancelled at this stage", 400);
  }

  if (ride.status === "MATCHED") {
    const poolMember = await PoolMember.findOne({
      rideRequestId: ride._id,
    });

    if (poolMember) {
      await Pool.findByIdAndUpdate(ride.poolId, {
        $inc: {
          occupiedSeats: -ride.requestedSeats,
        },
      });

      await PoolMember.deleteOne({
        _id: poolMember._id,
      });
    }
  }

  ride.status = "CANCELLED";

  await ride.save();

  if (ride.poolId) {
    await RideStatusHistory.create({
      poolId: ride.poolId,
      rideRequestId: ride._id,
      status: "CANCELLED",
      changedBy: passengerId,
    });
  }

  return ride;
};
