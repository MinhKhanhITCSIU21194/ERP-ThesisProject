import "reflect-metadata"; // Required for TypeORM decorators
import express, { Request, Response } from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initializeDatabase } from "./config/typeorm";
import { sessionCleanupService } from "./services/session-cleanup.service";
import { initializeSocketService } from "./config/socket";
import dotenv from "dotenv";
import router from "./routes";
const allowedOrigins = require("./config/allowedOrigin");

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT: number = parseInt(process.env.PORT || "5000");

// Middleware
app.use(cookieParser());

// CORS configuration for authentication with cookies
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

    // Initialize Socket.IO service
    initializeSocketService(httpServer);

    // Start session cleanup service
    sessionCleanupService.start();

    httpServer.listen(PORT, (): void => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🔗 Test the API: http://localhost:${PORT}`);
      console.log(`🍪 Cookie-based authentication enabled`);
      console.log(`🔄 Session cleanup service started`);
      console.log(`🔌 Socket.IO real-time notifications enabled`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      sessionCleanupService.stop();
      process.exit(0);
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      sessionCleanupService.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
