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
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { User, UserStatus } from "../../../../../../data/auth/auth";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { selectRole } from "../../../../../../redux/auth/role.slice";
import { getRoleList } from "../../../../../../services/auth/role.service";
import { getEmployeeList } from "../../../../../../services/employee.service";
import { Employee } from "../../../../../../data/employee/employee";

interface UserInfoViewProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "add";
  user?: User | null;
  onSave?: (user: any) => void;
}

function UserInfoView({
  open,
  onClose,
  mode,
  user,
  onSave,
}: UserInfoViewProps) {
  const dispatch = useAppDispatch();
  const { roles } = useAppSelector(selectRole);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isAddMode = mode === "add";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    employeeId: "",
    isEmailVerified: false,
    status: UserStatus.PENDING,
  });

  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (open) {
      dispatch(getRoleList({ pageIndex: 0, pageSize: 100 }));
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (user && open) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.email?.split("@")[0] || "",
        password: "",
        confirmPassword: "",
        roleId: user.role?.roleId?.toString() || user.role?.id || "",
        employeeId: user.employeeID || "",
        isEmailVerified: user.isEmailVerified || false,
        status: UserStatus.ACTIVE,
      });
    } else if (isAddMode && open) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        roleId: "",
        employeeId: "",
        isEmailVerified: false,
        status: UserStatus.PENDING,
      });
    }
  }, [user, open, isAddMode]);

  // Fetch employees for linking
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await dispatch(
          getEmployeeList({
            pageIndex: 0,
            pageSize: 50,
            search: employeeSearchTerm || undefined,
          })
        ).unwrap();
        setAvailableEmployees(result.data || []);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [employeeSearchTerm, dispatch]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear password error when user types
    if (field === "password" || field === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert("First name and last name are required");
      return;
    }

    if (!formData.email.trim()) {
      alert("Email is required");
      return;
    }

    if (!formData.roleId) {
      alert("Role is required");
      return;
    }

    // Password validation for new users
    if (isAddMode) {
      if (!formData.password) {
        alert("Password is required");
        return;
      }

      if (formData.password.length < 8) {
        setPasswordError("Password must be at least 8 characters");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
    }

    // Password validation for edit mode (only if password is provided)
    if (isEditMode && formData.password) {
      if (formData.password.length < 8) {
        setPasswordError("Password must be at least 8 characters");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
    }

    const userData: any = {
      userId: user?.userId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      username: formData.username || formData.email.split("@")[0],
      roleId: formData.roleId,
      employeeId: formData.employeeId || undefined,
      isEmailVerified: formData.isEmailVerified,
      status: formData.status,
    };

    // Only include password if it's provided
    if (formData.password) {
      userData.password = formData.password;
    }

    onSave?.(userData);
  };

  const getTitle = () => {
    if (isViewMode) return "User Details";
    if (isEditMode) return "Edit User";
    return "Add New User";
  };

  const selectedEmployee = availableEmployees.find(
    (e) => e.employeeId === formData.employeeId
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "70vh",
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
          {/* Profile Section - Only in view mode */}
          {isViewMode && user && (
            <Grid size={{ xs: 12 }}>
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
                    width: 80,
                    height: 80,
                    fontSize: "2rem",
                    bgcolor: "primary.main",
                  }}
                >
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={user.role?.name || "No Role"}
                      size="small"
                      color="primary"
                    />
                    {user.isEmailVerified ? (
                      <Chip label="Verified" size="small" color="success" />
                    ) : (
                      <Chip label="Unverified" size="small" color="warning" />
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}

          {/* User Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              User Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
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
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
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
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={isViewMode || isEditMode}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              disabled={isViewMode}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Password fields - only show in add or edit mode */}
          {!isViewMode && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={
                    isEditMode
                      ? "New Password (leave blank to keep current)"
                      : "Password"
                  }
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required={isAddMode}
                  error={!!passwordError}
                  helperText={
                    isEditMode
                      ? "Leave blank to keep current password"
                      : "Minimum 8 characters"
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  required={isAddMode || !!formData.password}
                  error={!!passwordError}
                  helperText={passwordError}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth disabled={isViewMode} required>
              <InputLabel>Role</InputLabel>
              <Select
                name="roleId"
                value={formData.roleId}
                onChange={(e) => handleInputChange("roleId", e.target.value)}
                label="Role"
              >
                <MenuItem value="">
                  <em>Select Role</em>
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem
                    key={role.roleId || role.id}
                    value={role.roleId || role.id}
                  >
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              fullWidth
              options={availableEmployees}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName} - ${option.email}`
              }
              value={selectedEmployee || null}
              onChange={(_, newValue) =>
                handleInputChange("employeeId", newValue?.employeeId || "")
              }
              onInputChange={(_, newInputValue) => {
                setEmployeeSearchTerm(newInputValue);
              }}
              disabled={isViewMode}
              filterOptions={(x) => x}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Link to Employee (Optional)"
                  placeholder="Search for employee..."
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          {isEditMode && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Email Verified</InputLabel>
                  <Select
                    name="isEmailVerified"
                    value={formData.isEmailVerified ? "true" : "false"}
                    onChange={(e) =>
                      handleInputChange(
                        "isEmailVerified",
                        e.target.value === "true"
                      )
                    }
                    label="Email Verified"
                  >
                    <MenuItem value="true">Verified</MenuItem>
                    <MenuItem value="false">Unverified</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value as UserStatus)
                    }
                    label="Status"
                  >
                    {Object.values(UserStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
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
            {isAddMode ? "Create User" : "Save Changes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default UserInfoView;
