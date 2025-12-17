import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Typography,
} from "@mui/material";
import { GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GroupIcon from "@mui/icons-material/Group";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import {
  getDepartmentList,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../../../../services/department.service";
import { selectDepartment } from "../../../../../redux/admin/department.slice";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import { Department } from "../../../../../data/employer/department";
import CustomButton from "../../../../components/Button";
import { UserPermission } from "../../../../../data/auth/role";
import { CustomTable } from "../../../../components/Table";
import DepartmentInfoView from "./department/department-info-view";
import ConfirmationDialog from "../../../../components/ConfirmationWindow";

function DepartmentListView() {
  const { user } = useAppSelector(selectAuth);
  const { departments, isLoading } = useAppSelector(selectDepartment);
  const dispatch = useAppDispatch();

  // State for pagination
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // State for selection
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  // State for expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("view");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);

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

  // Fetch departments on mount
  useEffect(() => {
    dispatch(getDepartmentList());
  }, [dispatch]);

  // Toggle expand/collapse for a department
  const toggleExpand = (departmentId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(departmentId)) {
        newSet.delete(departmentId);
      } else {
        newSet.add(departmentId);
      }
      return newSet;
    });
  };

  // Transform flat departments into tree structure
  const departmentTree = useMemo(() => {
    if (!departments || departments.length === 0) return [];

    // Create a map for quick lookup
    const deptMap = new Map<string, any>();
    const rootDepts: any[] = [];

    // First pass: create all department nodes
    departments.forEach((dept) => {
      deptMap.set(dept.id, {
        ...dept,
        hierarchy: [dept.id],
      });
    });

    // Second pass: build tree structure
    departments.forEach((dept) => {
      const deptNode = deptMap.get(dept.id);

      if (dept.parentId && dept.parentId !== "null" && dept.parentId !== null) {
        const parent = deptMap.get(dept.parentId);
        if (parent) {
          if (!parent.childrenDepartment) {
            parent.childrenDepartment = [];
          }
          // Update hierarchy
          deptNode.hierarchy = [...parent.hierarchy, dept.id];
          parent.childrenDepartment.push(deptNode);
        } else {
          // Parent not found, treat as root
          rootDepts.push(deptNode);
        }
      } else {
        // No parent, this is a root department
        rootDepts.push(deptNode);
      }
    });

    return rootDepts;
  }, [departments]);

  // Flatten tree with expand/collapse state
  const flattenedDepartments = useMemo(() => {
    const flattened: any[] = [];

    const flatten = (dept: any, level: number = 0) => {
      flattened.push({
        ...dept,
        level,
        hasChildren:
          dept.childrenDepartment && dept.childrenDepartment.length > 0,
        isExpanded: expandedRows.has(dept.id),
      });

      // Only show children if parent is expanded
      if (
        dept.childrenDepartment &&
        dept.childrenDepartment.length > 0 &&
        expandedRows.has(dept.id)
      ) {
        dept.childrenDepartment.forEach((child: any) => {
          flatten(child, level + 1);
        });
      }
    };

    departmentTree.forEach((dept) => flatten(dept));
    return flattened;
  }, [departmentTree, expandedRows]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const onSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
  };

  const handleAddNewDepartment = () => {
    setSelectedDepartment(null);
    setModalMode("add");
    setModalOpen(true);
  };

  const handleView = (department: Department) => {
    setSelectedDepartment(department);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (department: Department) => {
    setConfirmDialog({
      open: true,
      title: "Delete Department",
      message: `Are you sure you want to delete "${department.name}"? This will soft-delete the department.`,
      onConfirm: async () => {
        try {
          await dispatch(deleteDepartment(department.id)).unwrap();
          dispatch(getDepartmentList());
          alert("Department deleted successfully");
        } catch (error: any) {
          alert(`Failed to delete department: ${error}`);
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleDeleteSelected = () => {
    if (selectionModel.type === "include" && selectionModel.ids.size === 0) {
      alert("Please select departments to delete");
      return;
    }

    const selectedIds = Array.from(selectionModel.ids) as string[];
    const count =
      selectionModel.type === "include"
        ? selectedIds.length
        : flattenedDepartments.length - selectedIds.length;

    setConfirmDialog({
      open: true,
      title: "Delete Multiple Departments",
      message: `Are you sure you want to delete ${count} selected department(s)?`,
      onConfirm: async () => {
        try {
          const idsToDelete =
            selectionModel.type === "include"
              ? selectedIds
              : flattenedDepartments
                  .map((d) => d.id)
                  .filter((id) => !selectedIds.includes(id));

          await Promise.all(
            idsToDelete.map((id) => dispatch(deleteDepartment(id)).unwrap())
          );
          dispatch(getDepartmentList());
          alert(`${count} department(s) deleted successfully`);
        } catch (error: any) {
          alert(`Failed to delete departments: ${error}`);
        } finally {
          setConfirmDialog({ ...confirmDialog, open: false });
        }
      },
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleSaveDepartment = async (department: any) => {
    try {
      if (department.id) {
        // Update existing department
        await dispatch(
          updateDepartment({
            id: department.id,
            data: {
              name: department.name,
              managerId: department.managerId || undefined,
              parentId: department.parentId || null,
            },
          })
        ).unwrap();
        alert("Department updated successfully");
      } else {
        // Create new department
        await dispatch(
          createDepartment({
            name: department.name,
            managerId: department.managerId || undefined,
            parentId: department.parentId || null,
          })
        ).unwrap();
        alert("Department created successfully");
      }
      handleCloseModal();
      dispatch(getDepartmentList());
    } catch (error: any) {
      alert(`Failed to save department: ${error}`);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Department Name",
      flex: 2,
      minWidth: 250,
      renderCell: (params: any) => {
        const dept = params.row;
        const hasChildren = dept.hasChildren;
        const isExpanded = dept.isExpanded;
        const level = dept.level || 0;

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              paddingLeft: `${level * 24}px`,
              height: "100%",
            }}
          >
            {hasChildren ? (
              <IconButton
                size="small"
                onClick={() => toggleExpand(dept.id)}
                sx={{ mr: 1 }}
              >
                {isExpanded ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ChevronRightIcon fontSize="small" />
                )}
              </IconButton>
            ) : (
              <Box sx={{ width: 40 }} />
            )}
            <Typography
              variant="body2"
              sx={{ fontWeight: level === 0 ? 600 : 400 }}
            >
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "manager",
      headerName: "Manager",
      flex: 1.5,
      minWidth: 180,
      valueGetter: (value: any, row: any) => {
        if (row.manager) {
          return `${row.manager.firstName || ""} ${
            row.manager.lastName || ""
          }`.trim();
        }
        return "No Manager";
      },
    },
    {
      field: "employeeQuantity",
      headerName: "Employees",
      flex: 0.8,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            height: "100%",
          }}
        >
          <GroupIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {params?.row.employees?.length || 0}
          </Typography>
        </Box>
      ),
    },
    {
      field: "childrenDepartment",
      headerName: "Sub-Departments",
      flex: 1,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (value: any, row: any) => {
        return row.childrenDepartment?.length || 0;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 140,
      sortable: false,
      renderCell: (params: any) => {
        const department = params.row as Department;

        // Check permissions
        const departmentPermission = user?.role?.permissions?.find(
          (p) => p.permission === UserPermission.DEPARTMENT_MANAGEMENT
        );

        const canView = departmentPermission?.canView || false;
        const canUpdate = departmentPermission?.canUpdate || false;
        const canDelete = departmentPermission?.canDelete || false;

        return (
          <Box sx={{ display: "inline-flex", gap: 0.5 }}>
            {canView && (
              <Tooltip title="View Details" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleView(department)}
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
              <Tooltip title="Edit Department" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(department)}
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
              <Tooltip title="Delete Department" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(department)}
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
          justifyContent: "flex-end",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <CustomButton
            requiredPermission={UserPermission.DEPARTMENT_MANAGEMENT}
            requiredAction="canCreate"
            userPermissions={user?.role?.permissions || []}
            content="Add New"
            variant="contained"
            color="primary"
            onClick={handleAddNewDepartment}
          />
          <CustomButton
            requiredPermission={UserPermission.DEPARTMENT_MANAGEMENT}
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
        rows={flattenedDepartments}
        checkboxSelection={false}
        columns={columns}
        getRowId={(row: any) => row.id}
        paginationModel={paginationModel}
        onPaginationChange={handlePaginationChange}
        onSelectionChange={onSelectionChange}
        loading={isLoading}
        sx={{
          "& .MuiDataGrid-row": {
            cursor: "pointer",
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
        }}
      />

      {/* Department Info Modal */}
      <DepartmentInfoView
        open={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        department={selectedDepartment}
        onSave={handleSaveDepartment}
      />

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
    </Paper>
  );
}

export default DepartmentListView;
