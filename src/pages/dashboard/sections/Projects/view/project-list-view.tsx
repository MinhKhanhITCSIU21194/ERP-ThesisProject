import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const Projects: React.FC = () => {
  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Project Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is the projects page. The header and navbar remain fixed while
          this content changes when you navigate.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Projects;
