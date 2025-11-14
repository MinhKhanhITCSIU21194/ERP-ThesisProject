import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { getContractsByEmployeeId } from "../../../../../../services/contract.service";
import { selectContract } from "../../../../../../redux/employee/contract.slice";
import { CustomTable } from "../../../../../components/Table";
import {
  Contract,
  ContractStatus,
} from "../../../../../../data/employer/contract";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { selectAuth } from "../../../../../../redux/auth/auth.slice";
import { UserPermission } from "../../../../../../data/auth/role";
import { selectEmployee } from "../../../../../../redux/employee/employee.slice";

function EmployeeContractView() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selectedEmployee } = useAppSelector(selectEmployee);
  const { contracts, selectedContracts, isLoading } =
    useAppSelector(selectContract);
  const { user } = useAppSelector(selectAuth);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    if (id) {
      dispatch(
        getContractsByEmployeeId({
          id,
          params: {
            pageIndex: paginationModel.page,
            pageSize: paginationModel.pageSize,
          },
        })
      );
    }
  }, [id, dispatch, paginationModel.page, paginationModel.pageSize]);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const handleView = (contract: Contract) => {
    console.log("View contract:", contract);
    // Add your view logic here
  };

  const handleEdit = (contract: Contract) => {
    console.log("Edit contract:", contract);
    // Add your edit logic here
  };

  const handleDelete = (contract: Contract) => {
    console.log("Delete contract:", contract);
    // Add your delete logic here
  };

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE:
        return "success";
      case ContractStatus.PENDING:
        return "warning";
      case ContractStatus.EXPIRED:
        return "error";
      case ContractStatus.TERMINATED:
        return "default";
      default:
        return "default";
    }
  };

  const columns = [
    {
      field: "contractNumber",
      headerName: "Contract Number",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "contractType",
      headerName: "Contract Type",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "workingType",
      headerName: "Working Type",
      flex: 1,
      minWidth: 130,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      minWidth: 120,
      valueGetter: (value: any) => {
        return value ? new Date(value).toLocaleDateString() : "N/A";
      },
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      minWidth: 120,
      valueGetter: (value: any) => {
        return value ? new Date(value).toLocaleDateString() : "N/A";
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: any) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Chip
            label={params.value}
            color={getStatusColor(params.value)}
            size="small"
          />
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 140,
      sortable: false,
      renderCell: (params: any) => {
        const contract = params.row as Contract;

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
              <Tooltip title="View Contract" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleView(contract)}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.1)" },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canUpdate && (
              <Tooltip title="Edit Contract" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(contract)}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.1)" },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete Contract" arrow>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(contract)}
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
          Contracts of {selectedEmployee?.fullName}
        </Typography>
      </Box>
      <CustomTable
        onPaginationChange={handlePaginationChange}
        paginationModel={paginationModel}
        paginationMode="client"
        loading={isLoading}
        sx={{ padding: "2" }}
        columns={columns}
        rows={contracts || []}
        getRowId={(row) => row.id}
      />
    </Paper>
  );
}

export default EmployeeContractView;
