import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, CircularProgress, Box } from '@mui/material';
import { Login } from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MieterDashboard } from './pages/mieter/MieterDashboard';
import { MieterMeldungenList } from './pages/mieter/MieterMeldungenList';
import { MieterMeldungCreate } from './pages/mieter/MieterMeldungCreate';
import { MieterMeldungDetail } from './pages/mieter/MieterMeldungDetail';
import { MieterWohnung } from './pages/mieter/MieterWohnung';
import { VermieterDashboard } from './pages/vermieter/VermieterDashboard';
import { VermieterMeldungenList } from './pages/vermieter/VermieterMeldungenList';
import { VermieterMeldungDetail } from './pages/vermieter/VermieterMeldungDetail';
import { VermieterAuftraege } from './pages/vermieter/VermieterAuftraege';
import { HandwerkerDashboard } from './pages/handwerker/HandwerkerDashboard';
import HandwerkerMeldungenList from './pages/handwerker/HandwerkerMeldungenList';
import { HandwerkerMeldungDetail } from './pages/handwerker/HandwerkerMeldungDetail';
import { HandwerkerProfil } from './pages/handwerker/HandwerkerProfil';
import { PropertyList } from './pages/vermieter/PropertyList';
import { PropertyDetail } from './pages/vermieter/PropertyDetail';
import MieterBenachrichtigungen from './pages/mieter/MieterBenachrichtigungen';
import { MieterManagementDashboard } from './pages/mieter/MieterManagementDashboard';
import { VermieterBenachrichtigungen } from './pages/vermieter/VermieterBenachrichtigungen';
import { MieterProfil } from './pages/mieter/MieterProfil';
import { VermieterProfil } from './pages/vermieter/VermieterProfil';
import { MieterEinladung } from './pages/mieter/MieterEinladung';
import { HandwerkerList } from './pages/handwerker/HandwerkerList';
import UserManagementPage from './pages/vermieter/UserManagementPage';
import { LandingPage } from './pages/LandingPage';
import { Kontakt } from './pages/Kontakt';
import { Datenschutz } from './pages/Datenschutz';
import { Impressum } from './pages/Impressum';
import Pricing from './pages/Pricing';

import { useAuthStore } from './store/auth.store';
import { authService } from './services/auth.service';
import { UserRole } from './types/auth';

// Create theme instance
const theme = createTheme({
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    h2: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 400,
      letterSpacing: '-0.01em',
    },
    body1: {
      letterSpacing: '-0.01em',
    },
    body2: {
      letterSpacing: '-0.01em',
    },
  },
  palette: {
    primary: {
      main: '#E67E22', // Immofox Orange
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const { setUser, setToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          setToken(token);
          const user = await authService.verify();
          setUser(user);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        authService.logout();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [setUser, setToken]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      ) : (
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/mieter/einladung/:token" element={<MieterEinladung />} />

            {/* Protected Routes */}
            {/* Vermieter Routes */}
            <Route path="/vermieter" element={<ProtectedRoute allowedRoles={[UserRole.VERMIETER]}><Outlet /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<VermieterDashboard />} />
              <Route path="meldungen" element={<VermieterMeldungenList />} />
              <Route path="meldungen/:id" element={<VermieterMeldungDetail />} />
              <Route path="auftraege" element={<VermieterAuftraege />} />
              <Route path="properties" element={<PropertyList />} />
              <Route path="properties/:id" element={<PropertyDetail />} />
              <Route path="benachrichtigungen" element={<VermieterBenachrichtigungen />} />
              <Route path="wohnung" element={<MieterWohnung />} />
              <Route path="handwerker" element={<HandwerkerList />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="profile" element={<VermieterProfil />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Mieter Routes */}
            <Route
              path="/mieter"
              element={
                <ProtectedRoute allowedRoles={[UserRole.MIETER]}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<MieterDashboard />} />
              <Route path="management" element={<MieterManagementDashboard />} />
              <Route path="meldungen" element={<MieterMeldungenList />} />
              <Route path="meldungen/create" element={<MieterMeldungCreate />} />
              <Route path="meldungen/:id" element={<MieterMeldungDetail />} />
              <Route path="benachrichtigungen" element={<MieterBenachrichtigungen />} />
              <Route path="wohnung" element={<MieterWohnung />} />
              <Route path="profil" element={<MieterProfil />} />
            </Route>

            {/* Handwerker Routes */}
            <Route
              path="/handwerker"
              element={
                <ProtectedRoute allowedRoles={[UserRole.HANDWERKER]}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<HandwerkerDashboard />} />
              <Route path="meldungen" element={<HandwerkerMeldungenList />} />
              <Route path="meldungen/:id" element={<HandwerkerMeldungDetail />} />
              <Route path="profil" element={<HandwerkerProfil />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Default Routes */}
            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
}

export default App;
