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
import { getDepartmentList } from "../../../../../services/department.service";
import { selectDepartment } from "../../../../../redux/admin/department.slice";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import { Department } from "../../../../../data/employer/department";
import CustomButton from "../../../../components/Button";
import { UserPermission } from "../../../../../data/auth/role";
import { CustomTable } from "../../../../components/Table";

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
    console.log("Add new department");
    // Add your create logic here
  };

  const handleView = (department: Department) => {
    console.log("View department:", department);
    // Add your view logic here
  };

  const handleEdit = (department: Department) => {
    console.log("Edit department:", department);
    // Add your edit logic here
  };

  const handleDelete = (department: Department) => {
    console.log("Delete department:", department);
    // Add your delete logic here
  };

  const handleDeleteSelected = () => {
    console.log("Delete selected departments");
    // Add your bulk delete logic here
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
    </Paper>
  );
}

export default DepartmentListView;
