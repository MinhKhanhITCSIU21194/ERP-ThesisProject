import "reflect-metadata"; // Required for TypeORM decorators
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initializeDatabase } from "./config/typeorm";
import dotenv from "dotenv";
import router from "./routes";

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || "5000");

// Middleware
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "ERP System API is running",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      auth: "/api/auth",
      employees: "/api/employees",
    },
    docs: "/api/docs",
  });
});

// Routes
app.use("/api", router);
// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize TypeORM database connection
    await initializeDatabase();

    app.listen(PORT, (): void => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🔗 Test the API: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
