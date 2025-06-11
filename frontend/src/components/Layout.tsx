import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  ListItemButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import AssignmentIcon from "@mui/icons-material/Assignment";

const drawerWidth = 240;

const navItems = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "Clientes", path: "/clientes", icon: <PeopleIcon /> },
  { label: "Agenda", path: "/agenda", icon: <EventIcon /> },
  { label: "Sessões", path: "/sessoes", icon: <AssignmentIcon /> },
  { label: "Notas", path: "/notas", icon: <AssignmentIcon /> },
];

export default function Layout({
  toggleTheme,
  mode,
}: {
  toggleTheme: () => void;
  mode: "light" | "dark";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = "auto"; // restaura scroll
    const sentinel = document.querySelector('[data-testid="sentinelEnd"]');
    sentinel?.dispatchEvent(new Event("click")); // tenta fechar drawer invisível, se existir
  }, [location]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: "center",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Toolbar sx={{ minHeight: 80, mt: 1 }} />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <Box sx={{ mr: 2 }}>{item.icon}</Box>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ sx: { fontSize: "1.5rem" } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <FormControlLabel
          control={<Switch checked={mode === "dark"} onChange={toggleTheme} />}
          label={mode === "dark" ? "Modo Escuro" : "Modo Claro"}
          sx={{ ml: 2, mt: 2 }}
        />
      </Box>

      <Box>
        <Divider sx={{ mt: 2 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
            }}
          >
            <LogoutIcon sx={{ mr: 1 }} />
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        component="nav"
        position="fixed"
        sx={{ zIndex: 1201, height: "80px", borderBottom: "1px solid #444" }}
      >
        <Toolbar
          sx={{
            minHeight: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              fontSize: "3rem",
              display: "flex",
              alignItems: "center",
              height: "100%",
              paddingTop: "5px",
            }}
          >
            Sistema de Atendimentos
          </Typography>
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
            >
              Maria Eduarda Buarque de Gusmão
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.85rem", color: "lightgray", marginTop: "2px" }}
            >
              Psicologia & Rolfing
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <Box sx={{ height: "90px" }} />
        <Box sx={{ flex: 1, px: 3, pb: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
