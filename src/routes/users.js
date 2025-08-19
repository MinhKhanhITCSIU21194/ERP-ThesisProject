const express = require("express");
const router = express.Router();

// GET /api/users
router.get("/", (req, res) => {
  res.json({
    message: "Users endpoint",
    users: [],
  });
});

// GET /api/users/:id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    message: `User with ID: ${id}`,
    user: null,
  });
});

// POST /api/users
router.post("/", (req, res) => {
  const userData = req.body;
  res.status(201).json({
    message: "User created successfully",
    user: userData,
  });
});

module.exports = router;
