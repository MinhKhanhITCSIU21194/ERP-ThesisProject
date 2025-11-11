import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "../../routes/hooks/useRouter";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { clearError, selectAuth } from "../../redux/auth/auth.slice";
import { changePassword } from "../../services/auth";

function SetPasswordView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, emailChecked, user } = useAppSelector(selectAuth);
  const [strongPassword, setStrongPassword] = useState<boolean>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [samePassword, setSamePassword] = useState<boolean>();
  const [initialState, setState] = useState({
    newPassword: "",
    confirmPassword: "",
    email: user?.email,
    uuID: user?.userId,
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/sign-in");
    }
  }, []);

  // Handle email input change and check if email exists
  const handlePasswordChange = async (password: string) => {
    setState((prev) => ({ ...prev, newPassword: password }));
    // Use a regular expression to check password strength
    const strongPasswordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@#$%^&*()!~`\-+=\{\}\[\]|\\:;"'<>,.?]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setStrongPassword(false);
    } else {
      setStrongPassword(true);
    }
  };
  // Handle password input change
  const handleConfirmPasswordChange = (Password: string) => {
    setState((prev) => ({ ...prev, confirmPassword: Password }));
    if (initialState.newPassword !== Password) {
      setSamePassword(false);
    } else {
      setSamePassword(true);
    }
    dispatch(clearError());
  };
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await dispatch(changePassword(initialState)).unwrap();
      if (result) {
        console.log("change password successfully:", result);
        router.push("/dashboard");
      }

      // Navigation will be handled by useEffect when success state changes
    } catch (err: any) {
      console.error("change password failed", err);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        gap: 2,
        padding: 2,
      }}
    >
      <Typography sx={{ fontSize: "24px", fontWeight: "bold" }} gutterBottom>
        Set New Password
      </Typography>
      <Box
        sx={{
          flexDirection: "column",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextField
          type={showPassword ? "text" : "password"}
          value={initialState.newPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
          size="medium"
          sx={{ width: "20%", minWidth: "300px" }}
          label="New Password"
          required
          disabled={isLoading}
          error={error === "Email not found"}
        />
        <Box
          sx={{
            width: "20%",
            minWidth: "280px",
            color: "text.secondary",
            border: "1px solid",
            borderColor: strongPassword ? "success.main" : "error.main",
            borderRadius: 1,
            padding: 1,
            marginTop: 1,
            marginBottom: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
            }}
          >
            - Password must be at least 8 characters long
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
            }}
          >
            - Password must include a mix of letters, numbers, and special
            characters.
          </Typography>
        </Box>
        <TextField
          type={showPassword ? "text" : "password"}
          value={initialState.confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          size="medium"
          sx={{ width: "20%", minWidth: "300px" }}
          label="Confirm Password"
          required
          disabled={isLoading}
          error={error === "Email not found"}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isLoading || !strongPassword || !samePassword}
          sx={{ width: "20%", minWidth: "300px", mt: 2 }}
        >
          Change Password
        </Button>
      </Box>
    </Box>
  );
}

export default SetPasswordView;
