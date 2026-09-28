import { Router } from "express";
import { registerController,loginController,getMeController } from "./auth.controller.js";
import { registerSchema,loginSchema } from "./auth.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();

router.get(
  "/me",
  authenticate,
  asyncHandler(getMeController)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(loginController)
);

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(registerController)
);



export default router;