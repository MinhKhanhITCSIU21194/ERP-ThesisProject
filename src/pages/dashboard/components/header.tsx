import React from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { selectAuth } from "../../../redux/auth/auth.slice";
import { Box, Button } from "@mui/material";
import { logoutAsync } from "../../../services/auth";
import { Link } from "react-router-dom";

function Header() {
  const AuthState = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const handleLogout = async () => {
    await dispatch(logoutAsync());
  };
  return (
    <Box
      sx={{
        display: "flex",
        background: "#b0b0b0",
        height: "70px",
      }}
    >
      <Link to="/dashboard">
        {" "}
        <img
          src="/src/assets/ERP.png"
          alt="Logo"
          style={{ width: 50, height: 50, borderRadius: 10, margin: 10 }}
        />
      </Link>
      <Box
        sx={{
          flexGrow: 1,
          width: "90%",
          justifyContent: "flex-end",
          display: "flex",
        }}
      >
        <Button
          sx={{
            m: 2,
            color: "black",
            borderWidth: "2.5px",
            borderColor: "black",
            fontWeight: "bold",
          }}
          variant="outlined"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </Box>
    </Box>
  );
}

export default Header;
