import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  DollarSign,
  BarChart3,
  LogOut,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../App';
import { Sun, Moon } from 'lucide-react';

const drawerWidth = 260;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { user, logout } = useAuth();
  const role = user?.role || '';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    logout();
    navigate('/login');
  };

  // Define navigation items based on role permission matrix
  const allNavItems = [
    {
      text: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/dashboard',
      allowedRoles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
    },
    {
      text: 'Vehicles',
      icon: <Truck size={20} />,
      path: '/vehicles',
      allowedRoles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
    },
    {
      text: 'Drivers',
      icon: <Users size={20} />,
      path: '/drivers',
      allowedRoles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
    },
    {
      text: 'Trips',
      icon: <Route size={20} />,
      path: '/trips',
      allowedRoles: ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
    },
    {
      text: 'Maintenance',
      icon: <Wrench size={20} />,
      path: '/maintenance',
      allowedRoles: ['FLEET_MANAGER'],
    },
    {
      text: 'Fuel & Expenses',
      icon: <DollarSign size={20} />,
      path: '/expenses',
      allowedRoles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
    },
    {
      text: 'Reports',
      icon: <BarChart3 size={20} />,
      path: '/reports',
      allowedRoles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
    },
  ];

  const navItems = allNavItems.filter((item) => item.allowedRoles.includes(role));

  const formatRole = (r: string) => {
    if (!r) return '';
    return r.replace('_', ' ');
  };

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.paper }}>
      <Toolbar sx={{ px: 3, py: 2 }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
          }}
        >
          TransitOps 🚛
        </Typography>
      </Toolbar>
      <Divider sx={{ opacity: 0.1, borderColor: theme.palette.divider }} />
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: '10px',
                  color: isActive
                    ? theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main
                    : theme.palette.text.secondary,
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#8b5cf6' : theme.palette.text.secondary,
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ opacity: 0.1, borderColor: theme.palette.divider }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            color: '#ef4444',
            '&:hover': {
              bgcolor: 'rgba(239, 68, 68, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText primary="Log Out" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <AppBar
        position="fixed"
        sx={{
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(10, 11, 16, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              {location.pathname.replace('/', '').charAt(0).toUpperCase() + location.pathname.slice(2).replace('-', ' ')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <Chip
                label={formatRole(role)}
                size="small"
                sx={{
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              />
            )}
            <Tooltip title={colorMode.mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
              <IconButton onClick={colorMode.toggleColorMode} sx={{ color: 'inherit' }}>
                {colorMode.mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Account settings">
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  bgcolor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                  mt: 1.5,
                  '& .MuiMenuItem-root': {
                    fontSize: '0.85rem',
                    color: theme.palette.text.primary,
                    py: 1,
                  },
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: '1 !important', py: '6px !important' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {user?.email}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ opacity: 0.1, borderColor: theme.palette.divider }} />
              <MenuItem onClick={handleLogout} sx={{ color: '#ef4444 !important' }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: `1px solid ${theme.palette.divider}` },
            }}
          >
            {sidebarContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: `1px solid ${theme.palette.divider}` },
            }}
          >
            {sidebarContent}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
