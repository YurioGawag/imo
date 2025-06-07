import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Badge,
  useTheme,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../utils/api';

interface NavigationItem {
  text: string;
  icon: React.ComponentType;
  path: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  navigationItems: NavigationItem[];
}

const drawerWidth = 280;

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  navigationItems,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isMenuOpen = Boolean(anchorEl);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (!user?._id) return;
      
      try {
        let response;
        if (user.role === 'mieter') {
          response = await api.get('/notifications/tenant');
        } else if (user.role === 'vermieter') {
          const activePropertyId = localStorage.getItem('activePropertyId');
          if (!activePropertyId) {
            setUnreadNotifications(0);
            return;
          }
          response = await api.get(`/notifications/property/${activePropertyId}`);
        }

        if (response?.data) {
          const userId = user._id;
          const unread = response.data.filter((n: any) => !n.readBy?.some((r: any) => r.user === userId)).length;
          setUnreadNotifications(unread);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Benachrichtigungen:', error);
        setUnreadNotifications(0);
      }
    };

    if (user?._id) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user?._id]);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    if (user?.role === 'mieter') {
      navigate('/mieter/profil');
    } else if (user?.role === 'vermieter') {
      navigate('/vermieter/profil');
    } else if (user?.role === 'handwerker') {
      navigate('/handwerker/profil');
    }
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%',
      background: theme.palette.background.default,
      borderRight: `1px solid ${theme.palette.divider}`,
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center',
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
      }}>
        <Avatar sx={{ 
          width: 40, 
          height: 40, 
          bgcolor: theme.palette.primary.dark,
          mr: 2 
        }}>
          {user?.firstName?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2">
            {user?.role === 'mieter' ? 'Mieter' : 
             user?.role === 'vermieter' ? 'Vermieter' : 
             user?.role === 'handwerker' ? 'Handwerker' : ''}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List sx={{ p: 2 }}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isSelected = location.pathname.includes(item.path);
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 1,
                  backgroundColor: isSelected ? theme.palette.primary.main : 'transparent',
                  color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: isSelected 
                      ? theme.palette.primary.dark 
                      : theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: isSelected ? theme.palette.primary.contrastText : theme.palette.text.primary 
                }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfile}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profil</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Abmelden</ListItemText>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {(user?.role === 'mieter' || user?.role === 'vermieter') && (
              <IconButton
                size="large"
                aria-label={`${unreadNotifications} neue Benachrichtigungen`}
                color="inherit"
                onClick={() =>
                  navigate(
                    user?.role === 'mieter'
                      ? '/mieter/benachrichtigungen'
                      : '/vermieter/benachrichtigungen'
                  )
                }
              >
                <Badge badgeContent={unreadNotifications} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.grey[50],
        }}
      >
        <Toolbar />
        {children}
      </Box>
      {renderMenu}
    </Box>
  );
};
