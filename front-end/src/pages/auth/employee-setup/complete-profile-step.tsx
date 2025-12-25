import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Grid,
} from "@mui/material";

import { completeEmployeeSetup } from "../../../services/employee-setup.service";

interface CompleteProfileStepProps {
  token: string;
  employeeData: any;
  onSuccess: () => void;
}

const CompleteProfileStep: React.FC<CompleteProfileStepProps> = ({
  token,
  employeeData,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    hireDate: new Date().toISOString().split("T")[0], // Default to today
    gender: "",
    maritalStatus: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const response = await completeEmployeeSetup(token, formData);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || "Failed to complete setup");
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom>
        Complete Your Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Please provide your general information to complete the setup
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Personal Information */}
        <Grid size={12}>
          <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>
            Personal Information
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Date of Birth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleSelectChange}
              label="Gender"
            >
              <MenuItem value="">Select Gender</MenuItem>
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Marital Status</InputLabel>
            <Select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleSelectChange}
              label="Marital Status"
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="SINGLE">Single</MenuItem>
              <MenuItem value="MARRIED">Married</MenuItem>
              <MenuItem value="DIVORCED">Divorced</MenuItem>
              <MenuItem value="WIDOWED">Widowed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
          />
        </Grid>

        {/* Address Information */}
        <Grid size={12}>
          <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>
            Address Information
          </Typography>
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Ward"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          size="large"
        >
          {loading ? <CircularProgress size={24} /> : "Complete Setup"}
        </Button>
      </Box>
    </Box>
  );
};

export default CompleteProfileStep;
