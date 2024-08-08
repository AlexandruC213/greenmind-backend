import fs from "fs";
import path from "path";

import { Request, Response, NextFunction } from "express";
import { CustomError } from "../interfaces/CustomError";
import Product from "../models/product";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const itemsPerPage = parseInt(req.query.perPage as string, 10) || 3;

  try {
    const totalItems = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    res.status(200).json({
      products: products,
      hasNextPage: itemsPerPage * page < totalItems,
      hasPrevPage: page > 1,
      totalProducts: totalItems,
    });
  } catch (err) {
    const error: CustomError = new Error("Fetching products failed.");
    error.statusCode = 500;
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      const error: CustomError = new Error("Product not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      product,
    });
  } catch (err) {
    const error: CustomError = new Error("Fetching products failed.");
    error.statusCode = 500;
    next(error);
  }
};

export const postAddProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, price, description, userId } = req.body;
  const image = req.file;

  if (!image) {
    const error: CustomError = new Error("Attached file is not an image");
    error.statusCode = 422;
    error.data = [];
    return next(error);
  }

  const imageUrl = image.path;

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId,
  });

  try {
    await product.save();
    res.status(201).json({ message: "Created Product", product });
  } catch (err) {
    const error: CustomError = new Error("Creating product failed.");
    error.statusCode = 500;
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  const { title, price, description, userId } = req.body;
  const file = req.file;

  try {
    const product = await Product.findById(id);

    if (!product) {
      const error: CustomError = new Error("Product not found");
      error.statusCode = 404;
      return next(error);
    }

    if (product.userId.toString() !== userId) {
      const error: CustomError = new Error("Not authorized");
      error.statusCode = 403;
      throw error;
    }

    product.title = title;
    product.price = price;
    product.description = description;

    if (file) {
      clearImage(product.imageUrl);
      const newImageUrl = `images/${file.filename}`;
      product.imageUrl = newImageUrl;
    }

    const updatedProduct = await product.save();
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    const error: CustomError = new Error("Updating product failed");
    error.statusCode = 500;
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    if (!product) {
      const error: CustomError = new Error("Product not found!");
      error.statusCode = 404;
      return next(error);
    }
    clearImage(product.imageUrl);
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product successfully deleted!" });
  } catch (err) {
    const error: CustomError = new Error("Deleting product failed.");
    error.statusCode = 500;
    next(error);
  }
};

const clearImage = (filePath: string) => {
  const filePathToDelete = path.join(__dirname, "..", filePath);
  fs.unlink(filePathToDelete, (err) => {
    console.log(err);
  });
};
