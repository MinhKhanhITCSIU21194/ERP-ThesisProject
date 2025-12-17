import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

interface EmployeeImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<any>;
}

function EmployeeImportModal({
  open,
  onClose,
  onImport,
}: EmployeeImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message?: string;
    data?: any;
    errors?: any[];
  } | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        alert("Please upload an Excel file (.xlsx or .xls)");
      }
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (
          file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel" ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls")
        ) {
          setSelectedFile(file);
          setUploadResult(null);
        } else {
          alert("Please upload an Excel file (.xlsx or .xls)");
        }
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await onImport(selectedFile);
      setUploadResult({
        success: true,
        message: result.message || "Import successful",
        data: result.data,
      });
      setSelectedFile(null);
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || "Import failed",
        errors: error.errors || [],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsDragging(false);
    onClose();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Import Employees from Excel</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Upload Result */}
        {uploadResult && (
          <Alert
            severity={uploadResult.success ? "success" : "error"}
            icon={uploadResult.success ? <CheckCircleIcon /> : <ErrorIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">{uploadResult.message}</Typography>
            {uploadResult.data && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption">
                  Successful: {uploadResult.data.successful} | Failed:{" "}
                  {uploadResult.data.failed}
                </Typography>
                {uploadResult.data.errors &&
                  uploadResult.data.errors.length > 0 && (
                    <List dense sx={{ mt: 1 }}>
                      {uploadResult.data.errors
                        .slice(0, 5)
                        .map((err: any, idx: number) => (
                          <ListItem key={idx} sx={{ py: 0 }}>
                            <ListItemText
                              primary={`Row ${err.index}: ${err.error}`}
                              primaryTypographyProps={{ variant: "caption" }}
                            />
                          </ListItem>
                        ))}
                      {uploadResult.data.errors.length > 5 && (
                        <Typography variant="caption" color="text.secondary">
                          ... and {uploadResult.data.errors.length - 5} more
                          errors
                        </Typography>
                      )}
                    </List>
                  )}
              </Box>
            )}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <List dense sx={{ mt: 1 }}>
                {uploadResult.errors
                  .slice(0, 5)
                  .map((error: string, idx: number) => (
                    <ListItem key={idx} sx={{ py: 0 }}>
                      <ListItemText
                        primary={error}
                        primaryTypographyProps={{ variant: "caption" }}
                      />
                    </ListItem>
                  ))}
                {uploadResult.errors.length > 5 && (
                  <Typography variant="caption" color="text.secondary">
                    ... and {uploadResult.errors.length - 5} more errors
                  </Typography>
                )}
              </List>
            )}
          </Alert>
        )}

        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Upload an Excel file (.xlsx or .xls) with employee data. Required
            columns: First Name, Last Name, Email
          </Typography>
        </Alert>

        {/* Drag and Drop Area */}
        <Box
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}
          sx={{
            border: "2px dashed",
            borderColor: isDragging
              ? "primary.main"
              : selectedFile
              ? "success.main"
              : "grey.400",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: isDragging
              ? "action.hover"
              : selectedFile
              ? "success.lighter"
              : "background.paper",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "action.hover",
            },
          }}
        >
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {selectedFile ? (
            <Box>
              <InsertDriveFileIcon
                sx={{ fontSize: 48, color: "success.main", mb: 1 }}
              />
              <Typography variant="body1" gutterBottom>
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  color="error"
                >
                  Remove File
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <CloudUploadIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
              />
              <Typography variant="body1" gutterBottom>
                Drag and drop your Excel file here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
            </Box>
          )}
        </Box>

        {/* Progress Bar */}
        {isUploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Importing employees...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isUploading}>
          {uploadResult?.success ? "Close" : "Cancel"}
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Importing..." : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeImportModal;
