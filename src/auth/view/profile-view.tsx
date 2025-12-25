import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  Link,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import { selectAuth } from "../../redux/auth/auth.slice";
import { useRouter } from "../../routes/hooks/useRouter";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import WorkIcon from "@mui/icons-material/Work";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LockIcon from "@mui/icons-material/Lock";
import { requestEmailVerification } from "../../services/auth";

function UserProfileView() {
  const { user } = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOpenChangePassword = async () => {
    // Send verification code and navigate to verify email page
    if (user?.email) {
      try {
        await dispatch(requestEmailVerification(user.email)).unwrap();
        // Navigate to verify email page
        router.push("/auth/verify-email");
      } catch (err: any) {
        alert(err || "Failed to send verification code");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No user information available
        </Typography>
      </Box>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Header Card */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: "3rem",
              bgcolor: "rgba(255, 255, 255, 0.3)",
              border: "4px solid white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {user.fullName}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1 }}>
              <Chip
                label={user.role?.name || "No Role"}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
              {user.isEmailVerified && (
                <Chip
                  icon={<VerifiedUserIcon sx={{ color: "white !important" }} />}
                  label="Verified"
                  sx={{
                    bgcolor: "rgba(76, 175, 80, 0.9)",
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              )}
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.95 }}>
              {user.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Information Grid */}
      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Personal Information
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "primary.light",
                      color: "primary.main",
                    }}
                  >
                    <PersonIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      First Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.firstName}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "secondary.light",
                      color: "secondary.main",
                    }}
                  >
                    <PersonIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Last Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.lastName}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "info.light",
                      color: "info.main",
                    }}
                  >
                    <EmailIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                {user.employeeCode && (
                  <>
                    <Divider />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "success.light",
                          color: "success.main",
                        }}
                      >
                        <BadgeIcon />
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Employee Code
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user.employeeCode}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Role & Permissions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Role & Access
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "warning.light",
                      color: "warning.main",
                    }}
                  >
                    <WorkIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.role?.name || "No Role Assigned"}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: user.isEmailVerified
                        ? "success.light"
                        : "error.light",
                      color: user.isEmailVerified
                        ? "success.main"
                        : "error.main",
                    }}
                  >
                    <VerifiedUserIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email Status
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.isEmailVerified ? "Verified" : "Not Verified"}
                    </Typography>
                  </Box>
                </Box>

                <Divider />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ mb: 3 }}
              >
                Account Details
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "error.light",
                      color: "error.main",
                    }}
                  >
                    <LockIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Password
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ••••••••••••
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "primary.light",
                      color: "primary.main",
                    }}
                  >
                    <LockIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Security:{" "}
                    </Typography>
                    <Link
                      href="#"
                      variant="body1"
                      fontWeight="medium"
                      sx={{
                        textDecoration: "none",
                        color: "primary.main",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenChangePassword();
                      }}
                    >
                      Change Password
                    </Link>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UserProfileView;
