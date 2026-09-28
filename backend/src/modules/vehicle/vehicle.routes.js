import express from "express";
import { getMyVehicleController } from "./vehicle.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/my",
  authenticate,
  authorize("DRIVER"),
  asyncHandler(getMyVehicleController)
);

export default router;