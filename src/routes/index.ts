import express from "express";
import usersRoutes from "./users";
import authRoutes from "./auth";
import employeesRoutes from "./employees";
import departmentsRoutes from "./departments";
import positionsRoutes from "./positions";

const router = express.Router();

// Mount routes
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/employees", employeesRoutes);
router.use("/departments", departmentsRoutes);
router.use("/positions", positionsRoutes);

// Add more routes here as you develop
// router.use('/products', productsRoutes);
// router.use('/orders', ordersRoutes);
// router.use('/inventory', inventoryRoutes);

export default router;
