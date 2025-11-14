import { Box, Chip, IconButton, Paper, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomTable } from "../../../../components/Table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectUser } from "../../../../../redux/admin/users.slice";
import { User } from "../../../../../data/auth/auth";
import DeleteIcon from "@mui/icons-material/Delete";

import { UserPermission } from "../../../../../data/auth/role";
import EditIcon from "@mui/icons-material/Edit";

import { GridRowSelectionModel } from "@mui/x-data-grid";
import { getUserList } from "../../../../../services/auth/users.service";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import CustomButton from "../../../../components/Button";
import CustomSearchField from "../../../../components/SearchBar.tsx";

function UserListView() {
  const { users, totalCount, isLoading } = useAppSelector(selectUser);
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("view");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userList, setUserList] = React.useState<User[]>([]);

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); // Reset to first page on search
  };

  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });

  // Fetch users when pagination or search changes
  useEffect(() => {
    dispatch(
      getUserList({
        pageIndex: paginationModel.page,
        pageSize: paginationModel.pageSize,
        search: searchTerm,
      })
    );
  }, [dispatch, paginationModel.page, paginationModel.pageSize, searchTerm]);

  const onSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
  };
  const handleView = (user: User) => {
    setSelectedUser(user);
    setModalMode("view");
    setModalOpen(true);
  };
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveEmployee = (user: User) => {
    console.log("Save employee:", user);
    // Add your save logic here
    handleCloseModal();
  };
  const handleAddNewUser = () => {
    setModalMode("add");
    setSelectedUser(null);
    setModalOpen(true);
  };
  const handleDeleteSelected = () => {
    console.log("Delete selected employees:", userList);
  };

  const handleDelete = async (user: User) => {
    console.log("Delete user:", user);
    // Add your delete logic here
  };
  const columns = [
    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 120,
      valueGetter: (value: any, row: any) => row?.role?.name || "N/A",
    },
    {
      field: "isEmailVerified",
      headerName: "Email Verified",
      flex: 0.8,
      minWidth: 130,
      renderCell: (params: any) => {
        if (params.row.isEmailVerified == true) {
          return <Chip label="Verified" color="success" size="small" />;
        } else {
          return <Chip label="Unverified" color="warning" size="small" />;
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 140,
      sortable: false,
      renderCell: (params: any) => {
        const RowUser = params.row as User;

        // Check permissions
        const userPermission = user?.role?.permissions?.find(
          (p) => p.permission === UserPermission.USER_MANAGEMENT
        );

        const canView = userPermission?.canView || false;
        const canUpdate = userPermission?.canUpdate || false;
        const canDelete = userPermission?.canDelete || false;

        return (
          <Box sx={{ display: "inline-flex", gap: 0.5 }}>
            {canView && (
              <Tooltip title="View Details" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleView(RowUser)}
                  sx={{
                    top: 5,
                    "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.1)" },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canUpdate && (
              <Tooltip title="Edit User" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(RowUser)}
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
              <Tooltip title="Delete User" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(RowUser)}
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <CustomSearchField
          placeholder="Search users..."
          onSearch={handleSearch}
        />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <CustomButton
            requiredPermission={UserPermission.EMPLOYEE_MANAGEMENT}
            requiredAction="canCreate"
            userPermissions={user?.role?.permissions || []}
            content="Add New"
            variant="contained"
            color="primary"
            onClick={handleAddNewUser}
          />
          <CustomButton
            requiredPermission={UserPermission.EMPLOYEE_MANAGEMENT}
            requiredAction="canImport"
            userPermissions={user?.role?.permissions || []}
            content="Import"
            variant="outlined"
            color="primary"
            onClick={() => {}}
          />
          <CustomButton
            requiredPermission={UserPermission.EMPLOYEE_MANAGEMENT}
            requiredAction="canExport"
            userPermissions={user?.role?.permissions || []}
            content="Export"
            variant="outlined"
            color="primary"
            onClick={() => {}}
          />
          <CustomButton
            requiredPermission={UserPermission.EMPLOYEE_MANAGEMENT}
            requiredAction="canDelete"
            userPermissions={user?.role?.permissions || []}
            content="Delete Selected"
            variant="contained"
            color="error"
            onClick={handleDeleteSelected}
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
        rows={users.map((user) => ({ ...user, id: user.userId }))}
      />
    </Paper>
  );
}

export default UserListView;
