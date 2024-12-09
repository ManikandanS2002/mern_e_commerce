import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { createProduct, deleteProduct, getAllProducts, getFeauteredProducts, getProductsByCategory, getRecommendedProducts, toggleFeaturedProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/",protectRoute, adminRoute, getAllProducts)
router.get("/featured", getFeauteredProducts)
router.get("/category/:category", getProductsByCategory)
router.get("/recommended", getRecommendedProducts)
router.post("/",protectRoute,adminRoute, createProduct)
router.patch("/:id",protectRoute,adminRoute, toggleFeaturedProduct);
router.delete("/:id",protectRoute,adminRoute, deleteProduct)

export default router;

