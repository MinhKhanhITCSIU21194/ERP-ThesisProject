import "reflect-metadata"; // Required for TypeORM decorators
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initializeDatabase } from "./config/typeorm";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || "5000");

// Middleware
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Routes
app.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      message: "Hello, World! ERP Backend is running with TypeORM + UUIDs",
      timestamp: new Date().toISOString(),
      status: "Database connected successfully with TypeORM",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize TypeORM database connection
    await initializeDatabase();

    app.listen(PORT, (): void => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✅ TypeORM initialized with UUID support`);
      console.log(`🔗 Test the API: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
