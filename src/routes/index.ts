import express from "express";
import usersRoutes from "./users";

const router = express.Router();

// Mount routes
router.use("/users", usersRoutes);

// Add more routes here as you develop
// router.use('/products', productsRoutes);
// router.use('/orders', ordersRoutes);
// router.use('/inventory', inventoryRoutes);

export default router;
