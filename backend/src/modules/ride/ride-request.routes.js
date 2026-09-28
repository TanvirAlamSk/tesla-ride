import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { cancelRideRequestController, createRideRequestController,getMyRideRequestsController,getRideRequestByIdController } from "./ride-request.controller.js";
import { createRideRequestSchema } from "./ride-request.validation.js";
import { matchExistingRideRequest } from "../pool/pool.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.get(
  "/my",
  authenticate,
  authorize("PASSENGER"),
  asyncHandler(getMyRideRequestsController)
);

router.post(
  "/",
  authenticate,
  authorize("PASSENGER"),
  validate(createRideRequestSchema),
  asyncHandler(createRideRequestController)
);

router.get(
  "/:id",
  authenticate,
  authorize("PASSENGER"),
  asyncHandler(getRideRequestByIdController)
);

router.post(
  "/:id/match",
  authenticate,
  authorize("PASSENGER"),
  async (req, res) => {
    try {
      const result = await matchExistingRideRequest(req.params.id);

      res.status(200).json({
        success: true,
        message: "Ride matched successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  "/:id/cancel",
  authenticate,
  authorize("PASSENGER"),
  asyncHandler(cancelRideRequestController),
);

export default router;