import React, { useEffect } from "react";
import { Alert, Box, Button, Link, TextField, Typography } from "@mui/material";
import { requestEmailVerification } from "../../services/auth";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { selectAuth } from "../../redux/auth/auth.slice";
import { useRouter } from "../../routes/hooks/useRouter";

function ForgotPasswordView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = React.useState("");
  const [validEmail, setValidEmail] = React.useState(false);
  const { isLoading, error, emailChecked } = useAppSelector(selectAuth);
  const handleEmailChange = async (email: string) => {
    setEmail(email);
    if (email.includes("@") && email.includes(".com")) {
      setValidEmail(true);
    } else {
      setValidEmail(false);
    }
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await dispatch(requestEmailVerification(email)).unwrap();
      // if (emailChecked) {
      //   router.push("/auth/verify-email");
      // }
      router.push("/auth/verify-email");
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
        Email Verification
      </Typography>
      {error && (
        <Alert severity="error" sx={{ width: "20%", minWidth: "300px" }}>
          {error}
        </Alert>
      )}
      <TextField
        type="email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        size="medium"
        sx={{ width: "20%", minWidth: "300px" }}
        label="Email"
        variant="outlined"
        required
      />
      <>
        <Button
          type="submit"
          disabled={!email || !validEmail || isLoading}
          sx={{ width: "20%", minWidth: "300px" }}
          variant="contained"
          size="large"
        >
          {isLoading ? "Checking..." : "Next"}
        </Button>
      </>
      <Box>
        <Link href="/auth/sign-in" variant="body2">
          Got account?
        </Link>
      </Box>
    </Box>
  );
}

export default ForgotPasswordView;
