import {
  Box,
  IconButton,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Alert,
  Chip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomTable } from "../../../../components/Table";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import {
  selectPosition,
  Position,
} from "../../../../../redux/admin/position.slice";
import { UserPermission } from "../../../../../data/auth/role";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import {
  getPositionList,
  createPosition,
  updatePosition,
  deletePosition,
} from "../../../../../services/position.service";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import CustomButton from "../../../../components/Button";
import ConfirmationDialog from "../../../../components/ConfirmationWindow";

// Position levels enum
const PositionLevels = [
  { value: "INTERN", label: "Intern" },
  { value: "JUNIOR", label: "Junior" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "MANAGER", label: "Manager" },
  { value: "SENIOR_MANAGER", label: "Senior Manager" },
  { value: "DIRECTOR", label: "Director" },
  { value: "SENIOR_DIRECTOR", label: "Senior Director" },
  { value: "VP", label: "Vice President" },
  { value: "SVP", label: "Senior Vice President" },
  { value: "C_LEVEL", label: "C-Level" },
];

const currencies = ["USD", "EUR", "GBP", "VND", "JPY", "CNY"];

function PositionListView() {
  const { positions, isLoading } = useAppSelector(selectPosition);
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "add">("edit");
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "",
    code: "",
    minSalary: "",
    maxSalary: "",
    salaryCurrency: "USD",
    requirements: "",
    responsibilities: "",
  });
  const [error, setError] = useState<string | null>(null);

  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });

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

  // Fetch positions on mount
  useEffect(() => {
    dispatch(getPositionList());
  }, [dispatch]);

  const onSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setFormData({
      name: position.name,
      description: position.description || "",
      level: position.level || "",
      code: position.code || "",
      minSalary: position.minSalary?.toString() || "",
      maxSalary: position.maxSalary?.toString() || "",
      salaryCurrency: position.salaryCurrency || "USD",
      requirements: position.requirements || "",
      responsibilities: position.responsibilities || "",
    });
    setModalMode("edit");
    setModalOpen(true);
    setError(null);
  };

  const handleAddNew = () => {
    setSelectedPosition(null);
    setFormData({
      name: "",
      description: "",
      level: "",
      code: "",
      minSalary: "",
      maxSalary: "",
      salaryCurrency: "USD",
      requirements: "",
      responsibilities: "",
    });
    setModalMode("add");
    setModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPosition(null);
    setError(null);
  };

  const handleSavePosition = async () => {
    try {
      setError(null);

      if (!formData.name.trim()) {
        setError("Position name is required");
        return;
      }

      const minSalary = formData.minSalary
        ? parseFloat(formData.minSalary)
        : undefined;
      const maxSalary = formData.maxSalary
        ? parseFloat(formData.maxSalary)
        : undefined;

      if (
        minSalary !== undefined &&
        maxSalary !== undefined &&
        minSalary > maxSalary
      ) {
        setError("Minimum salary cannot be greater than maximum salary");
        return;
      }

      const positionData = {
        name: formData.name,
        description: formData.description || undefined,
        level: formData.level || undefined,
        code: formData.code || undefined,
        minSalary,
        maxSalary,
        salaryCurrency: formData.salaryCurrency,
        requirements: formData.requirements || undefined,
        responsibilities: formData.responsibilities || undefined,
      };

      if (modalMode === "edit" && selectedPosition) {
        await dispatch(
          updatePosition({
            positionId: selectedPosition.id,
            positionData,
          })
        ).unwrap();
      } else {
        await dispatch(createPosition(positionData)).unwrap();
      }

      handleCloseModal();
      dispatch(getPositionList());
    } catch (err: any) {
      setError(err || "Failed to save position");
    }
  };

  const handleDelete = (position: Position) => {
    setConfirmDialog({
      open: true,
      title: "Delete Position",
      message: `Are you sure you want to delete the position "${position.name}"?`,
      onConfirm: async () => {
        try {
          await dispatch(deletePosition(position.id)).unwrap();
          dispatch(getPositionList());
          alert("Position deleted successfully");
        } catch (err: any) {
          alert(err || "Failed to delete position");
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const formatSalaryRange = (position: Position): string => {
    if (position.minSalary && position.maxSalary) {
      const currency = position.salaryCurrency || "USD";
      return `${currency} ${position.minSalary.toLocaleString()} - ${position.maxSalary.toLocaleString()}`;
    }
    return "Not specified";
  };

  const getLevelLabel = (level?: string): string => {
    if (!level) return "Not specified";
    const levelObj = PositionLevels.find((l) => l.value === level);
    return levelObj?.label || level;
  };

  const columns = [
    {
      field: "name",
      headerName: "Position Name",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          {params.row.code && (
            <Typography variant="caption" color="text.secondary">
              Code: {params.row.code}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "level",
      headerName: "Level",
      flex: 1,
      minWidth: 150,
      renderCell: (params: any) => {
        const level = params.value;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            {!level ? (
              <Chip label="Not specified" size="small" variant="outlined" />
            ) : (
              <Chip
                label={getLevelLabel(level)}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        );
      },
    },
    {
      field: "salary",
      headerName: "Salary Range",
      flex: 1.5,
      minWidth: 200,
      sortable: false,
      valueGetter: (value: any, row: any) => {
        return formatSalaryRange(row);
      },
    },
    {
      field: "headcount",
      headerName: "Employees",
      flex: 0.4,
      minWidth: 100,
      align: "center" as const,
      headerAlign: "center" as const,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Chip
            label={params.row.employees?.length || params.row.headcount || 0}
            size="small"
            color="default"
          />
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.4,
      minWidth: 120,
      sortable: false,
      renderCell: (params: any) => {
        const position = params.row as Position;

        // Check permissions
        const positionPermission = user?.role?.permissions?.find(
          (p) => p.permission === UserPermission.POSITION_MANAGEMENT
        );

        const canUpdate = positionPermission?.canUpdate || false;
        const canDelete = positionPermission?.canDelete || false;

        return (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              height: "100%",
            }}
          >
            {canUpdate && (
              <Tooltip title="Edit Position" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(position)}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(25, 114, 210, 0.1)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete Position" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(position)}
                  sx={{
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

  return (
    <>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <CustomButton
              requiredPermission={UserPermission.POSITION_MANAGEMENT}
              requiredAction="canCreate"
              userPermissions={user?.role?.permissions || []}
              content="Add New Position"
              variant="contained"
              color="primary"
              onClick={handleAddNew}
            />
          </Box>
        </Box>
        <CustomTable
          onSelectionChange={onSelectionChange}
          loading={isLoading}
          sx={{ padding: "2" }}
          columns={columns}
          rows={positions}
          getRowId={(row: any) => row.id}
        />
      </Paper>

      {/* Edit/Add Position Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: "90vh" },
        }}
      >
        <DialogTitle>
          {modalMode === "edit" ? "Edit Position" : "Add New Position"}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Position Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                helperText="e.g., Software Engineer, Product Manager"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Position Code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                helperText="e.g., SWE-SR, PM-L"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                label="Level"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              >
                <MenuItem value="">
                  <em>Not specified</em>
                </MenuItem>
                {PositionLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={2}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Salary Range
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Minimum Salary"
                type="number"
                value={formData.minSalary}
                onChange={(e) =>
                  setFormData({ ...formData, minSalary: e.target.value })
                }
                InputProps={{
                  inputProps: { min: 0, step: 1000 },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Maximum Salary"
                type="number"
                value={formData.maxSalary}
                onChange={(e) =>
                  setFormData({ ...formData, maxSalary: e.target.value })
                }
                InputProps={{
                  inputProps: { min: 0, step: 1000 },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Currency"
                value={formData.salaryCurrency}
                onChange={(e) =>
                  setFormData({ ...formData, salaryCurrency: e.target.value })
                }
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Requirements"
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                multiline
                rows={3}
                helperText="Job requirements, qualifications, skills needed"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Responsibilities"
                value={formData.responsibilities}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsibilities: e.target.value,
                  })
                }
                multiline
                rows={3}
                helperText="Key responsibilities and duties"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            onClick={handleSavePosition}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}

export default PositionListView;
