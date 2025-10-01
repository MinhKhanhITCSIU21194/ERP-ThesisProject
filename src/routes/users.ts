import express, { Request, Response } from "express";
const usersRoutes = express.Router();

// GET /api/users
usersRoutes.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Users endpoint",
    users: [],
  });
});

// GET /api/users/:id
usersRoutes.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    message: `User with ID: ${id}`,
    user: null,
  });
});

// POST /api/users
usersRoutes.post("/", (req: Request, res: Response) => {
  const userData = req.body;
  res.status(201).json({
    message: "User created successfully",
    user: userData,
  });
});

export default usersRoutes;
