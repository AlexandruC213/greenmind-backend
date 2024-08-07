import express from "express";
import { body } from "express-validator";

import * as authController from "../controllers/auth";
import User from "../models/user";

const router = express.Router();

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("E-Mail address already exists!");
        }
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long."),
    body("name")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Name must not be an empty string."),
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long."),
  ],
  authController.login
);

router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
  ],
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required."),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long."),
  ],
  authController.resetPassword
);

export default router;
