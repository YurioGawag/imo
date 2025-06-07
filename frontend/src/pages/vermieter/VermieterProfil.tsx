import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  InputAdornment,
  Snackbar,
  useMediaQuery,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuthStore } from '../../store/auth.store';
import { vermieterService } from '../../services/vermieter.service';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterNavigationItems } from './vermieterNavigation';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid white',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  margin: '0 auto',
  position: 'relative',
  backgroundColor: '#E67E22',
  fontSize: '3rem',
}));

const ProfileHeader = styled(Box)({
  background: 'linear-gradient(135deg, #FF8E53 0%, #E67E22 100%)',
  color: 'white',
  borderRadius: '16px 16px 0 0',
  padding: '40px 24px 80px',
  position: 'relative',
  marginBottom: '60px',
});

const ProfileCard = styled(Card)({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  overflow: 'visible',
  position: 'relative',
  border: '1px solid rgba(0, 0, 0, 0.05)',
});

const AvatarContainer = styled(Box)({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '-60px',
  zIndex: 10,
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E67E22',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#E67E22',
  },
});

const ActionButton = styled(Button)({
  borderRadius: 8,
  padding: '8px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
});

const OrangeButton = styled(ActionButton)({
  backgroundColor: '#E67E22',
  color: 'white',
  '&:hover': {
    backgroundColor: '#D35400',
    boxShadow: '0 4px 12px rgba(230, 126, 34, 0.2)',
  },
});

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const VermieterProfil: React.FC = () => {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await vermieterService.getProfile();
      setProfileData(data);
      setError(null);
    } catch (error) {
      setError('Fehler beim Laden des Profils');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vermieterService.updateProfile(profileData);
      setSnackbarMessage('Profil erfolgreich aktualisiert');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      setIsEditing(false);
      setError(null);
    } catch (error: any) {
      setSnackbarMessage('Fehler beim Aktualisieren des Profils');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const getInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return `${profileData.firstName[0]}${profileData.lastName[0]}`;
    }
    return 'VP';
  };

  if (isLoading) {
    return (
      <MainLayout title="Mein Profil" navigationItems={vermieterNavigationItems}>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="500px">
          <CircularProgress sx={{ color: '#E67E22', mb: 3 }} />
          <Typography variant="body1" color="text.secondary">
            Profil wird geladen...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Mein Profil" navigationItems={vermieterNavigationItems}>
      <Box sx={{ p: { xs: 1, sm: 3 } }}>
        <ProfileCard>
          <ProfileHeader>
            <Typography variant="h4" fontWeight={700} align="center" sx={{ mb: 1 }}>
              Mein Profil
            </Typography>
            <Typography variant="body1" align="center" sx={{ opacity: 0.9 }}>
              Verwalten Sie Ihre persönlichen Informationen und Einstellungen
            </Typography>
            <AvatarContainer>
              <ProfileAvatar src={profileData.avatar}>
                {!profileData.avatar && getInitials()}
              </ProfileAvatar>
              <Tooltip title="Profilbild ändern">
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <UploadIcon sx={{ color: '#E67E22' }} />
                </IconButton>
              </Tooltip>
            </AvatarContainer>
          </ProfileHeader>

          <Box sx={{ px: { xs: 2, sm: 4 }, pb: 4, pt: 8 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isSmallScreen ? 'fullWidth' : 'standard'}
              centered
              sx={{
                mb: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: 120,
                },
                '& .Mui-selected': {
                  color: '#E67E22',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#E67E22',
                },
              }}
            >
              <Tab label="Persönliche Daten" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Sicherheit" icon={<SecurityIcon />} iconPosition="start" />
              <Tab label="Benachrichtigungen" icon={<NotificationsIcon />} iconPosition="start" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Persönliche Informationen
                      </Typography>
                      {!isEditing ? (
                        <Tooltip title="Profil bearbeiten">
                          <IconButton
                            onClick={() => setIsEditing(true)}
                            sx={{ 
                              color: '#E67E22',
                              '&:hover': { backgroundColor: 'rgba(230, 126, 34, 0.08)' }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Änderungen speichern">
                            <IconButton
                              type="submit"
                              sx={{ 
                                color: '#2ecc71',
                                '&:hover': { backgroundColor: 'rgba(46, 204, 113, 0.08)' }
                              }}
                            >
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Abbrechen">
                            <IconButton
                              onClick={() => {
                                setIsEditing(false);
                                fetchProfile();
                              }}
                              sx={{ 
                                color: '#e74c3c',
                                '&:hover': { backgroundColor: 'rgba(231, 76, 60, 0.08)' }
                              }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Vorname"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: isEditing ? '#E67E22' : 'inherit' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Nachname"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: isEditing ? '#E67E22' : 'inherit' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="E-Mail"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: isEditing ? '#E67E22' : 'inherit' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      fullWidth
                      label="Telefon"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: isEditing ? '#E67E22' : 'inherit' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      {!isEditing ? (
                        <OrangeButton
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={() => setIsEditing(true)}
                        >
                          Profil bearbeiten
                        </OrangeButton>
                      ) : (
                        <Stack direction="row" spacing={2}>
                          <ActionButton
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={() => {
                              setIsEditing(false);
                              fetchProfile();
                            }}
                            sx={{
                              borderColor: '#e74c3c',
                              color: '#e74c3c',
                              '&:hover': {
                                borderColor: '#c0392b',
                                backgroundColor: 'rgba(231, 76, 60, 0.04)',
                              },
                            }}
                          >
                            Abbrechen
                          </ActionButton>
                          <OrangeButton
                            variant="contained"
                            type="submit"
                            startIcon={<SaveIcon />}
                          >
                            Änderungen speichern
                          </OrangeButton>
                        </Stack>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Passwort & Sicherheit
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)', mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Passwort ändern
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktualisieren Sie Ihr Passwort regelmäßig für mehr Sicherheit
                      </Typography>
                    </Box>
                    <OrangeButton
                      variant="contained"
                      startIcon={<LockIcon />}
                      size="small"
                    >
                      Passwort ändern
                    </OrangeButton>
                  </Box>
                </Paper>
                
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Zwei-Faktor-Authentifizierung
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Erhöhen Sie die Sicherheit Ihres Kontos durch einen zusätzlichen Verifizierungsschritt
                      </Typography>
                    </Box>
                    <Chip 
                      label="Nicht aktiviert" 
                      color="default" 
                      size="small"
                      sx={{ 
                        borderRadius: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Benachrichtigungseinstellungen
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)', mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        E-Mail-Benachrichtigungen
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Erhalten Sie Benachrichtigungen über neue Meldungen und Nachrichten per E-Mail
                      </Typography>
                    </Box>
                    <Chip 
                      label="Aktiviert" 
                      color="success" 
                      size="small"
                      sx={{ 
                        borderRadius: 8,
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        color: '#2ecc71',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </Paper>
                
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Push-Benachrichtigungen
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Erhalten Sie Push-Benachrichtigungen in Echtzeit direkt in Ihrem Browser
                      </Typography>
                    </Box>
                    <Chip 
                      label="Nicht aktiviert" 
                      color="default" 
                      size="small"
                      sx={{ 
                        borderRadius: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            </TabPanel>
          </Box>
        </ProfileCard>
      </Box>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};
