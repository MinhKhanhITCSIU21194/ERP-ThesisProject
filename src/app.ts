import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pool from "./config/database";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || "5000");

console.log("Environment loaded:", {
  pool,
});

// Middleware
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Hello, World! ERP Backend is running",
      database_time: result.rows[0].now,
      status: "Database connected successfully",
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(PORT, (): void => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Test the API: http://localhost:${PORT}/api/health`);
});
