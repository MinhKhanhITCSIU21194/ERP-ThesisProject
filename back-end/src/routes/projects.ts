import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// ========== PROJECT ROUTES ==========
router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/employee/:employeeId", projectController.getProjectsByEmployeeId);
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

// ========== SPRINT ROUTES ==========
router.post("/sprints", projectController.createSprint);
router.get("/:projectId/sprints", projectController.getSprintsByProject);
router.get("/sprints/:id", projectController.getSprintById);
router.put("/sprints/:id", projectController.updateSprint);
router.delete("/sprints/:id", projectController.deleteSprint);

// ========== TASK ROUTES ==========
router.post("/tasks", projectController.createTask);
router.get("/sprints/:sprintId/tasks", projectController.getTasksBySprint);
router.get("/tasks/:id", projectController.getTaskById);
router.put("/tasks/:id", projectController.updateTask);
router.delete("/tasks/:id", projectController.deleteTask);
router.get(
  "/employees/:employeeId/tasks",
  projectController.getTasksByEmployee
);

// ========== COMMENT ROUTES ==========
router.post("/tasks/:taskId/comments", projectController.addComment);
router.get("/tasks/:taskId/comments", projectController.getCommentsByTask);
router.put("/comments/:commentId", projectController.updateComment);
router.delete("/comments/:commentId", projectController.deleteComment);

// ========== ATTACHMENT ROUTES ==========
router.post("/tasks/:taskId/attachments", projectController.addAttachment);
router.get(
  "/tasks/:taskId/attachments",
  projectController.getAttachmentsByTask
);
router.delete("/attachments/:attachmentId", projectController.deleteAttachment);

export default router;
