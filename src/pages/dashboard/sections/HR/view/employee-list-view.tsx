import React, { useEffect, useMemo } from "react";
import { CustomTable } from "../../../../components/Table";
import {
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Box,
  Button,
} from "@mui/material";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { getEmployeeList } from "../../../../../services/employee";
import { selectEmployee } from "../../../../../redux/auth/employee.slice";
import { Employee } from "../../../../../data/employee/employee";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function EmployeeListView() {
  const { employees, totalCount, isLoading } = useAppSelector(selectEmployee);
  const dispatch = useAppDispatch();

  // State for pagination
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 10,
  });

  // State for selection
  const [selectionModel, setSelectionModel] =
    React.useState<GridRowSelectionModel>({
      type: "include",
      ids: new Set(),
    });

  // Fetch employees when pagination changes
  useEffect(() => {
    dispatch(
      getEmployeeList({
        pageIndex: paginationModel.page, // page becomes pageIndex
        pageSize: paginationModel.pageSize,
      })
    );
  }, [dispatch, paginationModel.page, paginationModel.pageSize]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const onSelectionChange = (newSelectionModel: GridRowSelectionModel) => {
    setSelectionModel(newSelectionModel);
  };

  // Action handlers
  const handleView = (employee: Employee) => {
    console.log("View employee:", employee);
    // Add your view logic here
  };

  const handleEdit = (employee: Employee) => {
    console.log("Edit employee:", employee);
    // Add your edit logic here
  };

  const handleDelete = (employee: Employee) => {
    console.log("Delete employee:", employee);
    // Add your delete logic here
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

    console.log("Selected Employees:", arr);
    return arr;
  }, [selectionModel.ids.size, selectionModel.type, employees]);

  const columns = [
    { field: "firstName", headerName: "First Name", width: 200 },
    { field: "lastName", headerName: "Last Name", width: 200 },
    {
      field: "position",
      headerName: "Position",
      width: 200,
      valueGetter: (value: any, row: any) => {
        // DataGrid valueGetter receives (value, row) as parameters
        return row?.positionEntity?.name || row?.position || "N/A";
      },
    },
    {
      field: "department",
      headerName: "Departments",
      width: 200,
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
    { field: "email", headerName: "Email", width: 250 },
    { field: "phoneNumber", headerName: "Phone Number", width: 150 },
    { field: "employmentStatus", headerName: "Employment Status", width: 160 },
    { field: "contractType", headerName: "Contract Type", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params: any) => {
        const employee = params.row as Employee;
        return (
          <Box sx={{ display: "inline-flex", gap: 0.5 }}>
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
          </Box>
        );
      },
    },
  ];

  return (
    <Paper
      sx={{
        p: 3,
        m: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "inline-flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary">
          Add New Employee
        </Button>
        <Button variant="outlined" color="secondary" sx={{ ml: 2 }}>
          Export
        </Button>
        <Button variant="outlined" color="secondary" sx={{ ml: 2 }}>
          Import
        </Button>
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
        rows={employees || []}
      />
    </Paper>
  );
}

export default EmployeeListView;
