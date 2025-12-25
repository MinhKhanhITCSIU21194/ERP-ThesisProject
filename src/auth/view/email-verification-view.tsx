import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { clearError, selectAuth } from "../../redux/auth/auth.slice";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import { requestEmailVerification, verifyEmailCode } from "../../services/auth";
import { useRouter } from "../../routes/hooks/useRouter";

export interface VerificationProps {
  email: string;
  code: string;
}

function EmailVerificationView() {
  const router = useRouter();
  const [params, setParams] = React.useState<VerificationProps>({
    email: "",
    code: "",
  });
  const { email, error, isLoading } = useAppSelector(selectAuth);
  const [verificationCode, setVerificationCode] = React.useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (email) {
      setParams((prev) => ({
        ...prev,
        email: email,
      }));
    }
  }, [email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await dispatch(
        verifyEmailCode({
          email: params.email,
          code: verificationCode.join(""),
        })
      ).unwrap();
      if (result) {
        router.push("/auth/reset-password");
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
    }
  };

  // Handle input change for verification code
  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text");
    const numbers = pastedData.replace(/\D/g, "").slice(0, 6);

    const newCode = [...verificationCode];
    for (let i = 0; i < numbers.length; i++) {
      newCode[i] = numbers[i];
    }
    setVerificationCode(newCode);

    // Focus the next empty field or last field
    const nextIndex = Math.min(numbers.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };
  const handleResend = async () => {
    if (email) {
      await dispatch(requestEmailVerification(email)).unwrap();
    }
  };
  // Check if code is complete
  const isCodeComplete = verificationCode.every((digit) => digit !== "");

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
        gap: 3,
        padding: 2,
      }}
    >
      <Typography sx={{ fontSize: "24px", fontWeight: "bold" }} gutterBottom>
        Email Verification
      </Typography>

      <Typography
        sx={{ fontSize: "16px", color: "text.secondary", textAlign: "center" }}
      >
        We've sent a 6-digit verification code to
      </Typography>

      <Typography
        sx={{ fontSize: "16px", fontWeight: "500", color: "primary.main" }}
      >
        {email}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: "100%", maxWidth: "400px" }}>
          {error}
        </Alert>
      )}

      {/* Verification Code Input Fields */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {verificationCode.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: "center",
                fontSize: "24px",
                fontWeight: "bold",
              },
            }}
            sx={{
              width: "60px",
              height: "60px",
              "& .MuiOutlinedInput-root": {
                height: "60px",
                "& fieldset": {
                  borderWidth: "2px",
                },
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                  borderWidth: "2px",
                },
              },
            }}
            variant="outlined"
            disabled={isLoading}
          />
        ))}
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={!isCodeComplete || isLoading}
        sx={{
          width: "100%",
          maxWidth: "400px",
          height: "48px",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        {isLoading ? "Verifying..." : "Verify Code"}
      </Button>

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Didn't receive the code?
        </Typography>
        <Button
          variant="text"
          onClick={() => {
            handleResend;
          }}
          disabled={isLoading}
          sx={{ textTransform: "none", fontWeight: "600" }}
        >
          Resend Code
        </Button>
      </Box>
    </Box>
  );
}

export default EmailVerificationView;
