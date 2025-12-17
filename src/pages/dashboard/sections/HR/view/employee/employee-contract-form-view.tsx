import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import {
  createContract,
  updateContract,
} from "../../../../../../services/contract.service";
import {
  clearError,
  selectContract,
} from "../../../../../../redux/employee/contract.slice";
import {
  ContractFormProps,
  ContractStatus,
  Contract,
} from "../../../../../../data/employer/contract";

// Contract types and working types from backend
const CONTRACT_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "FREELANCE", label: "Freelance" },
];

const WORKING_TYPES = [
  { value: "ONSITE", label: "Onsite" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const CONTRACT_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "TERMINATED", label: "Terminated" },
];

interface EmployeeContractFormViewProps {
  open: boolean;
  mode: "view" | "edit" | "create";
  employeeId: string;
  contract: Contract | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function EmployeeContractFormView({
  open,
  mode,
  employeeId,
  contract,
  onSuccess,
  onCancel,
}: EmployeeContractFormViewProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(selectContract);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const [formData, setFormData] = useState<ContractFormProps>({
    contractNumber: "",
    employeeId: employeeId || "",
    contractType: "FULL_TIME",
    workingType: "ONSITE",
    startDate: new Date(),
    endDate: undefined,
    status: ContractStatus.PENDING,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Reset form when dialog opens/closes or contract changes
  useEffect(() => {
    if (open) {
      if (contract && (isEditMode || isViewMode)) {
        // Edit/View mode - populate with contract data
        setFormData({
          contractNumber: contract.contractNumber,
          employeeId: employeeId,
          contractType: contract.contractType,
          workingType: contract.workingType,
          startDate: new Date(contract.startDate),
          endDate: contract.endDate ? new Date(contract.endDate) : undefined,
          status: contract.status,
          contractFile: contract.contractFile,
        });
        // Set file name if exists - generate from contract number
        if (contract.contractFile) {
          // Detect file type from base64 data
          let extension = ".pdf";
          if (contract.contractFile.startsWith("data:application/msword")) {
            extension = ".doc";
          } else if (
            contract.contractFile.startsWith(
              "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
          ) {
            extension = ".docx";
          }
          setFileName(`${contract.contractNumber}${extension}`);
        } else {
          setFileName("");
        }
        setSelectedFile(null);
      } else if (isCreateMode) {
        // Create mode - reset to defaults
        setFormData({
          contractNumber: "",
          employeeId: employeeId,
          contractType: "FULL_TIME",
          workingType: "ONSITE",
          startDate: new Date(),
          endDate: undefined,
          status: ContractStatus.PENDING,
        });
        setFileName("");
        setSelectedFile(null);
      }
      setErrors({});
      dispatch(clearError());
    }
  }, [
    open,
    contract,
    employeeId,
    mode,
    isEditMode,
    isViewMode,
    isCreateMode,
    dispatch,
  ]);

  const handleChange = (field: keyof ContractFormProps, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          contractFile: "File size must be less than 10MB",
        }));
        return;
      }
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          contractFile: "Only PDF and Word documents are allowed",
        }));
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setErrors((prev) => ({ ...prev, contractFile: "" }));
    }
  };

  const handleDownloadFile = () => {
    if (formData.contractFile) {
      // Create a download link
      const link = document.createElement("a");
      link.href = formData.contractFile;
      link.download = fileName || "contract.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      let contractData = { ...formData };

      // Convert file to base64 if a new file is selected
      if (selectedFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
        contractData.contractFile = base64;
      }

      if (isEditMode && contract) {
        await dispatch(
          updateContract({
            id: contract.id,
            contractData: contractData,
          })
        ).unwrap();
      } else {
        await dispatch(createContract(contractData)).unwrap();
      }
      onSuccess();
    } catch (err: any) {
      console.error("Error saving contract:", err);
    }
  };

  const getTitle = () => {
    if (isViewMode) return "Contract Details";
    if (isEditMode) return "Edit Contract";
    return "Create New Contract";
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {error && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "error.light",
              color: "error.contrastText",
              borderRadius: 1,
            }}
          >
            <Typography>{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Contract Number"
              value={formData.contractNumber || ""}
              onChange={(e) => handleChange("contractNumber", e.target.value)}
              error={Boolean(errors.contractNumber)}
              helperText={
                isCreateMode
                  ? "Auto-generated by system"
                  : errors.contractNumber
              }
              disabled={isCreateMode || isViewMode || isLoading}
              InputProps={{ readOnly: isCreateMode || isViewMode }}
              InputLabelProps={{ shrink: true }}
              placeholder={isCreateMode ? "Auto-generated" : ""}
            />

            <TextField
              fullWidth
              required={!isViewMode}
              select={!isViewMode}
              label="Contract Type"
              value={formData.contractType}
              onChange={(e) => handleChange("contractType", e.target.value)}
              disabled={isViewMode || isLoading}
              InputProps={{ readOnly: isViewMode }}
              InputLabelProps={{ shrink: true }}
            >
              {CONTRACT_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required={!isViewMode}
              select={!isViewMode}
              label="Working Type"
              value={formData.workingType}
              onChange={(e) => handleChange("workingType", e.target.value)}
              disabled={isViewMode || isLoading}
              InputProps={{ readOnly: isViewMode }}
              InputLabelProps={{ shrink: true }}
            >
              {WORKING_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required={!isViewMode}
              select={!isViewMode}
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              disabled={isViewMode || isLoading}
              InputProps={{ readOnly: isViewMode }}
              InputLabelProps={{ shrink: true }}
            >
              {CONTRACT_STATUSES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required={!isViewMode}
              type="date"
              label="Start Date"
              value={
                formData.startDate
                  ? new Date(formData.startDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleChange("startDate", new Date(e.target.value))
              }
              error={Boolean(errors.startDate)}
              helperText={errors.startDate}
              disabled={isViewMode || isLoading}
              InputProps={{ readOnly: isViewMode }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              type="date"
              label="End Date (Optional)"
              value={
                formData.endDate
                  ? new Date(formData.endDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                handleChange(
                  "endDate",
                  e.target.value ? new Date(e.target.value) : undefined
                )
              }
              error={Boolean(errors.endDate)}
              helperText={errors.endDate}
              disabled={isViewMode || isLoading}
              InputProps={{ readOnly: isViewMode }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Contract File Upload */}
            <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2" } }}>
              {!isViewMode ? (
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    disabled={isLoading}
                    sx={{ py: 1.5, justifyContent: "flex-start" }}
                  >
                    {fileName || "Upload Contract File (PDF, DOC, DOCX)"}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {errors.contractFile && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {errors.contractFile}
                    </Typography>
                  )}
                  {fileName && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      Selected: {fileName}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    fullWidth
                    label="Contract File"
                    value={fileName || "No file attached"}
                    disabled
                    InputProps={{ readOnly: true }}
                    InputLabelProps={{ shrink: true }}
                  />
                  {formData.contractFile && (
                    <IconButton
                      color="primary"
                      onClick={handleDownloadFile}
                      title="Download file"
                      sx={{ mt: 1 }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outlined"
          color="inherit"
        >
          {isViewMode ? "Close" : "Cancel"}
        </Button>
        {!isViewMode && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isEditMode ? "Update Contract" : "Create Contract"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeContractFormView;
