import React, { useEffect, useMemo, useState } from "react";
import { CustomTable } from "../../../../components/Table";
import {
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Button,
} from "@mui/material";
import EditDocumentIcon from "@mui/icons-material/EditDocument";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { getEmployeeList } from "../../../../../services/employee.service";
import { selectEmployee } from "../../../../../redux/employee/employee.slice";
import { Employee } from "../../../../../data/employee/employee";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import CustomButton from "../../../../components/Button";
import { Permission, UserPermission } from "../../../../../data/auth/role";
import EmployeeInfoView from "./employee/employee-info-view";
import { getDepartmentList } from "../../../../../services/department.service";
import { getPositionList } from "../../../../../services/position.service";
import { selectDepartment } from "../../../../../redux/admin/department.slice";
import { selectPosition } from "../../../../../redux/admin/position.slice";
import { FilterSearchField } from "../../../../components/FilterSearchField";
import { useRouter } from "../../../../../routes/hooks/useRouter";

function EmployeeListView() {
  const router = useRouter();
  const { user } = useAppSelector(selectAuth);
  const { employees, totalCount, isLoading } = useAppSelector(selectEmployee);
  const { departments } = useAppSelector(selectDepartment);
  const { positions } = useAppSelector(selectPosition);
  const dispatch = useAppDispatch();
  const [employeeList, setEmployeeList] = React.useState<Employee[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "add">("view");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  // State for pagination
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<string | null>(null);

  // State for selection
  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    setDepartmentFilter(departmentId);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const handlePositionChange = (positionId: string | null) => {
    setPositionFilter(positionId);
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Fetch departments and positions on mount
  useEffect(() => {
    dispatch(getDepartmentList());
    dispatch(getPositionList());
  }, [dispatch]);

  // Fetch employees when pagination or filters change
  useEffect(() => {
    const params: any = {
      pageIndex: paginationModel.page,
      pageSize: paginationModel.pageSize,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }
    if (departmentFilter) {
      params.department = departmentFilter;
    }
    if (positionFilter) {
      params.position = positionFilter;
    }

    dispatch(getEmployeeList(params));
  }, [
    dispatch,
    paginationModel.page,
    paginationModel.pageSize,
    searchTerm,
    departmentFilter,
    positionFilter,
  ]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const onSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
  };

  const handleAddNewEmployee = () => {
    setSelectedEmployee(null);
    setModalMode("add");
    setModalOpen(true);
  };

  // Action handlers
  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("view");
    setModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSaveEmployee = (employee: Employee) => {
    console.log("Save employee:", employee);
    // Add your save logic here
    handleCloseModal();
  };

  const handleDeleteSelected = () => {
    console.log("Delete selected employees:", employeeList);
  };

  const handleDelete = async (employee: Employee) => {
    console.log("Delete employee:", employee);
    // Add your delete logic here
  };
  const importEmployees = (employees: Employee[]) => {
    console.log("Importing employees:", employees);
    // Add your import logic here
  };

  const exportEmployees = async () => {
    console.log("Exporting employees:", employeeList);
    // Add your export logic here
  };

  // Use useMemo to only recalculate when selection actually changes
  const selectedEmployees = useMemo(() => {
    let arr: Employee[] = [];
    const rowId = (item: Employee) => item.employeeId || item.id;

    if (selectionModel.type === "include") {
      arr =
        employees?.filter((item: Employee) =>
          selectionModel.ids.has(rowId(item))
        ) || [];
    } else if (selectionModel.type === "exclude") {
      arr =
        employees?.filter(
          (item: Employee) => !selectionModel.ids.has(rowId(item))
        ) || [];
    }
    setEmployeeList(arr);
  }, [selectionModel.ids.size, selectionModel.type, employees]);

  const columns = [
    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "position",
      headerName: "Position",
      flex: 1,
      minWidth: 130,
      valueGetter: (value: any, row: any) => {
        // DataGrid valueGetter receives (value, row) as parameters
        return row?.positionEntity?.name || row?.position || "N/A";
      },
    },
    {
      field: "department",
      headerName: "Departments",
      flex: 1.2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => {
        // DataGrid valueGetter receives (value, row) as parameters
        if (row?.departments && Array.isArray(row.departments)) {
          const activeDepts = row.departments
            .filter((ed: any) => ed.isActive && ed.isPrimary)
            .map((ed: any) => ed.department?.name || ed.department)
            .filter(Boolean);

          if (activeDepts.length > 0) {
            return activeDepts.join(", ");
          }
        }
        // Fallback to legacy department field
        return row?.department || "N/A";
      },
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "employmentStatus",
      headerName: "Employment Status",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "contractType",
      headerName: "Contract Type",
      flex: 1,
      minWidth: 130,
      valueGetter: (value: any, row: any) => {
        // Get the first contract (active contract will be first due to backend ordering)
        return row.contracts?.[0]?.contractType || "N/A";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params: any) => {
        const employee = params.row as Employee;

        // Check permissions
        const employeePermission = user?.role?.permissions?.find(
          (p) => p.permission === UserPermission.EMPLOYEE_MANAGEMENT
        );

        const canView = employeePermission?.canView || false;
        const canUpdate = employeePermission?.canUpdate || false;
        const canDelete = employeePermission?.canDelete || false;

        return (
          <Box sx={{ display: "inline-flex", gap: 0.5 }}>
            {canView && (
              <Tooltip title="View Details" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleView(employee)}
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
              <Tooltip title="Edit Employee" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(employee)}
                  sx={{
                    top: 5,
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canView && (
              <Tooltip title="Contract" arrow>
                <IconButton
                  size="small"
                  onClick={() =>
                    router.push(
                      `/dashboard/employee/contract/${employee.employeeId}`
                    )
                  }
                  sx={{
                    top: 5,
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                  }}
                >
                  <EditDocumentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete Employee" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(employee)}
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
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <FilterSearchField
            placeholder="Search employees..."
            onSearchChange={handleSearchChange}
            onDepartmentChange={handleDepartmentChange}
            onPositionChange={handlePositionChange}
            departments={departments.map((d) => ({ id: d.id, name: d.name }))}
            positions={positions.map((p) => ({ id: p.id, name: p.name }))}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <CustomButton
              requiredPermission={UserPermission.EMPLOYEE_MANAGEMENT}
              requiredAction="canCreate"
              userPermissions={user?.role?.permissions || []}
              content="Add New"
              variant="contained"
              color="primary"
              onClick={handleAddNewEmployee}
            />
            <CustomButton
              requiredPermission={UserPermission.EMPLOYEE_MANAGEMENT}
              requiredAction="canImport"
              userPermissions={user?.role?.permissions || []}
              content="Import"
              variant="outlined"
              color="primary"
              onClick={() => importEmployees(employeeList)}
            />
            <CustomButton
              requiredPermission={UserPermission.EMPLOYEE_MANAGEMENT}
              requiredAction="canExport"
              userPermissions={user?.role?.permissions || []}
              content="Export"
              variant="outlined"
              color="primary"
              onClick={exportEmployees}
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
          rowCount={totalCount || 0}
          loading={isLoading}
          sx={{ padding: "2" }}
          columns={columns}
          rows={employees}
        />
      </Paper>

      {/* Employee Info Modal */}
      <EmployeeInfoView
        open={modalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />
    </>
  );
}

export default EmployeeListView;
