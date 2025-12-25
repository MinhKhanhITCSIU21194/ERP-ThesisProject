import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import DraggableTaskCard from "./DraggAbleTaskCard";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  TextField,
  IconButton,
} from "@mui/material";
import { ArrowBack, Add, Close } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectProject } from "../../../../../redux/project/project.slice";
import {
  getSprintById,
  getTasksBySprint,
  updateTask,
  createTask,
  deleteTask,
} from "../../../../../services/project.service";
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  Sprint,
} from "../../../../../data/project/project";
import { paths } from "../../../../../routes/paths";
export const getPriorityColor = (
  priority: TaskPriority
): "default" | "primary" | "warning" | "error" => {
  switch (priority) {
    case TaskPriority.LOW:
      return "default";
    case TaskPriority.MEDIUM:
      return "primary";
    case TaskPriority.HIGH:
      return "warning";
    case TaskPriority.CRITICAL:
      return "error";
    default:
      return "default";
  }
};

// Droppable Column Component
function DroppableColumn({
  status,
  children,
}: {
  status: TaskStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <Box
      ref={setNodeRef}
      id={`droppable-${status}`}
      data-status={status}
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: isOver ? "grey.200" : "grey.100",
        borderRadius: 1,
        p: 2,
        flex: "1 1 0",
        minWidth: 240,
        maxWidth: 320,
        minHeight: 600,
        transition: "background-color 200ms ease",
      }}
    >
      {children}
    </Box>
  );
}

function SprintBoardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentSprint, tasks, isLoading, error } =
    useAppSelector(selectProject);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Quick task creation state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getSprintById(id));
      dispatch(getTasksBySprint({ sprintId: id, limit: 100 }));
    }
  }, [dispatch, id]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDialog(true);
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!selectedTask) return;

    setUpdatingStatus(true);
    try {
      await dispatch(
        updateTask({
          id: selectedTask.taskId,
          data: { status: newStatus },
        })
      );
      // Update local state
      setSelectedTask({ ...selectedTask, status: newStatus });
      // Refresh tasks
      if (id) {
        dispatch(getTasksBySprint({ sprintId: id, limit: 100 }));
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewTaskDetails = () => {
    if (selectedTask) {
      navigate(paths.project.taskDetail(selectedTask.taskId));
      setShowTaskDialog(false);
    }
  };

  const handleCreateClick = (status: TaskStatus) => {
    setCreateStatus(status);
    setShowCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setNewTaskTitle("");
    setCreateStatus(null);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !createStatus || !id) return;

    setIsCreating(true);
    try {
      await dispatch(
        createTask({
          title: newTaskTitle.trim(),
          sprintId: id,
          status: createStatus,
          taskType: TaskType.TASK,
          priority: TaskPriority.MEDIUM,
        })
      );
      // Refresh tasks after creation
      await dispatch(getTasksBySprint({ sprintId: id, limit: 100 }));
      handleCloseCreateDialog();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setTaskToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete || !id) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteTask(taskToDelete.taskId));
      // Refresh tasks after deletion
      await dispatch(getTasksBySprint({ sprintId: id, limit: 100 }));
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum pixels to move before drag starts
        delay: 50,
      },
    })
  );
  const handleDragEnd = async (event: DragEndEvent) => {
    if (!id) return;
    const { active, over } = event;

    if (!over) return; // Dropped outside

    const taskId = active.id as string;
    const currentTask = tasks.find((t) => t.taskId === taskId);
    if (!currentTask) return;

    let newStatus: TaskStatus | null = null;

    // Strategy 1: over.id is the droppable column status (from useDroppable)
    if (
      over.id &&
      Object.values(TaskStatus).some((status) => status === over.id)
    ) {
      newStatus = over.id as TaskStatus;
      console.log(`Dropped on column: ${newStatus}`);
    }

    // Strategy 2: over.id is another task - get that task's status
    if (!newStatus) {
      const overTask = tasks.find((t) => t.taskId === (over.id as string));
      if (overTask) {
        newStatus = overTask.status;
        console.log(`Dropped on task ${over.id}, status: ${newStatus}`);
      }
    }

    if (!newStatus) {
      console.warn("Could not determine drop target column", over.id);
      return;
    }

    // Don't update if same status
    if (currentTask.status === newStatus) return;

    console.log(`Moving ${taskId} from ${currentTask.status} to ${newStatus}`);

    // Send update to backend
    try {
      await dispatch(updateTask({ id: taskId, data: { status: newStatus } }));
      // Refresh after successful update
      if (id) {
        setTimeout(() => {
          dispatch(getTasksBySprint({ sprintId: id, limit: 100 }));
        }, 300);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      // If error, immediately refresh to revert to correct state
      if (id) {
        dispatch(getTasksBySprint({ sprintId: id, limit: 100 }));
      }
    }
  };
  const getStatusColor = (
    status: TaskStatus
  ): "default" | "primary" | "info" | "success" | "error" => {
    switch (status) {
      case TaskStatus.TODO:
        return "default";
      case TaskStatus.IN_PROGRESS:
        return "primary";
      case TaskStatus.IN_REVIEW:
        return "info";
      case TaskStatus.DONE:
        return "success";
      case TaskStatus.BLOCKED:
        return "error";
      default:
        return "default";
    }
  };

  const getTaskTypeIcon = (taskType: TaskType) => {
    switch (taskType) {
      case TaskType.STORY:
        return "📖";
      case TaskType.BUG:
        return "🐛";
      case TaskType.TASK:
        return "✓";
      case TaskType.EPIC:
        return "🎯";
      default:
        return "•";
    }
  };

  const groupTasksByStatus = (): Record<TaskStatus, Task[]> => {
    const grouped: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
      [TaskStatus.BLOCKED]: [],
    };

    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    return grouped;
  };

  const tasksByStatus = groupTasksByStatus();
  const statusOrder: TaskStatus[] = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
    TaskStatus.BLOCKED,
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentSprint) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Sprint not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Link to={paths.project.detail(currentSprint.projectId)}>
            <Typography variant="h6" color="text.secondary">
              {currentSprint.name} : {currentSprint.goal}
            </Typography>
          </Link>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h6" color="text.secondary">
              {currentSprint.startDate && currentSprint.endDate && (
                <>
                  {new Date(currentSprint.startDate).toLocaleDateString()} -{" "}
                  {new Date(currentSprint.endDate).toLocaleDateString()}
                </>
              )}
            </Typography>
          </Box>
        </Box>
        <DndContext
          onDragEnd={handleDragEnd}
          sensors={sensors}
          collisionDetection={closestCorners}
        >
          {/* Single SortableContext for ALL tasks across ALL columns */}
          <SortableContext
            items={tasks.map((t) => t.taskId)}
            strategy={verticalListSortingStrategy}
          >
            {/* Board Container */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 2,
                minHeight: 600,
              }}
            >
              {statusOrder.map((status) => (
                <DroppableColumn key={`column-${status}`} status={status}>
                  {/* Column Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      pb: 2,
                      borderBottom: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, textTransform: "uppercase" }}
                    >
                      {status.replace(/_/g, " ")}
                    </Typography>
                    <Chip
                      label={tasksByStatus[status].length}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {/* Tasks */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      flex: 1,
                      minHeight: 100,
                    }}
                  >
                    {tasksByStatus[status].length === 0 ? (
                      <Box
                        sx={{
                          p: 2,
                          textAlign: "center",
                          color: "text.secondary",
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="body2">No tasks</Typography>
                      </Box>
                    ) : (
                      tasksByStatus[status].map((task) => (
                        <DraggableTaskCard
                          key={task.taskId}
                          task={task}
                          onTaskClick={handleTaskClick}
                          onDelete={handleDeleteClick}
                          getTaskTypeIcon={getTaskTypeIcon}
                          getPriorityColor={getPriorityColor}
                        />
                      ))
                    )}
                  </Box>

                  {/* Quick Create Button */}
                  <Button
                    startIcon={<Add />}
                    onClick={() => handleCreateClick(status)}
                    sx={{
                      mt: 1,
                      justifyContent: "flex-start",
                      color: "text.secondary",
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                    fullWidth
                  >
                    Create Task
                  </Button>
                </DroppableColumn>
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      </Paper>

      {/* Task Dialog */}
      <Dialog
        open={showTaskDialog}
        onClose={() => setShowTaskDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedTask && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography sx={{ fontSize: "1.5rem" }}>
                  {getTaskTypeIcon(selectedTask.taskType)}
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTask.taskId}
                  </Typography>
                  <Typography variant="h6">{selectedTask.title}</Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2}>
                {/* Status Selection */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Select
                    fullWidth
                    value={selectedTask.status}
                    onChange={(e) =>
                      handleStatusChange(e.target.value as TaskStatus)
                    }
                    disabled={updatingStatus}
                    size="small"
                  >
                    {Object.values(TaskStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                {/* Priority */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Priority:{" "}
                  </Typography>
                  <Chip
                    label={selectedTask.priority}
                    color={getPriorityColor(selectedTask.priority)}
                    size="small"
                  />
                </Box>

                {/* Assignee */}
                {selectedTask.assignee && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Assigned to
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {selectedTask.assignee.firstName[0]}
                        {selectedTask.assignee.lastName[0]}
                      </Avatar>
                      <Typography variant="body2">
                        {selectedTask.assignee.firstName}{" "}
                        {selectedTask.assignee.lastName}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Story Points */}
                {selectedTask.storyPoints && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Story Points
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedTask.storyPoints}
                    </Typography>
                  </Box>
                )}

                {/* Description */}
                {selectedTask.description && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedTask.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowTaskDialog(false)}>Close</Button>
              <Button variant="contained" onClick={handleViewTaskDetails}>
                View Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Quick Create Task Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Quick Create Task</Typography>
            <IconButton onClick={handleCloseCreateDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Status:{" "}
              <Chip
                label={createStatus?.replace(/_/g, " ")}
                size="small"
                color={getStatusColor(createStatus!)}
              />
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Task Title"
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCreateTask();
                }
              }}
              disabled={isCreating}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Press Enter to create or fill in more details later
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTask}
            disabled={!newTaskTitle.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{taskToDelete?.title}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SprintBoardView;
