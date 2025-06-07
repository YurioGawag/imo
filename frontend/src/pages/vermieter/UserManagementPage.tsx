import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import UserManagement from '../../components/Admin/UserManagement';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterNavigationItems } from './vermieterNavigation';

const UserManagementPage: React.FC = () => {
  return (
    <MainLayout title="Benutzerverwaltung" navigationItems={vermieterNavigationItems}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Benutzerverwaltung
        </Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <Link component={RouterLink} to="/vermieter/dashboard" color="inherit">
            Dashboard
          </Link>
          <Typography color="text.primary">Benutzerverwaltung</Typography>
        </Breadcrumbs>
      </Box>
      
      <UserManagement />
    </MainLayout>
  );
};

export default UserManagementPage;
