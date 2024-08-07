import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user";

import { CustomError } from "../interfaces/CustomError";
import {
  sendPasswordResetEmail,
  generateResetToken,
} from "../services/emailService";
import { handleValidationErrors } from "../utils/handleValidationErrors";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!handleValidationErrors(req, res, next)) return;

  const { email, name, password } = req.body;

  try {
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      name: name,
    });
    const result = await user.save();
    res.status(201).json({ message: "User created!", userId: result._id });
  } catch (err) {
    const error: CustomError = new Error("Something failed!");
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!handleValidationErrors(req, res, next)) return;

  const { email, password, rememberFor30Days } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error: CustomError = new Error(
        "A user with this email could not be find."
      );
      error.statusCode = 401;
      next(error);
      return;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error: CustomError = new Error("Wrong passowrd!");
      error.statusCode = 401;
      next(error);
      return;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET!,
      { expiresIn: rememberFor30Days ? "30 days" : "1h" }
    );
    res.status(200).json({ token: token, userId: user._id.toString() });
  } catch (err) {
    const error: CustomError = new Error("Something failed!");
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!handleValidationErrors(req, res, next)) return;

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error: CustomError = new Error("User not found!");
      if (!error.statusCode) {
        error.statusCode = 404;
      }
      next(error);
      return;
    }

    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    const error: CustomError = new Error("Something failed!");
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!handleValidationErrors(req, res, next)) return;

  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      const error: CustomError = new Error("Token is invalid or has expired.");
      error.statusCode = 400;
      next(error);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    const error: CustomError = new Error("Something went wrong.");
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
