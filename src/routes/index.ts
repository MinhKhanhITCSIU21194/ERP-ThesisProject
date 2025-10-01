import express from "express";
import usersRoutes from "./users";
import authRoutes from "./auth";

const router = express.Router();

// Mount routes
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);

// Add more routes here as you develop
// router.use('/products', productsRoutes);
// router.use('/orders', ordersRoutes);
// router.use('/inventory', inventoryRoutes);

export default router;
