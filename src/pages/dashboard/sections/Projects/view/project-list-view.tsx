import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridColDef } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectProject } from "../../../../../redux/project/project.slice";
import { getProjectsByEmployeeId } from "../../../../../services/project.service";
import {
  Project,
  ProjectStatus,
  ProjectPriority,
} from "../../../../../data/project/project";
import { paths } from "../../../../../routes/paths";
import { CustomTable } from "../../../../components/Table";
import { CustomSearchField } from "../../../../components/SearchBar.tsx";
import CustomButton from "../../../../components/Button";
import { UserPermission } from "../../../../../data/auth/role";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import ConfirmationDialog from "../../../../components/ConfirmationWindow";

function ProjectListView() {
  const { user } = useAppSelector(selectAuth);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { projects, isLoading, error, totalProjects } =
    useAppSelector(selectProject);
  const [searchTerm, setSearchTerm] = useState("");

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    // Fetch all projects for the user
    if (user?.employeeID) {
      dispatch(
        getProjectsByEmployeeId({ employeeId: user.employeeID, limit: 100 })
      );
    }
  }, [dispatch, user?.employeeID]);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
  };

  const handleAddNewProject = () => {
    navigate(paths.project.create);
  };

  const handleEdit = (project: Project) => {
    // Navigate to edit project page or open edit modal
    navigate(paths.project.detail(project.projectId));
  };

  const handleDelete = (project: Project) => {
    setConfirmDialog({
      open: true,
      title: "Delete Project",
      message: `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // TODO: Import and dispatch deleteProject action
          // await dispatch(deleteProject(project.projectId)).unwrap();
          // dispatch(getProjectsByEmployeeId({ employeeId: user!.employeeID, limit: 100 }));
          console.log("Delete project:", project);
          alert("Project deletion not yet implemented");
        } catch (err: any) {
          alert(err || "Failed to delete project");
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower) ||
      project.status.toLowerCase().includes(searchLower) ||
      project.priority.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (
    status: ProjectStatus
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return "info";
      case ProjectStatus.ACTIVE:
        return "success";
      case ProjectStatus.ON_HOLD:
        return "warning";
      case ProjectStatus.COMPLETED:
        return "default";
      case ProjectStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (
    priority: ProjectPriority
  ): "default" | "primary" | "warning" | "error" => {
    switch (priority) {
      case ProjectPriority.LOW:
        return "default";
      case ProjectPriority.MEDIUM:
        return "primary";
      case ProjectPriority.HIGH:
        return "warning";
      case ProjectPriority.CRITICAL:
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 250,
      valueGetter: (value: any, row: any) => {
        return value || "No description";
      },
    },
    {
      field: "members",
      headerName: "Members",
      width: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (value: any, row: any) => {
        return row.members?.filter((m: any) => !m.leftAt).length || 0;
      },
    },
    {
      field: "sprints",
      headerName: "Sprints",
      width: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (value: any, row: any) => {
        return row.sprints?.length || 0;
      },
    },
    {
      field: "dateRange",
      headerName: "Start Date - End Date",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => {
        const project = row as Project;
        return `${formatDate(project.startDate)} - ${formatDate(
          project.endDate
        )}`;
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.replace("_", " ")}
          size="small"
          color={getStatusColor(params.value)}
          sx={{ fontSize: "0.75rem" }}
        />
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getPriorityColor(params.value)}
          sx={{ fontSize: "0.75rem" }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const project = params.row as Project;

        // Check permissions
        const projectPermission = user?.role?.permissions?.find(
          (p) => p.permission === UserPermission.PROJECT_MANAGEMENT
        );

        const canUpdate = projectPermission?.canUpdate || false;
        const canDelete = projectPermission?.canDelete || false;

        return (
          <Box sx={{ display: "inline-flex", gap: 0.5 }}>
            {canUpdate && (
              <Tooltip title="Edit Project" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(project);
                  }}
                  sx={{
                    top: 5,
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete Project" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project);
                  }}
                  sx={{
                    top: 5,
                    "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          p: 3,
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Projects
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        m: { xs: 1, sm: 2 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <CustomSearchField
            placeholder="Search projects..."
            onSearch={handleSearch}
          />
          <CustomButton
            requiredPermission={UserPermission.PROJECT_MANAGEMENT}
            requiredAction="canCreate"
            userPermissions={user?.role?.permissions || []}
            content="Add New"
            variant="contained"
            color="primary"
            onClick={handleAddNewProject}
          />
        </Box>

        {/* Projects Table */}
        <CustomTable
          columns={columns}
          rows={filteredProjects}
          sx={{ height: 600 }}
          checkboxSelection={false}
          loading={isLoading}
          getRowId={(row) => row.projectId}
          onRowClick={(params) => {
            navigate(paths.project.detail(params.row.projectId));
          }}
        />
      </Box>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </Paper>
  );
}

export default ProjectListView;
