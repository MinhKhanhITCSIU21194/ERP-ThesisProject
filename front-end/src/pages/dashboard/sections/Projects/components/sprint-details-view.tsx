import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Grid,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import {
  selectProject,
  resetProjectState,
} from "../../../../../redux/project/project.slice";
import {
  updateSprint,
  getSprintsByProject,
} from "../../../../../services/project.service";
import {
  Sprint,
  SprintStatus,
  UpdateSprintData,
} from "../../../../../data/project/project";
import { paths } from "../../../../../routes/paths";
import CustomDatePicker from "../../../../components/DatePicker";
import dayjs, { Dayjs } from "dayjs";

interface SprintDetailsViewProps {
  open: boolean;
  sprint: Sprint | null;
  onClose: () => void;
  onUpdate?: () => void;
}

const SprintDetailsView: React.FC<SprintDetailsViewProps> = ({
  open,
  sprint,
  onClose,
  onUpdate,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, success, sprints } = useAppSelector(selectProject);

  const [formData, setFormData] = useState<UpdateSprintData>({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
    status: SprintStatus.PLANNED,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [localLoading, setLocalLoading] = useState(false);

  // Populate form when sprint prop changes
  useEffect(() => {
    if (open && sprint) {
      setFormData({
        name: sprint.name,
        goal: sprint.goal || "",
        startDate: sprint.startDate
          ? new Date(sprint.startDate).toISOString().split("T")[0]
          : "",
        endDate: sprint.endDate
          ? new Date(sprint.endDate).toISOString().split("T")[0]
          : "",
        status: sprint.status,
      });
    }
  }, [open, sprint]);

  // Update form when sprint is updated in Redux store
  useEffect(() => {
    if (open && sprint) {
      const updatedSprint = sprints.find((s) => s.sprintId === sprint.sprintId);
      if (updatedSprint) {
        setFormData({
          name: updatedSprint.name,
          goal: updatedSprint.goal || "",
          startDate: updatedSprint.startDate
            ? new Date(updatedSprint.startDate).toISOString().split("T")[0]
            : "",
          endDate: updatedSprint.endDate
            ? new Date(updatedSprint.endDate).toISOString().split("T")[0]
            : "",
          status: updatedSprint.status,
        });
      }
    }
  }, [sprints, sprint, open]);

  // Handle success
  useEffect(() => {
    if (success && !isLoading && localLoading) {
      setLocalLoading(false);
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }
      // Close modal after a short delay to show success message
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, isLoading, localLoading, onUpdate, onClose]);

  const handleInputChange = (field: keyof UpdateSprintData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "Sprint name is required";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        errors.endDate = "End date must be after start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !sprint) return;

    setLocalLoading(true);
    try {
      const submitData: UpdateSprintData = {
        ...formData,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      };

      await dispatch(updateSprint({ id: sprint.sprintId, data: submitData }));
    } catch (error) {
      console.error("Error updating sprint:", error);
      setLocalLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      goal: "",
      startDate: "",
      endDate: "",
      status: SprintStatus.PLANNED,
    });
    setFormErrors({});
    setLocalLoading(false);
    dispatch(resetProjectState());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Sprint Details
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {!sprint ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <Typography>No sprint data available</Typography>
          </Box>
        ) : (
          <>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Sprint updated successfully!
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Sprint Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Sprint Goal"
                  value={formData.goal}
                  onChange={(e) => handleInputChange("goal", e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomDatePicker
                  label="Start Date"
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(newVal: Dayjs | null) =>
                    handleInputChange(
                      "startDate",
                      newVal ? newVal.format("YYYY-MM-DD") : "",
                    )
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomDatePicker
                  label="End Date"
                  value={formData.endDate ? dayjs(formData.endDate) : null}
                  onChange={(newVal: Dayjs | null) =>
                    handleInputChange(
                      "endDate",
                      newVal ? newVal.format("YYYY-MM-DD") : "",
                    )
                  }
                  minDate={
                    formData.startDate ? dayjs(formData.startDate) : undefined
                  }
                  error={!!formErrors.endDate}
                  helperText={formErrors.endDate}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange("status", e.target.value as SprintStatus)
                  }
                >
                  <MenuItem value={SprintStatus.PLANNED}>Planned</MenuItem>
                  <MenuItem value={SprintStatus.ACTIVE}>Active</MenuItem>
                  <MenuItem value={SprintStatus.COMPLETED}>Completed</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Button
            startIcon={<ViewKanbanIcon />}
            onClick={() => {
              if (sprint) {
                navigate(paths.project.board(sprint.sprintId));
                handleClose();
              }
            }}
            disabled={localLoading}
          >
            View Board
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={handleClose} disabled={localLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={isLoading || localLoading}
            >
              {localLoading ? <CircularProgress size={24} /> : "Update Sprint"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SprintDetailsView;
