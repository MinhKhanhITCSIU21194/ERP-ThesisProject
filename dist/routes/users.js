"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.json({
        message: "Users endpoint",
        users: [],
    });
});
router.get("/:id", (req, res) => {
    const { id } = req.params;
    res.json({
        message: `User with ID: ${id}`,
        user: null,
    });
});
router.post("/", (req, res) => {
    const userData = req.body;
    res.status(201).json({
        message: "User created successfully",
        user: userData,
    });
});
exports.default = router;
//# sourceMappingURL=users.js.map