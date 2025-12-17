import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { validateSetupToken } from "../../../services/employee-setup.service";
import SetPasswordStep from "./set-password-step";
import CompleteProfileStep from "./complete-profile-step";

const steps = ["Validate Token", "Set Password", "Complete Profile"];

const EmployeeSetup: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await validateSetupToken(token!);

      if (response.success && response.data) {
        setEmployeeData(response.data);
        setActiveStep(1); // Move to Set Password step
      } else {
        setError(response.message || "Invalid or expired token");
      }
    } catch (err: any) {
      setError(err.message || "Failed to validate token");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSet = () => {
    setActiveStep(2); // Move to Complete Profile step
  };

  const handleSetupComplete = () => {
    // Redirect to dashboard
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="#f5f5f5"
        p={2}
      >
        <Card sx={{ maxWidth: 500, width: "100%" }}>
          <CardContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              The setup link may have expired or is invalid. Please contact your
              administrator for a new setup link.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      bgcolor="#f5f5f5"
      p={2}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Card sx={{ maxWidth: 800, width: "100%", mb: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Welcome to the Team!
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            mb={3}
          >
            Complete your profile setup to get started
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {employeeData && (
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Employee Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Name: {employeeData.firstName} {employeeData.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {employeeData.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employee Code: {employeeData.employeeCode}
              </Typography>
            </Box>
          )}

          {activeStep === 1 && (
            <SetPasswordStep
              token={token!}
              employeeData={employeeData}
              onSuccess={handlePasswordSet}
            />
          )}

          {activeStep === 2 && (
            <CompleteProfileStep
              token={token!}
              employeeData={employeeData}
              onSuccess={handleSetupComplete}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeSetup;
