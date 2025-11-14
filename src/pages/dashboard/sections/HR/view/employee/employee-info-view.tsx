import React, { useEffect } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Employee } from "../../../../../../data/employee/employee";
import { getDepartmentList } from "../../../../../../services/department.service";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { selectDepartment } from "../../../../../../redux/admin/department.slice";

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
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  const getTitle = () => {
    if (isViewMode) return "Employee Details";
    if (isEditMode) return "Edit Employee";
    return "Add New Employee";
  };
  console.log(departments);
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
          {/* Profile Section */}
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
          </Grid>

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
              defaultValue={employee?.firstName || ""}
              disabled={isViewMode}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              defaultValue={employee?.lastName || ""}
              disabled={isViewMode}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              defaultValue={employee?.email || ""}
              disabled={isViewMode}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              defaultValue={employee?.phoneNumber || ""}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              defaultValue={employee?.dateOfBirth || ""}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                defaultValue={employee?.gender || ""}
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
              defaultValue={employee?.currentAddress || ""}
              disabled={isViewMode}
              multiline
              rows={2}
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
              defaultValue={employee?.hireDate || ""}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Position</InputLabel>
              <Select
                name="position"
                defaultValue={employee?.positionEntity?.id || ""}
                label="Position"
              >
                <MenuItem value="">Select Position</MenuItem>
                {/* Add position options here */}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                defaultValue={[
                  employee?.departments?.[0]?.department?.id || "",
                ]}
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
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Employment Status</InputLabel>
              <Select
                name="employmentStatus"
                defaultValue={employee?.employmentStatus || ""}
                label="Employment Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
                <MenuItem value="Terminated">Terminated</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel>Contract Type</InputLabel>
              <Select
                name="contractType"
                defaultValue={employee?.contractType || ""}
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
              defaultValue={employee?.emergencyContactName || ""}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Emergency Contact Phone"
              name="emergencyContactPhone"
              defaultValue={employee?.emergencyContactPhone || ""}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Emergency Contact Relationship"
              name="emergencyContactRelationship"
              defaultValue={employee?.emergencyContactRelationship || ""}
              disabled={isViewMode}
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
              defaultValue={employee?.bankAccountNumber || ""}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              defaultValue={employee?.bankName || ""}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tax ID Number"
              name="taxId"
              defaultValue={employee?.taxId || ""}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Social Security Number"
              name="socialSecurityNumber"
              defaultValue={employee?.socialSecurityNumber || ""}
              disabled={isViewMode}
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
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Handle save logic here
              console.log("Save employee");
            }}
          >
            {isAddMode ? "Create Employee" : "Save Changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeInfoView;
