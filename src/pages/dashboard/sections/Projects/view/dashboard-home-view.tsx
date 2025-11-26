import React, { useEffect } from "react";
import { Box, Typography, Paper, Button, Tabs, Tab } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import CancelIcon from "@mui/icons-material/Cancel";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { selectProject } from "../../../../../redux/project/project.slice";
import { getProjectsByEmployeeId } from "../../../../../services/project.service";
import { Link } from "react-router-dom";
import { ProjectStatus } from "../../../../../data/project/project";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import TaskListView from "../components/task-list-view";
import { useRouter } from "../../../../../routes/hooks/useRouter";
import { selectAuth } from "../../../../../redux/auth/auth.slice";

const Projects: React.FC = () => {
  const router = useRouter();
  const { user } = useAppSelector(selectAuth);
  const [tab, setTab] = React.useState("1");
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector(selectProject);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };
  // Helper function to get border color based on status
  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.ACTIVE:
        return "#1976d2"; // Blue
      case ProjectStatus.PLANNING:
        return "#fbc02d"; // Yellow
      case ProjectStatus.ON_HOLD:
        return "#ff9800"; // Orange
      case ProjectStatus.CANCELLED:
        return "#9e9e9e"; // Grey
      case ProjectStatus.COMPLETED:
        return "#4caf50"; // Green
      default:
        return "#1976d2";
    }
  };

  // Helper function to get icon based on status
  const getStatusIcon = (status: ProjectStatus) => {
    const iconStyle = { fontSize: 20, mr: 0.5 };
    switch (status) {
      case ProjectStatus.ACTIVE:
        return <PlayArrowIcon sx={{ ...iconStyle, color: "#1976d2" }} />;
      case ProjectStatus.PLANNING:
        return <ScheduleIcon sx={{ ...iconStyle, color: "#fbc02d" }} />;
      case ProjectStatus.ON_HOLD:
        return <PauseIcon sx={{ ...iconStyle, color: "#ff9800" }} />;
      case ProjectStatus.CANCELLED:
        return <CancelIcon sx={{ ...iconStyle, color: "#9e9e9e" }} />;
      case ProjectStatus.COMPLETED:
        return <CheckIcon sx={{ ...iconStyle, color: "#4caf50" }} />;
      default:
        return null;
    }
  };
  useEffect(() => {
    if (user?.employeeID) {
      dispatch(
        getProjectsByEmployeeId({
          employeeId: user.employeeID,
          isRecent: true,
          limit: 5,
        })
      );
    }
  }, [dispatch, user?.employeeID]);
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Recent projects
          </Typography>
          <Button
            onClick={() => {
              router.push("/dashboard/projects/list");
            }}
            sx={{ textTransform: "none" }}
          >
            View all projects
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "row" }}>
          {projects.length === 0 ? (
            <Typography>No recent projects found.</Typography>
          ) : (
            projects.map((project) => (
              <Box
                key={project.projectId}
                sx={{
                  mx: 2,
                  p: 1,
                  minWidth: "240px",
                  height: "170px",
                  borderRadius: 1,
                  border: "1px outset",
                  borderLeft: `20px solid ${getStatusColor(project.status)}`,
                }}
              >
                <Link
                  to={`/dashboard/projects/${project.projectId}`}
                  style={{ textDecoration: "none" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {getStatusIcon(project.status)}
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", color: "black" }}
                    >
                      {project.name}
                    </Typography>
                  </Box>
                </Link>
                <Typography variant="body2" color="text.secondary">
                  Priority: {project.priority}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {project.status}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  From: {project.startDate} to: {project.endDate}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Sprints: {project.sprints?.length || 0}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Manager: {project.projectManager?.firstName}{" "}
                  {project.projectManager?.lastName}
                </Typography>
              </Box>
            ))
          )}
        </Box>
        <Box sx={{ width: "100%", typography: "body1", mt: 3 }}>
          <TabContext value={tab}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab
                  sx={{ textTransform: "none" }}
                  label="Worked on"
                  value="1"
                />
                <Tab
                  sx={{ textTransform: "none" }}
                  label="Assigned to me"
                  value="2"
                />
                <Tab
                  sx={{ textTransform: "none" }}
                  label="Need enhancement"
                  value="3"
                />
              </TabList>
            </Box>
            <TabPanel value="1">
              <TaskListView filter="worked-on" />
            </TabPanel>
            <TabPanel value="2">
              <TaskListView filter="assigned" />
            </TabPanel>
            <TabPanel value="3">
              <TaskListView filter="bugs" />
            </TabPanel>
          </TabContext>
        </Box>
      </Paper>
    </Box>
  );
};

export default Projects;
