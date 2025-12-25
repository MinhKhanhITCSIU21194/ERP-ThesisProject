import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import React from "react";
import { TaskPriority } from "../../../../../../data/project/project";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type DraggableTaskCardProps = {
  key: string;
  task: any;
  onTaskClick: (task: any) => void;
  onDelete: (task: any) => void;
  getTaskTypeIcon: (type: any) => React.ReactNode;
  getPriorityColor: (
    priority: TaskPriority
  ) =>
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";
};

function DraggableTaskCard({
  key,
  task,
  onTaskClick,
  onDelete,
  getTaskTypeIcon,
  getPriorityColor,
}: DraggableTaskCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task);
  };
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: task.taskId });

  // Trello-like smooth transform: only apply during drag, smooth transitions after release
  const style = {
    transform: CSS.Transform.toString(transform),
    // Remove transition during drag for immediate responsiveness (GPU acceleration)
    // Smooth ease-out after drop for natural animation
    transition: isDragging
      ? "none"
      : "transform 250ms cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    zIndex: isDragging ? 1000 : "auto", // Float above other cards while dragging
    // Use will-change for better GPU optimization
    willChange: isDragging ? "transform" : "auto",
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on the drag handle or delete button
    const target = e.target as HTMLElement;
    if (target.closest("[data-drag-handle]") || target.closest("button")) {
      return;
    }
    onTaskClick(task);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-test-id={task.taskId}
      onClick={handleCardClick}
      sx={{
        cursor: "pointer",
        // Subtle opacity change (Trello uses ~0.7, not 0.5)
        opacity: isDragging ? 0.75 : 1,
        // Enhanced shadow: more elevation during drag
        boxShadow: isDragging
          ? "0 20px 40px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.1)"
          : "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
        // Smooth transition for shadow + opacity (not transform)
        transition: isDragging
          ? "none"
          : "box-shadow 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms cubic-bezier(0.4, 0, 0.2, 1)",
        // Subtle scale on hover for better UX feedback
        transform: isDragging ? "scale(1.03)" : "scale(1)",
        "&:hover": {
          boxShadow: isDragging
            ? "0 20px 40px rgba(0, 0, 0, 0.25), 0 0 1px rgba(0, 0, 0, 0.1)"
            : "0 4px 8px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.23)",
          transform: "scale(1.01)",
        },
      }}
    >
      <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
        {/* Task Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            position: "relative",
          }}
        >
          <Box
            {...listeners}
            {...attributes}
            data-drag-handle
            sx={{
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              cursor: isDragging ? "grabbing" : "grab",
              padding: "4px",
              borderRadius: "4px",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            {getTaskTypeIcon(task.taskType)}
          </Box>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {task.title}
          </Typography>
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              bgcolor: "background.paper",
              boxShadow: 1,
              "&:hover": {
                bgcolor: "error.light",
                color: "error.contrastText",
              },
              width: 24,
              height: 24,
            }}
          >
            <Delete sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Task Meta */}
        <Stack spacing={1}>
          {/* Priority Badge */}
          <Box>
            Priority:{" "}
            <Chip
              size="small"
              label={task.priority}
              color={getPriorityColor(task.priority)}
              variant="outlined"
            />
          </Box>

          {/* Assignee */}
          {task.assignee && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                }}
              >
                {task.assignee.firstName[0]}
                {task.assignee.lastName[0]}
              </Avatar>
              <Typography variant="caption">
                {task.assignee.firstName} {task.assignee.lastName}
              </Typography>
            </Box>
          )}

          {/* Story Points */}
          {task.storyPoints && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "space-between",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Story Points:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {task.storyPoints}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default DraggableTaskCard;
