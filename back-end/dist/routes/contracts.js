"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contract_controller_1 = require("../controllers/contract.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = (0, express_1.Router)();
const contractController = new contract_controller_1.ContractController();
router.get("/statistics", auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)("CONTRACT_MANAGEMENT", "canView"), contractController.getStatistics);
router.get("/expiring", auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)("CONTRACT_MANAGEMENT", "canView"), contractController.getExpiringContracts);
router.get("/employee/:employeeId", auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)("CONTRACT_MANAGEMENT", "canView"), contractController.getContractsByEmployeeId);
router.get("/:id", auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)("CONTRACT_MANAGEMENT", "canView"), contractController.getContractById);
router.get("/", auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)("CONTRACT_MANAGEMENT", "canView"), contractController.getContracts);
router.post("/", auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)("CONTRACT_MANAGEMENT", "canCreate"), contractController.createContract);
router.put("/:id", auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)("CONTRACT_MANAGEMENT", "canUpdate"), contractController.updateContract);
router.delete("/:id", auth_middleware_1.authenticateToken, (0, permission_middleware_1.requirePermission)("CONTRACT_MANAGEMENT", "canDelete"), contractController.deleteContract);
exports.default = router;
//# sourceMappingURL=contracts.js.map