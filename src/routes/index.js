const express = require("express");
const router = express.Router();

// Import route modules
const usersRoutes = require("./users");

// Mount routes
router.use("/users", usersRoutes);

// Add more routes here as you develop
// router.use('/products', productsRoutes);
// router.use('/orders', ordersRoutes);
// router.use('/inventory', inventoryRoutes);

module.exports = router;
