import express from "express";
import usersRoutes from "./users";
import authRoutes from "./auth";
import employeesRoutes from "./employees";
import employeeSetupRoutes from "./employee-setup";
import departmentsRoutes from "./departments";
import positionsRoutes from "./positions";
import notificationsRoutes from "./notifications";
import rolesRoutes from "./roles";
import contractsRoutes from "./contracts";
import leaveRequestsRoutes from "./leave-requests";
import projectsRoutes from "./projects";

const router = express.Router();

// Mount routes
router.use("/users", usersRoutes);
router.use("/auth", authRoutes);
router.use("/employees", employeesRoutes);
router.use("/employee-setup", employeeSetupRoutes);
router.use("/departments", departmentsRoutes);
router.use("/positions", positionsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/roles", rolesRoutes);
router.use("/contracts", contractsRoutes);
router.use("/leave-requests", leaveRequestsRoutes);
router.use("/projects", projectsRoutes);

// Add more routes here as you develop
// router.use('/products', productsRoutes);
// router.use('/orders', ordersRoutes);
// router.use('/inventory', inventoryRoutes);

export default router;
