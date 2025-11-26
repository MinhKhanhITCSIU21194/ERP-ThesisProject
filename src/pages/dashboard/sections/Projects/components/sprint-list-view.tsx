import React from "react";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridColDef } from "@mui/x-data-grid";
import { Sprint, SprintStatus } from "../../../../../data/project/project";
import { CustomTable } from "../../../../components/Table";

interface SprintListViewProps {
  sprints: Sprint[];
  onEdit?: (sprint: Sprint) => void;
  onDelete?: (sprint: Sprint) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

function SprintListView({
  sprints,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: SprintListViewProps) {
  const getStatusColor = (
    status: SprintStatus
  ): "default" | "primary" | "success" | "error" => {
    switch (status) {
      case SprintStatus.PLANNED:
        return "default";
      case SprintStatus.ACTIVE:
        return "primary";
      case SprintStatus.COMPLETED:
        return "success";
      case SprintStatus.CANCELLED:
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

  const calculateDuration = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 7) return `${diffDays} days`;
    const weeks = Math.floor(diffDays / 7);
    if (weeks === 1) return "1 week";
    return `${weeks} weeks`;
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Sprint Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "goal",
      headerName: "Goal",
      flex: 1.5,
      minWidth: 200,
      valueGetter: (value: any) => {
        return value || "No goal set";
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
      field: "dateRange",
      headerName: "Start Date - End Date",
      flex: 1,
      minWidth: 200,
      valueGetter: (value: any, row: any) => {
        const sprint = row as Sprint;
        return `${formatDate(sprint.startDate)} - ${formatDate(
          sprint.endDate
        )}`;
      },
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (value: any, row: any) => {
        const sprint = row as Sprint;
        return calculateDuration(sprint.startDate, sprint.endDate);
      },
    },
    {
      field: "tasks",
      headerName: "Tasks",
      width: 80,
      align: "center",
      headerAlign: "center",
      valueGetter: (value: any, row: any) => {
        return row.tasks?.length || 0;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const sprint = params.row as Sprint;

        return (
          <Box sx={{ display: "inline-flex", gap: 0.5 }}>
            {canEdit && onEdit && (
              <Tooltip title="Edit Sprint" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(sprint);
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
            {canDelete && onDelete && (
              <Tooltip title="Delete Sprint" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(sprint);
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

  if (!sprints || sprints.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
          p: 3,
          bgcolor: "grey.50",
          borderRadius: 1,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No sprints created yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create your first sprint to start organizing tasks
        </Typography>
      </Box>
    );
  }

  return (
    <CustomTable
      columns={columns}
      rows={sprints}
      sx={{ height: 400, minHeight: 400 }}
      checkboxSelection={false}
      loading={false}
      getRowId={(row) => row.sprintId}
    />
  );
}

export default SprintListView;
