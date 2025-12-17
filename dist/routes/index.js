"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./users"));
const auth_1 = __importDefault(require("./auth"));
const employees_1 = __importDefault(require("./employees"));
const departments_1 = __importDefault(require("./departments"));
const positions_1 = __importDefault(require("./positions"));
const notifications_1 = __importDefault(require("./notifications"));
const roles_1 = __importDefault(require("./roles"));
const contracts_1 = __importDefault(require("./contracts"));
const leave_requests_1 = __importDefault(require("./leave-requests"));
const projects_1 = __importDefault(require("./projects"));
const router = express_1.default.Router();
router.use("/users", users_1.default);
router.use("/auth", auth_1.default);
router.use("/employees", employees_1.default);
router.use("/departments", departments_1.default);
router.use("/positions", positions_1.default);
router.use("/notifications", notifications_1.default);
router.use("/roles", roles_1.default);
router.use("/contracts", contracts_1.default);
router.use("/leave-requests", leave_requests_1.default);
router.use("/projects", projects_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map