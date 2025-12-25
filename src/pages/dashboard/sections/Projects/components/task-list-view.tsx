import React, { useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  CardActionArea,
  Stack,
  CircularProgress,
} from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import MovieIcon from "@mui/icons-material/Movie";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectProject } from "../../../../../redux/project/project.slice";
import { getTasksByEmployee } from "../../../../../services/project.service";
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
} from "../../../../../data/project/project";
import AuthContext from "../../../../../context/auth-provider";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import { useRouter } from "../../../../../routes/hooks/useRouter";

interface TaskListViewProps {
  filter: "worked-on" | "assigned" | "bugs";
}

function TaskListView({ filter }: TaskListViewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { myTasks, isLoading, error } = useAppSelector(selectProject);
  const { user } = useAppSelector(selectAuth);

  useEffect(() => {
    if (!user?.employeeId) {
      return;
    }
    // Fetch all employee tasks (we'll filter client-side)
    dispatch(
      getTasksByEmployee({
        employeeId: user.employeeId,
        limit: 50,
      })
    ).then((result) => {
      console.log("getTasksByEmployee result:", result);
    });
  }, [dispatch, user?.employeeId, filter]);

  // Filter tasks based on the current tab
  const getFilteredTasks = (): Task[] => {
    console.log("getFilteredTasks called, myTasks:", myTasks);
    if (!myTasks || myTasks.length === 0) return [];

    switch (filter) {
      case "worked-on":
        // Tasks that are currently in progress or in review
        return myTasks.filter(
          (task: Task) =>
            task.status === TaskStatus.IN_PROGRESS ||
            task.status === TaskStatus.IN_REVIEW
        );
      case "assigned":
        // All assigned tasks (not done or cancelled)
        return myTasks.filter(
          (task: Task) =>
            task.status !== TaskStatus.DONE &&
            task.status !== TaskStatus.BLOCKED
        );
      case "bugs":
        // Only BUG type tasks
        return myTasks.filter((task: Task) => task.taskType === TaskType.BUG);
      default:
        return myTasks;
    }
  };

  // Get status color
  const getStatusColor = (
    status: TaskStatus
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
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

  // Get priority color
  const getPriorityColor = (
    priority: TaskPriority
  ): "default" | "primary" | "secondary" | "error" | "warning" => {
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

  // Get task type icon
  const getTaskTypeIcon = (taskType: TaskType) => {
    switch (taskType) {
      case TaskType.BUG:
        return <BugReportIcon sx={{ fontSize: 18, color: "#d32f2f" }} />;
      case TaskType.STORY:
        return <AutoStoriesIcon sx={{ fontSize: 18, color: "#1976d2" }} />;
      case TaskType.TASK:
        return <TaskAltIcon sx={{ fontSize: 18, color: "#388e3c" }} />;
      case TaskType.EPIC:
        return <MovieIcon sx={{ fontSize: 18, color: "#7b1fa2" }} />;
      default:
        return null;
    }
  };

  const filteredTasks = getFilteredTasks();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.log("Showing error state:", error);
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <Typography variant="body1" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (filteredTasks.length === 0) {
    console.log("Showing empty state");
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 200,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No tasks found for this filter
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          Total tasks available: {myTasks?.length || 0}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap={1}>
        {filteredTasks.map((task) => (
          <Card
            key={task.taskId}
            sx={{
              m: 0,
              "&:hover": {
                boxShadow: 2,
                borderColor: "primary.main",
              },
            }}
          >
            <CardActionArea
              onClick={() => {
                router.push(`/dashboard/projects/tasks/${task.taskId}`);
              }}
            >
              <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 0.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {getTaskTypeIcon(task.taskType)}
                    <Typography
                      variant="body1"
                      component="div"
                      fontWeight={500}
                    >
                      {task.title}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Chip
                      label={task.status.replace("_", " ")}
                      size="small"
                      color={getStatusColor(task.status)}
                    />
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {task.sprint.project && (
                    <Typography variant="caption" color="text.secondary">
                      Proj: {task.sprint.project.name}
                    </Typography>
                  )}{" "}
                  {task.sprint && (
                    <Typography variant="caption" color="text.secondary">
                      {task.sprint.name}
                    </Typography>
                  )}
                  {task.estimatedHours && (
                    <Typography variant="caption" color="text.secondary">
                      Est. Hours: {task.estimatedHours}h
                    </Typography>
                  )}
                  {task.actualHours && (
                    <Typography variant="caption" color="text.secondary">
                      Actual: {task.actualHours}h
                    </Typography>
                  )}
                  {task.assignee && (
                    <Typography variant="caption" color="text.secondary">
                      Assignee: {task.assignee.firstName}{" "}
                      {task.assignee.lastName}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

export default TaskListView;
