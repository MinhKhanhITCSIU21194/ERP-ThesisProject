import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import {
  getContractsByEmployeeId,
  deleteContract,
} from "../../../../../../services/contract.service";
import {
  selectContract,
  clearSelectedContract,
} from "../../../../../../redux/employee/contract.slice";
import { CustomTable } from "../../../../../components/Table";
import {
  Contract,
  ContractStatus,
} from "../../../../../../data/employer/contract";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { selectAuth } from "../../../../../../redux/auth/auth.slice";
import { UserPermission } from "../../../../../../data/auth/role";
import {
  selectEmployee,
  selectSpecificEmployee,
} from "../../../../../../redux/employee/employee.slice";
import { useBreadcrumbLabel } from "../../../../../components/breadcrumbs";
import { getEmployeeByIdService } from "../../../../../../services/employee.service";
import EmployeeContractFormView from "./employee-contract-form-view";

function EmployeeContractView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedEmployee } = useAppSelector(selectEmployee);
  const { contracts, selectedContracts, isLoading } =
    useAppSelector(selectContract);
  const { user } = useAppSelector(selectAuth);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(
    null
  );

  // Form dialog state (handles view/edit/create)
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );

  // Fetch employee data if not already loaded
  useEffect(() => {
    const fetchEmployee = async () => {
      if (id && !selectedEmployee) {
        try {
          const response = await getEmployeeByIdService(id);
          if (response.success && response.data) {
            dispatch(selectSpecificEmployee(response.data));
          }
        } catch (error) {
          console.error("Error fetching employee:", error);
        }
      }
    };
    fetchEmployee();
  }, [id, selectedEmployee, dispatch]);

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

  useBreadcrumbLabel(selectedEmployee?.employeeCode || `Employee #${id}`);

  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationModel({ page, pageSize });
  };

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setDialogMode("view");
    setFormDialogOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setDialogMode("edit");
    setFormDialogOpen(true);
  };

  const handleDelete = (contract: Contract) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedContract(null);
    setDialogMode("create");
    setFormDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (contractToDelete) {
      try {
        await dispatch(deleteContract(contractToDelete.id)).unwrap();
        setDeleteDialogOpen(false);
        setContractToDelete(null);
        // Refresh the list
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
      } catch (error) {
        console.error("Error deleting contract:", error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setContractToDelete(null);
    dispatch(clearSelectedContract());
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setSelectedContract(null);
    dispatch(clearSelectedContract());
    // Refresh the list
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
  };

  const handleFormCancel = () => {
    dispatch(clearSelectedContract());
    setFormDialogOpen(false);
    setSelectedContract(null);
  };

  const getStatusColor = (
    status: ContractStatus | string
  ): "success" | "warning" | "error" | "default" => {
    const statusStr = String(status).toUpperCase();
    switch (statusStr) {
      case "ACTIVE":
      case ContractStatus.ACTIVE.toUpperCase():
        return "success";
      case "PENDING":
      case ContractStatus.PENDING.toUpperCase():
        return "warning";
      case "EXPIRED":
      case ContractStatus.EXPIRED.toUpperCase():
        return "error";
      case "TERMINATED":
      case ContractStatus.TERMINATED.toUpperCase():
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

  // Check permissions
  const contractPermission = user?.role?.permissions?.find(
    (p) => p.permission === UserPermission.CONTRACT_MANAGEMENT
  );
  const canCreate = contractPermission?.canCreate || false;

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
          <Typography variant="h5" fontWeight={600}>
            Contracts of {selectedEmployee?.firstName}{" "}
            {selectedEmployee?.lastName}
          </Typography>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
            >
              Add Contract
            </Button>
          )}
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
          checkboxSelection={false}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete contract{" "}
            <strong>{contractToDelete?.contractNumber}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contract Form Dialog (View/Edit/Create) */}
      <EmployeeContractFormView
        open={formDialogOpen}
        mode={dialogMode}
        employeeId={id || ""}
        contract={selectedContract}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </>
  );
}

export default EmployeeContractView;
