import path from "path";
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer, { FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import { RequestHandler } from "express";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";

import { CustomError } from "./interfaces/CustomError";

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const imageFilter = (
  request: Request,
  file: any,
  callback: FileFilterCallback
): void => {
  const mimeTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (mimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Invalid file format!"));
  }
};

app.use(bodyParser.json() as RequestHandler);
app.use(
  multer({ storage: fileStorage, fileFilter: imageFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", authRoutes);
app.use(productRoutes);

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  }
);

mongoose
  .connect(process.env.MONGODB_URL!)
  .then(() => {
    app.listen(8080, () => {});
  })
  .catch((err) => {
    console.log(err);
  });
