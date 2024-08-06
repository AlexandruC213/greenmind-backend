import express, { Request, Response, NextFunction } from "express";
import { body } from "express-validator";

import * as authController from "../controllers/auth";
import User from "../models/user";

const router = express.Router();

router.put(
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
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.register
);

export default router;
