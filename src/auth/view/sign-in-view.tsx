import { Box, TextField, Typography, Button, Alert, Link } from "@mui/material";
import React, { useState, useEffect } from "react";
import { checkEmailExists, requestSignIn } from "../../services/auth";
import { Account } from "../../data/auth/auth";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { selectAuth, clearError } from "../../redux/auth/auth.slice";
import { Navigate, useNavigate } from "react-router-dom";
import { useRouter } from "../../routes/hooks/useRouter";

function SignInView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, emailChecked, userName, success, user } =
    useAppSelector(selectAuth);
  const [account, setAccount] = useState<Account>({ email: "", password: "" });
  // Handle email input change and check if email exists
  const handleEmailChange = async (email: string) => {
    setAccount((prev) => ({ ...prev, email }));
    dispatch(clearError());
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      await dispatch(checkEmailExists(email)).unwrap();
    } catch (err) {
      // Error is handled by Redux automatically
      console.error("Email check failed:", err);
    }
  };

  // Handle password input change
  const handlePasswordChange = (password: string) => {
    setAccount((prev) => ({ ...prev, password }));
    dispatch(clearError());
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const result = await dispatch(requestSignIn(account)).unwrap();
      if (result) {
        console.log("Sign in successful:", result);
        router.push("/dashboard");
      }

      // Navigation will be handled by useEffect when success state changes
    } catch (err: any) {
      console.error("Sign in failed:", err);
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
        Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: "20%", minWidth: "300px" }}>
          {error}
        </Alert>
      )}
      <TextField
        type="email"
        value={account.email}
        onChange={(e) => handleEmailChange(e.target.value)}
        size="medium"
        sx={{ width: "20%", minWidth: "300px" }}
        label="Email"
        variant="outlined"
        required
        disabled={isLoading || emailChecked}
        error={error === "Email not found"}
      />
      {!emailChecked && (
        <>
          <Button
            type="button"
            sx={{ width: "20%", minWidth: "300px" }}
            onClick={() => handleEmailSubmit(account.email)}
            variant="contained"
            disabled={
              !account.email.includes(".com") ||
              !account.email.includes("@") ||
              isLoading
            }
            size="large"
          >
            {isLoading ? "Checking..." : "Next"}
          </Button>
          <Box>
            <Link href="/auth/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Box>
        </>
      )}

      {userName && emailChecked && (
        <>
          <Typography sx={{ fontWeight: "normal", color: "success.main" }}>
            Hello, {userName}! Please enter your password.
          </Typography>

          <TextField
            type="password"
            value={account.password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            size="medium"
            sx={{ width: "20%", minWidth: "300px" }}
            label="Password"
            variant="outlined"
            required
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || !account.password}
            sx={{ width: "20%", minWidth: "300px", mt: 2 }}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
          <Box>
            <Link href="/auth/forgot-password" variant="body2">
              Forgot password?
            </Link>
          </Box>
          <Box>
            <Link href="/auth/sign-in" variant="body2">
              Not you?
            </Link>
          </Box>
        </>
      )}
    </Box>
  );
}

export default SignInView;
