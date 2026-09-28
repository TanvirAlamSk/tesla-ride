import express from "express";
import { getMyPool,updatePoolStatusController } from "./pool.controller.js";
import {
  authenticate,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/my",
  authenticate,
  authorize("DRIVER"),
  asyncHandler(getMyPool)
);

router.patch(
  "/:poolId/status",
  authenticate,
  authorize("DRIVER"),
  asyncHandler(updatePoolStatusController),
);

export default router;