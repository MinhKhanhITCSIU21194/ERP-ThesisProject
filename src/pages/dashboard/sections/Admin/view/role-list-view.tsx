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
  FormControlLabel,
  Checkbox,
  Grid,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomTable } from "../../../../components/Table";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectRole } from "../../../../../redux/auth/role.slice";
import {
  Role,
  Permission,
  UserPermission,
} from "../../../../../data/auth/role";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import {
  getRoleList,
  updateRole,
  deleteRole,
  createRole,
  getAllPermissions,
} from "../../../../../services/auth/role.service";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import CustomButton from "../../../../components/Button";

function RoleListView() {
  const { roles, totalCount, isLoading, permissions } =
    useAppSelector(selectRole);
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "add">("edit");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as Permission[],
  });
  const [error, setError] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });

  // Fetch roles and permissions on mount
  useEffect(() => {
    dispatch(
      getRoleList({
        pageIndex: paginationModel.page,
        pageSize: paginationModel.pageSize,
      })
    );
    dispatch(getAllPermissions());
  }, [dispatch, paginationModel.page, paginationModel.pageSize]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const onSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setModalMode("edit");
    setModalOpen(true);
    setError(null);
  };

  const handleAddNew = () => {
    setSelectedRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setModalMode("add");
    setModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRole(null);
    setError(null);
  };

  const handleSaveRole = async () => {
    try {
      setError(null);

      if (!formData.name.trim()) {
        setError("Role name is required");
        return;
      }

      const permissionIds = formData.permissions
        .filter((p) => p.id)
        .map((p) => parseInt(p.id as string));

      if (modalMode === "edit" && selectedRole) {
        await dispatch(
          updateRole({
            roleId: selectedRole.id,
            roleData: {
              name: formData.name,
              description: formData.description,
              permissionIds,
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          createRole({
            name: formData.name,
            description: formData.description,
            permissionIds,
          })
        ).unwrap();
      }

      handleCloseModal();
      dispatch(
        getRoleList({
          pageIndex: paginationModel.page,
          pageSize: paginationModel.pageSize,
        })
      );
    } catch (err: any) {
      setError(err || "Failed to save role");
    }
  };

  const handleDelete = async (role: Role) => {
    if (
      window.confirm(`Are you sure you want to delete the role "${role.name}"?`)
    ) {
      try {
        await dispatch(deleteRole(role.id)).unwrap();
        dispatch(
          getRoleList({
            pageIndex: paginationModel.page,
            pageSize: paginationModel.pageSize,
          })
        );
      } catch (err: any) {
        alert(err || "Failed to delete role");
      }
    }
  };

  const handlePermissionChange = (
    permission: Permission,
    field: string,
    value: boolean
  ) => {
    setFormData((prev) => {
      const existingPermIndex = prev.permissions.findIndex(
        (p) => p.permission === permission.permission
      );

      let updatedPermissions = [...prev.permissions];

      if (existingPermIndex >= 0) {
        updatedPermissions[existingPermIndex] = {
          ...updatedPermissions[existingPermIndex],
          [field]: value,
        };
      } else {
        updatedPermissions.push({
          ...permission,
          [field]: value,
        });
      }

      return { ...prev, permissions: updatedPermissions };
    });
  };

  const getPermissionValue = (
    permissionName: string,
    field: string
  ): boolean => {
    const perm = formData.permissions.find(
      (p) => p.permission === permissionName
    );
    return perm ? (perm[field as keyof Permission] as boolean) || false : false;
  };

  const isAllPermissionFieldsChecked = (permissionName: string): boolean => {
    return permissionFields.every((field) =>
      getPermissionValue(permissionName, field.key)
    );
  };

  const handleSelectAllPermissionFields = (
    permission: Permission,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const updatedPermissions = [...prev.permissions];
      const existingPermIndex = updatedPermissions.findIndex(
        (p) => p.permission === permission.permission
      );

      const newPermission = {
        ...permission,
        canView: checked,
        canCreate: checked,
        canUpdate: checked,
        canDelete: checked,
        canApprove: checked,
        canReject: checked,
        canAssign: checked,
        canImport: checked,
        canExport: checked,
      };

      if (existingPermIndex >= 0) {
        updatedPermissions[existingPermIndex] = newPermission;
      } else {
        updatedPermissions.push(newPermission);
      }

      return { ...prev, permissions: updatedPermissions };
    });
  };

  const columns = [
    {
      field: "name",
      headerName: "Role Name",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "userCount",
      headerName: "Number of Employees",
      flex: 1,
      minWidth: 150,
      align: "center" as const,
      headerAlign: "center" as const,
      valueGetter: (value: any, row: any) => {
        return row.users?.length || 0;
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 120,
      sortable: false,
      renderCell: (params: any) => {
        const role = params.row as Role;

        // Check permissions
        const rolePermission = user?.role?.permissions?.find(
          (p) => p.permission === UserPermission.ROLE_MANAGEMENT
        );

        const canUpdate = rolePermission?.canUpdate || false;
        const canDelete = rolePermission?.canDelete || false;

        return (
          <Box sx={{ display: "inline-flex", gap: 0.5 }}>
            {canUpdate && (
              <Tooltip title="Edit Role" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(role)}
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
              <Tooltip title="Delete Role" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(role)}
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

  // Permission fields configuration
  const permissionFields = [
    { key: "canView", label: "View" },
    { key: "canCreate", label: "Create" },
    { key: "canUpdate", label: "Update" },
    { key: "canDelete", label: "Delete" },
    { key: "canApprove", label: "Approve" },
    { key: "canReject", label: "Reject" },
    { key: "canAssign", label: "Assign" },
    { key: "canImport", label: "Import" },
    { key: "canExport", label: "Export" },
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
              requiredPermission={UserPermission.ROLE_MANAGEMENT}
              requiredAction="canCreate"
              userPermissions={user?.role?.permissions || []}
              content="Add New Role"
              variant="contained"
              color="primary"
              onClick={handleAddNew}
            />
          </Box>
        </Box>
        <CustomTable
          onSelectionChange={onSelectionChange}
          onPaginationChange={handlePaginationChange}
          paginationModel={paginationModel}
          paginationMode="server"
          rowCount={totalCount}
          loading={isLoading}
          sx={{ padding: "2" }}
          columns={columns}
          rows={roles.map((role) => ({ ...role, id: role.roleId || role.id }))}
        />
      </Paper>

      {/* Edit/Add Role Modal */}
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
          {modalMode === "edit" ? "Edit Role" : "Add New Role"}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={2}
            />
          </Box>

          <Typography variant="h6" gutterBottom>
            Permissions
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {permissions.map((permission) => (
            <Box key={permission.permission} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ flex: 1 }}
                >
                  {permission.name || permission.permission}
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAllPermissionFieldsChecked(
                        permission.permission
                      )}
                      onChange={(e) =>
                        handleSelectAllPermissionFields(
                          permission,
                          e.target.checked
                        )
                      }
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      color="primary"
                      fontWeight="medium"
                    >
                      Select All
                    </Typography>
                  }
                  sx={{ mr: 0 }}
                />
              </Box>
              <Grid container spacing={1}>
                {permissionFields.map((field) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={field.key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={getPermissionValue(
                            permission.permission,
                            field.key
                          )}
                          onChange={(e) =>
                            handlePermissionChange(
                              permission,
                              field.key,
                              e.target.checked
                            )
                          }
                          size="small"
                        />
                      }
                      label={field.label}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RoleListView;
