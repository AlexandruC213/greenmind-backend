import express from "express";
import { body } from "express-validator";
import * as productController from "../controllers/product";

import isAuth from "../middleware/isAuth";

const router = express.Router();

router.get("/products", isAuth, productController.getProducts);

router.get("/products/:id", isAuth, productController.getProduct);

router.post("/product", isAuth, productController.postAddProduct);

router.put("/product/:id", isAuth, productController.updateProduct);

router.delete("/product/:id", isAuth, productController.deleteProduct);

export default router;
