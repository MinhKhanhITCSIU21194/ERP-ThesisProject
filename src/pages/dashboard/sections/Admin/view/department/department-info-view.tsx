import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Divider,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Autocomplete,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Department } from "../../../../../../data/employer/department";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { selectDepartment } from "../../../../../../redux/admin/department.slice";
import { Employee } from "../../../../../../data/employee/employee";
import { getEmployeeList } from "../../../../../../services/employee.service";

interface DepartmentInfoViewProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "add";
  department?: Department | null;
  onSave?: (department: Department) => void;
}

function DepartmentInfoView({
  open,
  onClose,
  mode,
  department,
  onSave,
}: DepartmentInfoViewProps) {
  const dispatch = useAppDispatch();
  const { departments } = useAppSelector(selectDepartment);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  const [formData, setFormData] = useState({
    name: "",
    managerId: "",
    parentId: "",
  });

  const [availableManagers, setAvailableManagers] = useState<Employee[]>([]);

  useEffect(() => {
    if (department && open) {
      setFormData({
        name: department.name || "",
        managerId: department.manager?.employeeId || "",
        parentId: department.parentId || "",
      });
    } else if (isAddMode && open) {
      setFormData({
        name: "",
        managerId: "",
        parentId: "",
      });
    }
  }, [department, open, isAddMode]);

  // Fetch employees for manager selection only when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(
        getEmployeeList({
          pageIndex: 0,
          pageSize: 50,
        })
      )
        .unwrap()
        .then((result) => setAvailableManagers(result.data || []))
        .catch((error) => console.error("Error loading employees:", error));
    }
  }, [open, dispatch]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert("Department name is required");
      return;
    }

    const departmentData: any = {
      id: department?.id,
      name: formData.name,
      managerId: formData.managerId || undefined,
      parentId: formData.parentId || null,
      childrenDepartment: department?.childrenDepartment || [],
    };

    onSave?.(departmentData);
  };

  const getTitle = () => {
    if (isViewMode) return "Department Details";
    if (isEditMode) return "Edit Department";
    return "Add New Department";
  };

  // Filter out current department and its children from parent options
  const availableParentDepartments = departments.filter(
    (d) => d.id !== department?.id && !isDescendant(d, department?.id || "")
  );

  // Helper function to check if a department is a descendant
  function isDescendant(dept: Department, targetId: string): boolean {
    if (dept.id === targetId) return true;
    if (dept.childrenDepartment && dept.childrenDepartment.length > 0) {
      return dept.childrenDepartment.some((child) =>
        isDescendant(child, targetId)
      );
    }
    return false;
  }

  const selectedManager = availableManagers.find(
    (e) => e.employeeId === formData.managerId
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "60vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h5" component="div" fontWeight={600}>
          {getTitle()}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Department Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Department Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Department Name"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={isViewMode}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              fullWidth
              options={availableManagers}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName} - ${option.email}`
              }
              value={selectedManager || null}
              onChange={(_, newValue) =>
                handleInputChange("managerId", newValue?.employeeId || "")
              }
              disabled={isViewMode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Department Manager"
                  placeholder="Search for manager..."
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Parent Department</InputLabel>
              <Select
                name="parentId"
                value={formData.parentId}
                onChange={(e) => handleInputChange("parentId", e.target.value)}
                label="Parent Department"
              >
                <MenuItem value="">
                  <em>None (Root Department)</em>
                </MenuItem>
                {availableParentDepartments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Display department statistics in view mode */}
          {isViewMode && department && (
            <>
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Department Statistics
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Total Employees"
                  value={department.employeeQuantity || 0}
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Sub-Departments"
                  value={department.childrenDepartment?.length || 0}
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {department.childrenDepartment &&
                department.childrenDepartment.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sub-Departments:
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {department.childrenDepartment.map((child) => (
                        <Chip
                          key={child.id}
                          label={child.name}
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
            </>
          )}
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          {isViewMode ? "Close" : "Cancel"}
        </Button>
        {!isViewMode && (
          <Button variant="contained" color="primary" onClick={handleSave}>
            {isAddMode ? "Create Department" : "Save Changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default DepartmentInfoView;
