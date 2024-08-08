import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../interfaces/CustomError";

interface AuthRequest extends Request {
  userId?: string;
}

const isAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error: CustomError = new Error("Not authenticated.");
    error.statusCode = 401;
    next(error);
    return;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken: JwtPayload | string;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (err) {
    const error: CustomError = new Error("Token verification failed.");
    error.statusCode = 500;
    next(error);
    return;
  }
  if (!decodedToken) {
    const error: CustomError = new Error("Not authenticated.");
    error.statusCode = 401;
    next(error);
    return;
  }
  req.userId = decodedToken.userId;
  next();
};

export default isAuth;
