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
  Avatar,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Employee } from "../../../../../../data/employee/employee";
import { getDepartmentList } from "../../../../../../services/department.service";
import { getPositionList } from "../../../../../../services/position.service";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { selectDepartment } from "../../../../../../redux/admin/department.slice";
import { selectPosition } from "../../../../../../redux/admin/position.slice";

interface EmployeeInfoViewProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "add";
  employee?: Employee | null;
  onSave?: (employee: Employee) => void;
}

function EmployeeInfoView({
  open,
  onClose,
  mode,
  employee,
  onSave,
}: EmployeeInfoViewProps) {
  const dispatch = useAppDispatch();
  const { departments } = useAppSelector(selectDepartment);
  const { positions } = useAppSelector(selectPosition);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  // Form state
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    if (open) {
      dispatch(getDepartmentList());
      dispatch(getPositionList());

      // Initialize form data when modal opens
      if (employee && (isEditMode || isViewMode)) {
        const departmentIds =
          employee.departments
            ?.map((d) => d.department?.id || d.departmentId)
            .filter(Boolean) ||
          employee.departmentIds ||
          [];
        setFormData({
          ...employee,
          positionId: employee.positionEntity?.id || employee.positionId,
          departmentIds: departmentIds,
        });
      } else if (isAddMode) {
        setFormData({});
      }
    }
  }, [open, dispatch, employee, isEditMode, isViewMode, isAddMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = () => {
    if (!onSave) return;

    // Prepare data for submission
    const employeeData: any = {
      ...formData,
      employeeId: employee?.employeeId,
    };

    // Remove entity objects - only send IDs
    delete employeeData.positionEntity;
    delete employeeData.departments;
    delete employeeData.user;

    // Remove empty arrays and empty strings to prevent backend issues
    if (employeeData.departmentIds && employeeData.departmentIds.length === 0) {
      delete employeeData.departmentIds;
    }
    if (!employeeData.positionId || employeeData.positionId === "") {
      delete employeeData.positionId;
    }

    onSave(employeeData);
  };

  const getTitle = () => {
    if (isViewMode) return "Employee Details";
    if (isEditMode) return "Edit Employee";
    return "Add New Employee";
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "80vh",
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
          {mode === "view" && (
            <Grid>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  mb: 3,
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: "2.5rem",
                      bgcolor: "primary.main",
                    }}
                  >
                    {employee?.firstName?.[0]}
                    {employee?.lastName?.[0]}
                  </Avatar>

                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {employee?.firstName} {employee?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {employee?.positionEntity?.name || "N/A"}
                    </Typography>
                    <Chip
                      label={employee?.employmentStatus || "Active"}
                      size="small"
                      color="success"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Personal Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={formData.gender || ""}
                onChange={handleSelectChange}
                label="Gender"
              >
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 12 }}>
            <TextField
              fullWidth
              label="Current Address"
              name="currentAddress"
              value={formData.currentAddress || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              multiline
              rows={2}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Employment Information */}
          <Grid size={{ xs: 12, md: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Employment Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Hire Date"
              name="hireDate"
              type="date"
              value={formData.hireDate || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Position</InputLabel>
              <Select
                name="positionId"
                value={formData.positionId || ""}
                onChange={handleSelectChange}
                label="Position"
              >
                <MenuItem value="">Select Position</MenuItem>
                {positions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Department</InputLabel>
              <Select
                name="departmentIds"
                value={formData.departmentIds || []}
                onChange={handleSelectChange}
                label="Department"
                multiple={true}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Suggested Role"
              name="suggestedRole"
              value={formData.suggestedRole || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
              helperText="Role suggested by manager for admin approval"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Employment Status</InputLabel>
              <Select
                name="employmentStatus"
                value={formData.employmentStatus || ""}
                onChange={handleSelectChange}
                label="Employment Status"
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="ON_LEAVE">On Leave</MenuItem>
                <MenuItem value="TERMINATED">Terminated</MenuItem>
                <MenuItem value="RESIGNED">Resigned</MenuItem>
                <MenuItem value="RETIRED">Retired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Contract Type</InputLabel>
              <Select
                name="contractType"
                value={formData.contractType || ""}
                onChange={handleSelectChange}
                label="Contract Type"
              >
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Emergency Contact */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Emergency Contact
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Emergency Contact Name"
              name="emergencyContactName"
              value={formData.emergencyContactName || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Emergency Contact Phone"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Emergency Contact Relationship"
              name="emergencyContactRelationship"
              value={formData.emergencyContactRelationship || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Additional Information */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Additional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Bank Account Number"
              name="bankAccountNumber"
              value={formData.bankAccountNumber || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              value={formData.bankName || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tax ID Number"
              name="taxId"
              value={formData.taxId || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Social Security Number"
              name="socialSecurityNumber"
              value={formData.socialSecurityNumber || ""}
              onChange={handleInputChange}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          {isViewMode ? "Close" : "Cancel"}
        </Button>
        {!isViewMode && (
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {isAddMode ? "Create Employee" : "Save Changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeInfoView;
