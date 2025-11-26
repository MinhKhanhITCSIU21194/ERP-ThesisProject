import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Autocomplete,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectProject } from "../../../../../redux/project/project.slice";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import {
  getProjectById,
  createProject,
  updateProject,
  getSprintsByProject,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../../../../../services/project.service";
import {
  ProjectStatus,
  ProjectPriority,
  CreateProjectData,
  CreateSprintData,
  UpdateSprintData,
  Sprint,
  SprintStatus,
  ProjectMemberRole,
  ProjectMember,
  Project,
} from "../../../../../data/project/project";
import { paths } from "../../../../../routes/paths";
import SprintListView from "./sprint-list-view";
import dayjs, { Dayjs } from "dayjs";
import CustomDatePicker from "../../../../components/DatePicker";
import { UserPermission } from "../../../../../data/auth/role";
import { Employee } from "../../../../../data/employee/employee";
import {
  getEmployeesByDepartment,
  getEmployeeById,
} from "../../../../../services/employee/employee.service";

function ProjectDetailsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(selectAuth);
  const { currentProject, sprints, isLoading, error, success } =
    useAppSelector(selectProject);

  const isEditMode = !!id && id !== "create";

  // Form state
  const [formData, setFormData] = useState<CreateProjectData>({
    name: "",
    description: "",
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    startDate: "",
    endDate: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSprintDialog, setShowSprintDialog] = useState(false);
  const [sprintFormData, setSprintFormData] = useState<CreateSprintData>({
    name: "",
    goal: "",
    projectId: id || "",
    startDate: "",
    endDate: "",
    status: SprintStatus.PLANNED,
  });
  // Debounced draft for sprint form: user types into draft, and after delay we apply to sprintFormData
  const [sprintDraft, setSprintDraft] =
    useState<CreateSprintData>(sprintFormData);
  const [sprintDebounceTimer, setSprintDebounceTimer] = useState<number | null>(
    null
  );

  // Member management state
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<ProjectMemberRole>(
    ProjectMemberRole.DEVELOPER
  );
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [userDepartment, setUserDepartment] = useState<string>("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>("");

  // Load project data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getProjectById(id));
      dispatch(getSprintsByProject({ projectId: id, limit: 100 }));
    }
  }, [dispatch, id, isEditMode]);

  // Initialize sprint draft each time the dialog opens
  useEffect(() => {
    if (showSprintDialog) {
      setSprintDraft(sprintFormData);
    }
  }, [showSprintDialog]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (sprintDebounceTimer) {
        clearTimeout(sprintDebounceTimer);
      }
    };
  }, [sprintDebounceTimer]);

  // Load employees from project manager's department
  useEffect(() => {
    const loadDepartmentEmployees = async () => {
      // In edit mode, use project manager's department
      if (isEditMode && currentProject?.projectManager?.employeeId) {
        try {
          console.log(
            "Fetching project manager data:",
            currentProject.projectManager.employeeId
          );
          const managerData = await getEmployeeById(
            currentProject.projectManager.employeeId
          );
          console.log("Manager data received:", managerData);

          if (managerData.success && managerData.data.departments?.[0]) {
            const department = managerData.data.departments[0].department.name;
            console.log("Manager's department:", department);
            setUserDepartment(department);

            // Load employees from manager's department
            console.log("Fetching employees from department:", department);
            const response = await getEmployeesByDepartment({
              department,
              pageSize: 100,
            });
            console.log("Employees fetched:", response);
            setAvailableEmployees(response.data);
          }
        } catch (error) {
          console.error("Error loading manager's department employees:", error);
        }
      }
      // In create mode, use current user's department
      else if (!isEditMode && user?.employeeID) {
        try {
          console.log("Fetching employee data for:", user.employeeID);
          const employeeData = await getEmployeeById(user.employeeID);
          console.log("Employee data received:", employeeData);

          if (employeeData.success && employeeData.data.departments?.[0]) {
            const department = employeeData.data.departments[0].department.name;
            console.log("User department:", department);
            setUserDepartment(department);

            // Load initial employees
            console.log("Fetching employees from department:", department);
            const response = await getEmployeesByDepartment({
              department,
              pageSize: 100,
            });
            console.log("Employees fetched:", response);
            setAvailableEmployees(response.data);
          } else {
            console.warn("No department found for user");
          }
        } catch (error) {
          console.error("Error loading employees:", error);
        }
      }
    };
    loadDepartmentEmployees();
  }, [user?.employeeID, isEditMode, currentProject?.projectManager]);

  // Fetch employees when search term or department changes (with debounce)
  useEffect(() => {
    if (!userDepartment) return;

    const timer = setTimeout(async () => {
      try {
        const response = await getEmployeesByDepartment({
          department: userDepartment,
          pageSize: 100,
          search: employeeSearchTerm || undefined,
        });
        setAvailableEmployees(response.data);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [userDepartment, employeeSearchTerm]);

  // Populate form when project data is loaded
  useEffect(() => {
    if (isEditMode && currentProject && currentProject.projectId === id) {
      setFormData({
        name: currentProject.name,
        description: currentProject.description || "",
        status: currentProject.status,
        priority: currentProject.priority,
        startDate: currentProject.startDate
          ? new Date(currentProject.startDate).toISOString().split("T")[0]
          : "",
        endDate: currentProject.endDate
          ? new Date(currentProject.endDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [currentProject, id, isEditMode]);

  // Separate effect to sync project members from Redux state
  useEffect(() => {
    if (isEditMode && currentProject && currentProject.projectId === id) {
      // Always sync members from currentProject
      if (currentProject.members) {
        const activeMembers = currentProject.members;
        setProjectMembers(activeMembers);
      } else {
        setProjectMembers([]);
      }
    }
  }, [currentProject, id, isEditMode]);

  // Navigate back to list on success
  useEffect(() => {
    if (success && !isEditMode) {
      setTimeout(() => {
        navigate(paths.project.list);
      }, 1500);
    }
  }, [success, isEditMode, navigate]);

  const handleInputChange = (field: keyof CreateProjectData, value: string) => {
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

    if (!formData.name.trim()) {
      errors.name = "Project name is required";
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
    if (!validateForm()) return;

    try {
      const submitData: CreateProjectData = {
        ...formData,
        members: projectMembers.map((m) => ({
          employeeId: m.employeeId,
          role: m.role,
        })),
      };

      if (isEditMode && id) {
        const result = await dispatch(updateProject({ id, data: submitData }));
        if (result.meta.requestStatus === "fulfilled") {
          // Immediately update local members from response
          // result.payload may be a Project object or a string (error)
          const updatedMembers =
            result.payload &&
            typeof result.payload === "object" &&
            "members" in result.payload
              ? (result.payload as any).members
              : undefined;
          if (Array.isArray(updatedMembers)) {
            setProjectMembers(updatedMembers);
          }
          // Optionally refresh project data in Redux
          dispatch(getProjectById(id));
        }
      } else {
        await dispatch(createProject(submitData));
      }
    } catch (error) {
      console.error("Error submitting project:", error);
    }
  };

  const handleSprintCreate = async () => {
    // ensure latest draft is applied before creating
    if (!sprintDraft.name.trim()) return;
    if (!isEditMode || !id) return;

    // clear any pending timer and apply draft immediately
    if (sprintDebounceTimer) {
      clearTimeout(sprintDebounceTimer);
      setSprintDebounceTimer(null);
    }
    setSprintFormData(sprintDraft);

    await dispatch(
      createSprint({
        ...sprintDraft,
        projectId: id,
      })
    );

    // Reset form and close dialog
    setSprintFormData({
      name: "",
      goal: "",
      projectId: id,
      startDate: "",
      endDate: "",
      status: SprintStatus.PLANNED,
    });
    setSprintDraft({
      name: "",
      goal: "",
      projectId: id,
      startDate: "",
      endDate: "",
      status: SprintStatus.PLANNED,
    });
    setShowSprintDialog(false);

    // Refresh sprints
    dispatch(getSprintsByProject({ projectId: id, limit: 100 }));
  };

  const handleSprintEdit = (sprint: Sprint) => {
    // TODO: Implement sprint edit dialog
    console.log("Edit sprint:", sprint);
  };

  const handleSprintDelete = async (sprint: Sprint) => {
    if (
      window.confirm(`Are you sure you want to delete sprint "${sprint.name}"?`)
    ) {
      await dispatch(deleteSprint(sprint.sprintId));
      if (id) {
        dispatch(getSprintsByProject({ projectId: id, limit: 100 }));
      }
    }
  };

  const handleAddMember = () => {
    if (!selectedEmployee) return;

    // Find the employee object from availableEmployees
    const employee = availableEmployees.find(
      (e) => e.employeeId === selectedEmployee
    );
    if (!employee) return;

    // Check if employee is already a member
    const isAlreadyMember = projectMembers.some(
      (m) => m.employeeId === selectedEmployee
    );

    if (isAlreadyMember) {
      alert("This employee is already a member of the project");
      return;
    }

    // For display purposes only - projectId will be set properly when saving
    const newMember: ProjectMember = {
      memberId: `temp-${Date.now()}`,
      projectId: id || currentProject?.projectId || "",
      employeeId: employee.employeeId || "",
      employee: {
        employeeId: employee.employeeId || "",
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
      },
      role: selectedRole,
      joinedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjectMembers([...projectMembers, newMember]);
    setSelectedEmployee("");
    setSelectedRole(ProjectMemberRole.DEVELOPER);
  };

  const handleRemoveMember = (memberId: string) => {
    setProjectMembers(projectMembers.filter((m) => m.memberId !== memberId));
  };

  // Check permissions
  const projectPermission = user?.role?.permissions?.find(
    (p) => p.permission === UserPermission.PROJECT_MANAGEMENT
  );

  const canCreate = projectPermission?.canCreate || false;
  const canUpdate = projectPermission?.canUpdate || false;
  const canDelete = projectPermission?.canDelete || false;

  if (isLoading && isEditMode) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && isEditMode) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          {isEditMode ? "Edit Project" : "Create New Project"}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Project {isEditMode ? "updated" : "created"} successfully!
          </Alert>
        )}

        {/* Project Form */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Project Name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={isEditMode && !canUpdate}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isEditMode && !canUpdate}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                handleInputChange("status", e.target.value as ProjectStatus)
              }
              disabled={isEditMode && !canUpdate}
            >
              {Object.values(ProjectStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace("_", " ")}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) =>
                handleInputChange("priority", e.target.value as ProjectPriority)
              }
              disabled={isEditMode && !canUpdate}
            >
              {Object.values(ProjectPriority).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              label="Start Date"
              value={formData.startDate ? dayjs(formData.startDate) : null}
              onChange={(newVal: Dayjs | null) =>
                handleInputChange(
                  "startDate",
                  newVal ? newVal.format("YYYY-MM-DD") : ""
                )
              }
              disabled={isEditMode && !canUpdate}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomDatePicker
              label="End Date"
              value={formData.endDate ? dayjs(formData.endDate) : null}
              onChange={(newVal: Dayjs | null) =>
                handleInputChange(
                  "endDate",
                  newVal ? newVal.format("YYYY-MM-DD") : ""
                )
              }
              disabled={isEditMode && !canUpdate}
              required={false}
              error={!!formErrors.endDate}
              helperText={formErrors.endDate}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Project Members
            </Typography>

            {/* Add Member Section */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <Autocomplete
                sx={{ flex: 1, minWidth: 250 }}
                size="small"
                options={availableEmployees}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName} - ${option.email}`
                }
                value={
                  availableEmployees.find(
                    (e) => e.employeeId === selectedEmployee
                  ) || null
                }
                onChange={(_, newValue) =>
                  setSelectedEmployee(newValue?.employeeId || "")
                }
                onInputChange={(_, newInputValue) => {
                  setEmployeeSearchTerm(newInputValue);
                }}
                disabled={isEditMode && !canUpdate}
                filterOptions={(x) => x}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Employee"
                    placeholder="Type to search..."
                  />
                )}
              />

              <TextField
                select
                label="Role"
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as ProjectMemberRole)
                }
                sx={{ minWidth: 200 }}
                size="small"
                disabled={isEditMode && !canUpdate}
              >
                {Object.values(ProjectMemberRole).map((role) => (
                  <MenuItem key={role} value={role}>
                    {role.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddMember}
                disabled={!selectedEmployee || (isEditMode && !canUpdate)}
              >
                Add Member
              </Button>
            </Box>

            {/* Members List */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 1,
                minHeight: 100,
              }}
            >
              {projectMembers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No members added yet
                </Typography>
              ) : (
                projectMembers.map((member) => (
                  <Chip
                    key={member.memberId}
                    label={`${member.employee?.firstName} ${
                      member.employee?.lastName
                    } - ${member.role.replace(/_/g, " ")}`}
                    onDelete={
                      canUpdate || !isEditMode
                        ? () => handleRemoveMember(member.memberId)
                        : undefined
                    }
                    deleteIcon={<CloseIcon />}
                    color="primary"
                    variant="outlined"
                  />
                ))
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => navigate(paths.project.list)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  (isEditMode && !canUpdate) ||
                  (!isEditMode && !canCreate)
                }
              >
                {isEditMode ? "Update Project" : "Create Project"}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Sprints Section - Only show in edit mode */}
        {isEditMode && (
          <>
            <Divider sx={{ my: 4 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sprints
              </Typography>
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowSprintDialog(true)}
                  size="small"
                >
                  Add Sprint
                </Button>
              )}
            </Box>

            {/* Sprint Creation Form */}
            {showSprintDialog && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  New Sprint
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sprint Name"
                      required
                      value={sprintDraft.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSprintDraft((prev) => ({ ...prev, name: value }));
                        if (sprintDebounceTimer)
                          clearTimeout(sprintDebounceTimer);
                        setSprintDebounceTimer(
                          window.setTimeout(() => {
                            setSprintFormData((prev) => ({
                              ...prev,
                              name: value,
                            }));
                            setSprintDebounceTimer(null);
                          }, 2500)
                        );
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sprint Goal"
                      value={sprintDraft.goal}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSprintDraft((prev) => ({ ...prev, goal: value }));
                        if (sprintDebounceTimer)
                          clearTimeout(sprintDebounceTimer);
                        setSprintDebounceTimer(
                          window.setTimeout(() => {
                            setSprintFormData((prev) => ({
                              ...prev,
                              goal: value,
                            }));
                            setSprintDebounceTimer(null);
                          }, 2500)
                        );
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomDatePicker
                      label="Start Date"
                      value={
                        sprintDraft.startDate
                          ? dayjs(sprintDraft.startDate)
                          : null
                      }
                      onChange={(newVal: Dayjs | null) => {
                        const value = newVal ? newVal.format("YYYY-MM-DD") : "";
                        setSprintDraft((prev) => ({
                          ...prev,
                          startDate: value,
                        }));
                        if (sprintDebounceTimer)
                          clearTimeout(sprintDebounceTimer);
                        setSprintDebounceTimer(
                          window.setTimeout(() => {
                            setSprintFormData((prev) => ({
                              ...prev,
                              startDate: value,
                            }));
                            setSprintDebounceTimer(null);
                          }, 2500)
                        );
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomDatePicker
                      label="End Date"
                      value={
                        sprintDraft.endDate ? dayjs(sprintDraft.endDate) : null
                      }
                      onChange={(newVal: Dayjs | null) => {
                        const value = newVal ? newVal.format("YYYY-MM-DD") : "";
                        setSprintDraft((prev) => ({ ...prev, endDate: value }));
                        if (sprintDebounceTimer)
                          clearTimeout(sprintDebounceTimer);
                        setSprintDebounceTimer(
                          window.setTimeout(() => {
                            setSprintFormData((prev) => ({
                              ...prev,
                              endDate: value,
                            }));
                            setSprintDebounceTimer(null);
                          }, 2500)
                        );
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        size="small"
                        onClick={() => {
                          if (sprintDebounceTimer) {
                            clearTimeout(sprintDebounceTimer);
                            setSprintDebounceTimer(null);
                          }
                          setShowSprintDialog(false);
                          setSprintFormData({
                            name: "",
                            goal: "",
                            projectId: id || "",
                            startDate: "",
                            endDate: "",
                            status: SprintStatus.PLANNED,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleSprintCreate}
                        disabled={!sprintDraft.name.trim()}
                      >
                        Create Sprint
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Sprint List */}
            <SprintListView
              sprints={sprints}
              onEdit={canUpdate ? handleSprintEdit : undefined}
              onDelete={canDelete ? handleSprintDelete : undefined}
              canEdit={canUpdate}
              canDelete={canDelete}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}

export default ProjectDetailsView;
