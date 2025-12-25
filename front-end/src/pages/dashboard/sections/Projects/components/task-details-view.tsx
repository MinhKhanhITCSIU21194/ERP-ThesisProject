import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  BugReport,
  TaskAlt,
  AutoStories,
  Movie,
  Settings,
  AttachFile,
  Image,
  Delete,
  Send,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectProject } from "../../../../../redux/project/project.slice";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "../../../../../services/project.service";
import CustomButton from "../../../../components/Button";
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskComment,
  TaskAttachment,
} from "../../../../../data/project/project";
import { UserPermission } from "../../../../../data/auth/role";
import AuthContext from "../../../../../context/auth-provider";
import axios from "../../../../../services/axios";
import { useBreadcrumbLabel } from "../../../../components/breadcrumbs";
import { selectAuth } from "../../../../../redux/auth/auth.slice";

function TaskDetailView() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(selectAuth);
  const { isLoading } = useAppSelector(selectProject);

  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false });
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

  // Update breadcrumb with task title
  useBreadcrumbLabel(task?.title || `Task #${id}`);

  useEffect(() => {
    if (id) {
      dispatch(getTaskById(id)).then((result: any) => {
        if (result.payload) {
          setTask(result.payload);
          setEditedTask(result.payload);
          // Fetch project members for assignee dropdown
          if (result.payload.sprint?.projectId) {
            axios
              .get(`/projects/${result.payload.sprint.projectId}`)
              .then((res) => {
                if (res.data.data.members) {
                  setProjectMembers(res.data.data.members);
                }
              })
              .catch((err) =>
                console.error("Error fetching project members:", err)
              );
          }
        }
      });
    }
  }, [id, dispatch]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTask(task || {});
  };

  const handleSave = async () => {
    if (!id || !task) return;

    const updateData = {
      title: editedTask.title,
      description: editedTask.description,
      status: editedTask.status,
      priority: editedTask.priority,
      taskType: editedTask.taskType,
      assignedTo: editedTask.assignedTo,
      storyPoints: editedTask.storyPoints,
      estimatedHours: editedTask.estimatedHours,
      actualHours: editedTask.actualHours,
    };

    await dispatch(updateTask({ id, data: updateData }));
    const result = await dispatch(getTaskById(id));
    if (result.payload) {
      setTask(result.payload as Task);
    }
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof Task, value: any) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = () => {
    setConfirmDialog({ open: true });
  };

  const handleConfirmDelete = async () => {
    if (!id) return;

    try {
      const result = await dispatch(deleteTask(id));
      if (result.meta.requestStatus === "fulfilled") {
        setConfirmDialog({ open: false });
        alert("Task deleted successfully");
        navigate(-1);
      } else {
        alert("Failed to delete task");
      }
    } catch (err) {
      alert("Error deleting task");
      console.error(err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;

    try {
      await axios.post(`/projects/tasks/${id}/comments`, {
        content: newComment,
      });
      setNewComment("");
      // Refresh task to get updated comments
      const result = await dispatch(getTaskById(id));
      if (result.payload) {
        setTask(result.payload as Task);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;

    try {
      await axios.delete(`/projects/comments/${commentId}`);
      // Refresh task
      const result = await dispatch(getTaskById(id));
      if (result.payload) {
        setTask(result.payload as Task);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadAttachment = async () => {
    if (!selectedFile || !id) return;

    try {
      // In a real app, you'd upload to a file storage service first
      // For now, we'll just simulate with a local path
      const formData = {
        fileName: selectedFile.name,
        filePath: `/uploads/${selectedFile.name}`,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        type: selectedFile.type.startsWith("image/") ? "IMAGE" : "OTHER",
      };

      await axios.post(`/projects/tasks/${id}/attachments`, formData);
      setSelectedFile(null);
      // Refresh task
      const result = await dispatch(getTaskById(id));
      if (result.payload) {
        setTask(result.payload as Task);
      }
    } catch (error) {
      console.error("Error uploading attachment:", error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id) return;

    try {
      await axios.delete(`/projects/attachments/${attachmentId}`);
      // Refresh task
      const result = await dispatch(getTaskById(id));
      if (result.payload) {
        setTask(result.payload as Task);
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  const getTaskTypeIcon = (taskType?: TaskType) => {
    switch (taskType) {
      case TaskType.BUG:
        return <BugReport sx={{ color: "#d32f2f" }} />;
      case TaskType.STORY:
        return <AutoStories sx={{ color: "#1976d2" }} />;
      case TaskType.TASK:
        return <TaskAlt sx={{ color: "#388e3c" }} />;
      case TaskType.EPIC:
        return <Movie sx={{ color: "#7b1fa2" }} />;
      default:
        return <TaskAlt />;
    }
  };

  const getStatusColor = (status?: TaskStatus) => {
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

  const getPriorityColor = (priority?: TaskPriority) => {
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

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate(-1)}>
              <ArrowBack />
            </IconButton>
            {getTaskTypeIcon(task.taskType)}
            <Typography variant="h5">{task.title}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {isEditing ? (
              <>
                <Button
                  startIcon={<Save />}
                  variant="contained"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  Save
                </Button>
                <Button
                  startIcon={<Cancel />}
                  variant="outlined"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  startIcon={<Edit />}
                  variant="outlined"
                  onClick={handleEdit}
                >
                  Edit Task
                </Button>
                <CustomButton
                  requiredPermission={UserPermission.PROJECT_MANAGEMENT}
                  requiredAction="canDelete"
                  userPermissions={user?.role?.permissions || []}
                  startIcon={<Delete />}
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  content="Delete"
                />
              </>
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box>
              {/* Status Bar */}
              <Box
                sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}
              >
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={isEditing ? editedTask.status : task.status}
                    onChange={(e) =>
                      handleFieldChange("status", e.target.value as TaskStatus)
                    }
                    disabled={!isEditing}
                  >
                    {Object.values(TaskStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton size="small">
                  <Settings />
                </IconButton>
              </Box>

              {/* Description Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  Description
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={editedTask.description || ""}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    placeholder="Add task description..."
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {task.description || "No description provided."}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Comments Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: "bold" }}
                >
                  Comments ({task.comments?.length || 0})
                </Typography>

                {/* Existing Comments */}
                {task.comments && task.comments.length > 0 && (
                  <List sx={{ mb: 2 }}>
                    {task.comments.map((comment) => (
                      <ListItem
                        key={comment.commentId}
                        alignItems="flex-start"
                        sx={{
                          bgcolor: "#f5f5f5",
                          mb: 1,
                          borderRadius: 1,
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            width: "100%",
                            alignItems: "flex-start",
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {comment.author.firstName[0]}
                              {comment.author.lastName[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography variant="subtitle2">
                                  {comment.author.firstName}{" "}
                                  {comment.author.lastName}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleDeleteComment(comment.commentId)
                                  }
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                            secondary={
                              <>
                                <Typography
                                  variant="body2"
                                  color="text.primary"
                                  sx={{ mt: 0.5 }}
                                >
                                  {comment.content}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mt: 0.5, display: "block" }}
                                >
                                  {new Date(comment.createdAt).toLocaleString()}
                                </Typography>
                              </>
                            }
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}

                {/* Add New Comment */}
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a comment..."
                    variant="outlined"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    sx={{ mt: 1, textTransform: "none" }}
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Attachments Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 2, fontWeight: "bold" }}
                >
                  Attachments ({task.attachments?.length || 0})
                </Typography>

                {/* Existing Attachments */}
                {task.attachments && task.attachments.length > 0 && (
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {task.attachments.map((attachment) => (
                      <Card
                        key={attachment.attachmentId}
                        variant="outlined"
                        sx={{ bgcolor: "#f5f5f5" }}
                      >
                        <CardContent
                          sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {attachment.type === "IMAGE" ? (
                                <Image fontSize="small" color="primary" />
                              ) : (
                                <AttachFile fontSize="small" color="action" />
                              )}
                              <Box>
                                <Typography variant="body2">
                                  {attachment.fileName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {(attachment.fileSize / 1024).toFixed(2)} KB •{" "}
                                  {attachment.uploadedBy.firstName}{" "}
                                  {attachment.uploadedBy.lastName}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDeleteAttachment(attachment.attachmentId)
                              }
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}

                {/* Upload New Attachment */}
                <Box>
                  <input
                    accept="*/*"
                    style={{ display: "none" }}
                    id="attachment-upload"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="attachment-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFile />}
                      sx={{ textTransform: "none" }}
                    >
                      Choose File
                    </Button>
                  </label>
                  {selectedFile && (
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">
                        {selectedFile.name}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleUploadAttachment}
                        sx={{ textTransform: "none" }}
                      >
                        Upload
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setSelectedFile(null)}
                        sx={{ textTransform: "none" }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* History Section */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  History
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Task history will appear here
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Details Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Details
              </Typography>

              <Stack spacing={2}>
                {/* Assignee and Priority - Same Line */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Assignee */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Assignee
                    </Typography>
                    {isEditing ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={editedTask.assignedTo || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "assignedTo",
                              e.target.value || undefined
                            )
                          }
                          displayEmpty
                        >
                          <MenuItem value="">
                            <em>Unassigned</em>
                          </MenuItem>
                          {projectMembers.map((member) => (
                            <MenuItem
                              key={member.employee.employeeId}
                              value={member.employee.employeeId}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Avatar
                                  sx={{ width: 24, height: 24, fontSize: 12 }}
                                >
                                  {member.employee.firstName[0]}
                                  {member.employee.lastName[0]}
                                </Avatar>
                                <Typography variant="body2">
                                  {member.employee.firstName}{" "}
                                  {member.employee.lastName}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : task.assignee ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {task.assignee.firstName[0]}
                          {task.assignee.lastName[0]}
                        </Avatar>
                        <Typography variant="body2">
                          {task.assignee.firstName} {task.assignee.lastName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </Box>

                  {/* Priority */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Priority
                    </Typography>
                    {isEditing ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={editedTask.priority || TaskPriority.MEDIUM}
                          onChange={(e) =>
                            handleFieldChange(
                              "priority",
                              e.target.value as TaskPriority
                            )
                          }
                        >
                          {Object.values(TaskPriority).map((priority) => (
                            <MenuItem key={priority} value={priority}>
                              {priority}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                      />
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Type and Story Points - Same Line */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Task Type */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Type
                    </Typography>
                    {isEditing ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={editedTask.taskType || TaskType.TASK}
                          onChange={(e) =>
                            handleFieldChange(
                              "taskType",
                              e.target.value as TaskType
                            )
                          }
                        >
                          {Object.values(TaskType).map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip label={task.taskType} size="small" />
                    )}
                  </Box>

                  {/* Story Points */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Story Points
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={editedTask.storyPoints || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "storyPoints",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <Typography variant="body2">
                        {task.storyPoints || "None"}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Estimated Hours and Actual Hours - Same Line */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* Estimated Hours */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Estimated Hours
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={editedTask.estimatedHours || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "estimatedHours",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <Typography variant="body2">
                        {task.estimatedHours
                          ? `${task.estimatedHours}h`
                          : "None"}
                      </Typography>
                    )}
                  </Box>

                  {/* Actual Hours */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Actual Hours
                    </Typography>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={editedTask.actualHours || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "actualHours",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <Typography variant="body2">
                        {task.actualHours ? `${task.actualHours}h` : "None"}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Sprint */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Sprint
                  </Typography>
                  <Typography variant="body2">{task.sprint?.name}</Typography>
                </Box>

                <Divider />

                {/* Project */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Project
                  </Typography>
                  <Typography variant="body2">
                    {task.sprint?.project?.name}
                  </Typography>
                </Box>

                <Divider />

                {/* Dates */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Last Updated
                  </Typography>
                  <Typography variant="body2">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false })}
      >
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this task? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false })}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TaskDetailView;
