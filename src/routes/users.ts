import express, { Request, Response } from "express";
const router = express.Router();

// GET /api/users
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Users endpoint",
    users: [],
  });
});

// GET /api/users/:id
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    message: `User with ID: ${id}`,
    user: null,
  });
});

// POST /api/users
router.post("/", (req: Request, res: Response) => {
  const userData = req.body;
  res.status(201).json({
    message: "User created successfully",
    user: userData,
  });
});

export default router;
