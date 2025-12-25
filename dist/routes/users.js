"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const usersRoutes = (0, express_1.Router)();
usersRoutes.use(auth_middleware_1.authenticateToken);
usersRoutes.get("/stats", user_controller_1.userController.getUserStats.bind(user_controller_1.userController));
usersRoutes.get("/role/:roleId", user_controller_1.userController.getUsersByRole.bind(user_controller_1.userController));
usersRoutes.get("/", user_controller_1.userController.getAllUsers.bind(user_controller_1.userController));
usersRoutes.get("/:id", user_controller_1.userController.getUserById.bind(user_controller_1.userController));
usersRoutes.patch("/:id/status", user_controller_1.userController.updateUserStatus.bind(user_controller_1.userController));
usersRoutes.patch("/:id/role", user_controller_1.userController.updateUserRole.bind(user_controller_1.userController));
exports.default = usersRoutes;
//# sourceMappingURL=users.js.map