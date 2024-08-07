import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { CustomError } from "../interfaces/CustomError";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: CustomError = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
    return false; // Indicate that validation failed
  }
  return true; // Indicate that validation passed
};
