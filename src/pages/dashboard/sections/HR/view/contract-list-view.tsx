import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CustomTable } from "../../../../components/Table";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { getExpiringContracts } from "../../../../../services/contract.service";
import { selectContract } from "../../../../../redux/employee/contract.slice";
import { Employee } from "../../../../../data/employee/employee";
import {
  Contract,
  ContractStatus,
} from "../../../../../data/employer/contract";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { selectAuth } from "../../../../../redux/auth/auth.slice";
import { UserPermission } from "../../../../../data/auth/role";
import { useRouter } from "../../../../../routes/hooks/useRouter";

function ContractListView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { contracts, totalCount, isLoading } = useAppSelector(selectContract);
  const { user } = useAppSelector(selectAuth);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    dispatch(getExpiringContracts({ days: 30 }));
  }, [dispatch]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const handleView = (employee: Employee) => {
    router.push(`/dashboard/employee/contract/${employee.employeeId}`);
  };

  const handleEdit = (employee: Employee) => {
    console.log("Edit employee:", employee);
    // Add your edit logic here
  };

  const handleDelete = (employee: Employee) => {
    console.log("Delete employee:", employee);
    // Add your delete logic here
  };

  const getContractExpiryDays = (employee: Employee): number | null => {
    if (!employee.contracts || employee.contracts.length === 0) return null;

    const activeContract = employee.contracts.find(
      (c) => c.status === ContractStatus.ACTIVE
    );

    if (!activeContract || !activeContract.endDate) return null;

    const endDate = new Date(activeContract.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const columns = [
    {
      field: "fullName",
      headerName: "Employee Name",
      flex: 1.5,
      minWidth: 180,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: "position",
      headerName: "Position",
      flex: 1,
      minWidth: 150,
      valueGetter: (value: any, row: any) => {
        return row?.positionEntity?.name || row?.position || "N/A";
      },
    },
    {
      field: "contractType",
      headerName: "Contract Type",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "contractEndDate",
      headerName: "Contract End Date",
      flex: 1.2,
      minWidth: 150,
      valueGetter: (value: any, row: any) => {
        const activeContract = row.contracts?.find(
          (c: Contract) => c.status === ContractStatus.ACTIVE
        );
        return activeContract?.endDate
          ? new Date(activeContract.endDate).toLocaleDateString()
          : "N/A";
      },
    },
    {
      field: "daysToExpiry",
      headerName: "Days to Expiry",
      flex: 1,
      minWidth: 130,
      renderCell: (params: any) => {
        const employee = params.row as Employee;
        const days = getContractExpiryDays(employee);

        if (days === null) return "N/A";

        let color: "error" | "warning" | "success" = "success";
        if (days <= 7) color = "error";
        else if (days <= 30) color = "warning";

        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Chip label={`${days} days`} color={color} size="small" />
          </Box>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 140,
      sortable: false,
      renderCell: (params: any) => {
        const employee = params.row as Employee;

        // Check permissions
        const contractPermission = user?.role?.permissions?.find(
          (p) => p.permission === UserPermission.CONTRACT_MANAGEMENT
        );

        const canView = contractPermission?.canView || false;
        const canUpdate = contractPermission?.canUpdate || false;
        const canDelete = contractPermission?.canDelete || false;

        return (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              height: "100%",
            }}
          >
            {canView && (
              <Tooltip title="View Contracts" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleView(employee)}
                  sx={{
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
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                  }}
                >
                  <EditIcon fontSize="small" />
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

  // Filter out terminated contracts

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
        <Typography variant="h5" fontWeight={600}>
          Expiring Contracts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Showing contracts expiring within 30 days
        </Typography>
      </Box>
      <CustomTable
        onPaginationChange={handlePaginationChange}
        paginationModel={paginationModel}
        paginationMode="client"
        loading={isLoading}
        sx={{ padding: "2" }}
        columns={columns}
        rows={contracts}
        getRowId={(row) => row.employeeId || row.id}
      />
    </Paper>
  );
}

export default ContractListView;
