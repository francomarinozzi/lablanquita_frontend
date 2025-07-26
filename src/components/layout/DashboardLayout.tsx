import * as React from 'react';
import {
  AppBar, Box, Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemText, Toolbar, Typography, Divider, ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { Link, Outlet, useLocation } from 'react-router-dom';


import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';

const drawerWidth = 240;


const navItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Nueva venta', path: '/nueva-venta', icon: <ShoppingCartIcon /> },
    { text: 'Productos', path: '/productos', icon: <InventoryIcon /> },
    { text: 'Historial de ventas', path: '/historial', icon: <ReceiptLongIcon /> },
    { text: 'Pedidos', path: '/pedidos', icon: <AssignmentIcon /> }
];

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation(); // Hook para saber en qué página estamos

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);


  const currentPage = navItems.find(item => item.path === location.pathname);
  const pageTitle = currentPage ? currentPage.text : 'Dashboard';

  const drawerContent = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
          La Blanquita
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)'}} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            {/* Hacemos que el botón se comporte como un Link y resalte la página activa */}
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.default',
          color: 'text.primary',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
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
          <Typography variant="h6" noWrap component="div">
            {pageTitle}
          </Typography>
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
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'primary.main',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'primary.main',
              borderRight: 'none'
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />

        <Outlet /> 
      </Box>
    </Box>
  );
}
